/**
 * Feedback View Component
 *
 * Provides a user-friendly interface for submitting feedback.
 */

import { MessageSquare, Send, CheckCircle2, AlertCircle, Star } from "lucide-react";
import React, { useState } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Textarea,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
} from "@workspace/ui/components";

/**
 * Feedback categories
 */
const FEEDBACK_CATEGORIES = [
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "improvement", label: "Improvement Suggestion" },
  { value: "question", label: "Question" },
  { value: "other", label: "Other" },
] as const;

type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]["value"];

/**
 * Feedback form data
 */
interface FeedbackFormData {
  category: FeedbackCategory;
  rating: number | null;
  subject: string;
  message: string;
  includeSystemInfo: boolean;
}

/**
 * Submission state
 */
type SubmissionState = "idle" | "submitting" | "success" | "error";

/**
 * Feedback View Component
 */
export const FeedbackView: React.FC = () => {
  const [formData, setFormData] = useState<FeedbackFormData>({
    category: "other",
    rating: null,
    subject: "",
    message: "",
    includeSystemInfo: false,
  });

  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.message.trim()) {
      setErrorMessage("Please provide a message.");
      setSubmissionState("error");
      return;
    }

    if (formData.message.trim().length < 10) {
      setErrorMessage("Please provide more details (at least 10 characters).");
      setSubmissionState("error");
      return;
    }

    setSubmissionState("submitting");
    setErrorMessage("");

    try {
      // Collect system info if requested
      const systemInfo = formData.includeSystemInfo
        ? {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: new Date().toISOString(),
          }
        : undefined;

      // Prepare feedback payload
      const payload = {
        category: formData.category,
        rating: formData.rating,
        subject: formData.subject.trim() || undefined,
        message: formData.message.trim(),
        systemInfo,
        timestamp: new Date().toISOString(),
      };

      // Submit feedback
      // TODO: Replace with actual backend endpoint
      const response = await fetch("/admin-ng/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit feedback: ${response.status} ${response.statusText}`);
      }

      // Success
      setSubmissionState("success");

      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          category: "other",
          rating: null,
          subject: "",
          message: "",
          includeSystemInfo: false,
        });
        setSubmissionState("idle");
      }, 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setSubmissionState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit feedback. Please try again."
      );
    }
  };

  /**
   * Handle rating selection
   */
  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating: prev.rating === rating ? null : rating,
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          Feedback
        </h1>
        <p className="text-muted-foreground">
          We value your input! Please share your thoughts, report bugs, or suggest improvements.
        </p>
      </div>

      {/* Success Message */}
      {submissionState === "success" && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Thank you for your feedback! We appreciate your input.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {submissionState === "error" && errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
          <CardDescription>
            Help us improve by sharing your experience, reporting issues, or suggesting features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value as FeedbackCategory }))
                }
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating (Optional) */}
            <div className="space-y-2">
              <Label>Overall Rating (Optional)</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingClick(rating)}
                    className={`p-2 rounded-md transition-all ${
                      formData.rating && formData.rating >= rating
                        ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                        : "text-muted-foreground hover:text-yellow-500 hover:bg-muted"
                    }`}
                    aria-label={`Rate ${rating} out of 5`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        formData.rating && formData.rating >= rating ? "fill-current" : ""
                      }`}
                    />
                  </button>
                ))}
                {formData.rating && (
                  <span className="text-sm text-muted-foreground ml-2">
                    {formData.rating} / 5
                  </span>
                )}
              </div>
            </div>

            {/* Subject (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (Optional)</Label>
              <input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief summary of your feedback"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Please provide details about your feedback, bug report, or feature request..."
                rows={8}
                required
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {formData.message.length} characters (minimum 10)
              </p>
            </div>

            {/* System Info Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeSystemInfo"
                checked={formData.includeSystemInfo}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, includeSystemInfo: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="includeSystemInfo" className="text-sm font-normal cursor-pointer">
                Include system information (browser, screen resolution, etc.) to help diagnose
                issues
              </Label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submissionState === "submitting"}
                className="min-w-[120px]"
              >
                {submissionState === "submitting" ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">What happens with your feedback?</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Your feedback is reviewed by our development team</li>
              <li>Bug reports are prioritized and tracked in our issue tracker</li>
              <li>Feature requests are evaluated for future releases</li>
              <li>We may contact you for additional information if needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackView;
