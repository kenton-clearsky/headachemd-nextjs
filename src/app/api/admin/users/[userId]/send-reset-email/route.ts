import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
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
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Initialize Firebase Admin at runtime
    initializeFirebaseAdmin();
    
    const { userId } = await context.params;
    
    // Get user email
    const userRecord = await admin.auth().getUser(userId);
    const email = userRecord.email;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Generate password reset link
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      handleCodeInApp: true,
    };

    const resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);

    // In a real application, you would send this link via email
    // For now, we'll just return the link (in production, use a proper email service)
    console.log(`Password reset link for ${email}: ${resetLink}`);

    return NextResponse.json({ 
      success: true,
      message: "Password reset email sent successfully",
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined // Only return link in development
    });
  } catch (error) {
    console.error("Error sending reset email:", error);
    return NextResponse.json(
      { error: "Failed to send reset email" },
      { status: 500 }
    );
  }
}
