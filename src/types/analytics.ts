export interface AnalyticsDashboard {
  overview: OverviewMetrics;
  patientMetrics: PatientMetrics;
  treatmentMetrics: TreatmentMetrics;
  appointmentMetrics: AppointmentMetrics;
  revenueMetrics: RevenueMetrics;
  qualityMetrics: QualityMetrics;
  timeRange: TimeRange;
  lastUpdated: Date;
}

export interface OverviewMetrics {
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;
  totalAppointments: number;
  appointmentsToday: number;
  averagePainReduction: number;
  patientSatisfactionScore: number;
  treatmentSuccessRate: number;
}

export interface PatientMetrics {
  demographics: PatientDemographics;
  headacheTypes: HeadacheTypeDistribution[];
  painLevelDistribution: PainLevelDistribution[];
  treatmentResponseRates: TreatmentResponseRate[];
  patientEngagement: PatientEngagementMetrics;
}

export interface PatientDemographics {
  ageGroups: AgeGroupDistribution[];
  genderDistribution: GenderDistribution[];
  geographicDistribution: GeographicDistribution[];
}

export interface AgeGroupDistribution {
  ageGroup: string;
  count: number;
  percentage: number;
}

export interface GenderDistribution {
  gender: string;
  count: number;
  percentage: number;
}

export interface GeographicDistribution {
  state: string;
  city: string;
  count: number;
  percentage: number;
}

export interface HeadacheTypeDistribution {
  type: string;
  count: number;
  percentage: number;
  averagePainLevel: number;
}

export interface PainLevelDistribution {
  painLevel: number;
  count: number;
  percentage: number;
  timeOfDay?: string;
}

export interface TreatmentResponseRate {
  treatmentType: string;
  totalPatients: number;
  responders: number;
  responseRate: number;
  averagePainReduction: number;
  averageTimeToResponse: number; // days
}

export interface PatientEngagementMetrics {
  dailyUpdateCompliance: number; // percentage
  appointmentAttendanceRate: number; // percentage
  medicationAdherence: number; // percentage
  averageAppGageTime: number; // minutes per session
  mobileAppUsage: MobileAppUsageMetrics;
}

export interface MobileAppUsageMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number; // minutes
  mostUsedFeatures: FeatureUsage[];
}

export interface FeatureUsage {
  feature: string;
  usageCount: number;
  uniqueUsers: number;
}

export interface TreatmentMetrics {
  treatmentEffectiveness: TreatmentEffectivenessMetrics[];
  medicationAnalysis: MedicationAnalysisMetrics;
  treatmentDuration: TreatmentDurationMetrics[];
  sideEffectAnalysis: SideEffectAnalysisMetrics[];
}

export interface TreatmentEffectivenessMetrics {
  treatmentType: string;
  patientCount: number;
  averagePainReduction: number;
  successRate: number; // percentage of patients with >50% pain reduction
  timeToImprovement: number; // average days
  sustainedImprovement: number; // percentage maintaining improvement at 6 months
}

export interface MedicationAnalysisMetrics {
  mostPrescribed: MedicationPrescriptionData[];
  effectiveness: MedicationEffectivenessData[];
  adherence: MedicationAdherenceData[];
  sideEffects: MedicationSideEffectData[];
}

export interface MedicationPrescriptionData {
  medication: string;
  prescriptionCount: number;
  uniquePatients: number;
  averageDosage: string;
}

export interface MedicationEffectivenessData {
  medication: string;
  averagePainReduction: number;
  responseRate: number;
  timeToResponse: number; // days
}

export interface MedicationAdherenceData {
  medication: string;
  adherenceRate: number; // percentage
  missedDoses: number;
  discontinuationRate: number;
}

export interface MedicationSideEffectData {
  medication: string;
  sideEffectRate: number; // percentage
  commonSideEffects: string[];
  severityDistribution: SeverityDistribution[];
}

export interface SeverityDistribution {
  severity: string;
  count: number;
  percentage: number;
}

export interface TreatmentDurationMetrics {
  treatmentType: string;
  averageDuration: number; // days
  shortTerm: number; // <30 days
  mediumTerm: number; // 30-90 days
  longTerm: number; // >90 days
}

export interface SideEffectAnalysisMetrics {
  treatmentType: string;
  sideEffectRate: number;
  commonSideEffects: string[];
  severityBreakdown: SeverityDistribution[];
}

export interface AppointmentMetrics {
  schedulingMetrics: SchedulingMetrics;
  attendanceMetrics: AttendanceMetrics;
  waitTimeMetrics: WaitTimeMetrics;
  satisfactionMetrics: SatisfactionMetrics;
}

