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

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Modified;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.Designate;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.sql.DataSource;

/**
 * Initializes the quiz schema in MariaDB/MySQL if it does not exist.
 */
@Component(
    service = QuizSchemaInitializer.class,
    immediate = true,
    configurationPid = "org.opencastproject.quiz.plugin.schema"
)
@Designate(ocd = QuizSchemaInitializer.QuizSchemaConfig.class)
public class QuizSchemaInitializer {

  private static final Logger logger = LoggerFactory.getLogger(QuizSchemaInitializer.class);

  private static final String CREATE_TABLE_QUIZ =
      "CREATE TABLE IF NOT EXISTS oc_quiz ("
          + "id BIGINT NOT NULL AUTO_INCREMENT,"
          + "event_id VARCHAR(128) NOT NULL,"
          + "title VARCHAR(512) NOT NULL,"
          + "description VARCHAR(4096),"
          + "is_active TINYINT(1) DEFAULT 0,"
          + "created_by VARCHAR(255),"
          + "created_at DATETIME,"
          + "updated_at DATETIME,"
          + "PRIMARY KEY (id),"
          + "UNIQUE KEY uq_oc_quiz_event_id (event_id)"
          + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

  private static final String CREATE_TABLE_QUESTION =
      "CREATE TABLE IF NOT EXISTS oc_quiz_question ("
          + "id BIGINT NOT NULL AUTO_INCREMENT,"
          + "quiz_id BIGINT NOT NULL,"
          + "position INT,"
          + "question_text VARCHAR(4096),"
          + "question_type VARCHAR(64),"
          + "options_json LONGTEXT,"
          + "correct_answer_json LONGTEXT,"
          + "points INT,"
          + "PRIMARY KEY (id),"
          + "KEY idx_oc_quiz_question_quiz_id (quiz_id)"
          + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

  private static final String CREATE_TABLE_SUBMISSION =
      "CREATE TABLE IF NOT EXISTS oc_quiz_submission ("
          + "id BIGINT NOT NULL AUTO_INCREMENT,"
          + "quiz_id BIGINT NOT NULL,"
          + "event_id VARCHAR(128) NOT NULL,"
          + "user_id VARCHAR(255),"
          + "score INT,"
          + "max_score INT,"
          + "percentage INT,"
          + "success TINYINT(1) DEFAULT 0,"
          + "answers_json LONGTEXT,"
          + "submitted_at DATETIME,"
          + "PRIMARY KEY (id),"
          + "KEY idx_oc_quiz_submission_quiz_id (quiz_id),"
          + "KEY idx_oc_quiz_submission_event_id (event_id)"
          + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

  private static final String ADD_FK_QUESTION =
      "ALTER TABLE oc_quiz_question "
          + "ADD CONSTRAINT FK_oc_quiz_question_quiz_id "
          + "FOREIGN KEY (quiz_id) REFERENCES oc_quiz (id) "
          + "ON DELETE CASCADE";

  private static final String ADD_FK_SUBMISSION =
      "ALTER TABLE oc_quiz_submission "
          + "ADD CONSTRAINT FK_oc_quiz_submission_quiz_id "
          + "FOREIGN KEY (quiz_id) REFERENCES oc_quiz (id) "
          + "ON DELETE CASCADE";

  @Reference(target = "(osgi.jndi.service.name=jdbc/opencast)")
  private DataSource dataSource;

  @Activate
  public void activate(QuizSchemaConfig config) {
    maybeInitialize(config);
  }

  @Modified
  public void modified(QuizSchemaConfig config) {
    maybeInitialize(config);
  }

  private void maybeInitialize(QuizSchemaConfig config) {
    if (!config.autoCreate()) {
      logger.info("Quiz schema auto-create is disabled");
      return;
    }

    try (Connection connection = dataSource.getConnection()) {
      DatabaseMetaData meta = connection.getMetaData();
      String productName = meta.getDatabaseProductName();
      if (!isMariaDbOrMySql(productName)) {
        logger.warn("Quiz schema auto-create skipped: unsupported database {}", productName);
        return;
      }

      try (Statement statement = connection.createStatement()) {
        statement.execute(CREATE_TABLE_QUIZ);
        statement.execute(CREATE_TABLE_QUESTION);
        statement.execute(CREATE_TABLE_SUBMISSION);
      }

      ensureConstraint(connection, "oc_quiz_question", "FK_oc_quiz_question_quiz_id", ADD_FK_QUESTION);
      ensureConstraint(connection, "oc_quiz_submission", "FK_oc_quiz_submission_quiz_id", ADD_FK_SUBMISSION);

      logger.info("Quiz schema auto-create completed");
    } catch (SQLException e) {
      logger.warn("Quiz schema auto-create failed", e);
    }
  }

  private boolean isMariaDbOrMySql(String productName) {
    if (productName == null) {
      return false;
    }
    String normalized = productName.toLowerCase();
    return normalized.contains("mariadb") || normalized.contains("mysql");
  }

  private void ensureConstraint(Connection connection, String table, String constraintName, String ddl)
      throws SQLException {
    if (constraintExists(connection, table, constraintName)) {
      return;
    }
    try (Statement statement = connection.createStatement()) {
      statement.execute(ddl);
    } catch (SQLException e) {
      if (isDuplicateConstraintError(e)) {
        logger.info("Constraint {} already exists on {}", constraintName, table);
      } else {
        throw e;
      }
    }
  }

  private boolean constraintExists(Connection connection, String table, String constraintName)
      throws SQLException {
    String sql = "SELECT COUNT(*) FROM information_schema.table_constraints "
        + "WHERE constraint_schema = DATABASE() AND table_name = ? AND constraint_name = ?";
    try (PreparedStatement ps = connection.prepareStatement(sql)) {
      ps.setString(1, table);
      ps.setString(2, constraintName);
      try (ResultSet rs = ps.executeQuery()) {
        rs.next();
        return rs.getInt(1) > 0;
      }
    }
  }

  private boolean isDuplicateConstraintError(SQLException e) {
    String message = e.getMessage();
    return message != null && message.contains("Duplicate key") && message.contains("errno: 121");
  }

  @ObjectClassDefinition(
      name = "Quiz Plugin Schema",
      description = "Auto-creates quiz tables for MariaDB/MySQL"
  )
  public @interface QuizSchemaConfig {
    @AttributeDefinition(
        name = "Auto-create schema",
        description = "Create quiz tables and constraints if missing (MariaDB/MySQL only)"
    )
    boolean autoCreate() default true;
  }
}
