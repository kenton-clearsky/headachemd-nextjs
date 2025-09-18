"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  Brain,
  Heart,
} from "lucide-react";
import { Patient } from "@/types/medical";
import { UserLogData, UserLogFeeling } from "@/types/user-logs";
import { getPatientById } from "@/lib/services/patients";
import { getUserLogs } from "@/lib/services/user-logs";
import { PatientHistoryDashboard } from "@/components/patient/PatientHistoryDashboard";

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [userLogs, setUserLogs] = useState<UserLogData[]>([]);
  const [feelings, setFeelings] = useState<UserLogFeeling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch patient data
      const patientData = await getPatientById(patientId);
      if (!patientData) {
        setError("Patient not found");
        return;
      }
      setPatient(patientData);

      // Fetch user logs using the patient's userId
      console.log("👤 Patient data:", { id: patientData.id, userId: patientData.userId });
      
      // Use userId if available, otherwise try patient ID as fallback
      const userIdForLogs = patientData.userId && patientData.userId.trim() !== '' 
        ? patientData.userId 
        : patientData.id;
      
      console.log("🔍 Using userId for logs:", userIdForLogs);
      
      try {
        const { dailyLogs, feelingsLogs } = await getUserLogs(userIdForLogs);
        setUserLogs(dailyLogs);
        setFeelings(feelingsLogs);
      } catch (logsError) {
        console.warn("⚠️ Failed to load user logs:", logsError);
        // Continue without logs rather than failing the whole page
        setUserLogs([]);
        setFeelings([]);
      }
    } catch (error) {
      console.error("Failed to load patient data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load patient data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={handleGoBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={loadPatientData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Patient Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The patient you're looking for could not be found.
            </p>
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button onClick={handleGoBack} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {patient.profile.firstName} {patient.profile.lastName}
                </h1>
                <p className="text-sm text-gray-500">
                  MRN: {patient.mrn} • ID: {patient.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={patient.isActive ? "default" : "secondary"}>
                {patient.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Patient Info Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Age</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date().getFullYear() -
                  new Date(patient.profile.dateOfBirth).getFullYear()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userLogs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Feelings Logged
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feelings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Update</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userLogs.length > 0
                  ? new Date(
                      Math.max(
                        ...userLogs.map((log) => new Date(log.date).getTime())
                      )
                    ).toLocaleDateString()
                  : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient History Dashboard */}
        <PatientHistoryDashboard
          patient={patient}
          userLogs={userLogs}
          feelings={feelings}
        />
      </div>
    </div>
  );
}
