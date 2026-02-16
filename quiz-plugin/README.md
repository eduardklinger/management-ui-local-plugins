# Quiz Plugin

A complete example plugin demonstrating the hybrid approach for Management UI plugins.

## Architecture

This plugin uses a **hybrid approach**:

- **GraphQL (Opencast)**: Event data, user authentication
- **Convex (External DBaaS)**: Quiz data, submissions, real-time results

### React Query Integration (Important)

The Management UI host provides the `QueryClientProvider`. The plugin must use
`@workspace/query` hooks (not `@tanstack/react-query` directly) so it shares the
host client instance. Otherwise you'll see:

```
No QueryClient set, use QueryClientProvider to set one
```

## Structure

```
quiz-plugin/
├── backend/                    # Backend OSGi Bundle (JAR)
│   ├── src/main/java/
│   │   └── org/opencastproject/quiz/plugin/
│   │       ├── QuizGraphQLProvider.java      # GraphQL Extension Provider
│   │       ├── QuizEventExtension.java       # Extends GqlEvent with quizInfo
│   │       ├── QuizMutationExtension.java    # Extends Mutation with quiz()
│   │       ├── QuizMutation.java             # Quiz mutations
│   │       ├── type/                         # GraphQL Types
│   │       └── service/                      # Service layer (Convex integration)
│   └── pom.xml
│
└── plugins/quiz-plugin/        # Frontend Plugin
    ├── src/
    │   ├── index.ts            # Plugin entry
    │   ├── views/
    │   │   └── QuizView.tsx   # Main view
    │   ├── components/         # React components
    │   └── hooks/              # Custom hooks
    └── package.json
```

## GraphQL codegen

Quiz mutations live in `src/graphql/quiz.graphql`. Types and hooks are in `src/gql-generated.ts`. To regenerate them (with backend running and `GRAPHQL_ENDPOINT` set, e.g. in repo root `.env`):

```bash
pnpm codegen
```

## Installation

### Backend (JAR)

1. Build the backend module:
   ```bash
   cd backend/quiz-plugin
   mvn clean install
   ```

2. Deploy the JAR to Opencast:
   ```bash
   cp target/quiz-plugin-backend-1.0-SNAPSHOT.jar $OPENCAST_HOME/deploy/
   ```

3. Configure Convex URL (optional, if using Convex):
   ```bash
   export CONVEX_URL=https://your-deployment.convex.cloud
   ```

### Frontend

1. Build the plugin:
   ```bash
   cd plugins/quiz-plugin
   pnpm install
   pnpm build
   ```

2. The plugin can be:
   - Loaded via Marketplace (Developer Mode)
   - Bundled with the application
   - Distributed via plugin registry

## GraphQL Schema

### Queries

```graphql
query GetEventWithQuiz($eventId: String!) {
  eventById(id: $eventId) {
    id
    title
    quizInfo {
      hasQuiz
      quizId
      isActive
      title
      questionCount
    }
  }
}
```

### Mutations

```graphql
mutation CreateQuiz($eventId: String!, $quiz: QuizInput!) {
  quiz {
    createQuiz(eventId: $eventId, quiz: $quiz) {
      id
      title
      questions {
        id
        question
        type
        points
      }
    }
  }
}

mutation SubmitQuiz($eventId: String!, $answers: QuizAnswersInput!) {
  quiz {
    submitQuiz(eventId: $eventId, answers: $answers) {
      submissionId
      score
      maxScore
      percentage
      success
    }
  }
}
```

## Configuration

### Convex Setup

1. Create a Convex project:
   ```bash
   npx convex dev
   ```

2. Define schema in `convex/schema.ts`:
   ```typescript
   export default defineSchema({
     quizDefinitions: defineTable({...}),
     quizSubmissions: defineTable({...}),
   });
   ```

3. Implement functions in `convex/quiz.ts`:
   - `getQuiz`
   - `createQuiz`
   - `submitQuiz`
   - `getMySubmission`
   - `getResults`

4. Set environment variable:
   ```bash
   export CONVEX_URL=https://your-deployment.convex.cloud
   ```

### Alternative: Opencast Database

If you prefer to use Opencast's database instead of Convex:

1. Create JPA entities in `backend/quiz-plugin`
2. Implement `OpencastQuizDataStore` instead of `ConvexQuizDataStore`
3. Update `QuizService` to use the new data store

## Development

### Backend

```bash
cd backend/quiz-plugin
mvn clean install
```

### Frontend

```bash
cd plugins/quiz-plugin
pnpm install
pnpm dev  # Watch mode
```

## Deployment as JAR

The backend module is packaged as an OSGi bundle (JAR) that can be installed independently:

1. **Build**: `mvn clean install` produces `quiz-plugin-backend-1.0-SNAPSHOT.jar`
2. **Deploy**: Copy JAR to `$OPENCAST_HOME/deploy/`
3. **Activate**: OSGi automatically discovers and activates the bundle
4. **Verify**: Check Opencast logs for "Quiz Plugin GraphQL Provider" registration

The plugin is **fully encapsulated** - no changes to Opencast core required!

## Features

- ✅ GraphQL Extensions (Event + Mutation)
- ✅ Hybrid Database (GraphQL + Convex)
- ✅ Real-time Updates (via Convex)
- ✅ Fully Encapsulated (JAR deployment)
- ✅ No Opencast Core Changes

## See Also

- `docs/GRAPHQL_MUTATIONS_EXTENDING.md` - How to extend GraphQL
- `docs/QUIZ_PLUGIN_HYBRID_EXAMPLE.md` - Detailed hybrid approach example
- `docs/PLUGIN_DATABASE_STRATEGIES.md` - Database options comparison
