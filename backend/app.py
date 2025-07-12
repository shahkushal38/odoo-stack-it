# Remove unused import
from datetime import datetime
import uuid
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from functools import wraps
import jwt

load_dotenv()
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "temp"))
app = Flask(__name__)
CORS(app)

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
