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

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.OneToMany;
import javax.persistence.OrderColumn;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
@Table(name = "oc_quiz",
    indexes = {
      @Index(name = "idx_oc_quiz_event_id", columnList = "event_id", unique = true)
    }
)
public class QuizEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "event_id", nullable = false, length = 128)
  private String eventId;

  @Column(name = "title", nullable = false, length = 512)
  private String title;

  @Column(name = "description", length = 4096)
  private String description;

  @Column(name = "is_active")
  private boolean active;

  @Column(name = "created_by", length = 255)
  private String createdBy;

  @Temporal(TemporalType.TIMESTAMP)
  @Column(name = "created_at")
  private Date createdAt;

  @Temporal(TemporalType.TIMESTAMP)
  @Column(name = "updated_at")
  private Date updatedAt;

  @OneToMany(
      mappedBy = "quiz",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.EAGER
  )
  @OrderColumn(name = "position")
  private List<QuizQuestionEntity> questions = new ArrayList<>();

  @OneToMany(
      mappedBy = "quiz",
      cascade = CascadeType.ALL,
      orphanRemoval = true
  )
  private List<QuizSubmissionEntity> submissions = new ArrayList<>();

  public QuizEntity() {
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getEventId() {
    return eventId;
  }

  public void setEventId(String eventId) {
    this.eventId = eventId;
  }

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

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }

  public String getCreatedBy() {
    return createdBy;
  }

  public void setCreatedBy(String createdBy) {
    this.createdBy = createdBy;
  }

  public Date getCreatedAt() {
    return createdAt == null ? null : new Date(createdAt.getTime());
  }

  public void setCreatedAt(Date createdAt) {
    this.createdAt = createdAt == null ? null : new Date(createdAt.getTime());
  }

  public Date getUpdatedAt() {
    return updatedAt == null ? null : new Date(updatedAt.getTime());
  }

  public void setUpdatedAt(Date updatedAt) {
    this.updatedAt = updatedAt == null ? null : new Date(updatedAt.getTime());
  }

  public List<QuizQuestionEntity> getQuestions() {
    return questions;
  }

  public void setQuestions(List<QuizQuestionEntity> questions) {
    this.questions = questions == null ? new ArrayList<QuizQuestionEntity>() : questions;
  }

  public List<QuizSubmissionEntity> getSubmissions() {
    return submissions;
  }

  public void setSubmissions(List<QuizSubmissionEntity> submissions) {
    this.submissions = submissions == null ? new ArrayList<QuizSubmissionEntity>() : submissions;
  }

}
