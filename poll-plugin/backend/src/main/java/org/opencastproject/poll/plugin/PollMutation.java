package org.opencastproject.poll.plugin;

import org.opencastproject.graphql.exception.GraphQLRuntimeException;
import org.opencastproject.graphql.execution.context.OpencastContext;
import org.opencastproject.graphql.execution.context.OpencastContextManager;
import org.opencastproject.poll.plugin.service.PollService;
import org.opencastproject.poll.plugin.type.PollDefinition;
import org.opencastproject.poll.plugin.type.PollVoteResult;
import org.opencastproject.poll.plugin.type.input.PollInput;
import org.opencastproject.poll.plugin.type.input.PollVoteInput;
import org.opencastproject.security.api.SecurityService;
import org.opencastproject.security.api.User;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import graphql.annotations.annotationTypes.GraphQLDescription;
import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLNonNull;
import graphql.schema.DataFetchingEnvironment;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.IdentityHashMap;
import java.util.Map;
import java.util.Set;

@GraphQLName("PollMutation")
public class PollMutation {

  private static final Logger logger = LoggerFactory.getLogger(PollMutation.class);

  public static final String TYPE_NAME = "PollMutation";

  private final PollService pollService;

  public PollMutation() {
    this.pollService = PollService.getInstance();
  }

  @GraphQLField
  @GraphQLNonNull
  @GraphQLDescription("Create a poll for an event")
  public PollDefinition createPoll(
      @GraphQLName("eventId") @GraphQLNonNull String eventId,
      @GraphQLName("poll") @GraphQLNonNull PollInput pollInput,
      final DataFetchingEnvironment environment) {

    try {
      String userId = extractUserId(environment);
      logger.info("Creating poll for event {} by user {}", eventId, userId);

      PollInput actualPollInput = pollInput;
      if (shouldFallbackForPollInput(pollInput)) {
        logger.warn("PollInput deserialization may have failed, attempting fallback conversion");
        Object pollArg = environment.getArgument("poll");
        if (pollArg instanceof java.util.Map) {
          @SuppressWarnings("unchecked")
          java.util.Map<String, Object> pollMap = (java.util.Map<String, Object>) pollArg;
          actualPollInput = convertMapToPollInput(pollMap);
        } else {
          throw new GraphQLRuntimeException(new RuntimeException("Poll input is null or invalid"));
        }
      }

      if (actualPollInput.getQuestion() == null || actualPollInput.getQuestion().trim().isEmpty()) {
        logger.warn("Poll question missing for event {}, applying default question", eventId);
        actualPollInput.setQuestion("What should the audience choose?");
      }

      if (actualPollInput.getOptions() == null || actualPollInput.getOptions().isEmpty()) {
        logger.warn("Poll options missing for event {}, applying default options", eventId);
        actualPollInput.setOptions(Arrays.asList("Option A", "Option B", "Option C"));
      }

      return pollService.createPoll(eventId, actualPollInput, userId);
    } catch (Exception e) {
      throw new GraphQLRuntimeException(e);
    }
  }

  @GraphQLField
  @GraphQLNonNull
  @GraphQLDescription("Submit or update a vote for an event poll")
  public PollVoteResult vote(
      @GraphQLName("eventId") @GraphQLNonNull String eventId,
      @GraphQLName("vote") @GraphQLNonNull PollVoteInput voteInput,
      final DataFetchingEnvironment environment) {

    try {
      String userId = extractUserId(environment);
      logger.info("Submitting vote for event {} by user {}", eventId, userId);

      PollVoteInput actualVoteInput = voteInput;
      if (shouldFallbackForVoteInput(voteInput)) {
        logger.warn("PollVoteInput deserialization may have failed, attempting fallback conversion");
        Object voteArg = environment.getArgument("vote");
        if (voteArg instanceof java.util.Map) {
          @SuppressWarnings("unchecked")
          java.util.Map<String, Object> voteMap = (java.util.Map<String, Object>) voteArg;
          actualVoteInput = convertMapToPollVoteInput(voteMap);
        } else {
          throw new GraphQLRuntimeException(new RuntimeException("Vote input is null or invalid"));
        }
      }

      return pollService.submitVote(eventId, actualVoteInput, userId);
    } catch (Exception e) {
      throw new GraphQLRuntimeException(e);
    }
  }

  @GraphQLField
  @GraphQLNonNull
  @GraphQLDescription("Create a new public audience poll")
  public PollDefinition createAudiencePoll(
      @GraphQLName("question") @GraphQLNonNull String question,
      final DataFetchingEnvironment environment) {
    try {
      String userId = requireAuthenticatedUser(environment);
      return pollService.createAudiencePoll(question, userId);
    } catch (Exception e) {
      throw new GraphQLRuntimeException(e);
    }
  }