export interface SchedulingMetrics {
  totalAppointments: number;
  averageBookingLeadTime: number; // days
  peakBookingTimes: TimeSlotUsage[];
  cancellationRate: number;
  rescheduleRate: number;
}

export interface TimeSlotUsage {
  timeSlot: string;
  bookingCount: number;
  utilizationRate: number;
}

export interface AttendanceMetrics {
  attendanceRate: number;
  noShowRate: number;
  lateArrivalRate: number;
  averageLateness: number; // minutes
}

export interface WaitTimeMetrics {
  averageWaitTime: number; // minutes
  waitTimeDistribution: WaitTimeDistribution[];
  onTimePerformance: number; // percentage
}

export interface WaitTimeDistribution {
  waitTimeRange: string;
  count: number;
  percentage: number;
}

export interface SatisfactionMetrics {
  overallSatisfaction: number; // 1-5 scale
  appointmentSatisfaction: number;
  doctorSatisfaction: number;
  facilityRating: number;
  recommendationRate: number; // Net Promoter Score
}

export interface RevenueMetrics {
  totalRevenue: number;
  revenueByTreatmentType: RevenueTreatmentBreakdown[];
  revenueByInsurance: RevenueInsuranceBreakdown[];
  averageRevenuePerPatient: number;
  collectionRate: number;
  outstandingBalance: number;
}

export interface RevenueTreatmentBreakdown {
  treatmentType: string;
  revenue: number;
  patientCount: number;
  averageRevenuePerPatient: number;
}

export interface RevenueInsuranceBreakdown {
  insuranceProvider: string;
  revenue: number;
  claimCount: number;
  averageClaimAmount: number;
  reimbursementRate: number;
}

export interface QualityMetrics {
  clinicalOutcomes: ClinicalOutcomeMetrics;
  patientSafety: PatientSafetyMetrics;
  processMetrics: ProcessMetrics;
  complianceMetrics: ComplianceMetrics;
}

export interface ClinicalOutcomeMetrics {
  painReductionRate: number;
  functionalImprovementRate: number;
  qualityOfLifeImprovement: number;
  treatmentGoalAchievement: number;
  readmissionRate: number;
}

export interface PatientSafetyMetrics {
  adverseEventRate: number;
  medicationErrorRate: number;
  allergyReactionRate: number;
  safetyIncidentCount: number;
}

export interface ProcessMetrics {
  averageTimeToTreatment: number; // days from first visit
  treatmentPlanAdherence: number;
  documentationCompleteness: number;
  followUpCompliance: number;
}

export interface ComplianceMetrics {
  hipaaComplianceScore: number;
  auditTrailCompleteness: number;
  dataEncryptionCompliance: number;
  accessControlCompliance: number;
}

export interface TimeRange {
  startDate: Date;
  endDate: Date;
  period: TimePeriod;
}

export enum TimePeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom'
}

export interface AnalyticsFilter {
  doctorIds?: string[];
  patientIds?: string[];
  treatmentTypes?: string[];
  ageGroups?: string[];
  genders?: string[];
  locations?: string[];
  timeRange: TimeRange;
}

export interface RealtimeMetrics {
  currentActiveUsers: number;
  appointmentsToday: number;
  emergencyAlerts: EmergencyAlert[];
  systemHealth: SystemHealthMetrics;
  lastUpdated: Date;
}

export interface EmergencyAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  patientId?: string;
  doctorId?: string;
  timestamp: Date;
  acknowledged: boolean;
}

export enum AlertType {
  PATIENT_EMERGENCY = 'patient_emergency',
  SYSTEM_ERROR = 'system_error',
  SECURITY_BREACH = 'security_breach',
  MEDICATION_INTERACTION = 'medication_interaction',
  APPOINTMENT_OVERDUE = 'appointment_overdue'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface SystemHealthMetrics {
  uptime: number; // percentage
  responseTime: number; // milliseconds
  errorRate: number; // percentage
  activeConnections: number;
  databaseHealth: DatabaseHealthMetrics;
  apiHealth: ApiHealthMetrics;
}

export interface DatabaseHealthMetrics {
  connectionCount: number;
  queryResponseTime: number; // milliseconds
  storageUsage: number; // percentage
  backupStatus: string;
}

export interface ApiHealthMetrics {
  requestsPerMinute: number;
  averageResponseTime: number; // milliseconds
  errorRate: number; // percentage
  rateLimitHits: number;
}
