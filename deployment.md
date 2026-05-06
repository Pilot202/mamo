# Deploying to Docker Hub

Follow these steps to push your Mammography App images to Docker Hub.

## Prerequisites
- A [Docker Hub](https://hub.docker.com/) account.
- You must be logged in locally.
- You should create two repositories on Docker Hub (optional, but good practice):
  - `mamo-backend`
  - `mamo-frontend`

## Step 1: Login
Run this command and enter your credentials:
```bash
docker login registry.hf.space
```
(Use your Access Token as password)

## Step 2: Build the Backend Image
Run this from the `mamo` directory. This builds only the FastAPI backend.

```bash
docker build -t registry.hf.space/YOUR_USERNAME/SPACE_NAME:latest -f backend/Dockerfile backend/
```
*Note: Pointing to `backend/` context so it uses the requirements.txt inside it.*
*Replace `YOUR_USERNAME` (pilot202) and `SPACE_NAME` (mamo_prediction).*

## Step 3: Push Image
Push to Hugging Face.

```bash
docker push registry.hf.space/YOUR_USERNAME/SPACE_NAME:latest
```

## Step 4: Verify
Your Space should now restart and serve the full application at its URL.

## Step 5: Verify
Go to your Docker Hub profile and verify that both repositories have the `latest` tag pushed.