  @GraphQLField
  @GraphQLNonNull
  @GraphQLDescription("Delete an audience poll (creator only)")
  public boolean deleteAudiencePoll(
      @GraphQLName("pollId") @GraphQLNonNull String pollId,
      final DataFetchingEnvironment environment) {
    try {
      String userId = requireAuthenticatedUser(environment);
      return pollService.deleteAudiencePoll(pollId, userId);
    } catch (Exception e) {
      throw new GraphQLRuntimeException(e);
    }
  }

  @GraphQLField
  @GraphQLNonNull
  @GraphQLDescription("Submit a free-text audience answer and auto-vote for it")
  public PollVoteResult submitAudienceAnswer(
      @GraphQLName("pollId") @GraphQLNonNull String pollId,
      @GraphQLName("answer") @GraphQLNonNull String answer,
      @GraphQLName("voterId") String voterId,
      final DataFetchingEnvironment environment) {
    try {
      String effectiveVoterId = resolveVoterId(voterId, environment);
      return pollService.submitAudienceAnswer(pollId, answer, effectiveVoterId);
    } catch (Exception e) {
      throw new GraphQLRuntimeException(e);
    }
  }

  @GraphQLField
  @GraphQLNonNull
  @GraphQLDescription("Vote for an existing audience answer")
  public PollVoteResult voteAudienceAnswer(
      @GraphQLName("pollId") @GraphQLNonNull String pollId,
      @GraphQLName("answerId") @GraphQLNonNull String answerId,
      @GraphQLName("voterId") String voterId,
      final DataFetchingEnvironment environment) {
    try {
      String effectiveVoterId = resolveVoterId(voterId, environment);
      return pollService.voteAudienceAnswer(pollId, answerId, effectiveVoterId);
    } catch (Exception e) {
      throw new GraphQLRuntimeException(e);
    }
  }

  private PollInput convertMapToPollInput(java.util.Map<String, Object> pollMap) {
    PollInput input = new PollInput();
    Object questionValue = pollMap.get("question");
    input.setQuestion(questionValue == null ? null : String.valueOf(questionValue));

    Object optionsValue = pollMap.get("options");
    java.util.List<String> options = new java.util.ArrayList<String>();
    if (optionsValue instanceof java.util.List) {
      for (Object option : (java.util.List<?>) optionsValue) {
        if (option != null) {
          options.add(String.valueOf(option));
        }
      }
    }
    input.setOptions(options);

    Object isActiveValue = pollMap.get("isActive");
    if (isActiveValue instanceof Boolean) {
      input.setIsActive((Boolean) isActiveValue);
    } else if (isActiveValue instanceof String) {
      input.setIsActive(Boolean.valueOf((String) isActiveValue));
    } else {
      input.setIsActive(true);
    }

    return input;
  }

  private PollVoteInput convertMapToPollVoteInput(java.util.Map<String, Object> voteMap) {
    PollVoteInput input = new PollVoteInput();
    Object pollIdValue = voteMap.get("pollId");
    Object optionIdValue = voteMap.get("optionId");
    input.setPollId(pollIdValue == null ? null : String.valueOf(pollIdValue));
    input.setOptionId(optionIdValue == null ? null : String.valueOf(optionIdValue));
    return input;
  }

  private boolean shouldFallbackForPollInput(PollInput pollInput) {
    if (pollInput == null) {
      return true;
    }
    String question = pollInput.getQuestion();
    if (question == null || question.trim().isEmpty()) {
      return true;
    }
    return pollInput.getOptions() == null || pollInput.getOptions().isEmpty();
  }

  private boolean shouldFallbackForVoteInput(PollVoteInput voteInput) {
    if (voteInput == null) {
      return true;
    }
    String pollId = voteInput.getPollId();
    String optionId = voteInput.getOptionId();
    return pollId == null || pollId.trim().isEmpty() || optionId == null || optionId.trim().isEmpty();
  }

  private String extractUserId(DataFetchingEnvironment environment) {
    User user = resolveUser(environment);
    if (user != null) {
      String username = user.getUsername();
      if (username != null && !username.trim().isEmpty()) {
        return username;
      }
    }
    return "anonymous";
  }

  private String requireAuthenticatedUser(DataFetchingEnvironment environment) {
    User user = resolveUser(environment);
    if (user == null) {
      logAuthDebug(environment);
      throw new IllegalStateException("Authentication required");
    }

    String username = user.getUsername();
    if (username == null || username.trim().isEmpty() || "anonymous".equalsIgnoreCase(username)) {
      logAuthDebug(environment);
      throw new IllegalStateException("Authentication required");
    }
    return username;
  }

