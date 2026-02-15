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

package org.opencastproject.quiz.plugin.service;

import org.opencastproject.quiz.plugin.QuizInfo;
import org.opencastproject.quiz.plugin.type.QuizDefinition;
import org.opencastproject.quiz.plugin.type.QuizSubmissionResult;
import org.opencastproject.quiz.plugin.type.input.QuizAnswersInput;
import org.opencastproject.quiz.plugin.type.input.QuizInput;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service for quiz operations.
 *
 * This service acts as an abstraction layer between GraphQL and the data store.
 * It can be configured to use:
 * - Convex (external DBaaS) - Recommended for plugins
 * - Opencast Database (JPA) - For core integrations
 * - Other external services
 *
 * The service is a singleton and can be accessed via getInstance().
 */
public final class QuizService {

  private static final Logger logger = LoggerFactory.getLogger(QuizService.class);
  private static QuizService instance;

  private final QuizDataStore dataStore;

  private QuizService() {
    // Initialize data store based on configuration
    // For now, use Convex as default (can be configured via OSGi config)
    String convexUrl = System.getenv("CONVEX_URL");
    if (convexUrl != null && !convexUrl.isEmpty()) {
      logger.info("Initializing QuizService with Convex backend");
      this.dataStore = new ConvexQuizDataStore(convexUrl);
    } else {
      logger.warn("CONVEX_URL not set, using mock data store. Quiz functionality will be limited.");
      this.dataStore = new MockQuizDataStore();
    }
  }

  public static synchronized QuizService getInstance() {
    if (instance == null) {
      instance = new QuizService();
    }
    return instance;
  }

  /**
   * Gets quiz information for an event.
   */
  public QuizInfo getQuizInfo(String eventId) {
    try {
      return dataStore.getQuizInfo(eventId);
    } catch (Exception e) {
      logger.error("Failed to get quiz info for event: " + eventId, e);
      return new QuizInfo(false, null, false, null, null);
    }
  }

  /**
   * Gets the full quiz definition for an event (including questions).
   */
  public QuizDefinition getQuizDefinition(String eventId) {
    try {
      return dataStore.getQuizDefinition(eventId);
    } catch (Exception e) {
      logger.error("Failed to get quiz definition for event: " + eventId, e);
      return null;
    }
  }

  /**
   * Creates a new quiz.
   */
  public QuizDefinition createQuiz(String eventId, QuizInput quizInput, String userId) {
    try {
      return dataStore.createQuiz(eventId, quizInput, userId);
    } catch (Exception e) {
      logger.error("Failed to create quiz for event: " + eventId, e);
      throw new RuntimeException("Failed to create quiz: " + e.getMessage(), e);
    }
  }

  /**
   * Submits quiz answers.
   */
  public QuizSubmissionResult submitQuiz(String eventId, QuizAnswersInput answersInput, String userId) {
    try {
      return dataStore.submitQuiz(eventId, answersInput, userId);
    } catch (Exception e) {
      logger.error("Failed to submit quiz for event: " + eventId, e);
      throw new RuntimeException("Failed to submit quiz: " + e.getMessage(), e);
    }
  }

}
