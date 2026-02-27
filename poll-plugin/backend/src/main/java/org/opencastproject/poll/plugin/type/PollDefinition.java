package org.opencastproject.poll.plugin.type;

import java.util.List;

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

@GraphQLName("PollDefinition")
public final class PollDefinition {

  private final String id;
  private final String eventId;
  private final String question;
  private final boolean isActive;
  private final String createdBy;
  private final List<PollOption> options;

  public PollDefinition(String id, String eventId, String question, boolean isActive,
                        String createdBy,
                        List<PollOption> options) {
    this.id = id;
    this.eventId = eventId;
    this.question = question;
    this.isActive = isActive;
    this.createdBy = createdBy;
    this.options = options;
  }

  @GraphQLField
  public String id() {
    return id;
  }

  @GraphQLField
  public String eventId() {
    return eventId;
  }

  @GraphQLField
  public String publicId() {
    return eventId;
  }

  @GraphQLField
  public String question() {
    return question;
  }

  @GraphQLField
  public boolean isActive() {
    return isActive;
  }

  @GraphQLField
  public String createdBy() {
    return createdBy;
  }

  @GraphQLField
  public List<PollOption> options() {
    return options;
  }
}
