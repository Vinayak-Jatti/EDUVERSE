/**
 * Security & Penetration Testing — Layer 4
 * 
 * Verifying resilience against:
 *  - SQL Injection (SQLi)
 *  - Cross-Site Scripting (XSS)
 *  - Mass Assignment (MA)
 *  - Broken Authentication (JWT Tampering)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { dbCleanup, generateTestEmail, pool, TABLES_TO_CLEANUP } from './helpers/db.helper.js';

describe('Security Layer — Penetration Testing', () => {
    const TEST_PASS = 'SecurePass@123';
    let userA = { id: '', email: generateTestEmail('secA'), accessToken: '' };

    beforeAll(async () => {
        await dbCleanup(TABLES_TO_CLEANUP);

        // Register User A
        const reg = await request(app).post('/api/v1/auth/register').send({
            firstName: 'Security', lastName: 'Audit', email: userA.email,
            password: TEST_PASS, campus: 'NetUni'
        });
        userA.id = reg.body.data.userId;
        await pool.execute("UPDATE users SET status='active', email_verified=1 WHERE id=?", [userA.id]);
        const login = await request(app).post('/api/v1/auth/login').send({ email: userA.email, password: TEST_PASS });
        userA.accessToken = login.body.data.accessToken;
    });

    afterAll(async () => {
        await dbCleanup(TABLES_TO_CLEANUP);
    });

    // ─── SQL Injection (SQLi) ────────────────────────────────────────────────
    it('SQLi — should NOT allow authentication bypass via OR 1=1', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: "' OR 1=1 --",
                password: "any"
            });
        
        // Either unauthorized (from DB) or validation error (from express-validator)
        expect([401, 422]).toContain(res.status);
    });

    // ─── Mass Assignment ─────────────────────────────────────────────────────
    it('Mass Assignment — should NOT allow manual count inflation', async () => {
        const res = await request(app)
            .patch('/api/v1/profile/me')
            .set('Authorization', `Bearer ${userA.accessToken}`)
            .send({
                display_name: "Audit User",
                follower_count: 999999 
            });

        expect(res.status).toBe(200);
        
        const me = await request(app)
            .get('/api/v1/profile/me') 
            .set('Authorization', `Bearer ${userA.accessToken}`);
        
        expect(me.body.data.follower_count).toBe(0);
    });

    // ─── Cross-Site Scripting (XSS) ──────────────────────────────────────────
    it('XSS — should sanitize script tags in body payload', async () => {
        const payload = "<script>alert('pwned')</script> Hello";
        const res = await request(app)
            .patch('/api/v1/profile/me')
            .set('Authorization', `Bearer ${userA.accessToken}`)
            .send({
                display_name: payload
            });

        expect(res.status).toBe(200);
        
        // express-validator.escape() should have changed < to &lt;
        expect(res.body.data.display_name).not.toContain('<script>');
    });

    // ─── JWT Tampering ───────────────────────────────────────────────────────
    it('Broken Auth — should reject JWT with manipulated payload/signature', async () => {
        const tokens = userA.accessToken.split('.');
        const tamperedSignature = tokens[2].substring(0, tokens[2].length - 1) + (tokens[2].endsWith('A') ? 'B' : 'A');
        const tamperedToken = `${tokens[0]}.${tokens[1]}.${tamperedSignature}`;

        // Use a strictly PROTECTED route (PATCH /profile/me)
        const res = await request(app)
            .patch('/api/v1/profile/me')
            .set('Authorization', `Bearer ${tamperedToken}`)
            .send({ bio: 'hack' });

        expect(res.status).toBe(401);
    });
});
