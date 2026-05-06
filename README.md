# Breast Cancer Prediction Web App

A full-stack application for Mammography Analysis using EfficientNet, FastAPI, and React.

## Prerequisites

- Python 3.9+
- Node.js 18+
- Google Gemini API Key (optional, for chatbot)

## Setup & Run

### 1. Backend

Navigate to the `backend` directory and install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.
Docs at `http://localhost:8000/docs`.

**Note:** Ensure `mammography_efficientnet.keras` is located in `backend/model_assets/`.

### 2. Frontend

Navigate to the `frontend` directory:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```
 The app will be available at `http://localhost:5173`.

## Features

- **Predictor**: Upload single or batch images for analysis.
- **Results**: View prediction class (Normal, Benign, Malignant), confidence, and class probabilities.
- **Reporting**: Download PDF reports of the analysis.
- **Chatbot**: Ask questions to the AI Breast Health Assistant (powered by Gemini).

## Docker Support

You can run the entire application using Docker Compose.

```bash
docker compose up --build
```

This will start:
- Backend on `http://localhost:8000`
- Frontend on `http://localhost:3000`

