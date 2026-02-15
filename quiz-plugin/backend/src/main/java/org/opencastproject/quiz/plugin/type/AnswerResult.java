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

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

/**
 * GraphQL type representing the result of a single answer.
 */
@GraphQLName("AnswerResult")
public final class AnswerResult {

  private final String questionId;
  private final Object answer;
  private final boolean isCorrect;
  private final Integer points;

  public AnswerResult(String questionId, Object answer, boolean isCorrect, Integer points) {
    this.questionId = questionId;
    this.answer = answer;
    this.isCorrect = isCorrect;
    this.points = points;
  }

  @GraphQLField
  public String questionId() {
    return questionId;
  }

  @GraphQLField
  public Object answer() {
    return answer;
  }

  @GraphQLField
  public boolean isCorrect() {
    return isCorrect;
  }

  @GraphQLField
  public Integer points() {
    return points;
  }

}
