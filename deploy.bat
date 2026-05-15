@echo off
REM Frontend-Backend Connection & Firebase Deployment Script

echo ===== MAMO - Frontend & Backend Setup =====
echo.

REM Colors for output (Windows PowerShell would be better, but using batch for compatibility)
echo [1] Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js from https://nodejs.org/
    exit /b 1
)
echo ✓ Node.js found

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm not found.
    exit /b 1
)
echo ✓ npm found

REM Check if firebase-tools is installed globally
npm list -g firebase-tools >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo.
    echo [2] Installing Firebase CLI globally...
    call npm install -g firebase-tools
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to install Firebase CLI
        exit /b 1
    )
    echo ✓ Firebase CLI installed
) else (
    echo ✓ Firebase CLI already installed
)

REM Navigate to frontend directory
echo.
echo [3] Setting up frontend...
cd frontend
if %ERRORLEVEL% neq 0 (
    echo ERROR: frontend directory not found
    exit /b 1
)

REM Install frontend dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    exit /b 1
)
echo ✓ Frontend dependencies installed

REM Build frontend
echo.
echo [4] Building frontend for production...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to build frontend
    exit /b 1
)
echo ✓ Frontend build completed

REM Return to root
cd ..

REM Test backend connection
echo.
echo [5] Testing backend connection...
powershell -NoProfile -Command "
try {
    $response = Invoke-WebRequest -Uri 'https://mamo-backend-135198599265.us-central1.run.app' -TimeoutSec 5
    Write-Host '✓ Backend is reachable'
} catch {
    Write-Host '⚠ Backend might not be reachable. Check the URL or ensure backend is running.'
}
"

REM Firebase deployment
echo.
echo [6] Deploying to Firebase...
echo Please log in to your Firebase account if prompted.
call firebase login
if %ERRORLEVEL% neq 0 (
    echo ERROR: Firebase login failed
    exit /b 1
)

echo.
echo Deploying frontend to Firebase Hosting...
call firebase deploy --only hosting
if %ERRORLEVEL% neq 0 (
    echo ERROR: Firebase deployment failed
    exit /b 1
)

echo.
echo ===== DEPLOYMENT COMPLETE =====
echo.
echo Your MAMO application is now live!
echo.
echo Next steps:
echo 1. Verify the frontend is working at the Firebase Hosting URL
echo 2. Test image upload/prediction functionality
echo 3. Check that the chatbot can connect to the backend
echo.
pause
