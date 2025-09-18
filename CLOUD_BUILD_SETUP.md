# 🚀 Cloud Build + Cloud Run Setup Guide

## **Overview**
This setup uses Google Cloud Build triggers to automatically deploy your Next.js app to Cloud Run whenever you push to GitHub.

## **Prerequisites**
1. ✅ Google Cloud Project: `headachemd`
2. ✅ GitHub repository connected to Cloud Build
3. ✅ Cloud Build API enabled
4. ✅ Cloud Run API enabled
5. ✅ Container Registry API enabled

## **Step 1: Enable Required APIs**
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## **Step 2: Create Cloud Build Trigger**

### **Option A: Via Google Cloud Console (Recommended)**
1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click **"Create Trigger"**
3. Configure the trigger:

**Basic Settings:**
- **Name**: `headachemd-deploy`
- **Description**: `Deploy HeadacheMD app to Cloud Run`
- **Event**: `Push to a branch`
- **Repository**: Connect your GitHub repo
- **Branch**: `^main$` (or your default branch)

**Build Configuration:**
- **Type**: `Cloud Build configuration file (yaml or json)`
- **Cloud Build configuration file location**: `/cloudbuild.yaml`
- **Substitutions** (optional):
  - `_REGION`: `us-central1`
  - `_FIREBASE_API_KEY`: `AIzaSyCRJHNyiW8NMqa1DEmEsOouA7lIfFwd9XM`
  - `_FIREBASE_AUTH_DOMAIN`: `headachemd.firebaseapp.com`
  - `_FIREBASE_PROJECT_ID`: `headachemd`
  - `_FIREBASE_STORAGE_BUCKET`: `headachemd.firebasestorage.app`
  - `_FIREBASE_MESSAGING_SENDER_ID`: `109987892469`
  - `_FIREBASE_APP_ID`: `1:109987892469:web:48875d9a9d65383ff289bc`

### **Option B: Via gcloud CLI**
```bash
gcloud builds triggers create github \
  --name="headachemd-deploy" \
  --repo-name="your-github-repo-name" \
  --repo-owner="your-github-username" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  --substitutions="_REGION=us-central1"
```

## **Step 3: Set Up GitHub Repository Connection**
1. In Cloud Build Triggers, click **"Connect Repository"**
2. Choose **"GitHub (Cloud Build GitHub App)"**
3. Install the Cloud Build GitHub App
4. Select your repository
5. Grant necessary permissions

## **Step 4: Test the Trigger**
1. Make a small change to your code
2. Commit and push to GitHub:
```bash
git add .
git commit -m "test: trigger cloud build"
git push origin main
```
3. Check Cloud Build console for build progress
4. Once complete, check Cloud Run for your deployed service

## **Step 5: Access Your Deployed App**
After successful deployment, your app will be available at:
```
https://headachemd-app-[hash]-uc.a.run.app
```

## **Benefits of This Approach**
✅ **No deployment code in GitHub** - Only your app code
✅ **Automatic deployments** - Every push triggers a build
✅ **Scalable infrastructure** - Cloud Run auto-scales
✅ **Cost-effective** - Pay only for what you use
✅ **Professional deployment** - Production-ready setup

## **Troubleshooting**
- **Build fails**: Check Cloud Build logs
- **Deployment fails**: Check Cloud Run logs
- **API not enabled**: Enable required APIs
- **Permissions**: Ensure service account has necessary roles

## **Next Steps**
1. Set up custom domain (optional)
2. Configure environment variables
3. Set up monitoring and alerts
4. Configure SSL certificates (automatic with Cloud Run)
