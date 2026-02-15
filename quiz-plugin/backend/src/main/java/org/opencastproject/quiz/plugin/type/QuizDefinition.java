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
 * GraphQL type representing a quiz definition.
 */
@GraphQLName("QuizDefinition")
public final class QuizDefinition {

  private final String id;
  private final String eventId;
  private final String title;
  private final String description;
  private final List<Question> questions;
  private final boolean isActive;

  public QuizDefinition(String id, String eventId, String title, String description,
                       List<Question> questions, boolean isActive) {
    this.id = id;
    this.eventId = eventId;
    this.title = title;
    this.description = description;
    this.questions = questions;
    this.isActive = isActive;
  }

  @GraphQLField
  public String id() {
    return id;
  }

  @GraphQLField
  public String eventId() {
    return eventId;
  }

  @GraphQLField
  public String title() {
    return title;
  }

  @GraphQLField
  public String description() {
    return description;
  }

  @GraphQLField
  public List<Question> questions() {
    return questions;
  }

  @GraphQLField
  public boolean isActive() {
    return isActive;
  }

}
