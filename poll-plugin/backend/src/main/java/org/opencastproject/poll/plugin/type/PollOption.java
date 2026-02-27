package org.opencastproject.poll.plugin.type;

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

@GraphQLName("PollOption")
public final class PollOption {

  private final String id;
  private final String label;
  private final int voteCount;

  public PollOption(String id, String label, int voteCount) {
    this.id = id;
    this.label = label;
    this.voteCount = voteCount;
  }

  @GraphQLField
  public String id() {
    return id;
  }

  @GraphQLField
  public String label() {
    return label;
  }

  @GraphQLField
  public int voteCount() {
    return voteCount;
  }
}
