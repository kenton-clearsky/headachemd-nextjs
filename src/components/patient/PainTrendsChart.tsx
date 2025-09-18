"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { UserLogData } from "@/types/user-logs";

interface PainTrendsChartProps {
  logs: UserLogData[];
  detailed?: boolean;
}

interface DayData {
  date: string;
  avgPain: number;
  maxPain: number;
  episodeCount: number;
  totalDuration: number;
}

export function PainTrendsChart({
  logs,
  detailed = false,
}: PainTrendsChartProps) {
  // Process pain trends data
  const trendsData = useMemo(() => {
    if (logs.length === 0)
      return { dayData: [], trend: "stable", weeklyAverage: 0 };

    // Group by date and calculate daily statistics
    const dailyData = new Map<
      string,
      { pains: number[]; durations: number[] }
    >();

    logs.forEach((log) => {
      if (!dailyData.has(log.date)) {
        dailyData.set(log.date, { pains: [], durations: [] });
      }
      const dayData = dailyData.get(log.date)!;
      dayData.pains.push(log.severity);
      dayData.durations.push(log.duration);
    });

    // Convert to chart data
    const dayData: DayData[] = Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        avgPain: data.pains.reduce((sum, p) => sum + p, 0) / data.pains.length,
        maxPain: Math.max(...data.pains),
        episodeCount: data.pains.length,
        totalDuration: data.durations.reduce((sum, d) => sum + d, 0),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate trend
    const recentDays = dayData.slice(-7);
    const previousDays = dayData.slice(-14, -7);

    const recentAvg =
      recentDays.length > 0
        ? recentDays.reduce((sum, d) => sum + d.avgPain, 0) / recentDays.length
        : 0;
    const previousAvg =
      previousDays.length > 0
        ? previousDays.reduce((sum, d) => sum + d.avgPain, 0) /
          previousDays.length
        : recentAvg;

    let trend: "improving" | "worsening" | "stable" = "stable";
    const change = recentAvg - previousAvg;
    if (Math.abs(change) > 0.5) {
      trend = change < 0 ? "improving" : "worsening";
    }

    const weeklyAverage =
      recentDays.length > 0
        ? recentDays.reduce((sum, d) => sum + d.avgPain, 0) / recentDays.length
        : 0;

    return { dayData, trend, weeklyAverage, change };
  }, [logs]);

  // Get max values for scaling
  const maxPain = Math.max(...trendsData.dayData.map((d) => d.maxPain), 10);
  const maxEpisodes = Math.max(
    ...trendsData.dayData.map((d) => d.episodeCount),
    1
  );

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Get trend icon and color
  const getTrendIcon = () => {
    switch (trendsData.trend) {
      case "improving":
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      case "worsening":
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trendsData.trend) {
      case "improving":
        return "text-green-600 bg-green-50 border-green-200";
      case "worsening":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card className={detailed ? "col-span-full" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Pain Trends
          </CardTitle>
          <Badge className={`border ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1 capitalize">{trendsData.trend}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {trendsData.dayData.length > 0 ? (
          <div className="space-y-6">
            {/* Chart */}
            <div className="relative h-64 bg-gray-50 rounded-lg p-4 pl-12 overflow-hidden">
              <div className="flex items-end justify-between h-full gap-1 overflow-x-auto">
                {trendsData.dayData
                  .slice(detailed ? -30 : -14)
                  .map((day, index) => (
                    <div
                      key={day.date}
                      className="flex flex-col items-center min-w-[40px] group"
                    >
                      {/* Pain level bar */}
                      <div className="relative flex flex-col items-center justify-end h-48 w-6">
                        {/* Max pain bar (background) */}
                        <div
                          className="absolute bottom-0 w-full bg-red-200 rounded-sm"
                          style={{
                            height: `${(day.maxPain / maxPain) * 100}%`,
                            minHeight: day.maxPain > 0 ? "2px" : "0",
                          }}
                        />

                        {/* Average pain bar (foreground) */}
                        <div
                          className="absolute bottom-0 w-full bg-red-500 rounded-sm"
                          style={{
                            height: `${(day.avgPain / maxPain) * 100}%`,
                            minHeight: day.avgPain > 0 ? "2px" : "0",
                          }}
                        />

                        {/* Episode count indicator */}
                        <div className="absolute -top-2 w-full flex justify-center">
                          <div
                            className="bg-blue-500 rounded-full text-white text-xs flex items-center justify-center"
                            style={{
                              width: `${Math.max(
                                16,
                                (day.episodeCount / maxEpisodes) * 20
                              )}px`,
                              height: `${Math.max(
                                16,
                                (day.episodeCount / maxEpisodes) * 20
                              )}px`,
                              fontSize: day.episodeCount > 9 ? "10px" : "12px",
                            }}
                          >
                            {day.episodeCount}
                          </div>
                        </div>
                      </div>

                      {/* Date label */}
                      <div className="text-xs text-gray-600 mt-2 text-center max-w-[40px] leading-tight">
                        {formatDate(day.date)}
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none z-10 whitespace-nowrap">
                        <div>Date: {formatDate(day.date)}</div>
                        <div>Avg Pain: {day.avgPain.toFixed(1)}/10</div>
                        <div>Max Pain: {day.maxPain}/10</div>
                        <div>Episodes: {day.episodeCount}</div>
                        <div>
                          Duration: {Math.round(day.totalDuration / 60)}h
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Y-axis labels */}
              <div className="absolute left-2 top-4 bottom-4 flex flex-col justify-between text-xs text-gray-500">
                <span>10</span>
                <span>8</span>
                <span>6</span>
                <span>4</span>
                <span>2</span>
                <span>0</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-sm flex-shrink-0" />
                <span className="text-gray-700 font-medium">Avg Pain</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-200 rounded-sm flex-shrink-0" />
                <span className="text-gray-700 font-medium">Max Pain</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />
                <span className="text-gray-700 font-medium">Episodes</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-200">
              <div className="text-center bg-white rounded-lg p-3 border border-gray-100">
                <div className="text-xl md:text-2xl font-bold text-blue-600">
                  {trendsData.weeklyAverage.toFixed(1)}
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">
                  Weekly Avg
                </div>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border border-gray-100">
                <div className="text-xl md:text-2xl font-bold text-red-600">
                  {Math.max(...trendsData.dayData.map((d) => d.maxPain), 0)}
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">
                  Peak Pain
                </div>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border border-gray-100">
                <div className="text-xl md:text-2xl font-bold text-purple-600">
                  {trendsData.dayData.reduce(
                    (sum, d) => sum + d.episodeCount,
                    0
                  )}
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">
                  Episodes
                </div>
              </div>
              <div className="text-center bg-white rounded-lg p-3 border border-gray-100">
                <div className="text-xl md:text-2xl font-bold text-green-600">
                  {Math.round(
                    trendsData.dayData.reduce(
                      (sum, d) => sum + d.totalDuration,
                      0
                    ) / 60
                  )}
                  h
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">
                  Duration
                </div>
              </div>
            </div>

            {detailed && trendsData.change !== undefined && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Trend Analysis
                </h4>
                <p className="text-sm text-blue-800">
                  Pain levels have been{" "}
                  <span className="font-medium">
                    {trendsData.trend === "improving"
                      ? "improving"
                      : trendsData.trend === "worsening"
                      ? "worsening"
                      : "stable"}
                  </span>{" "}
                  over the last 7 days compared to the previous week.
                  {Math.abs(trendsData.change) > 0.1 && (
                    <>
                      {" "}
                      Average pain has{" "}
                      {trendsData.change < 0
                        ? "decreased"
                        : "increased"} by{" "}
                      <span className="font-medium">
                        {Math.abs(trendsData.change).toFixed(1)} points
                      </span>
                      .
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Pain Data
            </h3>
            <p className="text-gray-500">No pain data has been recorded yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
