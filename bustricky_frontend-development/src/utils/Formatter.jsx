/* eslint-disable react-refresh/only-export-components */
// Formatter.jsx - Formatting utilities for bus tracking system

import {
  BUS_STATUS_LABELS,
  DATE_FORMATS,
  DISTANCE_UNITS,
  LANGUAGE_LABELS,
  LANGUAGES,
  SRI_LANKA,
  TIME,
  VALIDATION_LIMITS,
} from "./CONSTANTS.js";

/**
 * Date and Time Formatting
 */
export const formatDate = (date, format = DATE_FORMATS.DISPLAY) => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const pad = (num) => num.toString().padStart(2, "0");

  const formatMap = {
    YYYY: d.getFullYear(),
    MM: pad(d.getMonth() + 1),
    DD: pad(d.getDate()),
    HH: pad(d.getHours()),
    mm: pad(d.getMinutes()),
    ss: pad(d.getSeconds()),
    sss: d.getMilliseconds().toString().padStart(3, "0"),
  };

  let formatted = format;
  Object.entries(formatMap).forEach(([key, value]) => {
    formatted = formatted.replace(new RegExp(key, "g"), value);
  });

  return formatted;
};

export const formatTime = (date) => {
  return formatDate(date, DATE_FORMATS.TIME_ONLY);
};

export const formatDateTime = (date) => {
  return formatDate(date, DATE_FORMATS.FULL);
};

export const formatISODate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString();
};

export const formatRelativeTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const target = new Date(date);
  const diffMs = Math.abs(now - target);
  const isPast = target < now;

  const units = [
    { name: "year", ms: 365 * TIME.DAY },
    { name: "month", ms: 30 * TIME.DAY },
    { name: "week", ms: TIME.WEEK },
    { name: "day", ms: TIME.DAY },
    { name: "hour", ms: TIME.HOUR },
    { name: "minute", ms: TIME.MINUTE },
    { name: "second", ms: TIME.SECOND },
  ];

  for (const unit of units) {
    const value = Math.floor(diffMs / unit.ms);
    if (value >= 1) {
      const suffix = value === 1 ? unit.name : `${unit.name}s`;
      return isPast ? `${value} ${suffix} ago` : `in ${value} ${suffix}`;
    }
  }

  return "just now";
};

export const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return "0s";

  const hours = Math.floor(milliseconds / TIME.HOUR);
  const minutes = Math.floor((milliseconds % TIME.HOUR) / TIME.MINUTE);
  const seconds = Math.floor((milliseconds % TIME.MINUTE) / TIME.SECOND);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
};

/**
 * Currency Formatting
 */
export const formatCurrency = (amount, options = {}) => {
  if (amount === null || amount === undefined) return "";

  const {
    symbol = SRI_LANKA.CURRENCY_SYMBOL,
    showSymbol = true,
    decimals = 2,
  } = options;

  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) return "";

  const formatted = numericAmount.toLocaleString("en-LK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `${symbol} ${formatted}` : formatted;
};

export const formatFare = (fare) => {
  return formatCurrency(fare, { decimals: 0 });
};

/**
 * Distance and Location Formatting
 */
export const formatDistance = (
  meters,
  unit = DISTANCE_UNITS.KILOMETERS,
  decimals = 1
) => {
  if (!meters || meters < 0) return "0 m";

  let formattedDistance;
  switch (unit) {
    case DISTANCE_UNITS.METERS:
      formattedDistance = `${Math.round(meters)} m`;
      break;
    case DISTANCE_UNITS.KILOMETERS: {
      const km = meters / 1000;
      formattedDistance =
        km >= 1 ? `${km.toFixed(decimals)} km` : `${Math.round(meters)} m`;
      break;
    }
    case DISTANCE_UNITS.MILES: {
      const miles = meters / 1609.344;
      formattedDistance = `${miles.toFixed(decimals)} mi`;
      break;
    }
    default:
      formattedDistance = `${Math.round(meters)} m`;
  }

  return formattedDistance;
};

export const formatCoordinates = (lat, lng, precision = 4) => {
  if (!lat || !lng) return "";
  return `${Number(lat).toFixed(precision)}, ${Number(lng).toFixed(precision)}`;
};

