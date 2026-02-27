# Poll Plugin Backend

This backend bundle does two jobs:

1. Registers GraphQL extensions for polls:
   - `audiencePoll(pollId: String)` (root query)
   - `audiencePolls` (root query)
   - `canManageAudiencePolls` (root query)
   - `currentAudiencePollUser` (root query)
   - `mutation.poll.createAudiencePoll(...)` (auth required)
   - `mutation.poll.deleteAudiencePoll(...)` (creator-only)
   - `mutation.poll.submitAudienceAnswer(...)`
   - `mutation.poll.voteAudienceAnswer(...)`
   - (legacy event-scoped fields remain available)
2. Packages frontend artifacts from `../dist` into the OSGi bundle so Opencast can serve:
   - `/management-ui/static/plugins/poll-plugin/poll-plugin.mjs`
   - `/management-ui/static/plugins/poll-plugin/poll-plugin.css`

## Storage modes

- `opencast` (default): Uses JPA entities (`oc_poll`, `oc_poll_option`, `oc_poll_vote`) and persists votes.
- `mock`: In-memory fallback for local/demo use when DB/JPA services are not available.

Service PID: `org.opencastproject.poll.plugin.service.PollService`

Config:

```cfg
store=opencast
```

Schema auto-create component PID: `org.opencastproject.poll.plugin.schema`

## Build

From repository root:

```bash
pnpm -C .local-plugins/poll-plugin build
mvn -f .local-plugins/poll-plugin/backend/pom.xml clean package -DskipTests
```

Output JAR:

```text
.local-plugins/poll-plugin/backend/target/poll-plugin-backend-1.0-SNAPSHOT.jar
```

Deploy the JAR to your Opencast `deploy/` directory.
