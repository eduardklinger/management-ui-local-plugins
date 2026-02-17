-- Quiz plugin schema for MariaDB/MySQL
-- Create tables manually when ddl-generation is set to none.

CREATE TABLE IF NOT EXISTS oc_quiz (
  id BIGINT NOT NULL AUTO_INCREMENT,
  event_id VARCHAR(128) NOT NULL,
  title VARCHAR(512) NOT NULL,
  description VARCHAR(4096),
  is_active TINYINT(1) DEFAULT 0,
  created_by VARCHAR(255),
  created_at DATETIME,
  updated_at DATETIME,
  PRIMARY KEY (id),
  UNIQUE KEY uq_oc_quiz_event_id (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS oc_quiz_question (
  id BIGINT NOT NULL AUTO_INCREMENT,
  quiz_id BIGINT NOT NULL,
  position INT,
  question_text VARCHAR(4096),
  question_type VARCHAR(64),
  options_json LONGTEXT,
  correct_answer_json LONGTEXT,
  points INT,
  PRIMARY KEY (id),
  KEY idx_oc_quiz_question_quiz_id (quiz_id),
  CONSTRAINT FK_oc_quiz_question_quiz_id FOREIGN KEY (quiz_id)
    REFERENCES oc_quiz (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS oc_quiz_submission (
  id BIGINT NOT NULL AUTO_INCREMENT,
  quiz_id BIGINT NOT NULL,
  event_id VARCHAR(128) NOT NULL,
  user_id VARCHAR(255),
  score INT,
  max_score INT,
  percentage INT,
  success TINYINT(1) DEFAULT 0,
  answers_json LONGTEXT,
  submitted_at DATETIME,
  PRIMARY KEY (id),
  KEY idx_oc_quiz_submission_quiz_id (quiz_id),
  KEY idx_oc_quiz_submission_event_id (event_id),
  CONSTRAINT FK_oc_quiz_submission_quiz_id FOREIGN KEY (quiz_id)
    REFERENCES oc_quiz (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
