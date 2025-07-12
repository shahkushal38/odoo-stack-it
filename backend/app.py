from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "temp"))
app = Flask(__name__)
CORS(app)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 500 * 1000 * 1000  # 500 MB
app.config["CORS_HEADER"] = "application/json"


@app.route("/health")
def health():
    return f"Yes healthy {os.getenv('SAMPLE')}!"


if __name__ == "__main__":
    app.run(debug=True)
