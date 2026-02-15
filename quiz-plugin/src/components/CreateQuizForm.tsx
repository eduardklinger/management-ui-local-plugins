/**
 * Create Quiz Form Component
 * 
 * Allows creating a new quiz for an event.
 * Uses GraphQL mutation to create quiz via backend (which stores in Convex).
 */

import { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Textarea } from "@workspace/ui/components";
import { Plus, Trash2 } from "lucide-react";
import { useCreateQuizMutation } from "../gql-generated";

interface CreateQuizFormProps {
  eventId: string;
  onQuizCreated?: () => void;
}

interface QuestionInput {
  question: string;
  type: "multiple_choice" | "single_choice" | "text";
  options: string[];
  correctAnswer?: any;
  points: number;
}

export const CreateQuizForm = ({ eventId, onQuizCreated }: CreateQuizFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { question: "", type: "single_choice", options: [""], points: 1 },
  ]);
  const createQuizMutation = useCreateQuizMutation();

  const addQuestion = () => {
    setQuestions([...questions, { question: "", type: "single_choice", options: [""], points: 1 }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuestionInput, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options.push("");
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      alert("Please enter a quiz title");
      return;
    }
    
    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        alert(`Please enter a question for question ${i + 1}`);
        return;
      }
      if ((q.type === "single_choice" || q.type === "multiple_choice") && q.options.length < 2) {
        alert(`Question ${i + 1} needs at least 2 options`);
        return;
      }
      if (q.points <= 0) {
        alert(`Question ${i + 1} must have points > 0`);
        return;
      }
    }
    
    try {
      // Prepare questions data
      const questionsData = questions.map(q => {
        const questionData: any = {
          question: q.question.trim(),
          type: q.type,
          points: q.points,
        };
        
        // Only include options for choice questions
        if (q.type !== "text") {
          const filteredOptions = q.options.filter(o => o.trim());
          if (filteredOptions.length > 0) {
            questionData.options = filteredOptions;
          }
          
          // Validate correctAnswer for choice questions
          if (q.type === "single_choice") {
            if (!q.correctAnswer || (typeof q.correctAnswer === "string" && !q.correctAnswer.trim())) {
              const questionIndex = questions.indexOf(q) + 1;
              alert(`Question ${questionIndex}: Please select a correct answer`);
              return null;
            }
          } else if (q.type === "multiple_choice") {
            if (!q.correctAnswer || !Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0) {
              const questionIndex = questions.indexOf(q) + 1;
              alert(`Question ${questionIndex}: Please select at least one correct answer`);
              return null;
            }
          }
        }
        
        // Include correctAnswer if provided
        if (q.correctAnswer !== undefined && q.correctAnswer !== null) {
          questionData.correctAnswer = q.correctAnswer;
        }
        
        return questionData;
      }).filter(q => q !== null);
      
      // Validate that we have at least one question with data
      if (questionsData.length === 0) {
        alert("Please add at least one question");
        return;
      }
      
      const quizData = {
        title: title.trim(),
        description: description?.trim() || null,
        questions: questionsData,
        isActive,
      };

      await createQuizMutation.mutateAsync({
        eventId,
        quiz: quizData,
      });

      // Success
      if (onQuizCreated) {
        onQuizCreated();
      } else {
        window.location.reload();
      }
      
    } catch (error) {
      console.error("Failed to create quiz:", error);
      alert(`Failed to create quiz: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Quiz</CardTitle>
          <CardDescription>
            Create a new quiz for this event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Quiz Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter quiz description (optional)"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="text-sm font-medium">Active (quiz is available to users)</span>
            </label>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Questions *</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQuestion}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
            
            {questions.map((question, qIndex) => (
              <Card key={qIndex} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Question {qIndex + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(qIndex)}
                      disabled={questions.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Question Text *</label>
                    <Input
                      value={question.question}
                      onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                      placeholder="Enter question"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Question Type *</label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(qIndex, "type", e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="single_choice">Single Choice</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="text">Text Answer</option>
                    </select>
                  </div>
                  
                  {(question.type === "single_choice" || question.type === "multiple_choice") && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Options *</label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(qIndex)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center space-x-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            required
                          />
                          {question.options.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(qIndex, oIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {/* Correct Answer Selection */}
                      <div className="space-y-2 mt-4">
                        <label className="text-sm font-medium">
                          Correct Answer{question.type === "multiple_choice" ? "s" : ""} *
                        </label>
                        {question.type === "single_choice" ? (
                          <select
                            value={question.correctAnswer as string || ""}
                            onChange={(e) => updateQuestion(qIndex, "correctAnswer", e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                          >
                            <option value="">Select correct answer</option>
                            {question.options.filter(o => o.trim()).map((option, oIndex) => (
                              <option key={oIndex} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="space-y-2">
                            {question.options.filter(o => o.trim()).map((option, oIndex) => (
                              <label key={oIndex} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={(question.correctAnswer as string[] || []).includes(option)}
                                  onChange={(e) => {
                                    const current = (question.correctAnswer as string[] || []);
                                    const updated = e.target.checked
                                      ? [...current, option]
                                      : current.filter(o => o !== option);
                                    updateQuestion(qIndex, "correctAnswer", updated);
                                  }}
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {question.type === "text" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Correct Answer (optional)</label>
                      <Input
                        value={question.correctAnswer as string || ""}
                        onChange={(e) => updateQuestion(qIndex, "correctAnswer", e.target.value)}
                        placeholder="Enter correct answer (optional, for auto-grading)"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Points *</label>
                    <Input
                      type="number"
                      min="1"
                      value={question.points}
                      onChange={(e) => updateQuestion(qIndex, "points", parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <Button 
            type="submit" 
            disabled={createQuizMutation.isPending}
            className="w-full"
          >
            {createQuizMutation.isPending ? "Creating Quiz..." : "Create Quiz"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};
