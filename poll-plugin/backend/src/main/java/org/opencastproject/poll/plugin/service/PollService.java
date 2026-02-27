package org.opencastproject.poll.plugin.service;

import org.opencastproject.poll.plugin.PollInfo;
import org.opencastproject.poll.plugin.type.PollDefinition;
import org.opencastproject.poll.plugin.type.PollVoteResult;
import org.opencastproject.poll.plugin.type.input.PollInput;
import org.opencastproject.poll.plugin.type.input.PollVoteInput;

import org.opencastproject.db.DBSessionFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Modified;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.osgi.service.metatype.annotations.AttributeDefinition;
import org.osgi.service.metatype.annotations.Designate;
import org.osgi.service.metatype.annotations.ObjectClassDefinition;

import javax.persistence.EntityManagerFactory;
import java.util.ArrayList;
import java.util.List;

@Component(service = PollService.class, immediate = true)
@Designate(ocd = PollService.PollServiceConfig.class)
public final class PollService {

  private static final Logger logger = LoggerFactory.getLogger(PollService.class);

  private static PollService instance;

  @Reference(
      cardinality = ReferenceCardinality.OPTIONAL,
      policy = ReferencePolicy.DYNAMIC
  )
  private volatile DBSessionFactory dbSessionFactory;

  @Reference(
      target = "(osgi.unit.name=org.opencastproject.poll)",
      cardinality = ReferenceCardinality.OPTIONAL,
      policy = ReferencePolicy.DYNAMIC
  )
  private volatile EntityManagerFactory entityManagerFactory;

  private PollDataStore dataStore;

  public PollService() {
    configureFromEnvironment();
  }

  @Activate
  public void activate(PollServiceConfig config) {
    configureFromConfig(config);
    instance = this;
  }

  @Modified
  public void modified(PollServiceConfig config) {
    configureFromConfig(config);
  }

  public static synchronized PollService getInstance() {
    if (instance == null) {
      instance = new PollService();
    }
    return instance;
  }

  public PollInfo getPollInfo(String eventId) {
    try {
      return dataStore.getPollInfo(eventId);
    } catch (Exception e) {
      logger.error("Failed to get poll info for event {}", eventId, e);
      return new PollInfo(false, null, false, null, null, null);
    }
  }

  public PollDefinition getPollDefinition(String eventId) {
    try {
      return dataStore.getPollDefinition(eventId);
    } catch (Exception e) {
      logger.error("Failed to get poll definition for event {}", eventId, e);
      return null;
    }
  }

  public PollDefinition createPoll(String eventId, PollInput pollInput, String userId) {
    try {
      return dataStore.createPoll(eventId, pollInput, userId);
    } catch (Exception e) {
      logger.error("Failed to create poll for event {}", eventId, e);
      throw new RuntimeException("Failed to create poll: " + e.getMessage(), e);
    }
  }

  public PollVoteResult submitVote(String eventId, PollVoteInput voteInput, String userId) {
    try {
      return dataStore.submitVote(eventId, voteInput, userId);
    } catch (Exception e) {
      logger.error("Failed to submit vote for event {}", eventId, e);
      throw new RuntimeException("Failed to submit vote: " + e.getMessage(), e);
    }
  }

  public PollDefinition getAudiencePoll(String pollId) {
    try {
      return dataStore.getAudiencePoll(pollId);
    } catch (Exception e) {
      logger.error("Failed to get audience poll {}", pollId, e);
      return null;
    }
  }

  public List<PollDefinition> listAudiencePolls() {
    try {
      return dataStore.listAudiencePolls();
    } catch (Exception e) {
      logger.error("Failed to list audience polls", e);
      return new ArrayList<PollDefinition>();
    }
  }

  public PollDefinition createAudiencePoll(String question, String userId) {
    try {
      return dataStore.createAudiencePoll(question, userId);
    } catch (Exception e) {
      logger.error("Failed to create audience poll", e);
      throw new RuntimeException("Failed to create audience poll: " + e.getMessage(), e);
    }
  }

  public boolean deleteAudiencePoll(String pollId, String userId) {
    try {
      return dataStore.deleteAudiencePoll(pollId, userId);
    } catch (Exception e) {
      logger.error("Failed to delete audience poll {}", pollId, e);
      throw new RuntimeException("Failed to delete audience poll: " + e.getMessage(), e);
    }
  }

  public PollVoteResult submitAudienceAnswer(String pollId, String answer, String userId) {
    try {
      return dataStore.submitAudienceAnswer(pollId, answer, userId);
    } catch (Exception e) {
      logger.error("Failed to submit audience answer for poll {}", pollId, e);
      throw new RuntimeException("Failed to submit audience answer: " + e.getMessage(), e);
    }
  }

  public PollVoteResult voteAudienceAnswer(String pollId, String answerId, String userId) {
    try {
      return dataStore.voteAudienceAnswer(pollId, answerId, userId);
    } catch (Exception e) {
      logger.error("Failed to vote audience answer {} for poll {}", answerId, pollId, e);
      throw new RuntimeException("Failed to vote audience answer: " + e.getMessage(), e);
    }
  }

  private void configureFromConfig(PollServiceConfig config) {
    String store = config.store();
    if (store == null) {
      store = "opencast";
    }

    switch (store.toLowerCase()) {
      case "mock":
        logger.warn("Initializing PollService with mock data store. Poll data will not persist.");
        dataStore = new MockPollDataStore();
        break;
      case "opencast":
      default:
        if (dbSessionFactory == null || entityManagerFactory == null) {
          logger.warn("Opencast store selected but persistence is not available; falling back to mock");
          dataStore = new MockPollDataStore();
        } else {
          logger.info("Initializing PollService with Opencast JPA backend");
          dataStore = new OpencastPollDataStore(dbSessionFactory, entityManagerFactory);
        }
        break;
    }
  }

  private void configureFromEnvironment() {
    logger.info("Initializing PollService with mock data store (environment fallback)");
    dataStore = new MockPollDataStore();
  }

  @ObjectClassDefinition(
      name = "Poll Plugin Service",
      description = "Selects the backend store used by the poll plugin"
  )
  public @interface PollServiceConfig {
    @AttributeDefinition(
        name = "Store",
        description = "Backend store for poll data (opencast or mock)"
    )
    String store() default "opencast";
  }
}
