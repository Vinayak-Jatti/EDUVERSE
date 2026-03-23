import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

// ─── Prevent module-load-time crashes from env/db imports ───────────────────
vi.mock('../../config/env.js', () => ({
  default: {
    server: { port: '3000', env: 'test', isProduction: false },
    cors: { origin: 'http://localhost:5173' },
    db: { host: 'localhost', port: '3306', name: 'test_db', user: 'test', password: 'test' },
    jwt: { secret: 'test-secret', expiresIn: '1h', refreshSecret: 'test-refresh-secret', refreshExpiresIn: '7d' },
    mail: { host: 'smtp.test.com', port: '587', user: 'test@test.com', pass: 'testpass', from: 'EduVerse <no-reply@eduverse.app>' },
    oauth: { google: { clientId: '', clientSecret: '', redirectUri: '' }, github: { clientId: '', clientSecret: '', redirectUri: '' } },
  }
}));
vi.mock('../../config/db.js', () => ({
  default: {
    execute: vi.fn().mockResolvedValue([[], {}]),
    query: vi.fn().mockResolvedValue([[], {}]),
    getConnection: vi.fn().mockResolvedValue({ beginTransaction: vi.fn(), execute: vi.fn().mockResolvedValue([[], {}]), commit: vi.fn(), rollback: vi.fn(), release: vi.fn() }),
  }
}));

// ─── Mock all external dependencies ────────────────────────────────────────
vi.mock('../../modules/user/user.repository.js', () => ({
  default: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  }
}));

vi.mock('../../modules/auth/auth.repository.js', () => ({
  default: {
    createProvider: vi.fn(),
    createOtp: vi.fn(),
    findValidOtp: vi.fn(),
    markOtpUsed: vi.fn(),
    findProvider: vi.fn(),
    findProviderByUid: vi.fn(),
    updateProviderPassword: vi.fn(),
  }
}));

vi.mock('../../modules/profile/profile.repository.js', () => ({
  default: {
    create: vi.fn(),
  }
}));

vi.mock('../../services/mail.service.js', () => ({
  sendOTPEmail: vi.fn().mockResolvedValue(true),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../utils/jwt.js', () => ({
  generateAccessToken: vi.fn(() => 'mock-access-token'),
  generateRefreshToken: vi.fn(() => 'mock-refresh-token'),
  verifyRefreshToken: vi.fn(),
}));

// Import after mocks are established
import userRepository from '../../modules/user/user.repository.js';
import authRepository from '../../modules/auth/auth.repository.js';
import profileRepository from '../../modules/profile/profile.repository.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt.js';
import {
  registerUser,
  verifyOtpOnSignup,
  loginUser,
  forgotPassword,
  resetPassword,
  refreshTokens,
} from '../../modules/auth/auth.service.js';

// ─── Auth Service: Unit Tests ──────────────────────────────────────────────

