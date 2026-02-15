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

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;

/**
 * GraphQL type representing quiz information for an event.
 */
@GraphQLName("QuizInfo")
public final class QuizInfo {

  private final boolean hasQuiz;
  private final String quizId;
  private final boolean isActive;
  private final String title;
  private final Integer questionCount;

  public QuizInfo(boolean hasQuiz, String quizId, boolean isActive, String title, Integer questionCount) {
    this.hasQuiz = hasQuiz;
    this.quizId = quizId;
    this.isActive = isActive;
    this.title = title;
    this.questionCount = questionCount;
  }

  @GraphQLField
  public boolean hasQuiz() {
    return hasQuiz;
  }

  @GraphQLField
  public String quizId() {
    return quizId;
  }

  @GraphQLField
  public boolean isActive() {
    return isActive;
  }

  @GraphQLField
  public String title() {
    return title;
  }

  @GraphQLField
  public Integer questionCount() {
    return questionCount;
  }

}
