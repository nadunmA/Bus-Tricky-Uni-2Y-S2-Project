// backend/models/UmUserModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },

  //Google users
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
    minlength: 8,
  },

  weeklySchedule: {
    monday: {
      startTime: String,
      endTime: String,
      route: String,
      isWorking: { type: Boolean, default: false },
    },
    tuesday: {
      startTime: String,
      endTime: String,
      route: String,
      isWorking: { type: Boolean, default: false },
    },
    wednesday: {
      startTime: String,
      endTime: String,
      route: String,
      isWorking: { type: Boolean, default: false },
    },
    thursday: {
      startTime: String,
      endTime: String,
      route: String,
      isWorking: { type: Boolean, default: false },
    },
    friday: {
      startTime: String,
      endTime: String,
      route: String,
      isWorking: { type: Boolean, default: false },
    },
    saturday: {
      startTime: String,
      endTime: String,
      route: String,
      isWorking: { type: Boolean, default: false },
    },
    sunday: {
      startTime: String,
      endTime: String,
      route: String,
      isWorking: { type: Boolean, default: false },
    },
  },

  preferredRoutes: [String],
  availableForOvertime: { type: Boolean, default: false },
  maximumWorkingHours: { type: Number, default: 8 },

  googleId: {
    type: String,
    sparse: true,
    index: true,
  },

  phoneNumber: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female"] },

  country: {
    type: String,
    default: "Sri Lanka",
    trim: true,
    maxLength: [50, "Country name cannot exceed 50 characters"],
  },

  address: {
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: "Sri Lanka" },
  },

  role: {
    type: String,
    enum: ["admin", "driver", "passenger", "support"],
    default: "passenger",
  },

  currentRoute: { type: String },
  employmentStatus: {
    type: String,
    enum: ["full-time", "part-time", "contract", "temporary"],
  },
  shiftPreference: {
    type: String,
    enum: ["morning", "afternoon", "night", "flexible"],
  },
  salary: { type: Number },
  specialQualifications: { type: String },

  medicalCertificateExpiry: { type: Date },
  bloodType: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  },
  medicalConditions: {
    type: String,
    trim: true,
  },

  licenseNumber: {
    type: String,
    required: function () {
      return this.role === "driver";
    },
    validate: {
      validator: function (v) {
        if (this.role === "driver") {
          return v && typeof v === "string" && v.trim().length > 0;
        }
        return true;
      },
      message: "License number is required for drivers",
    },
  },

  licenseExpiry: {
    type: Date,
    required: function () {
      return this.role === "driver";
    },
    validate: {
      validator: function (v) {
        if (this.role === "driver") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return v && new Date(v) >= today;
        }
        return true;
      },
      message: "License expiry date must be today or in the future",
    },
  },

  vehicleNumber: {
    type: String,
    required: function () {
      return this.role === "driver";
    },
    validate: {
      validator: function (v) {
        if (this.role === "driver") {
          return v && typeof v === "string" && v.trim().length > 0;
        }
        return true;
      },
      message: "Vehicle number is required for drivers",
    },
  },

  yearsOfExperience: {
    type: String,
    required: function () {
      return this.role === "driver";
    },
    enum: ["0-1", "1-3", "3-5", "5-10", "10+"],
    validate: {
      validator: function (v) {
        if (this.role === "driver") {
          return v && typeof v === "string" && v.trim().length > 0;
        }
        return true;
      },
      message: "Years of experience is required for drivers",
    },
  },

  emergencyContact: {
    type: String,
    required: function () {
      return this.role === "driver";
    },
    validate: {
      validator: function (v) {
        if (this.role === "driver") {
          return v && typeof v === "string" && v.trim().length > 0;
        }
        return true;
      },
      message: "Emergency contact is required for drivers",
    },
  },

  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  profilePicture: String,

  emailVerificationExpire: Date,
  emailVerificationAttempts: { type: Number, default: 0 },
  lasVerificationEmailSent: Date,

  refreshToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,

  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    language: { type: String, default: "en" },
    currency: { type: String, default: "LKR" },
  },

  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  totalBookings: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ emailVerificationExpire: 1 });
userSchema.index({ email: 1, googleId: 1 });

userSchema.virtual("name").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Google users
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || (this.googleId && !this.password)) {
    return next();
  }

  if (!this.password) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

//Google users
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (this.googleId && !this.password) {
    return false;
  }

  if (!this.password) {
    return false;
  }

  const result = await bcrypt.compare(candidatePassword, this.password);
  return result;
};

userSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

  return verificationToken;
};

userSchema.methods.canRequestVerificationEmail = function () {
  const timePeriod = 5 * 60 * 1000;
  const maxAttempts = 5;

  if (this.emailVerificationAttempts >= maxAttempts) {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    if (
      this.lasVerificationEmailSent &&
      this.lasVerificationEmailSent > oneDayAgo
    ) {
      return {
        canRequest: false,
        reason: "Maximum verification attempts reached for today",
      };
    } else {
      this.emailVerificationAttempts = 0;
    }
  }

  if (this.lasVerificationEmailSent) {
    const timeSinceLastEmail = Date.now() - this.lasVerificationEmailSent;

    if (timeSinceLastEmail < timePeriod) {
      const waitTime = Math.ceil((timePeriod - timeSinceLastEmail) / 1000 / 60);
      return {
        canRequest: false,
        reason: `Please wait ${waitTime} minutes before requesting another verification email`,
      };
    }
  }
  return { canRequest: true };
};

userSchema.methods.incrementVerificationAttempts = function () {
  this.emailVerificationAttempts += 1;
  this.lasVerificationEmailSent = Date.now();
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};


module.exports = mongoose.model("UmUserModel", userSchema);