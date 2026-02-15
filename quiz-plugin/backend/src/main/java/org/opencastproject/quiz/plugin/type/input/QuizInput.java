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
 * GraphQL Input type for creating a quiz.
 */
@GraphQLName("QuizInput")
public class QuizInput {

  @GraphQLField
  @GraphQLNonNull
  private String title;

  @GraphQLField
  private String description;

  @GraphQLField
  @GraphQLNonNull
  private List<QuestionInput> questions;

  @GraphQLField
  private Boolean isActive;

  // Getters and Setters
  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public List<QuestionInput> getQuestions() {
    return questions;
  }

  public void setQuestions(List<QuestionInput> questions) {
    this.questions = questions;
  }

  public Boolean getIsActive() {
    return isActive != null ? isActive : true;
  }

  public void setIsActive(Boolean isActive) {
    this.isActive = isActive;
  }

}
