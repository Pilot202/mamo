from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from app.services.prediction_service import prediction_service
from app.services.gemini_service import gemini_service
from pydantic import BaseModel
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="Breast Cancer Prediction API", description="API for Mammography Analysis")

# CORS Configuration
origins = [
    "http://localhost:5173", # Vite default
    "http://localhost:3000",
    "https://mamo-frontend.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    api_key: str = None # Optional, normally passed from env or settings

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# ... (Previous imports)

# Mount static files (React build)
# We expect the build output to be in 'app/static' inside the container
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

@app.get("/")
async def serve_react_app():
    if static_dir.exists():
        return FileResponse(static_dir / "index.html")
    return {"message": "Breast Cancer Prediction API is running (Frontend not found)"}

# Catch-all for React Router (SPA)
@app.exception_handler(404)
async def custom_404_handler(request, exc):
    if static_dir.exists():
        return FileResponse(static_dir / "index.html")
    return {"detail": "Not Found"}

@app.post("/predict")
async def predict(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        try:
            contents = await file.read()
            prediction = prediction_service.predict(contents)
            results.append({
                "filename": file.filename,
                "prediction": prediction
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e)
            })
    return {"results": results}

@app.post("/chat")
async def chat(request: ChatRequest):
    # Quick fix to allow setting key from frontend for demo purposes if needed
    # Ideally env var loaded at startup
    if request.api_key:
        gemini_service.configure(request.api_key)
    
    response = gemini_service.chat(request.message)
    return {"response": response}

# if __name__ == "__main__":
#     import uvicorn
#     import sys
#     import os
    
#     # Add the backend directory to sys.path to allow "app" imports
#     # This file is in backend/app/main.py. We want backend/ to be in path.
#     backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
#     sys.path.append(backend_path)

#     uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
