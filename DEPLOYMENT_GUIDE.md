# HeadacheMD Deployment Guide

This guide provides step-by-step instructions for deploying the HeadacheMD Next.js application to Google Cloud Platform using Cloud Build and Cloud Run.

## 🚀 Prerequisites

### Required Accounts & Services
- Google Cloud Platform account
- Firebase project
- Domain name (optional, for custom domain)

### Required Tools
- Google Cloud CLI (gcloud)
- Docker (for local testing)
- Node.js 18+ and npm

## 📋 Pre-Deployment Checklist

### 1. Google Cloud Project Setup

1. **Create a new project or select existing one**
   ```bash
   # Create new project
   gcloud projects create headachemd-app --name="HeadacheMD Application"
   
   # Set as default project
   gcloud config set project headachemd-app
   ```

2. **Enable required APIs**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   gcloud services enable firestore.googleapis.com
   gcloud services enable firebase.googleapis.com
   ```

3. **Set up billing**
   - Go to [Google Cloud Console](https://console.cloud.google.com/billing)
   - Link a billing account to your project

### 2. Firebase Project Setup

1. **Create Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project with the same name as your GCP project

2. **Enable Firebase services**
   - Authentication (Email/Password, Google)
   - Firestore Database
   - Storage
   - Functions (optional)

3. **Configure Firestore security rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only access their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       // Patients can only access their own data
       match /patients/{patientId} {
         allow read, write: if request.auth != null && 
           (request.auth.uid == patientId || 
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'doctor']);
       }
       
       // Audit logs - read-only for admins
       match /audit_logs/{logId} {
         allow read: if request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
         allow write: if false; // Only system can write audit logs
       }
       
       // EMR sessions - users can only access their own
       match /emr_sessions/{sessionId} {
         allow read, write: if request.auth != null && 
           sessionId.matches(request.auth.uid + '.*');
       }
       
       // Daily updates - patients can only access their own
       match /daily_updates/{updateId} {
         allow read, write: if request.auth != null && 
           updateId.matches(request.auth.uid + '.*');
       }
     }
   }
   ```

4. **Create service account**
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Download the JSON file

### 3. Environment Configuration

1. **Create environment-specific config files**

   **Development (.env.local)**
   ```env
   NODE_ENV=development
   NEXT_PUBLIC_FIREBASE_API_KEY=your-dev-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-dev-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-dev-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-dev-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-dev-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-dev-app-id
   
   FIREBASE_ADMIN_PROJECT_ID=your-dev-project-id
   FIREBASE_ADMIN_CLIENT_EMAIL=your-dev-service-account-email
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   
   ENCRYPTION_KEY=your-32-character-dev-encryption-key
   NEXTAUTH_SECRET=your-dev-nextauth-secret
   
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **Staging (.env.staging)**
   ```env
   NODE_ENV=staging
   NEXT_PUBLIC_FIREBASE_API_KEY=your-staging-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-staging-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-staging-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-staging-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-staging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-staging-app-id
   
   FIREBASE_ADMIN_PROJECT_ID=your-staging-project-id
   FIREBASE_ADMIN_CLIENT_EMAIL=your-staging-service-account-email
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   
   ENCRYPTION_KEY=your-32-character-staging-encryption-key
   NEXTAUTH_SECRET=your-staging-nextauth-secret
   
   NEXT_PUBLIC_APP_URL=https://staging.headachemd.org
   ```

   **Production (.env.production)**
   ```env
   NODE_ENV=production
   NEXT_PUBLIC_FIREBASE_API_KEY=your-prod-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-prod-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-prod-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-prod-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-prod-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-prod-app-id
   
   FIREBASE_ADMIN_PROJECT_ID=your-prod-project-id
   FIREBASE_ADMIN_CLIENT_EMAIL=your-prod-service-account-email
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   
   ENCRYPTION_KEY=your-32-character-prod-encryption-key
   NEXTAUTH_SECRET=your-prod-nextauth-secret
   
   NEXT_PUBLIC_APP_URL=https://headachemd.org
   ```

2. **Set up Google Cloud Secrets**
   ```bash
   # Create secrets
   echo -n "your-firebase-admin-email" | gcloud secrets create firebase-admin-email --data-file=-
   echo -n "your-firebase-admin-private-key" | gcloud secrets create firebase-admin-key --data-file=-
   echo -n "your-encryption-key" | gcloud secrets create encryption-key --data-file=-
   echo -n "your-nextauth-secret" | gcloud secrets create nextauth-secret --data-file=-
   
   # Grant access to Cloud Run service account
   gcloud secrets add-iam-policy-binding firebase-admin-email \
     --member="serviceAccount:headachemd-app@appspot.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   
   gcloud secrets add-iam-policy-binding firebase-admin-key \
     --member="serviceAccount:headachemd-app@appspot.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   
   gcloud secrets add-iam-policy-binding encryption-key \
     --member="serviceAccount:headachemd-app@appspot.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   
   gcloud secrets add-iam-policy-binding nextauth-secret \
     --member="serviceAccount:headachemd-app@appspot.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

