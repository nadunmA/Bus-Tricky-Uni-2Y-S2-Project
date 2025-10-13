/**
 * System Constants for Bus Tracking Application
 * Central configuration file for all constants used throughout the application
 */

// User Types
const USER_TYPES = {
  PASSENGER: "passenger",
  DRIVER: "driver",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

// User Status
const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  PENDING: "pending",
};

// Bus Status
const BUS_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  MAINTENANCE: "maintenance",
  OUT_OF_SERVICE: "out_of_service",
  IN_TRANSIT: "in_transit",
  AT_STOP: "at_stop",
};

// Route Status
const ROUTE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  UNDER_CONSTRUCTION: "under_construction",
};

// Trip Status
const TRIP_STATUS = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DELAYED: "delayed",
};

// Booking Status
const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  NO_SHOW: "no_show",
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
};

// Payment Methods
const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  DIGITAL_WALLET: "digital_wallet",
  UPI: "upi",
  NET_BANKING: "net_banking",
};

// Notification Types
const NOTIFICATION_TYPES = {
  BUS_ARRIVAL: "bus_arrival",
  BUS_DELAY: "bus_delay",
  ROUTE_UPDATE: "route_update",
  BOOKING_CONFIRMATION: "booking_confirmation",
  PAYMENT_SUCCESS: "payment_success",
  PAYMENT_FAILED: "payment_failed",
  SYSTEM_MAINTENANCE: "system_maintenance",
  EMERGENCY_ALERT: "emergency_alert",
};

// API Response Messages
const RESPONSE_MESSAGES = {
  // Success Messages
  SUCCESS: "Operation completed successfully",
  USER_REGISTERED: "User registered successfully",
  USER_LOGGED_IN: "User logged in successfully",
  USER_LOGGED_OUT: "User logged out successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  PASSWORD_CHANGED: "Password changed successfully",
  PASSWORD_RESET: "Password reset successfully",

  // Error Messages
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User already exists with this email",
  ACCOUNT_DEACTIVATED: "Account is deactivated",
  UNAUTHORIZED: "Access denied. Authentication required",
  FORBIDDEN: "Access forbidden. Insufficient permissions",
  VALIDATION_ERROR: "Validation failed",
  SERVER_ERROR: "Internal server error",
  TOKEN_EXPIRED: "Token has expired",
  INVALID_TOKEN: "Invalid token provided",

  // Bus specific messages
  BUS_NOT_FOUND: "Bus not found",
  BUS_CREATED: "Bus created successfully",
  BUS_UPDATED: "Bus information updated successfully",
  BUS_DELETED: "Bus removed successfully",

  // Route specific messages
  ROUTE_NOT_FOUND: "Route not found",
  ROUTE_CREATED: "Route created successfully",
  ROUTE_UPDATED: "Route updated successfully",
  ROUTE_DELETED: "Route deleted successfully",

  // Booking specific messages
  BOOKING_CREATED: "Booking created successfully",
  BOOKING_CANCELLED: "Booking cancelled successfully",
  BOOKING_NOT_FOUND: "Booking not found",
  SEAT_NOT_AVAILABLE: "Selected seat is not available",
};

// Pagination Settings
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
};

// JWT Settings
const JWT_CONFIG = {
  EXPIRES_IN: "7d",
  REFRESH_EXPIRES_IN: "30d",
  RESET_PASSWORD_EXPIRES_IN: "1h",
  VERIFY_EMAIL_EXPIRES_IN: "24h",
};

// File Upload Settings
const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
  UPLOAD_DIR: "uploads/",
  PROFILE_DIR: "uploads/profiles/",
  BUS_DIR: "uploads/buses/",
  DOCUMENTS_DIR: "uploads/documents/",
};

// Email Templates
const EMAIL_TEMPLATES = {
  WELCOME: "welcome",
  PASSWORD_RESET: "password_reset",
  EMAIL_VERIFICATION: "email_verification",
  BOOKING_CONFIRMATION: "booking_confirmation",
  TRIP_REMINDER: "trip_reminder",
};

// Geographic Settings
const GEO_SETTINGS = {
  DEFAULT_RADIUS: 1000, // meters
  MAX_RADIUS: 50000, // 50km
  COORDINATE_PRECISION: 6, // decimal places
};

