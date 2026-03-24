import morgan from "morgan";
import config from "../config/env.js";

// Development: colorful, detailed output
// Production : minimal — only log what matters
const httpLogger = morgan(config.server.isProduction ? "combined" : "dev");

export default httpLogger;