describe('Auth Service — registerUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw EMAIL_ALREADY_IN_USE when email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'existing-id', email: 'test@test.com' });

    await expect(registerUser({
      firstName: 'John', lastName: 'Doe',
      email: 'test@test.com', campus: 'MIT', password: 'pass123'
    })).rejects.toMatchObject({ errorCode: 'EMAIL_ALREADY_IN_USE', statusCode: 409 });
  });

  it('should successfully register a new user and return userId and email', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(true);
    profileRepository.create.mockResolvedValue(true);
    authRepository.createProvider.mockResolvedValue(true);
    authRepository.createOtp.mockResolvedValue(true);

    const result = await registerUser({
      firstName: 'Jane', lastName: 'Smith',
      email: 'jane@smith.com', campus: 'Harvard', password: 'SecurePass1!'
    });

    expect(result).toHaveProperty('userId');
    expect(result).toHaveProperty('email', 'jane@smith.com');
    expect(userRepository.create).toHaveBeenCalledOnce();
    expect(profileRepository.create).toHaveBeenCalledOnce();
    expect(authRepository.createOtp).toHaveBeenCalledOnce();
  });

  it('should strip non-alphanumeric characters from generated username', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue(true);
    authRepository.createProvider.mockResolvedValue(true);
    authRepository.createOtp.mockResolvedValue(true);

    const captor = vi.fn();
    profileRepository.create.mockImplementation((data) => { captor(data); return Promise.resolve(); });

    await registerUser({
      firstName: 'Test', lastName: 'User',
      email: 'test.user+tag@example.com', campus: 'Oxford', password: 'pass'
    });

    const usernameArg = captor.mock.calls[0][0].username;
    expect(usernameArg).toMatch(/^[a-z0-9_]+_\d{4}$/);
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Auth Service — verifyOtpOnSignup', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw USER_NOT_FOUND when email is invalid', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    await expect(verifyOtpOnSignup({ email: 'ghost@test.com', otp: '123456' }))
      .rejects.toMatchObject({ errorCode: 'USER_NOT_FOUND' });
  });

  it('should throw INVALID_OTP when no valid OTP exists in DB', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'user-1', email: 'a@a.com' });
    authRepository.findValidOtp.mockResolvedValue(null);

    await expect(verifyOtpOnSignup({ email: 'a@a.com', otp: '000000' }))
      .rejects.toMatchObject({ errorCode: 'INVALID_OTP' });
  });

  it('should throw INVALID_OTP when OTP hash does not match', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'user-1', email: 'a@a.com' });
    const hashedOtp = await bcrypt.hash('654321', 10);
    authRepository.findValidOtp.mockResolvedValue({ id: 'otp-1', otp_hash: hashedOtp });

    await expect(verifyOtpOnSignup({ email: 'a@a.com', otp: '000000' }))
      .rejects.toMatchObject({ errorCode: 'INVALID_OTP' });
  });

  it('should activate user and return tokens on successful OTP verification', async () => {
    const user = { id: 'user-1', email: 'a@a.com' };
    const otp = '123456';
    const hashedOtp = await bcrypt.hash(otp, 10);

    userRepository.findByEmail.mockResolvedValue(user);
    authRepository.findValidOtp.mockResolvedValue({ id: 'otp-1', otp_hash: hashedOtp });
    userRepository.update.mockResolvedValue(true);
    authRepository.markOtpUsed.mockResolvedValue(true);

    const result = await verifyOtpOnSignup({ email: 'a@a.com', otp });

    expect(result).toHaveProperty('accessToken', 'mock-access-token');
    expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
    expect(userRepository.update).toHaveBeenCalledWith('user-1', { status: 'active', email_verified: 1 });
    expect(authRepository.markOtpUsed).toHaveBeenCalledWith('otp-1');
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Auth Service — loginUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw USER_NOT_FOUND for unknown email', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    await expect(loginUser({ email: 'nobody@no.com', password: 'pass' }))
      .rejects.toMatchObject({ errorCode: 'USER_NOT_FOUND' });
  });

  it('should throw EMAIL_NOT_VERIFIED for pending/unverified user', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'u1', status: 'pending', email_verified: 0 });
    await expect(loginUser({ email: 'u@u.com', password: 'pass' }))
      .rejects.toMatchObject({ errorCode: 'EMAIL_NOT_VERIFIED' });
  });

  it('should throw INVALID_CREDENTIALS when no password provider exists', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'u1', status: 'active', email_verified: 1 });
    authRepository.findProvider.mockResolvedValue(null);
    await expect(loginUser({ email: 'u@u.com', password: 'pass' }))
      .rejects.toMatchObject({ errorCode: 'INVALID_CREDENTIALS' });
  });

  it('should throw INVALID_CREDENTIALS when password is wrong', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'u1', status: 'active', email_verified: 1 });
    const hash = await bcrypt.hash('correct-password', 10);
    authRepository.findProvider.mockResolvedValue({ password_hash: hash });

    await expect(loginUser({ email: 'u@u.com', password: 'wrong-password' }))
      .rejects.toMatchObject({ errorCode: 'INVALID_CREDENTIALS' });
  });

  it('should return tokens and user data on successful login', async () => {
    const user = { id: 'u1', email: 'u@u.com', status: 'active', email_verified: 1 };
    const hash = await bcrypt.hash('correct-password', 10);

    userRepository.findByEmail.mockResolvedValue(user);
    authRepository.findProvider.mockResolvedValue({ password_hash: hash });

    const result = await loginUser({ email: 'u@u.com', password: 'correct-password' });
    expect(result).toHaveProperty('accessToken', 'mock-access-token');
    expect(result.user).toMatchObject({ id: 'u1', email: 'u@u.com' });
  });
});

// ──────────────────────────────────────────────────────────────────────────────

