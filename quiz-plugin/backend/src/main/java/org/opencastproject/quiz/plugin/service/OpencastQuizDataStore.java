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

import org.opencastproject.db.DBSession;
import org.opencastproject.db.DBSessionFactory;
import org.opencastproject.quiz.plugin.QuizInfo;
import org.opencastproject.quiz.plugin.persistence.QuizEntity;
import org.opencastproject.quiz.plugin.persistence.QuizQuestionEntity;
import org.opencastproject.quiz.plugin.persistence.QuizSubmissionEntity;
import org.opencastproject.quiz.plugin.type.AnswerResult;
import org.opencastproject.quiz.plugin.type.Question;
import org.opencastproject.quiz.plugin.type.QuizDefinition;
import org.opencastproject.quiz.plugin.type.QuizSubmissionResult;
import org.opencastproject.quiz.plugin.type.input.AnswerInput;
import org.opencastproject.quiz.plugin.type.input.QuestionInput;
import org.opencastproject.quiz.plugin.type.input.QuizAnswersInput;
import org.opencastproject.quiz.plugin.type.input.QuizInput;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.TypedQuery;

/**
 * JPA-backed quiz data store using Opencast's database.
 */
public class OpencastQuizDataStore implements QuizDataStore {

  private static final Logger logger = LoggerFactory.getLogger(OpencastQuizDataStore.class);

  private static final Type STRING_LIST_TYPE = new TypeToken<List<String>>() { } .getType();

  private final DBSessionFactory dbSessionFactory;
  private final EntityManagerFactory entityManagerFactory;
  private final Gson gson = new Gson();

  public OpencastQuizDataStore(DBSessionFactory dbSessionFactory, EntityManagerFactory entityManagerFactory) {
    this.dbSessionFactory = dbSessionFactory;
    this.entityManagerFactory = entityManagerFactory;
  }

  @Override
  public QuizInfo getQuizInfo(String eventId) {
    try (DBSession session = dbSessionFactory.createSession(entityManagerFactory)) {
      return session.exec(em -> {
        QuizEntity quiz = findActiveQuizByEventId(em, eventId);
        if (quiz == null) {
          return new QuizInfo(false, null, false, null, null);
        }
        int questionCount = quiz.getQuestions() != null ? quiz.getQuestions().size() : 0;
        return new QuizInfo(true, String.valueOf(quiz.getId()), quiz.isActive(), quiz.getTitle(), questionCount);
      });
    } catch (Exception e) {
      logger.error("Failed to fetch quiz info for event {}", eventId, e);
      return new QuizInfo(false, null, false, null, null);
    }
  }

  @Override
  public QuizDefinition getQuizDefinition(String eventId) {
    try (DBSession session = dbSessionFactory.createSession(entityManagerFactory)) {
      return session.exec(em -> {
        QuizEntity quiz = findActiveQuizByEventId(em, eventId);
        return quiz == null ? null : toQuizDefinition(quiz);
      });
    } catch (Exception e) {
      logger.error("Failed to fetch quiz definition for event {}", eventId, e);
      return null;
    }
  }

  @Override
  public QuizDefinition createQuiz(String eventId, QuizInput quizInput, String userId) {
    if (quizInput == null || quizInput.getQuestions() == null || quizInput.getQuestions().isEmpty()) {
      throw new IllegalArgumentException("Quiz must have at least one question");
    }

    try (DBSession session = dbSessionFactory.createSession(entityManagerFactory)) {
      return session.execTx(em -> {
        QuizEntity existing = findQuizByEventId(em, eventId);
        if (existing != null) {
          em.remove(existing);
          em.flush();
        }

        QuizEntity quiz = new QuizEntity();
        quiz.setEventId(eventId);
        quiz.setTitle(quizInput.getTitle());
        quiz.setDescription(quizInput.getDescription());
        quiz.setActive(quizInput.getIsActive());
        quiz.setCreatedBy(userId);
        quiz.setCreatedAt(new Date());
        quiz.setUpdatedAt(new Date());

        List<QuizQuestionEntity> questions = new ArrayList<>();
        for (QuestionInput questionInput : quizInput.getQuestions()) {
          QuizQuestionEntity question = new QuizQuestionEntity();
          question.setQuiz(quiz);
          question.setQuestionText(questionInput.getQuestion());
          question.setQuestionType(questionInput.getType());
          question.setPoints(questionInput.getPoints());

          if (questionInput.getOptions() != null) {
            question.setOptionsJson(gson.toJson(questionInput.getOptions()));
          }
          if (questionInput.getCorrectAnswer() != null) {
            question.setCorrectAnswerJson(gson.toJson(questionInput.getCorrectAnswer()));
          }

          questions.add(question);
        }

        quiz.setQuestions(questions);

        em.persist(quiz);
        em.flush();

        return toQuizDefinition(quiz);
      });
    }
  }

