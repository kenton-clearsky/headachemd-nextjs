"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function DashboardRouter() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      window.location.href = "/login";
      return;
    }

    // Route based on user role
    switch (user.role) {
      case "admin":
      case "admin-test":
      case "doctor":
      case "nurse":
      case "staff":
        window.location.href = "/admin"; // Use your existing admin page
        break;
      case "patient":
        window.location.href = "/patient";
        break;
      default:
        window.location.href = "/login?error=invalid_role";
        break;
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Redirecting to your dashboard...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}
