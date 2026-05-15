# MAMO Frontend-Backend Connection & Firebase Deployment Guide

## Project Structure

```
mamo/
├── frontend/              # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.jsx    # Backend: POST /predict
│   │   │   ├── Chatbot.jsx        # Backend: POST /chat
│   │   │   ├── Results.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env               # Production API URL
│   ├── .env.local         # Local development API URL
│   ├── vite.config.js
│   ├── firebase.json      # Firebase Hosting config
│   └── package.json
├── backend/               # FastAPI Server (Cloud Run)
│   ├── app/
│   │   ├── main.py       # CORS enabled
│   │   ├── requirements.txt
│   │   └── services/
│   │       ├── prediction_service.py
│   │       └── gemini_service.py
│   └── Dockerfile
├── .firebaserc            # Firebase project config
├── deploy.bat             # Windows deployment script
├── deploy.sh              # Linux/Mac deployment script
└── README.md
```

## Frontend Configuration

### Environment Variables

The frontend uses Vite's environment variables. Two files are configured:

**`.env` (Production)**
```
VITE_API_URL=https://mamo-backend-135198599265.us-central1.run.app
```

**`.env.local` (Development)**
```
VITE_API_URL=http://localhost:8000
```

### API Endpoints Used

1. **Image Prediction**: `POST /predict`
   - Used by: `ImageUpload.jsx`
   - Data: FormData with image files
   - Response: `{ results: [...] }`

2. **Chatbot**: `POST /chat`
   - Used by: `Chatbot.jsx`
   - Data: `{ message: string, api_key?: string }`
   - Response: `{ response: string }`

## Backend Configuration

### CORS Setup

The backend is configured to accept requests from:
- Development: `http://localhost:5173`, `http://localhost:3000`
- Production: Your Firebase Hosting URLs
- Other: Render deployment, etc.

**Update backend CORS** if your Firebase URL changes by editing `backend/app/main.py`:

```python
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://your-firebase-project.web.app",  # Add your Firebase URL
    "https://mamo-backend-135198599265.us-central1.run.app",  # Backend URL
]
```

## Deployment Steps

### Option 1: Automated Deployment (Windows)

```bash
cd c:\Users\USER\Desktop\mamo
deploy.bat
```

### Option 2: Automated Deployment (Linux/Mac)

```bash
cd ~/Desktop/mamo
chmod +x deploy.sh
./deploy.sh
```

### Option 3: Manual Deployment

#### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

#### Step 2: Build Frontend
```bash
cd frontend
npm install
npm run build
```

#### Step 3: Deploy to Firebase
```bash
cd ..
firebase deploy --only hosting
```

## Testing the Connection

### 1. Local Development Testing

```bash
# Terminal 1: Backend
cd backend
# Make sure backend is running on http://localhost:8000

# Terminal 2: Frontend
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### 2. Production Testing

After deployment:
1. Navigate to your Firebase Hosting URL
2. Test image upload
3. Test chatbot functionality
4. Check browser console for any CORS errors

### 3. Troubleshooting

**CORS Error:**
- Check `VITE_API_URL` in frontend `.env` matches backend URL
- Verify backend CORS includes your Firebase domain
- Check that backend is running and accessible

**API Connection Fails:**
- Verify backend URL is correct in `.env`
- Check backend is deployed and running
- Test backend directly: `curl https://mamo-backend-135198599265.us-central1.run.app`

**Image Upload Fails:**
- Check network tab in browser DevTools
- Verify FormData is being sent correctly
- Check backend `/predict` endpoint

## Firebase Project Setup

### Prerequisites

1. **Firebase Project**: Create at [firebase.google.com](https://firebase.google.com)
2. **Firebase ID**: Your project ID (used in `.firebaserc`)

### Files

- **`.firebaserc`**: Contains Firebase project configuration
- **`firebase.json`**: Configures Firebase Hosting (SPA rewrites, caching, headers)

### Update Project ID

Edit `.firebaserc`:
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

## Environment Variables Summary

### Frontend

| Variable | Location | Value | Purpose |
|----------|----------|-------|---------|
| `VITE_API_URL` | `.env` (prod) | `https://mamo-backend-...` | Production backend URL |
| `VITE_API_URL` | `.env.local` (dev) | `http://localhost:8000` | Local backend URL |

### Backend

| Variable | Location | Purpose |
|----------|----------|---------|
| `CORS origins` | `backend/app/main.py` | Allowed frontend domains |
| `GEMINI_API_KEY` | Backend env | For Gemini chatbot service |

## Database & Storage Notes

- This app currently uses stateless predictions
- Consider adding Firebase Firestore for storing prediction history
- Use Firebase Storage for storing uploaded images if needed

## Next Steps

1. ✅ Install Firebase CLI
2. ✅ Set up `.firebaserc` with your project ID
3. ✅ Update backend CORS with Firebase domain
4. ✅ Build frontend: `npm run build`
5. ✅ Deploy: `firebase deploy --only hosting`
6. ✅ Test at Firebase Hosting URL

## Support & Documentation

- **Vite**: https://vitejs.dev/
- **Firebase Hosting**: https://firebase.google.com/docs/hosting
- **FastAPI**: https://fastapi.tiangolo.com/
- **Axios**: https://axios-http.com/
- **CORS**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
