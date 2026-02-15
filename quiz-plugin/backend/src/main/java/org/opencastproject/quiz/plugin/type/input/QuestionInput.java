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

package org.opencastproject.quiz.plugin.type.input;

import java.util.List;

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLNonNull;

/**
 * GraphQL Input type for a quiz question.
 */
@GraphQLName("QuestionInput")
public class QuestionInput {

  @GraphQLField
  @GraphQLNonNull
  private String question;

  @GraphQLField
  @GraphQLNonNull
  private String type; // "multiple_choice", "single_choice", "text"

  @GraphQLField
  private List<String> options;

  @GraphQLField
  private Object correctAnswer;

  @GraphQLField
  @GraphQLNonNull
  private Integer points;

  // Getters and Setters
  public String getQuestion() {
    return question;
  }

  public void setQuestion(String question) {
    this.question = question;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public List<String> getOptions() {
    return options;
  }

  public void setOptions(List<String> options) {
    this.options = options;
  }

  public Object getCorrectAnswer() {
    return correctAnswer;
  }

  public void setCorrectAnswer(Object correctAnswer) {
    this.correctAnswer = correctAnswer;
  }

  public Integer getPoints() {
    return points;
  }

  public void setPoints(Integer points) {
    this.points = points;
  }

}
