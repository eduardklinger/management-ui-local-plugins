package org.opencastproject.poll.plugin.service;

import org.opencastproject.poll.plugin.PollInfo;
import org.opencastproject.poll.plugin.type.PollDefinition;
import org.opencastproject.poll.plugin.type.PollVoteResult;
import org.opencastproject.poll.plugin.type.input.PollInput;
import org.opencastproject.poll.plugin.type.input.PollVoteInput;

import java.util.List;

public interface PollDataStore {

  PollInfo getPollInfo(String eventId);

  PollDefinition getPollDefinition(String eventId);

  PollDefinition createPoll(String eventId, PollInput pollInput, String userId);

  PollVoteResult submitVote(String eventId, PollVoteInput voteInput, String userId);

  PollDefinition getAudiencePoll(String pollId);

  List<PollDefinition> listAudiencePolls();

  PollDefinition createAudiencePoll(String question, String userId);

  boolean deleteAudiencePoll(String pollId, String userId);

  PollVoteResult submitAudienceAnswer(String pollId, String answer, String userId);

  PollVoteResult voteAudienceAnswer(String pollId, String answerId, String userId);
}
