# MAMO Frontend-Backend Connection Troubleshooting Guide

## Quick Diagnostics

### 1. Backend Connection Test

Open browser DevTools (F12) and run in console:
```javascript
// Check if backend is accessible
fetch('https://mamo-backend-135198599265.us-central1.run.app')
  .then(r => console.log('Backend reachable:', r.status))
  .catch(e => console.error('Backend unreachable:', e.message))
```

### 2. Frontend Configuration Check

In DevTools console:
```javascript
// Check environment variables
console.log('API URL:', import.meta.env.VITE_API_URL)
```

Expected output: `https://mamo-backend-135198599265.us-central1.run.app` (production)

### 3. Check Network Requests

In DevTools Network tab:
1. Perform image upload
2. Look for `POST` request to `/predict`
3. Check Status Code (should be 200)
4. Check Response tab for results

---

## Common Issues & Solutions

### ❌ Issue: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Error Message:**
```
Access to XMLHttpRequest at 'https://mamo-backend...' from origin 'https://mamo-frontend.web.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Cause:** Backend CORS not configured for frontend domain

**Solution:**
1. **Check backend CORS** in `backend/app/main.py`:
```python
origins = [
    "https://mamo-frontend.web.app",  # Add Firebase URL
    "https://mamo-backend-135198599265.us-central1.run.app",
]
```

2. **Redeploy backend** after changes:
```bash
gcloud run deploy mamo-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

3. **Clear browser cache** (Ctrl+Shift+Delete)

---

### ❌ Issue: "Failed to fetch" or "Network error"

**Error Message:**
```
Failed to fetch: TypeError: Failed to fetch
```

**Causes:**
- Backend is down
- Backend URL is incorrect
- Network connectivity issue
- Backend has CORS preflight failure

**Solutions:**

1. **Verify backend is running:**
```bash
curl https://mamo-backend-135198599265.us-central1.run.app
```

Expected: HTML response or `{"message": "..."}`

2. **Check backend logs (Cloud Run):**
```bash
gcloud run logs read mamo-backend --region us-central1 --limit 50
```

3. **Verify API URL in .env:**
```bash
cat frontend/.env
# Should show: VITE_API_URL=https://mamo-backend-135198599265.us-central1.run.app
```

4. **Test with curl:**
```bash
curl -X POST https://mamo-backend-135198599265.us-central1.run.app/predict \
  -F "files=@path/to/image.jpg"
```

---

### ❌ Issue: "404 Not Found" on API endpoint

**Error Message:**
```
POST https://mamo-backend.../predict 404 (Not Found)
```

**Causes:**
- Backend not serving the endpoint
- Wrong API URL being used
- Backend crashed

**Solutions:**

1. **Verify endpoint exists** - Check backend code:
```bash
grep -n "def predict" backend/app/main.py
grep -n "@app.post" backend/app/main.py
```

2. **Check backend is responding:**
```bash
curl https://mamo-backend-135198599265.us-central1.run.app/
```

Should return: `{"message": "..."}`

3. **Test endpoint directly:**
```bash
# Create test image
python3 << 'EOF'
import requests
with open('test.jpg', 'rb') as f:
    files = {'files': f}
    r = requests.post('https://mamo-backend-135198599265.us-central1.run.app/predict', files=files)
    print(r.status_code, r.json())
EOF
```

---

### ❌ Issue: "500 Internal Server Error"

**Error Message:**
```
POST https://mamo-backend.../predict 500 (Internal Server Error)
```

**Causes:**
- Backend code error
- Missing dependencies
- Model files not found
- Gemini API key invalid

**Solutions:**

1. **Check backend logs:**
```bash
gcloud run logs read mamo-backend --region us-central1 --limit 100
```

2. **Verify model files are present:**
```bash
ls -lh backend/app/mammography_*.keras
```

3. **Check Gemini API key:**
```bash
echo $GOOGLE_API_KEY  # Should not be empty
```

4. **Test backend locally:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
# Visit http://localhost:8000/docs
```

---

### ❌ Issue: Image upload works but prediction is empty/wrong

**Error Message:**
```
Response: { results: [] }
```

**Causes:**
- Image format not supported
- Image too small/large
- Model prediction failed
- Response parsing error

**Solutions:**

1. **Check image format:**
```bash
file image.jpg  # Should be JPEG or PNG
identify image.jpg  # If ImageMagick installed
```

2. **Verify image size:**
- Minimum: 100x100 pixels
- Maximum: 10MB
- Recommended: 512x512 - 2048x2048

3. **Test model directly:**
```python
from app.services.prediction_service import prediction_service
with open('test.jpg', 'rb') as f:
    result = prediction_service.predict(f.read())
    print(result)
