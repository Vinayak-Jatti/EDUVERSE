/**
 * Mastery Module — Integration Tests
 *
 * Checks:
 *  - POST /api/v1/mastery          — independent video publication
 *  - GET  /api/v1/mastery/discovery — learning stream retrieval
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { dbCleanup, generateTestEmail, pool, TABLES_TO_CLEANUP } from './helpers/db.helper.js';

describe('Mastery Module — Integration', () => {
  const TEST_PASS = 'SecurePass@123';
  let userA = { id: '', email: generateTestEmail('mastA'), accessToken: '' };
  let streamId = null;

  beforeAll(async () => {
    await dbCleanup(TABLES_TO_CLEANUP);

    // Register & Activate
    const regRes = await request(app).post('/api/v1/auth/register').send({
      firstName: 'Master', lastName: 'Learner', email: userA.email,
      password: TEST_PASS, campus: 'Mastery Campus'
    });
    userA.id = regRes.body.data.userId;
    await pool.execute("UPDATE users SET status='active', email_verified=1 WHERE id=?", [userA.id]);

    const loginRes = await request(app).post('/api/v1/auth/login').send({ email: userA.email, password: TEST_PASS });
    userA.accessToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await dbCleanup(TABLES_TO_CLEANUP);
  });

  // ─── Phase 1: Stream Initiation ────────────────────────────────────────────
  it('POST / — should initiate a mastery stream and return 201', async () => {
    // Note: Since multi-part file upload is complex in test without real files,
    // we assume the controller handles missing files gracefully or we mock a field.
    // However, I'll try to send a JSON first to see if it bypasses or crashes.
    const res = await request(app)
      .post('/api/v1/mastery')
      .set('Authorization', `Bearer ${userA.accessToken}`)
      .field('body', 'Welcome to my Mastery stream on Advanced SQL!')
      .field('visibility', 'public')
      .attach('media', Buffer.from('mock_video_data'), 'test_video.mp4');

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    streamId = res.body.data.id;
  });

  // ─── Phase 2: Discovery ─────────────────────────────────────────────────────
  it('GET /discovery — should list the mastery stream in global learning feed', async () => {
    const res = await request(app)
      .get('/api/v1/mastery/discovery')
      .set('Authorization', `Bearer ${userA.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.some(s => s.id === streamId)).toBe(true);
  });

  // ─── Phase 3: My Streams ───────────────────────────────────────────────────
  it('GET /my — should list creator streams', async () => {
    const res = await request(app)
      .get('/api/v1/mastery/my')
      .set('Authorization', `Bearer ${userA.accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe(streamId);
  });
});
