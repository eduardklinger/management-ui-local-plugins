package org.opencastproject.poll.plugin;

import org.opencastproject.graphql.provider.GraphQLExtensionProvider;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.propertytypes.ServiceDescription;

@Component(service = GraphQLExtensionProvider.class)
@ServiceDescription("Poll Plugin GraphQL Provider")
public class PollGraphQLProvider implements GraphQLExtensionProvider {
  // Marker component: GraphQL extensions in this package are auto-discovered.
}
