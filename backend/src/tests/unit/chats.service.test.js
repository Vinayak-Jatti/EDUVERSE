import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Prevent module-load crashes ────────────────────────────────────────────
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
    getConnection: vi.fn().mockResolvedValue({
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      execute: vi.fn().mockResolvedValue([[], {}]),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
    }),
  }
}));

// ─── Mock chats repository ───────────────────────────────────────────────────
vi.mock('../../modules/chats/chats.repository.js', () => ({
  default: {
    createOrFetchRoom: vi.fn(),
    getMyRooms: vi.fn(),
    isParticipant: vi.fn(),
    getRoomMessages: vi.fn(),
    createMessage: vi.fn(),
  }
}));

import chatsRepository from '../../modules/chats/chats.repository.js';
import chatsService from '../../modules/chats/chats.service.js';

// ─── Chats Service: Unit Tests ────────────────────────────────────────────────

describe('Chats Service — createOrFetchRoom', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw BAD_REQUEST when type is "direct" but no targetUserId provided', async () => {
    await expect(chatsService.createOrFetchRoom('user-1', null, 'direct'))
      .rejects.toMatchObject({ errorCode: 'BAD_REQUEST' });
    expect(chatsRepository.createOrFetchRoom).not.toHaveBeenCalled();
  });

  it('should throw BAD_REQUEST when currentUserId equals targetUserId (self-room)', async () => {
    await expect(chatsService.createOrFetchRoom('user-1', 'user-1', 'direct'))
      .rejects.toMatchObject({ errorCode: 'BAD_REQUEST' });
    expect(chatsRepository.createOrFetchRoom).not.toHaveBeenCalled();
  });

  it('should delegate to repository and return roomId on valid direct room request', async () => {
    chatsRepository.createOrFetchRoom.mockResolvedValue('room-uuid-123');
    const result = await chatsService.createOrFetchRoom('user-1', 'user-2', 'direct');
    expect(result).toBe('room-uuid-123');
    expect(chatsRepository.createOrFetchRoom).toHaveBeenCalledWith('user-1', 'user-2', 'direct', null);
  });

  it('should NOT throw when type is not "direct" and no targetUserId is provided (community room)', async () => {
    chatsRepository.createOrFetchRoom.mockResolvedValue('community-room-id');
    const result = await chatsService.createOrFetchRoom('user-1', null, 'community', 'cs101');
    expect(result).toBe('community-room-id');
    expect(chatsRepository.createOrFetchRoom).toHaveBeenCalledWith('user-1', null, 'community', 'cs101');
  });

  it('should default type to "direct" when not specified', async () => {
    chatsRepository.createOrFetchRoom.mockResolvedValue('room-abc');
    await chatsService.createOrFetchRoom('user-1', 'user-2');
    expect(chatsRepository.createOrFetchRoom).toHaveBeenCalledWith('user-1', 'user-2', 'direct', null);
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Chats Service — getMyRooms', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return room list from repository', async () => {
    const mockRooms = [
      { id: 'r1', type: 'direct', other_user_display_name: 'Alice', last_message_content: 'Hey!' },
      { id: 'r2', type: 'direct', other_user_display_name: 'Bob', last_message_content: 'Yo!' },
    ];
    chatsRepository.getMyRooms.mockResolvedValue(mockRooms);
    const result = await chatsService.getMyRooms('user-1');
    expect(result).toEqual(mockRooms);
    expect(chatsRepository.getMyRooms).toHaveBeenCalledWith('user-1');
  });

  it('should return empty array when user has no rooms', async () => {
    chatsRepository.getMyRooms.mockResolvedValue([]);
    const result = await chatsService.getMyRooms('new-user');
    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Chats Service — getRoomMessages', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw FORBIDDEN when requesting user is NOT a room participant (room-hijack prevention)', async () => {
    chatsRepository.isParticipant.mockResolvedValue(false);
    await expect(chatsService.getRoomMessages('intruder-id', 'room-1'))
      .rejects.toMatchObject({ errorCode: 'FORBIDDEN' });
    // Must verify membership BEFORE fetching any data
    expect(chatsRepository.getRoomMessages).not.toHaveBeenCalled();
  });

  it('should return messages when user is a valid participant', async () => {
    const mockMessages = [
      { id: 'm1', content: 'Hello', sender_id: 'user-1', created_at: '2024-01-01T10:00:00Z' },
      { id: 'm2', content: 'Hi there', sender_id: 'user-2', created_at: '2024-01-01T10:01:00Z' },
    ];
    chatsRepository.isParticipant.mockResolvedValue(true);
    chatsRepository.getRoomMessages.mockResolvedValue(mockMessages);

    const result = await chatsService.getRoomMessages('user-1', 'room-1');
    expect(result).toEqual(mockMessages);
    expect(chatsRepository.getRoomMessages).toHaveBeenCalledWith('room-1', 50, 0);
  });

  it('should pass custom limit and offset to repository for pagination', async () => {
    chatsRepository.isParticipant.mockResolvedValue(true);
    chatsRepository.getRoomMessages.mockResolvedValue([]);

    await chatsService.getRoomMessages('user-1', 'room-1', 20, 40);
    expect(chatsRepository.getRoomMessages).toHaveBeenCalledWith('room-1', 20, 40);
  });

  it('should always call isParticipant FIRST before getRoomMessages (security order)', async () => {
    const callOrder = [];
    chatsRepository.isParticipant.mockImplementation(async () => { callOrder.push('isParticipant'); return true; });
    chatsRepository.getRoomMessages.mockImplementation(async () => { callOrder.push('getRoomMessages'); return []; });

    await chatsService.getRoomMessages('user-1', 'room-1');
    expect(callOrder[0]).toBe('isParticipant');
    expect(callOrder[1]).toBe('getRoomMessages');
  });

  it('should return empty array when room exists but has no messages yet', async () => {
    chatsRepository.isParticipant.mockResolvedValue(true);
    chatsRepository.getRoomMessages.mockResolvedValue([]);

    const result = await chatsService.getRoomMessages('user-1', 'room-1');
    expect(result).toEqual([]);
  });
});
