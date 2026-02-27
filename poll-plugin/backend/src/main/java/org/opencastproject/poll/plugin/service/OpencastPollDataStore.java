package org.opencastproject.poll.plugin.service;

import org.opencastproject.db.DBSession;
import org.opencastproject.db.DBSessionFactory;
import org.opencastproject.poll.plugin.PollInfo;
import org.opencastproject.poll.plugin.persistence.PollEntity;
import org.opencastproject.poll.plugin.persistence.PollOptionEntity;
import org.opencastproject.poll.plugin.persistence.PollVoteEntity;
import org.opencastproject.poll.plugin.type.PollDefinition;
import org.opencastproject.poll.plugin.type.PollOption;
import org.opencastproject.poll.plugin.type.PollVoteResult;
import org.opencastproject.poll.plugin.type.input.PollInput;
import org.opencastproject.poll.plugin.type.input.PollVoteInput;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.TypedQuery;

public class OpencastPollDataStore implements PollDataStore {

  private static final Logger logger = LoggerFactory.getLogger(OpencastPollDataStore.class);

  private final DBSessionFactory dbSessionFactory;
  private final EntityManagerFactory entityManagerFactory;

  public OpencastPollDataStore(DBSessionFactory dbSessionFactory, EntityManagerFactory entityManagerFactory) {
    this.dbSessionFactory = dbSessionFactory;
    this.entityManagerFactory = entityManagerFactory;
  }

  @Override
  public PollInfo getPollInfo(String eventId) {
    try (DBSession session = dbSessionFactory.createSession(entityManagerFactory)) {
      return session.exec(em -> {
        PollEntity poll = findActivePollByEventId(em, eventId);
        if (poll == null) {
          return new PollInfo(false, null, false, null, null, null);
        }

        int totalVotes = countTotalVotes(em, poll.getId());
        int optionCount = poll.getOptions() != null ? poll.getOptions().size() : 0;

        return new PollInfo(
            true,
            String.valueOf(poll.getId()),
            poll.isActive(),
            poll.getQuestion(),
            optionCount,
            totalVotes
        );
      });
    } catch (Exception e) {
      logger.error("Failed to fetch poll info for event {}", eventId, e);
      return new PollInfo(false, null, false, null, null, null);
    }
  }

  @Override
  public PollDefinition getPollDefinition(String eventId) {
    try (DBSession session = dbSessionFactory.createSession(entityManagerFactory)) {
      return session.exec(em -> {
        PollEntity poll = findActivePollByEventId(em, eventId);
        return poll == null ? null : toPollDefinition(em, poll);
      });
    } catch (Exception e) {
      logger.error("Failed to fetch poll definition for event {}", eventId, e);
      return null;
    }
  }

  @Override
  public PollDefinition createPoll(String eventId, PollInput pollInput, String userId) {
    if (pollInput == null) {
      throw new IllegalArgumentException("Poll input is required");
    }

    String question = normalize(pollInput.getQuestion());
    if (question.isEmpty()) {
      throw new IllegalArgumentException("Poll question is required");
    }

    List<String> normalizedOptions = normalizeOptions(pollInput.getOptions());

    try (DBSession session = dbSessionFactory.createSession(entityManagerFactory)) {
      return session.execTx(em -> {
        PollEntity existing = findPollByEventId(em, eventId);
        if (existing != null) {
          em.remove(existing);
          em.flush();
        }

        PollEntity poll = new PollEntity();
        poll.setEventId(eventId);
        poll.setQuestion(question);
        poll.setActive(pollInput.getIsActive());
        poll.setCreatedBy(userId);
        poll.setCreatedAt(new Date());
        poll.setUpdatedAt(new Date());

        List<PollOptionEntity> options = new ArrayList<>();
        for (String label : normalizedOptions) {
          PollOptionEntity option = new PollOptionEntity();
          option.setPoll(poll);
          option.setOptionId(UUID.randomUUID().toString());
          option.setLabel(label);
          options.add(option);
        }

        poll.setOptions(options);

        em.persist(poll);
        em.flush();

        return toPollDefinition(em, poll);
      });
    }
  }

