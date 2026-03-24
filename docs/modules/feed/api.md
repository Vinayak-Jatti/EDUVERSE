# Feed & Interaction API Specification

## Endpoints

### Interactions

`POST /api/v1/feed/:id/like`
- **Description:** Adds a like to the target entity (Post, Insight, or Video).
- **Body:** `{ "targetType": "post" | "insight" }`
- **Auth required:** Yes

`DELETE /api/v1/feed/:id/like`
- **Description:** Removes a like from the target entity.
- **Body:** `{ "targetType": "post" | "insight" }`
- **Auth required:** Yes

`POST /api/v1/feed/:id/report`
- **Description:** Submits a report securely to the moderation queue.
- **Body:** `{ "targetType": "string", "reason": "string" }`
- **Auth required:** Yes

### Deletion

`DELETE /api/v1/feed/:id` / `DELETE /api/v1/insights/:id`
- **Description:** Deletes the user-owned entity. Checks authorization natively via the service layer.

### Feed Retrieval
`GET /api/v1/feed`
- **Description:** Master aggregated feed return loop, handling multiple table joins (posts, insights) sorting by algorithm or timestamp. Includes computed states like `has_liked`.
