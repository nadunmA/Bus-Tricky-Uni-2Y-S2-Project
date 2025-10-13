import { API_ENDPOINTS, apiService, authUtils, handleApiError } from "./api";

export class UserService {
  static async login(credentials) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      let token, user;

      if (response.data) {
        if (response.data.token && response.data.user) {
          token = response.data.token;
          user = response.data.user;
        } else if (
          response.data.data &&
          response.data.data.token &&
          response.data.data.user
        ) {
          token = response.data.data.token;
          user = response.data.data.user;
        } else if (response.data.accessToken && response.data.user) {
          token = response.data.accessToken;
          user = response.data.user;
        } else if (response.data.jwt && response.data.user) {
          token = response.data.jwt;
          user = response.data.user;
        } else if (response.data.user && response.data.user.token) {
          user = response.data.user;
          token = user.token;
          delete user.token;
        } else {
          throw new Error("Invalid response format from server");
        }
      } else {
        throw new Error("No data received from server");
      }

      if (!token || !user) {
        throw new Error("Missing token or user data in response");
      }

      authUtils.setToken(token);
      authUtils.setUserInfo(user);

      return {
        success: true,
        data: { token, user },
        message: "Login successful",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);

      let message = errorInfo.message;
      if (err.response?.status === 401) {
        message = "Invalid email or password";
      } else if (err.response?.status === 429) {
        message = "Too many login attempts. Please wait and try again.";
      } else if (err.response?.status === 500) {
        message = "Server error. Please try again later.";
      } else if (err.code === "NETWORK_ERROR") {
        message = "Network error. Please check your connection.";
      }