  @Override
  public PollVoteResult submitVote(String eventId, PollVoteInput voteInput, String userId) {
    if (voteInput == null) {
      throw new IllegalArgumentException("Vote input is required");
    }

    try (DBSession session = dbSessionFactory.createSession(entityManagerFactory)) {
      return session.execTx(em -> {
        PollEntity poll = findActivePollByEventId(em, eventId);
        if (poll == null) {
          throw new IllegalArgumentException("No active poll exists for event: " + eventId);
        }

        if (voteInput.getPollId() != null && !voteInput.getPollId().equals(String.valueOf(poll.getId()))) {
          throw new IllegalArgumentException("Poll id does not match event poll");
        }

        String optionId = normalize(voteInput.getOptionId());
        if (!optionExists(poll, optionId)) {
          throw new IllegalArgumentException("Unknown poll option: " + optionId);
        }

        return upsertVote(em, poll, optionId, userId);
      });
    }
  }

  @Override
  public PollDefinition getAudiencePoll(String pollId) {
    String normalizedPollId = normalize(pollId);
    if (normalizedPollId.isEmpty()) {
      return null;
    }
    return getPollDefinition(normalizedPollId);
  }

  @Override
  public List<PollDefinition> listAudiencePolls() {
    try (DBSession session = dbSessionFactory.createSession(entityManagerFactory)) {
      return session.exec(em -> {
        TypedQuery<PollEntity> query = em.createQuery(
            "SELECT DISTINCT p FROM PollEntity p LEFT JOIN FETCH p.options "
                + "WHERE p.eventId LIKE :audiencePrefix ORDER BY p.updatedAt DESC",
            PollEntity.class
        );
        query.setParameter("audiencePrefix", "poll-%");
        List<PollEntity> entities = query.getResultList();
        List<PollDefinition> polls = new ArrayList<>();
        for (PollEntity poll : entities) {
          polls.add(toPollDefinition(em, poll));
        }
        return polls;
      });
    } catch (Exception e) {
      logger.error("Failed to list audience polls", e);
      return new ArrayList<PollDefinition>();
    }
  }

  @Override
  public PollDefinition createAudiencePoll(String question, String userId) {
    String pollPublicId = generatePollPublicId();
    PollInput input = new PollInput();
    input.setQuestion(question);
    input.setOptions(new ArrayList<String>());
    input.setIsActive(true);
    return createPoll(pollPublicId, input, userId);
  }

  @Override
  public boolean deleteAudiencePoll(String pollId, String userId) {
    String normalizedPollId = normalize(pollId);
    if (normalizedPollId.isEmpty()) {
      throw new IllegalArgumentException("Poll id is required");
    }

    String normalizedUserId = normalize(userId);
    if (normalizedUserId.isEmpty()) {
      throw new IllegalStateException("Authenticated user is required");
    }

    try (DBSession session = dbSessionFactory.createSession(entityManagerFactory)) {
      return session.execTx(em -> {
        PollEntity poll = findPollByEventId(em, normalizedPollId);
        if (poll == null || !isAudiencePollId(poll.getEventId())) {
          return false;
        }

        String createdBy = normalize(poll.getCreatedBy());
        if (createdBy.isEmpty() || !createdBy.equals(normalizedUserId)) {
          throw new IllegalStateException("Only the poll creator can delete this poll");
        }

        em.remove(poll);
        em.flush();
        return true;
      });
    }
  }

