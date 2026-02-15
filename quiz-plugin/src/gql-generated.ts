/* eslint-disable */
/**
 * Quiz plugin GraphQL generated types and hooks.
 * Regenerate with: pnpm codegen (from plugin dir, with backend running and GRAPHQL_ENDPOINT set).
 */
import {
  useMutation,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { fetchData } from "./fetcher";

// --- CreateQuiz ---

export const CreateQuizDocument = `
mutation CreateQuiz($eventId: String!, $quiz: QuizInput!) {
  quiz {
    createQuiz(eventId: $eventId, quiz: $quiz) {
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
`;

export type CreateQuizMutation = {
  quiz: {
    createQuiz: {
      id: string;
      eventId: string;
      title: string;
      description?: string | null;
      isActive: boolean;
      questions: Array<{
        id: string;
        question: string;
        type: string;
        options?: ReadonlyArray<string | null> | null;
        points: number;
      }>;
    };
  };
};

export type CreateQuizMutationVariables = {
  eventId: string;
  quiz: {
    title: string;
    description?: string | null;
    questions: Array<{
      question: string;
      type: string;
      options?: ReadonlyArray<string | null> | null;
      correctAnswer?: unknown;
      points: number;
    }>;
    isActive?: boolean | null;
  };
};

export const useCreateQuizMutation = <
  TError = unknown,
  TContext = unknown,
>(
  options?: UseMutationOptions<
    CreateQuizMutation,
    TError,
    CreateQuizMutationVariables,
    TContext
  >,
) =>
  useMutation<
    CreateQuizMutation,
    TError,
    CreateQuizMutationVariables,
    TContext
  >({
    mutationKey: ["CreateQuiz"],
    mutationFn: (variables?: CreateQuizMutationVariables) =>
      fetchData<CreateQuizMutation, CreateQuizMutationVariables>(
        CreateQuizDocument,
        variables,
      )(),
    ...options,
  });

// --- SubmitQuiz ---

export const SubmitQuizDocument = `
mutation SubmitQuiz($eventId: String!, $answers: QuizAnswersInput!) {
  quiz {
    submitQuiz(eventId: $eventId, answers: $answers) {
      submissionId
      score
      maxScore
      percentage
      success
      answerResults {
        questionId
        answer
        isCorrect
        points
      }
    }
  }
}
`;

export type SubmitQuizMutation = {
  quiz: {
    submitQuiz: {
      submissionId: string;
      score: number;
      maxScore: number;
      percentage: number;
      success: boolean;
      answerResults?: ReadonlyArray<{
        questionId: string;
        answer: unknown;
        isCorrect?: boolean | null;
        points: number;
      } | null> | null;
    };
  };
};

export type SubmitQuizMutationVariables = {
  eventId: string;
  answers: {
    quizId: string;
    answers: Array<{ questionId: string; answer: unknown }>;
  };
};

export const useSubmitQuizMutation = <
  TError = unknown,
  TContext = unknown,
>(
  options?: UseMutationOptions<
    SubmitQuizMutation,
    TError,
    SubmitQuizMutationVariables,
    TContext
  >,
) =>
  useMutation<
    SubmitQuizMutation,
    TError,
    SubmitQuizMutationVariables,
    TContext
  >({
    mutationKey: ["SubmitQuiz"],
    mutationFn: (variables?: SubmitQuizMutationVariables) =>
      fetchData<SubmitQuizMutation, SubmitQuizMutationVariables>(
        SubmitQuizDocument,
        variables,
      )(),
    ...options,
  });
