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
import org.opencastproject.quiz.plugin.type.AnswerResult;
import org.opencastproject.quiz.plugin.type.Question;
import org.opencastproject.quiz.plugin.type.QuizDefinition;
import org.opencastproject.quiz.plugin.type.QuizSubmissionResult;
import org.opencastproject.quiz.plugin.type.input.QuizAnswersInput;
import org.opencastproject.quiz.plugin.type.input.QuizInput;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Convex-based implementation of QuizDataStore.
 *
 * This implementation calls Convex HTTP API to store and retrieve quiz data.
 *
 * Note: In a production environment, you would use the Convex Java SDK or
 * a more robust HTTP client with proper error handling and retries.
 */
public class ConvexQuizDataStore implements QuizDataStore {

  private static final Logger logger = LoggerFactory.getLogger(ConvexQuizDataStore.class);
  private final String convexUrl;
  private final Gson gson;
  private final HttpClient httpClient;

  public ConvexQuizDataStore(String convexUrl) {
    this.convexUrl = convexUrl.endsWith("/") ? convexUrl : convexUrl + "/";
    this.gson = new Gson();
    this.httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build();
  }

  @Override
  public QuizInfo getQuizInfo(String eventId) {
    try {
      // Call Convex query: getQuiz
      String url = convexUrl + "api/query";

      JsonObject payload = new JsonObject();
      payload.addProperty("path", "quiz:getQuiz");
      JsonObject args = new JsonObject();
      args.addProperty("eventId", eventId);
      payload.add("args", args);

      HttpRequest request = HttpRequest.newBuilder()
          .uri(URI.create(url))
          .header("Content-Type", "application/json")
          .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(payload)))
          .timeout(Duration.ofSeconds(30))
          .build();

      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() == 200) {
        JsonObject result = gson.fromJson(response.body(), JsonObject.class);
        JsonObject quiz = result.getAsJsonObject("value");

        if (quiz != null && !quiz.isJsonNull()) {
          return new QuizInfo(
            true,
            quiz.get("_id").getAsString(),
            quiz.get("isActive").getAsBoolean(),
            quiz.get("title").getAsString(),
            quiz.getAsJsonArray("questions").size()
          );
        }
      }

      return new QuizInfo(false, null, false, null, null);

    } catch (Exception e) {
      logger.error("Failed to get quiz info from Convex for event: " + eventId, e);
      return new QuizInfo(false, null, false, null, null);
    }
  }

  @Override
  public QuizDefinition getQuizDefinition(String eventId) {
    try {
      // Call Convex query: getQuiz
      String url = convexUrl + "api/query";

      JsonObject payload = new JsonObject();
      payload.addProperty("path", "quiz:getQuiz");
      JsonObject args = new JsonObject();
      args.addProperty("eventId", eventId);
      payload.add("args", args);

      HttpRequest request = HttpRequest.newBuilder()
          .uri(URI.create(url))
          .header("Content-Type", "application/json")
          .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(payload)))
          .timeout(Duration.ofSeconds(30))
          .build();

      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() == 200) {
        JsonObject result = gson.fromJson(response.body(), JsonObject.class);
        JsonObject quiz = result.getAsJsonObject("value");

        if (quiz != null && !quiz.isJsonNull()) {
          return convertJsonToQuizDefinition(quiz);
        }
      }

      return null;

    } catch (Exception e) {
      logger.error("Failed to get quiz definition from Convex for event: " + eventId, e);
      return null;
    }
  }

  @Override
  public QuizDefinition createQuiz(String eventId, QuizInput quizInput, String userId) {
    try {
      // Validate input
      if (quizInput.getQuestions() == null || quizInput.getQuestions().isEmpty()) {
        throw new IllegalArgumentException("Quiz must have at least one question");
      }

      // Call Convex mutation: createQuiz
      String url = convexUrl + "api/mutation";

      JsonObject payload = new JsonObject();
      payload.addProperty("path", "quiz:createQuiz");
      JsonObject args = new JsonObject();
      args.addProperty("eventId", eventId);
      args.addProperty("title", quizInput.getTitle());
      if (quizInput.getDescription() != null) {
        args.addProperty("description", quizInput.getDescription());
      }
      args.add("questions", convertQuestionsToJson(quizInput.getQuestions()));
      args.addProperty("isActive", quizInput.getIsActive());
      args.addProperty("createdBy", userId);
      payload.add("args", args);

      HttpRequest request = HttpRequest.newBuilder()
          .uri(URI.create(url))
          .header("Content-Type", "application/json")
          .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(payload)))
          .timeout(Duration.ofSeconds(30))
          .build();

      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() == 200) {
        JsonObject result = gson.fromJson(response.body(), JsonObject.class);
        JsonObject quiz = result.getAsJsonObject("value");

        return convertJsonToQuizDefinition(quiz);
      } else {
        throw new RuntimeException("Convex API returned error: " + response.statusCode());
      }

    } catch (Exception e) {
      logger.error("Failed to create quiz in Convex for event: " + eventId, e);
      throw new RuntimeException("Failed to create quiz: " + e.getMessage(), e);
    }
  }

  @Override
  public QuizSubmissionResult submitQuiz(String eventId, QuizAnswersInput answersInput, String userId) {
    try {
      // Call Convex mutation: submitQuiz
      String url = convexUrl + "api/mutation";

      JsonObject payload = new JsonObject();
      payload.addProperty("path", "quiz:submitQuiz");
      JsonObject args = new JsonObject();
      args.addProperty("eventId", eventId);
      args.addProperty("userId", userId);
      args.add("answers", convertAnswersToJson(answersInput.getAnswers()));
      payload.add("args", args);

      HttpRequest request = HttpRequest.newBuilder()
          .uri(URI.create(url))
          .header("Content-Type", "application/json")
          .POST(HttpRequest.BodyPublishers.ofString(gson.toJson(payload)))
          .timeout(Duration.ofSeconds(30))
          .build();

      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() == 200) {
        JsonObject result = gson.fromJson(response.body(), JsonObject.class);
        JsonObject submission = result.getAsJsonObject("value");

        // Parse answerResults if available
        List<AnswerResult> answerResults = null;
        if (submission.has("answerResults") && !submission.get("answerResults").isJsonNull()) {
          answerResults = new ArrayList<>();
          JsonArray answerResultsArray = submission.getAsJsonArray("answerResults");
          for (int i = 0; i < answerResultsArray.size(); i++) {
            JsonObject ar = answerResultsArray.get(i).getAsJsonObject();
            answerResults.add(new AnswerResult(
                ar.get("questionId").getAsString(),
                gson.fromJson(ar.get("answer"), Object.class),
                ar.get("isCorrect").getAsBoolean(),
                ar.get("points").getAsInt()
            ));
          }
        }

        return new QuizSubmissionResult(
          submission.get("submissionId").getAsString(),
          submission.get("score").getAsInt(),
          submission.get("maxScore").getAsInt(),
          submission.get("percentage").getAsInt(),
          true,
          answerResults
        );
      } else {
        throw new RuntimeException("Convex API returned error: " + response.statusCode());
      }

    } catch (Exception e) {
      logger.error("Failed to submit quiz to Convex for event: " + eventId, e);
      throw new RuntimeException("Failed to submit quiz: " + e.getMessage(), e);
    }
  }

  private JsonArray convertQuestionsToJson(List<org.opencastproject.quiz.plugin.type.input.QuestionInput> questions) {
    JsonArray array = new JsonArray();
    for (org.opencastproject.quiz.plugin.type.input.QuestionInput q : questions) {
      JsonObject obj = new JsonObject();
      obj.addProperty("id", UUID.randomUUID().toString());
      obj.addProperty("question", q.getQuestion());
      obj.addProperty("type", q.getType());
      if (q.getOptions() != null) {
        JsonArray options = new JsonArray();
        for (String option : q.getOptions()) {
          options.add(option);
        }
        obj.add("options", options);
      }
      if (q.getCorrectAnswer() != null) {
        obj.add("correctAnswer", gson.toJsonTree(q.getCorrectAnswer()));
      }
      obj.addProperty("points", q.getPoints());
      array.add(obj);
    }
    return array;
  }

  private JsonArray convertAnswersToJson(List<org.opencastproject.quiz.plugin.type.input.AnswerInput> answers) {
    JsonArray array = new JsonArray();
    for (org.opencastproject.quiz.plugin.type.input.AnswerInput a : answers) {
      JsonObject obj = new JsonObject();
      obj.addProperty("questionId", a.getQuestionId());
      obj.add("answer", gson.toJsonTree(a.getAnswer()));
      array.add(obj);
    }
    return array;
  }

  private QuizDefinition convertJsonToQuizDefinition(JsonObject quiz) {
    String id = quiz.get("_id").getAsString();
    String eventId = quiz.get("eventId").getAsString();
    String title = quiz.get("title").getAsString();
    String description = quiz.has("description") && !quiz.get("description").isJsonNull()
        ? quiz.get("description").getAsString() : null;
    boolean isActive = quiz.get("isActive").getAsBoolean();

    List<Question> questions = new ArrayList<>();
    JsonArray questionsArray = quiz.getAsJsonArray("questions");
    for (int i = 0; i < questionsArray.size(); i++) {
      JsonObject q = questionsArray.get(i).getAsJsonObject();
      String questionId = q.get("id").getAsString();
      String questionText = q.get("question").getAsString();
      String type = q.get("type").getAsString();
      List<String> options = null;
      if (q.has("options") && !q.get("options").isJsonNull()) {
        options = new ArrayList<>();
        JsonArray optionsArray = q.getAsJsonArray("options");
        for (int j = 0; j < optionsArray.size(); j++) {
          options.add(optionsArray.get(j).getAsString());
        }
      }
      Integer points = q.get("points").getAsInt();
      Object correctAnswer = null;
      if (q.has("correctAnswer") && !q.get("correctAnswer").isJsonNull()) {
        correctAnswer = gson.fromJson(q.get("correctAnswer"), Object.class);
      }
      questions.add(new Question(questionId, questionText, type, options, points, correctAnswer));
    }

    return new QuizDefinition(id, eventId, title, description, questions, isActive);
  }

}
