# Flask Backend

A Flask-based REST API backend with MongoDB integration.

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   Create a `.env` file in the backend directory with:
   ```
   DB_URI=mongodb://localhost:27017/
   SAMPLE=Hello from Flask!
   ```

3. **Install MongoDB:**
   - Make sure MongoDB is running locally on port 27017
   - Or use MongoDB Atlas and update the DB_URI accordingly

4. **Run the application:**
   ```bash
   python app.py
   ```

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /register` - Register a new user

### Register User Example:
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

## Project Structure

- `app.py` - Main Flask application
- `requirements.txt` - Python dependencies
- `.env` - Environment variables (create this file) 