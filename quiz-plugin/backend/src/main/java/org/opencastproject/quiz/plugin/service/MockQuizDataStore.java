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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Mock implementation of QuizDataStore for testing/development.
 *
 * This implementation stores data in memory and is not persistent.
 * Use only for development or when Convex is not configured.
 */
public class MockQuizDataStore implements QuizDataStore {

  // In-memory storage (not persistent!)
  private final List<QuizDefinition> quizzes = new ArrayList<>();

  @Override
  public QuizInfo getQuizInfo(String eventId) {
    // Find quiz for this event
    for (QuizDefinition quiz : quizzes) {
      if (quiz.eventId().equals(eventId) && quiz.isActive()) {
        return new QuizInfo(
          true,
          quiz.id(),
          true,
          quiz.title(),
          quiz.questions().size()
        );
      }
    }
    return new QuizInfo(false, null, false, null, null);
  }

  @Override
  public QuizDefinition getQuizDefinition(String eventId) {
    // Find quiz for this event
    for (QuizDefinition quiz : quizzes) {
      if (quiz.eventId().equals(eventId) && quiz.isActive()) {
        return quiz;
      }
    }
    return null;
  }

  @Override
  public QuizDefinition createQuiz(String eventId, QuizInput quizInput, String userId) {
    String id = UUID.randomUUID().toString();

    // Validate input
    if (quizInput.getQuestions() == null || quizInput.getQuestions().isEmpty()) {
      throw new IllegalArgumentException("Quiz must have at least one question");
    }

    List<Question> questions = new ArrayList<>();
    for (org.opencastproject.quiz.plugin.type.input.QuestionInput qInput : quizInput.getQuestions()) {
      questions.add(new Question(
          UUID.randomUUID().toString(),
          qInput.getQuestion(),
          qInput.getType(),
          qInput.getOptions(),
          qInput.getPoints(),
          qInput.getCorrectAnswer()
      ));
    }

    QuizDefinition quiz = new QuizDefinition(
        id,
        eventId,
        quizInput.getTitle(),
        quizInput.getDescription(),
        questions,
        quizInput.getIsActive()
    );

    quizzes.add(quiz);
    return quiz;
  }

  @Override
  public QuizSubmissionResult submitQuiz(String eventId, QuizAnswersInput answersInput, String userId) {
    // Validate input
    if (answersInput == null) {
      throw new RuntimeException("QuizAnswersInput is null");
    }
    if (answersInput.getAnswers() == null || answersInput.getAnswers().isEmpty()) {
      throw new RuntimeException("Quiz answers list is null or empty");
    }

    // Find the quiz for this event
    QuizDefinition quiz = null;
    for (QuizDefinition q : quizzes) {
      if (q.eventId().equals(eventId)) {
        quiz = q;
        break;
      }
    }

    if (quiz == null) {
      throw new RuntimeException("Quiz not found for event: " + eventId);
    }

    // Calculate maxScore from quiz questions
    int maxScore = quiz.questions().stream()
        .mapToInt(Question::points)
        .sum();

    // Calculate score by checking answers
    int score = 0;
    Map<String, Question> questionMap = new HashMap<>();
    for (Question q : quiz.questions()) {
      questionMap.put(q.id(), q);
    }

    List<AnswerResult> answerResults = new ArrayList<>();

    // Check each submitted answer
    for (org.opencastproject.quiz.plugin.type.input.AnswerInput answerInput : answersInput.getAnswers()) {
      Question question = questionMap.get(answerInput.getQuestionId());
      if (question != null) {
        Object correctAnswer = question.getCorrectAnswer();
        Object submittedAnswer = answerInput.getAnswer();

        // Check if answer is correct
        boolean isCorrect = false;
        if (correctAnswer != null && submittedAnswer != null) {
          isCorrect = compareAnswers(correctAnswer, submittedAnswer);
        }

        // Give points only if answer is correct
        int pointsEarned = 0;
        if (isCorrect) {
          pointsEarned = question.points();
          score += pointsEarned;
        }

        // Store answer result
        answerResults.add(new AnswerResult(
            answerInput.getQuestionId(),
            submittedAnswer,
            isCorrect,
            pointsEarned
        ));
      }
    }

    // Calculate percentage
    int percentage = maxScore > 0 ? (score * 100) / maxScore : 0;

    return new QuizSubmissionResult(
      UUID.randomUUID().toString(),
      score,
      maxScore,
      percentage,
      true,
      answerResults
    );
  }

  /**
   * Compares a correct answer with a submitted answer.
   * Handles different answer types: String, String[], and other objects.
   */
  private boolean compareAnswers(Object correctAnswer, Object submittedAnswer) {
    // Handle String comparison
    if (correctAnswer instanceof String && submittedAnswer instanceof String) {
      return correctAnswer.equals(submittedAnswer);
    }

    // Handle array comparison (for multiple choice)
    if (correctAnswer instanceof List && submittedAnswer instanceof List) {
      @SuppressWarnings("unchecked")
      List<Object> correctList = (List<Object>) correctAnswer;
      @SuppressWarnings("unchecked")
      List<Object> submittedList = (List<Object>) submittedAnswer;
      if (correctList.size() != submittedList.size()) {
        return false;
      }
      // Check if all submitted answers are in correct answers
      return correctList.containsAll(submittedList) && submittedList.containsAll(correctList);
    }

    // Handle array comparison (submitted as String[])
    if (correctAnswer instanceof List && submittedAnswer instanceof String[]) {
      @SuppressWarnings("unchecked")
      List<Object> correctList = (List<Object>) correctAnswer;
      String[] submittedArray = (String[]) submittedAnswer;
      if (correctList.size() != submittedArray.length) {
        return false;
      }
      for (String answer : submittedArray) {
        if (!correctList.contains(answer)) {
          return false;
        }
      }
      return true;
    }

    // Fallback: use equals
    return correctAnswer != null && correctAnswer.equals(submittedAnswer);
  }

}
