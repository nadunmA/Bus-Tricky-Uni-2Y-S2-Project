// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Authentication
const AUTH = {
  TOKEN_KEY: "bus_tracker_token",
  REFRESH_TOKEN_KEY: "bus_tracker_refresh_token",
  USER_KEY: "bus_tracker_user",
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000,
  TOKEN_REFRESH_THRESHOLD: 15 * 60 * 1000,
};

// User Roles and Permissions
const USER_ROLES = {
  ADMIN: "admin",
  OPERATOR: "operator",
  DRIVER: "driver",
  PASSENGER: "passenger",
  MAINTENANCE: "maintenance",
};

const PERMISSIONS = {
  // Bus management
  BUS_CREATE: "bus:create",
  BUS_READ: "bus:read",
  BUS_UPDATE: "bus:update",
  BUS_DELETE: "bus:delete",

  // Route management
  ROUTE_CREATE: "route:create",
  ROUTE_READ: "route:read",
  ROUTE_UPDATE: "route:update",
  ROUTE_DELETE: "route:delete",

  // User management
  USER_CREATE: "user:create",
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",

  // Real-time tracking
  TRACKING_VIEW: "tracking:view",
  TRACKING_MANAGE: "tracking:manage",

  // Reports and analytics
  REPORTS_VIEW: "reports:view",
  ANALYTICS_VIEW: "analytics:view",
};

// Bus Status Constants
const BUS_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  MAINTENANCE: "maintenance",
  OUT_OF_SERVICE: "out_of_service",
  EN_ROUTE: "en_route",
  AT_STOP: "at_stop",
  DELAYED: "delayed",
  BREAKDOWN: "breakdown",
};

const BUS_STATUS_LABELS = {
  [BUS_STATUS.ACTIVE]: "Active",
  [BUS_STATUS.INACTIVE]: "Inactive",
  [BUS_STATUS.MAINTENANCE]: "Under Maintenance",
  [BUS_STATUS.OUT_OF_SERVICE]: "Out of Service",
  [BUS_STATUS.EN_ROUTE]: "En Route",
  [BUS_STATUS.AT_STOP]: "At Stop",
  [BUS_STATUS.DELAYED]: "Delayed",
  [BUS_STATUS.BREAKDOWN]: "Breakdown",
};

const BUS_STATUS_COLORS = {
  [BUS_STATUS.ACTIVE]: "#10B981",
  [BUS_STATUS.INACTIVE]: "#6B7280",
  [BUS_STATUS.MAINTENANCE]: "#F59E0B",
  [BUS_STATUS.OUT_OF_SERVICE]: "#EF4444",
  [BUS_STATUS.EN_ROUTE]: "#3B82F6",
  [BUS_STATUS.AT_STOP]: "#8B5CF6",
  [BUS_STATUS.DELAYED]: "#F97316",
  [BUS_STATUS.BREAKDOWN]: "#DC2626",
};

// Route Status
const ROUTE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  UNDER_REVIEW: "under_review",
};

// Notification Types
const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  BUS_ARRIVAL: "bus_arrival",
  DELAY_ALERT: "delay_alert",
  MAINTENANCE: "maintenance",
  EMERGENCY: "emergency",
};

const NOTIFICATION_COLORS = {
  [NOTIFICATION_TYPES.INFO]: "#3B82F6",
  [NOTIFICATION_TYPES.SUCCESS]: "#10B981",
  [NOTIFICATION_TYPES.WARNING]: "#F59E0B",
  [NOTIFICATION_TYPES.ERROR]: "#EF4444",
  [NOTIFICATION_TYPES.BUS_ARRIVAL]: "#8B5CF6",
  [NOTIFICATION_TYPES.DELAY_ALERT]: "#F97316",
  [NOTIFICATION_TYPES.MAINTENANCE]: "#F59E0B",
  [NOTIFICATION_TYPES.EMERGENCY]: "#DC2626",
};

// Location and Mapping
const MAP_CONFIG = {
  DEFAULT_CENTER: {
    lat: 6.9271,
    lng: 79.8612,
  },
  DEFAULT_ZOOM: 12,
  MIN_ZOOM: 8,
  MAX_ZOOM: 18,
  UPDATE_INTERVAL: 5000,
  STALE_DATA_THRESHOLD: 10 * 60 * 1000,
};

