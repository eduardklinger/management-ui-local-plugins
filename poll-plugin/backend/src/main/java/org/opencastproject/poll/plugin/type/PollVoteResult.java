package org.opencastproject.poll.plugin.type;

import java.util.List;

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

@GraphQLName("PollVoteResult")
public final class PollVoteResult {

  private final String pollId;
  private final String selectedOptionId;
  private final int totalVotes;
  private final boolean success;
  private final List<PollOption> options;

  public PollVoteResult(String pollId, String selectedOptionId, int totalVotes,
                        boolean success, List<PollOption> options) {
    this.pollId = pollId;
    this.selectedOptionId = selectedOptionId;
    this.totalVotes = totalVotes;
    this.success = success;
    this.options = options;
  }

  @GraphQLField
  public String pollId() {
    return pollId;
  }

  @GraphQLField
  public String selectedOptionId() {
    return selectedOptionId;
  }

  @GraphQLField
  public int totalVotes() {
    return totalVotes;
  }

  @GraphQLField
  public boolean success() {
    return success;
  }

  @GraphQLField
  public List<PollOption> options() {
    return options;
  }
}
