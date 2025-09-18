import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
      if (!privateKey) {
        throw new Error('FIREBASE_ADMIN_PRIVATE_KEY environment variable is not set');
      }
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    } catch (error) {
      console.error('❌ Firebase Admin initialization error:', error);
      throw error;
    }
  }
  return admin.firestore();
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Initialize Firebase Admin at runtime
    const db = initializeFirebaseAdmin();
    
    const { userId } = await context.params;
    const userDoc = await db.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const data = userDoc.data();
    const user = {
      id: userDoc.id,
      email: data?.email || '',
      role: data?.role || 'patient',
      profile: data?.profile || {},
      isActive: data?.isActive !== false,
      createdAt: data?.createdAt?.toDate?.() || (data?.createdAt ? new Date(data.createdAt) : new Date()),
      updatedAt: data?.updatedAt?.toDate?.() || (data?.updatedAt ? new Date(data.updatedAt) : new Date()),
      lastLogin: data?.lastLogin?.toDate?.() || (data?.lastLogin ? new Date(data.lastLogin) : null),
    };

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Initialize Firebase Admin at runtime
    const db = initializeFirebaseAdmin();
    
    const { userId } = await context.params;
    const body = await request.json();
    
    const {
      email,
      profile,
      role,
      isActive,
      password,
    } = body;

    // Update user in Firestore
    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (profile) updateData.profile = profile;

    await db.collection("users").doc(userId).update(updateData);

    // Update password in Firebase Auth if provided
    if (password) {
      try {
        await admin.auth().updateUser(userId, {
          password: password,
        });
      } catch (authError) {
        console.error("Error updating password:", authError);
        // Continue even if password update fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Initialize Firebase Admin at runtime
    const db = initializeFirebaseAdmin();
    
    const { userId } = await context.params;
    
    // Delete user from Firestore
    await db.collection("users").doc(userId).delete();
    
    // Delete user from Firebase Auth
    try {
      await admin.auth().deleteUser(userId);
    } catch (authError) {
      console.error("Error deleting user from auth:", authError);
      // Continue even if auth deletion fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
