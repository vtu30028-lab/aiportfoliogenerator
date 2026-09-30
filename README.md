# AI Portfolio Generator

A full-stack web application that allows users to upload their resume, extracts information using AI/NLP, and generates a professional, customizable portfolio.

## Architecture
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL
- **AI Service**: Python FastAPI, Gemini API

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- PostgreSQL

### 1. Database Setup
Ensure PostgreSQL is running and create a database named `ai_portfolio`.
Update `backend/.env` with your database credentials.

### 2. Backend
```bash
cd backend
npm install
npm run start
```

### 3. AI Service
```bash
cd ai-service
python -m venv venv
# Activate venv (Windows: venv\Scripts\activate, Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```
