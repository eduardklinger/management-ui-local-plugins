/**
 * Statistics Dashboard View
 *
 * Displays Opencast event statistics with beautiful animations.
 * Fetches data from /admin-ng/resources/STATS.json
 */

import { BarChart3, Calendar, CheckCircle2, Clock, Play, XCircle, AlertCircle } from "lucide-react";
import React, { useMemo } from "react";
import { useQuery, useQueries } from "@workspace/query";
import { useGetMyEventsQuery, EventFilter } from "@workspace/query";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components";

/**
 * Stat configuration from STATS.json
 */
interface StatConfig {
  filters: Array<{
    name: string;
    filter: string;
    value: string | { relativeDateSpan: { from: string; to: string; unit: string } };
  }>;
  description: string;
  order: number;
}

/**
 * Stats response from API
 */
interface StatsResponse {
  [key: string]: string; // JSON string of StatConfig
}

/**
 * Parsed stat item
 */
interface StatItem {
  key: string;
  config: StatConfig;
  count?: number; // Will be fetched separately if needed
}

/**
 * Convert STATS.json filter value to GraphQL EventFilter enum
 */
const convertStatusToEventFilter = (value: string): EventFilter | null => {
  // Extract the status from values like "EVENTS.EVENTS.STATUS.PROCESSED"
  const statusMatch = value.match(/STATUS\.(\w+)$/);
  if (statusMatch) {
    const status = statusMatch[1];
    // Map to EventFilter enum
    const statusMap: Record<string, EventFilter> = {
      PROCESSED: EventFilter.Processed,
      PROCESSING: EventFilter.Processing,
      PROCESSING_FAILURE: EventFilter.ProcessingFailure,
      SCHEDULED: EventFilter.Scheduled,
      RECORDING: EventFilter.Recording,
      INGESTING: EventFilter.Ingesting,
      PAUSED: EventFilter.Paused,
      PENDING: EventFilter.Pending,
    };
    return statusMap[status] || null;
  }
  return null;
};

/**
 * Build GraphQL query string from filters
 * 
 * Query format: The backend expects a simple query string format like:
 * - Single filter: "status:PROCESSED"
 * - Multiple filters: "status:PROCESSED AND comments:OPEN"
 * - Date range: "startDate:2025-01-21..2025-01-22"
 * 
 * Note: While eventStatus in GraphQL responses uses the full format
 * (e.g., "EVENTS.EVENTS.STATUS.PROCESSED"), the query parameter uses
 * just the status part (e.g., "PROCESSED") matching the EventFilter enum.
 * 
 * Status values should match the EventFilter enum (uppercase):
 * PROCESSED, PROCESSING, PROCESSING_FAILURE, SCHEDULED, RECORDING, etc.
 */
const buildQueryString = (filters: StatConfig["filters"]): string => {
  const queryParts: string[] = [];

  for (const filter of filters) {
    if (filter.name === "status" && typeof filter.value === "string") {
      // Extract status from values like "EVENTS.EVENTS.STATUS.PROCESSED"
      // or "EVENTS.EVENTS.STATUS.PROCESSING_FAILURE"
      // The regex captures everything after STATUS. including underscores
      const statusMatch = filter.value.match(/STATUS\.([A-Z_]+)$/);
      if (statusMatch) {
        const status = statusMatch[1]; // Already uppercase, includes underscores
        queryParts.push(`status:${status}`);
      } else {
        // Fallback: if format doesn't match, try using the value as-is
        // (in case it's already in the correct format)
        console.warn(`[StatsDashboard] Unexpected status format: "${filter.value}"`);
      }
    } else if (filter.name === "comments" && filter.value === "OPEN") {
      queryParts.push("comments:OPEN");
    } else if (filter.name === "startDate" && typeof filter.value === "object") {
      // Handle relative date spans - for TODAY, use today's date
      if (filter.value.relativeDateSpan?.from === "0" && filter.value.relativeDateSpan?.to === "0") {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);
        // Format: startDate:YYYY-MM-DD..YYYY-MM-DD
        const startStr = startOfDay.toISOString().split("T")[0];
        const endStr = endOfDay.toISOString().split("T")[0];
        queryParts.push(`startDate:${startStr}..${endStr}`);
      }
    }
  }

  const queryString = queryParts.join(" AND ");
  
  // Debug logging (remove in production if needed)
  if (queryString && import.meta.env.DEV) {
    console.log(`[StatsDashboard] Built query string: "${queryString}"`);
  }
  
  return queryString;
};