  @Override
  public PollVoteResult submitAudienceAnswer(String pollId, String answer, String userId) {
    String normalizedPollId = normalize(pollId);
    if (normalizedPollId.isEmpty()) {
      throw new IllegalArgumentException("Poll id is required");
    }

    String normalizedAnswer = normalize(answer);
    if (normalizedAnswer.isEmpty()) {
      throw new IllegalArgumentException("Answer text is required");
    }

    try (DBSession session = dbSessionFactory.createSession(entityManagerFactory)) {
      return session.execTx(em -> {
        PollEntity poll = findActivePollByEventId(em, normalizedPollId);
        if (poll == null) {
          throw new IllegalArgumentException("No audience poll exists for id: " + normalizedPollId);
        }

        PollOptionEntity option = findOptionByLabel(poll, normalizedAnswer);
        if (option == null) {
          option = new PollOptionEntity();
          option.setPoll(poll);
          option.setOptionId(UUID.randomUUID().toString());
          option.setLabel(normalizedAnswer);
          em.persist(option);

          List<PollOptionEntity> options = poll.getOptions();
          if (options == null) {
            options = new ArrayList<>();
            poll.setOptions(options);
          }
          options.add(option);
          em.merge(poll);
          em.flush();
        }

        return upsertVote(em, poll, option.getOptionId(), userId);
      });
    }
  }

  @Override
  public PollVoteResult voteAudienceAnswer(String pollId, String answerId, String userId) {
    String normalizedPollId = normalize(pollId);
    if (normalizedPollId.isEmpty()) {
      throw new IllegalArgumentException("Poll id is required");
    }

    String normalizedAnswerId = normalize(answerId);
    if (normalizedAnswerId.isEmpty()) {
      throw new IllegalArgumentException("Answer id is required");
    }

    try (DBSession session = dbSessionFactory.createSession(entityManagerFactory)) {
      return session.execTx(em -> {
        PollEntity poll = findActivePollByEventId(em, normalizedPollId);
        if (poll == null) {
          throw new IllegalArgumentException("No audience poll exists for id: " + normalizedPollId);
        }

        if (!optionExists(poll, normalizedAnswerId)) {
          throw new IllegalArgumentException("Unknown audience answer id: " + normalizedAnswerId);
        }

        return upsertVote(em, poll, normalizedAnswerId, userId);
      });
    }
  }

  private PollVoteResult upsertVote(EntityManager em, PollEntity poll, String optionId, String userId) {
    String voterKey = normalize(userId);
    if (voterKey.isEmpty()) {
      voterKey = "anonymous";
    }

    PollVoteEntity existingVote = findVoteByPollAndUser(em, poll.getId(), voterKey);
    if (existingVote == null) {
      PollVoteEntity vote = new PollVoteEntity();
      vote.setPoll(poll);
      vote.setUserId(voterKey);
      vote.setOptionId(optionId);
      vote.setVotedAt(new Date());
      em.persist(vote);
    } else {
      existingVote.setOptionId(optionId);
      existingVote.setVotedAt(new Date());
      em.merge(existingVote);
    }

    em.flush();

    PollDefinition definition = toPollDefinition(em, poll);
    int totalVotes = 0;
    for (PollOption option : definition.options()) {
      totalVotes += option.voteCount();
    }

    return new PollVoteResult(
        String.valueOf(poll.getId()),
        optionId,
        totalVotes,
        true,
        definition.options()
    );
  }

