package org.opencastproject.poll.plugin.type.input;

import java.util.List;

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLNonNull;

@GraphQLName("PollInput")
public class PollInput {

  @GraphQLField
  @GraphQLNonNull
  private String question;

  @GraphQLField
  @GraphQLNonNull
  private List<String> options;

  @GraphQLField
  private Boolean isActive;

  public String getQuestion() {
    return question;
  }

  public void setQuestion(String question) {
    this.question = question;
  }

  public List<String> getOptions() {
    return options;
  }

  public void setOptions(List<String> options) {
    this.options = options;
  }

  public Boolean getIsActive() {
    return isActive != null ? isActive : true;
  }

  public void setIsActive(Boolean isActive) {
    this.isActive = isActive;
  }
}
