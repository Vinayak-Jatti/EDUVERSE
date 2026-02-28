import morgan from "morgan";
import config from "./config.js";

// Development: colorful, detailed output
// Production : minimal — only log what matters
const morganLogger = morgan(config.server.isProduction ? "combined" : "dev");

export default morganLogger;
