/**
 * Statistics Dashboard View
 *
 * Displays Opencast event statistics with beautiful animations.
 * Fetches data from /admin-ng/resources/STATS.json
 */

import { BarChart3, Calendar, CheckCircle2, Clock, Play, XCircle, AlertCircle } from "lucide-react";
import React, { useMemo } from "react";
import { useQuery } from "@workspace/query";

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
 * Icon mapping for different stat types
 */
const getStatIcon = (key: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    TODAY: Calendar,
    SCHEDULED: Clock,
    RECORDING: Play,
    RUNNING: BarChart3,
    FINISHED: CheckCircle2,
    FINISHED_WITH_COMMENTS: CheckCircle2,
    FAILED: XCircle,
  };
  return iconMap[key] || AlertCircle;
};

/**
 * Color mapping for different stat types
 */
const getStatColor = (key: string): string => {
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
        {stats.map((stat, index) => {
          const Icon = getStatIcon(stat.key);
          const color = getStatColor(stat.key);
          const label = getStatLabel(stat.key);

          return (
            <Card
              key={stat.key}
              className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-primary/20 overflow-hidden relative"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.08}s both`,
              }}
            >
              {/* Animated background gradient */}
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${color.replace("bg-", "bg-gradient-to-br from-")}`}
              />
              
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{label}</CardTitle>
                  <div
                    className={`${color} p-3 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <CardDescription className="text-xs mt-1 line-clamp-2">
                  {stat.config.description || "Event statistics"}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  {/* Animated number with shimmer effect */}
                  <div className="relative">
                    <div className="text-4xl font-bold text-primary bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      <span className="inline-block animate-countUp">—</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                  
                  {/* Filter info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex -space-x-1">
                      {stat.config.filters.slice(0, 3).map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary/30 border border-primary/50"
                          style={{
                            animation: `pulse 2s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                    <span>
                      {stat.config.filters.length} filter{stat.config.filters.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  
                  {/* Order badge */}
                  <div className="absolute top-2 right-2">
                    <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
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