// Time Settings
const TIME_SETTINGS = {
  TIMEZONE: "Asia/Kolkata",
  DATE_FORMAT: "YYYY-MM-DD",
  TIME_FORMAT: "HH:mm:ss",
  DATETIME_FORMAT: "YYYY-MM-DD HH:mm:ss",
};

// Rate Limiting
const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5, // 5 attempts per window
  },
  API: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // 100 requests per window
  },
  SEARCH: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 20, // 20 search requests per minute
  },
};

// Database Collections
const COLLECTIONS = {
  USERS: "users",
  BUSES: "buses",
  ROUTES: "routes",
  TRIPS: "trips",
  BOOKINGS: "bookings",
  PAYMENTS: "payments",
  STOPS: "stops",
  NOTIFICATIONS: "notifications",
  FEEDBACK: "feedback",
};

// Socket Events
const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  BUS_LOCATION_UPDATE: "bus_location_update",
  TRIP_STATUS_UPDATE: "trip_status_update",
  NOTIFICATION: "notification",
  ROUTE_UPDATE: "route_update",
};

// Bus Capacity Settings
const BUS_SETTINGS = {
  MIN_CAPACITY: 10,
  MAX_CAPACITY: 100,
  DEFAULT_CAPACITY: 40,
  SEAT_TYPES: {
    REGULAR: "regular",
    PREMIUM: "premium",
    WHEELCHAIR: "wheelchair",
  },
};

// Validation Rules
const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBERS: false,
    REQUIRE_SPECIAL_CHARS: false,
  },
  EMAIL: {
    MAX_LENGTH: 254,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
  },
};

// Error Codes
const ERROR_CODES = {
  // Authentication Errors
  AUTH_001: "INVALID_CREDENTIALS",
  AUTH_002: "TOKEN_EXPIRED",
  AUTH_003: "TOKEN_INVALID",
  AUTH_004: "ACCOUNT_DEACTIVATED",
  AUTH_005: "INSUFFICIENT_PERMISSIONS",

  // User Errors
  USER_001: "USER_NOT_FOUND",
  USER_002: "USER_ALREADY_EXISTS",
  USER_003: "INVALID_USER_TYPE",

  // Bus Errors
  BUS_001: "BUS_NOT_FOUND",
  BUS_002: "BUS_ALREADY_EXISTS",
  BUS_003: "BUS_NOT_AVAILABLE",

  // Route Errors
  ROUTE_001: "ROUTE_NOT_FOUND",
  ROUTE_002: "ROUTE_ALREADY_EXISTS",
  ROUTE_003: "INVALID_ROUTE_DATA",

  // Booking Errors
  BOOKING_001: "BOOKING_NOT_FOUND",
  BOOKING_002: "SEAT_NOT_AVAILABLE",
  BOOKING_003: "BOOKING_CANCELLED",

  // System Errors
  SYS_001: "DATABASE_CONNECTION_ERROR",
  SYS_002: "EXTERNAL_SERVICE_ERROR",
  SYS_003: "FILE_UPLOAD_ERROR",
};

// Environment Configuration
const ENV_CONFIG = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TESTING: "testing",
  STAGING: "staging",
};

// API Versions
const API_VERSIONS = {
  V1: "v1",
  V2: "v2",
};

// Cache Settings
const CACHE_SETTINGS = {
  TTL: {
    SHORT: 300, // 5 minutes
    MEDIUM: 1800, // 30 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400, // 24 hours
  },
  KEYS: {
    USER_PROFILE: "user_profile_",
    BUS_LOCATION: "bus_location_",
    ROUTE_DATA: "route_data_",
    TRIP_INFO: "trip_info_",
  },
};

module.exports = {
  USER_TYPES,
  USER_STATUS,
  BUS_STATUS,
  ROUTE_STATUS,
  TRIP_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  NOTIFICATION_TYPES,
  RESPONSE_MESSAGES,
  PAGINATION,
  JWT_CONFIG,
  FILE_UPLOAD,
  EMAIL_TEMPLATES,
  GEO_SETTINGS,
  TIME_SETTINGS,
  RATE_LIMITS,
  COLLECTIONS,
  SOCKET_EVENTS,
  BUS_SETTINGS,
  VALIDATION_RULES,
  ERROR_CODES,
  ENV_CONFIG,
  API_VERSIONS,
  CACHE_SETTINGS,
};