      return {
        success: false,
        error: errorInfo,
        message: message,
      };
    }
  }

  static async register(userData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );
      const { token, user } = response.data;

      authUtils.setToken(token);
      authUtils.setUserInfo(user);

      return {
        success: true,
        data: { token, user },
        message: "Registration successful",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async logout() {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
      authUtils.removeToken();

      return {
        success: true,
        message: "Logout successful",
      };
    } catch {
      authUtils.removeToken();
      return {
        success: true,
        message: "Logged out locally",
      };
    }
  }

  static async forgotPassword(email) {
    try {
      const response = await apiService.post("/users/forgot-password", {
        email,
      });

      return {
        success: true,
        data: response.data,
        message: "Password reset email sent successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message || "Failed to send reset email",
      };
    }
  }

  static async resetPassword(token, newPassword) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        {
          token,
          password: newPassword,
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Password reset successful",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async verifyEmail(token) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
        token,
      });

      return {
        success: true,
        data: response.data,
        message: "Email verified successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async getProfile() {
    try {
      const response = await apiService.get(API_ENDPOINTS.USERS.PROFILE);

      return {
        success: true,
        data: response.data,
        message: "Profile fetched successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async updateProfile(profileData) {
    try {
      const response = await apiService.put("/users/profile", profileData);

      if (response.data?.data) {
        authUtils.setUserInfo(response.data.data);
      }

      return {
        success: true,
        data: response.data,
        message: "Profile updated successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async changePassword(passwordData) {
    try {
      const response = await apiService.put("/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      return {
        success: true,
        data: response.data,
        message: "Password changed successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await apiService.upload(
        API_ENDPOINTS.USERS.UPLOAD_AVATAR,
        formData,
        (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${progress}%`);
        }
      );

      const currentUser = authUtils.getUserInfo();
      if (currentUser) {
        const updatedUser = { ...currentUser, avatar: response.data.avatar };
        authUtils.setUserInfo(updatedUser);
      }

      return {
        success: true,
        data: response.data,
        message: "Avatar uploaded successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async deleteAccount(password, reason = "") {
    try {
      if (!password) {
        throw new Error("Password is required for account deletion");
      }

      const response = await apiService.delete("/users/profile", {
        data: {
          password,
          reason,
        },
      });

      authUtils.removeToken();
      authUtils.removeUserInfo();
      authUtils.removeRefreshToken();

      const keysToRemove = [
        "userInfo",
        "token",
        "authToken",
        "userId",
        "user_id",
        "user",
        "refreshToken",
        "sessionData",
        "currentUser",
      ];
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      return {
        success: true,
        data: response.data,
        message: "Account deleted successfully",
      };
    } catch (err) {
      let message = "Failed to delete account";
      if (err.response?.status === 401) {
        message = "Invalid password provided";
      } else if (err.response?.status === 404) {
        message = "User account not found";
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }

      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: message,
      };
    }
  }

  static async getAllUsers(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams
        ? `${API_ENDPOINTS.USERS.BASE}?${queryParams}`
        : API_ENDPOINTS.USERS.BASE;

      const response = await apiService.get(url);

      return {
        success: true,
        data: response.data,
        message: "Users fetched successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async getUserById(userId) {
    try {
      const response = await apiService.get(
        `${API_ENDPOINTS.USERS.BASE}/${userId}`
      );

      return {
        success: true,
        data: response.data,
        message: "User fetched successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async createUser(userData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.USERS.BASE,
        userData
      );

      return {
        success: true,
        data: response.data,
        message: "User created successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async updateUser(userId, userData) {
    try {
      const response = await apiService.put(
        `${API_ENDPOINTS.USERS.BASE}/${userId}`,
        userData
      );

      return {
        success: true,
        data: response.data,
        message: "User updated successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async deleteUser(userId) {
    try {
      const response = await apiService.delete(
        `${API_ENDPOINTS.USERS.BASE}/${userId}`
      );

      return {
        success: true,
        data: response.data,
        message: "User deleted successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async updateUserRole(userId, role) {
    try {
      const response = await apiService.patch(
        `${API_ENDPOINTS.USERS.BASE}/${userId}/role`,
        { role }
      );

      return {
        success: true,
        data: response.data,
        message: "User role updated successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async toggleUserStatus(userId) {
    try {
      const response = await apiService.patch(
        `${API_ENDPOINTS.USERS.BASE}/${userId}/toggle-status`
      );

      return {
        success: true,
        data: response.data,
        message: "User status updated successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async searchUsers(searchTerm, filters = {}) {
    try {
      const params = {
        search: searchTerm,
        ...filters,
      };

      const queryParams = new URLSearchParams(params).toString();
      const response = await apiService.get(
        `${API_ENDPOINTS.USERS.BASE}/search?${queryParams}`
      );

      return {
        success: true,
        data: response.data,
        message: "Search completed successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async refreshToken() {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.REFRESH);
      const { token } = response.data;

      authUtils.setToken(token);

      return {
        success: true,
        data: { token },
        message: "Token refreshed successfully",
      };
    } catch (err) {
      authUtils.removeToken();
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async bulkDeleteUsers(userIds) {
    try {
      const response = await apiService.post(
        `${API_ENDPOINTS.USERS.BASE}/bulk-delete`,
        {
          userIds,
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Users deleted successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async bulkUpdateUsers(updates) {
    try {
      const response = await apiService.post(
        `${API_ENDPOINTS.USERS.BASE}/bulk-update`,
        {
          updates,
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Users updated successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async exportUsers(format = "csv", filters = {}) {
    try {
      const params = {
        format,
        ...filters,
      };

      const queryParams = new URLSearchParams(params).toString();
      const response = await apiService.get(
        `${API_ENDPOINTS.USERS.BASE}/export?${queryParams}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `users.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return {
        success: true,
        message: "Export completed successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async registerDriver(driverData) {
    try {
      const requiredDriverFields = [
        "licenseNumber",
        "licenseExpiry",
        "vehicleNumber",
        "yearsOfExperience",
        "emergencyContact",
      ];

      const missingFields = requiredDriverFields.filter(
        (field) => !driverData[field]
      );
      if (missingFields.length > 0) {
        throw new Error(
          `Missing required driver fields: ${missingFields.join(", ")}`
        );
      }

      // Validate license expiry date
      const today = new Date();
      const expiryDate = new Date(driverData.licenseExpiry);
      if (expiryDate <= today) {
        throw new Error("License expiry date must be in the future");
      }

      const registrationPayload = {
        firstName: driverData.firstName,
        lastName: driverData.lastName,
        email: driverData.email,
        phoneNumber: driverData.phoneNumber,
        password: driverData.password,
        role: "driver",

        country: driverData.country || "Sri Lanka",
        city: driverData.city || "",
        state: driverData.state || "",
        zipCode: driverData.zipCode || "",

        licenseNumber: driverData.licenseNumber.trim(),
        licenseExpiry: driverData.licenseExpiry,
        vehicleNumber: driverData.vehicleNumber.trim(),
        yearsOfExperience: driverData.yearsOfExperience,
        emergencyContact: driverData.emergencyContact.trim(),

        dateOfBirth: driverData.dateOfBirth || null,
        gender: driverData.gender || null,
      };

      const response = await apiService.post(
        API_ENDPOINTS.AUTH.REGISTER,
        registrationPayload
      );

      if (response.data?.success) {
        const { token, user } = response.data;

        authUtils.setToken(token);
        authUtils.setUserInfo(user);

        return {
          success: true,
          data: { token, user },
          message: "Driver registration successful",
        };
      } else {
        throw new Error(response.data?.message || "Registration failed");
      }
    } catch (err) {
      const errorInfo = handleApiError(err);

      let message = errorInfo.message;
      if (err.response?.status === 400) {
        if (err.response.data?.message?.includes("license")) {
          message = "Invalid license information. Please check your details.";
        } else if (err.response.data?.message?.includes("email")) {
          message = "Email already exists. Please use a different email.";
        } else if (err.response.data?.message?.includes("validation")) {
          message = "Please check all required fields are filled correctly.";
        }
      }

      return {
        success: false,
        error: errorInfo,
        message: message,
      };
    }
  }

  static async getDriverProfile() {
    try {
      const response = await apiService.get(API_ENDPOINTS.USERS.PROFILE);

      if (response.success || response.data) {
        let userData = response.data?.data || response.data;

        if (userData.role === "driver") {
          const driverFields = [
            "licenseNumber",
            "licenseExpiry",
            "vehicleNumber",
            "yearsOfExperience",
            "emergencyContact",
          ];

          const missingDriverData = driverFields.filter(
            (field) => !userData[field] || userData[field] === "Not provided"
          );

          if (missingDriverData.length > 0) {
            userData._profileIncomplete = true;
            userData._missingFields = missingDriverData;
          }
        }

        return {
          success: true,
          data: userData,
          message: "Driver profile fetched successfully",
        };
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async updateDriverProfile(driverData) {
    try {
      const validation = this.validateDriverProfile(driverData);
      if (!validation.isValid) {
        throw new Error(
          `Validation failed: ${Object.values(validation.errors).join(", ")}`
        );
      }

      const updateData = {
        ...driverData,

        weeklySchedule: driverData.weeklySchedule || {},
        preferredRoutes: Array.isArray(driverData.preferredRoutes)
          ? driverData.preferredRoutes
          : [],
        availableForOvertime: Boolean(driverData.availableForOvertime),
        maximumWorkingHours: Number(driverData.maximumWorkingHours) || 8,

        currentRoute: driverData.currentRoute?.trim() || "",
        employmentStatus: driverData.employmentStatus || "",
        shiftPreference: driverData.shiftPreference || "",
        salary: driverData.salary ? Number(driverData.salary) : null,
        specialQualifications: driverData.specialQualifications?.trim() || "",

        medicalCertificateExpiry: driverData.medicalCertificateExpiry || null,
        bloodType: driverData.bloodType || "",
        medicalConditions: driverData.medicalConditions?.trim() || "",
      };

      const response = await apiService.put(
        API_ENDPOINTS.USERS.UPDATE_PROFILE,
        updateData
      );

      if (response.data?.data) {
        authUtils.setUserInfo(response.data.data);
      }

      return {
        success: true,
        data: response.data,
        message: "Driver profile updated successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static checkDriverProfileCompleteness(userData) {
    if (!userData || userData.role !== "driver") {
      return { complete: false, percentage: 0, missingFields: [] };
    }

    const requiredFields = [
      { field: "firstName", label: "First Name" },
      { field: "lastName", label: "Last Name" },
      { field: "email", label: "Email" },
      { field: "phoneNumber", label: "Phone Number" },
      { field: "licenseNumber", label: "License Number" },
      { field: "licenseExpiry", label: "License Expiry" },
      { field: "vehicleNumber", label: "Vehicle Number" },
      { field: "yearsOfExperience", label: "Years of Experience" },
      { field: "emergencyContact", label: "Emergency Contact" },
    ];

    const optionalFields = [
      { field: "dateOfBirth", label: "Date of Birth" },
      { field: "gender", label: "Gender" },
      { field: "profilePicture", label: "Profile Picture" },
      { field: "address.city", label: "City" },
      { field: "address.state", label: "State" },
    ];

    const missingRequired = [];
    const missingOptional = [];

    requiredFields.forEach(({ field, label }) => {
      const value = field.includes(".")
        ? field.split(".").reduce((obj, key) => obj?.[key], userData)
        : userData[field];

      if (
        !value ||
        value === "Not provided" ||
        value === "Not specified" ||
        value === "Not assigned"
      ) {
        missingRequired.push(label);
      }
    });

    optionalFields.forEach(({ field, label }) => {
      const value = field.includes(".")
        ? field.split(".").reduce((obj, key) => obj?.[key], userData)
        : userData[field];

      if (!value || value === "Not provided" || value === "Not specified") {
        missingOptional.push(label);
      }
    });

    const totalFields = requiredFields.length + optionalFields.length;
    const completedFields =
      totalFields - missingRequired.length - missingOptional.length;
    const percentage = Math.round((completedFields / totalFields) * 100);

    return {
      complete: missingRequired.length === 0,
      percentage,
      missingFields: missingRequired,
      optionalFields: missingOptional,
      requiredComplete: missingRequired.length === 0,
    };
  }

  static validateDriverProfile(driverData) {
    const errors = {};

    if (driverData.weeklySchedule) {
      const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];

      days.forEach((day) => {
        const schedule = driverData.weeklySchedule[day];
        if (schedule && schedule.isWorking) {
          if (!schedule.startTime) {
            errors[`${day}_startTime`] = `Start time is required for ${day}`;
          }
          if (!schedule.endTime) {
            errors[`${day}_endTime`] = `End time is required for ${day}`;
          }
          if (schedule.startTime && schedule.endTime) {
            const start = new Date(`2000-01-01 ${schedule.startTime}`);
            const end = new Date(`2000-01-01 ${schedule.endTime}`);
            if (start >= end) {
              errors[
                `${day}_time`
              ] = `End time must be after start time for ${day}`;
            }
          }
        }
      });
    }

    if (driverData.maximumWorkingHours) {
      if (
        driverData.maximumWorkingHours < 1 ||
        driverData.maximumWorkingHours > 24
      ) {
        errors.maximumWorkingHours = "Working hours must be between 1 and 24";
      }
    }

    if (driverData.salary && driverData.salary < 0) {
      errors.salary = "Salary cannot be negative";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static async uploadProfilePicture(file, onProgress = null) {
    try {
      if (!file) {
        throw new Error("No file provided");
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Please select a valid image file (JPG, PNG, GIF)");
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("File size must be less than 5MB");
      }

      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await apiService.post(
        "/users/profile/upload-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.lengthComputable) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(progress);
            }
          },
        }
      );

      const currentUser = authUtils.getUserInfo();
      if (currentUser && response.data?.data?.profilePicture) {
        const updatedUser = {
          ...currentUser,
          profilePicture: response.data.data.profilePicture,
        };
        authUtils.setUserInfo(updatedUser);
      }

      return {
        success: true,
        data: response.data,
        message: "Profile picture uploaded successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: err.message || errorInfo.message,
      };
    }
  }

  static async deleteProfilePicture() {
    try {
      const response = await apiService.delete("/users/profile/picture");

      const currentUser = authUtils.getUserInfo();
      if (currentUser) {
        const updatedUser = { ...currentUser, profilePicture: null };
        authUtils.setUserInfo(updatedUser);
      }

      return {
        success: true,
        data: response.data,
        message: "Profile picture deleted successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  static async checkDeletionEligibility() {
    try {
      const response = await apiService.get("/users/profile/deletion-check");

      return {
        success: true,
        data: response.data,
        message: "Deletion eligibility checked",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);
      return {
        success: false,
        error: errorInfo,
        message: errorInfo.message,
      };
    }
  }

  // Replace the suspendUser and activateUser methods with these:

  static async suspendUser(userId) {
    try {
      // Use the updateUser method instead of a dedicated endpoint
      const response = await apiService.put(
        `${API_ENDPOINTS.USERS.BASE}/${userId}`,
        {
          isActive: false,
          status: "suspended",
        }
      );

      return {
        success: true,
        data: response.data,
        message: "User account suspended successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);

      // More detailed error handling
      let message = errorInfo.message;
      if (err.response?.status === 404) {
        message = "User not found. They may have already been deleted.";
      } else if (err.response?.status === 403) {
        message = "Permission denied. Admin access required.";
      } else if (err.response?.status === 401) {
        message = "Authentication failed. Please login again.";
      }

      return {
        success: false,
        error: errorInfo,
        message: message,
      };
    }
  }

  static async activateUser(userId) {
    try {
      // Use the updateUser method instead of a dedicated endpoint
      const response = await apiService.put(
        `${API_ENDPOINTS.USERS.BASE}/${userId}`,
        {
          isActive: true,
          status: "active",
        }
      );

      return {
        success: true,
        data: response.data,
        message: "User account activated successfully",
      };
    } catch (err) {
      const errorInfo = handleApiError(err);

      // More detailed error handling
      let message = errorInfo.message;
      if (err.response?.status === 404) {
        message = "User not found. They may have already been deleted.";
      } else if (err.response?.status === 403) {
        message = "Permission denied. Admin access required.";
      } else if (err.response?.status === 401) {
        message = "Authentication failed. Please login again.";
      }

      return {
        success: false,
        error: errorInfo,
        message: message,
      };
    }
  }
}

export default UserService;
