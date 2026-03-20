import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import createError from "../utils/ApiError.js";

// ─── Shared Storage Configuration ─────────────────────
const createStorage = (folderName, allowedFormats) => {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `eduverse/${folderName}`,
      allowed_formats: allowedFormats,
      // transformations can be added here if needed
    },
  });
};

// ─── File Filters ─────────────────────────────────────
const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createError("BAD_REQUEST", `Invalid file type. Only ${allowedTypes} are allowed.`), false);
  }
};

// ─── Exported Uploaders ───────────────────────────────

/**
 * Profile Uploader (Avatar, Cover)
 * Max Size: 2MB limit
 */
export const uploadProfile = multer({
  storage: createStorage("profiles", ["jpg", "jpeg", "png", "webp"]),
  fileFilter: fileFilter(/jpeg|jpg|png|webp/),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

/**
 * Standard Image Uploader (Posts, etc.)
 * Max Size: 5MB limit
 */
export const uploadImage = multer({
  storage: createStorage("images", ["jpg", "jpeg", "png", "webp", "gif"]),
  fileFilter: fileFilter(/jpeg|jpg|png|webp|gif/),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB (Lowered for Cloudinary economy)
  },
});

/**
 * Video Uploader (Posts, Lessons)
 * Max Size: 10MB limit
 */
export const uploadVideo = multer({
  storage: createStorage("videos", ["mp4", "webm", "mov"]),
  fileFilter: fileFilter(/mp4|webm|quicktime/),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB (Lowered for Cloudinary economy)
  },
});
