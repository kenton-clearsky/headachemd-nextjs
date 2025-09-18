"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "@/types/auth";
import { authService } from "@/lib/auth/auth";
import { config } from "@/lib/config";
import { syncPatientOnLogin } from "@/lib/services/patient-sync";

// Get authentication configuration from centralized service
const useMockAuth = config.skipAuthInDev;
const forceRealAuth = config.forceRealAuth;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isDevMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log(
          "🔐 Auth mode:",
          useMockAuth ? "Mock Auth (Dev Mode)" : "Real Firebase Auth"
        );
        console.log("🔧 Dev mode enabled:", config.enableDevMode);
        console.log("🔒 Skip auth in dev:", config.skipAuthInDev);

        if (useMockAuth) {
          // Auto-login with mock admin user in development
          const mockUser: User = {
            id: "dev-user-1",
            email: config.app.infoEmail,
            role: UserRole.ADMIN,
            profile: {
              firstName: "Demo",
              lastName: "Admin",
              title: "Development Administrator",
            },
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setUser(mockUser);
          // Set role cookie for middleware
          document.cookie = `user-role=${mockUser.role}; path=/; max-age=86400`; // 24 hours
          console.log("✅ Mock user authenticated:", mockUser.email);
        } else {
          // Wait for Firebase to restore the session after refresh
          await authService.waitForInitialAuthState();
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);

          // Set role cookie for middleware
          if (currentUser) {
            document.cookie = `user-role=${currentUser.role}; path=/; max-age=86400`; // 24 hours
            await syncPatientOnLogin(currentUser);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<User> => {
    if (useMockAuth) {
      console.log("🔐 Mock sign-in successful");
      if (!user) {
        // Re-authenticate mock user if needed
        const mockUser: User = {
          id: "dev-user-1",
          email: config.app.infoEmail,
          role: UserRole.ADMIN,
          profile: {
            firstName: "Demo",
            lastName: "Admin",
            title: "Development Administrator",
          },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(mockUser);
        document.cookie = `user-role=${mockUser.role}; path=/; max-age=86400`; // 24 hours
        return mockUser;
      }
      return user;
    }

    setLoading(true);
    try {
      const user = await authService.signIn(
        { email, password },
        "client-ip", // This would be replaced with actual IP detection
        navigator.userAgent
      );
      setUser(user);
      
      // Set role cookie for middleware
      document.cookie = `user-role=${user.role}; path=/; max-age=86400`; // 24 hours

      // Sync patient data if user is a patient
      await syncPatientOnLogin(user);

      return user;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    if (useMockAuth) {
      console.log("🔐 Mock sign-out successful");
      setUser(null);
      // Clear role cookie
      document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      return;
    }

    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      // Clear role cookie
      document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isDevMode: config.enableDevMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
