#!/bin/bash

# Frontend-Backend Connection & Firebase Deployment Script
# For Linux/Mac users

echo "===== MAMO - Frontend & Backend Setup ====="
echo ""

# Check prerequisites
echo "[1] Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found. Please install from https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js found"

if ! command -v npm &> /dev/null; then
    echo "ERROR: npm not found."
    exit 1
fi
echo "✓ npm found"

# Check Firebase CLI
if ! npm list -g firebase-tools &> /dev/null; then
    echo ""
    echo "[2] Installing Firebase CLI globally..."
    npm install -g firebase-tools
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install Firebase CLI"
        exit 1
    fi
    echo "✓ Firebase CLI installed"
else
    echo "✓ Firebase CLI already installed"
fi

# Setup frontend
echo ""
echo "[3] Setting up frontend..."
cd frontend || exit 1

echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi
echo "✓ Frontend dependencies installed"

# Build frontend
echo ""
echo "[4] Building frontend for production..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to build frontend"
    exit 1
fi
echo "✓ Frontend build completed"

cd ..

# Test backend connection
echo ""
echo "[5] Testing backend connection..."
if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "https://mamo-backend-135198599265.us-central1.run.app" | grep -q "200"; then
    echo "✓ Backend is reachable"
else
    echo "⚠ Backend might not be reachable. Check the URL or ensure backend is running."
fi

# Firebase deployment
echo ""
echo "[6] Deploying to Firebase..."
echo "Please log in to your Firebase account if prompted."
firebase login
if [ $? -ne 0 ]; then
    echo "ERROR: Firebase login failed"
    exit 1
fi

echo ""
echo "Deploying frontend to Firebase Hosting..."
firebase deploy --only hosting
if [ $? -ne 0 ]; then
    echo "ERROR: Firebase deployment failed"
    exit 1
fi

echo ""
echo "===== DEPLOYMENT COMPLETE ====="
echo ""
echo "Your MAMO application is now live!"
echo ""
echo "Next steps:"
echo "1. Verify the frontend is working at the Firebase Hosting URL"
echo "2. Test image upload/prediction functionality"
echo "3. Check that the chatbot can connect to the backend"