export const formatSpeed = (speedKmh) => {
  if (!speedKmh || speedKmh < 0) return "0 km/h";
  return `${Math.round(speedKmh)} km/h`;
};

/**
 * Phone Number Formatting
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, "");

  // Handle Sri Lankan phone numbers
  if (cleaned.startsWith("+94")) {
    const number = cleaned.substring(3);
    if (number.length === 9) {
      return `+94 ${number.substring(0, 2)} ${number.substring(
        2,
        5
      )} ${number.substring(5)}`;
    }
  } else if (cleaned.startsWith("0")) {
    const number = cleaned.substring(1);
    if (number.length === 9) {
      return `0${number.substring(0, 2)} ${number.substring(
        2,
        5
      )} ${number.substring(5)}`;
    }
  } else if (cleaned.length === 9) {
    return `0${cleaned.substring(0, 2)} ${cleaned.substring(
      2,
      5
    )} ${cleaned.substring(5)}`;
  }

  return phone; // Return original if formatting fails
};

/**
 * Bus and Route Formatting
 */
export const formatBusNumber = (busNumber) => {
  if (!busNumber) return "";
  return busNumber.toString().padStart(3, "0");
};

export const formatRouteNumber = (routeNumber) => {
  if (!routeNumber) return "";
  return routeNumber.toString().toUpperCase();
};

export const formatBusStatus = (status) => {
  return BUS_STATUS_LABELS[status] || status;
};

export const formatCapacity = (current, total) => {
  if (!total) return "";
  const percentage = Math.round((current / total) * 100);
  return `${current}/${total} (${percentage}%)`;
};

/**
 * Text Formatting
 */
export const formatName = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const formatEmail = (email) => {
  if (!email) return "";
  return email.toLowerCase().trim();
};

export const truncateText = (text, maxLength = 50, suffix = "...") => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

export const formatDescription = (description, maxLength = 100) => {
  return truncateText(description, maxLength);
};

/**
 * Number Formatting
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return "";
  const numericValue = Number(number);
  if (isNaN(numericValue)) return "";

  return numericValue.toLocaleString("en-LK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPercentage = (value, total, decimals = 1) => {
  if (!total || total === 0) return "0%";
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
};

/**
 * Address and Location Formatting
 */
export const formatAddress = (addressObj) => {
  if (!addressObj) return "";

  const { street, city, district, province, postalCode } = addressObj;
  const parts = [street, city, district, province, postalCode].filter(Boolean);
  return parts.join(", ");
};

export const formatStopName = (stopName, routeName) => {
  if (!stopName) return "";
  const formatted = formatName(stopName);
  return routeName ? `${formatted} (${routeName})` : formatted;
};

/**
 * Schedule and Frequency Formatting
 */
export const formatFrequency = (minutes) => {
  if (!minutes) return "";

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return hours === 1 ? "1 hour" : `${hours} hours`;
    }
    return `${hours}h ${remainingMinutes}m`;
  }

  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
};

