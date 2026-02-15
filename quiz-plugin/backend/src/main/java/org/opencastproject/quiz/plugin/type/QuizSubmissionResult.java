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
 * GraphQL type representing the result of a quiz submission.
 */
@GraphQLName("QuizSubmissionResult")
public final class QuizSubmissionResult {

  private final String submissionId;
  private final Integer score;
  private final Integer maxScore;
  private final Integer percentage;
  private final boolean success;
  private final List<AnswerResult> answerResults;

  public QuizSubmissionResult(String submissionId, Integer score, Integer maxScore,
                             Integer percentage, boolean success) {
    this(submissionId, score, maxScore, percentage, success, null);
  }

  public QuizSubmissionResult(String submissionId, Integer score, Integer maxScore,
                             Integer percentage, boolean success, List<AnswerResult> answerResults) {
    this.submissionId = submissionId;
    this.score = score;
    this.maxScore = maxScore;
    this.percentage = percentage;
    this.success = success;
    this.answerResults = answerResults;
  }

  @GraphQLField
  public String submissionId() {
    return submissionId;
  }

  @GraphQLField
  public Integer score() {
    return score;
  }

  @GraphQLField
  public Integer maxScore() {
    return maxScore;
  }

  @GraphQLField
  public Integer percentage() {
    return percentage;
  }

  @GraphQLField
  public boolean success() {
    return success;
  }

  @GraphQLField
  public List<AnswerResult> answerResults() {
    return answerResults;
  }

}
