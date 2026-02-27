import { useCallback, useEffect, useState } from "react";

export interface PollOption {
  id: string;
  label: string;
  voteCount: number;
}

export interface AudiencePoll {
  id: string;
  publicId: string;
  question: string;
  isActive: boolean;
  createdBy: string | null;
  options: PollOption[];
}

export interface AudiencePollSummary {
  id: string;
  publicId: string;
  question: string;
  isActive: boolean;
  createdBy: string | null;
}

export interface PollVoteResult {
  pollId: string;
  selectedOptionId: string;
  totalVotes: number;
  success: boolean;
  options: PollOption[];
}

type GraphQLError = {
  message: string;
};

type GraphQLResponse<TData> = {
  data?: TData;
  errors?: GraphQLError[];
};

const QUERY_AUDIENCE_POLL = `
  query AudiencePollContext($pollId: String) {
    audiencePoll(pollId: $pollId) {
      id
      publicId
      question
      isActive
      createdBy
      options {
        id
        label
        voteCount
      }
    }
    audiencePolls {
      id
      publicId
      question
      isActive
      createdBy
    }
    canManageAudiencePolls
    currentAudiencePollUser
  }
`;

const MUTATION_CREATE_POLL = `
  mutation CreateAudiencePoll($question: String!) {
    poll {
      createAudiencePoll(question: $question) {
        id
        publicId
        question
        isActive
        createdBy
        options {
          id
          label
          voteCount
        }
      }
    }
  }
`;

const MUTATION_DELETE_POLL = `
  mutation DeleteAudiencePoll($pollId: String!) {
    poll {
      deleteAudiencePoll(pollId: $pollId)
    }
  }
`;

const MUTATION_SUBMIT_ANSWER = `
  mutation SubmitAudienceAnswer($pollId: String!, $answer: String!, $voterId: String) {
    poll {
      submitAudienceAnswer(pollId: $pollId, answer: $answer, voterId: $voterId) {
        pollId
        selectedOptionId
        totalVotes
        success
        options {
          id
          label
          voteCount
        }
      }
    }
  }
`;

const MUTATION_VOTE_ANSWER = `
  mutation VoteAudienceAnswer($pollId: String!, $answerId: String!, $voterId: String) {
    poll {
      voteAudienceAnswer(pollId: $pollId, answerId: $answerId, voterId: $voterId) {
        pollId
        selectedOptionId
        totalVotes
        success
        options {
          id
          label
          voteCount
        }
      }
    }
  }
`;

const MISSING_BACKEND_PATTERNS = [
  "Cannot query field",
  "FieldUndefined",
  "audiencePoll",
  "audiencePolls",
  "createAudiencePoll",
  "deleteAudiencePoll",
  "submitAudienceAnswer",
  "voteAudienceAnswer",
  "canManageAudiencePolls",
  "currentAudiencePollUser",
  "PollMutation",
];

const hasMissingBackendError = (errorMessage: string): boolean => {
  return MISSING_BACKEND_PATTERNS.some((pattern) => errorMessage.includes(pattern));
};

