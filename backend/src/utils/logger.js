import pino from "pino";
import config from "../config/env.js";

const transport = config.server.isProduction
  ? undefined
  : {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    };

const logger = pino({
  level: config.server.isProduction ? "info" : "debug",
  base: {
    env: config.server.env,
  },
  transport,
});

export default logger;
