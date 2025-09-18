import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User, UserRole } from "@/types/auth";
import { config } from "@/lib/config";
import { parseDateOfBirth } from "./patients";

/**
 * Fetch all users from Firebase Firestore
 */
export async function getAllUsers(limitCount: number = 50): Promise<User[]> {
  try {
    console.log("👥 Fetching all users, limit:", limitCount);
    const usersQuery = query(
      collection(db, "users"),
      orderBy("profile.lastName"),
      limit(limitCount)
    );

    console.log("📊 Executing getAllUsers query...");
    const snapshot = await getDocs(usersQuery);
    console.log("📋 getAllUsers query results:", snapshot.size, "documents");
    const users: User[] = [];

    snapshot.forEach((doc) => {
      console.log("📄 Found user document:", doc.id, doc.data());
      users.push(convertFirestoreToUser(doc.id, doc.data()));
    });

    console.log("✅ Returning", users.length, "users");
    return users;
  } catch (error) {
    console.error("❌ Error fetching all users:", error);
    console.log("🔄 Falling back to mock data");
    return getFallbackUsers();
  }
}

/**
 * Search users by name, email, or role
 */
export async function searchUsers(
  searchTerm: string,
  limitCount: number = 20
): Promise<User[]> {
  try {
    console.log("🔍 Starting user search for:", searchTerm);

    if (!searchTerm.trim()) {
      console.log("📋 Empty search term, fetching all users");
      return await getAllUsers(limitCount);
    }

    const users: User[] = [];
    const searchLower = searchTerm.toLowerCase();
    console.log("🔎 Search term (lowercase):", searchLower);

    // Search by email (exact match)
    if (searchTerm.includes("@")) {
      console.log("📧 Searching by email:", searchTerm.toLowerCase());
      const emailQuery = query(
        collection(db, "users"),
        where("email", "==", searchTerm.toLowerCase()),
        limit(limitCount)
      );
      console.log("📊 Executing email query...");
      const emailSnapshot = await getDocs(emailQuery);
      console.log("📋 Email query results:", emailSnapshot.size, "documents");
      emailSnapshot.forEach((doc) => {
        console.log("📄 Found email document:", doc.id, doc.data());
        users.push(convertFirestoreToUser(doc.id, doc.data()));
      });
    }

    // Search by role
    if (["admin", "doctor", "patient"].includes(searchLower)) {
      console.log("👤 Searching by role:", searchLower);
      const roleQuery = query(
        collection(db, "users"),
        where("role", "==", searchLower),
        limit(limitCount)
      );
      console.log("📊 Executing role query...");
      const roleSnapshot = await getDocs(roleQuery);
      console.log("📋 Role query results:", roleSnapshot.size, "documents");
      roleSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (!users.find((u) => u.id === doc.id)) {
          console.log("📄 Found role document:", doc.id, userData);
          users.push(convertFirestoreToUser(doc.id, userData));
        }
      });
    }

    // If no specific searches, do a general search through all users
    if (users.length === 0) {
      console.log("🔍 Performing general search through all users");
      const allUsersQuery = query(
        collection(db, "users"),
        limit(100) // Get more for client-side filtering
      );
      const allSnapshot = await getDocs(allUsersQuery);
      allSnapshot.forEach((doc) => {
        const data = doc.data();
        if (
          (data.profile?.firstName || "").toLowerCase().includes(searchLower) ||
          (data.profile?.lastName || "").toLowerCase().includes(searchLower) ||
          (data.email || "").toLowerCase().includes(searchLower)
        ) {
          users.push(convertFirestoreToUser(doc.id, data));
        }
      });
    }

    console.log("🎯 Final search results:", users.length, "users found");
    return users.slice(0, limitCount);
  } catch (error) {
    console.error("❌ Error searching users:", error);
    console.log("🔄 Falling back to mock data due to error");
    return getFallbackUsers().filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      const fullName =
        `${user.profile.firstName} ${user.profile.lastName}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower)
      );
    });
  }
}

/**
 * Convert Firestore document data to User type
 */
function convertFirestoreToUser(id: string, data: any): User {
  return {
    id,
    email: data.email || "",
    role: data.role || UserRole.PATIENT,
    profile: {
      firstName: data.profile?.firstName || "",
      lastName: data.profile?.lastName || "",
      phone: data.profile?.phone || "",
      dateOfBirth: parseDateOfBirth(data.profile?.dateOfBirth),
      address: {
        street: data.profile?.address?.street || "",
        city: data.profile?.address?.city || "",
        state: data.profile?.address?.state || "",
        zipCode: data.profile?.address?.zipCode || "",
        country: data.profile?.address?.country || "US",
      },
    },
    isActive: data.isActive !== false,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    lastLogin: data.lastLoginAt?.toDate?.() || null,
  };
}

/**
 * Fallback users for offline/development mode
 */
function getFallbackUsers(): User[] {
  return [
    {
      id: "user-admin-1",
      email: config.app.infoEmail,
      role: UserRole.ADMIN,
      profile: {
        firstName: "John",
        lastName: "Administrator",
        phone: "+1-555-0101",
        dateOfBirth: new Date("1980-01-15"),
        address: {
          street: "123 Admin St",
          city: "San Francisco",
          state: "CA",
          zipCode: "94105",
          country: "US",
        },
      },
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-15"),
      lastLogin: new Date("2024-01-15T10:30:00"),
    },
    {
      id: "user-doctor-1",
      email: "dr.smith@headachemd.org",
      role: UserRole.DOCTOR,
      profile: {
        firstName: "Sarah",
        lastName: "Smith",
        phone: "+1-555-0102",
        dateOfBirth: new Date("1975-05-20"),
        address: {
          street: "456 Medical Ave",
          city: "San Francisco",
          state: "CA",
          zipCode: "94105",
          country: "US",
        },
      },
      isActive: true,
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-14"),
      lastLogin: new Date("2024-01-14T14:20:00"),
    },
    {
      id: "user-doctor-2",
      email: "dr.johnson@headachemd.org",
      role: UserRole.DOCTOR,
      profile: {
        firstName: "Michael",
        lastName: "Johnson",
        phone: "+1-555-0103",
        dateOfBirth: new Date("1978-09-10"),
        address: {
          street: "789 Health Blvd",
          city: "San Francisco",
          state: "CA",
          zipCode: "94105",
          country: "US",
        },
      },
      isActive: true,
      createdAt: new Date("2024-01-03"),
      updatedAt: new Date("2024-01-13"),
      lastLogin: new Date("2024-01-13T09:15:00"),
    },
    {
      id: "user-patient-1",
      email: "patient1@example.com",
      role: UserRole.PATIENT,
      profile: {
        firstName: "Emily",
        lastName: "Davis",
        phone: "+1-555-0201",
        dateOfBirth: new Date("1990-03-25"),
        address: {
          street: "321 Patient Ln",
          city: "Oakland",
          state: "CA",
          zipCode: "94601",
          country: "US",
        },
      },
      isActive: true,
      createdAt: new Date("2024-01-05"),
      updatedAt: new Date("2024-01-12"),
      lastLogin: new Date("2024-01-12T16:45:00"),
    },
    {
      id: "user-patient-2",
      email: "patient2@example.com",
      role: UserRole.PATIENT,
      profile: {
        firstName: "Robert",
        lastName: "Wilson",
        phone: "+1-555-0202",
        dateOfBirth: new Date("1985-11-08"),
        address: {
          street: "654 Care St",
          city: "Berkeley",
          state: "CA",
          zipCode: "94702",
          country: "US",
        },
      },
      isActive: false,
      createdAt: new Date("2024-01-06"),
      updatedAt: new Date("2024-01-11"),
      lastLogin: new Date("2024-01-10T11:30:00"),
    },
  ];
}
