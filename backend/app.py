# Remove unused import
from datetime import datetime
import uuid
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from bson import ObjectId

from functools import wraps
import jwt

load_dotenv()
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "temp"))
app = Flask(__name__)
CORS(app)


def oid(id):
    return ObjectId(id)


app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 500 * 1000 * 1000  # 500 MB
app.config["CORS_HEADER"] = "application/json"
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

# Get database URI from environment or use default
db_uri = os.getenv("DB_URI")
if not db_uri:
    print("Warning: DB_URI environment variable not set. Using default MongoDB URI.")
    db_uri = "mongodb://localhost:27017/"

client = MongoClient(db_uri)
db = client.get_database("StackIt")

tags_col = db["tags"]
questions_col = db["questions"]
answers_col = db["answers"]
votes_col = db["votes"]
comments_col = db["comments"]
notifications_col = db["notifications"]


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Try to get token from cookie first, then from Authorization header
        token = request.cookies.get("jwt_token")

        if not token:
            # Try to get from Authorization header
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        try:
            data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            # MongoDB query to find user by public_id
            collection = db.get_collection("users")
            current_user = collection.find_one({"user_id": data["user_id"]})

            if not current_user:
                return jsonify({"message": "User not found!"}), 401

        except Exception as e:
            return jsonify({"message": "Token is invalid!"}), 401

        return f(current_user, *args, **kwargs)

    return decorated


@app.route("/health")
def health():
    return f"Yes healthy {os.getenv('SAMPLE')}!"


@app.route("/register", methods=["POST"])
def registerUser():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        username = data.get("username")
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")

        # Validate required fields
        if not all([username, name, email, password]):
            return jsonify({"error": "Missing required fields"}), 400

        # Check if user already exists
        collection = db.get_collection("users")
        existing_user = collection.find_one(
            {"$or": [{"username": username}, {"email": email}]}
        )
        if existing_user:
            return jsonify({"error": "Username or email already exists"}), 409

        date = datetime.now()
        user_doc = {
            "user_id": str(uuid.uuid4()),
            "username": username,
            "name": name,
            "email": email,
            "password_hash": password,
            "role": role or "user",
            "creation_date": date,
        }
        collection.insert_one(user_doc)
        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/questions", methods=["POST"])
def post_question():
    data = request.get_json()
    question = {
        "user_id": data['user_id'],  # UUID string, do not wrap with ObjectId
        "title": data['title'],
        "description": data['description'],
        "tags": data.get('tags', []),  # list of tag names like ["mongodb", "flask"]
        "answers": [],  # initially empty
        "created_at": datetime.utcnow(),
        "updated_at": None,
        "accepted_answer_id": None,
    }
    result = questions_col.insert_one(question)
    return jsonify({"message": "Question created", "question_id": str(result.inserted_id)}), 201

@app.route('/questions', methods=['GET'])
def get_questions():
    questions = list(questions_col.find())
    result = []
    for q in questions:
        # Count answers in the separate answers collection
        num_answers = answers_col.count_documents({"question_id": str(q["_id"])})
        result.append({
            "_id": str(q["_id"]),
            "title": q.get("title", ""),
            "description": q.get("description", ""),
            "tags": q.get("tags", []),
            "num_answers": num_answers
        })
    return jsonify(result)


@app.route('/questions/<qid>', methods=['GET'])
def get_question(qid):
    q = questions_col.find_one({"_id": ObjectId(qid)})
    if not q:
        return jsonify({"error": "Question not found"}), 404

    q['_id'] = str(q['_id'])
    q['user_id'] = str(q['user_id'])

    # Fetch answers from the separate collection
    answers = list(answers_col.find({"question_id": str(q['_id'])}))
    for a in answers:
        a['_id'] = str(a['_id'])
        a['user_id'] = str(a['user_id'])
        a['question_id'] = str(a['question_id'])

        # Aggregate upvotes and downvotes for this answer from the votes collection
        upvotes = votes_col.count_documents({"answer_id": a['_id'], "vote_type": "up"})
        downvotes = votes_col.count_documents({"answer_id": a['_id'], "vote_type": "down"})
        a['votes'] = {"up": upvotes, "down": downvotes}

    q['answers'] = answers
    return jsonify(q)



# ----------------------- ANSWERS -----------------------