/**
 * Icon mapping for different stat types
 */
const getStatIcon = (key: string): React.ComponentType<{ className?: string }> => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    TODAY: Calendar,
    SCHEDULED: Clock,
    RECORDING: Play,
    RUNNING: BarChart3,
    FINISHED: CheckCircle2,
    FINISHED_WITH_COMMENTS: CheckCircle2,
    FAILED: XCircle,
  };
  const IconComponent = iconMap[key] || AlertCircle;
  // Ensure we return a valid component
  return IconComponent as React.ComponentType<{ className?: string }>;
};

/**
 * Color mapping for different stat types (for icons) - returns hex color for inline styles
 */
const getStatColor = (key: string): string => {
  const colorMap: Record<string, string> = {
    TODAY: "#3b82f6", // blue-500
    SCHEDULED: "#eab308", // yellow-500
    RECORDING: "#a855f7", // purple-500
    RUNNING: "#f97316", // orange-500
    FINISHED: "#22c55e", // green-500
    FINISHED_WITH_COMMENTS: "#10b981", // emerald-500
    FAILED: "#ef4444", // red-500
  };
  return colorMap[key] || "#6b7280"; // gray-500
};

/**
 * Get Tailwind class for icon background (for the accent line)
 */
const getStatColorClass = (key: string): string => {
  const colorMap: Record<string, string> = {
    TODAY: "bg-blue-500",
    SCHEDULED: "bg-yellow-500",
    RECORDING: "bg-purple-500",
    RUNNING: "bg-orange-500",
    FINISHED: "bg-green-500",
    FINISHED_WITH_COMMENTS: "bg-emerald-500",
    FAILED: "bg-red-500",
  };
  return colorMap[key] || "bg-gray-500";
};

/**
 * Background color mapping for cards (subtle tints)
 */
const getCardBackgroundColor = (key: string): string => {
  const colorMap: Record<string, string> = {
    TODAY: "rgba(59, 130, 246, 0.05)", // blue-500 with low opacity
    SCHEDULED: "rgba(234, 179, 8, 0.05)", // yellow-500
    RECORDING: "rgba(168, 85, 247, 0.05)", // purple-500
    RUNNING: "rgba(249, 115, 22, 0.05)", // orange-500
    FINISHED: "rgba(34, 197, 94, 0.05)", // green-500
    FINISHED_WITH_COMMENTS: "rgba(16, 185, 129, 0.05)", // emerald-500
    FAILED: "rgba(239, 68, 68, 0.05)", // red-500
  };
  return colorMap[key] || "rgba(107, 114, 128, 0.05)"; // gray-500
};

/**
 * Get human-readable label for stat key
 */
const getStatLabel = (key: string): string => {
  const labelMap: Record<string, string> = {
    TODAY: "Today",
    SCHEDULED: "Scheduled",
    RECORDING: "Recording",
    RUNNING: "Running",
    FINISHED: "Finished",
    FINISHED_WITH_COMMENTS: "Finished with Comments",
    FAILED: "Failed",
  };
  return labelMap[key] || key.replace(/_/g, " ");
};

/**
 * Get human-readable description for stat key
 */
const getStatDescription = (key: string): string => {
  const descMap: Record<string, string> = {
    TODAY: "Events scheduled for today",
    SCHEDULED: "Events that are scheduled but not yet started",
    RECORDING: "Events currently being recorded",
    RUNNING: "Events currently being processed",
    FINISHED: "Events that have been successfully processed",
    FINISHED_WITH_COMMENTS: "Finished events with open comments",
    FAILED: "Events that failed during processing",
  };
  return descMap[key] || "Event statistics";
};

/**
 * Statistics Dashboard Component
 */
