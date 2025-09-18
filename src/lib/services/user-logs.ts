import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  UserLogData,
  UserLogFeeling,
  UserLogsResponse,
  DailyLogSummary,
  PainHeatmapData,
} from "@/types/user-logs";

/**
 * Get all user logs for a specific user
 */
export async function getUserLogs(userId: string): Promise<UserLogsResponse> {
  try {
    console.log("🔍 Fetching user logs for userId:", userId);
    
    if (!userId || userId.trim() === '') {
      console.warn("⚠️ Empty or invalid userId provided:", userId);
      return { dailyLogs: [], feelingsLogs: [] };
    }

    // Fetch daily logs from user_logs/{userId}/days/
    const dailyLogs = await getDailyLogs(userId);

    // Fetch feelings logs from user_logs/{userId}/days/{date}/feelings/
    const feelingsLogs = await getFeelingsLogs(userId);

    console.log(
      `✅ Found ${dailyLogs.length} daily logs and ${feelingsLogs.length} feelings logs`
    );

    return {
      dailyLogs,
      feelingsLogs,
    };
  } catch (error) {
    console.error("Failed to get user logs:", error);
    throw new Error(
      `Failed to retrieve user logs: ${(error as Error).message}`
    );
  }
}

/**
 * Get daily logs for a user
 */
export async function getDailyLogs(userId: string): Promise<UserLogData[]> {
  try {
    console.log("🔍 Getting daily logs for userId:", userId);
    const daysCollectionRef = collection(db, "user_logs", userId, "days");
    console.log("📁 Collection path:", `user_logs/${userId}/days`);
    const daysQuery = query(
      daysCollectionRef,
      orderBy("date", "desc"),
      limit(100) // Limit to last 100 days
    );

    const snapshot = await getDocs(daysQuery);
    const dailyLogs: UserLogData[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Convert Firestore data to UserLogData type
      const userLog: UserLogData = {
        id: doc.id,
        userId: data.userId || userId,
        date: data.date || "",
        timestamp: data.timestamp || "",
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(),
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate()
          : new Date(),
        severity: data.severity || 0,
        duration: data.duration || 0,
        painLocations: data.painLocations || [],
        painStrokes: data.painStrokes || {
          back: [],
          front: [],
          left: [],
          right: [],
        },
        painStrokesMetadata: data.painStrokesMetadata || {
          message: "",
          timestamp: "",
        },
        symptoms: data.symptoms || {
          dizziness: false,
          lightSensitivity: false,
          nausea: false,
          neckPain: false,
          none: false,
          soundSensitivity: false,
          vomiting: false,
        },
        medications: data.medications || [],
        trigger: data.trigger || "",
        triggerP: data.triggerP || false,
        concentration: data.concentration || "",
        time: data.time || "",
      };

      dailyLogs.push(userLog);
    }

    return dailyLogs;
  } catch (error) {
    console.error("Failed to get daily logs:", error);
    throw error;
  }
}

/**
 * Get feelings logs for a user
 */
export async function getFeelingsLogs(
  userId: string
): Promise<UserLogFeeling[]> {
  try {
    const feelingsLogs: UserLogFeeling[] = [];

    // First get all days
    const daysCollectionRef = collection(db, "user_logs", userId, "days");
    const daysSnapshot = await getDocs(daysCollectionRef);

    // Then for each day, get the feelings subcollection
    for (const dayDoc of daysSnapshot.docs) {
      const feelingsCollectionRef = collection(
        db,
        "user_logs",
        userId,
        "days",
        dayDoc.id,
        "feelings"
      );
      const feelingsSnapshot = await getDocs(feelingsCollectionRef);

      for (const feelingDoc of feelingsSnapshot.docs) {
        const data = feelingDoc.data();

        const feeling: UserLogFeeling = {
          id: feelingDoc.id,
          userId: data.userId || userId,
          date: data.date || dayDoc.id,
          time: data.time || "",
          sessionNumber: data.sessionNumber || 1,
          feelings: data.feelings || [],
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(),
        };

        feelingsLogs.push(feeling);
      }
    }

    // Sort by date and time
    feelingsLogs.sort((a, b) => {
      const dateCompare =
        new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });

    return feelingsLogs;
  } catch (error) {
    console.error("Failed to get feelings logs:", error);
    throw error;
  }
}

/**
 * Process user logs into daily summaries
 */
