"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Activity,
  TrendingUp,
  Brain,
  Heart,
  AlertCircle,
  BarChart3,
  Clock,
  MapPin,
  Filter,
} from "lucide-react";
import { Patient } from "@/types/medical";
import {
  UserLogData,
  UserLogFeeling,
  DailyLogSummary,
} from "@/types/user-logs";
import {
  processDailyLogSummaries,
  generatePainHeatmapData,
} from "@/lib/services/user-logs";
import { PainMapVisualization } from "@/components/patient/PainMapVisualization";
import { EmotionsChart } from "@/components/patient/EmotionsChart";
import { SymptomsChart } from "@/components/patient/SymptomsChart";
import { TimelineView } from "@/components/patient/TimelineView";
import { PainTrendsChart } from "@/components/patient/PainTrendsChart";

interface PatientHistoryDashboardProps {
  patient: Patient;
  userLogs: UserLogData[];
  feelings: UserLogFeeling[];
}

export function PatientHistoryDashboard({
  patient,
  userLogs,
  feelings,
}: PatientHistoryDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">(
    "30d"
  );

  // Process data
  const dailySummaries = useMemo(
    () => processDailyLogSummaries(userLogs, feelings),
    [userLogs, feelings]
  );

  const painHeatmapData = useMemo(
    () => generatePainHeatmapData(userLogs),
    [userLogs]
  );

  // Filter data based on date range
  const filteredLogs = useMemo(() => {
    if (dateRange === "all") return userLogs;

    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return userLogs.filter((log) => new Date(log.date) >= cutoffDate);
  }, [userLogs, dateRange]);

  const filteredFeelings = useMemo(() => {
    if (dateRange === "all") return feelings;

    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return feelings.filter((feeling) => new Date(feeling.date) >= cutoffDate);
  }, [feelings, dateRange]);

  // Calculate overview statistics
  const stats = useMemo(() => {
    const avgPainLevel =
      filteredLogs.length > 0
        ? filteredLogs.reduce((sum, log) => sum + log.severity, 0) /
          filteredLogs.length
        : 0;

    const totalDuration = filteredLogs.reduce(
      (sum, log) => sum + log.duration,
      0
    );

    const uniqueSymptoms = new Set<string>();
    filteredLogs.forEach((log) => {
      Object.entries(log.symptoms).forEach(([symptom, hasSymptom]) => {
        if (hasSymptom && symptom !== "none") {
          uniqueSymptoms.add(symptom);
        }
      });
    });

    const uniqueEmotions = new Set<string>();
    filteredFeelings.forEach((feeling) => {
      feeling.feelings.forEach((emotion) => uniqueEmotions.add(emotion));
    });

    return {
      avgPainLevel: Number(avgPainLevel.toFixed(1)),
      totalDuration: Math.round(totalDuration / 60), // Convert to hours
      uniqueSymptoms: uniqueSymptoms.size,
      uniqueEmotions: uniqueEmotions.size,
      totalLogs: filteredLogs.length,
      daysWithData: new Set(filteredLogs.map((log) => log.date)).size,
    };
  }, [filteredLogs, filteredFeelings]);

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case "7d":
        return "Last 7 Days";
      case "30d":
        return "Last 30 Days";
      case "90d":
        return "Last 90 Days";
      case "all":
        return "All Time";
      default:
        return "Last 30 Days";
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Patient History Dashboard
        </h2>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(["7d", "30d", "90d", "all"] as const).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? "default" : "ghost"}
                size="sm"
                onClick={() => setDateRange(range)}
                className={dateRange === range ? "bg-white shadow-sm" : ""}
              >
                {range === "7d"
                  ? "7D"
                  : range === "30d"
                  ? "30D"
                  : range === "90d"
                  ? "90D"
                  : "All"}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Pain Level
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPainLevel}</div>
            <p className="text-xs text-muted-foreground">
              {getDateRangeLabel()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Duration
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDuration}h</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.totalLogs} episodes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Symptoms Tracked
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueSymptoms}</div>
            <p className="text-xs text-muted-foreground">Different symptoms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Emotions Logged
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueEmotions}</div>
            <p className="text-xs text-muted-foreground">Different emotions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="pain-map" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Pain Map
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="emotions" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Emotions
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PainTrendsChart logs={filteredLogs} />
            <SymptomsChart logs={filteredLogs} />
          </div>
          <EmotionsChart feelings={filteredFeelings} />
        </TabsContent>

        <TabsContent value="pain-map" className="space-y-6">
          <PainMapVisualization
            heatmapData={painHeatmapData}
            logs={filteredLogs}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <PainTrendsChart logs={filteredLogs} detailed />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SymptomsChart logs={filteredLogs} />
              <EmotionsChart feelings={filteredFeelings} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="emotions" className="space-y-6">
          <EmotionsChart feelings={filteredFeelings} detailed />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <TimelineView logs={filteredLogs} feelings={filteredFeelings} />
        </TabsContent>
      </Tabs>

      {/* No Data State */}
      {filteredLogs.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Data Available
            </h3>
            <p className="text-gray-500">
              No pain logs found for the selected time period.
              {dateRange !== "all" && " Try selecting a different date range."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
