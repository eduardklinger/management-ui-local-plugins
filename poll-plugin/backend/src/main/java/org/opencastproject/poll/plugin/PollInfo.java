package org.opencastproject.poll.plugin;

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

@GraphQLName("PollInfo")
public final class PollInfo {

  private final boolean hasPoll;
  private final String pollId;
  private final boolean isActive;
  private final String question;
  private final Integer optionCount;
  private final Integer totalVotes;

  public PollInfo(boolean hasPoll, String pollId, boolean isActive, String question,
                  Integer optionCount, Integer totalVotes) {
    this.hasPoll = hasPoll;
    this.pollId = pollId;
    this.isActive = isActive;
    this.question = question;
    this.optionCount = optionCount;
    this.totalVotes = totalVotes;
  }

  @GraphQLField
  public boolean hasPoll() {
    return hasPoll;
  }

  @GraphQLField
  public String pollId() {
    return pollId;
  }

  @GraphQLField
  public boolean isActive() {
    return isActive;
  }

  @GraphQLField
  public String question() {
    return question;
  }

  @GraphQLField
  public Integer optionCount() {
    return optionCount;
  }

  @GraphQLField
  public Integer totalVotes() {
    return totalVotes;
  }
}
