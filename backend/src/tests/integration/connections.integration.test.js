/**
 * Connections Module — Integration Tests
 *
 * Tests:
 *  - POST /api/v1/connections/request/:userId   — connect request
 *  - GET  /api/v1/connections/pending          — incoming requests
 *  - POST /api/v1/connections/accept/:requestId — handshake accept
 *  - GET  /api/v1/connections                   — view verified network
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { dbCleanup, generateTestEmail, pool, TABLES_TO_CLEANUP } from './helpers/db.helper.js';

describe('Connections Module — Integration', () => {
  const TEST_PASS = 'SecurePass@123';
  let userA = { id: '', email: generateTestEmail('connA'), accessToken: '' };
  let userB = { id: '', email: generateTestEmail('connB'), accessToken: '' };
  let requestId = null;

  beforeAll(async () => {
    await dbCleanup(TABLES_TO_CLEANUP);

    // Register & Login 2 users
    const regARes = await request(app).post('/api/v1/auth/register').send({
      firstName: 'Adam', lastName: 'Alpha', email: userA.email,
      password: TEST_PASS, campus: 'Uni A'
    });
    userA.id = regARes.body.data.userId;

    const regBRes = await request(app).post('/api/v1/auth/register').send({
      firstName: 'Bella', lastName: 'Beta', email: userB.email,
      password: TEST_PASS, campus: 'Uni B'
    });
    userB.id = regBRes.body.data.userId;

    // Verify manually
    await pool.execute("UPDATE users SET status='active', email_verified=1 WHERE id IN (?,?)", [userA.id, userB.id]);

    // Logins
    const loginARes = await request(app).post('/api/v1/auth/login').send({ email: userA.email, password: TEST_PASS });
    userA.accessToken = loginARes.body.data.accessToken;

    const loginBRes = await request(app).post('/api/v1/auth/login').send({ email: userB.email, password: TEST_PASS });
    userB.accessToken = loginBRes.body.data.accessToken;
  });

  afterAll(async () => {
    await dbCleanup(TABLES_TO_CLEANUP);
  });

  // ─── Phase 1: Sending Request ──────────────────────────────────────────────
  it('POST /request/:userId — should send connection request to User B', async () => {
    const res = await request(app)
      .post(`/api/v1/connections/request/${userB.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  // ─── Phase 2: Viewing Incoming ─────────────────────────────────────────────
  it('GET /pending — should list incoming request for User B', async () => {
    const res = await request(app)
      .get('/api/v1/connections/pending')
      .set('Authorization', `Bearer ${userB.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.incoming).toBeDefined();
    expect(res.body.data.incoming.length).toBeGreaterThan(0);
    
    // Save request ID for next test
    requestId = res.body.data.incoming[0].request_id;
  });

  // ─── Phase 3: Accepting ───────────────────────────────────────────────────
  it('POST /accept/:requestId — should verify connection established', async () => {
    const res = await request(app)
      .post(`/api/v1/connections/accept/${requestId}`)
      .set('Authorization', `Bearer ${userB.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/verified|success/i);
  });

  // ─── Phase 4: Final Verification ──────────────────────────────────────────
  it('GET / — should list User B in User A verified network', async () => {
    const res = await request(app)
      .get('/api/v1/connections')
      .set('Authorization', `Bearer ${userA.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.connections).toBeDefined();
    expect(res.body.data.connections.length).toBeGreaterThan(0);
    expect(res.body.data.connections[0].user_id).toBe(userB.id);
  });

  // ─── End: Removal ──────────────────────────────────────────────────────────
  it('DELETE /:userId — should remove connection', async () => {
    const res = await request(app)
      .delete(`/api/v1/connections/${userB.id}`)
      .set('Authorization', `Bearer ${userA.accessToken}`);

    expect(res.status).toBe(200);
    
    // Check network again
    const checkRes = await request(app)
      .get('/api/v1/connections')
      .set('Authorization', `Bearer ${userA.accessToken}`);
    expect(checkRes.body.data.connections.length).toBe(0);
  });
});
