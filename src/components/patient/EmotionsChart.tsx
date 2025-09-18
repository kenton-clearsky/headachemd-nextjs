"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, TrendingUp } from "lucide-react";
import { UserLogFeeling } from "@/types/user-logs";

interface EmotionsChartProps {
  feelings: UserLogFeeling[];
  detailed?: boolean;
}

export function EmotionsChart({
  feelings,
  detailed = false,
}: EmotionsChartProps) {
  // Process emotions data
  const emotionsData = useMemo(() => {
    const emotionCounts = new Map<string, number>();
    const emotionsByDate = new Map<string, Set<string>>();

    feelings.forEach((feeling) => {
      feeling.feelings.forEach((emotion) => {
        // Count total occurrences
        emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);

        // Track emotions by date
        if (!emotionsByDate.has(feeling.date)) {
          emotionsByDate.set(feeling.date, new Set());
        }
        emotionsByDate.get(feeling.date)!.add(emotion);
      });
    });

    // Convert to sorted array
    const sortedEmotions = Array.from(emotionCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: (count / feelings.length) * 100,
      }));

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

    const recentEmotions = new Map<string, number>();
    const previousEmotions = new Map<string, number>();

    feelings.forEach((feeling) => {
      const emotionSet = last7Days.has(feeling.date)
        ? recentEmotions
        : previous7Days.has(feeling.date)
        ? previousEmotions
        : null;

      if (emotionSet) {
        feeling.feelings.forEach((emotion) => {
          emotionSet.set(emotion, (emotionSet.get(emotion) || 0) + 1);
        });
      }
    });

    return {
      sortedEmotions,
      recentEmotions,
      previousEmotions,
      totalSessions: feelings.length,
      uniqueDates: emotionsByDate.size,
    };
  }, [feelings]);

  // Get emotion color
  const getEmotionColor = (emotion: string) => {
    const positiveEmotions = [
      "happy",
      "content",
      "excited",
      "grateful",
      "peaceful",
      "confident",
    ];
    const negativeEmotions = [
      "anxious",
      "sad",
      "angry",
      "frustrated",
      "worried",
      "depressed",
    ];
    const neutralEmotions = ["tired", "calm", "focused", "neutral"];

    const lowerEmotion = emotion.toLowerCase();

    if (positiveEmotions.some((pos) => lowerEmotion.includes(pos))) {
      return "bg-green-100 text-green-800 border-green-200";
    } else if (negativeEmotions.some((neg) => lowerEmotion.includes(neg))) {
      return "bg-red-100 text-red-800 border-red-200";
    } else {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // Calculate trend
  const getTrend = (emotion: string) => {
    const recent = emotionsData.recentEmotions.get(emotion) || 0;
    const previous = emotionsData.previousEmotions.get(emotion) || 0;

    if (previous === 0) return recent > 0 ? "+" : "=";

    const change = ((recent - previous) / previous) * 100;
    if (Math.abs(change) < 10) return "=";
    return change > 0 ? "+" : "-";
  };

  return (
    <Card className={detailed ? "col-span-full" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Emotional Patterns
          {detailed && (
            <Badge variant="outline">
              {emotionsData.totalSessions} sessions
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {emotionsData.sortedEmotions.length > 0 ? (
          <div className="space-y-4">
            {/* Top Emotions */}
            <div className="grid grid-cols-1 gap-3">
              {emotionsData.sortedEmotions
                .slice(0, detailed ? 15 : 8)
                .map(({ emotion, count, percentage }) => {
                  const trend = getTrend(emotion);

                  return (
                    <div
                      key={emotion}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={getEmotionColor(emotion)}>
                          {emotion}
                        </Badge>
                        {detailed && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <TrendingUp
                              className={`h-3 w-3 ${
                                trend === "+"
                                  ? "text-green-500"
                                  : trend === "-"
                                  ? "text-red-500 rotate-180"
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
                        <div className="text-sm font-medium">{count} times</div>
                        <div className="text-xs text-gray-500">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {detailed && (
              <>
                {/* Weekly Comparison */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Recent Trends (Last 7 Days)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">
                        Most Recent
                      </h5>
                      {Array.from(emotionsData.recentEmotions.entries())
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([emotion, count]) => (
                          <div
                            key={emotion}
                            className="flex justify-between text-sm"
                          >
                            <span className="capitalize">{emotion}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">
                        Previous Week
                      </h5>
                      {Array.from(emotionsData.previousEmotions.entries())
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([emotion, count]) => (
                          <div
                            key={emotion}
                            className="flex justify-between text-sm"
                          >
                            <span className="capitalize">{emotion}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="pt-4 border-t bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-900">
                        {emotionsData.sortedEmotions.length}
                      </div>
                      <div className="text-sm text-blue-700">
                        Unique Emotions
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-900">
                        {emotionsData.totalSessions}
                      </div>
                      <div className="text-sm text-blue-700">
                        Total Sessions
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-900">
                        {emotionsData.uniqueDates}
                      </div>
                      <div className="text-sm text-blue-700">Days Tracked</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Emotional Data
            </h3>
            <p className="text-gray-500">
              No emotional data has been recorded yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