export const formatScheduleTime = (timeString) => {
  if (!timeString) return "";

  // Handle both HH:mm and HH:mm:ss formats
  const timeParts = timeString.split(":");
  if (timeParts.length >= 2) {
    const hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes} ${period}`;
  }

  return timeString;
};

/**
 * Validation and Input Formatting
 */
export const formatInput = (value, type = "text") => {
  if (!value) return "";

  switch (type) {
    case "phone":
      return formatPhoneNumber(value);
    case "email":
      return formatEmail(value);
    case "name":
      return formatName(value);
    case "currency":
      return formatCurrency(value);
    default:
      return value.toString().trim();
  }
};

export const sanitizeInput = (input) => {
  if (!input) return "";
  return input.toString().replace(/[<>]/g, "");
};

/**
 * Status and State Formatting
 */
export const formatConnectionStatus = (isConnected, lastSeen) => {
  if (isConnected) return "Online";
  if (!lastSeen) return "Offline";

  const timeSince = formatRelativeTime(lastSeen);
  return `Offline (${timeSince})`;
};

export const formatDataFreshness = (timestamp) => {
  if (!timestamp) return "No data";

  const age = Date.now() - new Date(timestamp).getTime();
  if (age < TIME.MINUTE) return "Live";
  if (age < 5 * TIME.MINUTE) return "Recent";
  if (age < 15 * TIME.MINUTE) return "Stale";
  return "Outdated";
};

/**
 * List and Array Formatting
 */
export const formatList = (items, conjunction = "and", maxItems = 3) => {
  if (!items || !Array.isArray(items) || items.length === 0) return "";

  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

  if (items.length <= maxItems) {
    const allButLast = items.slice(0, -1).join(", ");
    return `${allButLast}, ${conjunction} ${items[items.length - 1]}`;
  }

  const visible = items.slice(0, maxItems);
  const remaining = items.length - maxItems;
  return `${visible.join(", ")}, ${conjunction} ${remaining} more`;
};

export const formatRouteStops = (stops, maxStops = 3) => {
  if (!stops || !Array.isArray(stops)) return "";

  const stopNames = stops.map((stop) =>
    typeof stop === "string" ? stop : stop.name || stop.stopName
  );

  if (stopNames.length <= maxStops) {
    return stopNames.join(" → ");
  }

  const firstStops = stopNames.slice(0, maxStops - 1);
  const lastStop = stopNames[stopNames.length - 1];
  const hiddenCount = stopNames.length - maxStops;

  return `${firstStops.join(" → ")} → ... (+${hiddenCount}) → ${lastStop}`;
};

/**
 * Search and Filter Formatting
 */
export const formatSearchQuery = (query) => {
  if (!query) return "";
  return query.toString().trim().toLowerCase();
};

export const highlightSearchTerm = (text, searchTerm) => {
  if (!text || !searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
};

/**
 * Error and Message Formatting
 */
export const formatErrorMessage = (error) => {
  if (!error) return "An unknown error occurred";

  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.error) return error.error;

  return "An unexpected error occurred";
};

export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== "object") return [];

  return Object.entries(errors).map(([field, message]) => ({
    field: formatName(field.replace(/_/g, " ")),
    message: Array.isArray(message) ? message[0] : message,
  }));
};

/**
 * User and Profile Formatting
 */
export const formatUserName = (user) => {
  if (!user) return "";

  if (user.firstName && user.lastName) {
    return `${formatName(user.firstName)} ${formatName(user.lastName)}`;
  }

  if (user.name) return formatName(user.name);
  if (user.username) return user.username;
  if (user.email) return user.email;

  return "Unknown User";
};

export const formatUserRole = (role) => {
  if (!role) return "";
  return formatName(role.replace(/_/g, " "));
};

export const formatInitials = (name) => {
  if (!name) return "";

  const words = name.trim().split(" ");
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

/**
 * Language and Localization
 */
export const formatLanguage = (langCode) => {
  return LANGUAGE_LABELS[langCode] || langCode;
};

export const formatTextByLanguage = (textObj, currentLang = LANGUAGES.EN) => {
  if (!textObj || typeof textObj !== "object") return textObj;

  return (
    textObj[currentLang] ||
    textObj[LANGUAGES.EN] ||
    Object.values(textObj)[0] ||
    ""
  );
};

/**
 * Data Export Formatting
 */
export const formatForExport = (data, format = "csv") => {
  if (!data || !Array.isArray(data)) return "";

  switch (format.toLowerCase()) {
    case "csv": {
      if (data.length === 0) return "";

      const headers = Object.keys(data[0]);
      const csvHeaders = headers.join(",");
      const csvRows = data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      );

      return [csvHeaders, ...csvRows].join("\n");
    }
    case "json":
      return JSON.stringify(data, null, 2);

    default:
      return JSON.stringify(data);
  }
};

/**
 * URL and Route Formatting
 */
export const formatApiUrl = (endpoint, params = {}) => {
  let url = endpoint;

  // Replace URL parameters
  Object.entries(params).forEach(([paramKey, value]) => {
    url = url.replace(`:${paramKey}`, encodeURIComponent(value));
  });

  return url;
};

export const formatQueryString = (params) => {
  if (!params || typeof params !== "object") return "";

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([paramKey, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(paramKey, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

/**
 * Notification Formatting
 */
export const formatNotificationTitle = (
  title,
  maxLength = VALIDATION_LIMITS.MAX_NOTIFICATION_TITLE
) => {
  return truncateText(title, maxLength);
};

export const formatNotificationMessage = (
  message,
  maxLength = VALIDATION_LIMITS.MAX_NOTIFICATION_MESSAGE
) => {
  return truncateText(message, maxLength);
};

/**
 * Chart and Analytics Formatting
 */
export const formatChartData = (data, xKey, yKey) => {
  if (!data || !Array.isArray(data)) return [];

  return data.map((item) => ({
    x: item[xKey],
    y: Number(item[yKey]) || 0,
    label: item.label || item[xKey],
  }));
};

export const formatAnalyticsValue = (value, type = "number") => {
  switch (type) {
    case "percentage":
      return `${Number(value).toFixed(1)}%`;
    case "currency":
      return formatCurrency(value);
    case "duration":
      return formatDuration(value);
    case "distance":
      return formatDistance(value);
    default:
      return formatNumber(value);
  }
};

/**
 * Utility Formatters
 */
export const formatBoolean = (value, trueLabel = "Yes", falseLabel = "No") => {
  return value ? trueLabel : falseLabel;
};

export const formatArray = (array, separator = ", ") => {
  if (!array || !Array.isArray(array)) return "";
  return array.filter(Boolean).join(separator);
};

export const formatObject = (
  obj,
  keyValueSeparator = ": ",
  entrySeparator = ", "
) => {
  if (!obj || typeof obj !== "object") return "";

  return Object.entries(obj)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${formatName(key)}${keyValueSeparator}${value}`)
    .join(entrySeparator);
};

