import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userId");
      window.location.href = "/user/login";
    }

    if (err.response?.status === 403) {
      console.error("Access denied");
    }

    if (err.response?.status >= 500) {
      console.error("Server error occurred");
    }

    return Promise.reject(err);
  }
);

export const apiService = {
  get: (url, config = {}) => {
    return api.get(url, config);
  },

  post: (url, data = {}, config = {}) => {
    return api.post(url, data, config);
  },

  put: (url, data = {}, config = {}) => {
    return api.put(url, data, config);
  },

  patch: (url, data = {}, config = {}) => {
    return api.patch(url, data, config);
  },

  delete: (url, config = {}) => {
    return api.delete(url, config);
  },

  upload: (url, formData, onUploadProgress = null) => {
    return api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
  },
};

export const authUtils = {
  setToken: (token) => {
    console.log(
      "Setting token in localStorage:",
      token ? `${token.substring(0, 20)}...` : "null"
    );
    localStorage.setItem("token", token);
  },

  getToken: () => {
    const token = localStorage.getItem("token");
    return token;
  },

  removeToken: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userId");
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  getUserInfo: () => {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  },

  setUserInfo: (userInfo) => {
    console.log("Setting user info in localStorage:", userInfo);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  },

  getRefreshToken: () => {
    return localStorage.getItem("refreshToken");
  },

  setRefreshToken: (refreshToken) => {
    localStorage.setItem("refreshToken", refreshToken);
  },

  removeRefreshToken: () => {
    localStorage.removeItem("refreshToken");
  },

  isTokenExpired: (token) => {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return Date.now() >= payload.exp * 1000;
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      return true;
    }
  },

  removeUserInfo: () => {
    localStorage.removeItem("userInfo");
  },
};

export const handleApiError = (err) => {
  if (err.response) {
    const { status, data } = err.response;
    return {
      status,
      message: data.message || data.error || "An error occurred",
      errors: data.errors || {},
    };
  } else if (err.request) {
    return {
      status: 0,
      message: "Network error. Please check your connection.",
      errors: {},
    };
  } else {
    return {
      status: 0,
      message: err.message || "An unexpected error occurred",
      errors: {},
    };
  }
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/users/login",
    REGISTER: "/users/register",
    LOGOUT: "/users/logout",
    REFRESH: "/users/refresh-token",
    FORGOT_PASSWORD: "/users/forgot-password",
    RESET_PASSWORD: "/users/reset-password",
    VERIFY_EMAIL: "/users/verify-email",
    USER: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    UPDATE_PROFILE: "/users/profile",
  },

  USERS: {
    BASE: "/users",
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    DELETE_ACCOUNT: "/users/profile",
    UPLOAD_AVATAR: "/users/upload-avatar",
    ANALYTICS: "/users/analytics",
    DASHBOARD_ANALYTICS: "/users/dashboard/analytics",
    UPLOAD_PROFILE_PICTURE: "/users/profile/upload-picture",
    DELETE_PROFILE_PICTURE: "/users/profile/picture",
    DELETION_CHECK: "/users/profile/deletion-check",
  },

  UPLOADS: {
    BASE: "/uploads",
    FILE: "/uploads/file",
    AVATAR: "/uploads/avatar",
    PROFILE_PICTURE: "/uploads/profile-picture",
    BUS_IMAGE: "/uploads/bus-image",
    ROUTE_MAP: "/uploads/route-map",
    DOCUMENT: "/uploads/document",
    CSV_IMPORT: "/uploads/csv-import",
    MULTIPLE: "/uploads/multiple",
  },

  BUS: {
    BASE: "/buses",
    ROUTES: "/routes",
    TRACKING: "/tracking",
  },
};

export default api;