## 🏗️ Cloud Build Configuration

### 1. Update cloudbuild.yaml

The `cloudbuild.yaml` file is already configured for the project. Review and update the substitutions:

```yaml
substitutions:
  _REGION: 'us-central1'  # Change to your preferred region
  _FIREBASE_API_KEY: 'your-firebase-api-key'
  _FIREBASE_AUTH_DOMAIN: 'your-project.firebaseapp.com'
  _FIREBASE_PROJECT_ID: 'your-firebase-project-id'
  _FIREBASE_STORAGE_BUCKET: 'your-project.appspot.com'
  _FIREBASE_MESSAGING_SENDER_ID: 'your-sender-id'
  _FIREBASE_APP_ID: 'your-app-id'
```

### 2. Set up Cloud Build triggers

1. **Go to Cloud Build > Triggers**
2. **Create trigger for staging**
   - Name: `headachemd-staging`
   - Event: Push to a branch
   - Repository: Connect your GitHub repository
   - Branch: `staging`
   - Build configuration: Cloud Build configuration file
   - Cloud Build configuration file location: `/cloudbuild.yaml`
   - Substitutions:
     ```
     _ENV=staging
     _REGION=us-central1
     ```

3. **Create trigger for production**
   - Name: `headachemd-production`
   - Event: Push to a branch
   - Repository: Connect your GitHub repository
   - Branch: `main`
   - Build configuration: Cloud Build configuration file
   - Cloud Build configuration file location: `/cloudbuild.yaml`
   - Substitutions:
     ```
     _ENV=production
     _REGION=us-central1
     ```

## 🚀 Deployment Process

### 1. Initial Deployment

1. **Build and deploy manually**
   ```bash
   # Deploy to staging
   gcloud builds submit --config cloudbuild.yaml --substitutions _ENV=staging
   
   # Deploy to production
   gcloud builds submit --config cloudbuild.yaml --substitutions _ENV=production
   ```

2. **Verify deployment**
   ```bash
   # List Cloud Run services
   gcloud run services list
   
   # Get service URL
   gcloud run services describe headachemd-app --region=us-central1 --format="value(status.url)"
   ```

### 2. Automated Deployment

1. **Push to staging branch**
   ```bash
   git checkout -b staging
   git push origin staging
   ```

2. **Push to main branch for production**
   ```bash
   git checkout main
   git push origin main
   ```

## 🔧 Post-Deployment Configuration

### 1. Custom Domain Setup

1. **Map custom domain**
   ```bash
   gcloud run domain-mappings create \
     --service=headachemd-app \
     --domain=headachemd.org \
     --region=us-central1
   ```

2. **Configure DNS**
   - Add CNAME record pointing to the Cloud Run service
   - Wait for SSL certificate provisioning

### 2. Monitoring Setup

1. **Enable Cloud Monitoring**
   ```bash
   gcloud services enable monitoring.googleapis.com
   ```

2. **Set up alerts**
   - Go to Cloud Monitoring > Alerting
   - Create alerting policies for:
     - High error rates
     - High latency
     - Low availability

### 3. Security Configuration

1. **Set up IAM roles**
   ```bash
   # Grant minimal required permissions
   gcloud projects add-iam-policy-binding headachemd-app \
     --member="serviceAccount:headachemd-app@appspot.gserviceaccount.com" \
     --role="roles/run.invoker"
   ```

