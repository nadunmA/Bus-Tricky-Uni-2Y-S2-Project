const userConfig = {
  password: {
    minLength: 8,
    maxLenght: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventUserInfoInPassword: true,
    historyLimit: 5,
  },

  //account lockout setting
  lockout: {
    maxAttempts: 5,
    lockDuration: 30 * 60 * 1000, //30 min
    incrementalDelay: true,
    resetAttemptsAfter: 24 * 60 * 60 * 1000, // Reset 24 hours
  },

  // email verification settings
  emailVerification: {
    tokenExpiry: 24 * 60 * 60 * 1000,
    maxAttempts: 5,
    resendDelay: 5 * 60 * 1000,
    autoCleanupUnverified: 7 * 24 * 60 * 60 * 1000, // Delete unverified accounts after 7 days
    requireVerification: process.env.REQUIRE_EMAIL_VERIFICATION !== "false",
  },

  // password reset settings
  passwordReset: {
    tokenExpiry: 10 * 60 * 1000,
    maxAttempts: 3, // per day
    cooldownPeriod: 24 * 60 * 60 * 1000,
    tokenLength: 20,
  },

  //jwt token setting
  jwt: {
    accessToken: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRE || "15m",
      algorithm: "HS256",
    },
    refreshToken: {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
      algorithm: "HS256",
    },
    cookie: {
      expire: process.env.JWT_COOKIE_EXPIRE || 7, // days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    },
  },

  // user role and permission part
  roles: {
    admin: {
      name: "admin",
      permissions: [
        "users:read",
        "users:create",
        "users:update",
        "users:delete",
        "users:bulk_operations",
        "dashboard:read",
        "analytics:read",
        "system:manage",
        "buses:manage",
        "routes:manage",
        "bookings:manage",
      ],
      description: "Full system access",
    },
    driver: {
      name: "driver",
      permissions: [
        "profile:read",
        "profile:update",
        "bus:update_location",
        "routes:read",
        "schedule:read",
        "notifications:read",
      ],
      description: "Bus driver access",
    },
    passenger: {
      name: "passenger",
      permissions: [
        "profile:read",
        "profile:update",
        "bookings:create",
        "bookings:read",
        "bookings:cancel",
        "routes:read",
        "buses:track",
        "payments:make",
      ],
      description: "Regular passenger access",
    },
    support: {
      name: "support",
      permissions: [
        "users:read",
        "users:update",
        "bookings:read",
        "bookings:update",
        "support_tickets:manage",
        "reports:generate",
      ],
      description: "Customer support access",
    },
  },

  // Profile settings
  profile: {
    allowedFields: [
      "firstName",
      "lastName",
      "phoneNumber",
      "dateOfBirth",
      "gender",
      "address",
      "preferences",
      "profilePicture",
    ],
    profilePicture: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
      dimensions: {
        min: { width: 100, height: 100 },
        max: { width: 2000, height: 2000 },
      },
    },
    validation: {
      firstName: { min: 2, max: 50 },
      lastName: { min: 2, max: 50 },
      phoneNumber: {
        pattern: /^(\+94|0)[0-9]{9}$/, // Sri Lankan phone number format
        message: "Please provide a valid Sri Lankan phone number",
      },
    },
  },

  //session management
  session: {
    maxConcurrentSessions: 5, //per user
    sessionTimeout: 30 * 60 * 1000,
    rememberMe: {
      enabled: true,
      duration: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    deviceTracking: {
      enabled: true,
      maxDevices: 10,
    },
  },

  // User preferences defaults
  defaultPreferences: {
    notifications: {
      email: true,
      sms: true,
      push: true,
      booking_updates: true,
      schedule_changes: true,
      promotional: false,
    },
    language: "en",
    currency: "LKR",
    timezone: "Colombo",
  },

  // Data retention and cleanup
  dataRetention: {
    deleteInactiveAfter: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
    archiveDataAfter: 365 * 24 * 60 * 60 * 1000, // 1 year
    cleanupJobSchedule: "0 2 * * *", // Daily at 2 AM
    anonymizeDataAfter: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
  },

  // Security settings
  security: {
    bcrypt: {
      rounds: 12,
    },
    crypto: {
      algorithm: "aes-256-gcm",
      keyLength: 32,
      ivLength: 16,
    },
    headers: {
      enableCORS: true,
      enableHSTS: process.env.NODE_ENV === "production",
      enableCSP: true,
      enableXSS: true,
    },
    ipWhitelist: process.env.IP_WHITELIST
      ? process.env.IP_WHITELIST.split(",")
      : [],
    maxDeviceFingerprints: 5,
  },

  // Audit logging
  audit: {
    enabled: true,
    events: [
      "user_login",
      "user_logout",
      "password_change",
      "profile_update",
      "role_change",
      "account_activation",
      "account_deactivation",
      "failed_login",
      "password_reset_request",
      "email_verification",
    ],
    retention: 365 * 24 * 60 * 60 * 1000, // 1 year
    sensitive_fields: ["password", "resetPasswordToken", "refreshToken"],
  },

  // Validation rules
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    strongPassword:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    phoneNumber: /^(\+94|0)[0-9]{9}$/,
    name: /^[a-zA-Z\s'-]{2,50}$/,
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
    defaultSort: "-createdAt",
  },

  // Feature flags
  features: {
    socialLogin: process.env.ENABLE_SOCIAL_LOGIN === "true",
    twoFactorAuth: process.env.ENABLE_2FA === "true",
    emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS !== "false",
    smsNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === "true",
    pushNotifications: process.env.ENABLE_PUSH_NOTIFICATIONS === "true",
    profilePictureUpload: process.env.ENABLE_PROFILE_PICTURES !== "false",
    bulkOperations: process.env.ENABLE_BULK_OPERATIONS !== "false",
    userAnalytics: process.env.ENABLE_USER_ANALYTICS !== "false",
  },

  // Error messages
  errorMessages: {
    validation: {
      required: "{field} is required",
      email: "Please provide a valid email address",
      password: "Password must meet security requirements",
      phoneNumber: "Please provide a valid phone number",
      name: "Name must contain only letters and spaces",
    },
    auth: {
      invalidCredentials: "Invalid email or password",
      accountLocked:
        "Account is temporarily locked due to multiple failed login attempts",
      accountDeactivated: "Account is deactivated. Please contact support",
      tokenExpired: "Token has expired",
      tokenInvalid: "Invalid token",
      unauthorized: "Access denied. Authentication required",
      forbidden: "Access denied. Insufficient permissions",
    },
  },
};

// Helper functions
const getUserRole = (roleName) => {
  return userConfig.roles[roleName] || null;
};

const hasPermission = (userRole, permission) => {
  const role = getUserRole(userRole);
  return role ? role.permissions.includes(permission) : false;
};

const validatePassword = (password) => {
  const config = userConfig.password;
  const errors = [];

  if (password.length < config.minLength) {
    errors.push(
      `Password must be at least ${config.minLength} characters long`
    );
  }

  if (password.length > config.maxLength) {
    errors.push(`Password must not exceed ${config.maxLength} characters`);
  }

  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (config.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (config.requireNumbers && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (config.requireSpecialChars && !/[@$!%*?&]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (@$!%*?&)"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const getDefaultPreferences = () => {
  return JSON.parse(JSON.stringify(userConfig.defaultPreferences));
};

module.exports = {
  userConfig,
  getUserRole,
  hasPermission,
  validatePassword,
  getDefaultPreferences,
};
