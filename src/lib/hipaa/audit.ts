import { db } from "@/lib/firebase/config";
import { adminDb } from "@/lib/firebase/admin";
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  type Query,
  type DocumentData,
} from "firebase/firestore";
import { encryptPHI, hashData } from "./encryption";

// Remove undefined values recursively (Firestore does not accept undefined fields)
function removeUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .map((v) => removeUndefinedDeep(v))
      .filter((v) => v !== undefined) as unknown as T;
  }
  if (value && typeof value === "object") {
    const result: Record<string, any> = {};
    Object.entries(value as Record<string, any>).forEach(([k, v]) => {
      if (v === undefined) return;
      const cleaned = removeUndefinedDeep(v);
      if (cleaned !== undefined) result[k] = cleaned;
    });
    return result as T;
  }
  return value;
}

export enum AuditAction {
  // Authentication actions
  LOGIN = "login",
  LOGIN_FAILED = "login_failed",
  LOGOUT = "logout",
  PASSWORD_RESET = "password_reset",
  PASSWORD_CHANGE = "password_change",

  // Data access actions
  READ = "read",
  READ_FAILED = "read_failed",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  EXPORT = "export",

  // EMR actions
  EMR_AUTH = "emr_auth",
  EMR_SYNC = "emr_sync",
  EMR_DATA_IMPORT = "emr_data_import",

  // Mobile actions
  MOBILE_SYNC = "mobile_sync",
  MOBILE_DATA_SYNC = "mobile_data_sync",

  // System actions
  ACCESS = "access",
  ACCESS_FAILED = "access_failed",
  SYSTEM_CONFIG = "system_config",
  BACKUP = "backup",
  RESTORE = "restore",
}

export enum AuditResource {
  USER = "user",
  PATIENT = "patient",
  TREATMENT = "treatment",
  APPOINTMENT = "appointment",
  DAILY_UPDATE = "daily_update",
  MEDICATION = "medication",
  EMR_DATA = "emr_data",
  EMR_AUTH = "emr_auth",
  MOBILE_SYNC = "mobile_sync",
  ANALYTICS = "analytics",
  SYSTEM = "system",
}

export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export type AccessMethod = "web_browser" | "mobile_app" | "api" | "system";

export interface AuditEvent {
  id?: string;
  userId?: string;
  userRole?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  details: {
    description: string;
    accessMethod: AccessMethod;
    [key: string]: any;
  };
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  timestamp: Date;
  success: boolean;
  riskLevel: RiskLevel;
  errorMessage?: string;
  metadata?: {
    browser?: string;
    os?: string;
    device?: string;
    location?: string;
    [key: string]: any;
  };
}

export interface AuditFilter {
  userId?: string;
  action?: AuditAction;
  resource?: AuditResource;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  riskLevel?: RiskLevel;
  success?: boolean;
  limit?: number;
}

export class AuditLogger {
  private static instance: AuditLogger;

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log an audit event
   */
  async logEvent(event: Omit<AuditEvent, "id" | "timestamp">): Promise<string> {
    try {
      // Hash sensitive data
      const hashedEvent = {
        ...event,
        ipAddress: hashData(event.ipAddress),
        userAgent: hashData(event.userAgent),
        sessionId: hashData(event.sessionId),
        timestamp: Timestamp.fromDate(new Date()),
      };

      // Add metadata
      if (event.userAgent && event.userAgent !== "system") {
        hashedEvent.metadata = {
          ...event.metadata,
          ...this.parseUserAgent(event.userAgent),
        };
      }

      // Remove undefined fields to satisfy Firestore constraints
      const sanitizedEvent = removeUndefinedDeep(hashedEvent);

      // Store in Firestore using Admin SDK to bypass client security rules
      const docRef = await adminDb.collection("audit_logs").add(sanitizedEvent);

      // Check for high-risk events and trigger alerts
      if (
        event.riskLevel === RiskLevel.HIGH ||
        event.riskLevel === RiskLevel.CRITICAL
      ) {
        await this.triggerSecurityAlert(event);
      }

      return docRef.id;
    } catch (error) {
      console.warn("Audit logging skipped due to error:", error);
      // Do not block the main flow in development if credentials are missing
      return "skipped";
    }
  }

