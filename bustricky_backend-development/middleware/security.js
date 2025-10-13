const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const { userConfig } = require("../config/userConfig");

const securityHeaders = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https:", "wss:"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        workerSrc: ["'self'"],
      },
    },

    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },

    frameguard: { action: "deny" },

    noSniff: true,

    xssFilter: true,

    referrerPolicy: { policy: "same-origin" },
  });
};

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:3000", "http://localhost:5173"];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
  ],
  exposedHeaders: ["X-Total-Count", "X-Page-Count"],
  maxAge: 86400,
};

const sanitizeRequest = [
  mongoSanitize(),

  xss(),

  hpp({
    whitelist: [
      "sort",
      "fields",
      "page",
      "limit",
      "role",
      "isActive",
      "isVerified",
    ],
  }),
];

const requestSizeLimit = (limit = "10mb") => {
  return (req, res, next) => {
    req.setTimeout(30000);

    const contentLength = req.get("Content-Length");
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength);
      const limitInBytes =
        parseFloat(limit) * (limit.includes("mb") ? 1024 * 1024 : 1024);

      if (sizeInBytes > limitInBytes) {
        return res.status(413).json({
          success: false,
          message: `Request size too large. Maximum allowed size is ${limit}`,
        });
      }
    }

    next();
  };
};

const ipWhitelist = (req, res, next) => {
  if (!userConfig.security.ipWhitelist.length) {
    return next();
  }

  const clientIP =
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  if (!userConfig.security.ipWhitelist.includes(clientIP)) {
    return res.status(403).json({
      success: false,
      message: "Access denied from this IP address",
    });
  }
  next();
};

const apiSecurityHeaders = (req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.removeHeader("Server");

  res.setHeader("X-API-Version", process.env.API_VERSION || "1.0.0");
  res.setHeader("X-Request-ID", req.id || generateRequestId());
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  next();
};

const generateRequestId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const requestId = (req, res, next) => {
  req.id = req.headers["x-request-id"] || generateRequestId();
  res.setHeader("X-Request-ID", req.id);
  next();
};

const securityLogger = (req, res, next) => {
  const securityEvents = [
    "/api/v1/users/login",
    "/api/v1/users/register",
    "/api/v1/users/forgot-password",
    "/api/v1/users/reset-password",
  ];

  if (securityEvents.some((event) => req.path.includes(event))) {
    console.log(`🔐 Security Event: ${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  }

  next();
};

const suspiciousActivityDetection = (req, res, next) => {
  const suspiciousPatterns = [
    /(<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>)/gi, // XSS patterns
    /(union\s+select|drop\s+table|insert\s+into)/gi, // SQL injection patterns
    /(\.\.\/|\.\.\\)/g, // Directory traversal
    /(\$where|\$ne|\$gt|\$lt)/gi, // MongoDB injection
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
    path: req.path,
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      console.warn(`Suspicious activity detected: ${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        pattern: pattern.source,
        requestId: req.id,
      });

      return res.status(400).json({
        success: false,
        message: "Invalid request format",
      });
    }
  }

  next();
};

const fileUploadSecurity = (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  const allowedTypes = userConfig.profile.profilePicture.allowedTypes;
  const maxSize = userConfig.profile.profilePicture.maxSize;

  if (req.file) {
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only images are allowed.",
      });
    }

    // Check file size
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File size too large. Maximum size is ${
          maxSize / 1024 / 1024
        }MB`,
      });
    }

    const maliciousSignatures = [
      Buffer.from([0xff, 0xd8, 0xff]),
      Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    ];
  }
  next();
};

const requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    res.setTimeout(timeout, () => {
      res.status(408).json({
        success: false,
        message: "Request timeout",
      });
    });
    next();
  };
};

const developmentBypass = (req, res, next) => {
  if (process.env.NODE_ENV === "development" && req.query.bypass === "dev") {
    req.bypassSecurity = true;
  }
  next();
};

module.exports = {
  securityHeaders,
  corsOptions,
  sanitizeRequest,
  ipWhitelist,
  requestSizeLimit,
  apiSecurityHeaders,
  requestId,
  securityLogger,
  suspiciousActivityDetection,
  fileUploadSecurity,
  requestTimeout,
  developmentBypass,
  compression: compression(),
};