export function processDailyLogSummaries(
  logs: UserLogData[],
  feelings: UserLogFeeling[]
): DailyLogSummary[] {
  const summariesMap = new Map<string, DailyLogSummary>();

  // Process daily logs
  logs.forEach((log) => {
    if (!summariesMap.has(log.date)) {
      summariesMap.set(log.date, {
        date: log.date,
        logCount: 0,
        avgSeverity: 0,
        maxSeverity: 0,
        totalDuration: 0,
        uniqueSymptoms: [],
        emotions: [],
        hasData: false,
      });
    }

    const summary = summariesMap.get(log.date)!;
    summary.logCount += 1;
    summary.maxSeverity = Math.max(summary.maxSeverity, log.severity);
    summary.totalDuration += log.duration;
    summary.hasData = true;

    // Collect symptoms
    Object.entries(log.symptoms).forEach(([symptom, hasSymptom]) => {
      if (
        hasSymptom &&
        symptom !== "none" &&
        !summary.uniqueSymptoms.includes(symptom)
      ) {
        summary.uniqueSymptoms.push(symptom);
      }
    });
  });

  // Process feelings
  feelings.forEach((feeling) => {
    const summary = summariesMap.get(feeling.date);
    if (summary) {
      feeling.feelings.forEach((emotion) => {
        if (!summary.emotions.includes(emotion)) {
          summary.emotions.push(emotion);
        }
      });
    }
  });

  // Calculate averages
  summariesMap.forEach((summary) => {
    if (summary.logCount > 0) {
      const dayLogs = logs.filter((log) => log.date === summary.date);
      summary.avgSeverity =
        dayLogs.reduce((sum, log) => sum + log.severity, 0) / dayLogs.length;
    }
  });

  return Array.from(summariesMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Generate pain heatmap data from pain strokes
 */
export function generatePainHeatmapData(
  logs: UserLogData[]
): PainHeatmapData[] {
  const views: Array<"front" | "back" | "left" | "right"> = [
    "front",
    "back",
    "left",
    "right",
  ];
  const heatmapData: PainHeatmapData[] = [];

  views.forEach((view) => {
    const pointFrequency = new Map<
      string,
      { x: number; y: number; intensities: number[]; count: number }
    >();

    logs.forEach((log) => {
      const strokes = log.painStrokes[view] || [];
      strokes.forEach((stroke) => {
        stroke.points.forEach((point) => {
          const key = `${Math.round(point.x * 100)},${Math.round(
            point.y * 100
          )}`;

          if (!pointFrequency.has(key)) {
            pointFrequency.set(key, {
              x: point.x,
              y: point.y,
              intensities: [],
              count: 0,
            });
          }

          const pointData = pointFrequency.get(key)!;
          pointData.intensities.push(stroke.level);
          pointData.count += 1;
        });
      });
    });

    const points = Array.from(pointFrequency.values()).map((pointData) => ({
      x: pointData.x,
      y: pointData.y,
      intensity:
        pointData.intensities.reduce((sum, val) => sum + val, 0) /
        pointData.intensities.length,
      frequency: pointData.count,
    }));

    heatmapData.push({
      view,
      points,
    });
  });

  return heatmapData;
}

/**
 * Get user logs for a specific date range
 */
export async function getUserLogsDateRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<UserLogsResponse> {
  try {
    const daysCollectionRef = collection(db, "user_logs", userId, "days");
    const daysQuery = query(
      daysCollectionRef,
      where("date", ">=", startDate),
      where("date", "<=", endDate),
      orderBy("date", "desc")
    );

    const snapshot = await getDocs(daysQuery);
    const dailyLogs: UserLogData[] = [];
    const feelingsLogs: UserLogFeeling[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Process daily log
      const userLog: UserLogData = {
        id: doc.id,
        userId: data.userId || userId,
        date: data.date || "",
        timestamp: data.timestamp || "",
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : new Date(),
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate()
          : new Date(),
        severity: data.severity || 0,
        duration: data.duration || 0,
        painLocations: data.painLocations || [],
        painStrokes: data.painStrokes || {
          back: [],
          front: [],
          left: [],
          right: [],
        },
        painStrokesMetadata: data.painStrokesMetadata || {
          message: "",
          timestamp: "",
        },
        symptoms: data.symptoms || {
          dizziness: false,
          lightSensitivity: false,
          nausea: false,
          neckPain: false,
          none: false,
          soundSensitivity: false,
          vomiting: false,
        },
        medications: data.medications || [],
        trigger: data.trigger || "",
        triggerP: data.triggerP || false,
        concentration: data.concentration || "",
        time: data.time || "",
      };

      dailyLogs.push(userLog);

      // Get feelings for this day
      const feelingsCollectionRef = collection(
        db,
        "user_logs",
        userId,
        "days",
        doc.id,
        "feelings"
      );
      const feelingsSnapshot = await getDocs(feelingsCollectionRef);

      for (const feelingDoc of feelingsSnapshot.docs) {
        const feelingData = feelingDoc.data();

        const feeling: UserLogFeeling = {
          id: feelingDoc.id,
          userId: feelingData.userId || userId,
          date: feelingData.date || doc.id,
          time: feelingData.time || "",
          sessionNumber: feelingData.sessionNumber || 1,
          feelings: feelingData.feelings || [],
          createdAt: feelingData.createdAt?.toDate
            ? feelingData.createdAt.toDate()
            : new Date(),
        };

        feelingsLogs.push(feeling);
      }
    }

    return {
      dailyLogs,
      feelingsLogs,
    };
  } catch (error) {
    console.error("Failed to get user logs for date range:", error);
    throw error;
  }
}
