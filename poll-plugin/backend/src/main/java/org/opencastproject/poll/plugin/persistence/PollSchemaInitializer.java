package org.opencastproject.poll.plugin.persistence;

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

@Component(
    service = PollSchemaInitializer.class,
    immediate = true,
    configurationPid = "org.opencastproject.poll.plugin.schema"
)
@Designate(ocd = PollSchemaInitializer.PollSchemaConfig.class)
public class PollSchemaInitializer {

  private static final Logger logger = LoggerFactory.getLogger(PollSchemaInitializer.class);

  private static final String CREATE_TABLE_POLL =
      "CREATE TABLE IF NOT EXISTS oc_poll ("
          + "id BIGINT NOT NULL AUTO_INCREMENT,"
          + "event_id VARCHAR(128) NOT NULL,"
          + "question VARCHAR(2048) NOT NULL,"
          + "is_active TINYINT(1) DEFAULT 0,"
          + "created_by VARCHAR(255),"
          + "created_at DATETIME,"
          + "updated_at DATETIME,"
          + "PRIMARY KEY (id),"
          + "UNIQUE KEY uq_oc_poll_event_id (event_id)"
          + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

  private static final String CREATE_TABLE_OPTION =
      "CREATE TABLE IF NOT EXISTS oc_poll_option ("
          + "id BIGINT NOT NULL AUTO_INCREMENT,"
          + "poll_id BIGINT NOT NULL,"
          + "position INT,"
          + "option_id VARCHAR(128) NOT NULL,"
          + "label VARCHAR(1024) NOT NULL,"
          + "PRIMARY KEY (id),"
          + "KEY idx_oc_poll_option_poll_id (poll_id),"
          + "UNIQUE KEY uq_oc_poll_option_poll_option_id (poll_id, option_id)"
          + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

  private static final String CREATE_TABLE_VOTE =
      "CREATE TABLE IF NOT EXISTS oc_poll_vote ("
          + "id BIGINT NOT NULL AUTO_INCREMENT,"
          + "poll_id BIGINT NOT NULL,"
          + "user_id VARCHAR(255) NOT NULL,"
          + "option_id VARCHAR(128) NOT NULL,"
          + "voted_at DATETIME,"
          + "PRIMARY KEY (id),"
          + "KEY idx_oc_poll_vote_poll_id (poll_id),"
          + "KEY idx_oc_poll_vote_option_id (option_id),"
          + "UNIQUE KEY uq_oc_poll_vote_poll_user (poll_id, user_id)"
          + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

  private static final String ADD_FK_OPTION =
      "ALTER TABLE oc_poll_option "
          + "ADD CONSTRAINT FK_oc_poll_option_poll_id "
          + "FOREIGN KEY (poll_id) REFERENCES oc_poll (id) "
          + "ON DELETE CASCADE";

  private static final String ADD_FK_VOTE =
      "ALTER TABLE oc_poll_vote "
          + "ADD CONSTRAINT FK_oc_poll_vote_poll_id "
          + "FOREIGN KEY (poll_id) REFERENCES oc_poll (id) "
          + "ON DELETE CASCADE";

  @Reference(target = "(osgi.jndi.service.name=jdbc/opencast)")
  private DataSource dataSource;

  @Activate
  public void activate(PollSchemaConfig config) {
    maybeInitialize(config);
  }

  @Modified
  public void modified(PollSchemaConfig config) {
    maybeInitialize(config);
  }

  private void maybeInitialize(PollSchemaConfig config) {
    if (!config.autoCreate()) {
      logger.info("Poll schema auto-create is disabled");
      return;
    }

    try (Connection connection = dataSource.getConnection()) {
      DatabaseMetaData meta = connection.getMetaData();
      String productName = meta.getDatabaseProductName();
      if (!isMariaDbOrMySql(productName)) {
        logger.warn("Poll schema auto-create skipped: unsupported database {}", productName);
        return;
      }

      try (Statement statement = connection.createStatement()) {
        statement.execute(CREATE_TABLE_POLL);
        statement.execute(CREATE_TABLE_OPTION);
        statement.execute(CREATE_TABLE_VOTE);
      }

      ensureConstraint(connection, "oc_poll_option", "FK_oc_poll_option_poll_id", ADD_FK_OPTION);
      ensureConstraint(connection, "oc_poll_vote", "FK_oc_poll_vote_poll_id", ADD_FK_VOTE);

      logger.info("Poll schema auto-create completed");
    } catch (SQLException e) {
      logger.warn("Poll schema auto-create failed", e);
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
      name = "Poll Plugin Schema",
      description = "Auto-creates poll tables for MariaDB/MySQL"
  )
  public @interface PollSchemaConfig {
    @AttributeDefinition(
        name = "Auto-create schema",
        description = "Create poll tables and constraints if missing (MariaDB/MySQL only)"
    )
    boolean autoCreate() default true;
  }
}
