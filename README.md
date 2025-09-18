# HeadacheMD Next.js Application

A comprehensive medical platform for headache treatment and patient management with HIPAA compliance, built with Next.js, TypeScript, and Firebase.

## 🏥 Overview

HeadacheMD is a modern web application designed for doctors and patients to interact on multiple platforms (web, iOS, Android) for daily patient updates and analytics generation. The platform provides:

- **Patient Portal**: Daily health updates, treatment tracking, and appointment management
- **Doctor Dashboard**: Patient management, treatment plans, and analytics
- **Admin Panel**: System administration, user management, and compliance monitoring
- **Mobile APIs**: RESTful endpoints for iOS/Android applications
- **EMR Integration**: OAuth2 integration with major EMR systems (Epic, Cerner, Allscripts)
- **HIPAA Compliance**: Full audit logging, data encryption, and access controls

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Next.js API routes, Firebase Admin SDK
- **Database**: Firestore (NoSQL)
- **Authentication**: Firebase Auth with custom role-based access
- **Deployment**: Google Cloud Run via Cloud Build
- **Monitoring**: Firebase Analytics, custom audit logging

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── admin/         # Admin dashboard
│   │   ├── analytics/     # Analytics dashboard
│   │   └── patient/       # Patient portal
│   ├── api/               # API routes
│   │   ├── mobile/        # Mobile app APIs
│   │   ├── emr/           # EMR integration APIs
│   │   └── analytics/     # Analytics APIs
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── charts/           # Analytics charts
│   └── providers/        # Context providers
├── lib/                  # Utility libraries
│   ├── firebase/         # Firebase configuration
│   ├── auth/             # Authentication logic
│   ├── emr/              # EMR integration
│   ├── hipaa/            # HIPAA compliance utilities
│   └── analytics/        # Analytics processing
└── types/                # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- Google Cloud project (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd headachemd-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Configure the following environment variables:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

   # Firebase Admin SDK
   FIREBASE_ADMIN_PROJECT_ID=your-project-id
   FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
   FIREBASE_ADMIN_PRIVATE_KEY=your-private-key

   # HIPAA Compliance
   ENCRYPTION_KEY=your-32-character-encryption-key
   NEXTAUTH_SECRET=your-nextauth-secret

   # EMR Integration
   EPIC_CLIENT_ID=your-epic-client-id
   EPIC_CLIENT_SECRET=your-epic-client-secret
   CERNER_CLIENT_ID=your-cerner-client-id
   CERNER_CLIENT_SECRET=your-cerner-client-secret
   ALLSCRIPTS_CLIENT_ID=your-allscripts-client-id
   ALLSCRIPTS_CLIENT_SECRET=your-allscripts-client-secret

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Firebase Setup**
   - Create a Firebase project
   - Enable Authentication, Firestore, and Storage
   - Set up security rules for Firestore
   - Create a service account and download credentials

5. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Features

### Patient Portal
- Daily health updates with pain level tracking
- Treatment plan visualization
- Appointment scheduling and management
- Medication adherence tracking
- Emergency contact information

### Doctor Dashboard
- Patient overview and management
- Treatment effectiveness analytics
- Appointment scheduling
- Patient communication tools
- Medical record access

### Admin Panel
- User management and role assignment
- System health monitoring
- HIPAA compliance reporting
- Analytics and reporting tools
- EMR integration management

### Mobile APIs
- RESTful endpoints for iOS/Android apps
- Secure authentication with JWT tokens
- Real-time data synchronization
- Offline data support
- Push notification integration

### EMR Integration
- OAuth2 authentication with major EMR systems
- FHIR-compliant data exchange
- Patient data synchronization
- Appointment and medication sync
- Audit logging for all data access

### HIPAA Compliance
- End-to-end encryption of PHI
- Comprehensive audit logging
- Role-based access controls
- Session management and timeout
- Data backup and recovery

## 🔒 Security & Compliance

### HIPAA Compliance Features
- **Data Encryption**: All PHI is encrypted using AES-256-GCM
- **Access Controls**: Role-based permissions with least privilege
- **Audit Logging**: Complete audit trail of all data access
- **Session Management**: Automatic session timeout and secure logout
- **Data Backup**: Encrypted backups with point-in-time recovery

