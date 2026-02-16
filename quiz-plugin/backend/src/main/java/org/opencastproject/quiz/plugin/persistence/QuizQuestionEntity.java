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

package org.opencastproject.quiz.plugin.persistence;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "oc_quiz_question")
public class QuizQuestionEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "quiz_id")
  private QuizEntity quiz;

  @Column(name = "question_text", length = 4096)
  private String questionText;

  @Column(name = "question_type", length = 64)
  private String questionType;

  @Lob
  @Column(name = "options_json")
  private String optionsJson;

  @Lob
  @Column(name = "correct_answer_json")
  private String correctAnswerJson;

  @Column(name = "points")
  private Integer points;

  public QuizQuestionEntity() {
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public QuizEntity getQuiz() {
    return quiz;
  }

  public void setQuiz(QuizEntity quiz) {
    this.quiz = quiz;
  }

  public String getQuestionText() {
    return questionText;
  }

  public void setQuestionText(String questionText) {
    this.questionText = questionText;
  }

  public String getQuestionType() {
    return questionType;
  }

  public void setQuestionType(String questionType) {
    this.questionType = questionType;
  }

  public String getOptionsJson() {
    return optionsJson;
  }

  public void setOptionsJson(String optionsJson) {
    this.optionsJson = optionsJson;
  }

  public String getCorrectAnswerJson() {
    return correctAnswerJson;
  }

  public void setCorrectAnswerJson(String correctAnswerJson) {
    this.correctAnswerJson = correctAnswerJson;
  }

  public Integer getPoints() {
    return points;
  }

  public void setPoints(Integer points) {
    this.points = points;
  }

}
