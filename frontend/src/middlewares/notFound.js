import { sendError } from "../utils/apiResponse.js";

const notFound = (req, res) => {
  return sendError(res, req, {
    errorCode: "NOT_FOUND",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export default notFound;