  /**
   * Get audit events with filtering
   */
  async getAuditEvents(filter: AuditFilter): Promise<AuditEvent[]> {
    try {
      const baseRef = collection(db, "audit_logs");
      let q: Query<DocumentData> = baseRef;

      // Apply filters
      if (filter.userId) {
        q = query(q, where("userId", "==", filter.userId));
      }
      if (filter.action) {
        q = query(q, where("action", "==", filter.action));
      }
      if (filter.resource) {
        q = query(q, where("resource", "==", filter.resource));
      }
      if (filter.resourceId) {
        q = query(q, where("resourceId", "==", filter.resourceId));
      }
      if (filter.riskLevel) {
        q = query(q, where("riskLevel", "==", filter.riskLevel));
      }
      if (filter.success !== undefined) {
        q = query(q, where("success", "==", filter.success));
      }
      if (filter.startDate) {
        q = query(
          q,
          where("timestamp", ">=", Timestamp.fromDate(filter.startDate))
        );
      }
      if (filter.endDate) {
        q = query(
          q,
          where("timestamp", "<=", Timestamp.fromDate(filter.endDate))
        );
      }

      // Order by timestamp and limit results
      q = query(q, orderBy("timestamp", "desc"), limit(filter.limit || 100));

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      })) as AuditEvent[];
    } catch (error) {
      console.error("Failed to get audit events:", error);
      throw new Error(
        `Failed to retrieve audit events: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get security events (high/critical risk)
   */
  async getSecurityEvents(limit: number = 50): Promise<AuditEvent[]> {
    return this.getAuditEvents({
      riskLevel: RiskLevel.HIGH,
      limit,
    });
  }

  /**
   * Get failed login attempts
   */
  async getFailedLogins(
    userId?: string,
    hours: number = 24
  ): Promise<AuditEvent[]> {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.getAuditEvents({
      action: AuditAction.LOGIN_FAILED,
      userId,
      startDate,
      success: false,
      limit: 100,
    });
  }

  /**
   * Get data access events for a specific patient
   */
  async getPatientAccessEvents(
    patientId: string,
    days: number = 30
  ): Promise<AuditEvent[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.getAuditEvents({
      resource: AuditResource.PATIENT,
      resourceId: patientId,
      startDate,
      limit: 200,
    });
  }

  /**
   * Parse user agent string to extract metadata
   */
  private parseUserAgent(userAgent: string): {
    browser?: string;
    os?: string;
    device?: string;
  } {
    const metadata: { browser?: string; os?: string; device?: string } = {};

    // Simple browser detection
    if (userAgent.includes("Chrome")) metadata.browser = "Chrome";
    else if (userAgent.includes("Firefox")) metadata.browser = "Firefox";
    else if (userAgent.includes("Safari")) metadata.browser = "Safari";
    else if (userAgent.includes("Edge")) metadata.browser = "Edge";

    // OS detection
    if (userAgent.includes("Windows")) metadata.os = "Windows";
    else if (userAgent.includes("Mac")) metadata.os = "macOS";
    else if (userAgent.includes("Linux")) metadata.os = "Linux";
    else if (userAgent.includes("Android")) metadata.os = "Android";
    else if (userAgent.includes("iOS")) metadata.os = "iOS";

    // Device detection
    if (userAgent.includes("Mobile")) metadata.device = "Mobile";
    else if (userAgent.includes("Tablet")) metadata.device = "Tablet";
    else metadata.device = "Desktop";

    return metadata;
  }

  /**
   * Trigger security alert for high-risk events
   */
  private async triggerSecurityAlert(
    event: Omit<AuditEvent, "id" | "timestamp">
  ): Promise<void> {
    try {
      const alert = {
        type: "security_alert",
        severity: event.riskLevel,
        event: event.action,
        userId: event.userId,
        ipAddress: event.ipAddress,
        timestamp: Timestamp.fromDate(new Date()),
        description: `High-risk audit event: ${event.action} on ${event.resource}`,
        details: event.details,
      };

      // Sanitize before writing
      const sanitizedAlert = removeUndefinedDeep(alert);
      await adminDb.collection("security_alerts").add(sanitizedAlert);

      // TODO: Send email/SMS notification to administrators
      console.warn("Security alert triggered:", alert);
    } catch (error) {
      console.error("Failed to trigger security alert:", error);
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const events = await this.getAuditEvents({
        startDate,
        endDate,
        limit: 10000,
      });

      const report = {
        period: { startDate, endDate },
        totalEvents: events.length,
        byAction: {} as Record<AuditAction, number>,
        byResource: {} as Record<AuditResource, number>,
        byRiskLevel: {} as Record<RiskLevel, number>,
        failedEvents: events.filter((e) => !e.success).length,
        securityEvents: events.filter(
          (e) =>
            e.riskLevel === RiskLevel.HIGH || e.riskLevel === RiskLevel.CRITICAL
        ).length,
        uniqueUsers: new Set(events.map((e) => e.userId).filter(Boolean)).size,
        uniqueIPs: new Set(events.map((e) => e.ipAddress)).size,
      };

      // Count by action
      events.forEach((event) => {
        report.byAction[event.action] =
          (report.byAction[event.action] || 0) + 1;
        report.byResource[event.resource] =
          (report.byResource[event.resource] || 0) + 1;
        report.byRiskLevel[event.riskLevel] =
          (report.byRiskLevel[event.riskLevel] || 0) + 1;
      });

      return report;
    } catch (error) {
      console.error("Failed to generate compliance report:", error);
      throw new Error(
        `Compliance report generation failed: ${(error as Error).message}`
      );
    }
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();

// Convenience function for logging audit events
export async function logAuditEvent(
  event: Omit<AuditEvent, "id" | "timestamp">
): Promise<string> {
  return auditLogger.logEvent(event);
}
