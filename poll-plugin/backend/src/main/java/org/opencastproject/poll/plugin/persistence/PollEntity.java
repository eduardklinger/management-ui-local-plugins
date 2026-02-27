package org.opencastproject.poll.plugin.persistence;

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
@Table(name = "oc_poll",
    indexes = {
      @Index(name = "idx_oc_poll_event_id", columnList = "event_id", unique = true)
    }
)
public class PollEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "event_id", nullable = false, length = 128)
  private String eventId;

  @Column(name = "question", nullable = false, length = 2048)
  private String question;

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
      mappedBy = "poll",
      cascade = CascadeType.ALL,
      orphanRemoval = true,
      fetch = FetchType.EAGER
  )
  @OrderColumn(name = "position")
  private List<PollOptionEntity> options = new ArrayList<>();

  @OneToMany(
      mappedBy = "poll",
      cascade = CascadeType.ALL,
      orphanRemoval = true
  )
  private List<PollVoteEntity> votes = new ArrayList<>();

  public PollEntity() {
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

  public String getQuestion() {
    return question;
  }

  public void setQuestion(String question) {
    this.question = question;
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

  public List<PollOptionEntity> getOptions() {
    return options;
  }

  public void setOptions(List<PollOptionEntity> options) {
    this.options = options == null ? new ArrayList<PollOptionEntity>() : options;
  }

  public List<PollVoteEntity> getVotes() {
    return votes;
  }

  public void setVotes(List<PollVoteEntity> votes) {
    this.votes = votes == null ? new ArrayList<PollVoteEntity>() : votes;
  }
}
