package org.opencastproject.poll.plugin;

import org.opencastproject.graphql.event.GqlEvent;
import org.opencastproject.poll.plugin.service.PollService;
import org.opencastproject.poll.plugin.type.PollDefinition;

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLTypeExtension;
import graphql.schema.DataFetchingEnvironment;

@GraphQLTypeExtension(GqlEvent.class)
public final class PollEventExtension {

  private final GqlEvent event;

  public PollEventExtension(GqlEvent event) {
    this.event = event;
  }

  @GraphQLField
  public PollInfo pollInfo(DataFetchingEnvironment environment) {
    return PollService.getInstance().getPollInfo(event.getEvent().getIdentifier());
  }

  @GraphQLField
  public PollDefinition poll(DataFetchingEnvironment environment) {
    return PollService.getInstance().getPollDefinition(event.getEvent().getIdentifier());
  }
}
