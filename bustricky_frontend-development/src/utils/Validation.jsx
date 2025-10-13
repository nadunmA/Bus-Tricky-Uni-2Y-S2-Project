export class Validation {
  static isString(value) {
    return typeof value === "string";
  }

  static isNumber(value) {
    return typeof value === "number" && !isNaN(value);
  }

  static isInteger(value) {
    return Number.isInteger(value);
  }

  static isBoolean(value) {
    return typeof value === "boolean";
  }

  static isArray(value) {
    return Array.isArray(value);
  }

  static isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  static isFunction(value) {
    return typeof value === "function";
  }

  static isDate(value) {
    return value instanceof Date && !isNaN(value.getTime());
  }

  static isEmail(email) {
    if (!email || typeof email !== "string") return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  static isPhoneNumber(phone) {
    if (!phone || typeof phone !== "string") return false;
    const phoneRegex = /^(\+94|0)?[7][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ""));
  }

  static isNIC(nic) {
    if (!nic || typeof nic !== "string") return false;
    const nicTrimmed = nic.trim().toUpperCase();

    const oldNicRegex = /^[0-9]{9}[VX]$/;

    const newNicRegex = /^[0-9]{12}$/;

    return oldNicRegex.test(nicTrimmed) || newNicRegex.test(nicTrimmed);
  }

  static isStrongPassword(password) {
    if (!password || typeof password !== "string") return false;

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  static isUrl(url) {
    if (!url || typeof url !== "string") return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isAlphaNumeric(value) {
    if (!value || typeof value !== "string") return false;
    const alphaNumericRegex = /^[a-zA-Z0-9]+$/;
    return alphaNumericRegex.test(value);
  }

  static isAlphaOnly(value) {
    if (!value || typeof value !== "string") return false;
    const alphaRegex = /^[a-zA-Z\s]+$/;
    return alphaRegex.test(value);
  }

  static isNumericOnly(value) {
    if (!value || typeof value !== "string") return false;
    const numericRegex = /^[0-9]+$/;
    return numericRegex.test(value);
  }

  static isPositive(value) {
    return Validation.isNumber(value) && value > 0;
  }

  static isNegative(value) {
    return Validation.isNumber(value) && value < 0;
  }

  static isInRange(value, min, max) {
    return Validation.isNumber(value) && value >= min && value <= max;
  }

  static isValidPrice(price) {
    return Validation.isNumber(price) && price >= 0 && price <= 10000;
  }

  static isValidDate(date) {
    if (!date) return false;
    const d = new Date(date);
    return !isNaN(d.getTime());
  }

  static isFutureDate(date) {
    if (!Validation.isValidDate(date)) return false;
    return new Date(date) > new Date();
  }

  static isPastDate(date) {
    if (!Validation.isValidDate(date)) return false;
    return new Date(date) < new Date();
  }

  static isToday(date) {
    if (!Validation.isValidDate(date)) return false;
    const today = new Date();
    const checkDate = new Date(date);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  }

  static isValidTimeFormat(time) {
    if (!time || typeof time !== "string") return false;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  static isValidLatitude(lat) {
    return Validation.isNumber(lat) && lat >= -90 && lat <= 90;
  }

  static isValidLongitude(lon) {
    return Validation.isNumber(lon) && lon >= -180 && lon <= 180;
  }

  static isValidCoordinates(lat, lon) {
    return Validation.isValidLatitude(lat) && Validation.isValidLongitude(lon);
  }

  static isValidBusNumber(busNumber) {
    if (!busNumber) return false;
    const busStr = String(busNumber);
    return (
      Validation.isNumericOnly(busStr) &&
      busStr.length >= 1 &&
      busStr.length <= 4
    );
  }

  static isValidRouteNumber(routeNumber) {
    if (!routeNumber) return false;
    const routeStr = String(routeNumber);
    return (
      (Validation.isNumericOnly(routeStr) ||
        Validation.isAlphaNumeric(routeStr)) &&
      routeStr.length >= 1 &&
      routeStr.length <= 10
    );
  }

  static isValidBusCode(busCode) {
    if (!busCode || typeof busCode !== "string") return false;
    const busCodeRegex = /^BUS-[0-9]{3}-[0-9]{2}$/;
    return busCodeRegex.test(busCode);
  }

  static isValidSpeed(speed) {
    return Validation.isNumber(speed) && speed >= 0 && speed <= 120;
  }

  static isValidCapacity(capacity) {
    return Validation.isInteger(capacity) && capacity > 0 && capacity <= 100;
  }

  static required(value, fieldName = "Field") {
    if (value === null || value === undefined || value === "") {
      return `${fieldName} is required`;
    }
    if (typeof value === "string" && value.trim() === "") {
      return `${fieldName} cannot be empty`;
    }
    if (Array.isArray(value) && value.length === 0) {
      return `${fieldName} must have at least one item`;
    }
    return null;
  }

  static minLength(value, min, fieldName = "Field") {
    if (!value) return null; // Let required handle empty values
    if (typeof value === "string" && value.length < min) {
      return `${fieldName} must be at least ${min} characters long`;
    }
    if (Array.isArray(value) && value.length < min) {
      return `${fieldName} must have at least ${min} items`;
    }
    return null;
  }

  static maxLength(value, max, fieldName = "Field") {
    if (!value) return null;
    if (typeof value === "string" && value.length > max) {
      return `${fieldName} cannot exceed ${max} characters`;
    }
    if (Array.isArray(value) && value.length > max) {
      return `${fieldName} cannot have more than ${max} items`;
    }
    return null;
  }

  static minValue(value, min, fieldName = "Field") {
    if (value === null || value === undefined) return null;
    if (!Validation.isNumber(value)) {
      return `${fieldName} must be a valid number`;
    }
    if (value < min) {
      return `${fieldName} must be at least ${min}`;
    }
    return null;
  }

  static maxValue(value, max, fieldName = "Field") {
    if (value === null || value === undefined) return null;
    if (!Validation.isNumber(value)) {
      return `${fieldName} must be a valid number`;
    }
    if (value > max) {
      return `${fieldName} cannot exceed ${max}`;
    }
    return null;
  }

  static email(email, fieldName = "Email") {
    if (!email) return null;
    if (!Validation.isEmail(email)) {
      return `${fieldName} must be a valid email address`;
    }
    return null;
  }

  static phone(phone, fieldName = "Phone number") {
    if (!phone) return null;
    if (!Validation.isPhoneNumber(phone)) {
      return `${fieldName} must be a valid Sri Lankan phone number`;
    }
    return null;
  }

  static nic(nic, fieldName = "NIC") {
    if (!nic) return null;
    if (!Validation.isNIC(nic)) {
      return `${fieldName} must be a valid Sri Lankan NIC number`;
    }
    return null;
  }

  static password(password, fieldName = "Password") {
    if (!password) return null;
    if (!Validation.isStrongPassword(password)) {
      return `${fieldName} must be at least 8 characters with uppercase, lowercase, number, and special character`;
    }
    return null;
  }

  static url(url, fieldName = "URL") {
    if (!url) return null;
    if (!Validation.isUrl(url)) {
      return `${fieldName} must be a valid URL`;
    }
    return null;
  }

  static validateForm(data, rules) {
    const errors = {};

    Object.keys(rules).forEach((field) => {
      const value = data[field];
      const fieldRules = rules[field];

      for (const rule of fieldRules) {
        const error = rule(value, field);
        if (error) {
          errors[field] = error;
          break;
        }
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validateBusForm(busData) {
    const rules = {
      busNumber: [
        (value) => Validation.required(value, "Bus number"),
        (value) =>
          Validation.isValidBusNumber(value)
            ? null
            : "Bus number must be 1-4 digits",
      ],
      routeNumber: [
        (value) => Validation.required(value, "Route number"),
        (value) =>
          Validation.isValidRouteNumber(value)
            ? null
            : "Route number must be alphanumeric (1-10 characters)",
      ],
      capacity: [
        (value) => Validation.required(value, "Capacity"),
        (value) =>
          Validation.isValidCapacity(value)
            ? null
            : "Capacity must be between 1 and 100",
      ],
      driverName: [
        (value) => Validation.required(value, "Driver name"),
        (value) => Validation.minLength(value, 2, "Driver name"),
        (value) => Validation.maxLength(value, 50, "Driver name"),
        (value) =>
          Validation.isAlphaOnly(value)
            ? null
            : "Driver name must contain only letters and spaces",
      ],
      driverPhone: [
        (value) => Validation.required(value, "Driver phone"),
        (value) => Validation.phone(value, "Driver phone"),
      ],
    };

    return Validation.validateForm(busData, rules);
  }

  static validateRouteForm(routeData) {
    const rules = {
      routeNumber: [
        (value) => Validation.required(value, "Route number"),
        (value) =>
          Validation.isValidRouteNumber(value)
            ? null
            : "Route number must be alphanumeric (1-10 characters)",
      ],
      routeName: [
        (value) => Validation.required(value, "Route name"),
        (value) => Validation.minLength(value, 3, "Route name"),
        (value) => Validation.maxLength(value, 100, "Route name"),
      ],
      startLocation: [
        (value) => Validation.required(value, "Start location"),
        (value) => Validation.minLength(value, 2, "Start location"),
      ],
      endLocation: [
        (value) => Validation.required(value, "End location"),
        (value) => Validation.minLength(value, 2, "End location"),
      ],
      fare: [
        (value) => Validation.required(value, "Fare"),
        (value) =>
          Validation.isValidPrice(value)
            ? null
            : "Fare must be between 0 and 10,000 LKR",
      ],
    };

    return Validation.validateForm(routeData, rules);
  }

  static validateStopForm(stopData) {
    const rules = {
      stopName: [
        (value) => Validation.required(value, "Stop name"),
        (value) => Validation.minLength(value, 2, "Stop name"),
        (value) => Validation.maxLength(value, 100, "Stop name"),
      ],
      latitude: [
        (value) => Validation.required(value, "Latitude"),
        (value) =>
          Validation.isValidLatitude(value)
            ? null
            : "Latitude must be between -90 and 90",
      ],
      longitude: [
        (value) => Validation.required(value, "Longitude"),
        (value) =>
          Validation.isValidLongitude(value)
            ? null
            : "Longitude must be between -180 and 180",
      ],
      order: [
        (value) => Validation.required(value, "Stop order"),
        (value) =>
          Validation.isInteger(value) && value > 0
            ? null
            : "Stop order must be a positive integer",
      ],
    };

    return Validation.validateForm(stopData, rules);
  }

  static validateUserForm(userData) {
    const rules = {
      firstName: [
        (value) => Validation.required(value, "First name"),
        (value) => Validation.minLength(value, 2, "First name"),
        (value) => Validation.maxLength(value, 30, "First name"),
        (value) =>
          Validation.isAlphaOnly(value)
            ? null
            : "First name must contain only letters",
      ],
      lastName: [
        (value) => Validation.required(value, "Last name"),
        (value) => Validation.minLength(value, 2, "Last name"),
        (value) => Validation.maxLength(value, 30, "Last name"),
        (value) =>
          Validation.isAlphaOnly(value)
            ? null
            : "Last name must contain only letters",
      ],
      email: [
        (value) => Validation.required(value, "Email"),
        (value) => Validation.email(value),
      ],
      phone: [
        (value) => Validation.required(value, "Phone number"),
        (value) => Validation.phone(value),
      ],
      nic: [(value) => Validation.nic(value)],
    };

    return Validation.validateForm(userData, rules);
  }

  // Real-time validations
  static validateRealTimeData(data) {
    const errors = [];

    if (!Validation.isValidCoordinates(data.latitude, data.longitude)) {
      errors.push("Invalid GPS coordinates");
    }

    if (!Validation.isValidSpeed(data.speed)) {
      errors.push("Invalid speed value");
    }

    if (!Validation.isValidDate(data.timestamp)) {
      errors.push("Invalid timestamp");
    }

    if (data.timestamp) {
      const now = new Date();
      const dataTime = new Date(data.timestamp);
      const diffMinutes = (now - dataTime) / (1000 * 60);

      if (diffMinutes > 10) {
        errors.push("Location data is too old");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateFile(file, options = {}) {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ["image/jpeg", "image/png", "image/webp"],
      allowedExtensions = ["jpg", "jpeg", "png", "webp"],
    } = options;

    const errors = [];

    if (!file) {
      errors.push("No file selected");
      return { isValid: false, errors };
    }

    if (file.size > maxSize) {
      errors.push(
        `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
      );
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type must be one of: ${allowedTypes.join(", ")}`);
    }

    const extension = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(
        `File extension must be one of: ${allowedExtensions.join(", ")}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateSearchQuery(query) {
    if (!query || typeof query !== "string") {
      return { isValid: false, error: "Search query must be a string" };
    }

    const trimmed = query.trim();

    if (trimmed.length < 2) {
      return {
        isValid: false,
        error: "Search query must be at least 2 characters",
      };
    }

    if (trimmed.length > 100) {
      return {
        isValid: false,
        error: "Search query cannot exceed 100 characters",
      };
    }

    const harmfulRegex = /<script|javascript:|data:|vbscript:/i;
    if (harmfulRegex.test(trimmed)) {
      return {
        isValid: false,
        error: "Search query contains invalid characters",
      };
    }

    return { isValid: true, query: trimmed };
  }

  static validatePaginationParams(params) {
    const { page, limit } = params;
    const errors = {};

    if (page !== undefined) {
      if (!Validation.isInteger(page) || page < 1) {
        errors.page = "Page must be a positive integer";
      }
    }

    if (limit !== undefined) {
      if (!Validation.isInteger(limit) || limit < 1 || limit > 100) {
        errors.limit = "Limit must be between 1 and 100";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validateSortParams(params, allowedFields = []) {
    const { sortBy, sortOrder } = params;
    const errors = {};

    if (sortBy !== undefined) {
      if (!sortBy || typeof sortBy !== "string") {
        errors.sortBy = "Sort field must be a string";
      } else if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
        errors.sortBy = `Sort field must be one of: ${allowedFields.join(
          ", "
        )}`;
      }
    }

    if (sortOrder !== undefined) {
      if (!["asc", "desc"].includes(sortOrder)) {
        errors.sortOrder = 'Sort order must be "asc" or "desc"';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validateSchedule(schedule) {
    const errors = [];

    if (
      !schedule.startTime ||
      !Validation.isValidTimeFormat(schedule.startTime)
    ) {
      errors.push("Valid start time is required (HH:MM format)");
    }

    if (!schedule.endTime || !Validation.isValidTimeFormat(schedule.endTime)) {
      errors.push("Valid end time is required (HH:MM format)");
    }

    if (schedule.startTime && schedule.endTime) {
      const start = new Date(`2000-01-01 ${schedule.startTime}`);
      const end = new Date(`2000-01-01 ${schedule.endTime}`);

      if (start >= end) {
        errors.push("End time must be after start time");
      }
    }

    if (schedule.frequency !== undefined) {
      if (
        !Validation.isInteger(schedule.frequency) ||
        schedule.frequency < 5 ||
        schedule.frequency > 120
      ) {
        errors.push("Frequency must be between 5 and 120 minutes");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateNotification(notification) {
    const errors = [];

    if (!notification.title || notification.title.trim().length === 0) {
      errors.push("Notification title is required");
    }

    if (notification.title && notification.title.length > 100) {
      errors.push("Notification title cannot exceed 100 characters");
    }

    if (!notification.message || notification.message.trim().length === 0) {
      errors.push("Notification message is required");
    }

    if (notification.message && notification.message.length > 500) {
      errors.push("Notification message cannot exceed 500 characters");
    }

    if (
      notification.type &&
      !["info", "success", "warning", "error"].includes(notification.type)
    ) {
      errors.push(
        "Notification type must be one of: info, success, warning, error"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static sanitizeInput(input) {
    if (typeof input !== "string") return input;

    return input
      .trim()
      .replace(/[<>"']/g, "")
      .substring(0, 1000);
  }

  static sanitizeSearchQuery(query) {
    if (typeof query !== "string") return "";

    return query
      .trim()
      .replace(/[<>"'`]/g, "")
      .replace(/\s+/g, " ")
      .substring(0, 100);
  }

  static escapeHtml(text) {
    if (typeof text !== "string") return text;

    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  static validatePasswordConfirm(password, confirmPassword) {
    if (!password || !confirmPassword) {
      return "Both password fields are required";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match";
    }

    return null;
  }

  static validateDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
      return "Both start and end dates are required";
    }

    if (
      !Validation.isValidDate(startDate) ||
      !Validation.isValidDate(endDate)
    ) {
      return "Invalid date format";
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return "End date must be after start date";
    }

    return null;
  }

  static validateTimeRange(startTime, endTime) {
    if (!startTime || !endTime) {
      return "Both start and end times are required";
    }

    if (
      !Validation.isValidTimeFormat(startTime) ||
      !Validation.isValidTimeFormat(endTime)
    ) {
      return "Invalid time format (use HH:MM)";
    }

    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);

    if (start >= end) {
      return "End time must be after start time";
    }

    return null;
  }

  static validateArray(array, itemValidator) {
    if (!Array.isArray(array)) {
      return { isValid: false, errors: ["Input must be an array"] };
    }

    const errors = [];
    const results = [];

    array.forEach((item, index) => {
      const result = itemValidator(item);
      results.push(result);

      if (!result.isValid) {
        errors.push(`Item ${index + 1}: ${result.errors.join(", ")}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      results,
    };
  }

  static createRule(validator, errorMessage) {
    return (value, fieldName) => {
      if (validator(value)) {
        return null;
      }
      return errorMessage.replace("{field}", fieldName || "Field");
    };
  }

  static getRules() {
    return {
      requiredString: (fieldName) => [
        (value) => Validation.required(value, fieldName),
        (value) => Validation.minLength(value, 1, fieldName),
      ],

      requiredEmail: (fieldName = "Email") => [
        (value) => Validation.required(value, fieldName),
        (value) => Validation.email(value, fieldName),
      ],

      requiredPhone: (fieldName = "Phone") => [
        (value) => Validation.required(value, fieldName),
        (value) => Validation.phone(value, fieldName),
      ],

      optionalEmail: (fieldName = "Email") => [
        (value) => (value ? Validation.email(value, fieldName) : null),
      ],

      positiveNumber: (fieldName) => [
        (value) => Validation.required(value, fieldName),
        (value) =>
          Validation.isPositive(value)
            ? null
            : `${fieldName} must be a positive number`,
      ],

      coordinates: (latFieldName, lonFieldName) => ({
        [latFieldName]: [
          (value) => Validation.required(value, latFieldName),
          (value) =>
            Validation.isValidLatitude(value) ? null : "Invalid latitude",
        ],
        [lonFieldName]: [
          (value) => Validation.required(value, lonFieldName),
          (value) =>
            Validation.isValidLongitude(value) ? null : "Invalid longitude",
        ],
      }),
    };
  }
}

export default Validation;
