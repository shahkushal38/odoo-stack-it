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
from langchain_google_genai import ChatGoogleGenerativeAI
from bs4 import BeautifulSoup, Tag
import base64
import re
from typing import cast
import cloudinary
from cloudinary import CloudinaryImage
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

config = cloudinary.config(secure=True)

load_dotenv()

app = Flask(__name__)
CORS(app)


def oid(id):
    return ObjectId(id)


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

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0,
)

cloudinary.config(
    cloud_name="dewnfkulb",
    api_key="275387261959658",
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


def uploadImage(image_url, public_id):

    # Upload the image and get its URL
    # ==============================

    # Upload the image.
    # Set the asset's public ID and allow overwriting the asset with new versions
    upload_result = cloudinary.uploader.upload(
        image_url,
        public_id=public_id,
        unique_filename=False,
        overwrite=True,
    )
    print(upload_result["secure_url"])

    # Build the URL for the image and save it in the variable 'srcURL'
    return upload_result["secure_url"]


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
@token_required
def post_question(current_user):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        description_html = data.get("description", "")
        title = data.get("title")
        tags = data.get("tags", [])

        # Validate required fields
        if not title or not description_html:
            return jsonify({"error": "Title and description are required"}), 400

        soup = BeautifulSoup(description_html, "html.parser")
        img_tags = soup.find_all("img")
        image_urls = []

        for img in img_tags:
            img = cast(Tag, img)
            src = img.get("src")
            if src and str(src).startswith("data:image"):
                # Extract image type and base64 data
                match = re.match(r"data:image/(.*?);base64,(.*)", str(src))
                if match:
                    image_type = match.group(1)  # e.g., 'png', 'jpeg'
                    base64_data = match.group(2)

                    # Decode and save image
                    image_data = base64.b64decode(base64_data)
                    public_id = f"{uuid.uuid4()}.{image_type}"
                    srcURL = uploadImage(image_data, public_id)
                    image_urls.append(srcURL)

                # Remove all img tags from the description
        for img in soup.find_all("img"):
            img = cast(Tag, img)
            # Extract any text content (like alt text) before removing
            alt_text = img.get("alt", "")
            title_text = img.get("title", "")

            # If there's alt text or title, add it as text content
            if alt_text or title_text:
                text_content = alt_text if alt_text else title_text
                # Replace the img tag with its alt/title text
                new_text = soup.new_string(f" [Image: {text_content}] ")
                img.replace_with(new_text)
            else:
                # Just remove the img tag completely
                img.decompose()

        # Final cleaned-up HTML with img tags removed
        cleaned_description = str(soup)
        question = {
            "user_id": current_user["user_id"],  # Get user_id from JWT token
            "title": title,
            "description": cleaned_description,
            "tags": [t for t in tags],
            "created_at": data.get("createdAt"),
            "updated_at": None,
            "accepted_answer_id": None,
            "image_urls": srcURL,
        }

        result = questions_col.insert_one(question)
        question["_id"] = str(result.inserted_id)

        return (
            jsonify(
                {
                    "message": "Question created successfully",
                    "question_id": str(result.inserted_id),
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/questions", methods=["GET"])
def get_questions():
    # Get pagination parameters from query string
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)
    sort_by = request.args.get(
        "sort", "created_at", type=str
    )  # created_at, title, num_answers

    # Validate pagination parameters
    if page < 1:
        page = 1
    if limit < 1 or limit > 100:  # Max 100 questions per page
        limit = 10

    # Calculate skip value for pagination
    skip = (page - 1) * limit

    # Build sort criteria
    sort_criteria = {}
    if sort_by == "title":
        sort_criteria["title"] = 1
    elif sort_by == "num_answers":
        # We'll sort by num_answers after fetching
        sort_criteria["created_at"] = -1
    else:
        # Default sort by created_at (newest first)
        sort_criteria["created_at"] = -1

    # Get total count for pagination info
    total_questions = questions_col.count_documents({})

    # Fetch questions with pagination
    questions = list(
        questions_col.find().sort(list(sort_criteria.items())).skip(skip).limit(limit)
    )

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


@app.route("/questions/<qid>", methods=["GET"])
def get_question(qid):
    q = questions_col.find_one({"_id": ObjectId(qid)})
    if not q:
        return jsonify({"error": "Question not found"}), 404

    q['_id'] = str(q['_id'])
    q['user_id'] = str(q['user_id'])

    # Default: no user context
    user_id = None
    user_votes = {}

    # Try to get JWT from Authorization header or cookie for both GET and POST
    jwt_token = None
    # 1. Try cookie
    jwt_token = request.cookies.get("jwt_token")
    # 2. Try Authorization header
    if not jwt_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            jwt_token = auth_header.split(" ", 1)[1]

    if jwt_token:
        try:
            payload = jwt.decode(jwt_token, app.config["SECRET_KEY"], algorithms=["HS256"])
            user_id = payload.get("user_id")
        except Exception:
            user_id = None

    # Fetch answers from the separate collection
    answers = list(answers_col.find({"question_id": str(q['_id'])}))
    answer_ids = [str(a['_id']) for a in answers]

    # If user is authenticated, get their votes for these answers only (not for the question itself)
    user_upvoted = set()
    user_downvoted = set()
    if user_id:
        user_votes_cursor = votes_col.find({"answer_id": {"$in": answer_ids}, "user_id": user_id})
        for v in user_votes_cursor:
            if v["vote_type"] == "up":
                user_upvoted.add(v["answer_id"])
            elif v["vote_type"] == "down":
                user_downvoted.add(v["answer_id"])

    for a in answers:
        a["_id"] = str(a["_id"])
        a["user_id"] = str(a["user_id"])
        a["question_id"] = str(a["question_id"])

        # Aggregate upvotes and downvotes for this answer from the votes collection
        upvotes = votes_col.count_documents({"answer_id": a['_id'], "vote_type": "up"})
        downvotes = votes_col.count_documents({"answer_id": a['_id'], "vote_type": "down"})
        a['votes'] = {"up": upvotes, "down": downvotes}
        a['user_upvoted'] = False
        a['user_downvoted']= False

        # Mark if this user has upvoted/downvoted this answer
        if user_id:
            a['user_upvoted'] = a['_id'] in user_upvoted
            a['user_downvoted'] = a['_id'] in user_downvoted

    q["answers"] = answers
    return jsonify(q)


@app.route("/admin/questions/<qid>", methods=["GET"])
def get_admin_question(qid):
    try:
        q = questions_col.find_one({"_id": ObjectId(qid)})
        if not q:
            return jsonify({"error": "Question not found"}), 404

        q_title = q["title"]
        q_description = q["description"]

        q["_id"] = str(q["_id"])
        q["user_id"] = str(q["user_id"])

        all_answers_content = []
        answer_ids = []  # Store answer IDs for mapping
        # Fetch answers from the separate collection
        answers = list(answers_col.find({"question_id": str(q["_id"])}))
        for a in answers:
            a["_id"] = str(a["_id"])
            a["user_id"] = str(a["user_id"])
            a["question_id"] = str(a["question_id"])
            all_answers_content.append(a["content"])
            answer_ids.append(a["_id"])  # Store the answer ID

            # Aggregate upvotes and downvotes for this answer from the votes collection
            upvotes = votes_col.count_documents(
                {"answer_id": a["_id"], "vote_type": "up"}
            )
            downvotes = votes_col.count_documents(
                {"answer_id": a["_id"], "vote_type": "down"}
            )
            a["votes"] = {"up": upvotes, "down": downvotes}
        
        q["answers"] = answers

        # LLM Content Moderation
        moderation_results = []

        # Prepare content for moderation
        content_to_moderate = [
            {"type": "question_title", "content": q_title},
            {"type": "question_description", "content": q_description},
        ]

        # Add answers to moderation list
        for i, answer_content in enumerate(all_answers_content):
            content_to_moderate.append(
                {"type": f"answer_{i+1}", "content": answer_content}
            )

        # Create moderation prompt
        moderation_prompt = """
        You are a content moderator for a Q&A platform. Analyze the following content and determine if it's appropriate and relevant.

        For each piece of content, check for:
        1. Spam or irrelevant content
        2. Hate speech or discriminatory language
        3. Offensive or derogatory language
        4. Inappropriate or NSFW content
        5. Off-topic or out-of-scope content
        6. Personal attacks or harassment

        Content to moderate:
        """

        for item in content_to_moderate:
            moderation_prompt += f"\n{item['type']}: {item['content']}\n"

        moderation_prompt += """
        
        For each piece of content, respond with a JSON object containing:
        - "relevant": boolean (true if content is appropriate and relevant, false if it violates guidelines)
        - "reason": string (brief explanation of why the content is relevant or why it was flagged)

        Return an array of JSON objects, one for each piece of content in the same order.
        Example format:
        [
            {"relevant": true, "reason": "Content is appropriate and relevant to the topic"},
            {"relevant": false, "reason": "Contains inappropriate language"}
        ]
        """

        # Call LLM for moderation
        try:
            llm_response = llm.invoke(moderation_prompt)
            response_content = (
                llm_response.content
                if hasattr(llm_response, "content")
                else str(llm_response)
            )

            # Try to parse JSON response
            import json

            try:
                # Clean the response to extract JSON
                response_text = str(response_content).strip()
                if response_text.startswith("```json"):
                    response_text = response_text[7:]
                if response_text.endswith("```"):
                    response_text = response_text[:-3]

                moderation_results = json.loads(response_text.strip())

                print(moderation_results)
                print(content_to_moderate)

                # Ensure we have the right number of results
                if len(moderation_results) != len(content_to_moderate) - 1:
                    # If parsing failed or wrong number, create default results
                    moderation_results = []
                    for item in content_to_moderate:
                        moderation_results.append(
                            {
                                "relevant": True,
                                "reason": "Content moderation unavailable",
                            }
                        )

            except json.JSONDecodeError:
                # If JSON parsing fails, create default results
                moderation_results = []
                for item in content_to_moderate:
                    moderation_results.append(
                        {
                            "relevant": True,
                            "reason": "Content moderation parsing failed",
                        }
                    )

        except Exception as e:
            # If LLM call fails, create default results
            moderation_results = []
            for item in content_to_moderate:
                moderation_results.append(
                    {"relevant": True, "reason": f"Content moderation error: {str(e)}"}
                )

        # Map moderation results to answer IDs
        answer_moderation = []
        if len(moderation_results) > 1:
            for i, result in enumerate(moderation_results[1:]):  # Skip question, start from answers
                if i < len(answer_ids):
                    answer_moderation.append({
                        "answer_id": answer_ids[i],
                        "relevant": result.get("relevant", True),
                        "reason": result.get("reason", "Not moderated")
                    })
                else:
                    # Fallback if we have more results than answers
                    answer_moderation.append({
                        "answer_id": f"unknown_{i}",
                        "relevant": result.get("relevant", True),
                        "reason": result.get("reason", "Not moderated")
                    })

        # Add moderation results to response
        q["moderation"] = {
            "question": (
                moderation_results[0]
                if len(moderation_results) > 0
                else {"relevant": True, "reason": "Not moderated"}
            ),
            "answers": answer_moderation,
        }

        return jsonify(q)

    except Exception as e:
        return jsonify({"error": f"Error processing admin question: {str(e)}"}), 500


# ----------------------- ANSWERS -----------------------


@app.route("/questions/<question_id>/answers", methods=["POST"])
def add_answer(question_id):
    data = request.get_json()
    answer = {
        "question_id": question_id,
        "user_id": data["user_id"],
        "content": data["content"],
        "created_at": datetime.utcnow(),
        "votes": {"up": 0, "down": 0},
        "voters": [],
    }
    answers_col.insert_one(answer)
    # Optionally update the question's updated_at field
    questions_col.update_one(
        {"_id": ObjectId(question_id)}, {"$set": {"updated_at": datetime.utcnow()}}
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
    answers_col.update_one({"_id": ObjectId(aid)}, {"$inc": {update_field: 1}})

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


@app.route("/generate-title", methods=["POST"])
def generate_title():
    data = request.get_json()
    description = data.get("description")

    if not description:
        return jsonify({"error": "Description is required"}), 400

    try:
        prompt = f"Generate a concise, clear, and relevant question title for this description:\n\n{description}"
        response = llm.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)
        return jsonify({"suggested_title": content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