const DISTANCE_UNITS = {
  METERS: "m",
  KILOMETERS: "km",
  MILES: "mi",
};

// Business Rules
const BUSINESS_RULES = {
  // Bus specifications
  MAX_BUS_CAPACITY: 100,
  MIN_BUS_CAPACITY: 10,
  MAX_SPEED_LIMIT: 120,

  // Route specifications
  MIN_ROUTE_STOPS: 2,
  MAX_ROUTE_STOPS: 50,
  MAX_ROUTE_DISTANCE: 200,

  // Timing
  MIN_FREQUENCY: 5,
  MAX_FREQUENCY: 120,
  SERVICE_START_TIME: "05:00",
  SERVICE_END_TIME: "23:00",

  // Pricing
  MIN_FARE: 0,
  MAX_FARE: 10000,

  // Real-time data
  GPS_ACCURACY_THRESHOLD: 50,
  MAX_DATA_AGE: 10 * 60 * 1000,
  LOCATION_UPDATE_INTERVAL: 30000,
};

// File Upload Constraints
const FILE_CONSTRAINTS = {
  MAX_SIZE: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_IMAGE_EXTENSIONS: ["jpg", "jpeg", "png", "webp"],
  ALLOWED_DOCUMENT_TYPES: [
    "application/pdf",
    "text/csv",
    "application/vnd.ms-excel",
  ],
  ALLOWED_DOCUMENT_EXTENSIONS: ["pdf", "csv", "xls", "xlsx"],
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  SIZE_OPTIONS: [10, 20, 50, 100],
};

// Search Configuration
const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEBOUNCE_DELAY: 300,
  MAX_RECENT_SEARCHES: 10,
};

// Date and Time Formats
const DATE_FORMATS = {
  DISPLAY: "DD/MM/YYYY",
  API: "YYYY-MM-DD",
  FULL: "DD/MM/YYYY HH:mm:ss",
  TIME_ONLY: "HH:mm",
  ISO: "YYYY-MM-DDTHH:mm:ss.sssZ",
};

// Sri Lankan Specific Constants
const SRI_LANKA = {
  COUNTRY_CODE: "+94",
  CURRENCY: "LKR",
  CURRENCY_SYMBOL: "Rs.",
  TIMEZONE: "Asia/Colombo",

  // Major cities for route planning
  MAJOR_CITIES: [
    "Colombo",
    "Gampaha",
    "Kalutara",
    "Kandy",
    "Matale",
    "Nuwara Eliya",
    "Galle",
    "Matara",
    "Hambantota",
    "Jaffna",
    "Vavuniya",
    "Anuradhapura",
    "Polonnaruwa",
    "Badulla",
    "Monaragala",
    "Ratnapura",
    "Kegalle",
    "Kurunegala",
    "Puttalam",
    "Chilaw",
    "Negombo",
    "Panadura",
    "Horana",
    "Avissawella",
  ],

  // Common bus route prefixes
  ROUTE_PREFIXES: ["CTB", "SLTB", "PVT"],
};

// Error Messages
const ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Network connection failed. Please check your internet connection.",
  SERVER_ERROR: "Server error occurred. Please try again later.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  FORBIDDEN: "Access denied. Insufficient permissions.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please correct the highlighted errors.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  UNKNOWN_ERROR: "An unexpected error occurred.",

  // Authentication specific
  LOGIN_FAILED: "Invalid email or password.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  ACCOUNT_LOCKED: "Account has been locked. Please contact administrator.",

  // Bus tracking specific
  GPS_UNAVAILABLE: "GPS location is not available.",
  BUS_NOT_FOUND: "Bus not found or not currently active.",
  ROUTE_NOT_FOUND: "Route not found.",
  NO_BUSES_ON_ROUTE: "No buses are currently running on this route.",
};

