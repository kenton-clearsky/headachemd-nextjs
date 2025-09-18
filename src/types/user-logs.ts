export interface UserLogData {
  id?: string;
  userId: string;
  date: string; // Format: "YYYY-MM-DD"
  timestamp: string; // ISO timestamp
  createdAt: Date;
  updatedAt: Date;

  // Pain data
  severity: number; // 0-10 scale
  duration: number; // in minutes
  painLocations: string[];
  painStrokes: PainStrokes;
  painStrokesMetadata: PainStrokesMetadata;

  // Symptoms
  symptoms: Symptoms;

  // Medications and triggers
  medications: string[];
  trigger: string;
  triggerP: boolean;
  concentration: string;

  // Session info
  time: string; // Format: "HH:MM"
}

export interface UserLogFeeling {
  id?: string;
  userId: string;
  date: string; // Format: "YYYY-MM-DD"
  time: string; // Format: "HH:MM"
  sessionNumber: number;
  feelings: string[];
  createdAt: Date;
}

export interface PainStrokes {
  back: PainStroke[];
  front: PainStroke[];
  left: PainStroke[];
  right: PainStroke[];
}

export interface PainStroke {
  level: number; // 1-5 pain intensity level
  points: PainPoint[];
  timestamp: string; // ISO timestamp
}

export interface PainPoint {
  x: number; // 0-1 normalized coordinate
  y: number; // 0-1 normalized coordinate
}

export interface PainStrokesMetadata {
  message: string;
  timestamp: string;
}

export interface Symptoms {
  dizziness: boolean;
  lightSensitivity: boolean;
  nausea: boolean;
  neckPain: boolean;
  none: boolean;
  soundSensitivity: boolean;
  vomiting: boolean;
}

export interface UserLogsResponse {
  dailyLogs: UserLogData[];
  feelingsLogs: UserLogFeeling[];
}

// Helper types for data processing
export interface DailyLogSummary {
  date: string;
  logCount: number;
  avgSeverity: number;
  maxSeverity: number;
  totalDuration: number;
  uniqueSymptoms: string[];
  emotions: string[];
  hasData: boolean;
}

export interface PainHeatmapData {
  view: "front" | "back" | "left" | "right";
  points: Array<{
    x: number;
    y: number;
    intensity: number;
    frequency: number;
  }>;
}

export interface WeeklyTrends {
  week: string;
  avgPainLevel: number;
  totalLogs: number;
  symptoms: Record<string, number>;
  emotions: Record<string, number>;
}
