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

import org.opencastproject.db.DBSessionFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Modified;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.Designate;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

import javax.persistence.EntityManagerFactory;

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
@Component(service = QuizService.class, immediate = true)
@Designate(ocd = QuizService.QuizServiceConfig.class)
public final class QuizService {

  private static final Logger logger = LoggerFactory.getLogger(QuizService.class);
  private static QuizService instance;

  @Reference(
      cardinality = ReferenceCardinality.OPTIONAL,
      policy = ReferencePolicy.DYNAMIC
  )
  private volatile DBSessionFactory dbSessionFactory;

  @Reference(
      target = "(osgi.unit.name=org.opencastproject.quiz)",
      cardinality = ReferenceCardinality.OPTIONAL,
      policy = ReferencePolicy.DYNAMIC
  )
  private volatile EntityManagerFactory entityManagerFactory;

  private QuizDataStore dataStore;

  public QuizService() {
    configureFromEnvironment();
  }

  @Activate
  public void activate(QuizServiceConfig config) {
    configureFromConfig(config);
    instance = this;
  }

  @Modified
  public void modified(QuizServiceConfig config) {
    configureFromConfig(config);
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

  private void configureFromConfig(QuizServiceConfig config) {
    String store = config.store();
    if (store == null) {
      store = "opencast";
    }

    switch (store.toLowerCase()) {
      case "convex":
        String convexUrl = config.convexUrl();
        if (convexUrl == null || convexUrl.trim().isEmpty()) {
          convexUrl = System.getenv("CONVEX_URL");
        }
        if (convexUrl != null && !convexUrl.trim().isEmpty()) {
          logger.info("Initializing QuizService with Convex backend");
          dataStore = new ConvexQuizDataStore(convexUrl);
        } else {
          logger.warn("Convex store selected but no URL configured; falling back to mock");
          dataStore = new MockQuizDataStore();
        }
        break;
      case "mock":
        logger.warn("Initializing QuizService with mock data store. Quiz data will not persist.");
        dataStore = new MockQuizDataStore();
        break;
      case "opencast":
      default:
        if (dbSessionFactory == null || entityManagerFactory == null) {
          logger.warn("Opencast store selected but persistence is not available; falling back to mock");
          dataStore = new MockQuizDataStore();
        } else {
          logger.info("Initializing QuizService with Opencast JPA backend");
          dataStore = new OpencastQuizDataStore(dbSessionFactory, entityManagerFactory);
        }
        break;
    }
  }

  private void configureFromEnvironment() {
    String convexUrl = System.getenv("CONVEX_URL");
    if (convexUrl != null && !convexUrl.isEmpty()) {
      logger.info("Initializing QuizService with Convex backend (env fallback)");
      dataStore = new ConvexQuizDataStore(convexUrl);
    } else {
      logger.warn("CONVEX_URL not set, using mock data store. Quiz functionality will be limited.");
      dataStore = new MockQuizDataStore();
    }
  }

  @ObjectClassDefinition(
      name = "Quiz Plugin Service",
      description = "Selects the backend store used by the quiz plugin"
  )
  public @interface QuizServiceConfig {
    @AttributeDefinition(
        name = "Store",
        description = "Backend store for quiz data (opencast, convex, mock)"
    )
    String store() default "opencast";

    @AttributeDefinition(
        name = "Convex URL",
        description = "Convex deployment URL (only used when store=convex)"
    )
    String convexUrl() default "";
  }

}
