import { vi } from 'vitest';

// ─── Mock env.js FIRST — prevents "Missing required env var" throws at module load ──
vi.mock('../config/env.js', () => ({
  default: {
    server: { port: '3000', env: 'test', isProduction: false },
    cors: { origin: 'http://localhost:5173' },
    db: { host: 'localhost', port: '3306', name: 'test_db', user: 'test', password: 'test' },
    jwt: { secret: 'test-secret', expiresIn: '1h', refreshSecret: 'test-refresh-secret', refreshExpiresIn: '7d' },
    mail: { host: 'smtp.test.com', port: '587', user: 'test@test.com', pass: 'testpass', from: 'EduVerse <no-reply@eduverse.app>' },
    oauth: {
      google: { clientId: '', clientSecret: '', redirectUri: '' },
      github: { clientId: '', clientSecret: '', redirectUri: '' },
    },
  }
}));

// ─── Global DB Pool Mock ─────────────────────────────────────────────────────
// Prevents real MySQL connections when any repository is imported during unit tests.
vi.mock('../config/db.js', () => ({
  default: {
    execute: vi.fn().mockResolvedValue([[], {}]),
    query: vi.fn().mockResolvedValue([[], {}]),
    getConnection: vi.fn().mockResolvedValue({
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      execute: vi.fn().mockResolvedValue([[], {}]),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
    }),
  }
}));

// ─── Process env vars (for any module that reads process.env directly) ───────
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test';
process.env.DB_USER_PASS = 'test';
process.env.DB_NAME = 'test_db';
process.env.MAIL_HOST = 'smtp.test.com';
process.env.MAIL_USER = 'test@test.com';
process.env.MAIL_PASS = 'testpass';