2. **Configure VPC (optional)**
   ```bash
   # Create VPC connector for private services
   gcloud compute networks vpc-access connectors create headachemd-connector \
     --network=default \
     --region=us-central1 \
     --range=10.8.0.0/28
   ```

## 📊 Monitoring & Maintenance

### 1. Health Checks

1. **Set up health check endpoint**
   - The application includes `/api/health` endpoint
   - Configure Cloud Run health checks

2. **Monitor application logs**
   ```bash
   # View logs
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=headachemd-app"
   ```

### 2. Performance Monitoring

1. **Enable Firebase Performance Monitoring**
2. **Set up custom metrics**
3. **Monitor key performance indicators**

### 3. Backup Strategy

1. **Firestore backups**
   ```bash
   # Enable scheduled backups
   gcloud firestore databases create --location=us-central1
   ```

2. **Application data backups**
   - Set up automated backups for user data
   - Test restore procedures regularly

## 🔄 CI/CD Pipeline

### 1. GitHub Actions (Alternative)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main, staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to Cloud Run
      uses: google-github-actions/deploy-cloudrun@v1
      with:
        service: headachemd-app
        region: us-central1
        env_vars: |
          NODE_ENV=${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
        secrets: |
          FIREBASE_ADMIN_CLIENT_EMAIL=${{ secrets.FIREBASE_ADMIN_CLIENT_EMAIL }}
          FIREBASE_ADMIN_PRIVATE_KEY=${{ secrets.FIREBASE_ADMIN_PRIVATE_KEY }}
          ENCRYPTION_KEY=${{ secrets.ENCRYPTION_KEY }}
          NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET }}
```

### 2. Environment Promotion

1. **Staging to Production**
   - Test thoroughly in staging
   - Create pull request to main
   - Review and approve
   - Deploy to production

2. **Rollback Strategy**
   ```bash
   # Rollback to previous revision
   gcloud run services update-traffic headachemd-app \
     --to-revisions=headachemd-app-00001-abc=100 \
     --region=us-central1
   ```

## 🛠️ Troubleshooting

### Common Issues

1. **Build failures**
   ```bash
   # Check build logs
   gcloud builds log [BUILD_ID]
   
   # Common fixes:
   # - Update dependencies
   # - Fix TypeScript errors
   # - Check environment variables
   ```

2. **Runtime errors**
   ```bash
   # Check Cloud Run logs
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=headachemd-app" --limit=50
   ```

3. **Authentication issues**
   - Verify Firebase configuration
   - Check service account permissions
   - Validate environment variables

### Performance Optimization

1. **Enable caching**
   ```bash
   # Set up Cloud CDN
   gcloud compute backend-services create headachemd-backend \
     --global \
     --load-balancing-scheme=EXTERNAL
   ```

2. **Optimize container size**
   - Use multi-stage Docker builds
   - Minimize dependencies
   - Enable compression

## 📈 Scaling Configuration

### 1. Auto-scaling

Configure in `cloudbuild.yaml`:
```yaml
--max-instances=100
--min-instances=1
--concurrency=80
```

### 2. Resource Allocation

```yaml
--memory=2Gi
--cpu=2
```

### 3. Cost Optimization

1. **Set appropriate instance limits**
2. **Use committed use discounts**
3. **Monitor resource usage**

## 🔐 Security Best Practices

1. **Secrets Management**
   - Use Google Secret Manager
   - Rotate secrets regularly
   - Limit access to secrets

2. **Network Security**
   - Use VPC for private services
   - Configure firewall rules
   - Enable DDoS protection

3. **Application Security**
   - Regular security audits
   - Dependency vulnerability scanning
   - Input validation and sanitization

## 📞 Support

For deployment issues:
- Check [Cloud Build documentation](https://cloud.google.com/build/docs)
- Review [Cloud Run documentation](https://cloud.google.com/run/docs)
- Contact the development team

## 🔄 Maintenance Schedule

- **Weekly**: Review logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and update deployment configuration
- **Annually**: Full security audit and compliance review
