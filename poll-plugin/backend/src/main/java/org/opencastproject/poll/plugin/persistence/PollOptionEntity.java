package org.opencastproject.poll.plugin.persistence;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "oc_poll_option")
public class PollOptionEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "poll_id")
  private PollEntity poll;

  @Column(name = "option_id", nullable = false, length = 128)
  private String optionId;

  @Column(name = "label", nullable = false, length = 1024)
  private String label;

  public PollOptionEntity() {
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

  public String getOptionId() {
    return optionId;
  }

  public void setOptionId(String optionId) {
    this.optionId = optionId;
  }

  public String getLabel() {
    return label;
  }

  public void setLabel(String label) {
    this.label = label;
  }
}
