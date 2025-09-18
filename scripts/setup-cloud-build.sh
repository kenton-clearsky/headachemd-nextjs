#!/bin/bash

# 🚀 HeadacheMD Cloud Build + Cloud Run Setup Script
# This script helps set up the required Google Cloud services and APIs

set -e

echo "🚀 Setting up Cloud Build + Cloud Run for HeadacheMD..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install Google Cloud SDK first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with gcloud. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

# Set project
PROJECT_ID="headachemd"
echo "📋 Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com

# Grant Cloud Build service account necessary permissions
echo "🔐 Setting up service account permissions..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

echo "   Granting Cloud Build service account Cloud Run Admin role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUDBUILD_SA}" \
    --role="roles/run.admin"

echo "   Granting Cloud Build service account Service Account User role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUDBUILD_SA}" \
    --role="roles/iam.serviceAccountUser"

echo "   Granting Cloud Build service account Storage Admin role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${CLOUDBUILD_SA}" \
    --role="roles/storage.admin"

# Create Cloud Run service account for the app
echo "👤 Creating Cloud Run service account..."
gcloud iam service-accounts create headachemd-runner \
    --display-name="HeadacheMD Cloud Run Service Account" \
    --description="Service account for HeadacheMD app running on Cloud Run"

# Grant necessary roles to the service account
echo "🔐 Granting roles to Cloud Run service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:headachemd-runner@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/datastore.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:headachemd-runner@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/firebase.admin"

echo ""
echo "✅ Setup complete! Next steps:"
echo ""
echo "1. 🌐 Go to Cloud Build Triggers:"
echo "   https://console.cloud.google.com/cloud-build/triggers"
echo ""
echo "2. 🔗 Connect your GitHub repository:"
echo "   - Click 'Connect Repository'"
echo "   - Choose 'GitHub (Cloud Build GitHub App)'"
echo "   - Install the app and select your repo"
echo ""
echo "3. 🚀 Create a trigger:"
echo "   - Name: headachemd-deploy"
echo "   - Event: Push to a branch"
echo "   - Branch: ^main$"
echo "   - Build config: /cloudbuild.yaml"
echo ""
echo "4. 🧪 Test the deployment:"
echo "   git add . && git commit -m 'test: trigger cloud build' && git push origin main"
echo ""
echo "5. 📱 Check your deployed app:"
echo "   https://console.cloud.google.com/run"
echo ""
echo "🎯 Your app will automatically deploy on every push to main!"
