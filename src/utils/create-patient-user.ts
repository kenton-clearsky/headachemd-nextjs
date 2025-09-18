import { auth, db } from "@/lib/firebase/config";
import { parseDateOfBirth } from "@/lib/services/patients";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { config } from "@/lib/config";
import { encryptPHI } from "@/lib/hipaa/encryption";

/**
 * Create a patient user that links to existing patient data
 */
export async function createPatientUser(email: string, password: string) {
  try {
    console.log("👤 Creating patient user for:", email);

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    console.log("✅ Created Firebase user:", firebaseUser.uid);

    // Find the patient record with this email
    const patientsQuery = query(
      collection(db, "patients"),
      where("profile.email", "==", email)
    );

    const patientsSnapshot = await getDocs(patientsQuery);

    if (patientsSnapshot.empty) {
      throw new Error(`No patient record found for email: ${email}`);
    }

    const patientDoc = patientsSnapshot.docs[0];
    const patientData = patientDoc.data();

    // Build normalized user document
    const now = Timestamp.now();
    const firstName: string = patientData.profile?.firstName || "";
    const lastName: string = patientData.profile?.lastName || "";
    const displayName = `${firstName} ${lastName}`.trim();
    const phoneRaw: string | undefined =
      patientData.profile?.phone || undefined;
    // dateOfBirth may be a Firestore Timestamp, ISO string, or undefined
    const dobRaw: string | undefined = patientData.profile?.dateOfBirth
      ? parseDateOfBirth(patientData.profile.dateOfBirth)
          .toISOString()
          .slice(0, 10)
      : undefined;

    const userDoc = {
      userId: firebaseUser.uid,
      email: email.toLowerCase(),
      role: "patient" as const,
      isActive: true,
      emailVerified: Boolean(firebaseUser.emailVerified),
      profileComplete: Boolean(firstName && lastName),
      lastLogin: now,
      createdAt: now,
      updatedAt: now,
      profile: {
        firstName,
        lastName,
        displayName,
        phone: phoneRaw ? encryptPHI(String(phoneRaw)) : undefined,
        dateOfBirth: dobRaw ? encryptPHI(String(dobRaw)) : undefined,
        timezone: patientData.profile?.timezone || undefined,
        sex: patientData.profile?.sex || undefined,
      },
    };

    await setDoc(doc(db, "users", firebaseUser.uid), userDoc);

    console.log("✅ Created user profile in Firestore");

    // Link the patient record to this Firebase user
    await updateDoc(patientDoc.ref, {
      userId: firebaseUser.uid,
      updatedAt: Timestamp.now(),
    });

    console.log("✅ Linked patient record to Firebase user");
    console.log("🎉 Patient user created successfully!");

    return {
      uid: firebaseUser.uid,
      email: email.toLowerCase(),
      role: "patient" as const,
      profile: { firstName, lastName },
    };
  } catch (error) {
    console.error("❌ Error creating patient user:", error);
    throw error;
  }
}

/**
 * Create an admin user for testing
 */
export async function createAdminUser() {
  try {
    console.log("👤 Creating admin user...");

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      config.app.infoEmail,
      "admin123"
    );
    const firebaseUser = userCredential.user;

    console.log("✅ Created Firebase user:", firebaseUser.uid);

    // Create user profile in Firestore
    await setDoc(doc(db, "users", firebaseUser.uid), {
      email: config.app.infoEmail,
      role: "admin",
      profile: {
        firstName: "Admin",
        lastName: "User",
      },
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log("✅ Created admin profile in Firestore");
    console.log("🎉 Admin user created successfully!");

    return {
      uid: firebaseUser.uid,
      email: config.app.infoEmail,
      role: "admin",
    };
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    if ((error as any).code === "auth/email-already-in-use") {
      console.log("ℹ️ Admin user already exists - you can try logging in");
      return { email: config.app.infoEmail, message: "User already exists" };
    }
    throw error;
  }
}

/**
 * Create a user with specified role (admin, doctor, patient)
 */
export async function createUser(
  email: string,
  password: string,
  role: "admin" | "doctor" | "patient",
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    specialty?: string; // For doctors
    dateOfBirth?: Date; // For patients
  }
) {
  try {
    console.log(`👤 Creating ${role} user for:`, email);

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const firebaseUser = userCredential.user;

    console.log("✅ Created Firebase user:", firebaseUser.uid);

    const now = Timestamp.now();
    const displayName = `${profile.firstName} ${profile.lastName}`.trim();

    // Create user profile in Firestore (normalized schema)
    const userData: any = {
      userId: firebaseUser.uid,
      email: email.toLowerCase(),
      role: role,
      isActive: true,
      emailVerified: Boolean(firebaseUser.emailVerified),
      profileComplete: Boolean(profile.firstName && profile.lastName),
      lastLogin: now,
      createdAt: now,
      updatedAt: now,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        displayName,
        phone: profile.phone ? encryptPHI(profile.phone) : undefined,
      },
    };

    // Add role-specific fields
    if (role === "doctor" && profile.specialty) {
      userData.profile.specialty = profile.specialty;
    }

    if (role === "patient" && profile.dateOfBirth) {
      userData.profile.dateOfBirth = encryptPHI(
        profile.dateOfBirth.toISOString().slice(0, 10)
      );
    }

    await setDoc(doc(db, "users", firebaseUser.uid), userData);

    console.log(`✅ Created ${role} profile in Firestore`);

    // For patients, try to find and link existing patient record
    if (role === "patient") {
      try {
        const patientsQuery = query(
          collection(db, "patients"),
          where("profile.email", "==", email)
        );

        const patientsSnapshot = await getDocs(patientsQuery);

        if (!patientsSnapshot.empty) {
          const patientDoc = patientsSnapshot.docs[0];
          await updateDoc(patientDoc.ref, {
            userId: firebaseUser.uid,
            updatedAt: Timestamp.now(),
          });
          console.log("✅ Linked patient record to Firebase user");
        }
      } catch (linkError) {
        console.warn("⚠️ Could not link patient record:", linkError);
      }
    }

    console.log(
      `🎉 ${
        role.charAt(0).toUpperCase() + role.slice(1)
      } user created successfully!`
    );

    return {
      uid: firebaseUser.uid,
      email: email.toLowerCase(),
      role: role,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
      },
    };
  } catch (error) {
    console.error(`❌ Error creating ${role} user:`, error);
    throw error;
  }
}

/**
 * Create a doctor user
 */
export async function createDoctorUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  specialty: string,
  phone?: string
) {
  return createUser(email, password, "doctor", {
    firstName,
    lastName,
    phone,
    specialty,
  });
}

/**
 * Create an admin user
 */
export async function createAdminUserWithDetails(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone?: string
) {
  return createUser(email, password, "admin", {
    firstName,
    lastName,
    phone,
  });
}

/**
 * Helper function to create test patient users for all sample patients
 */
export async function createAllTestPatientUsers() {
  const testUsers = [
    { email: "sarah.johnson@email.com", password: "patient123" },
    { email: "michael.chen@email.com", password: "patient123" },
    { email: "emily.rodriguez@email.com", password: "patient123" },
  ];

  const results = [];

  for (const { email, password } of testUsers) {
    try {
      const result = await createPatientUser(email, password);
      results.push(result);
      console.log(`✅ Created user for ${email}`);
    } catch (error) {
      console.error(`❌ Failed to create user for ${email}:`, error);
      results.push({ email, error: (error as Error).message });
    }
  }

  return results;
}
