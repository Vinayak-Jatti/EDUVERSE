import { vi } from 'vitest';

// Global mock for Cloudinary to prevent real network calls in integration tests
vi.mock('../config/cloudinary.js', () => ({
  default: {
    uploader: {
      upload: vi.fn().mockResolvedValue({ secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' }),
      destroy: vi.fn().mockResolvedValue({ result: 'ok' }),
    },
    config: vi.fn(),
  },
}));

// Mock Multer-Storage-Cloudinary if needed
vi.mock('multer-storage-cloudinary', () => {
  return {
    CloudinaryStorage: vi.fn().mockImplementation(() => ({
      _handleFile: (req, file, cb) => {
        cb(null, { path: 'https://mock-cloudinary.com/test.mp4', size: 1234 });
      },
      _removeFile: (req, file, cb) => {
        cb(null);
      },
    })),
  };
});
