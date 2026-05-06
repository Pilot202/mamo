# Deploying to Google Cloud Run

This guide assumes you have the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and authenticated.

## Prerequisites
1.  A Google Cloud Project.
2.  Enable the **Cloud Run API** and **Artifact Registry API**.
    ```bash
    gcloud services enable run.googleapis.com artifactregistry.googleapis.com
    ```
3.  Authenticate:
    ```bash
    gcloud auth login
    gcloud config set project [YOUR_PROJECT_ID]
    ```

## Step 1: Build & Submit the Image
The easiest way to build and push is using Google Cloud Build (no local Docker required), OR you can push your local build.

### Option A: Cloud Build (Recommended)
Run this from the `backend/` directory:
```bash
cd backend
gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/mamo-backend
```

### Option B: Push Local Docker Image
If you already have a local image tagged suitable for GCR:
```bash
docker tag mamo-backend gcr.io/[YOUR_PROJECT_ID]/mamo-backend
docker push gcr.io/[YOUR_PROJECT_ID]/mamo-backend
```

## Step 2: Deploy to Cloud Run

Deploy the backend service.

**Windows (PowerShell) / Universal:**
```bash
gcloud run deploy mamo-backend --image us-central1-docker.pkg.dev/[YOUR_PROJECT_ID]/mamo-repo/backend:v1 --platform managed --region us-central1 --allow-unauthenticated --port 8080 --memory 4Gi --cpu 2
```

## Step 3: Configure Environment Variables
You need to set your Gemini API Key in Cloud Run.

```bash
gcloud run services update mamo-backend --set-env-vars GEMINI_API_KEY=[YOUR_API_KEY]
```

## Step 4: Verification
Cloud Run will provide a URL (e.g., `https://mamo-backend-xyz.a.run.app`).
Update your Frontend (Render) to point to this new URL.
