import reportRepository from "./report.repository.js";
import createError from "../../utils/ApiError.js";

/**
 * Submit a report for content
 */
export const submitReport = async ({ reporterId, targetType, targetId, reason, description }) => {
  const validReasons = [
    'spam', 'harassment', 'hate_speech', 'misinformation', 
    'inappropriate_content', 'copyright', 'impersonation', 'other'
  ];

  if (!validReasons.includes(reason)) {
    throw createError("BAD_REQUEST", "Invalid report reason");
  }

  const validTargetTypes = ['user', 'post', 'comment', 'community', 'message', 'insight'];
  if (!validTargetTypes.includes(targetType)) {
    throw createError("BAD_REQUEST", "Invalid target type for report");
  }

  await reportRepository.createReport({
    reporterId,
    targetType,
    targetId,
    reason,
    description
  });

  return { message: "Report submitted successfully" };
};