// Success Messages
const SUCCESS_MESSAGES = {
  BUS_CREATED: "Bus has been successfully created.",
  BUS_UPDATED: "Bus information has been updated.",
  BUS_DELETED: "Bus has been removed from the system.",

  ROUTE_CREATED: "Route has been successfully created.",
  ROUTE_UPDATED: "Route information has been updated.",
  ROUTE_DELETED: "Route has been removed from the system.",

  USER_CREATED: "User account has been created successfully.",
  USER_UPDATED: "User information has been updated.",
  USER_DELETED: "User account has been removed.",

  PROFILE_UPDATED: "Your profile has been updated successfully.",
  PASSWORD_CHANGED: "Password has been changed successfully.",

  SETTINGS_SAVED: "Settings have been saved successfully.",
  DATA_IMPORTED: "Data has been imported successfully.",
  DATA_EXPORTED: "Data has been exported successfully.",
};

// WebSocket Events
const WEBSOCKET_EVENTS = {
  // Connection events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  RECONNECT: "reconnect",
  ERROR: "error",

  // Bus tracking events
  BUS_LOCATION_UPDATE: "bus_location_update",
  BUS_STATUS_CHANGE: "bus_status_change",
  BUS_ARRIVAL: "bus_arrival",
  BUS_DEPARTURE: "bus_departure",

  // Route events
  ROUTE_UPDATE: "route_update",
  SCHEDULE_CHANGE: "schedule_change",

  // Notification events
  NOTIFICATION: "notification",
  ALERT: "alert",
  EMERGENCY: "emergency",

  // System events
  SYSTEM_STATUS: "system_status",
  MAINTENANCE_MODE: "maintenance_mode",
};

// Local Storage Keys
const STORAGE_KEYS = {
  THEME: "bus_tracker_theme",
  LANGUAGE: "bus_tracker_language",
  MAP_PREFERENCES: "bus_tracker_map_prefs",
  NOTIFICATION_PREFERENCES: "bus_tracker_notifications",
  RECENT_SEARCHES: "bus_tracker_recent_searches",
  FAVORITE_ROUTES: "bus_tracker_favorite_routes",
  USER_SETTINGS: "bus_tracker_user_settings",
};

// Theme Configuration
const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

const THEME_COLORS = {
  [THEMES.LIGHT]: {
    primary: "#3B82F6",
    secondary: "#64748B",
    background: "#FFFFFF",
    surface: "#F8FAFC",
    text: "#1F2937",
    textSecondary: "#6B7280",
  },
  [THEMES.DARK]: {
    primary: "#60A5FA",
    secondary: "#94A3B8",
    background: "#111827",
    surface: "#1F2937",
    text: "#F9FAFB",
    textSecondary: "#D1D5DB",
  },
};

// Language Support
const LANGUAGES = {
  EN: "en",
  SI: "si",
  TA: "ta",
};

const LANGUAGE_LABELS = {
  [LANGUAGES.EN]: "English",
  [LANGUAGES.SI]: "සිංහල",
  [LANGUAGES.TA]: "தமிழ்",
};

// Map Markers and Icons
const MAP_MARKERS = {
  BUS_ACTIVE: {
    color: "#10B981",
    icon: "bus",
    size: "medium",
  },
  BUS_INACTIVE: {
    color: "#6B7280",
    icon: "bus",
    size: "small",
  },
  BUS_DELAYED: {
    color: "#F97316",
    icon: "bus",
    size: "medium",
  },
  BUS_BREAKDOWN: {
    color: "#EF4444",
    icon: "bus-alert",
    size: "medium",
  },
  STOP: {
    color: "#3B82F6",
    icon: "map-pin",
    size: "small",
  },
  TERMINAL: {
    color: "#8B5CF6",
    icon: "building",
    size: "large",
  },
};

// Time Constants
const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,

  // Specific intervals
  LOCATION_UPDATE_INTERVAL: 30 * 1000,
  STATUS_CHECK_INTERVAL: 60 * 1000,
  NOTIFICATION_CLEANUP_INTERVAL: 5 * 60 * 1000,
  SESSION_CHECK_INTERVAL: 10 * 60 * 1000,
};