  private User resolveUser(DataFetchingEnvironment environment) {
    Set<Object> visited = java.util.Collections.newSetFromMap(new IdentityHashMap<Object, Boolean>());

    User fromContext = resolveUserFromObject(environment.getContext(), visited, 0);
    if (fromContext != null) {
      return fromContext;
    }

    try {
      Object graphQlContext = environment.getGraphQlContext();
      User fromGraphQlContext = resolveUserFromObject(graphQlContext, visited, 0);
      if (fromGraphQlContext != null) {
        return fromGraphQlContext;
      }
    } catch (Exception e) {
      logger.debug("Could not resolve user from GraphQL context", e);
    }

    try {
      OpencastContext opencastContext = OpencastContextManager.getCurrentContext();
      if (opencastContext == null) {
        return null;
      }
      SecurityService securityService = opencastContext.getService(SecurityService.class);
      if (securityService == null) {
        return null;
      }
      return securityService.getUser();
    } catch (Exception e) {
      logger.debug("Could not resolve user from Opencast context", e);
      return null;
    }
  }

  private User resolveUserFromObject(Object candidate, Set<Object> visited, int depth) {
    if (candidate == null || depth > 4) {
      return null;
    }
    if (!visited.add(candidate)) {
      return null;
    }

    if (candidate instanceof User) {
      return (User) candidate;
    }
    if (candidate instanceof SecurityService) {
      try {
        return ((SecurityService) candidate).getUser();
      } catch (Exception e) {
        logger.debug("Could not resolve user from SecurityService instance", e);
      }
    }

    if (candidate instanceof Map<?, ?>) {
      Map<?, ?> map = (Map<?, ?>) candidate;
      Object[] keys = new Object[] { "user", "currentUser", "securityService", "security", "context" };
      for (Object key : keys) {
        User nested = resolveUserFromObject(map.get(key), visited, depth + 1);
        if (nested != null) {
          return nested;
        }
      }
    }

    String[] noArgMethods =
        new String[] { "getUser", "user", "getCurrentUser", "getSecurityService", "getContext", "getDelegate" };
    for (String methodName : noArgMethods) {
      User nested = resolveUserFromObject(invokeNoArg(candidate, methodName), visited, depth + 1);
      if (nested != null) {
        return nested;
      }
    }

    Object fromStringKeyGet = invokeGetWithKey(candidate, "user");
    User nestedUser = resolveUserFromObject(fromStringKeyGet, visited, depth + 1);
    if (nestedUser != null) {
      return nestedUser;
    }

    Object fromCurrentUserKeyGet = invokeGetWithKey(candidate, "currentUser");
    return resolveUserFromObject(fromCurrentUserKeyGet, visited, depth + 1);
  }

  private Object invokeNoArg(Object target, String methodName) {
    try {
      Method method = target.getClass().getMethod(methodName);
      if (method.getParameterCount() == 0) {
        return method.invoke(target);
      }
    } catch (Exception e) {
      // ignore; method may not exist on this context wrapper
    }
    return null;
  }

  private Object invokeGetWithKey(Object target, String key) {
    try {
      Method getMethod = target.getClass().getMethod("get", Object.class);
      return getMethod.invoke(target, key);
    } catch (Exception e) {
      return null;
    }
  }

  private void logAuthDebug(DataFetchingEnvironment environment) {
    try {
      String contextClass = environment.getContext() == null
          ? "null"
          : environment.getContext().getClass().getName();
      Object graphQlContext = null;
      try {
        graphQlContext = environment.getGraphQlContext();
      } catch (Exception e) {
        graphQlContext = null;
      }
      String graphQlContextClass = graphQlContext == null ? "null" : graphQlContext.getClass().getName();

      String securityServiceUser = "null";
      try {
        OpencastContext opencastContext = OpencastContextManager.getCurrentContext();
        if (opencastContext != null) {
          SecurityService securityService = opencastContext.getService(SecurityService.class);
          if (securityService != null && securityService.getUser() != null) {
            securityServiceUser = securityService.getUser().getUsername();
          }
        }
      } catch (Exception e) {
        securityServiceUser = "unavailable";
      }

      logger.warn(
          "Audience poll auth check failed. contextClass={}, graphQlContextClass={}, securityServiceUser={}",
          contextClass, graphQlContextClass, securityServiceUser
      );
    } catch (Exception e) {
      logger.warn("Audience poll auth check failed; debug logging unavailable", e);
    }
  }

  private String resolveVoterId(String voterId, DataFetchingEnvironment environment) {
    if (voterId != null && !voterId.trim().isEmpty()) {
      return voterId.trim();
    }
    return extractUserId(environment);
  }
}
