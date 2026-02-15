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

import org.opencastproject.graphql.exception.GraphQLRuntimeException;
import org.opencastproject.quiz.plugin.service.QuizService;
import org.opencastproject.quiz.plugin.type.QuizDefinition;
import org.opencastproject.quiz.plugin.type.QuizSubmissionResult;
import org.opencastproject.quiz.plugin.type.input.QuizAnswersInput;
import org.opencastproject.quiz.plugin.type.input.QuizInput;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLNonNull;
import graphql.schema.DataFetchingEnvironment;

/**
 * GraphQL Mutation type for quiz operations.
 *
 * Provides mutations for:
 * - Creating quizzes
 * - Submitting quiz answers
 * - Getting quiz results
 */
@GraphQLName("QuizMutation")
public class QuizMutation {

  private static final Logger logger = LoggerFactory.getLogger(QuizMutation.class);

  public static final String TYPE_NAME = "QuizMutation";

  private final QuizService quizService;

  public QuizMutation() {
    this.quizService = QuizService.getInstance();
  }

  /**
   * Creates a new quiz for an event.
   *
   * This mutation creates a quiz definition in Convex (or external DB)
   * and returns the created quiz.
   */
  @GraphQLField
  @GraphQLNonNull
  @GraphQLDescription("Create a quiz for an event")
  public QuizDefinition createQuiz(
      @GraphQLName("eventId") @GraphQLNonNull String eventId,
      @GraphQLName("quiz") @GraphQLNonNull QuizInput quizInput,
      final DataFetchingEnvironment environment) {

    try {
      // Get current user from environment
      Object userContext = environment.getContext();
      String userId = extractUserId(userContext);

      if (userId == null) {
        throw new GraphQLRuntimeException(new RuntimeException("User not authenticated"));
      }

      // Try to get quiz input from arguments if deserialization failed
      QuizInput actualQuizInput = quizInput;
      if (quizInput == null
          || (quizInput.getTitle() == null && quizInput.getQuestions() == null)) {
        logger.warn("QuizInput deserialization may have failed, trying to extract from arguments");
        Object quizArg = environment.getArgument("quiz");
        if (quizArg instanceof java.util.Map) {
          @SuppressWarnings("unchecked")
          java.util.Map<String, Object> quizMap = (java.util.Map<String, Object>) quizArg;
          actualQuizInput = convertMapToQuizInput(quizMap);
        } else {
          throw new GraphQLRuntimeException(
              new RuntimeException("Quiz input is null or invalid"));
        }
      }

      // Debug: Log the input to see what we're getting
      String questionsInfo = actualQuizInput.getQuestions() != null
          ? String.valueOf(actualQuizInput.getQuestions().size()) : "null";
      logger.info("QuizInput received - title: " + actualQuizInput.getTitle()
                  + ", questions: " + questionsInfo);

      if (actualQuizInput.getTitle() == null || actualQuizInput.getTitle().trim().isEmpty()) {
        throw new GraphQLRuntimeException(new RuntimeException("Quiz title is required. Received: "
            + (actualQuizInput.getTitle() != null ? actualQuizInput.getTitle() : "null")));
      }
      if (actualQuizInput.getQuestions() == null) {
        throw new GraphQLRuntimeException(new RuntimeException("Quiz questions list is null"));
      }
      if (actualQuizInput.getQuestions().isEmpty()) {
        throw new GraphQLRuntimeException(new RuntimeException("Quiz must have at least one question"));
      }

      // Create quiz via service (which calls Convex or external DB)
      return quizService.createQuiz(eventId, actualQuizInput, userId);

    } catch (Exception e) {
      throw new GraphQLRuntimeException(e);
    }
  }

