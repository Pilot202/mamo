#!/bin/bash
# MAMO Frontend-Backend Connection Diagnostic

echo "=========================================="
echo "MAMO Diagnostic Report"
echo "=========================================="
echo ""

# 1. Check Frontend Configuration
echo "[1] Frontend Configuration"
echo "--------------------------------------------"
echo "Firebase Project ID:"
cat .firebaserc | grep "default"
echo ""
echo ".env content:"
cat frontend/.env
echo ""
echo "API Client Configuration:"
grep "const API_URL" frontend/src/services/apiClient.js
echo ""

# 2. Check Backend CORS
echo "[2] Backend CORS Configuration"
echo "--------------------------------------------"
grep -A 15 "origins = " backend/app/main.py | head -10
echo ""

# 3. Firebase URLs
echo "[3] Expected Firebase URLs"
echo "--------------------------------------------"
echo "Primary: https://mamo-frontend.web.app"
echo "Backup: https://mamo-frontend.firebaseapp.com"
echo "Backend: https://mamo-backend-135198599265.us-central1.run.app"
echo ""

# 4. Check dist folder
echo "[4] Frontend Build Status"
echo "--------------------------------------------"
if [ -d "frontend/dist" ]; then
  echo "✓ dist/ folder exists"
  echo "  Contents:"
  ls -lh frontend/dist/ | head -10
  if [ -f "frontend/dist/index.html" ]; then
    echo "✓ index.html found"
  else
    echo "✗ index.html NOT found"
  fi
else
  echo "✗ dist/ folder NOT found"
  echo "  Need to run: cd frontend && npm run build"
fi
echo ""

# 5. Check API endpoints
echo "[5] Backend Endpoints Check"
echo "--------------------------------------------"
echo "Checking backend endpoints..."
echo "GET  /          (health check)"
echo "POST /predict   (image upload)"
echo "POST /chat      (chatbot)"
echo "GET  /docs      (API documentation)"
echo ""

# 6. Summary
echo "[6] Recommended Actions"
echo "--------------------------------------------"
echo "✓ Fix #1: Rebuild frontend with SPA rewrites"
echo "  cd frontend && npm run build"
echo ""
echo "✓ Fix #2: Redeploy to Firebase"
echo "  firebase deploy --only hosting"
echo ""
echo "✓ Fix #3: Test endpoints"
echo "  Visit: https://mamo-frontend.web.app"
echo "  Open DevTools (F12) → Network tab"
echo "  Try uploading an image"
echo "  Check for CORS errors"
echo ""