  private String generatePollPublicId() {
    String candidate;
    do {
      candidate = "poll-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    } while (pollExistsByEventId(candidate));
    return candidate;
  }

  private boolean pollExistsByEventId(String eventId) {
    try (DBSession session = dbSessionFactory.createSession(entityManagerFactory)) {
      return session.exec(em -> findPollByEventId(em, eventId) != null);
    }
  }

  private PollEntity findActivePollByEventId(EntityManager em, String eventId) {
    TypedQuery<PollEntity> query = em.createQuery(
        "SELECT p FROM PollEntity p LEFT JOIN FETCH p.options "
            + "WHERE p.eventId = :eventId AND p.active = true",
        PollEntity.class
    );
    query.setParameter("eventId", eventId);
    query.setMaxResults(1);
    List<PollEntity> results = query.getResultList();
    return results.isEmpty() ? null : results.get(0);
  }

  private PollEntity findPollByEventId(EntityManager em, String eventId) {
    TypedQuery<PollEntity> query = em.createQuery(
        "SELECT p FROM PollEntity p LEFT JOIN FETCH p.options WHERE p.eventId = :eventId",
        PollEntity.class
    );
    query.setParameter("eventId", eventId);
    query.setMaxResults(1);
    List<PollEntity> results = query.getResultList();
    return results.isEmpty() ? null : results.get(0);
  }

  private PollVoteEntity findVoteByPollAndUser(EntityManager em, Long pollId, String userId) {
    TypedQuery<PollVoteEntity> query = em.createQuery(
        "SELECT v FROM PollVoteEntity v WHERE v.poll.id = :pollId AND v.userId = :userId",
        PollVoteEntity.class
    );
    query.setParameter("pollId", pollId);
    query.setParameter("userId", userId);
    query.setMaxResults(1);
    List<PollVoteEntity> results = query.getResultList();
    return results.isEmpty() ? null : results.get(0);
  }

  private PollDefinition toPollDefinition(EntityManager em, PollEntity poll) {
    Map<String, Integer> voteCountByOptionId = countVotesByOption(em, poll.getId());

    List<PollOption> options = new ArrayList<>();
    if (poll.getOptions() != null) {
      for (PollOptionEntity option : poll.getOptions()) {
        int voteCount = voteCountByOptionId.getOrDefault(option.getOptionId(), 0);
        options.add(new PollOption(option.getOptionId(), option.getLabel(), voteCount));
      }
    }

    return new PollDefinition(
        String.valueOf(poll.getId()),
        poll.getEventId(),
        poll.getQuestion(),
        poll.isActive(),
        poll.getCreatedBy(),
        options
    );
  }

  private int countTotalVotes(EntityManager em, Long pollId) {
    Number result = em.createQuery(
        "SELECT COUNT(v) FROM PollVoteEntity v WHERE v.poll.id = :pollId",
        Number.class
    )
        .setParameter("pollId", pollId)
        .getSingleResult();
    return result.intValue();
  }

  private Map<String, Integer> countVotesByOption(EntityManager em, Long pollId) {
    List<?> rows = em.createQuery(
        "SELECT v.optionId, COUNT(v) FROM PollVoteEntity v "
            + "WHERE v.poll.id = :pollId GROUP BY v.optionId"
    )
        .setParameter("pollId", pollId)
        .getResultList();

    Map<String, Integer> voteCountByOptionId = new LinkedHashMap<>();
    for (Object rowObj : rows) {
      Object[] row = (Object[]) rowObj;
      String optionId = String.valueOf(row[0]);
      Number count = (Number) row[1];
      voteCountByOptionId.put(optionId, count.intValue());
    }
    return voteCountByOptionId;
  }

  private boolean optionExists(PollEntity poll, String optionId) {
    if (poll.getOptions() == null) {
      return false;
    }
    for (PollOptionEntity option : poll.getOptions()) {
      if (option.getOptionId().equals(optionId)) {
        return true;
      }
    }
    return false;
  }

  private PollOptionEntity findOptionByLabel(PollEntity poll, String label) {
    if (poll.getOptions() == null) {
      return null;
    }
    String target = normalize(label).toLowerCase();
    for (PollOptionEntity option : poll.getOptions()) {
      String value = option.getLabel();
      if (value != null && value.trim().toLowerCase().equals(target)) {
        return option;
      }
    }
    return null;
  }

  private static String normalize(String value) {
    return value == null ? "" : value.trim();
  }

  private boolean isAudiencePollId(String pollId) {
    return pollId != null && pollId.startsWith("poll-");
  }

  private static List<String> normalizeOptions(List<String> options) {
    List<String> normalized = new ArrayList<>();
    if (options == null) {
      return normalized;
    }

    for (String option : options) {
      String trimmed = normalize(option);
      if (!trimmed.isEmpty()) {
        normalized.add(trimmed);
      }
    }

    return normalized;
  }
}
