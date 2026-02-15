/**
 * Quiz Form Component
 * 
 * Displays a quiz form for users to answer questions.
 * Submits answers via GraphQL mutation (which calls Convex via backend).
 */

import { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components";
import { Send } from "lucide-react";
import { useSubmitQuizMutation } from "../gql-generated";

interface Quiz {
  id: string;
  title: string;
  questions: Array<{
    id: string;
    question: string;
    type: "multiple_choice" | "single_choice" | "text";
    options?: string[];
    points: number;
  }>;
}

interface QuizFormProps {
  quiz: Quiz;
  eventId: string;
  onSubmissionComplete?: (submission: {
    submissionId: string;
    score: number;
    maxScore: number;
    percentage: number;
    success: boolean;
  }) => void;
}

export const QuizForm = ({ quiz, eventId, onSubmissionComplete }: QuizFormProps) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const submitQuizMutation = useSubmitQuizMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    try {
      const result = await submitQuizMutation.mutateAsync({
        eventId,
        answers: {
          quizId: quiz.id,
          answers: answerArray,
        },
      });

      const submissionResult = result.quiz.submitQuiz;

      // Store submission in localStorage for persistence across reloads
      const submissionData = {
        submissionId: submissionResult.submissionId,
        score: submissionResult.score,
        maxScore: submissionResult.maxScore,
        percentage: submissionResult.percentage,
        success: submissionResult.success,
        answers: submissionResult.answerResults ?? answerArray.map((a) => ({
          questionId: a.questionId,
          answer: a.answer,
          isCorrect: submissionResult.answerResults?.find((r: { questionId: string; isCorrect?: boolean | null } | null) => r?.questionId === a.questionId)?.isCorrect ?? false,
        })),
        submittedAt: Date.now(),
      };
      localStorage.setItem(`quiz_submission_${eventId}`, JSON.stringify(submissionData));

      if (onSubmissionComplete) {
        onSubmissionComplete({
          submissionId: submissionResult.submissionId,
          score: submissionResult.score,
          maxScore: submissionResult.maxScore,
          percentage: submissionResult.percentage,
          success: submissionResult.success,
        });
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      alert("Failed to submit quiz. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="space-y-3">
              <label className="text-lg font-semibold">
                {index + 1}. {question.question} ({question.points} points)
              </label>

              {question.type === "single_choice" && question.options && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) =>
                          setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))
                        }
                        required
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "multiple_choice" && question.options && (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(answers[question.id] as string[] || []).includes(option)}
                        onChange={(e) => {
                          const current = (answers[question.id] as string[] || []);
                          const updated = e.target.checked
                            ? [...current, option]
                            : current.filter(o => o !== option);
                          setAnswers(prev => ({ ...prev, [question.id]: updated }));
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "text" && (
                <textarea
                  value={answers[question.id] || ""}
                  onChange={(e) =>
                    setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))
                  }
                  required
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              )}
            </div>
          ))}

          <Button
            type="submit"
            disabled={submitQuizMutation.isPending}
            className="w-full"
          >
            {submitQuizMutation.isPending ? (
              "Submitting..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Quiz
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};
