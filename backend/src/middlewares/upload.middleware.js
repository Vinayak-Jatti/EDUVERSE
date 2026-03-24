import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import createError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

// ─── Shared Storage Configuration ─────────────────────
const createStorage = (folderName, allowedFormats, resourceType = "image") => {
  return new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `eduverse/${folderName}`,
      allowed_formats: allowedFormats,
      resource_type: resourceType,
      // transformations can be added here if needed
    },
  });
};

// ─── File Filters ─────────────────────────────────────
const fileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      logger.warn(`Signal Rejection: ${file.mimetype} is out of protocol.`);
      cb(createError("BAD_REQUEST", `Manual Override Required: ${file.mimetype} is not a valid curriculum signal.`));
    }
  };
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
 * Specialized Mastery Stream Uploader (Independent Storage)
 * Hard Limit: 10MB (10485760 bytes) - Cloudinary Free Tier limit
 */
export const masteryStreamUploader = multer({
  storage: createStorage("mastery", ["mp4", "webm", "mov"], "auto"),
  fileFilter: fileFilter(/mp4|webm|quicktime|video\/x-matroska/), 
  limits: {
    fileSize: 10485760, // 10MB Hard Literal
  },
});

export const uploadVideo = masteryStreamUploader; // For Backward Compatibility 

/**
 * Career/Contact// Special uploader for Resumes/CVs (Memory Storage for buffering attachments)
 */
export const uploadResume = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter(/pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document/),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
