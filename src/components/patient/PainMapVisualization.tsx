"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserLogData, PainHeatmapData, PainStroke } from "@/types/user-logs";
import { RotateCcw, RotateCw, User, Brain } from "lucide-react";

interface PainMapVisualizationProps {
  heatmapData: PainHeatmapData[];
  logs: UserLogData[];
}

interface HeadView {
  id: "front" | "back" | "left" | "right";
  label: string;
  icon: React.ReactNode;
}

const HEAD_VIEWS: HeadView[] = [
  { id: "front", label: "Front", icon: <User className="h-4 w-4" /> },
  { id: "back", label: "Back", icon: <RotateCcw className="h-4 w-4" /> },
  { id: "left", label: "Left", icon: <RotateCw className="h-4 w-4" /> },
  {
    id: "right",
    label: "Right",
    icon: <RotateCw className="h-4 w-4 scale-x-[-1]" />,
  },
];

export function PainMapVisualization({
  heatmapData,
  logs,
}: PainMapVisualizationProps) {
  const [activeView, setActiveView] = useState<
    "front" | "back" | "left" | "right"
  >("front");
  const [intensityFilter, setIntensityFilter] = useState<number>(0); // 0 = show all

  // Get current view data
  const currentViewData = useMemo(
    () => heatmapData.find((data) => data.view === activeView),
    [heatmapData, activeView]
  );

  // Filter logs by intensity - check if any stroke in the current view meets the intensity filter
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const strokesForView = log.painStrokes[activeView] || [];
      if (intensityFilter === 0) return strokesForView.length > 0;
      return strokesForView.some((stroke) => stroke.level >= intensityFilter);
    });
  }, [logs, activeView, intensityFilter]);

  // Filter points by intensity (for statistics)
  const filteredPoints = useMemo(() => {
    if (!currentViewData) return [];
    return currentViewData.points.filter(
      (point) => point.intensity >= intensityFilter
    );
  }, [currentViewData, intensityFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    // Count all strokes across all views and logs
    let totalStrokes = 0;
    let totalIntensity = 0;
    let maxIntensity = 0;

    logs.forEach((log) => {
      Object.values(log.painStrokes).forEach((strokes) => {
        strokes.forEach((stroke: PainStroke) => {
          totalStrokes++;
          totalIntensity += stroke.level;
          maxIntensity = Math.max(maxIntensity, stroke.level);
        });
      });
    });

    const avgIntensity = totalStrokes > 0 ? totalIntensity / totalStrokes : 0;

    return {
      totalStrokes,
      avgIntensity: Number(avgIntensity.toFixed(1)),
      maxIntensity: Number(maxIntensity.toFixed(1)),
      logsWithPainData: logs.filter((log) =>
        Object.values(log.painStrokes).some((strokes) => strokes.length > 0)
      ).length,
    };
  }, [logs]);

  // Get intensity color
  const getIntensityColor = (intensity: number, maxIntensity: number) => {
    const normalizedIntensity = intensity / Math.max(maxIntensity, 5); // Scale to max 5 or actual max
    const opacity = Math.max(0.3, normalizedIntensity); // Minimum opacity for visibility

    if (intensity <= 1) return `rgba(34, 197, 94, ${opacity})`; // Green
    if (intensity <= 2) return `rgba(234, 179, 8, ${opacity})`; // Yellow
    if (intensity <= 3) return `rgba(249, 115, 22, ${opacity})`; // Orange
    if (intensity <= 4) return `rgba(239, 68, 68, ${opacity})`; // Red
    return `rgba(147, 51, 234, ${opacity})`; // Purple
  };

  // SVG Head Outline Component
  const HeadOutline = ({
    view,
  }: {
    view: "front" | "back" | "left" | "right";
  }) => {
    const getHeadShape = () => {
      switch (view) {
        case "front":
        case "back":
          return (
            <ellipse
              cx="50"
              cy="45"
              rx="35"
              ry="40"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="2"
            />
          );
        case "left":
        case "right":
          return (
            <ellipse
              cx="50"
              cy="45"
              rx="30"
              ry="40"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="2"
            />
          );
        default:
          return null;
      }
    };

    return (
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full absolute inset-0"
        style={{ aspectRatio: "1" }}
      >
        {getHeadShape()}

        {/* Facial features for front view */}
        {view === "front" && (
          <>
            {/* Eyes */}
            <circle cx="40" cy="35" r="2" fill="#d1d5db" />
            <circle cx="60" cy="35" r="2" fill="#d1d5db" />
            {/* Nose */}
            <line
              x1="50"
              y1="40"
              x2="50"
              y2="50"
              stroke="#d1d5db"
              strokeWidth="1"
            />
            {/* Mouth */}
            <path
              d="M 45 55 Q 50 60 55 55"
              stroke="#d1d5db"
              strokeWidth="1"
              fill="none"
            />
          </>
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pain Strokes</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStrokes}</div>
            <p className="text-xs text-muted-foreground">Drawn areas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Intensity</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgIntensity}</div>
            <p className="text-xs text-muted-foreground">Out of 5</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Intensity</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maxIntensity}</div>
            <p className="text-xs text-muted-foreground">Peak level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Episodes</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.logsWithPainData}</div>
            <p className="text-xs text-muted-foreground">With pain data</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Pain Map */}
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pain Location Map</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Intensity Filter:</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <Button
                    key={level}
                    variant={intensityFilter === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIntensityFilter(level)}
                  >
                    {level === 0 ? "All" : `${level}+`}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 max-w-full overflow-hidden">
          <div className="space-y-4 w-full">
            {/* View Selector */}
            <Tabs
              value={activeView}
              onValueChange={(value: any) => setActiveView(value)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 max-w-full">
                {HEAD_VIEWS.map((view) => (
                  <TabsTrigger
                    key={view.id}
                    value={view.id}
                    className="flex items-center gap-2"
                  >
                    {view.icon}
                    {view.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {HEAD_VIEWS.map((view) => (
                <TabsContent key={view.id} value={view.id}>
                  <div className="relative bg-gray-50 rounded-lg p-4 min-h-[300px] md:min-h-[400px] flex items-center justify-center overflow-hidden">
                    <div className="relative w-full max-w-80 h-64 md:h-80 aspect-square">
                      {/* Head Outline */}
                      <HeadOutline view={view.id} />

                      {/* Pain Stroke Paths */}
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full absolute inset-0"
                        style={{ aspectRatio: "1" }}
                      >
                        {/* Render pain strokes as paths */}
                        {filteredLogs
                          .filter(
                            (log) =>
                              log.painStrokes[view.id] &&
                              log.painStrokes[view.id].length > 0
                          )
                          .map((log, logIndex) =>
                            log.painStrokes[view.id].map(
                              (stroke, strokeIndex) => {
                                if (stroke.points.length < 2) return null;

                                // Create SVG path from stroke points
                                const pathData = stroke.points
                                  .map((point, index) => {
                                    const x = point.x * 100;
                                    const y = point.y * 100;
                                    return index === 0
                                      ? `M ${x} ${y}`
                                      : `L ${x} ${y}`;
                                  })
                                  .join(" ");

                                return (
                                  <g key={`${logIndex}-${strokeIndex}`}>
                                    {/* Pain stroke path */}
                                    <path
                                      d={pathData}
                                      fill="none"
                                      stroke={getIntensityColor(
                                        stroke.level,
                                        5
                                      )}
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      opacity="0.8"
                                    >
                                      <title>
                                        Pain Level: {stroke.level}/5 Date:{" "}
                                        {log.date}
                                        Time: {log.time}
                                      </title>
                                    </path>

                                    {/* Add subtle glow effect for higher intensity */}
                                    {stroke.level >= 3 && (
                                      <path
                                        d={pathData}
                                        fill="none"
                                        stroke={getIntensityColor(
                                          stroke.level,
                                          5
                                        )}
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        opacity="0.3"
                                      />
                                    )}
                                  </g>
                                );
                              }
                            )
                          )}
                      </svg>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            {/* Legend */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-semibold text-gray-700">
                  Pain Intensity Scale:
                </span>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div key={level} className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: getIntensityColor(level, 5) }}
                      />
                      <span className="text-xs font-medium text-gray-600">
                        {level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm">
                  <span className="font-medium">
                    {filteredLogs.reduce(
                      (total, log) =>
                        total + (log.painStrokes[activeView]?.length || 0),
                      0
                    )}
                  </span>
                  <span>strokes from</span>
                  <span className="font-medium">{filteredLogs.length}</span>
                  <span>episodes</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                How to Read This Pain Map
              </h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-800">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Colored lines show drawn pain areas</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Colors indicate intensity (green→red)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Overlapping strokes create heat map effect</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Hover for detailed pain info</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Switch views to see all angles</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Filter by intensity levels</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No Data State */}
      {stats.totalStrokes === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Pain Location Data
            </h3>
            <p className="text-gray-500">
              No pain location sketches have been recorded for this patient.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
