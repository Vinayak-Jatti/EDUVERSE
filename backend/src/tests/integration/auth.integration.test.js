import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { dbCleanup, generateTestEmail, pool, TABLES_TO_CLEANUP } from './helpers/db.helper.js';

describe('Auth Module — Integration', () => {
  const TEST_EMAIL = generateTestEmail('auth');
  const TEST_PASSWORD = 'SecurePass@123';
  let userId = null;
  let accessToken = null;
  let refreshToken = null;

  beforeAll(async () => {
    await dbCleanup(TABLES_TO_CLEANUP);
  });

  afterAll(async () => {
    await dbCleanup(TABLES_TO_CLEANUP);
  });

  it('POST /register — success', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      firstName: 'John', lastName: 'Doe', email: TEST_EMAIL, password: TEST_PASSWORD, campus: 'Uni'
    });
    expect(res.status).toBe(201);
    userId = res.body.data.userId;
  });

  it('POST /login — fails when unverified', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    expect(res.status).toBe(400); 
  });

  it('POST /login — success after verification', async () => {
    await pool.execute("UPDATE users SET status='active', email_verified=1 WHERE id=?", [userId]);
    const res = await request(app).post('/api/v1/auth/login').send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    expect(res.status).toBe(200);
    accessToken = res.body.data.accessToken;
    const cookies = res.get('Set-Cookie');
    refreshToken = cookies.find(c => c.startsWith('refreshToken=')).split('=')[1].split(';')[0];
  });

  it('GET /me — success', async () => {
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(TEST_EMAIL);
  });

  it('POST /refresh — success', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', [`refreshToken=${refreshToken}`]);
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('POST /logout — success', async () => {
    const res = await request(app).post('/api/v1/auth/logout');
    expect(res.status).toBe(200);
  });
});
