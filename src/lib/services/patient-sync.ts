import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { User, Gender } from "@/types/auth";
import {
  Patient,
  SmokingStatus,
  AlcoholUse,
  HeadacheFrequency,
} from "@/types/medical";
import { encryptPHI } from "@/lib/hipaa/encryption";

/**
 * Sync patient data when a patient user logs in
 * This ensures the patient appears in the admin dashboard for easy access
 */
export async function syncPatientOnLogin(user: User): Promise<void> {
  try {
    // Only sync for patient users
    if (user.role !== "patient") {
      return;
    }

    console.log("🔄 Syncing patient data for login:", user.email);

    // Check if patient record already exists and is linked
    const existingPatientQuery = query(
      collection(db, "patients"),
      where("userId", "==", user.id)
    );
    const existingPatientSnapshot = await getDocs(existingPatientQuery);

    if (!existingPatientSnapshot.empty) {
      // Patient record already linked, just update last login
      const patientDoc = existingPatientSnapshot.docs[0];
      await updateDoc(patientDoc.ref, {
        lastLogin: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log("✅ Updated existing patient record with login time");
      return;
    }

    // Look for patient record by email
    const emailPatientQuery = query(
      collection(db, "patients"),
      where("profile.email", "==", user.email)
    );
    const emailPatientSnapshot = await getDocs(emailPatientQuery);

    if (!emailPatientSnapshot.empty) {
      // Link existing patient record to this user
      const patientDoc = emailPatientSnapshot.docs[0];
      await updateDoc(patientDoc.ref, {
        userId: user.id,
        lastLogin: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log("✅ Linked existing patient record to user");
      return;
    }

    // No patient record exists, create a new one
    await createPatientRecordForUser(user);
    console.log("✅ Created new patient record for user");
  } catch (error) {
    console.error("❌ Error syncing patient data:", error);
    // Don't throw error to avoid blocking login
  }
}

/**
 * Create a patient record for a user who doesn't have one
 */
async function createPatientRecordForUser(user: User): Promise<void> {
  const patientData: Partial<Patient> = {
    userId: user.id,
    mrn: await generateMRN(),
    profile: {
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      email: user.email,
      phone: user.profile.phone || "",
      dateOfBirth: user.profile.dateOfBirth || new Date(),
      gender: user.profile.gender || Gender.OTHER,
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA",
      },
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
      },
      allergies: [],
      medications: [],
      insurance: {
        provider: "",
        policyNumber: "",
        groupNumber: "",
        subscriberId: "",
        subscriberName: "",
        relationship: "self",
        effectiveDate: new Date(),
      },
    },
    medicalHistory: {
      chiefComplaint: "",
      historyOfPresentIllness: "",
      pastMedicalHistory: [],
      familyHistory: [],
      socialHistory: {
        smokingStatus: SmokingStatus.NEVER,
        alcoholUse: AlcoholUse.NONE,
        occupation: "",
        exerciseFrequency: "",
        stressLevel: 1,
      },
      reviewOfSystems: {
        constitutional: false,
        cardiovascular: false,
        respiratory: false,
        gastrointestinal: false,
        genitourinary: false,
        musculoskeletal: false,
        neurological: false,
        psychiatric: false,
        endocrine: false,
        hematologic: false,
        allergic: false,
      },
      headacheHistory: {
        onsetAge: 0,
        frequency: HeadacheFrequency.MONTHLY,
        duration: "",
        intensity: 1,
        location: [],
        triggers: [],
        relievingFactors: [],
        associatedSymptoms: [],
        previousTreatments: [],
        familyHistoryOfHeadaches: false,
      },
    },
    isActive: true,
    assignedDoctors: [],
    currentTreatments: [],
    appointments: [],
    dailyUpdates: [],
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Create the patient document with Firestore Timestamps
  const patientRef = doc(collection(db, "patients"));
  const firestoreData = {
    ...patientData,
    lastLogin: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  await setDoc(patientRef, firestoreData);

  console.log("✅ Created patient record:", patientRef.id);
}

/**
 * Generate a unique MRN for new patients
 */
async function generateMRN(): Promise<string> {
  const prefix = "MRN";
  let mrnNumber = Math.floor(Math.random() * 900000) + 100000; // 6-digit number

  // Check if MRN already exists
  while (await checkMRNExists(`${prefix}${mrnNumber}`)) {
    mrnNumber = Math.floor(Math.random() * 900000) + 100000;
  }

  return `${prefix}${mrnNumber}`;
}

/**
 * Check if an MRN already exists in the database
 */
async function checkMRNExists(mrn: string): Promise<boolean> {
  try {
    const mrnQuery = query(collection(db, "patients"), where("mrn", "==", mrn));
    const snapshot = await getDocs(mrnQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking MRN existence:", error);
    return false;
  }
}

/**
 * Get patient data for a logged-in user
 */
export async function getPatientDataForUser(
  userId: string
): Promise<Patient | null> {
  try {
    const patientQuery = query(
      collection(db, "patients"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(patientQuery);

    if (snapshot.empty) {
      return null;
    }

    const patientDoc = snapshot.docs[0];
    const data = patientDoc.data();

    // Convert Firestore data to Patient object
    return {
      id: patientDoc.id,
      ...data,
      profile: {
        ...data.profile,
        dateOfBirth: data.profile?.dateOfBirth?.toDate
          ? data.profile.dateOfBirth.toDate()
          : data.profile?.dateOfBirth,
      },
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastLogin: data.lastLogin?.toDate() || new Date(),
    } as Patient;
  } catch (error) {
    console.error("❌ Error fetching patient data for user:", error);
    return null;
  }
}

/**
 * Update patient last activity for admin tracking
 */
export async function updatePatientActivity(
  userId: string,
  activity: string
): Promise<void> {
  try {
    const patientQuery = query(
      collection(db, "patients"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(patientQuery);

    if (!snapshot.empty) {
      const patientDoc = snapshot.docs[0];
      await updateDoc(patientDoc.ref, {
        lastActivity: activity,
        lastActivityTime: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error("❌ Error updating patient activity:", error);
  }
}
