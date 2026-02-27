# Poll Plugin (Community Style)

Public audience poll plugin with unique poll URLs.

## Behavior

- Route base: `/poll-plugin`
- Poll route: `/poll-plugin/<pollId>`
- Only authenticated users can create new polls.
- Base route lists all polls.
- Anyone with a poll URL can:
  - submit a free-text answer (auto-votes that answer)
  - vote for an existing answer
- Polls can only be deleted by their creator.

This lets organizers create poll links while keeping audience participation public.

## Local Development

From repo root:

```bash
pnpm -C .local-plugins/poll-plugin build
pnpm -C .local-plugins/config build
pnpm dev --filter=management-ui-core
```

Then open:

- `http://127.0.0.1:5173/management-ui/poll-plugin`

Flow:

1. Log in as an organizer/admin.
2. Create a poll question on `/poll-plugin`.
3. You are redirected to `/poll-plugin/<pollId>`.
4. Share that URL or QR with participants.
5. Participants can answer/vote without creating polls.

## Backend GraphQL Contract

Query:

- `audiencePoll(pollId: String): PollDefinition`
- `audiencePolls: [PollDefinition]`
- `canManageAudiencePolls: Boolean`
- `currentAudiencePollUser: String`

Mutations:

- `poll.createAudiencePoll(question: String!): PollDefinition` (auth required)
- `poll.deleteAudiencePoll(pollId: String!): Boolean` (creator only)
- `poll.submitAudienceAnswer(pollId: String!, answer: String!, voterId: String): PollVoteResult`
- `poll.voteAudienceAnswer(pollId: String!, answerId: String!, voterId: String): PollVoteResult`

## Build Backend Bundle

```bash
mvn -f .local-plugins/poll-plugin/backend/pom.xml clean package -DskipTests
```

Artifact:

- `.local-plugins/poll-plugin/backend/target/poll-plugin-backend-1.0-SNAPSHOT.jar`

Deploy that JAR to Opencast `deploy/` so GraphQL extensions and frontend assets are served together.

## Troubleshooting

- If `/poll-plugin/<pollId>` shows "Poll Not Found", create a poll first or verify the URL.
- If styles are missing, rebuild plugin and restart core dev server:
  - `pnpm -C .local-plugins/poll-plugin build`
  - restart `pnpm dev --filter=management-ui-core`
- If create fails for logged-out users, that is expected by design.
