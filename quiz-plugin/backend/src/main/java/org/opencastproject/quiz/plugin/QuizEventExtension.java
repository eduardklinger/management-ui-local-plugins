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

import org.opencastproject.graphql.event.GqlEvent;
import org.opencastproject.quiz.plugin.service.QuizService;

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLTypeExtension;
import graphql.schema.DataFetchingEnvironment;

/**
 * GraphQL Type Extension for Event to add quiz information.
 *
 * This extends GqlEvent with quiz-related fields:
 * - quizInfo: Information about available quizzes for this event
 *
 * Example GraphQL query:
 * ```
 * query {
 *   eventById(id: "event-123") {
 *     id
 *     title
 *     quizInfo {
 *       hasQuiz
 *       quizId
 *       isActive
 *     }
 *   }
 * }
 * ```
 */
@GraphQLTypeExtension(GqlEvent.class)
public final class QuizEventExtension {

  private final GqlEvent event;

  public QuizEventExtension(GqlEvent event) {
    this.event = event;
  }

  /**
   * Returns quiz information for this event.
   *
   * This field fetches quiz data from Convex (or other external service)
   * via the QuizService.
   */
  @GraphQLField
  public QuizInfo quizInfo(DataFetchingEnvironment environment) {
    QuizService quizService = QuizService.getInstance();
    return quizService.getQuizInfo(event.getEvent().getIdentifier());
  }

  /**
   * Returns the full quiz definition for this event (including questions).
   *
   * This field fetches the complete quiz data from Convex (or other external service)
   * via the QuizService.
   */
  @GraphQLField
  public org.opencastproject.quiz.plugin.type.QuizDefinition quiz(DataFetchingEnvironment environment) {
    QuizService quizService = QuizService.getInstance();
    return quizService.getQuizDefinition(event.getEvent().getIdentifier());
  }

}
