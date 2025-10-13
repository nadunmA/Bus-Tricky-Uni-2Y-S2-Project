import {
  ArrowLeft,
  Camera,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Save,
  Settings,
  Shield,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService, handleApiError } from "../services/api";

const EditProfile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
    dateOfBirth: "",
    gender: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [activeSection, setActiveSection] = useState("personal");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const fetchUserProfile = useCallback(async () => {
    try {
      setIsLoadingData(true);
      setError("");

      let response = null;
      let userData = null;

      try {
        response = await apiService.get("/users/profile");
        userData = response.data?.data || response.data;
      } catch (profileError) {
        console.warn(
          "Profile endpoint failed, trying auth endpoint:",
          profileError
        );

        try {
          response = await apiService.get("/auth/user");
          userData = response.data?.data || response.data;
        } catch (authError) {
          console.warn("Auth endpoint also failed:", authError);
          throw new Error("Failed to fetch user profile from both endpoints");
        }
      }

      if (!userData) {
        throw new Error("No user data received from server");
      }

      const mappedFormData = {
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        address: "",
        city: "",
        province: "",
        postalCode: "",
        country: "",
        dateOfBirth: userData.dateOfBirth
          ? new Date(userData.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: userData.gender || "",
      };

      if (userData.address && typeof userData.address === "object") {
        mappedFormData.city = userData.address.city || "";
        mappedFormData.province = userData.address.state || "";
        mappedFormData.postalCode = userData.address.zipCode || "";
        mappedFormData.country = userData.address.country || "";

        mappedFormData.address = userData.address.street || "";
      } else if (typeof userData.address === "string") {
        mappedFormData.address = userData.address;
      }

      if (!mappedFormData.country && userData.country) {
        mappedFormData.country = userData.country;
      }

      if (!mappedFormData.country) {
        mappedFormData.country = "Sri Lanka";
      }

      setFormData(mappedFormData);
    } catch (error) {
      const errorInfo = handleApiError(error);
      setError(errorInfo.message || "Failed to load profile data");
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  // Add these comprehensive validation functions

  const validateCountry = (country) => {
    if (!country || !country.trim()) return false;
    const trimmedCountry = country.trim();

    // Check length
    if (trimmedCountry.length < 2 || trimmedCountry.length > 100) return false;

    // Only allow letters, spaces, commas, periods, hyphens, and apostrophes (NO NUMBERS)
    return /^[a-zA-Z\s',.-]+$/.test(trimmedCountry);
  };

  const validateCity = (city) => {
    if (!city || !city.trim()) return false;
    const trimmedCity = city.trim();

    // Check length
    if (trimmedCity.length < 2 || trimmedCity.length > 100) return false;

    // Only allow letters, spaces, commas, periods, hyphens, and apostrophes (NO NUMBERS)
    return /^[a-zA-Z\s',.-]+$/.test(trimmedCity);
  };

  const validateProvince = (province) => {
    if (!province || !province.trim()) return false;
    const trimmedProvince = province.trim();

    // Check length
    if (trimmedProvince.length < 2 || trimmedProvince.length > 100)
      return false;

    // Only allow letters, spaces, commas, periods, hyphens, and apostrophes (NO NUMBERS)
    return /^[a-zA-Z\s',.-]+$/.test(trimmedProvince);
  };

  const validateAddress = (address) => {
    if (!address || !address.trim()) return true; // Optional field
    const trimmedAddress = address.trim();

    // Check length
    if (trimmedAddress.length < 5 || trimmedAddress.length > 200) return false;

    // Allow letters, numbers, spaces, and common address characters
    return /^[a-zA-Z0-9\s,./\-#']+$/.test(trimmedAddress);
  };

  const validateName = (name) => {
    if (!name || !name.trim()) return false;
    const trimmedName = name.trim();

    // Check length
    if (trimmedName.length < 2 || trimmedName.length > 50) return false;

    // Only allow letters, spaces, hyphens, and apostrophes (NO NUMBERS)
    return /^[a-zA-Z\s'-]+$/.test(trimmedName);
  };

  const validateEmail = (email) => {
    if (!email || !email.trim()) return false;
    const trimmedEmail = email.trim();

    // Length check
    if (trimmedEmail.length > 254) return false;

    // Basic format check
    const emailRegex =
      /^[a-zA-Z0-9]([a-zA-Z0-9._-]{0,63})?@[a-zA-Z0-9]([a-zA-Z0-9.-]{0,253})?[a-zA-Z0-9]\.[a-zA-Z]{2,63}$/;
    if (!emailRegex.test(trimmedEmail)) return false;

    const [localPart, domain] = trimmedEmail.split("@");

    // Check for invalid patterns
    if (localPart.startsWith(".") || localPart.endsWith(".")) return false;
    if (localPart.includes("..") || domain.includes("..")) return false;

    // Validate TLD contains only letters
    const domainParts = domain.split(".");
    const tld = domainParts[domainParts.length - 1];
    if (!/^[a-zA-Z]{2,63}$/.test(tld)) return false;

    return true;
  };

  const validatePhone = (phone) => {
    if (!phone || !phone.trim()) return false;

    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    const sriLankaRegex = /^(0[0-9]{9}|\+94[0-9]{9})$/;

    if (!sriLankaRegex.test(cleanPhone)) {
      return false;
    }

    if (cleanPhone.startsWith("0")) {
      return cleanPhone.startsWith("07") || cleanPhone.startsWith("011");
    }

    if (cleanPhone.startsWith("+94")) {
      const withoutCode = cleanPhone.substring(3);
      return withoutCode.startsWith("7") || withoutCode.startsWith("11");
    }

    return false;
  };

  const validatePostalCode = (code) => {
    if (!code || !code.trim()) return true; // Optional field
    const trimmedCode = code.trim();

    // Must be exactly 5 digits
    if (!/^\d{5}$/.test(trimmedCode)) return false;

    // Cannot be 00000
    if (trimmedCode === "00000") return false;

    return true;
  };

  const validateDateOfBirth = (dob) => {
    if (!dob) return true; // Optional field

    const birthDate = new Date(dob);
    const today = new Date();

    // Check if date is valid
    if (isNaN(birthDate.getTime())) return false;

    // Cannot be in the future
    if (birthDate > today) return false;

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    // Must be at least 16 years old and not more than 120 years old
    if (age < 16 || age > 120) return false;

    return true;
  };

  const validateGender = (gender) => {
    if (!gender) return true; // Optional field
    const validGenders = ["male", "female", "other"];
    return validGenders.includes(gender.toLowerCase());
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const maxLength = password.length <= 128;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_+=[\]\\/`~;'-]/.test(password);

    // Check for common weak passwords
    const commonPasswords = [
      "password",
      "password123",
      "12345678",
      "qwerty123",
      "admin123",
      "letmein",
      "welcome123",
    ];
    const isCommon = commonPasswords.some((common) =>
      password.toLowerCase().includes(common)
    );

    return {
      isValid:
        minLength &&
        maxLength &&
        hasUpper &&
        hasLower &&
        hasNumber &&
        hasSpecial &&
        !isCommon,
      errors: {
        minLength,
        maxLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial,
        isCommon: !isCommon,
      },
    };
  };

  const validateLanguage = (language) => {
    if (!language) return true; // Optional field
    const validLanguages = ["en", "si", "ta"];
    return validLanguages.includes(language);
  };

  const validateCurrency = (currency) => {
    if (!currency) return true; // Optional field
    const validCurrencies = ["LKR", "USD", "EUR"];
    return validCurrencies.includes(currency);
  };

  // COMPREHENSIVE PROFILE VALIDATION FUNCTION
  const validateProfileForm = () => {
    const errors = {};

    // ===== BASIC INFORMATION VALIDATIONS =====

    // First Name validation
    if (!formData.firstName || !formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (!validateName(formData.firstName)) {
      errors.firstName =
        "First name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes (no numbers)";
    }

    // Last Name validation
    if (!formData.lastName || !formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (!validateName(formData.lastName)) {
      errors.lastName =
        "Last name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes (no numbers)";
    }

    // Email validation
    if (!formData.email || !formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address with a proper domain";
    }

    // Phone validation
    if (!formData.phoneNumber || !formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!validatePhone(formData.phoneNumber)) {
      errors.phoneNumber =
        "Please enter a valid Sri Lankan phone number (e.g., 0771234567 or +94771234567)";
    }

    // Date of Birth validation
    if (formData.dateOfBirth && !validateDateOfBirth(formData.dateOfBirth)) {
      errors.dateOfBirth =
        "Invalid date of birth. Must be at least 16 years old and not in the future";
    }

    // Gender validation
    if (formData.gender && !validateGender(formData.gender)) {
      errors.gender = "Please select a valid gender";
    }

    // ===== ADDRESS VALIDATIONS =====

    // Address validation (optional but if provided must be valid)
    if (formData.address && !validateAddress(formData.address)) {
      errors.address =
        "Address must be 5-200 characters and contain only valid address characters";
    }

    // City validation (optional but if provided must be valid)
    if (formData.city) {
      if (!validateCity(formData.city)) {
        errors.city =
          "City must be 2-100 characters and contain only letters and basic punctuation (no numbers)";
      }
    }

    // Province validation (optional but if provided must be valid)
    if (formData.province) {
      if (!validateProvince(formData.province)) {
        errors.province =
          "Province must be 2-100 characters and contain only letters and basic punctuation (no numbers)";
      }
    }

    // Postal Code validation (optional but if provided must be valid)
    if (formData.postalCode && !validatePostalCode(formData.postalCode)) {
      errors.postalCode =
        "Sri Lankan postal code must be exactly 5 digits and cannot be 00000";
    }

    // Country validation (optional but if provided must be valid)
    if (formData.country) {
      if (!validateCountry(formData.country)) {
        errors.country =
          "Country must be 2-100 characters and contain only letters and basic punctuation (no numbers)";
      }
    }

    return errors;
  };

  // PASSWORD VALIDATION FUNCTION
  const validatePasswordForm = () => {
    const errors = {};

    // Current Password validation
    if (!passwordData.currentPassword || !passwordData.currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    } else if (passwordData.currentPassword.length < 8) {
      errors.currentPassword = "Invalid current password";
    }

    // New Password validation
    if (!passwordData.newPassword || !passwordData.newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else {
      const passwordValidation = validatePassword(passwordData.newPassword);
      if (!passwordValidation.isValid) {
        if (!passwordValidation.errors.minLength) {
          errors.newPassword = "Password must be at least 8 characters long";
        } else if (!passwordValidation.errors.maxLength) {
          errors.newPassword = "Password must not exceed 128 characters";
        } else if (!passwordValidation.errors.hasUpper) {
          errors.newPassword =
            "Password must contain at least one uppercase letter";
        } else if (!passwordValidation.errors.hasLower) {
          errors.newPassword =
            "Password must contain at least one lowercase letter";
        } else if (!passwordValidation.errors.hasNumber) {
          errors.newPassword = "Password must contain at least one number";
        } else if (!passwordValidation.errors.hasSpecial) {
          errors.newPassword =
            'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
        } else if (!passwordValidation.errors.isCommon) {
          errors.newPassword =
            "Password is too common. Please choose a stronger password";
        }
      }
    }

    // Confirm Password validation
    if (!passwordData.confirmPassword || !passwordData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Check if new password is same as current
    if (
      passwordData.currentPassword &&
      passwordData.newPassword &&
      passwordData.currentPassword === passwordData.newPassword
    ) {
      errors.newPassword =
        "New password must be different from current password";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Comprehensive validation
    const validationErrors = validateProfileForm();
    if (Object.keys(validationErrors).length > 0) {
      // Show all errors or first error
      const errorMessages = Object.values(validationErrors);
      setError(errorMessages.join(". "));
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim(),
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
      };

      // Only include address if at least one field is filled
      if (
        formData.city ||
        formData.province ||
        formData.postalCode ||
        formData.address
      ) {
        updateData.address = {
          city: formData.city?.trim() || "",
          state: formData.province?.trim() || "",
          zipCode: formData.postalCode?.trim() || "",
          street: formData.address?.trim() || "",
          country: formData.country?.trim() || "Sri Lanka",
        };
      }

      let response = null;
      try {
        response = await apiService.put("/users/profile", updateData);
        console.log("Profile update response:", response.data);
      } catch (profileError) {
        console.warn(
          "Profile update endpoint failed, trying auth endpoint:",
          profileError
        );

        try {
          response = await apiService.put("/auth/profile", updateData);
        } catch (authError) {
          console.warn("Auth update endpoint also failed:", authError);
          throw new Error("Failed to update profile using both endpoints");
        }
      }

      setSuccessMessage("Profile updated successfully!");
      await fetchUserProfile();
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      const errorInfo = handleApiError(error);
      setError(errorInfo.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Comprehensive password validation
    const validationErrors = validatePasswordForm();
    if (Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors);
      setError(errorMessages.join(". "));
      return;
    }

    setIsLoading(true);

    try {
      const passwordUpdateData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      };

      let response = null;
      try {
        response = await apiService.put(
          "/users/change-password",
          passwordUpdateData
        );
      } catch (usersError) {
        console.warn(
          "Users password endpoint failed, trying auth endpoint:",
          usersError
        );

        try {
          response = await apiService.put(
            "/auth/change-password",
            passwordUpdateData
          );
          console.log("Auth password response:", response.data);
        } catch (authError) {
          console.warn("Auth password endpoint also failed:", authError);
          throw new Error("Failed to update password using both endpoints");
        }
      }

      setSuccessMessage("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error updating password:", error);
      const errorInfo = handleApiError(error);
      setError(errorInfo.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    navigate("/user/userprofile");
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={goBack}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600 mt-1">
                Update your personal information and settings
              </p>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "personal", label: "Personal Info", icon: User },
                { id: "security", label: "Security", icon: Shield },
                { id: "preferences", label: "Preferences", icon: Settings },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeSection === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {activeSection === "personal" && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6 text-center">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <button
                  type="button"
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mx-auto"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Change Photo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="0771234567 or +94771234567"
                        maxLength={13}
                        pattern="^(0[0-9]{9}|\+94[0-9]{9})$"
                        title="Sri Lankan phone number: 10 digits starting with 0 or +94"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Colombo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province/State
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Province</option>
                      <option value="Western Province">Western Province</option>
                      <option value="Central Province">Central Province</option>
                      <option value="Southern Province">
                        Southern Province
                      </option>
                      <option value="Northern Province">
                        Northern Province
                      </option>
                      <option value="Eastern Province">Eastern Province</option>
                      <option value="North Western Province">
                        North Western Province
                      </option>
                      <option value="North Central Province">
                        North Central Province
                      </option>
                      <option value="Uva Province">Uva Province</option>
                      <option value="Sabaragamuwa Province">
                        Sabaragamuwa Province
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="10100"
                      maxLength={5}
                      pattern="[0-9]{5}"
                      title="5-digit postal code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Country</option>
                      <option value="Sri Lanka">Sri Lanka</option>
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Japan">Japan</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeSection === "security" && (
          <div className="space-y-6">
            {/* Change Password */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Change Password
                </h3>
              </div>
              <form onSubmit={handlePasswordSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        minLength="8"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        minLength="8"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {isLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeSection === "preferences" && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Preferences
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-3">
                    Notification Settings
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Email Notifications
                        </p>
                        <p className="text-sm text-gray-600">
                          Receive booking confirmations and updates
                        </p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-6"></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          SMS Notifications
                        </p>
                        <p className="text-sm text-gray-600">
                          Get text messages for urgent updates
                        </p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out translate-x-1"></span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-medium text-gray-900 mb-3">
                    Language & Region
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="en">English</option>
                        <option value="si">Sinhala</option>
                        <option value="ta">Tamil</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="LKR">Sri Lankan Rupee (LKR)</option>
                        <option value="USD">US Dollar (USD)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
