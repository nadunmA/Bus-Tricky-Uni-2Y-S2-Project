const winston = require("winston");
const path = require("path");
const fs = require("fs");

const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    const metaStr = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";
    if (metaStr) {
      log += `\n${metaStr}`;
    }

    return log;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: fileFormat,
  defaultMeta: {
    service: "bus-tracking-system",
    environment: process.env.NODE_ENV || "development",
  },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true,
    }),

    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true,
    }),

    new winston.transports.File({
      filename: path.join(logsDir, "auth.log"),
      level: "info",
      maxsize: 5242880,
      maxFiles: 3,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format((info) => {
          if (
            info.type === "auth" ||
            info.message.includes("login") ||
            info.message.includes("register") ||
            info.message.includes("auth")
          ) {
            return info;
          }
          return false;
        })()
      ),
    }),
  ],

  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
    }),
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

const customLogger = {
  info: (message, meta = {}) => logger.info(message, meta),
  error: (message, meta = {}) => logger.error(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),

  authInfo: (message, userId = null, meta = {}) => {
    logger.info(message, {
      type: "auth",
      userId,
      ...meta,
    });
  },

  authError: (message, userId = null, meta = {}) => {
    logger.error(message, {
      type: "auth",
      userId,
      ...meta,
    });
  },

  busInfo: (message, busId = null, meta = {}) => {
    logger.info(message, {
      type: "bus_tracking",
      busId,
      ...meta,
    });
  },

  busError: (message, busId = null, meta = {}) => {
    logger.error(message, {
      type: "bus_tracking",
      busId,
      ...meta,
    });
  },

  routeInfo: (message, routeId = null, meta = {}) => {
    logger.info(message, {
      type: "route",
      routeId,
      ...meta,
    });
  },

  dbInfo: (message, operation = null, meta = {}) => {
    logger.info(message, {
      type: "database",
      operation,
      ...meta,
    });
  },

  dbError: (message, operation = null, meta = {}) => {
    logger.error(message, {
      type: "database",
      operation,
      ...meta,
    });
  },

  apiRequest: (req, res, responseTime) => {
    const { method, url, ip, headers } = req;
    const { statusCode } = res;

    logger.info("API Request", {
      type: "api_request",
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      ip,
      userAgent: headers["user-agent"],
      userId: req.user?.id || null,
    });
  },

  systemInfo: (message, meta = {}) => {
    logger.info(message, {
      type: "system",
      ...meta,
    });
  },

  systemError: (message, meta = {}) => {
    logger.error(message, {
      type: "system",
      ...meta,
    });
  },
};

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const responseTime = Date.now() - start;
    customLogger.apiRequest(req, res, responseTime);
  });

  next();
};

module.exports = {
  logger: customLogger,
  requestLogger,
  winston: logger,
};
