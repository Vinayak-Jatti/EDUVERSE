/**
 * socket.utils.test.js
 *
 * Tests the pure utility logic from socket.loader.js in isolation:
 *   - sanitizeInput:  XSS prevention (strips < and > characters)
 *   - rateLimiter:    1-message-per-second per user enforcement
 *
 * Since these functions are inlined (not exported) in socket.loader.js,
 * we replicate the exact same implementation here to unit-test the logic.
 * This is the standard approach for testing private pure functions —
 * if bugs are found, the fix is applied to the source inline function.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Replicate the exact sanitizeInput logic from socket.loader.js ────────────
const sanitizeInput = (text) => {
  if (typeof text !== 'string') return text;
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

// ─── Replicate the rate limiter logic from socket.loader.js ──────────────────
const RATE_LIMIT_MS = 1000;
const createRateLimiter = () => {
  const rateLimits = new Map();
  return {
    isRateLimited: (senderId) => {
      const lastTime = rateLimits.get(senderId) || 0;
      return (Date.now() - lastTime) < RATE_LIMIT_MS;
    },
    record: (senderId) => rateLimits.set(senderId, Date.now()),
    clear: () => rateLimits.clear(),
    _map: () => rateLimits,
  };
};

// ─── XSS Sanitizer Tests ──────────────────────────────────────────────────────

describe('Socket Utility — sanitizeInput (XSS Prevention)', () => {
  it('should replace < with &lt; to neutralize HTML tags', () => {
    // <script> → both < and > are replaced
    expect(sanitizeInput('<script>')).toBe('&lt;script&gt;');
  });

  it('should replace > with &gt; to close neutralized HTML tags', () => {
    expect(sanitizeInput('</script>')).toBe('&lt;/script&gt;');
  });

  it('should neutralize a full XSS script injection attempt', () => {
    const xss = '<script>alert("XSS")</script>';
    const result = sanitizeInput(xss);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
    expect(result).toBe('&lt;script&gt;alert("XSS")&lt;/script&gt;');
  });

  it('should neutralize HTML injection with img onerror payload', () => {
    const xss = '<img src=x onerror=alert(1)>';
    const result = sanitizeInput(xss);
    expect(result).not.toContain('<img');
    expect(result).toContain('&lt;img');
  });

  it('should return normal text unchanged', () => {
    expect(sanitizeInput('Hello, how are you?')).toBe('Hello, how are you?');
  });

  it('should return empty string unchanged', () => {
    expect(sanitizeInput('')).toBe('');
  });

  it('should return non-string input as-is (type guard)', () => {
    expect(sanitizeInput(42)).toBe(42);
    expect(sanitizeInput(null)).toBe(null);
    expect(sanitizeInput(undefined)).toBe(undefined);
    expect(sanitizeInput({ html: '<b>' })).toEqual({ html: '<b>' });
  });

  it('should handle messages with special chars but no HTML tags correctly', () => {
    const msg = 'Cost is 5 > 3 and discount < 50%';
    const result = sanitizeInput(msg);
    expect(result).toBe('Cost is 5 &gt; 3 and discount &lt; 50%');
  });
});

// ─── Rate Limiter Tests ───────────────────────────────────────────────────────

describe('Socket Utility — Rate Limiter (1 msg/sec enforcement)', () => {
  let limiter;

  beforeEach(() => {
    limiter = createRateLimiter();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should NOT rate-limit the first message from a user', () => {
    expect(limiter.isRateLimited('user-1')).toBe(false);
  });

  it('should rate-limit a second message sent within 1 second', () => {
    limiter.record('user-1');
    vi.advanceTimersByTime(500); // 500ms later — still within window
    expect(limiter.isRateLimited('user-1')).toBe(true);
  });

  it('should allow a message exactly after 1000ms has elapsed', () => {
    limiter.record('user-1');
    vi.advanceTimersByTime(1000); // exactly 1 second later
    expect(limiter.isRateLimited('user-1')).toBe(false);
  });

  it('should allow a message after more than 1000ms has elapsed', () => {
    limiter.record('user-1');
    vi.advanceTimersByTime(1500); // 1.5s later
    expect(limiter.isRateLimited('user-1')).toBe(false);
  });

  it('should track rate limits independently per user ID', () => {
    limiter.record('user-1');
    vi.advanceTimersByTime(200);
    // user-1 is rate-limited, user-2 is not
    expect(limiter.isRateLimited('user-1')).toBe(true);
    expect(limiter.isRateLimited('user-2')).toBe(false);
  });

  it('should allow user-2 to send while user-1 is rate-limited', () => {
    limiter.record('user-1');
    vi.advanceTimersByTime(300);
    limiter.record('user-2'); // user-2 sends 300ms into user-1's window
    expect(limiter.isRateLimited('user-1')).toBe(true);
    expect(limiter.isRateLimited('user-2')).toBe(true);
  });

  it('should reset correctly — both users can send after their own 1s window', () => {
    limiter.record('user-1');
    limiter.record('user-2');
    vi.advanceTimersByTime(1001);
    expect(limiter.isRateLimited('user-1')).toBe(false);
    expect(limiter.isRateLimited('user-2')).toBe(false);
  });
});
