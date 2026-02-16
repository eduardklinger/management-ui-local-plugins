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

import java.util.Date;

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
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
@Table(name = "oc_quiz_submission")
public class QuizSubmissionEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "quiz_id")
  private QuizEntity quiz;

  @Column(name = "event_id", nullable = false, length = 128)
  private String eventId;

  @Column(name = "user_id", length = 255)
  private String userId;

  @Column(name = "score")
  private Integer score;

  @Column(name = "max_score")
  private Integer maxScore;

  @Column(name = "percentage")
  private Integer percentage;

  @Column(name = "success")
  private boolean success;

  @Lob
  @Column(name = "answers_json")
  private String answersJson;

  @Temporal(TemporalType.TIMESTAMP)
  @Column(name = "submitted_at")
  private Date submittedAt;

  public QuizSubmissionEntity() {
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

  public String getEventId() {
    return eventId;
  }

  public void setEventId(String eventId) {
    this.eventId = eventId;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public Integer getScore() {
    return score;
  }

  public void setScore(Integer score) {
    this.score = score;
  }

  public Integer getMaxScore() {
    return maxScore;
  }

  public void setMaxScore(Integer maxScore) {
    this.maxScore = maxScore;
  }

  public Integer getPercentage() {
    return percentage;
  }

  public void setPercentage(Integer percentage) {
    this.percentage = percentage;
  }

  public boolean isSuccess() {
    return success;
  }

  public void setSuccess(boolean success) {
    this.success = success;
  }

  public String getAnswersJson() {
    return answersJson;
  }

  public void setAnswersJson(String answersJson) {
    this.answersJson = answersJson;
  }

  public Date getSubmittedAt() {
    return submittedAt == null ? null : new Date(submittedAt.getTime());
  }

  public void setSubmittedAt(Date submittedAt) {
    this.submittedAt = submittedAt == null ? null : new Date(submittedAt.getTime());
  }

}
