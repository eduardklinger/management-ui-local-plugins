/**
 * Hook for fetching quiz data from Convex
 * 
 * This hook demonstrates the hybrid approach:
 * - Uses Convex for quiz data (real-time)
 * - Note: In a real implementation, you would use Convex React hooks
 *   For now, this is a placeholder that shows the structure
 */

import { useState, useEffect } from "react";
import { useGetCurrentUser } from "@workspace/query";

interface Quiz {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  questions: Array<{
    id: string;
    question: string;
    type: "multiple_choice" | "single_choice" | "text";
    options?: string[];
    points: number;
  }>;
  isActive: boolean;
}

interface Submission {
  submissionId: string;
  score: number;
  maxScore: number;
  percentage: number;
  answers: Array<{
    questionId: string;
    answer: any;
    isCorrect?: boolean;
  }>;
  submittedAt: number;
}

interface Results {
  totalSubmissions: number;
  averageScore: number;
  submissions: Array<{
    userId: string;
    score: number;
    percentage: number;
  }>;
}

export const useQuizData = (eventId: string) => {
  const { data: currentUser } = useGetCurrentUser();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [mySubmission, setMySubmission] = useState<Submission | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!eventId) {
      setIsLoading(false);
      return;
    }
    
    // TODO: Replace with actual Convex hooks
    // Example:
    // const quiz = useQuery(api.quiz.getQuiz, { eventId });
    // const mySubmission = useQuery(api.quiz.getMySubmission, { 
    //   eventId, 
    //   userId: currentUser?.username || "" 
    // });
    // const results = useQuery(api.quiz.getResults, { eventId });
    
    // For now, fetch via GraphQL (which calls Convex via backend)
    const fetchQuizData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch quiz info from GraphQL (which queries Convex via backend)
        const response = await fetch("/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetQuizInfo($eventId: String!) {
                eventById(id: $eventId) {
                  id
                  quizInfo {
                    hasQuiz
                    quizId
                    isActive
                    title
                    questionCount
                  }
                }
              }
            `,
            variables: { eventId },
          }),
        });
        
        // Check if response is ok
        if (!response.ok) {
          throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
        }
        
        // Check if response has content
        const text = await response.text();
        if (!text || text.trim() === "") {
          throw new Error("Empty response from GraphQL endpoint");
        }
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
        
        // Check for GraphQL errors
        if (data.errors && data.errors.length > 0) {
          const errorMessage = data.errors[0]?.message || "GraphQL error";
          // If the quizInfo field doesn't exist yet, that's okay - just means backend isn't deployed
          if (
            errorMessage.includes("quizInfo") || 
            errorMessage.includes("Cannot query field") ||
            errorMessage.includes("FieldUndefined") ||
            errorMessage.includes("Field 'quizInfo'")
          ) {
            // Quiz extension not available yet - this is expected if backend isn't deployed
            // Silently handle this - no quiz available
            setQuiz(null);
            setError(null);
            setIsLoading(false);
            return;
          }
          throw new Error(errorMessage);
        }
        
        const quizInfo = data.data?.eventById?.quizInfo;
        
        if (quizInfo?.hasQuiz) {
          // Fetch full quiz definition with questions
          const quizResponse = await fetch("/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
                query GetQuiz($eventId: String!) {
                  eventById(id: $eventId) {
                    id
                    quiz {
                      id
                      eventId
                      title
                      description
                      isActive
                      questions {
                        id
                        question
                        type
                        options
                        points
                      }
                    }
                  }
                }
              `,
              variables: { eventId },
            }),
          });
          
          const quizResult = await quizResponse.json();
          
          if (quizResult.errors) {
            throw new Error(quizResult.errors[0].message);
          }
          
          const quizData = quizResult.data?.eventById?.quiz;
          
          if (quizData) {
            setQuiz({
              id: quizData.id,
              eventId: quizData.eventId,
              title: quizData.title,
              description: quizData.description || undefined,
              questions: quizData.questions || [],
              isActive: quizData.isActive,
            });
          } else {
            // Fallback to quizInfo if quiz field is not available
            setQuiz({
              id: quizInfo.quizId,
              eventId,
              title: quizInfo.title || "Quiz",
              questions: [],
              isActive: quizInfo.isActive,
            });
          }
          
          // Check for stored submission in localStorage
          const storedSubmission = localStorage.getItem(`quiz_submission_${eventId}`);
          if (storedSubmission) {
            try {
              const submissionData = JSON.parse(storedSubmission);
              // Calculate maxScore from quiz questions if not available
              const calculatedMaxScore = quizData?.questions?.reduce((sum: number, q: any) => sum + (q.points || 0), 0) || submissionData.maxScore;
              
              setMySubmission({
                submissionId: submissionData.submissionId,
                score: submissionData.score,
                maxScore: calculatedMaxScore,
                percentage: submissionData.percentage,
                answers: submissionData.answers || [],
                submittedAt: submissionData.submittedAt || Date.now(),
              });
            } catch (e) {
              console.error("Failed to parse stored submission:", e);
            }
          }
        } else {
          // No quiz available for this event
          setQuiz(null);
        }
        
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(new Error(`Failed to load quiz: ${errorMessage}`));
        setQuiz(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizData();
  }, [eventId, currentUser?.username]);
  
  return {
    quiz,
    mySubmission,
    results,
    isLoading,
    error,
  };
};
