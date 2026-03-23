/**
 * Profile Module — Integration Tests
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { dbCleanup, generateTestEmail, pool, TABLES_TO_CLEANUP } from './helpers/db.helper.js';

describe('Profile Module — Integration', () => {
  const TEST_EMAIL_A = generateTestEmail('profA');
  const TEST_EMAIL_B = generateTestEmail('profB');
  const TEST_PASS = 'SecurePass@123';
  
  let userA = { id: '', email: TEST_EMAIL_A, username: '', accessToken: '' };
  let userB = { id: '', email: TEST_EMAIL_B, username: '', accessToken: '' };

  // Setup: Register 2 users
  beforeAll(async () => {
    await dbCleanup(TABLES_TO_CLEANUP);

    // Register User A
    const regARes = await request(app).post('/api/v1/auth/register').send({
      firstName: 'Alphas', lastName: 'User', email: userA.email,
      password: TEST_PASS, campus: 'Alpha Uni'
    });
    expect(regARes.status).toBe(201);
    userA.id = regARes.body.data.userId;

    // Register User B
    const regBRes = await request(app).post('/api/v1/auth/register').send({
      firstName: 'Beta', lastName: 'User', email: userB.email,
      password: TEST_PASS, campus: 'Beta Uni'
    });
    expect(regBRes.status).toBe(201);
    userB.id = regBRes.body.data.userId;

    // Verify Users in DB
    await pool.execute("UPDATE users SET status='active', email_verified=1 WHERE email=?", [userA.email]);
    await pool.execute("UPDATE users SET status='active', email_verified=1 WHERE email=?", [userB.email]);

    // Login A
    const loginARes = await request(app).post('/api/v1/auth/login').send({ email: userA.email, password: TEST_PASS });
    expect(loginARes.status).toBe(200);
    userA.accessToken = loginARes.body.data.accessToken;
    userA.username = loginARes.body.data.user.username;

    // Login B
    const loginBRes = await request(app).post('/api/v1/auth/login').send({ email: userB.email, password: TEST_PASS });
    expect(loginBRes.status).toBe(200);
    userB.accessToken = loginBRes.body.data.accessToken;
    userB.username = loginBRes.body.data.user.username;
  });

  afterAll(async () => {
    await dbCleanup(TABLES_TO_CLEANUP);
  });

  // ─── Fetching Profiles ──────────────────────────────────────────────────────
  describe('GET /api/v1/profile/:username', () => {
    it('should return 404 for non-existent profile', async () => {
      const res = await request(app).get('/api/v1/profile/doesnotexist');
      expect(res.status).toBe(404);
    });

    it('should return profile for valid username', async () => {
      const res = await request(app)
        .get(`/api/v1/profile/${userB.username}`)
        .set('Authorization', `Bearer ${userA.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.username).toBe(userB.username);
      expect(res.body.data.isMe).toBe(false);
    });

    it('should show isMe=true when fetching own profile', async () => {
      const res = await request(app)
        .get(`/api/v1/profile/${userA.username}`)
        .set('Authorization', `Bearer ${userA.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isMe).toBe(true);
    });
  });

  // ─── Updating Profile ───────────────────────────────────────────────────────
  describe('PATCH /api/v1/profile/me', () => {
    it('should update profile fields and return 200', async () => {
      const res = await request(app)
        .patch('/api/v1/profile/me')
        .set('Authorization', `Bearer ${userA.accessToken}`)
        .send({
          display_name: 'Updated Alphas',
          bio: 'Integration Testing is Fun',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.display_name).toBe('Updated Alphas');
      expect(res.body.data.bio).toBe('Integration Testing is Fun');
    });
  });

  // ─── Follow Logic ──────────────────────────────────────────────────────────
  describe('Following Actions', () => {
    it('should follow userB and return 200', async () => {
      const res = await request(app)
        .post(`/api/v1/profile/follow/${userB.id}`)
        .set('Authorization', `Bearer ${userA.accessToken}`);

      expect(res.status).toBe(200);
      
      const profRes = await request(app)
        .get(`/api/v1/profile/${userB.username}`)
        .set('Authorization', `Bearer ${userA.accessToken}`);
      
      expect(profRes.body.data.isFollowing).toBe(true);
      expect(profRes.body.data.follower_count).toBeGreaterThan(0);
    });

    it('should unfollow userB', async () => {
      const res = await request(app)
        .delete(`/api/v1/profile/follow/${userB.id}`)
        .set('Authorization', `Bearer ${userA.accessToken}`);

      expect(res.status).toBe(200);

      const profRes = await request(app)
        .get(`/api/v1/profile/${userB.username}`)
        .set('Authorization', `Bearer ${userA.accessToken}`);
      expect(profRes.body.data.isFollowing).toBe(false);
    });
  });
});
