# Quiz Plugin Backend

Backend implementation of the Quiz Plugin for Opencast Management UI.

## Features

- **GraphQL Extensions**: Extends Opencast's GraphQL schema with quiz-related fields and mutations
- **Flexible Storage**: Opencast DB (JPA), Convex (external DBaaS), or Mock (in-memory)
- **Fully Encapsulated**: Both frontend and backend can be deployed as a single JAR

## Building

The frontend lives in **`.local-plugins/quiz-plugin`** (not `plugins/quiz-plugin`). The backend POM runs `pnpm build` there during `generate-resources`, so you can build everything from the monorepo root:

```bash
# From monorepo root
cd backend/quiz-plugin && mvn clean install
```

Or build the frontend first, then the backend:

```bash
cd .local-plugins/quiz-plugin && pnpm build && cd ../..
cd backend/quiz-plugin && mvn clean install
```

The build process will:
- Run `pnpm build` in `.local-plugins/quiz-plugin` (if not already built)
- Copy `quiz.mjs` (and `quiz.css` if present) into the JAR at `static/plugins/quiz/`
- Create an OSGi bundle with GraphQL extensions and `Management-Plugin: quiz` so the core discovers it via `plugins.json`

## Deployment

### Single JAR Deployment (Recommended)

The Quiz Plugin is deployed as a **single JAR** that includes both frontend and backend:

1. **Build from monorepo root:**
   ```bash
   cd backend/quiz-plugin && mvn clean install
   ```

2. **Deploy the JAR:**
   ```bash
   cp backend/quiz-plugin/target/quiz-plugin-backend-1.0-SNAPSHOT.jar \
      $OPENCAST_HOME/deploy/
   ```

3. **The core loads the plugin automatically:** The JAR has `Management-Plugin: quiz`, so Opencast's plugin tracker adds it to `plugins.json`. The Management UI core fetches that list and loads `quiz.mjs` (and `quiz.css` if present) from the same origin. No Marketplace install step needed when deployed as JAR.

## Configuration

### OSGi Configuration (Recommended)

Create `etc/org.opencastproject.quiz.plugin.service.QuizService.cfg` in your Opencast distribution:

```properties
store=opencast
convexUrl=
```

`store` can be:
- `opencast` (default) – Uses the Opencast DB (JPA)
- `convex` – Uses Convex (requires `convexUrl` or `CONVEX_URL`)
- `mock` – In-memory store (development only)

### Environment Variables

- `CONVEX_URL`: URL to your Convex deployment (optional, defaults to MockQuizDataStore if not set)

Example:
```bash
export CONVEX_URL=https://your-deployment.convex.cloud
```

## GraphQL API

### Queries

```graphql
query GetQuiz($eventId: String!) {
  eventById(id: $eventId) {
    id
    quizInfo {
      hasQuiz
      quizId
      isActive
      title
      questionCount
    }
    quiz {
      id
      title
      description
      questions {
        id
        question
        type
        options
        points
      }
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
      answerResults {
        questionId
        answer
        isCorrect
        points
      }
    }
  }
}
```

## Architecture

- **Backend**: Java/OSGi bundle with GraphQL extensions
- **Frontend**: React/TypeScript ES module (bundled in JAR)
- **Database**: Opencast DB (JPA), Convex (external), or Mock (in-memory)
- **Deployment**: Single JAR containing both frontend and backend

## Database Schema (MariaDB/MySQL)

Automatic DDL is disabled in production (`ddl-generation=none`). If you need to create the tables manually, use:

- `sql/quiz-schema-mariadb.sql`
- `sql/quiz-schema-drop.sql` (optional cleanup/reset)

Run it once in your database (e.g. via phpMyAdmin). This creates:
`oc_quiz`, `oc_quiz_question`, `oc_quiz_submission`.

## When separating the plugin from the monorepo

If you move the quiz plugin to its **own repository** (e.g. for community distribution or a separate product):

- **Keep frontend and backend together** in that repo. One repo = one plugin (UI + API). For example:
  - `quiz-plugin/` (repo root)
    - `frontend/` — Vite app, builds to `dist/` (or use repo root as frontend)
    - `backend/` — Maven module, copies `frontend/dist/` into the JAR, Java/GraphQL for quiz API
  - The backend POM would point at `../frontend/dist` (or `./dist` if frontend is at root). CI builds frontend first, then backend, and produces a single JAR.
- **Why:** Versioning, releases, and deployment stay in one place. Deployers get one JAR; the plugin author owns both UI and API. The Management UI core only needs to load the frontend from `plugins.json`; the backend JAR registers the GraphQL extension with Opencast when deployed.
- **GraphQL:** Quiz operations (queries/mutations) can stay defined in that repo too: the backend exposes the schema, and the frontend can have its own `.graphql` files and codegen in the plugin repo instead of depending on core `packages/query`.

## Troubleshooting

### Frontend Module Not Found

If the JAR is missing the frontend:

1. Build the frontend, then the backend:
   ```bash
   cd .local-plugins/quiz-plugin && pnpm build && cd ../..
   cd backend/quiz-plugin && mvn clean install
   ```

2. Or let Maven build the frontend (exec-maven-plugin runs `pnpm build` in `.local-plugins/quiz-plugin` during `generate-resources`).

3. Verify the JAR contains the frontend:
   ```bash
   jar -tf backend/quiz-plugin/target/quiz-plugin-backend-*.jar | grep quiz.mjs
   ```

### GraphQL Extensions Not Appearing

1. Check Opencast logs for: `"Quiz Plugin GraphQL Provider"`
2. Verify the JAR is in `$OPENCAST_HOME/deploy/`
3. Restart Opencast to reload extensions
