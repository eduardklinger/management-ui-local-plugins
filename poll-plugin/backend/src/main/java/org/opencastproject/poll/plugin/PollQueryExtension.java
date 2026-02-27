package org.opencastproject.poll.plugin;

import org.opencastproject.graphql.execution.context.OpencastContext;
import org.opencastproject.graphql.execution.context.OpencastContextManager;
import org.opencastproject.graphql.type.output.Query;
import org.opencastproject.poll.plugin.service.PollService;
import org.opencastproject.security.api.SecurityService;
import org.opencastproject.poll.plugin.type.PollDefinition;
import org.opencastproject.security.api.User;

import graphql.annotations.annotationTypes.GraphQLField;
import graphql.annotations.annotationTypes.GraphQLName;
import graphql.annotations.annotationTypes.GraphQLTypeExtension;
import graphql.schema.DataFetchingEnvironment;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@GraphQLTypeExtension(Query.class)
public final class PollQueryExtension {

  private PollQueryExtension() {
  }

  @GraphQLField
  public static PollDefinition audiencePoll(
      @GraphQLName("pollId") String pollId,
      DataFetchingEnvironment environment) {
    return PollService.getInstance().getAudiencePoll(pollId);
  }

  @GraphQLField
  public static List<PollDefinition> audiencePolls(DataFetchingEnvironment environment) {
    List<PollDefinition> polls = PollService.getInstance().listAudiencePolls();
    if (polls == null) {
      return new ArrayList<PollDefinition>();
    }
    return polls;
  }

  @GraphQLField
  public static boolean canManageAudiencePolls(DataFetchingEnvironment environment) {
    return isAuthenticatedUser(environment);
  }

  @GraphQLField
  public static String currentAudiencePollUser(DataFetchingEnvironment environment) {
    User user = resolveUser(environment);
    if (user == null) {
      return null;
    }
    String username = user.getUsername();
    if (username == null || username.trim().isEmpty() || "anonymous".equalsIgnoreCase(username)) {
      return null;
    }
    return username;
  }

  private static boolean isAuthenticatedUser(DataFetchingEnvironment environment) {
    User user = resolveUser(environment);
    if (user == null) {
      return false;
    }
    String username = user.getUsername();
    return username != null && !username.trim().isEmpty() && !"anonymous".equalsIgnoreCase(username);
  }

  private static User resolveUser(DataFetchingEnvironment environment) {
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
      // ignore
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
      return null;
    }
  }

  private static User resolveUserFromObject(Object candidate, Set<Object> visited, int depth) {
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
        return null;
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

    User nestedFromGet = resolveUserFromObject(invokeGetWithKey(candidate, "user"), visited, depth + 1);
    if (nestedFromGet != null) {
      return nestedFromGet;
    }
    return resolveUserFromObject(invokeGetWithKey(candidate, "currentUser"), visited, depth + 1);
  }

  private static Object invokeNoArg(Object target, String methodName) {
    try {
      Method method = target.getClass().getMethod(methodName);
      if (method.getParameterCount() == 0) {
        return method.invoke(target);
      }
    } catch (Exception e) {
      return null;
    }
    return null;
  }

  private static Object invokeGetWithKey(Object target, String key) {
    try {
      Method getMethod = target.getClass().getMethod("get", Object.class);
      return getMethod.invoke(target, key);
    } catch (Exception e) {
      return null;
    }
  }
}
