"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar,
  Brain,
  Heart,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { UserLogData, UserLogFeeling } from "@/types/user-logs";

interface TimelineViewProps {
  logs: UserLogData[];
  feelings: UserLogFeeling[];
}

interface TimelineEvent {
  date: string;
  time: string;
  type: "pain" | "feeling";
  data: UserLogData | UserLogFeeling;
  severity?: number;
  emotions?: string[];
  symptoms?: string[];
}

export function TimelineView({ logs, feelings }: TimelineViewProps) {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<"all" | "pain" | "feeling">(
    "all"
  );
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Combine and sort events
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Add pain logs
    logs.forEach((log) => {
      const symptoms = Object.entries(log.symptoms)
        .filter(([, hasSymptom]) => hasSymptom)
        .map(([symptom]) => symptom)
        .filter((symptom) => symptom !== "none");

      events.push({
        date: log.date,
        time: log.time,
        type: "pain",
        data: log,
        severity: log.severity,
        symptoms,
      });
    });

    // Add feeling logs
    feelings.forEach((feeling) => {
      events.push({
        date: feeling.date,
        time: feeling.time,
        type: "feeling",
        data: feeling,
        emotions: feeling.feelings,
      });
    });

    // Filter by type
    const filtered =
      filterType === "all"
        ? events
        : events.filter((e) => e.type === filterType);

    // Sort by date and time
    return filtered.sort((a, b) => {
      const dateCompare =
        sortOrder === "desc"
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();

      if (dateCompare !== 0) return dateCompare;

      return sortOrder === "desc"
        ? b.time.localeCompare(a.time)
        : a.time.localeCompare(b.time);
    });
  }, [logs, feelings, filterType, sortOrder]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, TimelineEvent[]>();

    timelineEvents.forEach((event) => {
      if (!groups.has(event.date)) {
        groups.set(event.date, []);
      }
      groups.get(event.date)!.push(event);
    });

    return Array.from(groups.entries()).map(([date, events]) => ({
      date,
      events: events.sort((a, b) =>
        sortOrder === "desc"
          ? b.time.localeCompare(a.time)
          : a.time.localeCompare(b.time)
      ),
    }));
  }, [timelineEvents, sortOrder]);

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split("T")[0]) {
      return "Today";
    } else if (dateStr === yesterday.toISOString().split("T")[0]) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 2) return "bg-green-100 text-green-800 border-green-200";
    if (severity <= 4) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (severity <= 6) return "bg-orange-100 text-orange-800 border-orange-200";
    if (severity <= 8) return "bg-red-100 text-red-800 border-red-200";
    return "bg-purple-100 text-purple-800 border-purple-200";
  };

  const getEventIcon = (event: TimelineEvent) => {
    if (event.type === "pain") {
      return <Brain className="h-4 w-4" />;
    } else {
      return <Heart className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Patient Timeline
            <Badge variant="outline">{timelineEvents.length} events</Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {(["all", "pain", "feeling"] as const).map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className={filterType === type ? "bg-white shadow-sm" : ""}
                >
                  {type === "all" ? (
                    <>
                      <Filter className="h-3 w-3 mr-1" />
                      All
                    </>
                  ) : type === "pain" ? (
                    <>
                      <Brain className="h-3 w-3 mr-1" />
                      Pain
                    </>
                  ) : (
                    <>
                      <Heart className="h-3 w-3 mr-1" />
                      Emotions
                    </>
                  )}
                </Button>
              ))}
            </div>

            {/* Sort order */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
            >
              <Calendar className="h-3 w-3 mr-1" />
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {groupedEvents.length > 0 ? (
          <div className="space-y-6">
            {groupedEvents.map(({ date, events }) => (
              <div key={date} className="relative">
                {/* Date header */}
                <div className="sticky top-0 bg-white z-10 flex items-center gap-3 mb-4 pb-2 border-b">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {formatDate(date)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {events.length} event{events.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Events for this date */}
                <div className="space-y-3 ml-4">
                  {events.map((event, eventIndex) => {
                    const eventId = `${date}-${event.time}-${event.type}-${eventIndex}`;
                    const isExpanded = expandedEvents.has(eventId);

                    return (
                      <div key={eventId} className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />

                        {/* Event marker */}
                        <div className="absolute left-0 top-2 w-2 h-2 bg-white border-2 border-gray-300 rounded-full transform -translate-x-1/2" />

                        {/* Event content */}
                        <div className="ml-6">
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div
                                    className={`p-2 rounded-lg ${
                                      event.type === "pain"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-blue-100 text-blue-600"
                                    }`}
                                  >
                                    {getEventIcon(event)}
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium">
                                        {event.type === "pain"
                                          ? "Pain Episode"
                                          : "Emotional State"}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        <Clock className="h-3 w-3 mr-1" />
                                        {formatTime(event.time)}
                                      </Badge>
                                    </div>

                                    {/* Quick summary */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      {event.type === "pain" &&
                                        event.severity !== undefined && (
                                          <Badge
                                            className={getSeverityColor(
                                              event.severity
                                            )}
                                          >
                                            Severity: {event.severity}/10
                                          </Badge>
                                        )}

                                      {event.emotions &&
                                        event.emotions.length > 0 && (
                                          <div className="flex gap-1">
                                            {event.emotions
                                              .slice(0, 3)
                                              .map((emotion) => (
                                                <Badge
                                                  key={emotion}
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
                                                  {emotion}
                                                </Badge>
                                              ))}
                                            {event.emotions.length > 3 && (
                                              <span className="text-xs text-gray-500">
                                                +{event.emotions.length - 3}{" "}
                                                more
                                              </span>
                                            )}
                                          </div>
                                        )}

                                      {event.symptoms &&
                                        event.symptoms.length > 0 && (
                                          <div className="flex gap-1">
                                            {event.symptoms
                                              .slice(0, 2)
                                              .map((symptom) => (
                                                <Badge
                                                  key={symptom}
                                                  variant="outline"
                                                  className="text-xs"
                                                >
                                                  {symptom
                                                    .replace(/([A-Z])/g, " $1")
                                                    .trim()}
                                                </Badge>
                                              ))}
                                            {event.symptoms.length > 2 && (
                                              <span className="text-xs text-gray-500">
                                                +{event.symptoms.length - 2}{" "}
                                                more
                                              </span>
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  </div>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      toggleEventExpansion(eventId)
                                    }
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Expanded details */}
                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t space-y-3">
                                  {event.type === "pain" && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium text-gray-700">
                                          Duration:
                                        </span>
                                        <span className="ml-2">
                                          {Math.round(
                                            (event.data as UserLogData)
                                              .duration / 60
                                          )}{" "}
                                          hours
                                        </span>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">
                                          Trigger:
                                        </span>
                                        <span className="ml-2">
                                          {(event.data as UserLogData)
                                            .trigger || "Not specified"}
                                        </span>
                                      </div>
                                      {(event.data as UserLogData).medications
                                        .length > 0 && (
                                        <div className="md:col-span-2">
                                          <span className="font-medium text-gray-700">
                                            Medications:
                                          </span>
                                          <div className="flex gap-1 mt-1">
                                            {(
                                              event.data as UserLogData
                                            ).medications.map((med, idx) => (
                                              <Badge
                                                key={idx}
                                                variant="outline"
                                              >
                                                {med}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {event.type === "feeling" && (
                                    <div className="text-sm">
                                      <span className="font-medium text-gray-700">
                                        All emotions recorded:
                                      </span>
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {(
                                          event.data as UserLogFeeling
                                        ).feelings.map((emotion) => (
                                          <Badge
                                            key={emotion}
                                            variant="secondary"
                                          >
                                            {emotion}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Timeline Data
            </h3>
            <p className="text-gray-500">
              No events found for the selected filters.
              {filterType !== "all" && " Try selecting a different filter."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