### Security Measures
- **Authentication**: Multi-factor authentication support
- **Authorization**: Fine-grained role-based access control
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API rate limiting to prevent abuse
- **HTTPS Only**: All communications encrypted in transit

## 📊 Analytics & Reporting

### Patient Analytics
- Pain level trends and patterns
- Treatment effectiveness metrics
- Medication adherence tracking
- Patient engagement scores
- Quality of life improvements

### Practice Analytics
- Revenue tracking and forecasting
- Appointment utilization rates
- Patient satisfaction scores
- Treatment success rates
- Operational efficiency metrics

### Compliance Reporting
- HIPAA compliance audits
- Data access reports
- Security incident tracking
- User activity monitoring
- System health metrics

## 🚀 Deployment

### Google Cloud Run Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy to Cloud Run**
   ```bash
   # Deploy to staging
   npm run deploy:staging

   # Deploy to production
   npm run deploy:production
   ```

### Docker Deployment

1. **Build Docker Image**
   ```bash
   docker build -t headachemd-nextjs .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 headachemd-nextjs
   ```

### Environment-Specific Configuration

The application supports multiple environments:
- **Development**: Local development with hot reloading
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

## 📱 Mobile App Integration

### API Endpoints

The application provides RESTful APIs for mobile applications:

```typescript
// Authentication
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout

// Patient Data
GET /api/patients/{id}
PUT /api/patients/{id}
POST /api/patients/{id}/daily-updates

// Mobile Sync
POST /api/mobile/sync
GET /api/mobile/patient-data
POST /api/mobile/daily-update

// EMR Integration
GET /api/emr/auth/{system}
POST /api/emr/callback/{system}
GET /api/emr/patient-data/{patientId}
```

### Mobile SDK

A TypeScript SDK is available for mobile app integration:

```typescript
import { HeadacheMDClient } from '@headachemd/mobile-sdk';

const client = new HeadacheMDClient({
  baseUrl: 'https://api.headachemd.org',
  apiKey: 'your-api-key'
});

// Sync daily update
await client.syncDailyUpdate({
  painLevel: 3,
  headacheFrequency: 1,
  triggers: ['stress', 'lack of sleep'],
  medications: [
    { name: 'Topiramate', taken: true, time: new Date() }
  ],
  notes: 'Feeling better today'
});
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:ci          # Run tests in CI mode

# Linting
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors

# Type Checking
npm run type-check       # Run TypeScript type checking

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data

# Security
npm run security:audit   # Run security audit

# Docker
npm run docker:build     # Build Docker image
npm run docker:run       # Run Docker container

# Deployment
npm run deploy:staging   # Deploy to staging
npm run deploy:production # Deploy to production
```

### Code Quality

The project follows strict coding standards:
- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code linting with strict rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Jest**: Unit and integration testing

### Testing Strategy

```bash
# Unit Tests
npm run test:unit

# Integration Tests
npm run test:integration

# E2E Tests
npm run test:e2e

# Coverage Report
npm run test:coverage
```

## 📚 API Documentation

### Authentication

All API requests require authentication via JWT tokens:

```typescript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token } = await response.json();

// Use token in subsequent requests
const data = await fetch('/api/patients', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Error Handling

The API returns standardized error responses:

```typescript
{
  error: 'Error message',
  code: 'ERROR_CODE',
  details: 'Additional error details',
  timestamp: '2024-01-15T10:30:00Z'
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure HIPAA compliance for all changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Email**: support@headachemd.org
- **Documentation**: [docs.headachemd.org](https://docs.headachemd.org)
- **Issues**: [GitHub Issues](https://github.com/headachemd/nextjs-app/issues)

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## 🙏 Acknowledgments

- Dr. Pamela Blake and the HeadacheMD team
- Next.js and Vercel for the amazing framework
- Firebase team for the robust backend services
- The open-source community for the excellent tools and libraries
# headachemd-nextjs
# Cloud Build Trigger - Wed Sep 17 11:09:25 AM CDT 2025
