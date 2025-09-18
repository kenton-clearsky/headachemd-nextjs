# HeadacheMD Local Development Guide

## Quick Start

Follow these steps to run the HeadacheMD application locally:

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

If you encounter engine warnings about Node.js version, you can:
- Either upgrade to Node.js 20+ 
- Or continue with Node.js 18 (it should still work)

### 2. Environment Setup

The `.env.local` file has been created with mock Firebase credentials for development.
This allows you to run the app without setting up a real Firebase project.

### 3. Start the Development Server

Run the following command:

```bash
npm run dev
```

The server will start on http://localhost:3000

### 4. Access the Application

Once the server is running, open your browser and navigate to:

- **Homepage**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin (auto-authenticated in dev mode)
- **Patient Portal**: http://localhost:3000/patient
- **Analytics Dashboard**: http://localhost:3000/analytics

### Development Mode Features

In development mode with mock credentials:
- **Auto Authentication**: You'll be automatically logged in as an admin user
- **Mock Data**: The dashboards show sample data
- **No Firebase Required**: The app runs without real Firebase connection

### Troubleshooting

#### If npm install hangs:
```bash
# Clear npm cache
npm cache clean --force

# Try with different registry
npm install --registry https://registry.npmjs.org/
```

#### If you see dependency errors:
```bash
# Install with legacy peer deps
npm install --legacy-peer-deps
```

#### If the dev server doesn't start:
```bash
# Check for port conflicts
lsof -i :3000

# Try a different port
npm run dev -- -p 3001
```

### What You'll See

1. **Homepage**: 
   - Professional medical website layout
   - Navigation menu
   - Hero section with call-to-action
   - Admin button in bottom-right corner

2. **Admin Dashboard**: 
   - Overview statistics cards
   - Recent activity feed
   - System health monitoring
   - Tabbed interface for different sections

3. **Patient Portal**:
   - Daily health update form
   - Treatment plan overview
   - Appointment management
   - Health metrics visualization

4. **Analytics Dashboard**:
   - Interactive charts (using Recharts)
   - Patient demographics
   - Treatment effectiveness metrics
   - Revenue tracking

### Next Steps

1. **Explore the UI**: Navigate through different pages
2. **Check Components**: Review the component structure in `src/components/ui`
3. **API Routes**: Check `src/app/api` for backend endpoints
4. **Customize**: Modify components and styles as needed

### For Production Deployment

To deploy to production, you'll need:
1. Real Firebase project with Authentication and Firestore
2. Google Cloud project for Cloud Run deployment
3. Proper environment variables
4. Follow the DEPLOYMENT_GUIDE.md for detailed instructions

Enjoy exploring the HeadacheMD application!