  @Override
  public QuizSubmissionResult submitQuiz(String eventId, QuizAnswersInput answersInput, String userId) {
    if (answersInput == null || answersInput.getAnswers() == null || answersInput.getAnswers().isEmpty()) {
      throw new IllegalArgumentException("Quiz answers list is null or empty");
    }

    try (DBSession session = dbSessionFactory.createSession(entityManagerFactory)) {
      return session.execTx(em -> {
        QuizEntity quiz = findActiveQuizByEventId(em, eventId);
        if (quiz == null) {
          throw new RuntimeException("Quiz not found for event: " + eventId);
        }

        if (answersInput.getQuizId() != null
            && !answersInput.getQuizId().equals(String.valueOf(quiz.getId()))) {
          throw new RuntimeException("Quiz ID does not match event quiz");
        }

        List<Question> questions = toQuestions(quiz.getQuestions());

        int maxScore = 0;
        Map<String, Question> questionMap = new HashMap<>();
        for (Question question : questions) {
          int points = question.points() == null ? 0 : question.points();
          maxScore += points;
          questionMap.put(question.id(), question);
        }

        int score = 0;
        List<AnswerResult> answerResults = new ArrayList<>();
        for (AnswerInput answerInput : answersInput.getAnswers()) {
          Question question = questionMap.get(answerInput.getQuestionId());
          if (question == null) {
            continue;
          }

          Object correctAnswer = question.getCorrectAnswer();
          Object submittedAnswer = answerInput.getAnswer();
          boolean isCorrect = compareAnswers(correctAnswer, submittedAnswer);
          int pointsEarned = 0;
          if (isCorrect) {
            pointsEarned = question.points() == null ? 0 : question.points();
            score += pointsEarned;
          }

          answerResults.add(new AnswerResult(
              answerInput.getQuestionId(),
              submittedAnswer,
              isCorrect,
              pointsEarned
          ));
        }

        int percentage = maxScore > 0 ? (score * 100) / maxScore : 0;

        QuizSubmissionEntity submission = new QuizSubmissionEntity();
        submission.setQuiz(quiz);
        submission.setEventId(eventId);
        submission.setUserId(userId);
        submission.setScore(score);
        submission.setMaxScore(maxScore);
        submission.setPercentage(percentage);
        submission.setSuccess(true);
        submission.setSubmittedAt(new Date());
        submission.setAnswersJson(gson.toJson(answersInput.getAnswers()));

        em.persist(submission);
        em.flush();

        return new QuizSubmissionResult(
            String.valueOf(submission.getId()),
            score,
            maxScore,
            percentage,
            true,
            answerResults
        );
      });
    }
  }

  private QuizEntity findActiveQuizByEventId(EntityManager em, String eventId) {
    TypedQuery<QuizEntity> query = em.createQuery(
        "SELECT q FROM QuizEntity q LEFT JOIN FETCH q.questions "
            + "WHERE q.eventId = :eventId AND q.active = true",
        QuizEntity.class
    );
    query.setParameter("eventId", eventId);
    query.setMaxResults(1);
    List<QuizEntity> results = query.getResultList();
    return results.isEmpty() ? null : results.get(0);
  }

  private QuizEntity findQuizByEventId(EntityManager em, String eventId) {
    TypedQuery<QuizEntity> query = em.createQuery(
        "SELECT q FROM QuizEntity q LEFT JOIN FETCH q.questions WHERE q.eventId = :eventId",
        QuizEntity.class
    );
    query.setParameter("eventId", eventId);
    query.setMaxResults(1);
    List<QuizEntity> results = query.getResultList();
    return results.isEmpty() ? null : results.get(0);
  }

  private QuizDefinition toQuizDefinition(QuizEntity quiz) {
    List<Question> questions = toQuestions(quiz.getQuestions());
    return new QuizDefinition(
        String.valueOf(quiz.getId()),
        quiz.getEventId(),
        quiz.getTitle(),
        quiz.getDescription(),
        questions,
        quiz.isActive()
    );
  }

  private List<Question> toQuestions(List<QuizQuestionEntity> questionEntities) {
    List<Question> questions = new ArrayList<>();
    if (questionEntities == null) {
      return questions;
    }
    for (QuizQuestionEntity entity : questionEntities) {
      List<String> options = null;
      if (entity.getOptionsJson() != null) {
        options = gson.fromJson(entity.getOptionsJson(), STRING_LIST_TYPE);
      }
      Object correctAnswer = null;
      if (entity.getCorrectAnswerJson() != null) {
        correctAnswer = gson.fromJson(entity.getCorrectAnswerJson(), Object.class);
      }
      questions.add(new Question(
          String.valueOf(entity.getId()),
          entity.getQuestionText(),
          entity.getQuestionType(),
          options,
          entity.getPoints(),
          correctAnswer
      ));
    }
    return questions;
  }

  /**
   * Compares a correct answer with a submitted answer.
   * Handles different answer types: String, List, and other objects.
   */
  private boolean compareAnswers(Object correctAnswer, Object submittedAnswer) {
    if (correctAnswer == null || submittedAnswer == null) {
      return false;
    }

    if (correctAnswer instanceof String && submittedAnswer instanceof String) {
      return correctAnswer.equals(submittedAnswer);
    }

    if (correctAnswer instanceof List && submittedAnswer instanceof List) {
      @SuppressWarnings("unchecked")
      List<Object> correctList = (List<Object>) correctAnswer;
      @SuppressWarnings("unchecked")
      List<Object> submittedList = (List<Object>) submittedAnswer;
      if (correctList.size() != submittedList.size()) {
        return false;
      }
      return correctList.containsAll(submittedList) && submittedList.containsAll(correctList);
    }

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

    return correctAnswer.equals(submittedAnswer);
  }

}
