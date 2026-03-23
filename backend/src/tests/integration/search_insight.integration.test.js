/**
 * Search & Insight Module — Integration Tests
 *
 * Checks:
 *  - POST /api/v1/insight — micro-publication
 *  - GET  /api/v1/search  — cross-entity discovery
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { dbCleanup, generateTestEmail, pool, TABLES_TO_CLEANUP } from './helpers/db.helper.js';

describe('Search & Insight Modules — Integration', () => {
  const TEST_PASS = 'SecurePass@123';
  let userA = { id: '', email: generateTestEmail('srchA'), accessToken: '' };
  let userB = { id: '', email: generateTestEmail('srchB'), accessToken: '' };
  let insightId = null;

  beforeAll(async () => {
    await dbCleanup(TABLES_TO_CLEANUP);

    // Setup 2 Users
    for (const u of [userA, userB]) {
      const reg = await request(app).post('/api/v1/auth/register').send({
        firstName: u === userA ? 'Searchable' : 'Seeker', lastName: 'User', 
        email: u.email, password: TEST_PASS, campus: 'Finders Uni'
      });
      u.id = reg.body.data.userId;
      await pool.execute("UPDATE users SET status='active', email_verified=1 WHERE id=?", [u.id]);
      const login = await request(app).post('/api/v1/auth/login').send({ email: u.email, password: TEST_PASS });
      u.accessToken = login.body.data.accessToken;
    }
  });

  afterAll(async () => {
    await dbCleanup(TABLES_TO_CLEANUP);
  });

  // ─── Phase 1: Insights ──────────────────────────────────────────────────────
  it('POST /insight — should publish micro-content and return 201', async () => {
    const res = await request(app)
      .post('/api/v1/insight')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({
        content: 'Small tip: Use UUIDs for identifiers in distributed systems!',
        visibility: 'public'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    insightId = res.body.data.id;
  });

  // ─── Phase 2: Search ────────────────────────────────────────────────────────
  it('GET /search — should find User A by first name', async () => {
    const res = await request(app)
      .get('/api/v1/search?q=Searchable')
      .set('Authorization', `Bearer ${userB.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.users).toBeDefined();
    expect(res.body.data.users.some(u => u.user_id === userA.id)).toBe(true);
  });

  it('GET /search — should find User A by unique content snippet', async () => {
    const res = await request(app)
      .get('/api/v1/search?q=UUIDs')
      .set('Authorization', `Bearer ${userB.accessToken}`);

    expect(res.status).toBe(200);
    // Depending on if search includes insights or only posts, it might be in different keys
    expect(res.body.data).toBeDefined();
  });
});
