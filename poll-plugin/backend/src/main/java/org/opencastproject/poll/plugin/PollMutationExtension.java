package org.opencastproject.poll.plugin;

import org.opencastproject.graphql.type.input.Mutation;

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLTypeExtension;

@GraphQLTypeExtension(Mutation.class)
public final class PollMutationExtension {

  private PollMutationExtension() {
  }

  @GraphQLField
  public static PollMutation poll() {
    return new PollMutation();
  }
}
