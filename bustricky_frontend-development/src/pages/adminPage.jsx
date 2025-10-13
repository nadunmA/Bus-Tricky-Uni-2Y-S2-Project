import {
  AlertCircle,
  AlertTriangle,
  Building,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  Globe,
  Hash,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountDeletion from "../components/AccountDeletion";
//import AccountDeletion from "../components/ProfilePictureUpload";
import AdminService from "../services/adminService";

const AdminProfile = () => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteImageConfirm, setShowDeleteImageConfirm] = useState(false);

  const [adminData, setAdminData] = useState(null);

  const handleProfileClick = () => {
    navigate("/admin/admindashboard");
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    department: "",
    location: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    licenseNumber: "",
    licenseExpiry: "",
    preferences: {
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
      language: "en",
      currency: "LKR",
    },
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Mock Data
  const getDummyData = () => ({
    id: "ADM_001",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@bustracking.com",
    phone: "+94778384343",
    role: "Super Administrator",
    department: "System Operations",
    joinDate: "2025-01-15",
    lastLogin: new Date().toISOString(),
    profileImage: null,
    isActive: true,
    isVerified: true,
    permissions: [
      "User Management",
      "Route Planning",
      "System Settings",
      "Analytics & Reports",
    ],
    location: "Malabe",
    dateOfBirth: "",
    gender: "",
    city: "Colombo",
    state: "Western Province",
    zipCode: "10000",
    country: "Sri Lanka",
    licenseNumber: "",
    licenseExpiry: "",
    totalBookings: 0,
    totalSpent: 0,
    loginAttempts: 0,
    preferences: {
      notifications: {
        email: true,
        sms: true,
        push: true,
      },
      language: "en",
      currency: "LKR",
    },
  });

  const setAdminDataFromSource = (data, source) => {
    console.log(`Setting admin data from ${source}:`, data);

    if (!data) return;

    const processedData = {
      ...data,
      role: AdminService.formatRole(data.role),
      department: AdminService.getDepartmentFromRole(data.role),
      permissions: AdminService.getPermissionsFromRole(data.role),
      location:
        data.address?.city && data.address?.state
          ? `${data.address.city}, ${data.address.state}`
          : data.address?.city || "Not specified",
      joinDate: data.createdAt || data.joinDate,
      lastLogin: data.lastLogin || new Date().toISOString(),
      dateOfBirth: data.dateOfBirth || "",
      phone: data.phoneNumber || data.phone || "",
      totalBookings: data.totalBookings || 0,
      totalSpent: data.totalSpent || 0,
      loginAttempts: data.loginAttempts || 0,
      isVerified: data.isVerified !== undefined ? data.isVerified : true,
      licenseNumber: data.licenseNumber || "",
      licenseExpiry: data.licenseExpiry || "",
      city: data.address?.city || data.city || "",
      state: data.address?.state || data.state || "",
      zipCode: data.address?.zipCode || data.zipCode || "",
      country: data.address?.country || data.country || "Sri Lanka",
    };

    setAdminData(processedData);

    setFormData({
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      phoneNumber: data.phoneNumber || data.phone || "",
      dateOfBirth: data.dateOfBirth || "",
      gender: data.gender || "",
      department: AdminService.getDepartmentFromRole(data.role),
      location: processedData.location,
      city: processedData.city,
      state: processedData.state,
      zipCode: processedData.zipCode,
      country: processedData.country,
      licenseNumber: data.licenseNumber || "",
      licenseExpiry: data.licenseExpiry || "",
      preferences: data.preferences || {
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
        language: "en",
        currency: "LKR",
      },
    });
  };

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        const storedInfo = AdminService.getStoredAdminInfo();
        if (storedInfo.success && storedInfo.data) {
          const storedData = AdminService.mapUserData(storedInfo.data);
          setAdminDataFromSource(storedData, "stored");
        }

        const response = await AdminService.getProfile();
        let data;

        if (response.success) {
          data = AdminService.mapUserData(response.data);

          AdminService.updateStoredUserInfo(data);
        } else {
          if (storedInfo.success) {
            data = AdminService.mapUserData(storedInfo.data);
          } else {
            data = getDummyData();
          }
        }

        setAdminDataFromSource(data, response.success ? "api" : "stored");
      } catch (error) {
        console.error("Error initializing profile data:", error);

        const storedInfo = AdminService.getStoredAdminInfo();
        if (storedInfo.success) {
          const data = AdminService.mapUserData(storedInfo.data);
          setAdminDataFromSource(data, "stored");
        } else {
          const dummyData = getDummyData();
          setAdminDataFromSource(dummyData, "dummy");
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    const handleStorageChange = () => initializeData();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  const refreshProfileData = async () => {
    try {
      const response = await AdminService.getProfile();
      if (response.success) {
        const updatedData = AdminService.mapUserData(response.data);
        setAdminDataFromSource(updatedData, "api");
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  useEffect(() => {
    if (adminData?.profileImage) {
      setImagePreview(null);
      setSelectedFile(null);
    }
  }, [adminData?.profileImage]);

  const getImageUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith("http")) return profilePicture;

    const backendUrl =
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      "http://localhost:8000";

    const cleanPath = profilePicture.replace(/^\/+/, "");
    return `${backendUrl}/${cleanPath}`;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // FIXED VALIDATION FUNCTIONS

  // 1. Enhanced Phone Validation for Sri Lankan Numbers
  const validatePhone = (phone) => {
    if (!phone || phone.trim() === "") return false;

    const cleanPhone = phone.replace(/[\s\-()]/g, "");

    // Sri Lankan mobile: 0771234567 (10 digits starting with 07)
    // Sri Lankan landline: 0112345678 (10 digits starting with 011)
    // International format: +94771234567 (12 chars) or +94112345678

    // Local format (10 digits)
    const localMobileRegex = /^07[0-9]{8}$/;
    const localLandlineRegex = /^011[0-9]{7}$/;

    // International format (with +94)
    const intlMobileRegex = /^\+947[0-9]{8}$/;
    const intlLandlineRegex = /^\+9411[0-9]{7}$/;

    if (cleanPhone.startsWith("+94")) {
      return (
        intlMobileRegex.test(cleanPhone) || intlLandlineRegex.test(cleanPhone)
      );
    } else if (cleanPhone.startsWith("0")) {
      return (
        localMobileRegex.test(cleanPhone) || localLandlineRegex.test(cleanPhone)
      );
    }

    return false;
  };

  // 2. Enhanced Email Validation
  const validateEmail = (email) => {
    if (!email || email.trim() === "") return false;

    const trimmedEmail = email.trim();

    // Check length constraints
    if (trimmedEmail.length > 254) return false;

    // Email regex with proper validation
    const emailRegex =
      /^[a-zA-Z0-9]([a-zA-Z0-9._-]{0,63})?@[a-zA-Z0-9]([a-zA-Z0-9.-]{0,253})?[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(trimmedEmail)) return false;

    // Additional checks
    const [localPart, domain] = trimmedEmail.split("@");

    // Local part shouldn't start or end with dot
    if (localPart.startsWith(".") || localPart.endsWith(".")) return false;

    // No consecutive dots
    if (localPart.includes("..") || domain.includes("..")) return false;

    // Domain should have at least one dot
    if (!domain.includes(".")) return false;

    return true;
  };

  // 3. Enhanced Zip Code Validation for Sri Lanka
  const validateZipCode = (zipCode) => {
    if (!zipCode || zipCode.trim() === "") return true; // Optional field

    const cleanZipCode = zipCode.trim();

    // Sri Lankan postal codes are exactly 5 digits
    const zipRegex = /^[0-9]{5}$/;

    if (!zipRegex.test(cleanZipCode)) return false;

    // Additional check: should not be all zeros
    if (cleanZipCode === "00000") return false;

    return true;
  };

  // 4. Enhanced Name Validation
  const validateName = (name, fieldName = "Name") => {
    const errors = [];

    if (!name || name.trim() === "") {
      errors.push(`${fieldName} is required`);
      return { isValid: false, error: errors[0] };
    }

    const trimmedName = name.trim();

    // Length validation
    if (trimmedName.length < 2) {
      errors.push(`${fieldName} must be at least 2 characters`);
    }

    if (trimmedName.length > 50) {
      errors.push(`${fieldName} must not exceed 50 characters`);
    }

    // Character validation - only letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (!nameRegex.test(trimmedName)) {
      errors.push(
        `${fieldName} should only contain letters, spaces, hyphens, and apostrophes`
      );
    }

    // No consecutive spaces
    if (trimmedName.includes("  ")) {
      errors.push(`${fieldName} should not contain consecutive spaces`);
    }

    // Shouldn't start or end with space, hyphen, or apostrophe
    if (/^[\s'-]|[\s'-]$/.test(trimmedName)) {
      errors.push(
        `${fieldName} should not start or end with special characters`
      );
    }

    return {
      isValid: errors.length === 0,
      error: errors[0] || null,
    };
  };

  // 5. Enhanced City/State Validation
  const validateLocation = (location, fieldName = "Location") => {
    // If empty or only whitespace, it's valid (optional field)
    if (!location || location.trim() === "") {
      return { isValid: true };
    }

    const trimmedLocation = location.trim();

    if (trimmedLocation.length < 2) {
      return {
        isValid: false,
        error: `${fieldName} must be at least 2 characters`,
      };
    }

    if (trimmedLocation.length > 100) {
      return {
        isValid: false,
        error: `${fieldName} must not exceed 100 characters`,
      };
    }

    // Allow letters, spaces, hyphens, apostrophes, and commas
    const locationRegex = /^[a-zA-Z\s',.-]+$/;
    if (!locationRegex.test(trimmedLocation)) {
      return {
        isValid: false,
        error: `${fieldName} contains invalid characters`,
      };
    }

    return { isValid: true };
  };

  // 6. Enhanced Date of Birth Validation
  const validateDateOfBirth = (dateOfBirth) => {
    if (!dateOfBirth || dateOfBirth.trim() === "") return { isValid: true }; // Optional

    const date = new Date(dateOfBirth);
    const today = new Date();

    // Check if valid date
    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: "Invalid date format",
      };
    }

    // Calculate age
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < date.getDate())
    ) {
      age--;
    }

    // Age should be between 18 and 100
    if (age < 18) {
      return {
        isValid: false,
        error: "You must be at least 18 years old",
      };
    }

    if (age > 100) {
      return {
        isValid: false,
        error: "Please enter a valid date of birth",
      };
    }

    // Date shouldn't be in the future
    if (date > today) {
      return {
        isValid: false,
        error: "Date of birth cannot be in the future",
      };
    }

    return { isValid: true };
  };

  // 7. Enhanced License Number Validation (Sri Lankan)
  const validateLicenseNumber = (licenseNumber) => {
    if (!licenseNumber || licenseNumber.trim() === "") return { isValid: true }; // Optional

    const cleanLicense = licenseNumber.trim().toUpperCase();

    // Sri Lankan license format: B1234567 or similar
    const licenseRegex = /^[A-Z][0-9]{7}$/;

    if (!licenseRegex.test(cleanLicense)) {
      return {
        isValid: false,
        error: "Invalid license number format (e.g., B1234567)",
      };
    }

    return { isValid: true };
  };

  // 8. Enhanced License Expiry Validation
  const validateLicenseExpiry = (expiryDate) => {
    if (!expiryDate || expiryDate.trim() === "") return { isValid: true }; // Optional

    const date = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(date.getTime())) {
      return {
        isValid: false,
        error: "Invalid expiry date format",
      };
    }

    // License expiry shouldn't be in the past
    if (date < today) {
      return {
        isValid: false,
        error: "License has expired",
      };
    }

    // Expiry shouldn't be too far in the future (e.g., more than 10 years)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 10);

    if (date > maxDate) {
      return {
        isValid: false,
        error: "Expiry date is too far in the future",
      };
    }

    return { isValid: true };
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    // First Name validation
    const firstNameValidation = validateName(formData.firstName, "First name");
    if (!firstNameValidation.isValid) {
      newErrors.firstName = firstNameValidation.error;
    }

    // Last Name validation
    const lastNameValidation = validateName(formData.lastName, "Last name");
    if (!lastNameValidation.isValid) {
      newErrors.lastName = lastNameValidation.error;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber =
        "Please enter a valid Sri Lankan phone number (e.g., 0771234567 or +94771234567)";
    }

    // Date of Birth validation
    const dobValidation = validateDateOfBirth(formData.dateOfBirth);
    if (!dobValidation.isValid) {
      newErrors.dateOfBirth = dobValidation.error;
    }

    if (formData.city && formData.city.trim()) {
      const cityValidation = validateLocation(formData.city, "City");
      if (!cityValidation.isValid) {
        newErrors.city = cityValidation.error;
      }
    }

    if (formData.state && formData.state.trim()) {
      const stateValidation = validateLocation(formData.state, "State");
      if (!stateValidation.isValid) {
        newErrors.state = stateValidation.error;
      }
    }

    if (formData.zipCode && formData.zipCode.trim()) {
      if (!validateZipCode(formData.zipCode)) {
        newErrors.zipCode =
          "Sri Lankan postal code must be 5 digits (e.g., 10400)";
      }
    }

    // License number validation (if role is Driver)
    if (adminData?.role === "Driver" && formData.licenseNumber) {
      const licenseValidation = validateLicenseNumber(formData.licenseNumber);
      if (!licenseValidation.isValid) {
        newErrors.licenseNumber = licenseValidation.error;
      }
    }

    // License expiry validation (if role is Driver)
    if (adminData?.role === "Driver" && formData.licenseExpiry) {
      const expiryValidation = validateLicenseExpiry(formData.licenseExpiry);
      if (!expiryValidation.isValid) {
        newErrors.licenseExpiry = expiryValidation.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, adminData?.role]);

  // 10. Enhanced Password Validation with detailed feedback
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const maxLength = password.length <= 128;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/`~;']/.test(password);

    // Check for common weak passwords
    const commonPasswords = ["password", "12345678", "qwerty123", "admin123"];
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

  // 11. Enhanced validatePasswordForm function
  const validatePasswordForm = useCallback(() => {
    const newErrors = {};

    // Current password validation
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    } else if (passwordData.currentPassword.length < 1) {
      newErrors.currentPassword = "Please enter your current password";
    }

    // New password validation
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else {
      const validation = validatePassword(passwordData.newPassword);
      if (!validation.isValid) {
        if (!validation.errors.minLength) {
          newErrors.newPassword = "Password must be at least 8 characters";
        } else if (!validation.errors.maxLength) {
          newErrors.newPassword = "Password must not exceed 128 characters";
        } else if (!validation.errors.isCommon) {
          newErrors.newPassword =
            "Password is too common. Please choose a stronger password";
        } else {
          newErrors.newPassword = "Password does not meet all requirements";
        }
      }

      // Check if new password is same as current
      if (passwordData.newPassword === passwordData.currentPassword) {
        newErrors.newPassword =
          "New password must be different from current password";
      }
    }

    // Confirm password validation
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [passwordData]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await AdminService.logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      AdminService.clearSession();
      navigate("/login", { replace: true });
    } finally {
      setIsLoading(false);
      setShowLogoutConfirm(false);
    }
  };

  const handleDeleteImage = async () => {
    setIsLoading(true);
    try {
      const result = await AdminService.deleteProfilePicture();
      if (result.success) {
        await refreshProfileData();
        setSuccessMessage("Profile picture deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
        setImagePreview(null);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      setErrors({
        general: "An error occurred while deleting the profile picture",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteImageConfirm(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        address: {
          city: formData.city || "",
          state: formData.state || "",
          zipCode: formData.zipCode || "",
          country: formData.country || "Sri Lanka",
        },
        country: formData.country || "Sri Lanka",
        licenseNumber: formData.licenseNumber,
        licenseExpiry: formData.licenseExpiry,
        preferences: formData.preferences,
      };

      const result = await AdminService.updateProfile(updateData);

      if (result.success) {
        const updatedUser = AdminService.mapUserData(result.data);

        let updatedProfileImage =
          updatedUser.profilePicture || adminData.profileImage;

        if (selectedFile) {
          const uploadResult = await AdminService.uploadProfilePicture(
            selectedFile
          );
          if (uploadResult.success) {
            await refreshProfileData();
            updatedProfileImage = uploadResult.data.profilePicture;
          } else {
            setErrors({
              image: uploadResult.message || "Failed to upload profile picture",
            });
          }
        }

        const updatedAdminData = {
          ...adminData,
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phoneNumber || updatedUser.phone,
          phoneNumber: updatedUser.phoneNumber,
          dateOfBirth: updatedUser.dateOfBirth || "",
          gender: updatedUser.gender || "",
          city: updatedUser.address?.city || formData.city || "",
          state: updatedUser.address?.state || formData.state || "",
          zipCode: updatedUser.address?.zipCode || formData.zipCode || "",
          country:
            updatedUser.address?.country ||
            updatedUser.country ||
            formData.country ||
            "Sri Lanka",
          location:
            updatedUser.address?.city && updatedUser.address?.state
              ? `${updatedUser.address.city}, ${updatedUser.address.state}`
              : updatedUser.address?.city || formData.city || "Not specified",
          role: AdminService.formatRole(updatedUser.role),
          department: AdminService.getDepartmentFromRole(updatedUser.role),
          permissions: AdminService.getPermissionsFromRole(updatedUser.role),
          joinDate: updatedUser.createdAt || adminData.joinDate,
          lastLogin: updatedUser.lastLogin || adminData.lastLogin,
          profileImage: updatedProfileImage,
          isActive: updatedUser.isActive,
          isVerified: updatedUser.isVerified,
          licenseNumber:
            updatedUser.licenseNumber || formData.licenseNumber || "",
          licenseExpiry:
            updatedUser.licenseExpiry || formData.licenseExpiry || "",
          preferences: updatedUser.preferences || formData.preferences,
          totalBookings:
            updatedUser.totalBookings || adminData.totalBookings || 0,
          totalSpent: updatedUser.totalSpent || adminData.totalSpent || 0,
          loginAttempts:
            updatedUser.loginAttempts || adminData.loginAttempts || 0,
        };

        setAdminData(updatedAdminData);

        setFormData({
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          dateOfBirth: updatedUser.dateOfBirth || "",
          gender: updatedUser.gender || "",
          department: AdminService.getDepartmentFromRole(updatedUser.role),
          location: updatedAdminData.location,
          city: updatedAdminData.city,
          state: updatedAdminData.state,
          zipCode: updatedAdminData.zipCode,
          country: updatedAdminData.country,
          licenseNumber: updatedAdminData.licenseNumber,
          licenseExpiry: updatedAdminData.licenseExpiry,
          preferences: updatedUser.preferences || formData.preferences,
        });

        const completeUserData = {
          ...updatedUser,
          address: {
            city: updatedAdminData.city,
            state: updatedAdminData.state,
            zipCode: updatedAdminData.zipCode,
            country: updatedAdminData.country,
          },
          profilePicture: updatedProfileImage,
        };

        AdminService.updateStoredUserInfo(completeUserData);
        console.log("Updated localStorage:", completeUserData);

        setIsEditing(false);
        setImagePreview(null);
        setSelectedFile(null);
        setSuccessMessage("Profile updated successfully!");

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        setErrors({ general: result.message || "Failed to update profile" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ general: "An error occurred while updating profile" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const result = await AdminService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.success) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowChangePassword(false);
        setSuccessMessage("Password changed successfully!");

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        setErrors({ general: result.message || "Failed to change password" });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setErrors({ general: "An error occurred while changing password" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: adminData?.firstName || "",
      lastName: adminData?.lastName || "",
      email: adminData?.email || "",
      phoneNumber: adminData?.phone || "",
      dateOfBirth: adminData?.dateOfBirth || "",
      gender: adminData?.gender || "",
      department: adminData?.department || "",
      location: adminData?.location || "",
      city: adminData?.city || "",
      state: adminData?.state || "",
      zipCode: adminData?.zipCode || "",
      country: adminData?.country || "",
      licenseNumber: adminData?.licenseNumber || "",
      licenseExpiry: adminData?.licenseExpiry || "",
      preferences: adminData?.preferences || formData.preferences,
    });
    setIsEditing(false);
    setErrors({});
    setImagePreview(null);
    setSelectedFile(null);
    setSuccessMessage("");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 5MB",
        }));
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!adminData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-white to-blue-600 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-white to-blue-600 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              {successMessage}
            </div>
          </div>
        )}

        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errors.general}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 px-8 py-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-white/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 space-y-6 lg:space-y-0">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full bg-white/20 backdrop-blur-sm p-1 shadow-lg">
                    {imagePreview || adminData.profileImage ? (
                      <img
                        src={
                          imagePreview || getImageUrl(adminData.profileImage)
                        }
                        alt="Admin Profile"
                        className="h-full w-full rounded-full object-cover"
                        onError={(e) => {
                          console.error(
                            "Image failed to load:",
                            getImageUrl(adminData.profileImage)
                          );
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <User className="h-16 w-16 text-white/80" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 bg-white/20 backdrop-blur-sm rounded-full p-3 cursor-pointer hover:bg-white/30 transition-all duration-300 shadow-lg">
                      <Camera className="h-5 w-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                  {isEditing && adminData.profileImage && (
                    <button
                      className="absolute bottom-2 left-2 bg-white/20 backdrop-blur-sm rounded-full p-3 cursor-pointer hover:bg-white/30 transition-all duration-300 shadow-lg"
                      onClick={() => setShowDeleteImageConfirm(true)}
                    >
                      <Trash2 className="h-5 w-5 text-white" />
                    </button>
                  )}
                </div>

                <div className="text-white flex-1">
                  <h2 className="text-4xl font-bold mb-2">
                    {adminData.firstName} {adminData.lastName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-white/80" />
                      <span className="text-xl text-white/90">
                        {adminData.role}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-white/80" />
                      <span className="text-white/90">
                        {adminData.location}
                      </span>
                    </div>
                  </div>
                  <p className="text-white/80 text-lg mb-4">
                    {adminData.department}
                  </p>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        adminData.isActive
                          ? "bg-green-500/20 text-green-100 border border-green-500/30"
                          : "bg-red-500/20 text-red-100 border border-red-500/30"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          adminData.isActive ? "bg-green-400" : "bg-red-400"
                        }`}
                      ></div>
                      {adminData.isActive ? "Active" : "Inactive"}
                    </span>
                    {adminData.isVerified && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-100 border border-blue-500/30">
                        <CheckCircle className="h-3 w-3 mr-2" />
                        Verified
                      </span>
                    )}
                    <div className="flex items-center text-white/70 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      Last login: {formatDateTime(adminData.lastLogin)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {errors.image && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 text-red-100 rounded-lg backdrop-blur-sm">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.image}
                </div>
              </div>
            )}
          </div>

          <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-end">
              <div className="flex space-x-3">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => handleProfileClick(true)}
                      className="flex items-center px-6 py-3 bg-green-200 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 font-medium shadow-sm"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Go To Dashboard
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium shadow-sm"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  </>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <User className="h-6 w-6 mr-3 text-blue-600" />
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        First Name *
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                firstName: e.target.value,
                              }))
                            }
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 bg-white ${
                              errors.firstName
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter first name"
                          />
                          {errors.firstName && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.firstName}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                          <span className="text-gray-900 font-medium">
                            {adminData.firstName}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Last Name *
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                lastName: e.target.value,
                              }))
                            }
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 bg-white ${
                              errors.lastName
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter last name"
                          />
                          {errors.lastName && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                          <span className="text-gray-900 font-medium">
                            {adminData.lastName}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Email Address *
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 bg-white ${
                              errors.email
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter email address"
                          />
                          {errors.email && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.email}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                          <Mail className="h-4 w-4 text-gray-500 mr-3" />
                          <span className="text-gray-900 font-medium">
                            {adminData.email}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Phone Number *
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                phoneNumber: e.target.value,
                              }))
                            }
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 bg-white ${
                              errors.phoneNumber
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="0771234567 or +94771234567"
                            maxLength={13} // For +94 format
                            pattern="^(0[0-9]{9}|\+94[0-9]{9})$"
                            title="Sri Lankan phone number: 10 digits starting with 0 or +94"
                          />
                          {errors.phoneNumber && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.phoneNumber}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                          <Phone className="h-4 w-4 text-gray-500 mr-3" />
                          <span className="text-gray-900 font-medium">
                            {adminData.phone}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formatDateForInput(formData.dateOfBirth)}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                dateOfBirth: e.target.value,
                              }))
                            }
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 bg-white ${
                              errors.dateOfBirth
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.dateOfBirth && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.dateOfBirth}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                          <Calendar className="h-4 w-4 text-gray-500 mr-3" />
                          <span className="text-gray-900 font-medium">
                            {adminData.dateOfBirth
                              ? new Date(
                                  adminData.dateOfBirth
                                ).toLocaleDateString()
                              : "Not specified"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Gender
                      </label>
                      {isEditing ? (
                        <div>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                gender: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 bg-white"
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">
                              Prefer not to say
                            </option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                          <User className="h-4 w-4 text-gray-500 mr-3" />
                          <span className="text-gray-900 font-medium">
                            {adminData.gender
                              ? adminData.gender.charAt(0).toUpperCase() +
                                adminData.gender.slice(1)
                              : "Not specified"}
                          </span>
                        </div>
                      )}
                    </div>

                    {adminData.role === "Driver" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-3">
                            License Number
                          </label>
                          {isEditing ? (
                            <div>
                              <input
                                type="text"
                                name="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    licenseNumber: e.target.value,
                                  }))
                                }
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 bg-white ${
                                  errors.licenseNumber
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                placeholder="Enter license number"
                              />
                              {errors.licenseNumber && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  {errors.licenseNumber}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                              <Hash className="h-4 w-4 text-gray-500 mr-3" />
                              <span className="text-gray-900 font-medium">
                                {adminData.licenseNumber || "Not specified"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-3">
                            License Expiry
                          </label>
                          {isEditing ? (
                            <div>
                              <input
                                type="date"
                                name="licenseExpiry"
                                value={formatDateForInput(
                                  formData.licenseExpiry
                                )}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    licenseExpiry: e.target.value,
                                  }))
                                }
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 bg-white ${
                                  errors.licenseExpiry
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                              />
                              {errors.licenseExpiry && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  {errors.licenseExpiry}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                              <Calendar className="h-4 w-4 text-gray-500 mr-3" />
                              <span className="text-gray-900 font-medium">
                                {adminData.licenseExpiry
                                  ? new Date(
                                      adminData.licenseExpiry
                                    ).toLocaleDateString()
                                  : "Not specified"}
                              </span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <MapPin className="h-6 w-6 mr-3 text-blue-600" />
                    Address Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Country
                      </label>
                      {isEditing ? (
                        <div>
                          <select
                            name="country"
                            value={formData.country}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                country: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 bg-white"
                          >
                            <option value="">Select Country</option>
                            <option value="Sri Lanka">Sri Lanka</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                          <Globe className="h-4 w-4 text-gray-500 mr-3" />
                          <span className="text-gray-900 font-medium">
                            {adminData.country || "Not specified"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        City
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 bg-white ${
                              errors.city ? "border-red-500" : "border-gray-300"
                            }`}
                            placeholder="Enter city"
                          />
                          {errors.city && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.city}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                          <MapPin className="h-4 w-4 text-gray-500 mr-3" />
                          <span className="text-gray-900 font-medium">
                            {adminData.city || "Not specified"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        State/Province
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                state: e.target.value,
                              }))
                            }
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 bg-white ${
                              errors.state
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter state/province"
                          />
                          {errors.state && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.state}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                          <MapPin className="h-4 w-4 text-gray-500 mr-3" />
                          <span className="text-gray-900 font-medium">
                            {adminData.state || "Not specified"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Zip/Postal Code
                      </label>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                zipCode: e.target.value,
                              }))
                            }
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 bg-white ${
                              errors.zipCode
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="10400"
                            maxLength={5}
                            pattern="[0-9]{5}"
                            title="5-digit postal code"
                          />
                          {errors.zipCode && (
                            <p className="mt-2 text-sm text-red-600 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {errors.zipCode}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                          <MapPin className="h-4 w-4 text-gray-500 mr-3" />
                          <span className="text-gray-900 font-medium">
                            {adminData.zipCode || "Not specified"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Building className="h-6 w-6 mr-3 text-blue-600" />
                    Preferences & Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Language
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.preferences?.language || "en"}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                language: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 bg-white"
                        >
                          <option value="en">English</option>
                          <option value="si">Sinhala</option>
                          <option value="ta">Tamil</option>
                        </select>
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                          <Globe className="h-4 w-4 text-gray-500 mr-3" />
                          <span className="text-gray-900 font-medium">
                            {formData.preferences?.language === "en" &&
                              "English"}
                            {formData.preferences?.language === "si" &&
                              "Sinhala"}
                            {formData.preferences?.language === "ta" && "Tamil"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Currency
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.preferences?.currency || "LKR"}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                currency: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 bg-white"
                        >
                          <option value="LKR">Sri Lankan Rupees (LKR)</option>
                          <option value="USD">US Dollars (USD)</option>
                          <option value="EUR">Euros (EUR)</option>
                          <option value="GBP">British Pounds (GBP)</option>
                        </select>
                      ) : (
                        <div className="flex items-center px-4 py-3 bg-gray-50 rounded-lg border border-gray-300">
                          <span className="text-gray-900 font-medium">
                            {formData.preferences?.currency || "LKR"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-3">
                        Notification Preferences
                      </label>
                      {isEditing ? (
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={
                                formData.preferences?.notifications?.email
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  preferences: {
                                    ...prev.preferences,
                                    notifications: {
                                      ...prev.preferences?.notifications,
                                      email: e.target.checked,
                                    },
                                  },
                                }))
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-gray-900">
                              Email Notifications
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.preferences?.notifications?.sms}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  preferences: {
                                    ...prev.preferences,
                                    notifications: {
                                      ...prev.preferences?.notifications,
                                      sms: e.target.checked,
                                    },
                                  },
                                }))
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-gray-900">
                              SMS Notifications
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={
                                formData.preferences?.notifications?.push
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  preferences: {
                                    ...prev.preferences,
                                    notifications: {
                                      ...prev.preferences?.notifications,
                                      push: e.target.checked,
                                    },
                                  },
                                }))
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-gray-900">
                              Push Notifications
                            </span>
                          </label>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {formData.preferences?.notifications?.email && (
                            <div className="flex items-center px-3 py-2 bg-green-50 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-gray-900 text-sm">
                                Email Notifications Enabled
                              </span>
                            </div>
                          )}
                          {formData.preferences?.notifications?.sms && (
                            <div className="flex items-center px-3 py-2 bg-green-50 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-gray-900 text-sm">
                                SMS Notifications Enabled
                              </span>
                            </div>
                          )}
                          {formData.preferences?.notifications?.push && (
                            <div className="flex items-center px-3 py-2 bg-green-50 rounded-lg">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-gray-900 text-sm">
                                Push Notifications Enabled
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Shield className="h-6 w-6 mr-3 text-blue-600" />
                    Account Details
                  </h3>

                  <div className="space-y-6">
                    <div className="p-6 bg-blue-600 rounded-lg border border-blue-600">
                      <label className="block text-sm font-medium text-white mb-2">
                        Administrative Role
                      </label>
                      <span className="text-white font-semibold text-lg">
                        {adminData.role}
                      </span>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-300">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Admin ID
                      </label>
                      <span className="text-gray-900 font-mono text-lg">
                        {adminData.id}
                      </span>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-300">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Department
                      </label>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-900 font-medium">
                          {adminData.department}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-300">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Join Date
                      </label>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-gray-900 font-medium">
                          {formatDate(adminData.joinDate)}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-300">
                      <label className="block text-sm font-medium text-gray-900 mb-4">
                        Activity Statistics
                      </label>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Bookings</span>
                          <span className="text-gray-900 font-semibold">
                            {adminData.totalBookings || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Spent</span>
                          <span className="text-gray-900 font-semibold">
                            LKR {adminData.totalSpent || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Login Attempts</span>
                          <span className="text-gray-900 font-semibold">
                            {adminData.loginAttempts || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-300">
                      <label className="block text-sm font-medium text-gray-900 mb-4">
                        System Permissions
                      </label>
                      <div className="space-y-3">
                        {adminData.permissions.map((permission, index) => (
                          <div
                            key={index}
                            className="flex items-center px-3 py-2 bg-green-50 rounded-lg"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600 mr-3" />
                            <span className="text-gray-900 font-medium text-sm">
                              {permission}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-300">
                      <label className="block text-sm font-medium text-gray-900 mb-4">
                        Account Security
                      </label>
                      <div className="space-y-3">
                        <button
                          onClick={() => setShowChangePassword(true)}
                          className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 font-medium"
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </button>
                        <button
                          onClick={() => setShowLogoutConfirm(true)}
                          className="w-full flex items-center justify-center px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-300 font-medium"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                    <AlertTriangle className="h-6 w-6 mr-3 text-red-600" />
                    Danger Zone
                  </h3>
                  <AccountDeletion
                    onError={(msg) => setErrors({ general: msg })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Confirm Logout
                </h3>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  disabled={isLoading}
                  className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <LogOut className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-900 font-medium">
                      Are you sure you want to logout?
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      You will be signed out of your admin account and
                      redirected to the login page.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 disabled:opacity-50 font-medium"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <LogOut className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteImageConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Confirm Delete Profile Picture
                </h3>
                <button
                  onClick={() => setShowDeleteImageConfirm(false)}
                  disabled={isLoading}
                  className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-gray-900 font-medium">
                      Are you sure you want to delete your profile picture?
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowDeleteImageConfirm(false)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteImage}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 disabled:opacity-50 font-medium"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showChangePassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Change Password
                </h3>
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setErrors({});
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 pr-12 transition-all duration-300 bg-white ${
                        errors.currentPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 pr-12 transition-all duration-300 bg-white ${
                        errors.newPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.newPassword}
                    </p>
                  )}
                  {passwordData.newPassword && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 text-sm mb-2 font-medium">
                        Password requirements:
                      </p>
                      <div className="space-y-1">
                        {Object.entries(
                          validatePassword(passwordData.newPassword).errors
                        ).map(([key, isValid]) => (
                          <div
                            key={key}
                            className={`flex items-center text-xs ${
                              isValid ? "text-green-600" : "text-gray-500"
                            }`}
                          >
                            <CheckCircle
                              className={`h-3 w-3 mr-2 ${
                                isValid ? "text-green-600" : "text-gray-500"
                              }`}
                            />
                            <span>
                              {key === "minLength" && "8+ characters"}
                              {key === "hasUpper" && "Uppercase letter"}
                              {key === "hasLower" && "Lowercase letter"}
                              {key === "hasNumber" && "Number"}
                              {key === "hasSpecial" && "Special character"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 bg-white ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirm new password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setErrors({});
                    }}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 font-medium"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Lock className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
