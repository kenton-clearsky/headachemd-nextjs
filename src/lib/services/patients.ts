import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  Patient,
  AllergySeverity,
  SmokingStatus,
  AlcoholUse,
  HeadacheFrequency,
  HeadacheLocation,
} from "@/types/medical";
import { Gender } from "@/types/auth";

/**
 * Verification function to check Firebase connection and collections
 */
export async function verifyFirebaseConnection() {
  try {
    console.log("🔍 Verifying Firebase connection...");
    console.log("📋 Project ID from config:", db.app.options.projectId);

    // Check if we can access the patients collection
    const patientsRef = collection(db, "patients");
    const snapshot = await getDocs(query(patientsRef, limit(1)));

    console.log("✅ Firebase connection verified");
    console.log("📊 Patients collection accessible:", !snapshot.empty);
    console.log("📈 Sample document exists:", snapshot.size > 0);

    // Also check other collections
    const collections = ["users", "appointments", "treatments"];
    for (const collectionName of collections) {
      try {
        const collRef = collection(db, collectionName);
        const collSnapshot = await getDocs(query(collRef, limit(1)));
        console.log(
          `📋 ${collectionName} collection:`,
          collSnapshot.size > 0 ? "Has data" : "Empty"
        );
      } catch (error) {
        console.log(
          `❌ ${collectionName} collection:`,
          "Access denied or error"
        );
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Firebase connection verification failed:", error);
    return false;
  }
}

/**
 * Search for patients by name, email, or MRN
 */
export async function searchPatients(
  searchTerm: string,
  limitCount: number = 20
): Promise<Patient[]> {
  try {
    console.log("🔍 Starting patient search for:", searchTerm);
    console.log("🔥 Firebase db object:", db);

    if (!searchTerm.trim()) {
      console.log("📋 Empty search term, fetching all patients");
      return await getAllPatients(limitCount);
    }

    const patients: Patient[] = [];
    const searchLower = searchTerm.toLowerCase();
    console.log("🔎 Search term (lowercase):", searchLower);

    // Search by MRN (exact match)
    if (searchTerm.startsWith("MRN") || /^\d+$/.test(searchTerm)) {
      console.log("🏥 Searching by MRN:", searchTerm.toUpperCase());
      const mrnQuery = query(
        collection(db, "patients"),
        where("mrn", "==", searchTerm.toUpperCase()),
        limit(limitCount)
      );
      console.log("📊 Executing MRN query...");
      const mrnSnapshot = await getDocs(mrnQuery);
      console.log("📋 MRN query results:", mrnSnapshot.size, "documents");
      mrnSnapshot.forEach((doc) => {
        console.log("📄 Found MRN document:", doc.id, doc.data());
        patients.push(convertFirestoreToPatient(doc.id, doc.data()));
      });
    }

    // Search by email (exact match)
    if (searchTerm.includes("@")) {
      const emailQuery = query(
        collection(db, "patients"),
        where("profile.email", "==", searchTerm.toLowerCase()),
        limit(limitCount)
      );
      const emailSnapshot = await getDocs(emailQuery);
      emailSnapshot.forEach((doc) => {
        const patient = convertFirestoreToPatient(doc.id, doc.data());
        if (!patients.find((p) => p.id === patient.id)) {
          patients.push(patient);
        }
      });
    }

    // For name searches, we need to get all patients and filter client-side
    // (Firestore doesn't support case-insensitive text search natively)
    if (patients.length === 0) {
      const allPatientsQuery = query(
        collection(db, "patients"),
        orderBy("profile.lastName"),
        limit(100) // Get more for name searching
      );
      const allSnapshot = await getDocs(allPatientsQuery);

      allSnapshot.forEach((doc) => {
        const data = doc.data();
        const fullName = `${data.profile?.firstName || ""} ${
          data.profile?.lastName || ""
        }`.toLowerCase();

        if (
          fullName.includes(searchLower) ||
          (data.profile?.firstName || "").toLowerCase().includes(searchLower) ||
          (data.profile?.lastName || "").toLowerCase().includes(searchLower)
        ) {
          patients.push(convertFirestoreToPatient(doc.id, data));
        }
      });
    }

    console.log("🎯 Final search results:", patients.length, "patients found");
    return patients.slice(0, limitCount);
  } catch (error) {
    console.error("❌ Error searching patients:", error);
    console.log("🔄 Falling back to mock data due to error");
    return getFallbackPatients().filter((patient) => {
      const searchLower = searchTerm.toLowerCase();
      const fullName =
        `${patient.profile.firstName} ${patient.profile.lastName}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        patient.mrn.toLowerCase().includes(searchLower) ||
        patient.profile.email.toLowerCase().includes(searchLower)
      );
    });
  }
}

/**
 * Get all patients with pagination
 */
export async function getAllPatients(
  limitCount: number = 20
): Promise<Patient[]> {
  try {
    console.log("👥 Fetching all patients, limit:", limitCount);
    const patientsQuery = query(
      collection(db, "patients"),
      orderBy("profile.lastName"),
      limit(limitCount)
    );

    console.log("📊 Executing getAllPatients query...");
    const snapshot = await getDocs(patientsQuery);
    console.log("📋 getAllPatients query results:", snapshot.size, "documents");
    const patients: Patient[] = [];

    snapshot.forEach((doc) => {
      console.log("📄 Found patient document:", doc.id, doc.data());
      patients.push(convertFirestoreToPatient(doc.id, doc.data()));
    });

    console.log("✅ Returning", patients.length, "patients");
    return patients;
  } catch (error) {
    console.error("❌ Error fetching all patients:", error);
    console.log("🔄 Falling back to mock data");
    return getFallbackPatients();
  }
}

/**
 * Get a specific patient by ID
 */
export async function getPatientById(
  patientId: string
): Promise<Patient | null> {
  try {
    const patientDoc = await getDoc(doc(db, "patients", patientId));

    if (patientDoc.exists()) {
      return convertFirestoreToPatient(patientDoc.id, patientDoc.data());
    }

    return null;
  } catch (error) {
    console.error("Error fetching patient by ID:", error);
    // Return fallback patient if ID matches
    const fallbackPatients = getFallbackPatients();
    return fallbackPatients.find((p) => p.id === patientId) || null;
  }
}

/**
 * Get patients assigned to a specific doctor
 */
export async function getPatientsByDoctor(
  doctorId: string,
  limitCount: number = 50
): Promise<Patient[]> {
  try {
    const patientsQuery = query(
      collection(db, "patients"),
      where("assignedDoctors", "array-contains", doctorId),
      orderBy("profile.lastName"),
      limit(limitCount)
    );

    const snapshot = await getDocs(patientsQuery);
    const patients: Patient[] = [];

    snapshot.forEach((doc) => {
      patients.push(convertFirestoreToPatient(doc.id, doc.data()));
    });

    return patients;
  } catch (error) {
    console.error("Error fetching patients by doctor:", error);
    return getFallbackPatients();
  }
}

/**
 * Convert Firestore data to Patient type
 */
/**
 * Helper function to parse dateOfBirth from various formats
 * Exported for use in other services
 */
export function parseDateOfBirth(dateValue: any): Date {
  // If it's a Firestore Timestamp
  if (dateValue?.toDate) {
    return dateValue.toDate();
  }

  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }

  // If it's a string (YYYY-MM-DD format or other)
  if (typeof dateValue === "string") {
    // Handle YYYY-MM-DD format specifically
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      const [year, month, day] = dateValue.split("-").map(Number);
      return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
    }

    // Handle other string formats
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  // Fallback to current date if parsing fails
  console.warn(
    "Could not parse dateOfBirth:",
    dateValue,
    "using current date as fallback"
  );
  return new Date();
}

/**
 * Format a Date object into a user-friendly display format
 */
export function formatDateOfBirth(date: Date): string {
  try {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.warn("Error formatting date:", error);
    return "Invalid Date";
  }
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return Math.max(0, age);
}

function convertFirestoreToPatient(id: string, data: any): Patient {
  return {
    id,
    userId: data.userId || "",
    mrn: data.mrn || "",
    profile: {
      firstName: data.profile?.firstName || "",
      lastName: data.profile?.lastName || "",
      dateOfBirth: parseDateOfBirth(data.profile?.dateOfBirth),
      gender: data.profile?.gender || "other",
      phone: data.profile?.phone || "",
      email: data.profile?.email || "",
      address: data.profile?.address || {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      emergencyContact: data.profile?.emergencyContact || {
        name: "",
        relationship: "",
        phone: "",
      },
      allergies: data.profile?.allergies || [],
      medications: data.profile?.medications || [],
      insurance: data.profile?.insurance,
    },
    medicalHistory: data.medicalHistory || {
      chiefComplaint: "",
      historyOfPresentIllness: "",
      pastMedicalHistory: [],
      familyHistory: [],
      socialHistory: {
        smokingStatus: "never",
        alcoholUse: "none",
        occupation: "",
        exerciseFrequency: "",
        stressLevel: 5,
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
        frequency: "occasional",
        duration: "",
        intensity: 5,
        location: [],
        triggers: [],
        relievingFactors: [],
        associatedSymptoms: [],
        previousTreatments: [],
        familyHistoryOfHeadaches: false,
      },
    },
    currentTreatments: data.currentTreatments || [],
    appointments: data.appointments || [],
    dailyUpdates: data.dailyUpdates || [],
    isActive: data.isActive !== false,
    assignedDoctors: data.assignedDoctors || [],
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

/**
 * Fallback patient data for development/offline mode
 */
function getFallbackPatients(): Patient[] {
  return [
    {
      id: "1",
      userId: "user-1",
      mrn: "MRN001",
      profile: {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@email.com",
        phone: "(555) 123-4567",
        dateOfBirth: new Date("1985-03-15"),
        gender: Gender.FEMALE,
        address: {
          street: "123 Main St",
          city: "Houston",
          state: "TX",
          zipCode: "77001",
          country: "USA",
        },
        emergencyContact: {
          name: "John Johnson",
          relationship: "spouse",
          phone: "(555) 123-4568",
        },
        allergies: [
          {
            allergen: "Penicillin",
            reaction: "Rash",
            severity: AllergySeverity.MODERATE,
          },
        ],
        medications: [
          {
            name: "Sumatriptan",
            dosage: "50mg",
            frequency: "As needed",
            startDate: new Date("2023-06-15"),
            prescribedBy: "Dr. Blake",
            indication: "Migraine",
            isActive: true,
          },
        ],
      },
      medicalHistory: {
        chiefComplaint: "Chronic migraines",
        historyOfPresentIllness:
          "Patient reports severe headaches 3-4 times per week",
        pastMedicalHistory: ["Migraine"],
        familyHistory: ["Migraine (mother)"],
        socialHistory: {
          smokingStatus: SmokingStatus.NEVER,
          alcoholUse: AlcoholUse.OCCASIONAL,
          occupation: "Software Engineer",
          exerciseFrequency: "3 times per week",
          stressLevel: 6,
        },
        reviewOfSystems: {
          constitutional: false,
          cardiovascular: false,
          respiratory: false,
          gastrointestinal: false,
          genitourinary: false,
          musculoskeletal: false,
          neurological: true,
          psychiatric: false,
          endocrine: false,
          hematologic: false,
          allergic: true,
        },
        headacheHistory: {
          onsetAge: 16,
          frequency: HeadacheFrequency.WEEKLY,
          duration: "4-6 hours",
          intensity: 8,
          location: [HeadacheLocation.TEMPORAL, HeadacheLocation.UNILATERAL],
          triggers: ["stress", "lack of sleep"],
          relievingFactors: ["dark room", "sleep"],
          associatedSymptoms: ["nausea", "photophobia"],
          previousTreatments: [
            { treatment: "Ibuprofen", duration: "2 years", effectiveness: 4 },
          ],
          familyHistoryOfHeadaches: true,
        },
      },
      currentTreatments: [],
      appointments: [],
      dailyUpdates: [],
      isActive: true,
      assignedDoctors: ["doctor-1"],
      createdAt: new Date("2023-06-15"),
      updatedAt: new Date("2024-01-10"),
    },
    {
      id: "2",
      userId: "user-2",
      mrn: "MRN002",
      profile: {
        firstName: "Mike",
        lastName: "Chen",
        email: "mike.chen@email.com",
        phone: "(555) 234-5678",
        dateOfBirth: new Date("1978-11-22"),
        gender: Gender.MALE,
        address: {
          street: "456 Oak Ave",
          city: "Houston",
          state: "TX",
          zipCode: "77002",
          country: "USA",
        },
        emergencyContact: {
          name: "Lisa Chen",
          relationship: "spouse",
          phone: "(555) 234-5679",
        },
        allergies: [],
        medications: [
          {
            name: "Topiramate",
            dosage: "25mg",
            frequency: "Twice daily",
            startDate: new Date("2023-08-20"),
            prescribedBy: "Dr. Blake",
            indication: "Headache prevention",
            isActive: true,
          },
        ],
      },
      medicalHistory: {
        chiefComplaint: "Tension headaches",
        historyOfPresentIllness: "Patient reports daily tension headaches",
        pastMedicalHistory: ["Tension Headache"],
        familyHistory: [],
        socialHistory: {
          smokingStatus: SmokingStatus.NEVER,
          alcoholUse: AlcoholUse.NONE,
          occupation: "Accountant",
          exerciseFrequency: "Rarely",
          stressLevel: 7,
        },
        reviewOfSystems: {
          constitutional: false,
          cardiovascular: false,
          respiratory: false,
          gastrointestinal: false,
          genitourinary: false,
          musculoskeletal: true,
          neurological: true,
          psychiatric: false,
          endocrine: false,
          hematologic: false,
          allergic: false,
        },
        headacheHistory: {
          onsetAge: 25,
          frequency: HeadacheFrequency.DAILY,
          duration: "2-3 hours",
          intensity: 6,
          location: [HeadacheLocation.FRONTAL, HeadacheLocation.BILATERAL],
          triggers: ["stress", "computer work"],
          relievingFactors: ["rest", "massage"],
          associatedSymptoms: ["neck tension"],
          previousTreatments: [
            {
              treatment: "Acetaminophen",
              duration: "1 year",
              effectiveness: 5,
            },
          ],
          familyHistoryOfHeadaches: false,
        },
      },
      currentTreatments: [],
      appointments: [],
      dailyUpdates: [],
      isActive: true,
      assignedDoctors: ["doctor-1"],
      createdAt: new Date("2023-08-20"),
      updatedAt: new Date("2024-01-08"),
    },
    {
      id: "3",
      userId: "user-3",
      mrn: "MRN003",
      profile: {
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@email.com",
        phone: "(555) 345-6789",
        dateOfBirth: new Date("1992-07-08"),
        gender: Gender.FEMALE,
        address: {
          street: "789 Pine St",
          city: "Houston",
          state: "TX",
          zipCode: "77003",
          country: "USA",
        },
        emergencyContact: {
          name: "Robert Davis",
          relationship: "father",
          phone: "(555) 345-6790",
        },
        allergies: [],
        medications: [],
      },
      medicalHistory: {
        chiefComplaint: "New onset headaches",
        historyOfPresentIllness:
          "Patient reports new headaches starting 2 months ago",
        pastMedicalHistory: [],
        familyHistory: [],
        socialHistory: {
          smokingStatus: SmokingStatus.NEVER,
          alcoholUse: AlcoholUse.OCCASIONAL,
          occupation: "Teacher",
          exerciseFrequency: "4 times per week",
          stressLevel: 4,
        },
        reviewOfSystems: {
          constitutional: false,
          cardiovascular: false,
          respiratory: false,
          gastrointestinal: false,
          genitourinary: false,
          musculoskeletal: false,
          neurological: true,
          psychiatric: false,
          endocrine: false,
          hematologic: false,
          allergic: false,
        },
        headacheHistory: {
          onsetAge: 31,
          frequency: HeadacheFrequency.WEEKLY,
          duration: "2-4 hours",
          intensity: 7,
          location: [HeadacheLocation.FRONTAL],
          triggers: ["bright lights", "stress"],
          relievingFactors: ["rest", "cold compress"],
          associatedSymptoms: ["sensitivity to light"],
          previousTreatments: [],
          familyHistoryOfHeadaches: false,
        },
      },
      currentTreatments: [],
      appointments: [],
      dailyUpdates: [],
      isActive: true,
      assignedDoctors: ["doctor-1"],
      createdAt: new Date("2024-01-05"),
      updatedAt: new Date("2024-01-13"),
    },
  ];
}
