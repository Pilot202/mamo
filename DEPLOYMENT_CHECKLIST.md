# Firebase Deployment Checklist

## Prerequisites
- [ ] Node.js and npm installed
- [ ] Firebase project created at [firebase.google.com](https://firebase.google.com)
- [ ] Firebase project ID noted
- [ ] Backend URL verified: `https://mamo-backend-135198599265.us-central1.run.app`

## Pre-Deployment Setup

### 1. Update Firebase Configuration
```bash
# Edit .firebaserc with your Firebase project ID
```
- [ ] `.firebaserc` updated with correct project ID

### 2. Update Frontend Configuration
- [ ] `frontend/.env` has correct `VITE_API_URL`
- [ ] `frontend/.env.local` configured for local development
- [ ] Backend CORS updated in `backend/app/main.py` with Firebase domain

### 3. Verify Backend Connection
```bash
# Test backend is reachable
curl https://mamo-backend-135198599265.us-central1.run.app
```
- [ ] Backend is running and accessible
- [ ] CORS is properly configured

## Deployment Steps

### 4. Build Frontend
```bash
cd frontend
npm install
npm run build
```
- [ ] No build errors
- [ ] `dist/` folder created successfully
- [ ] `dist/index.html` exists

### 5. Firebase Login
```bash
firebase login
```
- [ ] Successfully logged into Firebase account
- [ ] Firebase CLI authenticated

### 6. Deploy to Firebase
```bash
firebase deploy --only hosting
```
- [ ] Deployment successful
- [ ] Firebase Hosting URL provided

### 7. Post-Deployment Verification

**Test Image Upload:**
- [ ] Navigate to Firebase Hosting URL
- [ ] Upload a test image
- [ ] Prediction results appear without CORS errors

**Test Chatbot:**
- [ ] Open chatbot
- [ ] Send a test message
- [ ] Response received from Gemini AI

**Monitor Logs:**
- [ ] Check browser console (F12) for errors
- [ ] Check Firebase console for deployment status
- [ ] Check backend logs for API requests

## Common Issues & Solutions

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Update backend CORS in `backend/app/main.py` with Firebase domain

### API 404 Error
```
POST https://mamo-backend.../predict 404
```
**Solution:** Verify `VITE_API_URL` in `.env` matches actual backend URL

### Backend Unreachable
```
Failed to connect to backend
```
**Solution:** 
1. Verify backend is deployed
2. Test backend URL directly: `curl https://mamo-backend-135198599265.us-central1.run.app`
3. Check backend logs in Cloud Run

### Build Fails
```
npm ERR! Failed to build frontend
```
**Solution:** 
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Check for syntax errors
3. Verify all dependencies installed

## Firebase Project Info

After deployment, note these details:

**Firebase Hosting URL:** `https://your-project.web.app`
**Backup URL:** `https://your-project.firebaseapp.com`
**Backend URL:** `https://mamo-backend-135198599265.us-central1.run.app`

## Continuous Deployment

For automatic deployments on git push:
1. Connect repository to Firebase Console
2. Configure build settings
3. Set up automatic deploys on main branch

## Monitoring & Maintenance

- Check Firebase Console for analytics
- Monitor backend logs in Cloud Run
- Review browser console for client-side errors
- Test functionality weekly

## Rollback Procedure

If deployment fails:
1. Check Firebase Console for previous versions
2. Redeploy from previous build
3. Investigate error logs

---

**Last Updated:** May 15, 2026
**Status:** Ready for Deployment ✓