  /**
   * Converts a Map to QuizInput when GraphQL deserialization fails.
   * This is a workaround for graphql-java-annotations deserialization issues.
   */
  private QuizInput convertMapToQuizInput(java.util.Map<String, Object> quizMap) {
    QuizInput quizInput = new QuizInput();
    quizInput.setTitle((String) quizMap.get("title"));
    quizInput.setDescription((String) quizMap.get("description"));
    quizInput.setIsActive((Boolean) quizMap.getOrDefault("isActive", true));

    @SuppressWarnings("unchecked")
    java.util.List<java.util.Map<String, Object>> questionsList =
        (java.util.List<java.util.Map<String, Object>>) quizMap.get("questions");
    if (questionsList != null) {
      java.util.List<org.opencastproject.quiz.plugin.type.input.QuestionInput> questionInputs =
          new java.util.ArrayList<>();
      for (java.util.Map<String, Object> questionMap : questionsList) {
        org.opencastproject.quiz.plugin.type.input.QuestionInput questionInput =
            new org.opencastproject.quiz.plugin.type.input.QuestionInput();
        questionInput.setQuestion((String) questionMap.get("question"));
        questionInput.setType((String) questionMap.get("type"));
        questionInput.setPoints(((Number) questionMap.get("points")).intValue());
        @SuppressWarnings("unchecked")
        java.util.List<String> options = (java.util.List<String>) questionMap.get("options");
        questionInput.setOptions(options);
        questionInput.setCorrectAnswer(questionMap.get("correctAnswer"));
        questionInputs.add(questionInput);
      }
      quizInput.setQuestions(questionInputs);
    }

    return quizInput;
  }

  /**
   * Submits quiz answers for an event.
   *
   * This mutation submits answers to Convex and calculates the score.
   */
  @GraphQLField
  @GraphQLNonNull
  @GraphQLDescription("Submit quiz answers")
  public QuizSubmissionResult submitQuiz(
      @GraphQLName("eventId") @GraphQLNonNull String eventId,
      @GraphQLName("answers") @GraphQLNonNull QuizAnswersInput answersInput,
      final DataFetchingEnvironment environment) {

    try {
      Object userContext = environment.getContext();
      String userId = extractUserId(userContext);

      if (userId == null) {
        throw new GraphQLRuntimeException(new RuntimeException("User not authenticated"));
      }

      // Handle deserialization issues similar to createQuiz
      QuizAnswersInput actualAnswersInput = answersInput;
      if (answersInput == null || answersInput.getAnswers() == null) {
        logger.warn("QuizAnswersInput deserialization may have failed, trying to extract from arguments");
        Object answersArg = environment.getArgument("answers");
        if (answersArg instanceof java.util.Map) {
          actualAnswersInput = convertMapToQuizAnswersInput((java.util.Map<String, Object>) answersArg);
        } else {
          throw new GraphQLRuntimeException(new RuntimeException("Quiz answers input is null or invalid"));
        }
      }

      logger.info("QuizAnswersInput received - quizId: " + actualAnswersInput.getQuizId()
                  + ", answers count: " + (actualAnswersInput.getAnswers() != null
                      ? actualAnswersInput.getAnswers().size() : "null"));

      // Submit quiz via service
      return quizService.submitQuiz(eventId, actualAnswersInput, userId);

    } catch (Exception e) {
      throw new GraphQLRuntimeException(e);
    }
  }

  /**
   * Converts a Map to QuizAnswersInput (manual deserialization workaround).
   */
  private QuizAnswersInput convertMapToQuizAnswersInput(java.util.Map<String, Object> answersMap) {
    QuizAnswersInput answersInput = new QuizAnswersInput();
    answersInput.setQuizId((String) answersMap.get("quizId"));

    @SuppressWarnings("unchecked")
    java.util.List<java.util.Map<String, Object>> answersList =
        (java.util.List<java.util.Map<String, Object>>) answersMap.get("answers");
    if (answersList != null) {
      java.util.List<org.opencastproject.quiz.plugin.type.input.AnswerInput> answerInputs =
          new java.util.ArrayList<>();
      for (java.util.Map<String, Object> answerMap : answersList) {
        org.opencastproject.quiz.plugin.type.input.AnswerInput answerInput =
            new org.opencastproject.quiz.plugin.type.input.AnswerInput();
        answerInput.setQuestionId((String) answerMap.get("questionId"));
        answerInput.setAnswer(answerMap.get("answer"));
        answerInputs.add(answerInput);
      }
      answersInput.setAnswers(answerInputs);
    }

    return answersInput;
  }

  /**
   * Helper to extract user ID from GraphQL context.
   *
   * In a real implementation, this would extract the user from Opencast's
   * security context.
   */
  private String extractUserId(Object context) {
    // This is a placeholder - in real implementation, extract from Opencast User object
    if (context instanceof org.opencastproject.security.api.User) {
      return ((org.opencastproject.security.api.User) context).getUsername();
    }
    // Fallback for development/testing
    return "anonymous";
  }

}
