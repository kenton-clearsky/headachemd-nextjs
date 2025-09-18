import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      // Check if we have a complete private key (production) or should use ADC (local dev)
      if (privateKey && privateKey.length > 500) {
        // Production: Use service account credentials
        console.log('🔑 Using service account credentials');
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
        });
      } else {
        // Local development: Use Application Default Credentials
        console.log('🔑 Using Application Default Credentials for local development');
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'headachemd',
        });
      }
    } catch (error) {
      console.error('❌ Firebase Admin initialization error:', error);
      throw error;
    }
  }
  return admin.firestore();
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching users from Firestore...");
    
    // Initialize Firebase Admin and get Firestore instance
    const db = initializeFirebaseAdmin();
    
    // Get all users from Firestore using Admin SDK
    const usersSnapshot = await db.collection("users").orderBy("createdAt", "desc").get();
    
    console.log(`📊 Found ${usersSnapshot.size} users in collection`);
    
    const users = usersSnapshot.docs.map((doc, index) => {
      try {
        const data = doc.data();
        console.log(`📄 Processing user ${index + 1}: ${doc.id}`);
        
        return {
          id: doc.id,
          userId: data.userId || doc.id,
          email: data.email || '',
          role: data.role || 'patient',
          profile: {
            firstName: data.profile?.firstName || '',
            lastName: data.profile?.lastName || '',
            displayName: data.profile?.displayName || `${data.profile?.firstName || ''} ${data.profile?.lastName || ''}`.trim(),
            phone: data.profile?.phone || '',
            specialty: data.profile?.specialty || '',
            dateOfBirth: data.profile?.dateOfBirth || '',
            gender: data.profile?.gender || '',
            address: data.profile?.address || null,
            emergencyContact: data.profile?.emergencyContact || null
          },
          isActive: data.isActive !== false, // Default to true if not set
          emailVerified: data.emailVerified || false,
          profileComplete: data.profileComplete || false,
          createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : new Date()),
          updatedAt: data.updatedAt?.toDate?.() || (data.updatedAt ? new Date(data.updatedAt) : new Date()),
          lastLogin: data.lastLogin?.toDate?.() || (data.lastLogin ? new Date(data.lastLogin) : null),
          // Patient-specific data
          mrn: data.mrn || '',
          medicalHistory: data.medicalHistory || null,
          headacheProfile: data.headacheProfile || null,
          insurance: data.insurance || null,
          assignedDoctors: data.assignedDoctors || [],
          currentTreatments: data.currentTreatments || [],
          appointments: data.appointments || [],
          dailyUpdates: data.dailyUpdates || []
        };
      } catch (userError) {
        console.error(`❌ Error processing user ${doc.id}:`, userError);
        // Return a minimal user object to prevent the entire request from failing
        return {
          id: doc.id,
          userId: doc.id,
          email: '',
          role: 'patient',
          profile: { firstName: '', lastName: '', displayName: '' },
          isActive: true,
          emailVerified: false,
          profileComplete: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: null,
          mrn: '',
          medicalHistory: null,
          headacheProfile: null,
          insurance: null,
          assignedDoctors: [],
          currentTreatments: [],
          appointments: [],
          dailyUpdates: []
        };
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Creating new user...");
    
    const body = await request.json();
    const {
      email,
      password,
      role,
      profile,
      isActive = true,
      sendWelcomeEmail = true
    } = body;

    // Validate required fields
    if (!email || !password || !role || !profile?.firstName || !profile?.lastName) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, role, firstName, lastName" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'doctor', 'patient', 'nurse', 'staff'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be one of: admin, doctor, patient, nurse, staff" },
        { status: 400 }
      );
    }

    // Initialize Firebase Admin
    const db = initializeFirebaseAdmin();

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: false,
      disabled: !isActive,
      displayName: `${profile.firstName} ${profile.lastName}`,
    });

    console.log(`✅ Created Firebase Auth user: ${userRecord.uid}`);

    // Prepare user document for Firestore
    const userDoc = {
      userId: userRecord.uid,
      email: email,
      role: role,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        displayName: `${profile.firstName} ${profile.lastName}`,
        phone: profile.phone || '',
        specialty: profile.specialty || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        address: profile.address || null,
        emergencyContact: profile.emergencyContact || null
      },
      isActive: isActive,
      emailVerified: false,
      profileComplete: role === 'patient' ? 
        !!(profile.dateOfBirth && profile.gender) : 
        !!(profile.specialty && role === 'doctor'),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null,
      // Role-specific data
      ...(role === 'patient' && {
        mrn: '', // Will be generated later
        medicalHistory: null,
        headacheProfile: null,
        insurance: null,
        assignedDoctors: [],
        currentTreatments: [],
        appointments: [],
        dailyUpdates: []
      })
    };

    // Save user document to Firestore
    await db.collection('users').doc(userRecord.uid).set(userDoc);

    console.log(`✅ Created Firestore user document: ${userRecord.uid}`);

    // Send welcome email if requested
    if (sendWelcomeEmail) {
      try {
        const actionCodeSettings = {
          url: `${process.env.NEXTAUTH_URL || 'https://headachemd-nextjs-sznczbmgha-uc.a.run.app'}/dashboard`,
          handleCodeInApp: false,
        };

        await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
        console.log(`✅ Welcome email sent to: ${email}`);
      } catch (emailError) {
        console.warn(`⚠️ Failed to send welcome email to ${email}:`, emailError);
        // Don't fail the user creation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: userRecord.uid,
        email: email,
        role: role,
        profile: userDoc.profile,
        isActive: isActive
      }
    });

  } catch (error) {
    console.error("Error creating user:", error);
    
    // Handle specific Firebase Auth errors
    if (error instanceof Error) {
      if (error.message.includes('email-already-exists') || 
          error.message.includes('email address is already in use')) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 }
        );
      }
      if (error.message.includes('invalid-email')) {
        return NextResponse.json(
          { error: "Invalid email address" },
          { status: 400 }
        );
      }
      if (error.message.includes('weak-password')) {
        return NextResponse.json(
          { error: "Password is too weak" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}