/* 
describe('Auth Service — resendOtp', () => {
   ... omitted ...
});
*/

// ──────────────────────────────────────────────────────────────────────────────

describe('Auth Service — forgotPassword', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return safe message even if user does not exist (anti-enumeration)', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    const result = await forgotPassword('ghost@test.com');
    expect(result.message).toContain('If an account exists');
    // Confirm we NEVER leaked that the user doesn't exist
    expect(authRepository.createOtp).not.toHaveBeenCalled();
  });

  it('should throw BAD_REQUEST if user has OAuth only (no password provider)', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'u1', email: 'o@o.com' });
    authRepository.findProvider.mockResolvedValue(null);
    await expect(forgotPassword('o@o.com'))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('should generate and store OTP for valid user with password provider', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'u1', email: 'u@u.com' });
    authRepository.findProvider.mockResolvedValue({ id: 'p1' });
    authRepository.createOtp.mockResolvedValue(true);

    const result = await forgotPassword('u@u.com');
    expect(result.message).toContain('If an account exists');
    expect(authRepository.createOtp).toHaveBeenCalledOnce();
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Auth Service — resetPassword', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw INVALID_OTP when user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    await expect(resetPassword({ email: 'ghost@test.com', otp: '000000', newPassword: 'NewPass1!' }))
      .rejects.toMatchObject({ errorCode: 'INVALID_OTP' });
  });

  it('should throw INVALID_OTP when no valid OTP found in DB', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'u1' });
    authRepository.findValidOtp.mockResolvedValue(null);
    await expect(resetPassword({ email: 'u@u.com', otp: '000000', newPassword: 'NewPass1!' }))
      .rejects.toMatchObject({ errorCode: 'INVALID_OTP' });
  });

  it('should throw INVALID_OTP when OTP hash does not match', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'u1' });
    const hashedOtp = await bcrypt.hash('654321', 10);
    authRepository.findValidOtp.mockResolvedValue({ id: 'otp-1', otp_hash: hashedOtp });
    await expect(resetPassword({ email: 'u@u.com', otp: '000000', newPassword: 'NewPass1!' }))
      .rejects.toMatchObject({ errorCode: 'INVALID_OTP' });
  });

  it('should reset password and mark OTP as used on success', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'u1' });
    const otp = '123456';
    const hashedOtp = await bcrypt.hash(otp, 10);
    authRepository.findValidOtp.mockResolvedValue({ id: 'otp-1', otp_hash: hashedOtp });
    authRepository.updateProviderPassword.mockResolvedValue(true);
    authRepository.markOtpUsed.mockResolvedValue(true);

    const result = await resetPassword({ email: 'u@u.com', otp, newPassword: 'NewSecure1!' });
    expect(result.message).toContain('Password reset successfully');
    expect(authRepository.updateProviderPassword).toHaveBeenCalledOnce();
    expect(authRepository.markOtpUsed).toHaveBeenCalledWith('otp-1');
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Auth Service — refreshTokens', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw UNAUTHORIZED when no token is provided', async () => {
    await expect(refreshTokens(null))
      .rejects.toMatchObject({ errorCode: 'UNAUTHORIZED' });
  });

  it('should throw UNAUTHORIZED when token is invalid or expired', async () => {
    // The service does a dynamic import of verifyRefreshToken internally.
    // We mock the entire jwt module at static level — the vi.mock hoisting handles it.
    verifyRefreshToken.mockImplementation(() => { throw new Error('jwt expired'); });
    await expect(refreshTokens('bad-token'))
      .rejects.toMatchObject({ errorCode: 'UNAUTHORIZED' });
  });

  it('should throw UNAUTHORIZED when decoded user no longer exists in DB', async () => {
    verifyRefreshToken.mockReturnValue({ id: 'deleted-user' });
    userRepository.findById.mockResolvedValue(null);
    await expect(refreshTokens('valid-token'))
      .rejects.toMatchObject({ errorCode: 'UNAUTHORIZED' });
  });

  it('should return new token pair on successful refresh', async () => {
    const user = { id: 'u1', email: 'u@u.com', status: 'active' };
    verifyRefreshToken.mockReturnValue({ id: 'u1' });
    userRepository.findById.mockResolvedValue(user);

    const result = await refreshTokens('valid-refresh-token');
    expect(result).toHaveProperty('accessToken', 'mock-access-token');
    expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
  });
});