export const StatsDashboard: React.FC = () => {
  // Fetch stats from Opencast API
  const { data: statsData, isLoading, error, refetch } = useQuery({
    queryKey: ["stats-dashboard", "stats"],
    queryFn: async (): Promise<StatsResponse> => {
      const response = await fetch("/admin-ng/resources/STATS.json", {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Parse and sort stats
  const stats = useMemo<StatItem[]>(() => {
    if (!statsData) return [];

    const parsed: StatItem[] = [];

    for (const [key, value] of Object.entries(statsData)) {
      try {
        const config: StatConfig = JSON.parse(value);
        parsed.push({
          key,
          config,
        });
      } catch (e) {
        console.warn(`Failed to parse stat ${key}:`, e);
      }
    }

    // Sort by order field
    return parsed.sort((a, b) => (a.config.order || 0) - (b.config.order || 0));
  }, [statsData]);

  // Fetch counts for each stat using GraphQL with useQueries
  const countQueries = useQueries({
    queries: stats.map((stat, index) => {
      const queryString = buildQueryString(stat.config.filters);
      const isEnabled = !!statsData && queryString.length > 0;
      
      if (import.meta.env.DEV) {
        console.log(`[StatsDashboard] Query ${index} (${stat.key}):`, {
          enabled: isEnabled,
          queryString,
          hasStatsData: !!statsData,
        });
      }
      
      return {
        queryKey: useGetMyEventsQuery.getKey({
          limit: 1,
          query: queryString || undefined,
        }),
        queryFn: async () => {
          try {
            // Use limit: 1 to get at least one result, but we only care about totalCount
            const fetcher = useGetMyEventsQuery.fetcher({
              limit: 1,
              query: queryString || undefined,
            });
            const result = await fetcher();
            
            if (import.meta.env.DEV) {
              console.log(`[StatsDashboard] Query ${index} (${stat.key}) result:`, {
                totalCount: result?.currentUser?.myEvents?.totalCount,
                hasData: !!result,
                hasCurrentUser: !!result?.currentUser,
                hasMyEvents: !!result?.currentUser?.myEvents,
              });
            }
            
            return result;
          } catch (error) {
            console.error(`[StatsDashboard] Query ${index} (${stat.key}) error:`, error);
            throw error;
          }
        },
        enabled: isEnabled,
        staleTime: 30 * 1000,
      };
    }),
  });

  // Merge counts into stats
  const statsWithCounts = useMemo<StatItem[]>(() => {
    return stats.map((stat, index) => {
      const countQuery = countQueries[index];
      const count = countQuery?.data?.currentUser?.myEvents?.totalCount ?? undefined;
      
      if (import.meta.env.DEV && countQuery) {
        console.log(`[StatsDashboard] Stat ${index} (${stat.key}):`, {
          count,
          isLoading: countQuery.isLoading,
          isError: countQuery.isError,
          error: countQuery.error,
          hasData: !!countQuery.data,
        });
      }
      
      return {
        ...stat,
        count,
      };
    });
  }, [stats, countQueries]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold">Statistics Dashboard</h1>
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold">Statistics Dashboard</h1>
          <p className="text-muted-foreground">Failed to load statistics</p>
        </div>
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Statistics</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Statistics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time overview of Opencast event statistics
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsWithCounts.map((stat, index) => {
          const Icon = getStatIcon(stat.key);
          const iconBgColor = getStatColor(stat.key);
          const colorClass = getStatColorClass(stat.key);
          const label = getStatLabel(stat.key);
          const description = getStatDescription(stat.key);
          const isLoadingCount = countQueries[index]?.isLoading ?? false;

          return (
            <Card
              key={stat.key}
              className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/20 overflow-hidden relative bg-card"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.08}s both`,
                background: `linear-gradient(135deg, ${getCardBackgroundColor(stat.key)} 0%, var(--card) 100%)`,
              }}
            >
              {/* Subtle background accent */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${colorClass} opacity-60`}
              />

              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{label}</CardTitle>
                  <div
                    className="p-3 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg flex items-center justify-center min-w-[44px] min-h-[44px]"
                    style={{ backgroundColor: iconBgColor }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <CardDescription className="text-xs mt-1 line-clamp-2">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  {/* Count display */}
                  <div className="relative">
                    <div className="text-4xl font-bold text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {isLoadingCount ? (
                        <span className="inline-block animate-pulse">—</span>
                      ) : (
                        <span className="inline-block animate-countUp">
                          {stat.count !== undefined ? stat.count.toLocaleString() : "—"}
                        </span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
                  </div>

                  {/* Filter info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex -space-x-1">
                      {stat.config.filters.slice(0, 3).map((filter, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary/30 border border-primary/50"
                          style={{
                            animation: `pulse 2s ease-in-out ${i * 0.2}s infinite`,
                          }}
                          title={filter.name}
                        />
                      ))}
                    </div>
                    <span>
                      {stat.config.filters.length} filter{stat.config.filters.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Order badge */}
                  <div className="absolute top-2 right-2">
                    <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground font-medium">
                      #{stat.config.order}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes countUp {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .animate-countUp {
          animation: countUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default StatsDashboard;
