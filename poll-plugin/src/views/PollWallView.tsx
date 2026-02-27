import { useEffect, useMemo, useState } from "react";

import { Button, Input } from "@workspace/ui/components";
import { Copy, ExternalLink, Loader2, PlusCircle, RefreshCw, Trash2 } from "lucide-react";

import { usePollData } from "../hooks/usePollData";

const VOTER_ID_STORAGE_KEY = "poll-plugin-voter-id";
const POLL_ROUTE_SEGMENT = "/poll-plugin";

const getOrCreateVoterId = (): string => {
  if (typeof window === "undefined") {
    return "server";
  }

  const existing = window.localStorage.getItem(VOTER_ID_STORAGE_KEY);
  if (existing && existing.trim()) {
    return existing;
  }

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `voter-${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(VOTER_ID_STORAGE_KEY, generated);
  return generated;
};

const getPollIdFromLocation = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const pathname = window.location.pathname;
  const routeStart = pathname.indexOf(POLL_ROUTE_SEGMENT);
  if (routeStart < 0) {
    return null;
  }

  const suffix = pathname.slice(routeStart + POLL_ROUTE_SEGMENT.length).replace(/^\/+/, "");
  if (!suffix) {
    return null;
  }

  const pollId = suffix.split("/")[0];
  if (!pollId) {
    return null;
  }

  try {
    return decodeURIComponent(pollId);
  } catch {
    return pollId;
  }
};

const getPollBaseUrl = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  const pathname = window.location.pathname;
  const routeStart = pathname.indexOf(POLL_ROUTE_SEGMENT);
  const prefix = routeStart >= 0 ? pathname.slice(0, routeStart) : pathname;
  return `${window.location.origin}${prefix}${POLL_ROUTE_SEGMENT}`;
};

const buildPollUrl = (pollId: string | null): string => {
  const baseUrl = getPollBaseUrl();
  if (!baseUrl) {
    return "";
  }
  if (!pollId) {
    return baseUrl;
  }
  return `${baseUrl}/${encodeURIComponent(pollId)}`;
};

export const PollWallView = () => {
  const [pollId, setPollId] = useState<string | null>(() => getPollIdFromLocation());
  const [questionInput, setQuestionInput] = useState("What should we do next?");
  const [answerInput, setAnswerInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [qrLoadFailed, setQrLoadFailed] = useState(false);

  const {
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
  } = usePollData(pollId);

  const voterId = useMemo(() => getOrCreateVoterId(), []);
  const shareUrl = useMemo(() => buildPollUrl(poll?.publicId ?? pollId), [poll?.publicId, pollId]);
  const qrImageUrl = useMemo(() => {
    if (!shareUrl) {
      return "";
    }
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareUrl)}`;
  }, [shareUrl]);

  useEffect(() => {
    const onLocationChange = () => {
      setPollId(getPollIdFromLocation());
      setSelectedAnswerId(null);
      setFeedback(null);
    };
    window.addEventListener("popstate", onLocationChange);
    return () => window.removeEventListener("popstate", onLocationChange);
  }, []);

  useEffect(() => {
    setQrLoadFailed(false);
  }, [qrImageUrl]);

  const returnToOverview = () => {
    const overviewUrl = buildPollUrl(null);
    if (overviewUrl) {
      window.location.assign(overviewUrl);
    }
  };

  if (isLoading) {
    return (
      <div className="poll-loading">
        <Loader2 className="poll-loading-icon" />
      </div>
    );
  }

  const totalVotes = poll?.options.reduce((sum, option) => sum + option.voteCount, 0) ?? 0;
  const sortedAnswers = poll
    ? [...poll.options].sort((a, b) => b.voteCount - a.voteCount || a.label.localeCompare(b.label))
    : [];

  const onCreatePoll = async () => {
    const question = questionInput.trim();
    if (!question) {
      setFeedback("Please enter a question.");
      return;
    }

    setFeedback(null);
    try {
      const createdPoll = await createAudiencePoll(question);
      const createdPollUrl = buildPollUrl(createdPoll.publicId);
      if (createdPollUrl) {
        window.location.assign(createdPollUrl);
        return;
      }
      setFeedback(`Poll created: ${createdPoll.publicId}`);
      await refresh();
    } catch (createError) {
      setFeedback(createError instanceof Error ? createError.message : String(createError));
    }
  };

  const onSubmitAnswer = async () => {
    const answer = answerInput.trim();
    if (!answer) {
      setFeedback("Please enter an answer.");
      return;
    }

    setFeedback(null);
    try {
      const result = await submitAudienceAnswer(answer, voterId);
      setAnswerInput("");
      setSelectedAnswerId(result.selectedOptionId);
      setFeedback("Answer submitted and voted.");
    } catch (submitError) {
      setFeedback(submitError instanceof Error ? submitError.message : String(submitError));
    }
  };

  const openPoll = (targetPollId: string) => {
    const targetUrl = buildPollUrl(targetPollId);
    if (targetUrl) {
      window.location.assign(targetUrl);
    }
  };

  const onDeletePoll = async (targetPollId: string) => {
    setFeedback(null);
    try {
      await deleteAudiencePoll(targetPollId);
      setFeedback(`Poll ${targetPollId} deleted.`);
    } catch (deleteError) {
      setFeedback(deleteError instanceof Error ? deleteError.message : String(deleteError));
    }
  };

  const onVoteAnswer = async (answerId: string) => {
    setFeedback(null);
    try {
      const result = await voteAudienceAnswer(answerId, voterId);
      setSelectedAnswerId(result.selectedOptionId);
      setFeedback("Vote submitted.");
    } catch (voteError) {
      setFeedback(voteError instanceof Error ? voteError.message : String(voteError));
    }
  };

  const copyShareUrl = async () => {
    if (!shareUrl || typeof navigator === "undefined" || !navigator.clipboard) {
      setFeedback("Clipboard is not available in this browser context.");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setFeedback("Share URL copied.");
    } catch (copyError) {
      setFeedback(copyError instanceof Error ? copyError.message : "Failed to copy URL.");
    }
  };

  const openShareUrl = () => {
    if (!shareUrl || typeof window === "undefined") {
      return;
    }
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const isCurrentPollOwner =
    !!poll &&
    !!currentUser &&
    !!poll.createdBy &&
    poll.createdBy.toLowerCase() === currentUser.toLowerCase();

  return (
    <div className="poll-shell">
      <div className="poll-wrap">
        <p className="poll-pill">Audience Poll</p>
        <h1 className="poll-heading">Create. Scan. Vote.</h1>
        <p className="poll-subtitle">
          Logged-in users create poll links. Anyone with the link can submit answers and vote.
        </p>

        {!backendAvailable && (
          <div className="poll-alert">
            Backend extension missing. This view expects `audiencePoll`, `audiencePolls`,
            `canManageAudiencePolls`, and `poll.*Audience*` GraphQL fields.
          </div>
        )}

        {error && <div className="poll-alert">Poll error: {String(error.message)}</div>}

        {!pollId && (
          <>
            <section className="poll-section">
              <p className="poll-section-label">Create Poll</p>
              <h2 className="poll-section-title">New poll URL</h2>
              <p className="poll-muted">
                {canManagePolls
                  ? "Create a question and share one URL with the audience."
                  : "Creation requires backend authentication. If logged in, you can still try create."}
              </p>

              <div className="poll-row">
                <Input
                  className="poll-input"
                  value={questionInput}
                  onChange={(event) => setQuestionInput(event.target.value)}
                  placeholder="Type your poll question"
                />
                <Button onClick={() => void onCreatePoll()} disabled={isMutating}>
                  {isMutating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4" />
                      Create Poll URL
                    </>
                  )}
                </Button>
              </div>
            </section>

            <section className="poll-section">
              <p className="poll-section-label">Poll Library</p>
              <h2 className="poll-section-title">Open or delete polls</h2>
              <p className="poll-muted">
                {currentUser
                  ? `Logged in as ${currentUser}. You can delete your own polls.`
                  : "Open any poll. Delete is visible only to the creator."}
              </p>

              {polls.length === 0 ? (
                <p className="poll-empty">No polls created yet.</p>
              ) : (
                <ul className="poll-list">
                  {polls.map((listedPoll) => {
                    const canDelete =
                      !!currentUser &&
                      !!listedPoll.createdBy &&
                      listedPoll.createdBy.toLowerCase() === currentUser.toLowerCase();

                    return (
                      <li key={listedPoll.publicId} className="poll-list-item">
                        <div className="poll-list-item-head">
                          <p className="poll-list-question">{listedPoll.question}</p>
                          <p className="poll-list-meta">
                            {listedPoll.publicId} • {listedPoll.createdBy || "unknown creator"}
                          </p>
                        </div>
                        <div className="poll-actions">
                          <Button
                            variant="outline"
                            onClick={() => openPoll(listedPoll.publicId)}
                            disabled={isMutating}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open
                          </Button>
                          {canDelete && (
                            <Button
                              variant="destructive"
                              onClick={() => void onDeletePoll(listedPoll.publicId)}
                              disabled={isMutating}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}

        {pollId && !poll && (
          <section className="poll-section">
            <p className="poll-section-label">Audience Entry</p>
            <h2 className="poll-section-title">Poll not found</h2>
            <p className="poll-muted">
              No active poll found for `{pollId}`. Go back to `/poll-plugin` to create or open a
              poll.
            </p>
            <div className="poll-actions">
              <Button variant="outline" onClick={returnToOverview} disabled={isMutating}>
                Back to all polls
              </Button>
            </div>
          </section>
        )}

        {poll && (
          <>
            <section className="poll-section">
              <p className="poll-section-label">Live Poll</p>
              <h2 className="poll-question">"{poll.question}"</h2>
              <p className="poll-muted">{totalVotes} total vote(s)</p>

              {sortedAnswers.length === 0 ? (
                <p className="poll-empty">No answers yet. Be the first to submit one.</p>
              ) : (
                <div className="poll-answers">
                  {sortedAnswers.map((answer) => {
                    const percentage =
                      totalVotes > 0 ? Math.round((answer.voteCount / totalVotes) * 100) : 0;

                    return (
                      <article
                        key={answer.id}
                        className={`poll-option ${selectedAnswerId === answer.id ? "is-selected" : ""}`}
                      >
                        <div className="poll-option-head">
                          <span className="poll-option-label">{answer.label}</span>
                          <strong className="poll-option-votes">{answer.voteCount}</strong>
                        </div>
                        <div className="poll-bar">
                          <div
                            className="poll-fill"
                            style={{ width: `${percentage}%` }}
                            aria-hidden="true"
                          />
                        </div>
                        <Button
                          variant={selectedAnswerId === answer.id ? "default" : "outline"}
                          className="w-full"
                          onClick={() => void onVoteAnswer(answer.id)}
                          disabled={isMutating}
                        >
                          {isMutating ? "Submitting..." : `Vote for "${answer.label}"`}
                        </Button>
                      </article>
                    );
                  })}
                </div>
              )}

              <div className="poll-row poll-row-answer">
                <Input
                  className="poll-input"
                  value={answerInput}
                  onChange={(event) => setAnswerInput(event.target.value)}
                  placeholder="Submit your own answer (auto-votes it)..."
                />
                <Button onClick={() => void onSubmitAnswer()} disabled={isMutating}>
                  {isMutating ? "Submitting..." : "Add + Vote"}
                </Button>
              </div>
            </section>

            <section className="poll-section">
              <p className="poll-section-label">Share</p>
              <h2 className="poll-section-title">Join URL</h2>
              <div className="poll-qr">
                {!qrLoadFailed && qrImageUrl ? (
                  <img
                    className="poll-qr-image"
                    src={qrImageUrl}
                    alt="QR code for audience poll URL"
                    width={240}
                    height={240}
                    onError={() => setQrLoadFailed(true)}
                  />
                ) : (
                  <p className="poll-muted">
                    QR image service is unavailable right now. Share the link below.
                  </p>
                )}
              </div>
              <code className="poll-code">{shareUrl}</code>
              <div className="poll-actions">
                <Button variant="outline" onClick={() => void copyShareUrl()} disabled={isMutating}>
                  <Copy className="h-4 w-4" />
                  Copy URL
                </Button>
                <Button variant="outline" onClick={() => void refresh()} disabled={isMutating}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="outline" onClick={openShareUrl} disabled={isMutating}>
                  <ExternalLink className="h-4 w-4" />
                  Open link
                </Button>
              </div>
              <div className="poll-actions">
                <Button variant="outline" onClick={returnToOverview} disabled={isMutating}>
                  Back to all polls
                </Button>
                {isCurrentPollOwner && (
                  <Button
                    variant="destructive"
                    onClick={() => void onDeletePoll(poll.publicId)}
                    disabled={isMutating}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete poll
                  </Button>
                )}
              </div>
            </section>
          </>
        )}

        {feedback && <div className="poll-alert poll-alert-info">{feedback}</div>}
      </div>
    </div>
  );
};

export default PollWallView;
