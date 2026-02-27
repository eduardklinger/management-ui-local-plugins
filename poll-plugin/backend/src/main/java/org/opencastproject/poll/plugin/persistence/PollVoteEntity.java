package org.opencastproject.poll.plugin.persistence;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
@Table(name = "oc_poll_vote")
public class PollVoteEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "poll_id")
  private PollEntity poll;

  @Column(name = "user_id", nullable = false, length = 255)
  private String userId;

  @Column(name = "option_id", nullable = false, length = 128)
  private String optionId;

  @Temporal(TemporalType.TIMESTAMP)
  @Column(name = "voted_at")
  private Date votedAt;

  public PollVoteEntity() {
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public PollEntity getPoll() {
    return poll;
  }

  public void setPoll(PollEntity poll) {
    this.poll = poll;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public String getOptionId() {
    return optionId;
  }

  public void setOptionId(String optionId) {
    this.optionId = optionId;
  }

  public Date getVotedAt() {
    return votedAt == null ? null : new Date(votedAt.getTime());
  }

  public void setVotedAt(Date votedAt) {
    this.votedAt = votedAt == null ? null : new Date(votedAt.getTime());
  }
}
