# Remove unused import
from datetime import datetime
import uuid
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from bson import ObjectId


load_dotenv()
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "temp"))
app = Flask(__name__)
CORS(app)
def oid(id): return ObjectId(id) 

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 500 * 1000 * 1000  # 500 MB
app.config["CORS_HEADER"] = "application/json"

# Get database URI from environment or use default
db_uri = os.getenv("DB_URI")
if not db_uri:
    print("Warning: DB_URI environment variable not set. Using default MongoDB URI.")
    db_uri = "mongodb://localhost:27017/"

client = MongoClient(db_uri)
db = client.get_database("StackIt")

tags_col = db['tags']
questions_col = db['questions']
answers_col = db['answers']
votes_col = db['votes']
comments_col = db['comments']
notifications_col = db['notifications']

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

        date = datetime.now()
        collection = db.get_collection("users")
        user_doc = {
            "user_id": str(uuid.uuid4()),
            "username": username,
            "name": name,
            "email": email,
            "password_hash": password,
            "role": role or "user",
            "date": date,
        }
        collection.insert_one(user_doc)
        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/questions', methods=['POST'])
def post_question():
    data = request.json
    question = {
        "user_id": oid(data['user_id']),
        "title": data['title'],
        "description": data['description'],
        "tags": [oid(t) for t in data.get('tags', [])],
        "created_at": datetime.utcnow(),
        "updated_at": None,
        "accepted_answer_id": None
    }
    questions_col.insert_one(question)
    return jsonify({"message": "Question created"}), 201

@app.route('/questions', methods=['GET'])
def get_questions():
    questions = list(questions_col.find())
    for q in questions:
        q['_id'] = str(q['_id'])
        q['user_id'] = str(q['user_id'])
        q['tags'] = [str(t) for t in q.get('tags', [])]
    return jsonify(questions)

@app.route('/questions/<qid>', methods=['GET'])
def get_question(qid):
    q = questions_col.find_one({"_id": oid(qid)})
    if not q: return jsonify({"error": "Not found"}), 404
    q['_id'] = str(q['_id'])
    q['user_id'] = str(q['user_id'])
    q['tags'] = [str(t) for t in q.get('tags', [])]
    return jsonify(q)

# ----------------------- ANSWERS -----------------------

@app.route('/answers', methods=['POST'])
def post_answer():
    data = request.json
    answer = {
        "question_id": oid(data['question_id']),
        "user_id": oid(data['user_id']),
        "content": data['content'],
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    answers_col.insert_one(answer)
    return jsonify({"message": "Answer added"}), 201

@app.route('/questions/<qid>/answers', methods=['GET'])
def get_answers(qid):
    ans = list(answers_col.find({"question_id": oid(qid)}))
    for a in ans:
        a['_id'] = str(a['_id'])
        a['question_id'] = str(a['question_id'])
        a['user_id'] = str(a['user_id'])
    return jsonify(ans)

# ----------------------- TAGS -----------------------

@app.route('/tags', methods=['POST'])
def create_tag():
    data = request.json
    tag = {"name": data['name']}
    tags_col.insert_one(tag)
    return jsonify({"message": "Tag created"})

@app.route('/tags', methods=['GET'])
def get_tags():
    tags = list(tags_col.find())
    for t in tags: t['_id'] = str(t['_id'])
    return jsonify(tags)

# ----------------------- VOTES -----------------------

@app.route('/answers/<aid>/vote', methods=['POST'])
def vote_answer(aid):
    data = request.json
    user_id = oid(data['user_id'])
    vote_type = data['vote_type']  # 'up' or 'down'

    existing_vote = votes_col.find_one({
        "answer_id": oid(aid),
        "user_id": user_id
    })

    if existing_vote:
        return jsonify({"error": "Already voted"}), 400

    vote = {
        "answer_id": oid(aid),
        "user_id": user_id,
        "vote_type": vote_type
    }
    votes_col.insert_one(vote)
    return jsonify({"message": "Vote recorded"}), 201

# ----------------------- NOTIFICATIONS -----------------------

@app.route('/notifications/<user_id>', methods=['GET'])
def get_notifications(user_id):
    notes = list(notifications_col.find({"user_id": oid(user_id)}))
    for n in notes: n['_id'] = str(n['_id'])
    return jsonify(notes)

@app.route('/notifications', methods=['POST'])
def send_notification():
    data = request.json
    notification = {
        "user_id": oid(data['user_id']),
        "message": data['message'],
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    notifications_col.insert_one(notification)
    return jsonify({"message": "Notification sent"}), 201

# ----------------------- COMMENTS -----------------------

@app.route('/comments', methods=['POST'])
def post_comment():
    data = request.json
    comment = {
        "answer_id": oid(data['answer_id']),
        "user_id": oid(data['user_id']),
        "content": data['content'],
        "created_at": datetime.utcnow()
    }
    comments_col.insert_one(comment)
    return jsonify({"message": "Comment added"}), 201

@app.route('/answers/<aid>/comments', methods=['GET'])
def get_comments(aid):
    comms = list(comments_col.find({"answer_id": oid(aid)}))
    for c in comms:
        c['_id'] = str(c['_id'])
        c['user_id'] = str(c['user_id'])
        c['answer_id'] = str(c['answer_id'])
    return jsonify(comms)

if __name__ == "__main__":
    app.run(debug=True)
