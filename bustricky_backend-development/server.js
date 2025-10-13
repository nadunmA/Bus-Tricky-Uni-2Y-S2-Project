// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");
const fs = require("fs");

// ===== Load env variables =====
dotenv.config();

// ===== Import Routes =====
const routeRoutes = require("./routes/routeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const busRoutes = require("./routes/busRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const locationRoutes = require("./routes/busLocationRoutes");
const contactUsRoute = require("./routes/ContactUsRoute");

const app = express();

// ===== Create upload directories =====
const uploadsDir = path.join(__dirname, "uploads");
const profilesDir = path.join(uploadsDir, "profiles");
const documentsDir = path.join(uploadsDir, "documents");
const generalDir = path.join(uploadsDir, "general");

[uploadsDir, profilesDir, documentsDir, generalDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ===== Security Middleware =====
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        mediaSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);

// ===== Compression =====
app.use(compression());

// ===== CORS Configuration =====
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ["http://localhost:3000", "http://localhost:5173"];

// app.use(
//   cors({
//     origin: function(origin, callback) {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) !== -1 || process.env.CORS_ORIGIN === "*") {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   })
// );

app.use(cors());

// ===== Body parsing middleware =====
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ===== Static file serving =====
app.use(
  "/uploads",
  express.static(uploadsDir, {
    maxAge: "1d",
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();

      const mimeTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };

      if (mimeTypes[ext]) {
        res.setHeader("Content-Type", mimeTypes[ext]);
      }

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );

      if (ext === ".html" || ext === ".htm") {
        res.setHeader("X-Content-Type-Options", "nosniff");
      }
    },
  })
);

// ===== Favicon handler =====
app.get("/favicon.ico", (req, res) => res.status(204).end());

// ===== MongoDB Connection =====
const MONGODB_URL = process.env.MONGODB_URL || process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || "BusTricky";

if (!MONGODB_URL) {
  console.error("❌ MONGODB_URL is not defined in .env file");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URL, {
    dbName: DB_NAME,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ===== Health Check =====
app.get("/", (req, res) => {
  res.json({
    message: "🚍 BusTricky Backend Running!",
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || "1.0.0",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || "1.0.0",
    database: {
      status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      name: mongoose.connection.db?.databaseName || DB_NAME,
    },
  });
});

// ===== Start Server =====
const PORT = process.env.PORT || 8000;

function startServer() {
  try {
    const authRoutes = require("./routes/authRoutes");
    app.use("/api/v1/users", authRoutes);
    console.log("✅ Auth routes loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load auth routes:", error.message);
  }

  // ===== API Routes =====
  app.use("/api/routes", routeRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/buses", busRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/location", locationRoutes);
 app.use("/api/contact", contactUsRoute);

  // ===== 404 Handler =====
  app.use((req, res) => {
    res.status(404).json({
      message: "❌ API endpoint not found",
      path: req.originalUrl,
      method: req.method,
    });
  });

  // ===== Global Error Handler =====
  app.use((err, req, res, next) => {
    console.error("🔥 Global Error:", err.stack);
    res.status(err.statusCode || 500).json({
      status: "error",
      message: err.message || "Internal Server Error",
    });
  });

  app.listen(PORT, () => {
    console.log(`🚍 BusTricky Backend running on http://localhost:${PORT}`);
  });
}

startServer();

// ===== Graceful Shutdown =====
process.on("SIGTERM", () => {
  console.log("\n👋 SIGTERM received, closing server gracefully...");
  mongoose.connection.close(false, () => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n👋 SIGINT received, closing server gracefully...");
  mongoose.connection.close(false, () => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});
