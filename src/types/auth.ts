export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile: UserProfile;
  emrId?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  ADMIN_TEST = 'admin-test',
  NURSE = 'nurse',
  STAFF = 'staff'
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  title?: string; // Job title or role description
  phone?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  address?: Address;
  emergencyContact?: EmergencyContact;
  medicalLicenseNumber?: string; // For medical professionals
  specialization?: string; // For doctors
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  emrSession?: EMRSession;
}

export interface EMRSession {
  system: EMRSystem;
  accessToken: string; // Will be stored as encrypted string in database
  refreshToken?: string; // Will be stored as encrypted string in database
  expiresAt: Date;
  patientContext?: string;
}

export enum EMRSystem {
  EPIC = 'epic',
  CERNER = 'cerner',
  ALLSCRIPTS = 'allscripts',
  ATHENAHEALTH = 'athenahealth',
  ECLINICALWORKS = 'eclinicalworks',
  ECLINICALWORKS_SANDBOX = 'eclinicalworks-sandbox'
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface EMRAuthRequest {
  system: EMRSystem;
  clientId: string;
  redirectUri: string;
  scope: string[];
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