@app.route('/questions/<question_id>/answers', methods=['POST'])
def add_answer(question_id):
    data = request.json
    answer = {
        "question_id": question_id,
        "user_id": data['user_id'],
        "content": data['content'],
        "created_at": datetime.utcnow(),
        "votes": {
            "up": 0,
            "down": 0
        },
        "voters": []
    }
    answers_col.insert_one(answer)
    # Optionally update the question's updated_at field
    questions_col.update_one(
        {"_id": ObjectId(question_id)},
        {"$set": {"updated_at": datetime.utcnow()}}
    )
    return jsonify({"message": "Answer added"}), 201

# ----------------------- VOTES -----------------------


@app.route("/answers/<aid>/vote", methods=["POST"])
def vote_answer(aid):
    data = request.get_json()
    user_id = data["user_id"]
    vote_type = data["vote_type"]  # 'up' or 'down'

    # Check if user already voted for this answer
    existing_vote = votes_col.find_one({"answer_id": aid, "user_id": user_id})
    if existing_vote:
        return jsonify({"error": "Already voted"}), 400

    # Record the vote
    vote = {"answer_id": aid, "user_id": user_id, "vote_type": vote_type}
    votes_col.insert_one(vote)

    # Update the answer's vote count
    update_field = "votes.up" if vote_type == "up" else "votes.down"
    answers_col.update_one(
        {"_id": ObjectId(aid)},
        {"$inc": {update_field: 1}}
    )

    return jsonify({"message": "Vote recorded"}), 201


# ----------------------- NOTIFICATIONS -----------------------


@app.route("/notifications/<user_id>", methods=["GET"])
def get_notifications(user_id):
    notes = list(notifications_col.find({"user_id": user_id}))
    for n in notes:
        n["_id"] = str(n["_id"])
    return jsonify(notes)


@app.route("/notifications", methods=["POST"])
def send_notification():
    data = request.get_json()
    notification = {
        "user_id": data["user_id"],
        "message": data["message"],
        "is_read": False,
        "created_at": datetime.utcnow(),
    }
    notifications_col.insert_one(notification)
    return jsonify({"message": "Notification sent"}), 201


# ----------------------- COMMENTS -----------------------


@app.route("/comments", methods=["POST"])
def post_comment():
    data = request.get_json()
    comment = {
        "answer_id": data["answer_id"],
        "user_id": data["user_id"],
        "content": data["content"],
        "created_at": datetime.utcnow(),
    }
    comments_col.insert_one(comment)
    return jsonify({"message": "Comment added"}), 201


@app.route("/answers/<aid>/comments", methods=["GET"])
def get_comments(aid):
    comms = list(comments_col.find({"answer_id": aid}))
    for c in comms:
        c["_id"] = str(c["_id"])
        c["user_id"] = str(c["user_id"])
        c["answer_id"] = str(c["answer_id"])
    return jsonify(comms)


@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        username = data.get("username")
        password = data.get("password")

        # Validate required fields
        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        # Find user in database
        collection = db.get_collection("users")
        user = collection.find_one({"username": username})

        if not user:
            return jsonify({"error": "Invalid username or password"}), 401

        # Check password (in production, use proper password hashing)
        if user["password_hash"] != password:
            return jsonify({"error": "Invalid username or password"}), 401

        # Create JWT token
        token_data = {
            "user_id": user["user_id"],
            "username": user["username"],
            "role": user["role"],
        }

        token = jwt.encode(token_data, app.config["SECRET_KEY"], algorithm="HS256")

        # Prepare response data (exclude sensitive information)
        user_data = {
            "user_id": user["user_id"],
            "username": user["username"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        }

        response = jsonify(
            {"message": "Login successful", "user": user_data, "token": token}
        )

        # Set JWT token as HTTP-only cookie for security
        response.set_cookie(
            "jwt_token",
            token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="Lax",
            max_age=3600,  # 1 hour
        )

        return response, 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"message": "Logged out successfully"})
    response.delete_cookie("jwt_token")
    return response, 200


@app.route("/profile", methods=["GET"])
@token_required
def get_profile(current_user):
    """Get current user profile"""
    user_data = {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"],
    }
    return jsonify({"user": user_data}), 200


if __name__ == "__main__":
    app.run(debug=True)