// Validation Limits
const VALIDATION_LIMITS = {
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_ROUTE_NAME_LENGTH: 3,
  MAX_ROUTE_NAME_LENGTH: 100,
  MIN_STOP_NAME_LENGTH: 2,
  MAX_STOP_NAME_LENGTH: 100,

  // Numbers
  MIN_BUS_NUMBER_LENGTH: 1,
  MAX_BUS_NUMBER_LENGTH: 4,
  MIN_ROUTE_NUMBER_LENGTH: 1,
  MAX_ROUTE_NUMBER_LENGTH: 10,

  // Coordinates
  MIN_LATITUDE: -90,
  MAX_LATITUDE: 90,
  MIN_LONGITUDE: -180,
  MAX_LONGITUDE: 180,

  // Business constraints
  MIN_CAPACITY: 1,
  MAX_CAPACITY: 100,
  MIN_SPEED: 0,
  MAX_SPEED: 120,
  MIN_FARE: 0,
  MAX_FARE: 10000,

  // Search and pagination
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_LENGTH: 100,
  MIN_PAGE: 1,
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,

  // Notifications
  MAX_NOTIFICATION_TITLE: 100,
  MAX_NOTIFICATION_MESSAGE: 500,

  // Schedules
  MIN_FREQUENCY: 5,
  MAX_FREQUENCY: 120,
};

// RegEx Patterns
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  SRI_LANKAN_PHONE: /^(\+94|0)?[7][0-9]{8}$/,
  OLD_NIC: /^[0-9]{9}[VX]$/,
  NEW_NIC: /^[0-9]{12}$/,
  STRONG_PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  ALPHA_NUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHA_ONLY: /^[a-zA-Z\s]+$/,
  NUMERIC_ONLY: /^[0-9]+$/,
  TIME_FORMAT: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  BUS_CODE: /^BUS-[0-9]{3}-[0-9]{2}$/,
  HARMFUL_CHARS: /<script|javascript:|data:|vbscript:/i,
};

// Default Values
const DEFAULTS = {
  // Pagination
  PAGE: 1,
  LIMIT: 20,

  // Map
  MAP_CENTER: MAP_CONFIG.DEFAULT_CENTER,
  MAP_ZOOM: MAP_CONFIG.DEFAULT_ZOOM,

  // Time
  UPDATE_INTERVAL: 30000,

  // Theme
  THEME: THEMES.LIGHT,
  LANGUAGE: LANGUAGES.EN,

  // Notifications
  NOTIFICATION_DURATION: 5000,
  MAX_NOTIFICATIONS: 5,
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

// API Endpoints
const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
  },

  // Users
  USERS: {
    BASE: "/users",
    PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    UPLOAD_AVATAR: "/users/avatar",
  },

  // Buses
  BUSES: {
    BASE: "/buses",
    SEARCH: "/buses/search",
    STATUS: "/buses/:id/status",
    LOCATION: "/buses/:id/location",
    SCHEDULE: "/buses/:id/schedule",
  },

  // Routes
  ROUTES: {
    BASE: "/routes",
    SEARCH: "/routes/search",
    STOPS: "/routes/:id/stops",
    SCHEDULES: "/routes/:id/schedules",
    BUSES: "/routes/:id/buses",
  },

  // Stops
  STOPS: {
    BASE: "/stops",
    NEARBY: "/stops/nearby",
    SEARCH: "/stops/search",
  },

  // Real-time tracking
  TRACKING: {
    BUSES: "/tracking/buses",
    ROUTE: "/tracking/routes/:id",
    STOP_ARRIVALS: "/tracking/stops/:id/arrivals",
    LIVE_MAP: "/tracking/live-map",
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: "/notifications",
    MARK_READ: "/notifications/:id/read",
    MARK_ALL_READ: "/notifications/read-all",
    PREFERENCES: "/notifications/preferences",
  },

  // Reports and Analytics
  REPORTS: {
    USAGE: "/reports/usage",
    PERFORMANCE: "/reports/performance",
    DELAYS: "/reports/delays",
    REVENUE: "/reports/revenue",
  },

  // System
  SYSTEM: {
    HEALTH: "/system/health",
    STATUS: "/system/status",
    CONFIG: "/system/config",
  },
};

// WebSocket Configuration
const WEBSOCKET_CONFIG = {
  URL: import.meta.env.VITE_WS_URL || "ws://localhost:3001",
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 2000,
  PING_INTERVAL: 30000,
  PONG_TIMEOUT: 5000,
};

