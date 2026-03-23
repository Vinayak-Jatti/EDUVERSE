/**
 * Chat Module — Integration Tests (REST Level)
 *
 * Tests:
 *  - POST /api/v1/chats/rooms — initiate interaction
 *  - GET  /api/v1/chats/rooms — roster sync
 *  - GET  /api/v1/chats/rooms/:id/messages — history access
 *  - Unauthorized access checks (FORBIDDEN)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { dbCleanup, generateTestEmail, pool, TABLES_TO_CLEANUP } from './helpers/db.helper.js';

describe('Chat Module — Integration', () => {
  const TEST_PASS = 'SecurePass@123';
  let userA = { id: '', email: generateTestEmail('chtA'), accessToken: '' };
  let userB = { id: '', email: generateTestEmail('chtB'), accessToken: '' };
  let userC = { id: '', email: generateTestEmail('chtC'), accessToken: '' }; // The outsider
  let roomId = null;

  beforeAll(async () => {
    await dbCleanup(TABLES_TO_CLEANUP);

    // Setup 3 Users
    for (const u of [userA, userB, userC]) {
      const reg = await request(app).post('/api/v1/auth/register').send({
        firstName: 'Chatter', lastName: 'X', email: u.email,
        password: TEST_PASS, campus: 'Chat Uni'
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

  // ─── Phase 1: Room Initiation ─────────────────────────────────────────────
  it('POST /rooms — should create a direct chat room between A and B', async () => {
    const res = await request(app)
      .post('/api/v1/chats/rooms')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .send({
        targetUserId: userB.id,
        type: 'direct'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.roomId).toBeDefined();
    roomId = res.body.data.roomId;
  });

  // ─── Phase 2: Roster Verification ──────────────────────────────────────────
  it('GET /rooms — should show the new room for both participants', async () => {
    const resA = await request(app).get('/api/v1/chats/rooms').set('Authorization', `Bearer ${userA.accessToken}`);
    const resB = await request(app).get('/api/v1/chats/rooms').set('Authorization', `Bearer ${userB.accessToken}`);

    expect(resA.body.data.length).toBe(1);
    expect(resB.body.data.length).toBe(1);
    expect(resA.body.data[0].room_id).toBe(roomId);
  });

  // ─── Phase 3: Security Validation ──────────────────────────────────────────
  it('GET /rooms/:id/messages — should allow A to view (empty) history', async () => {
    const res = await request(app)
      .get(`/api/v1/chats/rooms/${roomId}/messages`)
      .set('Authorization', `Bearer ${userA.accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /rooms/:id/messages — should FORBID User C from viewing history', async () => {
    const res = await request(app)
      .get(`/api/v1/chats/rooms/${roomId}/messages`)
      .set('Authorization', `Bearer ${userC.accessToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/not authorized|forbidden/i);
  });
});
