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

package org.opencastproject.quiz.plugin.type;

import java.util.List;

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

/**
 * GraphQL type representing a quiz question.
 */
@GraphQLName("Question")
public final class Question {

  private final String id;
  private final String question;
  private final String type;
  private final List<String> options;
  private final Integer points;
  private final Object correctAnswer;

  public Question(String id, String question, String type, List<String> options, Integer points) {
    this(id, question, type, options, points, null);
  }

  public Question(String id, String question, String type, List<String> options, Integer points, Object correctAnswer) {
    this.id = id;
    this.question = question;
    this.type = type;
    this.options = options;
    this.points = points;
    this.correctAnswer = correctAnswer;
  }

  @GraphQLField
  public String id() {
    return id;
  }

  @GraphQLField
  public String question() {
    return question;
  }

  @GraphQLField
  public String type() {
    return type;
  }

  @GraphQLField
  public List<String> options() {
    return options;
  }

  @GraphQLField
  public Integer points() {
    return points;
  }

  /**
   * Returns the correct answer for this question.
   * Note: This is not exposed via GraphQL to prevent cheating.
   * It's only used internally for answer validation.
   */
  public Object getCorrectAnswer() {
    return correctAnswer;
  }

}
