/**
 * Quiz View Component
 * 
 * Main component for the quiz plugin. Shows:
 * - Event information (from GraphQL)
 * - Quiz form or results (from Convex)
 * 
 * This demonstrates the hybrid approach:
 * - GraphQL for Opencast data (events, users)
 * - Convex for quiz data (real-time updates)
 */

import { useParams } from "@workspace/router";
import { useGetEventByIdQuery } from "@workspace/query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components";
import { Loader2 } from "lucide-react";
import { QuizForm } from "../components/QuizForm";
import { QuizResults } from "../components/QuizResults";
import { CreateQuizForm } from "../components/CreateQuizForm";
import { useQuizData } from "../hooks/useQuizData";

export const QuizView = () => {
  const { eventId } = useParams({ strict: false });
  
  // Get Event data from Opencast GraphQL
  const { data: eventData, isLoading: eventLoading, error: eventError } = useGetEventByIdQuery(
    { eventId: eventId || "" },
    { enabled: !!eventId }
  );
  
  // Get Quiz data from Convex (real-time)
  const { quiz, mySubmission, results, isLoading: quizLoading, error: quizError } = useQuizData(eventId || "");
  
  if (eventLoading || quizLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (eventError || !eventData?.eventById) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            {eventError ? String(eventError) : "Event not found"}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const event = eventData.eventById;
  const hasCompleted = !!mySubmission;
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Event Info from GraphQL */}
      <Card>
        <CardHeader>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>
            Event ID: {event.id} | Creator: {event.creator}
          </CardDescription>
        </CardHeader>
      </Card>
      
      {/* Quiz from Convex */}
      {quizError && (
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Quiz</CardTitle>
            <CardDescription>{String(quizError)}</CardDescription>
          </CardHeader>
        </Card>
      )}
      
      {!quiz && !quizError && (
        <CreateQuizForm 
          eventId={eventId || ""}
          onQuizCreated={() => window.location.reload()}
        />
      )}
      
      {quiz && hasCompleted && (
        <QuizResults 
          submission={mySubmission!}
          results={results}
          quiz={quiz}
        />
      )}
      
      {quiz && !hasCompleted && (
        <QuizForm 
          quiz={quiz}
          eventId={eventId || ""}
          onSubmissionComplete={() => {
            // Trigger a refresh of quiz data to show results
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};
