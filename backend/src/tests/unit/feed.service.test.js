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
    getConnection: vi.fn().mockResolvedValue({ beginTransaction: vi.fn(), execute: vi.fn().mockResolvedValue([[], {}]), commit: vi.fn(), rollback: vi.fn(), release: vi.fn() }),
  }
}));

// ─── Mock feed repository ────────────────────────────────────────────────────
vi.mock('../../modules/feed/feed.repository.js', () => ({
  default: {
    getFeed: vi.fn(),
    getUserPosts: vi.fn(),
    getMediaForPosts: vi.fn(),
    create: vi.fn(),
    addMedia: vi.fn(),
    findById: vi.fn(),
    delete: vi.fn(),
  }
}));

import feedRepository from '../../modules/feed/feed.repository.js';
import {
  getHomeFeed,
  getUserPosts,
  createPost,
  deletePost,
} from '../../modules/feed/feed.service.js';

// ─── Feed Service: Unit Tests ─────────────────────────────────────────────

describe('Feed Service — getHomeFeed', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return empty array when repository returns no posts', async () => {
    feedRepository.getFeed.mockResolvedValue([]);
    const result = await getHomeFeed({ currentUserId: 'u1' });
    expect(result).toEqual([]);
    expect(feedRepository.getMediaForPosts).not.toHaveBeenCalled();
  });

  it('should fetch media for all returned posts in a single batch call', async () => {
    const posts = [
      { id: 'p1', body: 'Post 1', has_liked: 0 },
      { id: 'p2', body: 'Post 2', has_liked: 1 },
    ];
    feedRepository.getFeed.mockResolvedValue(posts);
    feedRepository.getMediaForPosts.mockResolvedValue([]);

    await getHomeFeed({ currentUserId: 'u1' });

    expect(feedRepository.getMediaForPosts).toHaveBeenCalledOnce();
    expect(feedRepository.getMediaForPosts).toHaveBeenCalledWith(['p1', 'p2']);
  });

  it('should correctly group media items by their post_id', async () => {
    const posts = [{ id: 'p1', has_liked: 0 }, { id: 'p2', has_liked: 0 }];
    const media = [
      { post_id: 'p1', url: 'img1.jpg', media_type: 'image' },
      { post_id: 'p1', url: 'img2.jpg', media_type: 'image' },
      { post_id: 'p2', url: 'vid.mp4', media_type: 'video' },
    ];
    feedRepository.getFeed.mockResolvedValue(posts);
    feedRepository.getMediaForPosts.mockResolvedValue(media);

    const result = await getHomeFeed({ currentUserId: 'u1' });

    expect(result[0].media).toHaveLength(2);
    expect(result[1].media).toHaveLength(1);
  });

  it('should coerce has_liked to boolean (0 → false, 1 → true)', async () => {
    const posts = [
      { id: 'p1', has_liked: 0 },
      { id: 'p2', has_liked: 1 },
    ];
    feedRepository.getFeed.mockResolvedValue(posts);
    feedRepository.getMediaForPosts.mockResolvedValue([]);

    const result = await getHomeFeed({ currentUserId: 'u1' });

    expect(result[0].has_liked).toBe(false);
    expect(result[1].has_liked).toBe(true);
  });

  it('should assign empty media array to posts with no media', async () => {
    feedRepository.getFeed.mockResolvedValue([{ id: 'p1', has_liked: 0 }]);
    feedRepository.getMediaForPosts.mockResolvedValue([]); // no media at all

    const result = await getHomeFeed({ currentUserId: 'u1' });
    expect(result[0].media).toEqual([]);
  });

  it('should respect custom limit and offset parameters', async () => {
    feedRepository.getFeed.mockResolvedValue([]);
    await getHomeFeed({ currentUserId: 'u1', limit: 10, offset: 20 });
    expect(feedRepository.getFeed).toHaveBeenCalledWith({ currentUserId: 'u1', limit: 10, offset: 20 });
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Feed Service — getUserPosts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return empty array when user has no posts', async () => {
    feedRepository.getUserPosts.mockResolvedValue([]);
    const result = await getUserPosts({ targetUserId: 'u2', currentUserId: 'u1' });
    expect(result).toEqual([]);
    expect(feedRepository.getMediaForPosts).not.toHaveBeenCalled();
  });

  it('should batch-fetch media and group correctly per post', async () => {
    const posts = [{ id: 'p1', has_liked: 0 }];
    const media = [{ post_id: 'p1', url: 'img.jpg', media_type: 'image' }];
    feedRepository.getUserPosts.mockResolvedValue(posts);
    feedRepository.getMediaForPosts.mockResolvedValue(media);

    const result = await getUserPosts({ targetUserId: 'u2', currentUserId: 'u1' });
    expect(result[0].media).toHaveLength(1);
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Feed Service — createPost', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create a text post with no media and return the saved post', async () => {
    const savedPost = { id: 'p1', post_type: 'text', body: 'Hello', visibility: 'public' };
    feedRepository.create.mockResolvedValue(true);
    feedRepository.findById.mockResolvedValue(savedPost);

    const result = await createPost('u1', { body: 'Hello', visibility: 'public' });

    expect(feedRepository.create).toHaveBeenCalledOnce();
    const createArgs = feedRepository.create.mock.calls[0][0];
    expect(createArgs.post_type).toBe('text');
    expect(createArgs.body).toBe('Hello');
    expect(createArgs.visibility).toBe('public');
    expect(result).toEqual(savedPost);
  });

  it('should set post_type from the first media element media_type', async () => {
    feedRepository.create.mockResolvedValue(true);
    feedRepository.addMedia.mockResolvedValue(true);
    feedRepository.findById.mockResolvedValue({ id: 'p1', post_type: 'image' });

    await createPost('u1', {
      body: 'Check this',
      visibility: 'public',
      media: [{ media_type: 'image', url: 'img.jpg', mime_type: 'image/jpeg' }]
    });

    const createArgs = feedRepository.create.mock.calls[0][0];
    expect(createArgs.post_type).toBe('image');
  });

  it('should detect PDF link_url and add it as a document media item', async () => {
    feedRepository.create.mockResolvedValue(true);
    feedRepository.addMedia.mockResolvedValue(true);
    feedRepository.findById.mockResolvedValue({ id: 'p1' });

    await createPost('u1', {
      body: 'Resource',
      visibility: 'public',
      link_url: 'https://example.com/notes.pdf'
    });

    expect(feedRepository.addMedia).toHaveBeenCalledOnce();
    const mediaArgs = feedRepository.addMedia.mock.calls[0][0];
    expect(mediaArgs.media_type).toBe('document');
    expect(mediaArgs.mime_type).toBe('application/pdf');
  });

  it('should treat non-PDF link_url as image media type', async () => {
    feedRepository.create.mockResolvedValue(true);
    feedRepository.addMedia.mockResolvedValue(true);
    feedRepository.findById.mockResolvedValue({ id: 'p1' });

    await createPost('u1', {
      body: 'Link',
      visibility: 'public',
      link_url: 'https://example.com/resource'
    });

    const mediaArgs = feedRepository.addMedia.mock.calls[0][0];
    expect(mediaArgs.media_type).toBe('image');
    expect(mediaArgs.mime_type).toBe('image/jpeg');
  });

  it('should save each media item with correct display_order index', async () => {
    feedRepository.create.mockResolvedValue(true);
    feedRepository.addMedia.mockResolvedValue(true);
    feedRepository.findById.mockResolvedValue({ id: 'p1' });

    const mediaItems = [
      { media_type: 'image', url: 'a.jpg', mime_type: 'image/jpeg' },
      { media_type: 'image', url: 'b.jpg', mime_type: 'image/jpeg' },
    ];
    await createPost('u1', { body: 'Gallery', visibility: 'public', media: mediaItems });

    expect(feedRepository.addMedia).toHaveBeenCalledTimes(2);
    expect(feedRepository.addMedia.mock.calls[0][0].display_order).toBe(0);
    expect(feedRepository.addMedia.mock.calls[1][0].display_order).toBe(1);
  });

  it('should default visibility to "public" when not provided', async () => {
    feedRepository.create.mockResolvedValue(true);
    feedRepository.findById.mockResolvedValue({ id: 'p1' });

    await createPost('u1', { body: 'No visibility set' });

    const createArgs = feedRepository.create.mock.calls[0][0];
    expect(createArgs.visibility).toBe('public');
  });

  it('should store link_url as null in core post record (unified media model)', async () => {
    feedRepository.create.mockResolvedValue(true);
    feedRepository.addMedia.mockResolvedValue(true);
    feedRepository.findById.mockResolvedValue({ id: 'p1' });

    await createPost('u1', { body: 'With link', link_url: 'https://example.com/file.pdf' });

    const createArgs = feedRepository.create.mock.calls[0][0];
    expect(createArgs.link_url).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────────────────

describe('Feed Service — deletePost', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw NOT_FOUND when post does not exist or user is not the owner', async () => {
    feedRepository.delete.mockResolvedValue({ affectedRows: 0 });
    await expect(deletePost('u1', 'p-nonexistent'))
      .rejects.toMatchObject({ errorCode: 'NOT_FOUND' });
  });

  it('should return success message when post is deleted', async () => {
    feedRepository.delete.mockResolvedValue({ affectedRows: 1 });
    const result = await deletePost('u1', 'p1');
    expect(result.message).toMatch(/deleted/i);
    expect(feedRepository.delete).toHaveBeenCalledWith('p1', 'u1');
  });
});
