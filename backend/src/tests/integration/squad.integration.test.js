/**
 * Squad Module — Integration Tests
 *
 * Scenarios:
 *  - POST /api/v1/squad          — create community
 *  - GET  /api/v1/squad/public   — discovery
 *  - POST /api/v1/squad/:id/join — membership flow
 *  - GET  /api/v1/squad/my       — verify roster
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { dbCleanup, generateTestEmail, pool, TABLES_TO_CLEANUP } from './helpers/db.helper.js';

describe('Squad Module — Integration', () => {
  const TEST_PASS = 'SecurePass@123';
  let userA = { id: '', email: generateTestEmail('sqdA'), accessToken: '' };
  let userB = { id: '', email: generateTestEmail('sqdB'), accessToken: '' };
  let squadId = null;

  beforeAll(async () => {
    await dbCleanup(TABLES_TO_CLEANUP);

    // Setup 2 Users
    for (const u of [userA, userB]) {
      const reg = await request(app).post('/api/v1/auth/register').send({
        firstName: 'Squad', lastName: 'Member', email: u.email,
        password: TEST_PASS, campus: 'Squad Central'
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

  // ─── Phase 1: Creation ──────────────────────────────────────────────────────
  it('POST / — should create a new public squad and return 201', async () => {
    const res = await request(app)
      .post('/api/v1/squad')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({
        name: 'The Quantum Coders',
        description: 'Deep dive into QC and algorithms.',
        visibility: 'public'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    squadId = res.body.data.id;
  });

  // ─── Phase 2: Discovery ─────────────────────────────────────────────────────
  it('GET /public — should list the new squad for User B', async () => {
    const res = await request(app)
      .get('/api/v1/squad/public')
      .set('Authorization', `Bearer ${userB.accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some(s => s.id === squadId)).toBe(true);
  });

  // ─── Phase 3: Joining ───────────────────────────────────────────────────────
  it('POST /:id/join — should allow User B to join the squad', async () => {
    const res = await request(app)
      .post(`/api/v1/squad/${squadId}/join`)
      .set('Authorization', `Bearer ${userB.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/success/i);
  });

  // ─── Phase 4: Ownership Retention ──────────────────────────────────────────
  it('POST /:id/leave — should refuse owner leave if they are the last one', async () => {
    const res = await request(app)
      .post(`/api/v1/squad/${squadId}/leave`)
      .set('Authorization', `Bearer ${userA.accessToken}`);

    // Enterprise rule: owner cannot leave without transfer/delete
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/owner|forbidden/i);
  });

  // ─── Phase 5: Verification ──────────────────────────────────────────────────
  it('GET /my — should show membership for both users', async () => {
    const resA = await request(app).get('/api/v1/squad/my').set('Authorization', `Bearer ${userA.accessToken}`);
    const resB = await request(app).get('/api/v1/squad/my').set('Authorization', `Bearer ${userB.accessToken}`);

    expect(resA.body.data.length).toBe(1);
    expect(resB.body.data.length).toBe(1);
  });
});
