package org.opencastproject.poll.plugin.service;

import org.opencastproject.poll.plugin.PollInfo;
import org.opencastproject.poll.plugin.type.PollDefinition;
import org.opencastproject.poll.plugin.type.PollOption;
import org.opencastproject.poll.plugin.type.PollVoteResult;
import org.opencastproject.poll.plugin.type.input.PollInput;
import org.opencastproject.poll.plugin.type.input.PollVoteInput;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class MockPollDataStore implements PollDataStore {

  private final Map<String, PollState> pollsByEventId = new LinkedHashMap<>();
  private final Map<String, PollState> pollsByPollId = new LinkedHashMap<>();

  @Override
  public synchronized PollInfo getPollInfo(String eventId) {
    PollState state = pollsByEventId.get(eventId);
    if (state == null) {
      return new PollInfo(false, null, false, null, null, null);
    }

    return new PollInfo(
        true,
        state.pollId,
        state.active,
        state.question,
        state.optionsById.size(),
        state.getTotalVotes()
    );
  }

  @Override
  public synchronized PollDefinition getPollDefinition(String eventId) {
    PollState state = pollsByEventId.get(eventId);
    if (state == null) {
      return null;
    }
    return state.toDefinition();
  }

  @Override
  public synchronized PollDefinition createPoll(String eventId, PollInput pollInput, String userId) {
    if (pollInput == null) {
      throw new IllegalArgumentException("Poll input is required");
    }

    String question = normalize(pollInput.getQuestion());
    if (question.isEmpty()) {
      throw new IllegalArgumentException("Poll question is required");
    }

    List<String> normalizedOptions = normalizeOptions(pollInput.getOptions());

    PollState newState = PollState.fromInput(
        eventId,
        question,
        normalizedOptions,
        pollInput.getIsActive(),
        userId
    );
    replaceState(eventId, newState);
    return newState.toDefinition();
  }

  @Override
  public synchronized PollVoteResult submitVote(String eventId, PollVoteInput voteInput, String userId) {
    if (voteInput == null) {
      throw new IllegalArgumentException("Vote input is required");
    }

    PollState state = pollsByEventId.get(eventId);
    if (state == null) {
      throw new IllegalArgumentException("No poll exists for event: " + eventId);
    }

    if (!state.pollId.equals(voteInput.getPollId())) {
      throw new IllegalArgumentException("Poll id does not match event poll");
    }

    String optionId = normalize(voteInput.getOptionId());
    if (!state.optionsById.containsKey(optionId)) {
      throw new IllegalArgumentException("Unknown poll option: " + optionId);
    }

    return voteInState(state, optionId, userId);
  }

  @Override
  public synchronized PollDefinition getAudiencePoll(String pollId) {
    String normalizedPollId = normalize(pollId);
    if (normalizedPollId.isEmpty()) {
      return null;
    }
    return getPollDefinition(normalizedPollId);
  }

  @Override
  public synchronized List<PollDefinition> listAudiencePolls() {
    List<PollDefinition> polls = new ArrayList<>();
    for (Map.Entry<String, PollState> entry : pollsByEventId.entrySet()) {
      if (isAudiencePollId(entry.getKey())) {
        polls.add(entry.getValue().toDefinition());
      }
    }
    Collections.reverse(polls);
    return polls;
  }

  @Override
  public synchronized PollDefinition createAudiencePoll(String question, String userId) {
    String normalizedQuestion = normalize(question);
    if (normalizedQuestion.isEmpty()) {
      throw new IllegalArgumentException("Poll question is required");
    }

    String pollPublicId = generatePollPublicId();
    PollState audienceState = PollState.fromInput(
        pollPublicId,
        normalizedQuestion,
        new ArrayList<String>(),
        true,
        userId
    );

    replaceState(pollPublicId, audienceState);
    return audienceState.toDefinition();
  }

  @Override
  public synchronized boolean deleteAudiencePoll(String pollId, String userId) {
    String normalizedPollId = normalize(pollId);
    if (normalizedPollId.isEmpty()) {
      throw new IllegalArgumentException("Poll id is required");
    }

    PollState state = pollsByEventId.get(normalizedPollId);
    if (state == null || !isAudiencePollId(normalizedPollId)) {
      return false;
    }

    String normalizedUserId = normalize(userId);
    if (normalizedUserId.isEmpty() || !normalizedUserId.equals(state.createdBy)) {
      throw new IllegalStateException("Only the poll creator can delete this poll");
    }

    pollsByEventId.remove(normalizedPollId);
    pollsByPollId.remove(state.pollId);
    return true;
  }

  @Override
  public synchronized PollVoteResult submitAudienceAnswer(String pollId, String answer, String userId) {
    String normalizedPollId = normalize(pollId);
    PollState state = pollsByEventId.get(normalizedPollId);
    if (state == null) {
      throw new IllegalArgumentException("No audience poll exists for id: " + normalizedPollId);
    }

    String normalizedAnswer = normalize(answer);
    if (normalizedAnswer.isEmpty()) {
      throw new IllegalArgumentException("Answer text is required");
    }

    String optionId = state.findOptionIdByLabel(normalizedAnswer);
    if (optionId == null) {
      optionId = state.addOption(normalizedAnswer);
    }

    return voteInState(state, optionId, userId);
  }

  @Override
  public synchronized PollVoteResult voteAudienceAnswer(String pollId, String answerId, String userId) {
    String normalizedPollId = normalize(pollId);
    PollState state = pollsByEventId.get(normalizedPollId);
    if (state == null) {
      throw new IllegalArgumentException("No audience poll exists for id: " + normalizedPollId);
    }

    String normalizedAnswerId = normalize(answerId);
    if (!state.optionsById.containsKey(normalizedAnswerId)) {
      throw new IllegalArgumentException("Unknown audience answer id: " + normalizedAnswerId);
    }

    return voteInState(state, normalizedAnswerId, userId);
  }

  private PollVoteResult voteInState(PollState state, String optionId, String userId) {
    if (!state.active) {
      throw new IllegalStateException("Poll is not active");
    }

    String voterKey = normalize(userId);
    if (voterKey.isEmpty()) {
      voterKey = "anonymous";
    }

    String previousOptionId = state.votesByUserId.put(voterKey, optionId);
    if (previousOptionId != null && state.voteCounts.containsKey(previousOptionId)) {
      int previousCount = state.voteCounts.get(previousOptionId);
      state.voteCounts.put(previousOptionId, Math.max(0, previousCount - 1));
    }

    int currentCount = state.voteCounts.getOrDefault(optionId, 0);
    state.voteCounts.put(optionId, currentCount + 1);

    return new PollVoteResult(
        state.pollId,
        optionId,
        state.getTotalVotes(),
        true,
        state.toOptions()
    );
  }

  private void replaceState(String eventId, PollState newState) {
    PollState previous = pollsByEventId.put(eventId, newState);
    if (previous != null) {
      pollsByPollId.remove(previous.pollId);
    }
    pollsByPollId.put(newState.pollId, newState);
  }

  private String generatePollPublicId() {
    String candidate;
    do {
      candidate = "poll-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    } while (pollsByEventId.containsKey(candidate));
    return candidate;
  }

  private boolean isAudiencePollId(String pollId) {
    return pollId != null && pollId.startsWith("poll-");
  }

  private static String normalize(String value) {
    return value == null ? "" : value.trim();
  }

  private static List<String> normalizeOptions(List<String> options) {
    List<String> normalized = new ArrayList<>();
    if (options == null) {
      return normalized;
    }

    for (String option : options) {
      String trimmed = normalize(option);
      if (!trimmed.isEmpty()) {
        normalized.add(trimmed);
      }
    }

    return normalized;
  }

  private static final class PollState {

    private final String pollId;
    private final String eventId;
    private final String question;
    private final boolean active;
    private final String createdBy;
    private final LinkedHashMap<String, String> optionsById;
    private final LinkedHashMap<String, Integer> voteCounts;
    private final Map<String, String> votesByUserId;

    private PollState(String pollId, String eventId, String question, boolean active, String createdBy,
                      LinkedHashMap<String, String> optionsById,
                      LinkedHashMap<String, Integer> voteCounts,
                      Map<String, String> votesByUserId) {
      this.pollId = pollId;
      this.eventId = eventId;
      this.question = question;
      this.active = active;
      this.createdBy = normalize(createdBy);
      this.optionsById = optionsById;
      this.voteCounts = voteCounts;
      this.votesByUserId = votesByUserId;
    }

    private static PollState fromInput(String eventId, String question,
                                       List<String> normalizedOptions, boolean active,
                                       String createdBy) {
      String pollId = UUID.randomUUID().toString();
      LinkedHashMap<String, String> optionsById = new LinkedHashMap<>();
      LinkedHashMap<String, Integer> voteCounts = new LinkedHashMap<>();

      for (String optionLabel : normalizedOptions) {
        String optionId = UUID.randomUUID().toString();
        optionsById.put(optionId, optionLabel);
        voteCounts.put(optionId, 0);
      }

      return new PollState(
          pollId,
          eventId,
          question,
          active,
          createdBy,
          optionsById,
          voteCounts,
          new LinkedHashMap<String, String>()
      );
    }

    private int getTotalVotes() {
      int totalVotes = 0;
      for (int count : voteCounts.values()) {
        totalVotes += count;
      }
      return totalVotes;
    }

    private List<PollOption> toOptions() {
      List<PollOption> options = new ArrayList<>();
      for (Map.Entry<String, String> option : optionsById.entrySet()) {
        int voteCount = voteCounts.getOrDefault(option.getKey(), 0);
        options.add(new PollOption(option.getKey(), option.getValue(), voteCount));
      }
      return options;
    }

    private PollDefinition toDefinition() {
      return new PollDefinition(pollId, eventId, question, active, createdBy, toOptions());
    }

    private String findOptionIdByLabel(String label) {
      String target = label.toLowerCase();
      for (Map.Entry<String, String> option : optionsById.entrySet()) {
        if (option.getValue() != null && option.getValue().trim().toLowerCase().equals(target)) {
          return option.getKey();
        }
      }
      return null;
    }

    private String addOption(String label) {
      String optionId = UUID.randomUUID().toString();
      optionsById.put(optionId, label);
      voteCounts.put(optionId, 0);
      return optionId;
    }
  }
}
