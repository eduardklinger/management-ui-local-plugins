CREATE TABLE IF NOT EXISTS oc_poll (
  id BIGINT NOT NULL AUTO_INCREMENT,
  event_id VARCHAR(128) NOT NULL,
  question VARCHAR(2048) NOT NULL,
  is_active TINYINT(1) DEFAULT 0,
  created_by VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  PRIMARY KEY (id),
  UNIQUE KEY uq_oc_poll_event_id (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS oc_poll_option (
  id BIGINT NOT NULL AUTO_INCREMENT,
  poll_id BIGINT NOT NULL,
  position INT,
  option_id VARCHAR(128) NOT NULL,
  label VARCHAR(1024) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_oc_poll_option_poll_id (poll_id),
  UNIQUE KEY uq_oc_poll_option_poll_option_id (poll_id, option_id),
  CONSTRAINT FK_oc_poll_option_poll_id FOREIGN KEY (poll_id) REFERENCES oc_poll (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS oc_poll_vote (
  id BIGINT NOT NULL AUTO_INCREMENT,
  poll_id BIGINT NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  option_id VARCHAR(128) NOT NULL,
  voted_at DATETIME,
  PRIMARY KEY (id),
  KEY idx_oc_poll_vote_poll_id (poll_id),
  KEY idx_oc_poll_vote_option_id (option_id),
  UNIQUE KEY uq_oc_poll_vote_poll_user (poll_id, user_id),
  CONSTRAINT FK_oc_poll_vote_poll_id FOREIGN KEY (poll_id) REFERENCES oc_poll (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
