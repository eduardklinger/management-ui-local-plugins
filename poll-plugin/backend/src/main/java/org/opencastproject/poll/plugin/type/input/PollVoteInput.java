package org.opencastproject.poll.plugin.type.input;

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLNonNull;

@GraphQLName("PollVoteInput")
public class PollVoteInput {

  @GraphQLField
  @GraphQLNonNull
  private String pollId;

  @GraphQLField
  @GraphQLNonNull
  private String optionId;

  public String getPollId() {
    return pollId;
  }

  public void setPollId(String pollId) {
    this.pollId = pollId;
  }

  public String getOptionId() {
    return optionId;
  }

  public void setOptionId(String optionId) {
    this.optionId = optionId;
  }
}
