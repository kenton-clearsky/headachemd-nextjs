import type { Address, EmergencyContact, Gender } from "@/types/auth";
export interface Patient {
  id: string;
  userId: string;
  mrn: string; // Medical Record Number
  profile: PatientProfile;
  medicalHistory: MedicalHistory;
  currentTreatments: Treatment[];
  appointments: Appointment[];
  dailyUpdates: DailyUpdate[];
  isActive: boolean;
  assignedDoctors: string[]; // Doctor user IDs
  lastLogin?: Date | null; // When patient last logged in
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  phone: string;
  email: string;
  address: Address;
  emergencyContact: EmergencyContact;
  insurance?: InsuranceInfo;
  preferredLanguage?: string;
  allergies: Allergy[];
  medications: Medication[];
}

export interface MedicalHistory {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string[];
  surgicalHistory?: string[];
  familyHistory: string[];
  socialHistory: SocialHistory;
  reviewOfSystems: ReviewOfSystems;
  headacheHistory: HeadacheHistory;
}

export interface HeadacheHistory {
  onsetAge: number;
  frequency: HeadacheFrequency;
  duration: string;
  intensity: number; // 1-10 scale
  location: HeadacheLocation[];
  triggers: string[];
  relievingFactors: string[];
  associatedSymptoms: string[];
  previousTreatments: PreviousTreatment[];
  familyHistoryOfHeadaches: boolean;
}

export enum HeadacheFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  OCCASIONAL = "occasional",
}

export enum HeadacheLocation {
  FRONTAL = "frontal",
  TEMPORAL = "temporal",
  OCCIPITAL = "occipital",
  PARIETAL = "parietal",
  UNILATERAL = "unilateral",
  BILATERAL = "bilateral",
}

export interface PreviousTreatment {
  treatment: string;
  duration: string;
  effectiveness: number; // 1-10 scale
  sideEffects?: string[];
}

export interface SocialHistory {
  smokingStatus: SmokingStatus;
  alcoholUse: AlcoholUse;
  drugUse?: string;
  occupation: string;
  exerciseFrequency: string;
  stressLevel: number; // 1-10 scale
}

export enum SmokingStatus {
  NEVER = "never",
  CURRENT = "current",
  FORMER = "former",
}

export enum AlcoholUse {
  NONE = "none",
  OCCASIONAL = "occasional",
  MODERATE = "moderate",
  HEAVY = "heavy",
}

export interface ReviewOfSystems {
  constitutional: boolean;
  cardiovascular: boolean;
  respiratory: boolean;
  gastrointestinal: boolean;
  genitourinary: boolean;
  musculoskeletal: boolean;
  neurological: boolean;
  psychiatric: boolean;
  endocrine: boolean;
  hematologic: boolean;
  allergic: boolean;
}

export interface Allergy {
  allergen: string;
  reaction: string;
  severity: AllergySeverity;
}

export enum AllergySeverity {
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
  LIFE_THREATENING = "life_threatening",
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  indication: string;
  isActive: boolean;
}

export interface Treatment {
  id: string;
  patientId: string;
  doctorId: string;
  type: TreatmentType;
  description: string;
  startDate: Date;
  endDate?: Date;
  status: TreatmentStatus;
  notes: string;
  outcomes: TreatmentOutcome[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TreatmentType {
  MEDICATION = "medication",
  INJECTION = "injection",
  PHYSICAL_THERAPY = "physical_therapy",
  LIFESTYLE_MODIFICATION = "lifestyle_modification",
  SURGICAL = "surgical",
  ALTERNATIVE = "alternative",
}

export enum TreatmentStatus {
  PLANNED = "planned",
  ACTIVE = "active",
  COMPLETED = "completed",
  DISCONTINUED = "discontinued",
  ON_HOLD = "on_hold",
}

export interface TreatmentOutcome {
  date: Date;
  painLevel: number; // 1-10 scale
  functionalImprovement: number; // 1-10 scale
  sideEffects?: string[];
  notes: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledAt: Date;
  duration: number; // minutes
  location: string;
  notes?: string;
  visitSummary?: VisitSummary;
  createdAt: Date;
  updatedAt: Date;
}

export enum AppointmentType {
  INITIAL_CONSULTATION = "initial_consultation",
  FOLLOW_UP = "follow_up",
  TREATMENT = "treatment",
  EMERGENCY = "emergency",
  TELEMEDICINE = "telemedicine",
}

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
}

export interface VisitSummary {
  chiefComplaint: string;
  assessment: string;
  plan: string;
  prescriptions: Medication[];
  followUpInstructions: string;
  nextAppointment?: Date;
}

export interface DailyUpdate {
  id: string;
  patientId: string;
  date: Date;
  painLevel: number; // 1-10 scale
  headacheFrequency: number; // number of headaches that day
  triggers: string[];
  medications: DailyMedication[];
  sleepHours: number;
  stressLevel: number; // 1-10 scale
  exerciseMinutes: number;
  notes?: string;
  mood: MoodLevel;
  functionalStatus: FunctionalStatus;
  createdAt: Date;
}

export interface DailyMedication {
  name: string;
  dosage: string;
  timeTaken: Date;
  effectiveness: number; // 1-10 scale
}

export enum MoodLevel {
  VERY_POOR = 1,
  POOR = 2,
  FAIR = 3,
  GOOD = 4,
  EXCELLENT = 5,
}

export enum FunctionalStatus {
  UNABLE_TO_FUNCTION = 1,
  SEVERELY_LIMITED = 2,
  MODERATELY_LIMITED = 3,
  MILDLY_LIMITED = 4,
  NORMAL_FUNCTION = 5,
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  subscriberId: string;
  subscriberName: string;
  relationship: string;
  effectiveDate: Date;
  expirationDate?: Date;
}