```

4. **Check response format** in browser DevTools:
```javascript
// In Network tab, check Response
// Should be: { results: [{filename: "...", prediction: {...}}] }
```

---

### ❌ Issue: Chatbot not responding

**Error Message:**
```
I'm having trouble connecting right now. Please check your connection or API key.
```

**Causes:**
- Backend `/chat` endpoint unreachable
- Gemini API key missing/invalid
- Message not being sent properly

**Solutions:**

1. **Verify Gemini API key:**
```bash
# Check if key is set in backend environment
echo $GOOGLE_API_KEY
```

If empty:
```bash
# Set for local testing
export GOOGLE_API_KEY="your-key-here"

# For Cloud Run deployment
gcloud run services update mamo-backend \
  --region us-central1 \
  --set-env-vars=GOOGLE_API_KEY="your-key-here"
```

2. **Test chat endpoint:**
```bash
curl -X POST https://mamo-backend-135198599265.us-central1.run.app/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

3. **Check API key input in UI:**
- Open chatbot settings
- Verify Gemini API key is entered correctly
- Try sending message again

---

### ❌ Issue: Firebase deployment fails

**Error Message:**
```
Error: Failed to deploy to Firebase
```

**Causes:**
- Not logged in to Firebase
- Project ID incorrect
- Build failed
- Quota exceeded

**Solutions:**

1. **Re-login to Firebase:**
```bash
firebase logout
firebase login
```

2. **Verify project ID:**
```bash
cat .firebaserc
# Check "default" project matches your Firebase project
```

3. **Check build output:**
```bash
cd frontend
npm run build
# Look for errors in output
```

4. **Check Firebase quota:**
- Visit Firebase Console
- Verify account is active
- Check for any quotas/limits

5. **Retry deployment:**
```bash
firebase deploy --only hosting --debug
```

---

### ❌ Issue: Frontend builds but shows blank page

**Error Message:**
```
Blank white page or 404
```

**Causes:**
- Build output incomplete
- SPA configuration issue
- JavaScript error

**Solutions:**

1. **Check browser console (F12):**
```javascript
// Look for red error messages
// Common: Module not found, Syntax error
```

2. **Verify build files exist:**
```bash
ls -lh frontend/dist/
# Should have: index.html, main-*.js, style-*.css
```

3. **Check firebase.json SPA rewrites:**
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

4. **Clear Firebase cache:**
```bash
firebase hosting:channel:delete default
firebase deploy --only hosting
```

---

## Local Development Testing

### Test Setup

**Terminal 1 - Backend:**
```bash
cd backend
export GOOGLE_API_KEY="your-key-here"
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:5173
```

### Test Flow

1. **Upload image:** http://localhost:5173
   - Click upload or drag image
   - Should see prediction result

2. **Test chatbot:**
   - Click chatbot icon (bottom-right)
   - Click Settings
   - Enter Gemini API key
   - Send message
   - Should receive response

3. **Monitor console:**
   - Frontend DevTools (F12)
   - Backend terminal output
   - Check for errors/warnings

---

## Browser DevTools Debugging

### Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Perform action (upload image)
4. Click on request to `/predict`
5. Check:
   - Status: 200 (success) or error code
   - Request Headers: Content-Type, CORS headers
   - Response: Actual data returned
   - Timing: How long request took

### Console Tab
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Test API calls:
```javascript
// Test fetch
fetch('https://mamo-backend-135198599265.us-central1.run.app')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e))
```

---

## Getting Help

1. **Check logs:**
   - Backend: `gcloud run logs read mamo-backend`
   - Frontend: Browser DevTools Console (F12)

2. **Enable debug mode:**
```bash
firebase deploy --only hosting --debug
npm run dev  # Vite verbose output
```

3. **Common documentation:**
   - [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/)
   - [Firebase Hosting](https://firebase.google.com/docs/hosting)
   - [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
   - [Axios Request Config](https://axios-http.com/docs/req_config)

---

**Last Updated:** May 15, 2026  
**For Issues:** Check the Network tab first, then console, then backend logs