/**
 * Input Masks and Patterns
 */
export const applyInputMask = (value, type) => {
  if (!value) return "";

  switch (type) {
    case "phone":
      return value.replace(/\D/g, "").substring(0, 10);
    case "time":
      return value.replace(/[^\d:]/g, "").substring(0, 5);
    case "busNumber":
      return value.replace(/\D/g, "").substring(0, 4);
    case "routeNumber":
      return value.replace(/[^a-zA-Z0-9]/g, "").substring(0, 10);
    default:
      return value;
  }
};

/**
 * Sorting and Comparison Helpers
 */
export const formatSortKey = (item, sortBy) => {
  if (!item || !sortBy) return "";

  const value = item[sortBy];

  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") return value.toLowerCase();

  return String(value || "").toLowerCase();
};

// Default export with all formatters organized by category
const Formatter = {
  // Date and Time
  date: formatDate,
  time: formatTime,
  dateTime: formatDateTime,
  isoDate: formatISODate,
  relativeTime: formatRelativeTime,
  duration: formatDuration,

  // Currency
  currency: formatCurrency,
  fare: formatFare,

  // Distance and Location
  distance: formatDistance,
  coordinates: formatCoordinates,
  speed: formatSpeed,

  // Phone
  phone: formatPhoneNumber,

  // Bus and Route
  busNumber: formatBusNumber,
  routeNumber: formatRouteNumber,
  busStatus: formatBusStatus,
  capacity: formatCapacity,

  // Text
  name: formatName,
  email: formatEmail,
  truncate: truncateText,
  description: formatDescription,

  // Numbers
  number: formatNumber,
  percentage: formatPercentage,
  fileSize: formatFileSize,

  // Address
  address: formatAddress,
  stopName: formatStopName,

  // Schedule
  frequency: formatFrequency,
  scheduleTime: formatScheduleTime,

  // Language
  language: formatLanguage,
  textByLanguage: formatTextByLanguage,

  // Export
  forExport: formatForExport,

  // URL
  apiUrl: formatApiUrl,
  queryString: formatQueryString,

  // Notifications
  notificationTitle: formatNotificationTitle,
  notificationMessage: formatNotificationMessage,

  // Charts
  chartData: formatChartData,
  analyticsValue: formatAnalyticsValue,

  // Utilities
  boolean: formatBoolean,
  array: formatArray,
  object: formatObject,
  input: formatInput,
  sanitize: sanitizeInput,
  connectionStatus: formatConnectionStatus,
  dataFreshness: formatDataFreshness,
  list: formatList,
  routeStops: formatRouteStops,
  searchQuery: formatSearchQuery,
  highlightSearch: highlightSearchTerm,
  errorMessage: formatErrorMessage,
  validationErrors: formatValidationErrors,
  userName: formatUserName,
  userRole: formatUserRole,
  initials: formatInitials,
  inputMask: applyInputMask,
  sortKey: formatSortKey,
};

export default Formatter;
