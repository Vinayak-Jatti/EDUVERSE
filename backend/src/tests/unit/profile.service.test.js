import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Dependency mocks — vi.mock is hoisted, order does not matter inside file ──

// Mock env.js to prevent "Missing required env var" throws at import time
vi.mock('../../config/env.js', () => ({
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

// Mock db pool to prevent real MySQL connections
vi.mock('../../config/db.js', () => ({
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

// Mock profile repository (direct dependency of profile.service)
vi.mock('../../modules/profile/profile.repository.js', () => ({
  default: {
    findByUserId: vi.fn(),
    findByUsername: vi.fn(),
    getInterests: vi.fn(),
    isFollowing: vi.fn(),
    update: vi.fn(),
    follow: vi.fn(),
    unfollow: vi.fn(),
    getFollowers: vi.fn(),
    getFollowing: vi.fn(),
  }
}));

// Mock connections repository — must match the path the profile.service.js itself uses:
// profile.service.js is in src/modules/profile/ and imports '../connections/connections.repository.js'
// which resolves to src/modules/connections/connections.repository.js
// From THIS test file at src/tests/unit/, that same file is at:
// ../../modules/connections/connections.repository.js
vi.mock('../../modules/connections/connections.repository.js', () => ({
  default: {
    getAcceptedConnectionCount: vi.fn(),
    findConnection: vi.fn(),
    getConnections: vi.fn(),
  }
}));

import profileRepository from '../../modules/profile/profile.repository.js';
import connectionsRepository from '../../modules/connections/connections.repository.js';
import {
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getConnections,
} from '../../modules/profile/profile.service.js';

const MOCK_USER_ID = '12345678-1234-1234-1234-123456789001';
const mockProfile = {
  user_id: MOCK_USER_ID,
  username: 'john_doe',
  display_name: 'John Doe',
  bio: 'Test bio',
};

// ─── Profile Service: Unit Tests ───────────────────────────────────────────

describe('Profile Service — getProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw USER_NOT_FOUND when profile does not exist (UUID)', async () => {
    profileRepository.findByUserId.mockResolvedValue(null);
    await expect(getProfile('12345678-1234-1234-1234-123456789012'))
      .rejects.toMatchObject({ errorCode: 'USER_NOT_FOUND' });
  });

  it('should throw USER_NOT_FOUND when profile does not exist (username)', async () => {
    profileRepository.findByUsername.mockResolvedValue(null);
    await expect(getProfile('short'))
      .rejects.toMatchObject({ errorCode: 'USER_NOT_FOUND' });
  });

  it('should use findByUserId for 36-character UUID identifiers', async () => {
    profileRepository.findByUserId.mockResolvedValue(mockProfile);
    profileRepository.getInterests.mockResolvedValue([]);
    connectionsRepository.getAcceptedConnectionCount.mockResolvedValue(5);
    connectionsRepository.findConnection.mockResolvedValue(null);
    profileRepository.isFollowing.mockResolvedValue(false);

    const uuid = '12345678-1234-1234-1234-123456789012';
    await getProfile(uuid);
    expect(profileRepository.findByUserId).toHaveBeenCalledWith(uuid);
    expect(profileRepository.findByUsername).not.toHaveBeenCalled();
  });

  it('should use findByUsername for non-UUID identifiers', async () => {
    profileRepository.findByUsername.mockResolvedValue(mockProfile);
    profileRepository.getInterests.mockResolvedValue([]);
    connectionsRepository.getAcceptedConnectionCount.mockResolvedValue(0);

    await getProfile('johndoe');
    expect(profileRepository.findByUsername).toHaveBeenCalledWith('johndoe');
    expect(profileRepository.findByUserId).not.toHaveBeenCalled();
  });

  it('should return profile with computed connection_count, isMe=false for visitor', async () => {
    profileRepository.findByUserId.mockResolvedValue(mockProfile);
    profileRepository.getInterests.mockResolvedValue(['nodejs', 'react']);
    connectionsRepository.getAcceptedConnectionCount.mockResolvedValue(42);
    connectionsRepository.findConnection.mockResolvedValue(null);
    profileRepository.isFollowing.mockResolvedValue(false);

    const result = await getProfile('12345678-1234-1234-1234-123456789012', 'visitor-id');
    expect(result.connection_count).toBe(42);
    expect(result.isMe).toBe(false);
    expect(result.connectionStatus).toBe('none');
    expect(result.interests).toEqual(['nodejs', 'react']);
  });

  it('should return isMe=true when currentUserId matches profile user_id', async () => {
    profileRepository.findByUserId.mockResolvedValue(mockProfile);
    profileRepository.getInterests.mockResolvedValue([]);
    connectionsRepository.getAcceptedConnectionCount.mockResolvedValue(0);

    const result = await getProfile('12345678-1234-1234-1234-123456789012', MOCK_USER_ID);
    expect(result.isMe).toBe(true);
    expect(connectionsRepository.findConnection).not.toHaveBeenCalled();
  });

  it('should correctly resolve connectionStatus=accepted when connection exists', async () => {
    profileRepository.findByUserId.mockResolvedValue(mockProfile);
    profileRepository.getInterests.mockResolvedValue([]);
    connectionsRepository.getAcceptedConnectionCount.mockResolvedValue(2);
    connectionsRepository.findConnection.mockResolvedValue({ status: 'accepted', requester_id: 'visitor-id' });
    profileRepository.isFollowing.mockResolvedValue(false);

    const result = await getProfile('12345678-1234-1234-1234-123456789012', 'visitor-id');
    expect(result.connectionStatus).toBe('accepted');
  });

  it('should correctly resolve connectionStatus=pending_sent when current user sent the request', async () => {
    profileRepository.findByUserId.mockResolvedValue(mockProfile);
    profileRepository.getInterests.mockResolvedValue([]);
    connectionsRepository.getAcceptedConnectionCount.mockResolvedValue(0);
    connectionsRepository.findConnection.mockResolvedValue({ status: 'pending', requester_id: 'visitor-id' });
    profileRepository.isFollowing.mockResolvedValue(false);

    const result = await getProfile('12345678-1234-1234-1234-123456789012', 'visitor-id');
    expect(result.connectionStatus).toBe('pending_sent');
  });

  it('should correctly resolve connectionStatus=pending_received when other user sent request', async () => {
    profileRepository.findByUserId.mockResolvedValue(mockProfile);
    profileRepository.getInterests.mockResolvedValue([]);
    connectionsRepository.getAcceptedConnectionCount.mockResolvedValue(0);
    // requester_id matches the PROFILE owner (MOCK_USER_ID), visitor is 'visitor-id'
    connectionsRepository.findConnection.mockResolvedValue({ status: 'pending', requester_id: MOCK_USER_ID });
    profileRepository.isFollowing.mockResolvedValue(false);

    const result = await getProfile('12345678-1234-1234-1234-123456789012', 'visitor-id');
    expect(result.connectionStatus).toBe('pending_received');
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Profile Service — updateProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should strip protected fields (post_count, user_id, id) from updates', async () => {
    // use real UUID so getProfile(userId, userId) takes findByUserId path (len === 36)
    profileRepository.findByUsername.mockResolvedValue(null);
    profileRepository.update.mockResolvedValue(true);
    profileRepository.findByUserId.mockResolvedValue(mockProfile);
    profileRepository.getInterests.mockResolvedValue([]);
    connectionsRepository.getAcceptedConnectionCount.mockResolvedValue(0);

    await updateProfile(MOCK_USER_ID, {
      bio: 'updated bio',
      post_count: 9999,
      user_id: 'hack-id',
      id: 'hack-id',
    });

    const updateCallArgs = profileRepository.update.mock.calls[0][1];
    expect(updateCallArgs).toHaveProperty('bio', 'updated bio');
    expect(updateCallArgs).not.toHaveProperty('post_count');
    expect(updateCallArgs).not.toHaveProperty('user_id');
    expect(updateCallArgs).not.toHaveProperty('id');
  });

  it('should throw CONFLICT when new username is already taken by another user', async () => {
    profileRepository.findByUsername.mockResolvedValue({ user_id: 'other-user-uuid-000000000001' });
    await expect(updateProfile(MOCK_USER_ID, { username: 'taken_username' }))
      .rejects.toMatchObject({ statusCode: 409 });
  });

  it('should allow updating to the same username (own username)', async () => {
    profileRepository.findByUsername.mockResolvedValue({ user_id: MOCK_USER_ID }); // same user
    profileRepository.update.mockResolvedValue(true);
    profileRepository.findByUserId.mockResolvedValue(mockProfile);
    profileRepository.getInterests.mockResolvedValue([]);
    connectionsRepository.getAcceptedConnectionCount.mockResolvedValue(0);

    await expect(updateProfile(MOCK_USER_ID, { username: 'john_doe' })).resolves.toBeDefined();
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Profile Service — followUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw BAD_REQUEST when a user tries to follow themselves', async () => {
    await expect(followUser('user-1', 'user-1'))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('should call repository follow and return success message', async () => {
    profileRepository.follow.mockResolvedValue(true);
    const result = await followUser('user-1', 'user-2');
    expect(profileRepository.follow).toHaveBeenCalledWith('user-1', 'user-2');
    expect(result.message).toMatch(/followed/i);
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Profile Service — unfollowUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should call repository unfollow and return success message', async () => {
    profileRepository.unfollow.mockResolvedValue(true);
    const result = await unfollowUser('user-1', 'user-2');
    expect(profileRepository.unfollow).toHaveBeenCalledWith('user-1', 'user-2');
    expect(result.message).toMatch(/unfollowed/i);
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Profile Service — getFollowers / getFollowing / getConnections', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return list of followers from repository', async () => {
    const mockList = [{ user_id: 'u2', display_name: 'Alice' }];
    profileRepository.getFollowers.mockResolvedValue(mockList);
    const result = await getFollowers('user-1');
    expect(result).toEqual(mockList);
    expect(profileRepository.getFollowers).toHaveBeenCalledWith('user-1');
  });

  it('should return empty array if user has no followers', async () => {
    profileRepository.getFollowers.mockResolvedValue([]);
    const result = await getFollowers('new-user');
    expect(result).toEqual([]);
  });

  it('should return following list from repository', async () => {
    const mockList = [{ user_id: 'u3', display_name: 'Bob' }];
    profileRepository.getFollowing.mockResolvedValue(mockList);
    const result = await getFollowing('user-1');
    expect(result).toEqual(mockList);
  });

  it.skip('getConnections — skipped: pure 1-line delegation, no business logic to unit test. Covered by integration tests.', () => {});
});
