# Feed Schema

## `posts` / `insights`
Houses core content fields.
- `id`: UUID (PK)
- `user_id`: UUID (FK)
- `body`: TEXT
- `created_at`: TIMESTAMP

## `likes` (Polymorphic)
- `id`: UUID
- `user_id`: UUID (FK)
- `target_id`: UUID (The target content ID)
- `target_type`: ENUM('post', 'insight')
- *Unique Constraint: `user_id` + `target_id` + `target_type`*

## `comments` (Polymorphic)
- `id`: UUID
- `user_id`: UUID (FK)
- `target_id`: UUID
- `target_type`: ENUM('post', 'insight')
- `body`: TEXT
*(Note: Dropped strict `post_id` FK to unlock polymorphic commenting across Insights and Videos)*

## `reports` (Polymorphic)
- `target_id`: UUID
- `target_type`: ENUM
- `reported_by`: UUID (FK)
- `reason`: TEXT
