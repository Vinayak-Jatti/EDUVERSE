import { v4 as uuidv4 } from "uuid";

/**
 * Stamps every incoming request with a unique ID.
 * Available as req.id throughout the request lifecycle.
 * Also sent back in response headers so clients can trace requests.
 */
const requestId = (req, res, next) => {
  const id = req.headers["x-request-id"] ?? uuidv4();
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
};

export default requestId;
