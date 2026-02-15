/**
 * Quiz Results Component
 * 
 * Displays quiz results after submission, including:
 * - Personal score and answers
 * - Class statistics (if available)
 */

import { Card, CardHeader, CardTitle, CardContent } from "@workspace/ui/components";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";

interface Submission {
  submissionId: string;
  score: number;
  maxScore: number;
  percentage: number;
  answers: Array<{
    questionId: string;
    answer: any;
    isCorrect?: boolean;
    points?: number;
  }>;
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

interface Quiz {
  questions: Array<{
    id: string;
    question: string;
    points: number;
  }>;
}

interface QuizResultsProps {
  submission: Submission;
  results?: Results | null;
  quiz: Quiz;
}

export const QuizResults = ({ submission, results, quiz }: QuizResultsProps) => {
  const percentage = submission.percentage;
  
  return (
    <div className="space-y-6">
      {/* Personal Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">
              {submission.score} / {submission.maxScore}
            </div>
            <div className="text-2xl text-muted-foreground">
              {percentage}%
            </div>
          </div>
          
          {/* Answer Review */}
          <div className="space-y-4">
            <h3 className="font-semibold">Answer Review</h3>
            {quiz.questions.map((question, index) => {
              const answer = submission.answers.find(a => a.questionId === question.id);
              const isCorrect = answer?.isCorrect ?? false;
              
              return (
                <div 
                  key={question.id} 
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect 
                      ? "border-green-500 bg-green-50 dark:bg-green-950" 
                      : "border-red-500 bg-red-50 dark:bg-red-950"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {index + 1}. {question.question}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your answer: {JSON.stringify(answer?.answer)}
                      </p>
                      <p className="text-xs mt-1">
                        Points: {answer?.points !== undefined ? answer.points : (isCorrect ? question.points : 0)} / {question.points}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Class Statistics (if available) */}
      {results && results.totalSubmissions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Class Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">{results.totalSubmissions}</div>
                <div className="text-sm text-muted-foreground">Submissions</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{results.averageScore}%</div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{percentage}%</div>
                <div className="text-sm text-muted-foreground">Your Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
