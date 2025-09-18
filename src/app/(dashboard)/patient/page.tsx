"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Activity,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  LogOut,
  User,
  Pill,
  Target,
  BarChart3,
  FileText,
} from "lucide-react";
import {
  Patient,
  DailyUpdate,
  Treatment,
  Appointment,
  HeadacheFrequency,
  HeadacheLocation,
  SmokingStatus,
  AlcoholUse,
  TreatmentType,
  TreatmentStatus,
  AppointmentType,
  AppointmentStatus,
  MoodLevel,
  FunctionalStatus,
  AllergySeverity,
} from "@/types/medical";
import { Gender } from "@/types/auth";
import {
  getPatientByUserEmail,
  getPatientDailyUpdates,
  getPatientTreatments,
  getPatientAppointments,
} from "@/lib/services/patient-data";
import { getUserLogs } from "@/lib/services/user-logs";
import { UserLogData, UserLogFeeling } from "@/types/user-logs";
import { PainMapVisualization } from "@/components/patient/PainMapVisualization";
import { generatePainHeatmapData } from "@/lib/services/user-logs";

export default function PatientDashboard() {
  const { user, signOut } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userLogs, setUserLogs] = useState<UserLogData[]>([]);
  const [feelings, setFeelings] = useState<UserLogFeeling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Only allow patient role for patient dashboard
    if (!user) {
      console.log("No user found, redirecting to login");
      window.location.href = "/login";
      return;
    }

    if (user.role !== "patient") {
      console.log("User role not authorized for patient dashboard:", user.role);
      window.location.href = "/admin"; // Redirect non-patients to admin
      return;
    }

    loadPatientData();
  }, [user, retryCount]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.email) {
        throw new Error("No user email available");
      }

      console.log("🔍 Loading patient data for:", user.email);

      // Use the patient's own email
      const searchEmail = user.email;

      // Fetch patient data by user email
      const patientData = await getPatientByUserEmail(searchEmail);

      if (!patientData) {
        // If no patient found, create mock data for demo purposes
        console.log("No patient record found, using mock data for demo");
        const mockPatient: Patient = {
          id: "demo-patient-1",
          userId: user.id,
          mrn: "MRN-001",
          profile: {
            firstName: user.profile?.firstName || "Demo",
            lastName: user.profile?.lastName || "Patient",
            dateOfBirth: new Date("1990-01-01"),
            gender: Gender.OTHER,
            phone: "(555) 123-4567",
            email: user.email,
            address: {
              street: "123 Main St",
              city: "Houston",
              state: "TX",
              zipCode: "77001",
              country: "USA",
            },
            emergencyContact: {
              name: "Emergency Contact",
              relationship: "Family",
              phone: "(555) 987-6543",
            },
            allergies: [
              {
                allergen: "None known",
                reaction: "N/A",
                severity: AllergySeverity.MILD,
              },
            ],
            medications: [],
          },
          medicalHistory: {
            chiefComplaint: "Recurrent headaches",
            historyOfPresentIllness:
              "Patient reports chronic headaches for the past 5 years",
            pastMedicalHistory: ["Migraine"],
            familyHistory: [],
            surgicalHistory: [],
            socialHistory: {
              smokingStatus: SmokingStatus.NEVER,
              alcoholUse: AlcoholUse.OCCASIONAL,
              exerciseFrequency: "regular",
              occupation: "Software Engineer",
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
              onsetAge: 25,
              frequency: HeadacheFrequency.WEEKLY,
              duration: "4-6 hours",
              intensity: 7,
              location: [HeadacheLocation.TEMPORAL, HeadacheLocation.FRONTAL],
              triggers: ["stress", "lack of sleep"],
              relievingFactors: ["rest", "medication"],
              associatedSymptoms: ["nausea", "light sensitivity"],
              previousTreatments: [
                {
                  treatment: "ibuprofen",
                  duration: "6 months",
                  effectiveness: 6,
                },
                {
                  treatment: "sumatriptan",
                  duration: "1 year",
                  effectiveness: 8,
                },
              ],
              familyHistoryOfHeadaches: true,
            },
          },
          currentTreatments: [],
          appointments: [],
          dailyUpdates: [],
          isActive: true,
          assignedDoctors: ["dr-blake"],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setPatient(mockPatient);

        // Set mock data for related collections
        setDailyUpdates([
          {
            id: "update-1",
            patientId: "demo-patient-1",
            date: new Date(),
            painLevel: 3,
            headacheFrequency: 1,
            triggers: ["stress"],
            medications: [
              {
                name: "ibuprofen",
                dosage: "400mg",
                timeTaken: new Date(),
                effectiveness: 6,
              },
            ],
            sleepHours: 7,
            stressLevel: 4,
            exerciseMinutes: 30,
            notes: "Mild headache today, managed with rest",
            mood: MoodLevel.GOOD,
            functionalStatus: FunctionalStatus.NORMAL_FUNCTION,
            createdAt: new Date(),
          },
        ]);

        setTreatments([
          {
            id: "treatment-1",
            patientId: "demo-patient-1",
            doctorId: "dr-blake",
            type: TreatmentType.MEDICATION,
            description: "Sumatriptan 50mg as needed for acute migraine",
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            status: TreatmentStatus.ACTIVE,
            notes: "Take at first sign of headache",
            outcomes: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);

        setAppointments([
          {
            id: "appointment-1",
            patientId: "demo-patient-1",
            doctorId: "dr-blake",
            type: AppointmentType.FOLLOW_UP,
            status: AppointmentStatus.SCHEDULED,
            scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            duration: 30,
            location: "Clinic Room 101",
            notes: "Follow-up for migraine treatment",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);

        console.log("✅ Mock patient data loaded successfully");
        return;
      }

      setPatient(patientData);

      // Fetch related data
      const [updatesData, treatmentsData, appointmentsData] = await Promise.all(
        [
          getPatientDailyUpdates(patientData.id),
          getPatientTreatments(patientData.id),
          getPatientAppointments(patientData.id),
        ]
      );

      setDailyUpdates(updatesData);
      setTreatments(treatmentsData);
      setAppointments(appointmentsData);

      // Fetch user logs for pain mapping
      try {
        const userIdForLogs =
          patientData.userId && patientData.userId.trim() !== ""
            ? patientData.userId
            : patientData.id;

        const { dailyLogs, feelingsLogs } = await getUserLogs(userIdForLogs);
        setUserLogs(dailyLogs);
        setFeelings(feelingsLogs);
      } catch (logsError) {
        console.warn("⚠️ Failed to load user logs for pain map:", logsError);
        // Continue without logs - pain map will show no data state
        setUserLogs([]);
        setFeelings([]);
      }

      console.log("✅ Patient data loaded successfully");
    } catch (error) {
      console.error("Failed to load patient data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load patient data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  const submitDailyUpdate = async () => {
    // TODO: Implement daily update submission
    console.log("Submitting daily update...");
    // For now, show a success message
    alert("Daily update submitted successfully!");
  };

  const retryLoadData = () => {
    setRetryCount((prev) => prev + 1);
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
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Error Loading Patient Data
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={retryLoadData} className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              No Patient Record Found
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              We couldn't find a patient record associated with your account (
              {user?.email}).
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Please contact your healthcare provider to link your account to
              your medical records.
            </p>
            <div className="space-y-2">
              <Button
                onClick={retryLoadData}
                variant="outline"
                className="w-full"
              >
                <Activity className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome, {patient.profile.firstName}{" "}
                  {patient.profile.lastName}
                </h1>
                <p className="text-sm text-gray-500">
                  Patient Dashboard • MRN: {patient.mrn}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="text-green-600 border-green-200"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Pain Level
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {dailyUpdates.length > 0
                  ? `${dailyUpdates[0].painLevel}/10`
                  : "No data"}
              </div>
              <p className="text-xs text-muted-foreground">
                {dailyUpdates.length > 0
                  ? `Last updated: ${dailyUpdates[0].date.toLocaleDateString()}`
                  : "No recent updates"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Next Appointment
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.length > 0
                  ? appointments[0].scheduledAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "None"}
              </div>
              <p className="text-xs text-muted-foreground">
                {appointments.length > 0
                  ? `${appointments[0].type.replace("_", " ")} appointment`
                  : "No upcoming appointments"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Treatment Progress
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">75%</div>
              <p className="text-xs text-muted-foreground">+15% improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Daily Updates
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28/30</div>
              <p className="text-xs text-muted-foreground">93% compliance</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-full overflow-hidden">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {/* Daily Update Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Daily Health Update
                  </span>
                  <Button onClick={submitDailyUpdate} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Update
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">
                        Pain Level (1-10)
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={30} className="flex-1" />
                        <span className="text-sm font-medium">3</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Sleep Hours</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={80} className="flex-1" />
                        <span className="text-sm font-medium">8</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">
                        Stress Level (1-10)
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={40} className="flex-1" />
                        <span className="text-sm font-medium">4</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Exercise (minutes)
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={60} className="flex-1" />
                        <span className="text-sm font-medium">30</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                      className="w-full mt-1 p-2 border rounded-md"
                      placeholder="How are you feeling today?"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pain Location Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Pain Location History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userLogs.length > 0 ? (
                  <PainMapVisualization
                    heatmapData={generatePainHeatmapData(userLogs)}
                    logs={userLogs}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Pain Data
                    </h3>
                    <p className="text-gray-500">
                      Start logging your pain locations to see visual patterns
                      over time.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Treatment Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Current Treatment Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Topiramate",
                      dosage: "50mg twice daily",
                      status: "active",
                      progress: 75,
                      nextReview: "2024-01-20",
                    },
                    {
                      name: "Physical Therapy",
                      frequency: "3x per week",
                      status: "active",
                      progress: 60,
                      nextReview: "2024-01-25",
                    },
                  ].map((treatment, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{treatment.name}</h4>
                          <p className="text-sm text-gray-600">
                            {treatment.dosage || treatment.frequency}
                          </p>
                        </div>
                        <Badge
                          variant={
                            treatment.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {treatment.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{treatment.progress}%</span>
                        </div>
                        <Progress value={treatment.progress} />
                        <p className="text-xs text-gray-500">
                          Next review: {treatment.nextReview}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Doctor Notes & Medical Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Doctor Notes & Medical Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      date: "2024-01-15",
                      doctor: "Dr. Sarah Blake",
                      type: "Follow-up Visit",
                      notes: "Patient reports significant improvement in headache frequency. Reduced from daily to 2-3 times per week. Current medication regimen appears effective. Continue with Topiramate 50mg twice daily.",
                      diagnosis: "Chronic Migraine - Improving",
                      nextSteps: "Continue current treatment, follow up in 4 weeks",
                    },
                    {
                      date: "2024-01-01",
                      doctor: "Dr. Sarah Blake",
                      type: "Initial Consultation",
                      notes: "New patient presenting with chronic daily headaches for past 6 months. Pain typically bilateral, throbbing, 7-8/10 severity. Associated with nausea and photophobia. No aura reported.",
                      diagnosis: "Chronic Migraine",
                      nextSteps: "Start Topiramate 25mg daily, increase to 50mg after 1 week. Lifestyle modifications discussed.",
                    },
                    {
                      date: "2023-12-20",
                      doctor: "Dr. Michael Chen",
                      type: "Specialist Referral",
                      notes: "Patient referred from primary care for evaluation of chronic headaches. Comprehensive neurological examination normal. MRI brain ordered to rule out secondary causes.",
                      diagnosis: "Headache - Under Investigation",
                      nextSteps: "Await MRI results, consider preventive therapy",
                    },
                  ].map((record, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{record.type}</h4>
                          <p className="text-sm text-gray-600">{record.doctor}</p>
                          <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</p>
                        </div>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          Medical Record
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Clinical Notes:</h5>
                          <p className="text-sm text-gray-600 leading-relaxed">{record.notes}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Diagnosis:</h5>
                            <p className="text-sm text-gray-600">{record.diagnosis}</p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Next Steps:</h5>
                            <p className="text-sm text-gray-600">{record.nextSteps}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View All Medical Records
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      type: "appointment",
                      message: "Appointment scheduled for Jan 20",
                      time: "2 days ago",
                      status: "confirmed",
                    },
                    {
                      type: "medication",
                      message: "Topiramate dosage adjusted",
                      time: "1 week ago",
                      status: "completed",
                    },
                    {
                      type: "update",
                      message: "Daily update submitted",
                      time: "1 day ago",
                      status: "completed",
                    },
                    {
                      type: "treatment",
                      message: "Physical therapy session completed",
                      time: "3 days ago",
                      status: "completed",
                    },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === "completed"
                            ? "bg-green-500"
                            : activity.status === "confirmed"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      <Badge variant="outline">{activity.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6 min-w-0">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start hover:bg-blue-50"
                  variant="outline"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
                <Button
                  className="w-full justify-start hover:bg-green-50"
                  variant="outline"
                >
                  <Pill className="h-4 w-4 mr-2" />
                  Request Medication Refill
                </Button>
                <Button
                  className="w-full justify-start hover:bg-purple-50"
                  variant="outline"
                >
                  <User className="h-4 w-4 mr-2" />
                  Update Profile
                </Button>
                <Button
                  className="w-full justify-start bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  variant="destructive"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report Emergency
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.length > 0 ? (
                    appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900">
                              {appointment.scheduledAt.toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              {appointment.scheduledAt.toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              {appointment.location}
                            </p>
                            {appointment.notes && (
                              <p className="text-xs text-gray-500 mt-2">
                                {appointment.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                appointment.status === "scheduled"
                                  ? "default"
                                  : "outline"
                              }
                              className={
                                appointment.status === "scheduled"
                                  ? "bg-blue-100 text-blue-800"
                                  : ""
                              }
                            >
                              {appointment.type.replace("_", " ")}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {appointment.duration} min
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No upcoming appointments</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Schedule Appointment
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Health Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Health Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Average Pain Level
                    </span>
                    <div className="flex items-center space-x-2">
                      <Progress value={32} className="w-16 h-2" />
                      <span className="font-medium text-orange-600">
                        3.2/10
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Headache Frequency
                    </span>
                    <span className="font-medium text-blue-600">2/week</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Treatment Adherence
                    </span>
                    <div className="flex items-center space-x-2">
                      <Progress value={95} className="w-16 h-2" />
                      <span className="font-medium text-green-600">95%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Update</span>
                    <span className="font-medium text-gray-900">
                      {dailyUpdates.length > 0
                        ? dailyUpdates[0].date.toLocaleDateString()
                        : "No updates yet"}
                    </span>
                  </div>
                  {treatments.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500 mb-2">
                        Current Treatment
                      </p>
                      <p className="text-sm font-medium">
                        {treatments[0].description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center text-red-800">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-sm font-medium text-gray-900">
                      Dr. Blake's Office
                    </p>
                    <p className="text-sm text-gray-600">📞 713-467-4082</p>
                    <p className="text-xs text-gray-500">
                      Available: Mon-Fri 8:30 AM - 5:30 PM
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-sm font-medium text-gray-900">
                      {patient.profile.emergencyContact.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      📞 {patient.profile.emergencyContact.phone}
                    </p>
                    <p className="text-xs text-gray-500">
                      {patient.profile.emergencyContact.relationship}
                    </p>
                  </div>
                  <Button className="w-full mt-3 bg-red-600 hover:bg-red-700">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Call Emergency Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