const runGraphQL = async <TData, TVariables = Record<string, never>>(
  query: string,
  variables?: TVariables
): Promise<TData> => {
  const response = await fetch("/graphql", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as GraphQLResponse<TData>;

  if (payload.errors && payload.errors.length > 0) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  if (!payload.data) {
    throw new Error("GraphQL response did not include data");
  }

  return payload.data;
};

const toSummary = (poll: AudiencePoll): AudiencePollSummary => ({
  id: poll.id,
  publicId: poll.publicId,
  question: poll.question,
  isActive: poll.isActive,
  createdBy: poll.createdBy ?? null,
});

type AudiencePollQueryData = {
  audiencePoll: AudiencePoll | null;
  audiencePolls: AudiencePollSummary[] | null;
  canManageAudiencePolls: boolean;
  currentAudiencePollUser: string | null;
};

type CreatePollMutationData = {
  poll: {
    createAudiencePoll: AudiencePoll;
  };
};

type DeletePollMutationData = {
  poll: {
    deleteAudiencePoll: boolean;
  };
};

type AnswerMutationData = {
  poll: {
    submitAudienceAnswer: PollVoteResult;
  };
};

type VoteMutationData = {
  poll: {
    voteAudienceAnswer: PollVoteResult;
  };
};

export const usePollData = (pollId: string | null) => {
  const [poll, setPoll] = useState<AudiencePoll | null>(null);
  const [polls, setPolls] = useState<AudiencePollSummary[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [canManagePolls, setCanManagePolls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await runGraphQL<AudiencePollQueryData, { pollId: string | null }>(
        QUERY_AUDIENCE_POLL,
        { pollId }
      );
      setPoll(data.audiencePoll ?? null);
      setPolls(data.audiencePolls ?? []);
      setCurrentUser(data.currentAudiencePollUser ?? null);
      setCanManagePolls(Boolean(data.canManageAudiencePolls));
      setBackendAvailable(true);
      setError(null);
    } catch (queryError) {
      const message = queryError instanceof Error ? queryError.message : String(queryError);
      if (hasMissingBackendError(message)) {
        setBackendAvailable(false);
        setCanManagePolls(false);
        setCurrentUser(null);
        setPoll(null);
        setPolls([]);
        setError(null);
      } else {
        setError(new Error(`Failed to load poll data: ${message}`));
      }
    } finally {
      setIsLoading(false);
    }
  }, [pollId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createAudiencePoll = useCallback(async (question: string) => {
    setIsMutating(true);
    try {
      const data = await runGraphQL<CreatePollMutationData, { question: string }>(
        MUTATION_CREATE_POLL,
        { question }
      );
      const createdPoll = data.poll.createAudiencePoll;
      setPoll(createdPoll);
      setPolls((previous) => [
        toSummary(createdPoll),
        ...previous.filter((item) => item.publicId !== createdPoll.publicId),
      ]);
      setBackendAvailable(true);
      setError(null);
      return createdPoll;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const deleteAudiencePoll = useCallback(async (targetPollId: string) => {
    setIsMutating(true);
    try {
      const data = await runGraphQL<DeletePollMutationData, { pollId: string }>(
        MUTATION_DELETE_POLL,
        { pollId: targetPollId }
      );
      if (!data.poll.deleteAudiencePoll) {
        throw new Error("Poll could not be deleted.");
      }

      setPolls((previous) => previous.filter((item) => item.publicId !== targetPollId));
      if (pollId === targetPollId) {
        setPoll(null);
      }
      setBackendAvailable(true);
      setError(null);
      return true;
    } finally {
      setIsMutating(false);
    }
  }, [pollId]);

  const submitAudienceAnswer = useCallback(async (answer: string, voterId: string) => {
    if (!pollId) {
      throw new Error("No poll selected.");
    }

    setIsMutating(true);
    try {
      const data = await runGraphQL<
        AnswerMutationData,
        { pollId: string; answer: string; voterId: string }
      >(
        MUTATION_SUBMIT_ANSWER,
        { pollId, answer, voterId }
      );
      const result = data.poll.submitAudienceAnswer;
      setPoll((previous) => {
        if (!previous) {
          return previous;
        }
        return {
          ...previous,
          options: result.options,
        };
      });
      setBackendAvailable(true);
      setError(null);
      return result;
    } finally {
      setIsMutating(false);
    }
  }, [pollId]);

  const voteAudienceAnswer = useCallback(async (answerId: string, voterId: string) => {
    if (!pollId) {
      throw new Error("No poll selected.");
    }

    setIsMutating(true);
    try {
      const data = await runGraphQL<
        VoteMutationData,
        { pollId: string; answerId: string; voterId: string }
      >(
        MUTATION_VOTE_ANSWER,
        { pollId, answerId, voterId }
      );
      const result = data.poll.voteAudienceAnswer;
      setPoll((previous) => {
        if (!previous) {
          return previous;
        }
        return {
          ...previous,
          options: result.options,
        };
      });
      setBackendAvailable(true);
      setError(null);
      return result;
    } finally {
      setIsMutating(false);
    }
  }, [pollId]);

  return {
    poll,
    polls,
    currentUser,
    canManagePolls,
    isLoading,
    isMutating,
    backendAvailable,
    error,
    refresh,
    createAudiencePoll,
    deleteAudiencePoll,
    submitAudienceAnswer,
    voteAudienceAnswer,
  };
};
