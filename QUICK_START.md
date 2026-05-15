# MAMO Quick Deployment Guide

## Summary of Configuration

✅ **Frontend-Backend Connection:** Configured
- Frontend uses centralized API client (`frontend/src/services/apiClient.js`)
- All components use the API client for backend communication
- Environment variables configured for both dev and production

✅ **Environment Variables Configured:**
- `frontend/.env` → Production backend URL
- `frontend/.env.local` → Local development URL (localhost:8000)

✅ **Backend CORS Updated:**
- Configured to accept requests from local dev and Firebase domains
- Edit `backend/app/main.py` to add your Firebase domain after deployment

✅ **Firebase Configuration Ready:**
- `.firebaserc` configured with project ID placeholder
- `firebase.json` set up with SPA rewrites and caching
- Ready for deployment to Firebase Hosting

---

## Deploy to Firebase - 3 Steps

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Build Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### Step 3: Deploy
```bash
firebase deploy --only hosting
```

**That's it!** Your app will be live at the Firebase Hosting URL shown in the terminal.

---

## Local Development - 2 Terminals

**Terminal 1: Backend**
```bash
cd backend
export GOOGLE_API_KEY="your-gemini-api-key"  # Windows: set instead of export
python -m uvicorn app.main:app --reload
```

**Terminal 2: Frontend**
```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:5173

---

## Files Modified/Created

### Backend
- ✅ `backend/app/main.py` - Updated CORS configuration

### Frontend
- ✅ `frontend/.env` - Production API URL
- ✅ `frontend/.env.local` - Development API URL
- ✅ `frontend/src/services/apiClient.js` - Centralized API client
- ✅ `frontend/src/components/ImageUpload.jsx` - Updated to use API client
- ✅ `frontend/src/components/Chatbot.jsx` - Updated to use API client
- ✅ `frontend/firebase.json` - Firebase Hosting configuration

### Root Directory
- ✅ `.firebaserc` - Firebase project configuration
- ✅ `deploy.bat` - Windows deployment script
- ✅ `deploy.sh` - Linux/Mac deployment script
- ✅ `DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
- ✅ `DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- ✅ `TROUBLESHOOTING.md` - Troubleshooting guide

---

## Important URLs

- **Backend API:** https://mamo-backend-135198599265.us-central1.run.app
- **Frontend (Production):** https://your-firebase-project.web.app
- **Frontend (Dev):** http://localhost:5173
- **Backend Swagger Docs:** https://mamo-backend-135198599265.us-central1.run.app/docs

---

## Before Firebase Deployment

1. **Update `.firebaserc`:**
```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

2. **Verify Backend URL:**
```bash
curl https://mamo-backend-135198599265.us-central1.run.app
```

3. **Test Locally:**
```bash
# Terminal 1: Backend running
# Terminal 2: Frontend running
# Visit http://localhost:5173
# Test upload and chat
```

---

## After Firebase Deployment

1. **Get Firebase URL:**
```bash
firebase deploy --only hosting
# Look for: "Hosting URL: https://your-project.web.app"
```

2. **Update Backend CORS:**
Edit `backend/app/main.py` and add:
```python
"https://your-firebase-project.web.app",
"https://your-firebase-project.firebaseapp.com",
```

3. **Redeploy Backend:**
```bash
gcloud run deploy mamo-backend --source . --region us-central1
```

4. **Test Production:**
- Visit Firebase URL
- Test image upload
- Test chatbot

---

## API Endpoints

### Image Prediction
```
POST /predict
Content-Type: multipart/form-data

Files: image1.jpg, image2.jpg, ...

Response:
{
  "results": [
    {
      "filename": "image1.jpg",
      "prediction": {
        "class": "benign|malignant",
        "confidence": 0.95
      }
    }
  ]
}
```

### Chat
```
POST /chat
Content-Type: application/json

{
  "message": "What is breast cancer?",
  "api_key": "optional-gemini-key"
}

Response:
{
  "response": "Breast cancer is..."
}
```

---

## Environment Variables

### Frontend
- `VITE_API_URL` - Backend URL (set in `.env`)

### Backend
- `GOOGLE_API_KEY` - Gemini API key (set in Cloud Run env vars)

---

## Common Workflows

### Build Frontend Only
```bash
cd frontend
npm run build
# Creates dist/ folder
```

### Test Backend API
```bash
curl -X POST https://mamo-backend-135198599265.us-central1.run.app/predict \
  -F "files=@image.jpg"
```

### Check Firebase Deployment
```bash
firebase hosting:sites:list
firebase hosting:channels:list
```

### View Logs
```bash
# Backend logs
gcloud run logs read mamo-backend --region us-central1

# Firebase deployment logs
firebase deploy --only hosting --debug
```

---

## Troubleshooting Quick Links

- **CORS Error?** → See `TROUBLESHOOTING.md` - "CORS policy" section
- **API Not Found?** → See `TROUBLESHOOTING.md` - "404 Not Found" section
- **Backend Down?** → Check Cloud Run console
- **Build Fails?** → Run `npm ci` instead of `npm install`
- **Cache Issues?** → Clear browser cache (Ctrl+Shift+Delete)

---

## Next Steps

1. ✅ Update Firebase project ID in `.firebaserc`
2. ✅ Build frontend: `cd frontend && npm install && npm run build`
3. ✅ Deploy: `firebase deploy --only hosting`
4. ✅ Test at Firebase Hosting URL
5. ✅ Update backend CORS with Firebase domain
6. ✅ Redeploy backend

**Expected Timeline:**
- Build: 2-3 minutes
- Deploy: 1-2 minutes
- **Total: ~5 minutes**

---

## Support

For issues:
1. Check `TROUBLESHOOTING.md`
2. Check browser console (F12)
3. Check backend logs
4. Check Firebase console

**Made with ❤️ for MAMO**
