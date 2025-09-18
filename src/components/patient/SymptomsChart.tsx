"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TrendingUp, CheckCircle } from "lucide-react";
import { UserLogData } from "@/types/user-logs";

interface SymptomsChartProps {
  logs: UserLogData[];
  detailed?: boolean;
}

export function SymptomsChart({ logs, detailed = false }: SymptomsChartProps) {
  // Process symptoms data
  const symptomsData = useMemo(() => {
    const symptomCounts = new Map<string, number>();
    const symptomsByDate = new Map<string, Set<string>>();
    const symptomsBySeverity = new Map<string, number[]>();

    logs.forEach((log) => {
      const symptoms = Object.entries(log.symptoms)
        .filter(([symptom, hasSymptom]) => hasSymptom && symptom !== "none")
        .map(([symptom]) => symptom);

      symptoms.forEach((symptom) => {
        // Count occurrences
        symptomCounts.set(symptom, (symptomCounts.get(symptom) || 0) + 1);

        // Track by date
        if (!symptomsByDate.has(log.date)) {
          symptomsByDate.set(log.date, new Set());
        }
        symptomsByDate.get(log.date)!.add(symptom);

        // Track with severity levels
        if (!symptomsBySeverity.has(symptom)) {
          symptomsBySeverity.set(symptom, []);
        }
        symptomsBySeverity.get(symptom)!.push(log.severity);
      });
    });

    // Calculate statistics
    const sortedSymptoms = Array.from(symptomCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([symptom, count]) => {
        const severityLevels = symptomsBySeverity.get(symptom) || [];
        const avgSeverity =
          severityLevels.length > 0
            ? severityLevels.reduce((sum, level) => sum + level, 0) /
              severityLevels.length
            : 0;

        return {
          symptom,
          count,
          percentage: (count / logs.length) * 100,
          avgSeverity: Number(avgSeverity.toFixed(1)),
          maxSeverity: Math.max(...severityLevels, 0),
        };
      });

    // Calculate trends (last 7 days vs previous 7 days)
    const today = new Date();
    const last7Days = new Set<string>();
    const previous7Days = new Set<string>();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.add(date.toISOString().split("T")[0]);

      const prevDate = new Date(today);
      prevDate.setDate(prevDate.getDate() - i - 7);
      previous7Days.add(prevDate.toISOString().split("T")[0]);
    }

    const recentSymptoms = new Map<string, number>();
    const previousSymptoms = new Map<string, number>();

    logs.forEach((log) => {
      const symptomSet = last7Days.has(log.date)
        ? recentSymptoms
        : previous7Days.has(log.date)
        ? previousSymptoms
        : null;

      if (symptomSet) {
        Object.entries(log.symptoms).forEach(([symptom, hasSymptom]) => {
          if (hasSymptom && symptom !== "none") {
            symptomSet.set(symptom, (symptomSet.get(symptom) || 0) + 1);
          }
        });
      }
    });

    return {
      sortedSymptoms,
      recentSymptoms,
      previousSymptoms,
      totalLogs: logs.length,
      logsWithSymptoms: logs.filter((log) =>
        Object.entries(log.symptoms).some(
          ([symptom, hasSymptom]) => hasSymptom && symptom !== "none"
        )
      ).length,
      uniqueDates: symptomsByDate.size,
    };
  }, [logs]);

  // Get symptom color based on severity
  const getSymptomColor = (avgSeverity: number) => {
    if (avgSeverity <= 2) return "bg-green-100 text-green-800 border-green-200";
    if (avgSeverity <= 4)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (avgSeverity <= 6)
      return "bg-orange-100 text-orange-800 border-orange-200";
    if (avgSeverity <= 8) return "bg-red-100 text-red-800 border-red-200";
    return "bg-purple-100 text-purple-800 border-purple-200";
  };

  // Format symptom name
  const formatSymptomName = (symptom: string) => {
    return symptom
      .split(/(?=[A-Z])/)
      .join(" ")
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  // Calculate trend
  const getTrend = (symptom: string) => {
    const recent = symptomsData.recentSymptoms.get(symptom) || 0;
    const previous = symptomsData.previousSymptoms.get(symptom) || 0;

    if (previous === 0) return recent > 0 ? "+" : "=";

    const change = ((recent - previous) / previous) * 100;
    if (Math.abs(change) < 10) return "=";
    return change > 0 ? "+" : "-";
  };

  return (
    <Card className={detailed ? "col-span-full" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Symptoms Analysis
          {detailed && (
            <Badge variant="outline">
              {symptomsData.logsWithSymptoms}/{symptomsData.totalLogs} episodes
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {symptomsData.sortedSymptoms.length > 0 ? (
          <div className="space-y-4">
            {/* Symptoms List */}
            <div className="space-y-3">
              {symptomsData.sortedSymptoms
                .slice(0, detailed ? 15 : 8)
                .map(
                  ({
                    symptom,
                    count,
                    percentage,
                    avgSeverity,
                    maxSeverity,
                  }) => {
                    const trend = getTrend(symptom);

                    return (
                      <div key={symptom} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getSymptomColor(avgSeverity)}>
                              {formatSymptomName(symptom)}
                            </Badge>
                            {detailed && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <TrendingUp
                                  className={`h-3 w-3 ${
                                    trend === "+"
                                      ? "text-red-500"
                                      : trend === "-"
                                      ? "text-green-500 rotate-180"
                                      : "text-gray-400"
                                  }`}
                                />
                                <span>
                                  {trend === "="
                                    ? "Stable"
                                    : trend === "+"
                                    ? "Increasing"
                                    : "Decreasing"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {count} times
                            </div>
                            <div className="text-xs text-gray-500">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        {detailed && (
                          <div className="ml-4 space-y-1">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>
                                Pain correlation (avg: {avgSeverity}/10)
                              </span>
                              <span>peak: {maxSeverity}/10</span>
                            </div>
                            <Progress
                              value={(avgSeverity / 10) * 100}
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
            </div>

            {detailed && (
              <>
                {/* Weekly Comparison */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Symptom Trends (Last 7 Days)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">
                        Recent Week
                      </h5>
                      {Array.from(symptomsData.recentSymptoms.entries())
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([symptom, count]) => (
                          <div
                            key={symptom}
                            className="flex justify-between text-sm"
                          >
                            <span>{formatSymptomName(symptom)}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">
                        Previous Week
                      </h5>
                      {Array.from(symptomsData.previousSymptoms.entries())
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([symptom, count]) => (
                          <div
                            key={symptom}
                            className="flex justify-between text-sm"
                          >
                            <span>{formatSymptomName(symptom)}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="pt-4 border-t bg-orange-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-orange-900">
                        {symptomsData.sortedSymptoms.length}
                      </div>
                      <div className="text-sm text-orange-700">
                        Unique Symptoms
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-900">
                        {Math.round(
                          (symptomsData.logsWithSymptoms /
                            symptomsData.totalLogs) *
                            100
                        )}
                        %
                      </div>
                      <div className="text-sm text-orange-700">
                        Episodes w/ Symptoms
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-900">
                        {symptomsData.uniqueDates}
                      </div>
                      <div className="text-sm text-orange-700">
                        Days Affected
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Symptoms Reported
            </h3>
            <p className="text-gray-500">
              No symptoms have been recorded in the selected period.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
