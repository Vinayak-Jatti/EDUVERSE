import { describe, it, expect, vi, beforeEach } from 'vitest';

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
vi.mock('../../modules/connections/connections.repository.js', () => ({
  default: {
    findConnection: vi.fn(),
    createRequest: vi.fn(),
    acceptRequest: vi.fn(),
    deleteConnection: vi.fn(),
    getConnections: vi.fn(),
    getIncomingRequests: vi.fn(),
    getOutgoingRequests: vi.fn(),
  }
}));

import connectionsRepository from '../../modules/connections/connections.repository.js';
import connectionsService from '../../modules/connections/connections.service.js';

// ─── Connections Service: Unit Tests ─────────────────────────────────────

describe('Connections Service — requestConnection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw BAD_REQUEST when requesterId equals addresseeId', async () => {
    await expect(connectionsService.requestConnection('user-1', 'user-1'))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('should throw CONNECTION_ALREADY_EXISTS when connection is already accepted', async () => {
    connectionsRepository.findConnection.mockResolvedValue({ status: 'accepted' });
    await expect(connectionsService.requestConnection('user-1', 'user-2'))
      .rejects.toMatchObject({ errorCode: 'CONNECTION_ALREADY_EXISTS' });
  });

  it('should throw CONNECTION_PENDING when the current user already sent a request', async () => {
    connectionsRepository.findConnection.mockResolvedValue({ status: 'pending', requester_id: 'user-1' });
    await expect(connectionsService.requestConnection('user-1', 'user-2'))
      .rejects.toMatchObject({ errorCode: 'CONNECTION_PENDING' });
  });

  it('should throw CONNECTION_PENDING when the target user already sent a request to us', async () => {
    connectionsRepository.findConnection.mockResolvedValue({ status: 'pending', requester_id: 'user-2' });
    await expect(connectionsService.requestConnection('user-1', 'user-2'))
      .rejects.toMatchObject({ errorCode: 'CONNECTION_PENDING' });
  });

  it('should throw FORBIDDEN when target has blocked the current user', async () => {
    connectionsRepository.findConnection.mockResolvedValue({ status: 'blocked' });
    await expect(connectionsService.requestConnection('user-1', 'user-2'))
      .rejects.toMatchObject({ errorCode: 'FORBIDDEN' });
  });

  it('should create a new request when no existing connection exists', async () => {
    connectionsRepository.findConnection.mockResolvedValue(null);
    connectionsRepository.createRequest.mockResolvedValue('new-connection-id');

    const result = await connectionsService.requestConnection('user-1', 'user-2');
    expect(connectionsRepository.createRequest).toHaveBeenCalledWith('user-1', 'user-2');
    expect(result).toBe('new-connection-id');
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Connections Service — acceptConnection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw an error when acceptRequest returns falsy (no matching pending request)', async () => {
    connectionsRepository.acceptRequest.mockResolvedValue(false);
    await expect(connectionsService.acceptConnection('user-2', 'req-1'))
      .rejects.toThrow();
  });

  it('should return true when acceptance is successful', async () => {
    connectionsRepository.acceptRequest.mockResolvedValue(true);
    const result = await connectionsService.acceptConnection('user-2', 'req-1');
    expect(result).toBe(true);
    expect(connectionsRepository.acceptRequest).toHaveBeenCalledWith('req-1', 'user-2');
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Connections Service — disconnect', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should call deleteConnection with correct args and return result', async () => {
    connectionsRepository.deleteConnection.mockResolvedValue(1);
    const result = await connectionsService.disconnect('user-1', 'user-2');
    expect(connectionsRepository.deleteConnection).toHaveBeenCalledWith('user-1', 'user-2');
    expect(result).toBe(1);
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Connections Service — getMyNetwork', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return list from repository', async () => {
    const netList = [{ id: 'c1', display_name: 'Alice' }];
    connectionsRepository.getConnections.mockResolvedValue(netList);
    const result = await connectionsService.getMyNetwork('user-1');
    expect(result).toEqual(netList);
  });

  it('should return empty array when user has no connections', async () => {
    connectionsRepository.getConnections.mockResolvedValue([]);
    const result = await connectionsService.getMyNetwork('new-user');
    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Connections Service — getPendingTray', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return both incoming and outgoing requests in parallel', async () => {
    const incoming = [{ id: 'r1', requester_id: 'user-2' }];
    const outgoing = [{ id: 'r2', addressee_id: 'user-3' }];

    connectionsRepository.getIncomingRequests.mockResolvedValue(incoming);
    connectionsRepository.getOutgoingRequests.mockResolvedValue(outgoing);

    const result = await connectionsService.getPendingTray('user-1');
    expect(result.incoming).toEqual(incoming);
    expect(result.outgoing).toEqual(outgoing);
    expect(connectionsRepository.getIncomingRequests).toHaveBeenCalledWith('user-1');
    expect(connectionsRepository.getOutgoingRequests).toHaveBeenCalledWith('user-1');
  });

  it('should return empty tray when there are no pending requests', async () => {
    connectionsRepository.getIncomingRequests.mockResolvedValue([]);
    connectionsRepository.getOutgoingRequests.mockResolvedValue([]);

    const result = await connectionsService.getPendingTray('user-1');
    expect(result.incoming).toEqual([]);
    expect(result.outgoing).toEqual([]);
  });
});
