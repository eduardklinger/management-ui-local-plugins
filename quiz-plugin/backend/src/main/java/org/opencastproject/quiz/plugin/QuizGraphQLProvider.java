/*
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 *
 * The Apereo Foundation licenses this file to you under the Educational
 * Community License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of the License
 * at:
 *
 *   http://opensource.org/licenses/ecl2.txt
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations under
 * the License.
 *
 */

package org.opencastproject.quiz.plugin;

import org.opencastproject.graphql.provider.GraphQLExtensionProvider;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.propertytypes.ServiceDescription;

/**
 * GraphQL Extension Provider for Quiz Plugin.
 *
 * This provider registers GraphQL extensions for quiz functionality:
 * - QuizInfo extension on GqlEvent
 * - Quiz mutations
 *
 * The plugin is fully encapsulated and can be installed as a JAR.
 */
@Component(service = GraphQLExtensionProvider.class)
@ServiceDescription("Quiz Plugin GraphQL Provider")
public class QuizGraphQLProvider implements GraphQLExtensionProvider {

  // This class is automatically discovered by Opencast's GraphQL system
  // All @GraphQLTypeExtension classes in this package will be registered

}
