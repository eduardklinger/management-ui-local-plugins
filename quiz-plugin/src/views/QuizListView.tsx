/**
 * Quiz List View Component
 * 
 * Shows a list of events with quizzes available.
 * This is the base route for /quiz when no eventId is provided.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components";
import { useGetMyEventsQuery } from "@workspace/query";
import { Link } from "@workspace/router";
import { Loader2 } from "lucide-react";

export const QuizListView = () => {
  const { data, isLoading, error } = useGetMyEventsQuery(
    {
      limit: 100, // Get up to 100 events
      offset: 0,
    },
    {
      enabled: true,
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{String(error)}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const events = data?.currentUser?.myEvents?.nodes || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Overview</CardTitle>
          <CardDescription>
            Select an event to view or take its quiz
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-muted-foreground">No events found.</p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <Link
                  key={event.id}
                  to="/quiz/$eventId"
                  params={{ eventId: event.id }}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <h3 className="font-semibold">{event.title || event.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    Event ID: {event.id}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