// Chart and Analytics Colors
const CHART_COLORS = {
  PRIMARY: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
  SECONDARY: ["#60A5FA", "#34D399", "#FBBF24", "#F87171", "#A78BFA"],
  GRADIENTS: {
    BLUE: ["#3B82F6", "#1D4ED8"],
    GREEN: ["#10B981", "#059669"],
    YELLOW: ["#F59E0B", "#D97706"],
    RED: ["#EF4444", "#DC2626"],
    PURPLE: ["#8B5CF6", "#7C3AED"],
  },
};

// Animation Durations
const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,

  // Specific animations
  TOAST_DURATION: 5000,
  MODAL_TRANSITION: 300,
  PAGE_TRANSITION: 200,
  LOADING_SPINNER: 1000,
};

// Breakpoints (Tailwind CSS compatible)
const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
};

// Feature Flags
const FEATURES = {
  REAL_TIME_TRACKING: true,
  NOTIFICATIONS: true,
  DARK_MODE: true,
  MULTI_LANGUAGE: true,
  ANALYTICS: true,
  EXPORT_DATA: true,
  MOBILE_APP: false,
  OFFLINE_MODE: false,
};

// Environment Configuration
const ENV = {
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
  CURRENT: import.meta.env.MODE || "development",
};

// Logging Levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4,
};

// Cache Configuration
const CACHE = {
  ROUTES_TTL: 30 * 60 * 1000,
  STOPS_TTL: 60 * 60 * 1000,
  USER_PROFILE_TTL: 15 * 60 * 1000,
  SEARCH_RESULTS_TTL: 5 * 60 * 1000,
  MAP_TILES_TTL: 24 * 60 * 60 * 1000,
};

export {
  ANIMATIONS,
  API_CONFIG,
  API_ENDPOINTS,
  AUTH,
  BREAKPOINTS,
  BUS_STATUS,
  BUS_STATUS_COLORS,
  BUS_STATUS_LABELS,
  BUSINESS_RULES,
  CACHE,
  CHART_COLORS,
  DATE_FORMATS,
  DEFAULTS,
  DISTANCE_UNITS,
  ENV,
  ERROR_MESSAGES,
  FEATURES,
  FILE_CONSTRAINTS,
  HTTP_STATUS,
  LANGUAGE_LABELS,
  LANGUAGES,
  LOG_LEVELS,
  MAP_CONFIG,
  MAP_MARKERS,
  NOTIFICATION_COLORS,
  NOTIFICATION_TYPES,
  PAGINATION,
  PERMISSIONS,
  REGEX_PATTERNS,
  ROUTE_STATUS,
  SEARCH_CONFIG,
  SRI_LANKA,
  STORAGE_KEYS,
  SUCCESS_MESSAGES,
  THEME_COLORS,
  THEMES,
  TIME,
  USER_ROLES,
  VALIDATION_LIMITS,
  WEBSOCKET_CONFIG,
  WEBSOCKET_EVENTS,
};

const CONSTANTS = {
  API_CONFIG,
  AUTH,
  USER_ROLES,
  PERMISSIONS,
  BUS_STATUS,
  BUS_STATUS_LABELS,
  BUS_STATUS_COLORS,
  ROUTE_STATUS,
  NOTIFICATION_TYPES,
  NOTIFICATION_COLORS,
  MAP_CONFIG,
  DISTANCE_UNITS,
  BUSINESS_RULES,
  FILE_CONSTRAINTS,
  PAGINATION,
  SEARCH_CONFIG,
  DATE_FORMATS,
  SRI_LANKA,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  WEBSOCKET_EVENTS,
  STORAGE_KEYS,
  THEMES,
  THEME_COLORS,
  LANGUAGES,
  LANGUAGE_LABELS,
  MAP_MARKERS,
  TIME,
  VALIDATION_LIMITS,
  REGEX_PATTERNS,
  DEFAULTS,
  HTTP_STATUS,
  API_ENDPOINTS,
  WEBSOCKET_CONFIG,
  CHART_COLORS,
  ANIMATIONS,
  BREAKPOINTS,
  FEATURES,
  ENV,
  LOG_LEVELS,
  CACHE,
};

export default CONSTANTS;
