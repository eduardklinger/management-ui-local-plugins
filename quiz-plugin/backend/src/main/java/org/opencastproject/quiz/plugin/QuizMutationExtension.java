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

import org.opencastproject.graphql.type.input.Mutation;

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLTypeExtension;

/**
 * GraphQL Type Extension for Mutation to add quiz-related mutations.
 *
 * This extends the Mutation type with:
 * - quiz(): Access to QuizMutation for quiz operations
 *
 * Example GraphQL mutation:
 * ```
 * mutation {
 *   quiz {
 *     createQuiz(eventId: "event-123", quiz: {...}) {
 *       id
 *       title
 *     }
 *   }
 * }
 * ```
 */
@GraphQLTypeExtension(Mutation.class)
public final class QuizMutationExtension {

  private QuizMutationExtension() {
    // Utility class
  }

  @GraphQLField
  public static QuizMutation quiz() {
    return new QuizMutation();
  }

}
