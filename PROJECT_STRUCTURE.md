# HeadacheMD Next.js Project Structure

## 🏗️ Architecture Overview

This is a comprehensive medical application built with Next.js 14, designed for HIPAA compliance and multi-platform support.

### 📁 Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth group routes
│   │   ├── login/
│   │   ├── register/
│   │   └── emr-auth/
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── admin/               # Doctor/Admin dashboard
│   │   ├── patient/             # Patient portal
│   │   └── analytics/           # Analytics dashboard
│   ├── api/                     # API routes
│   │   ├── auth/
│   │   ├── patients/
│   │   ├── analytics/
│   │   ├── emr/
│   │   └── mobile/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components (shadcn/ui)
│   ├── forms/                   # Form components
│   ├── charts/                  # Analytics charts
│   ├── layout/                  # Layout components
│   └── medical/                 # Medical-specific components
├── lib/                         # Utility libraries
│   ├── firebase/                # Firebase configuration
│   ├── auth/                    # Authentication utilities
│   ├── emr/                     # EMR integration
│   ├── hipaa/                   # HIPAA compliance utilities
│   ├── analytics/               # Analytics utilities
│   └── utils.ts                 # General utilities
├── types/                       # TypeScript type definitions
│   ├── auth.ts
│   ├── patient.ts
│   ├── medical.ts
│   └── analytics.ts
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts
│   ├── usePatients.ts
│   └── useAnalytics.ts
└── middleware.ts                # Next.js middleware for auth/routing
```

### 🔧 Key Technologies

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase Functions
- **Database**: Firestore (HIPAA-compliant)
- **Authentication**: Firebase Auth + EMR integration
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Google Cloud Build → Cloud Run

### 🏥 Medical Features

- **Patient Management**: Comprehensive patient records and tracking
- **EMR Integration**: Support for major EMR systems (Epic, Cerner, etc.)
- **Analytics Dashboard**: Real-time analytics for doctors
- **Mobile API**: RESTful API for iOS/Android apps
- **HIPAA Compliance**: Full audit logging and encryption
- **Daily Updates**: Patient symptom tracking and reporting

### 🔐 Security Features

- **HIPAA Compliance**: End-to-end encryption, audit logs
- **Authentication**: Multi-factor authentication with EMR integration
- **Session Management**: Secure session handling with automatic timeout
- **Rate Limiting**: API rate limiting and DDoS protection
- **Data Validation**: Comprehensive input validation and sanitization
