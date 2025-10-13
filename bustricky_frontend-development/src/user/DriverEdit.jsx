import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  EyeOff,
  Key,
  MapPin,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserService } from "../services/UserService";

const DriverEdit = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeScheduleTab, setActiveScheduleTab] = useState("weekly");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    licenseNumber: "",
    licenseExpiry: "",
    vehicleNumber: "",
    yearsOfExperience: "",
    emergencyContact: "",
    country: "Sri Lanka",
    city: "",
    state: "",
    zipCode: "",
    currentRoute: "",
    employmentStatus: "",
    shiftPreference: "",
    salary: "",
    specialQualifications: "",
    medicalCertificateExpiry: "",
    bloodType: "",
    medicalConditions: "",
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    language: "en",
    currency: "LKR",

    weeklySchedule: {
      monday: { startTime: "", endTime: "", route: "", isWorking: false },
      tuesday: { startTime: "", endTime: "", route: "", isWorking: false },
      wednesday: { startTime: "", endTime: "", route: "", isWorking: false },
      thursday: { startTime: "", endTime: "", route: "", isWorking: false },
      friday: { startTime: "", endTime: "", route: "", isWorking: false },
      saturday: { startTime: "", endTime: "", route: "", isWorking: false },
      sunday: { startTime: "", endTime: "", route: "", isWorking: false },
    },
    preferredRoutes: [],
    availableForOvertime: false,
    maximumWorkingHours: 8,
  });

  const [originalData, setOriginalData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;
        if (userId) {
          response = await UserService.getUserById(userId);
        } else {
          response = await UserService.getProfile();
        }

        if (response.success && response.data) {
          let userData = response.data.data || response.data;

          if (userData.success && userData.data) {
            userData = userData.data;
          }

          const preparedData = {
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            dateOfBirth: userData.dateOfBirth
              ? new Date(userData.dateOfBirth).toISOString().split("T")[0]
              : "",
            gender: userData.gender || "",
            licenseNumber: userData.licenseNumber || "",
            licenseExpiry: userData.licenseExpiry
              ? new Date(userData.licenseExpiry).toISOString().split("T")[0]
              : "",
            vehicleNumber: userData.vehicleNumber || "",
            yearsOfExperience: userData.yearsOfExperience || "",
            emergencyContact: userData.emergencyContact || "",
            country:
              userData.country || userData.address?.country || "Sri Lanka",
            city: userData.address?.city || userData.city || "",
            state: userData.address?.state || userData.state || "",
            zipCode: userData.address?.zipCode || userData.zipCode || "",

            currentRoute: userData.currentRoute || "",
            employmentStatus: userData.employmentStatus || "",
            shiftPreference: userData.shiftPreference || "",
            salary: userData.salary || "",
            specialQualifications: userData.specialQualifications || "",

            medicalCertificateExpiry: userData.medicalCertificateExpiry
              ? new Date(userData.medicalCertificateExpiry)
                  .toISOString()
                  .split("T")[0]
              : "",
            bloodType: userData.bloodType || "",
            medicalConditions: userData.medicalConditions || "",

            emailNotifications:
              userData.preferences?.notifications?.email !== false,
            smsNotifications:
              userData.preferences?.notifications?.sms !== false,
            pushNotifications:
              userData.preferences?.notifications?.push !== false,
            language: userData.preferences?.language || "en",
            currency: userData.preferences?.currency || "LKR",

            weeklySchedule: userData.weeklySchedule || {
              monday: {
                startTime: "",
                endTime: "",
                route: "",
                isWorking: false,
              },
              tuesday: {
                startTime: "",
                endTime: "",
                route: "",
                isWorking: false,
              },
              wednesday: {
                startTime: "",
                endTime: "",
                route: "",
                isWorking: false,
              },
              thursday: {
                startTime: "",
                endTime: "",
                route: "",
                isWorking: false,
              },
              friday: {
                startTime: "",
                endTime: "",
                route: "",
                isWorking: false,
              },
              saturday: {
                startTime: "",
                endTime: "",
                route: "",
                isWorking: false,
              },
              sunday: {
                startTime: "",
                endTime: "",
                route: "",
                isWorking: false,
              },
            },
            preferredRoutes: userData.preferredRoutes || [],
            availableForOvertime: userData.availableForOvertime || false,
            maximumWorkingHours: userData.maximumWorkingHours || 8,
          };

          setFormData(preparedData);
          setOriginalData(preparedData);
        } else {
          throw new Error("Failed to load driver data");
        }
      } catch (err) {
        console.error("Error fetching driver data:", err);
        setError(err.message || "Failed to load driver profile");
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [userId]);

  useEffect(() => {
    const changes = Object.keys(formData).some((key) => {
      if (key === "weeklySchedule") {
        return (
          JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])
        );
      }
      return (
        JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])
      );
    });
    setHasChanges(changes);
  }, [formData, originalData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScheduleChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          [field]: field === "isWorking" ? value : value,
        },
      },
    }));
  };

  const handleRouteAdd = () => {
    const newRoute = prompt("Enter route name:");
    if (
      newRoute &&
      newRoute.trim() &&
      !formData.preferredRoutes.includes(newRoute.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        preferredRoutes: [...prev.preferredRoutes, newRoute.trim()],
      }));
    }
  };

  const handleRouteRemove = (routeToRemove) => {
    setFormData((prev) => ({
      ...prev,
      preferredRoutes: prev.preferredRoutes.filter(
        (route) => route !== routeToRemove
      ),
    }));
  };

  const validatePassword = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "New password must be at least 8 characters long";
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handlePasswordSubmit = async () => {
    const passwordErrors = validatePassword();
    if (Object.keys(passwordErrors).length > 0) {
      setFormErrors(passwordErrors);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await UserService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        setSuccess("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordSection(false);
        setFormErrors({});
      } else {
        throw new Error(response.message || "Failed to update password");
      }
    } catch (err) {
      console.error("Password update error:", err);
      setError(err.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const validatePhone = (phone) => {
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

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  const validateZipCode = (zipCode) => {
    if (!zipCode) return true; // Optional
    return /^\d{5}$/.test(zipCode.trim());
  };

  const validateLicenseNumber = (license) => {
    if (!license) return false;
    const licenseClean = license.trim().toUpperCase();
    return /^[A-Z][0-9]{7}$/.test(licenseClean);
  };

  const validateVehicleNumber = (vehicle) => {
    if (!vehicle) return false;
    const vehicleClean = vehicle.trim().toUpperCase();
    return /^([A-Z]{2,3}-\d{4}|[A-Z]{2}\s[A-Z]{2,3}-\d{4}|BUS-\d{3,4})$/i.test(
      vehicleClean
    );
  };

  const validateForm = () => {
    const errors = {};

    // Name validation - letters only
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName.trim())) {
      errors.firstName = "First name should only contain letters";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName.trim())) {
      errors.lastName = "Last name should only contain letters";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation - Sri Lankan format
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!validatePhone(formData.phoneNumber)) {
      errors.phoneNumber =
        "Please enter a valid Sri Lankan phone number (e.g., 0771234567 or +94771234567)";
    }

    // License validation - Sri Lankan format
    if (!formData.licenseNumber.trim()) {
      errors.licenseNumber = "License number is required";
    } else if (!validateLicenseNumber(formData.licenseNumber)) {
      errors.licenseNumber =
        "License must be in format: One letter followed by 7 digits (e.g., B1234567)";
    }

    // License expiry validation
    if (!formData.licenseExpiry) {
      errors.licenseExpiry = "License expiry date is required";
    } else {
      const expiryDate = new Date(formData.licenseExpiry);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysDiff = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

      if (expiryDate <= today) {
        errors.licenseExpiry = "License expiry date must be in the future";
      } else if (daysDiff <= 30) {
        errors.licenseExpiry =
          "License expires within 30 days - please renew before updating";
      }
    }

    // Vehicle number validation - Sri Lankan format
    if (!formData.vehicleNumber.trim()) {
      errors.vehicleNumber = "Vehicle number is required";
    } else if (!validateVehicleNumber(formData.vehicleNumber)) {
      errors.vehicleNumber =
        "Invalid vehicle number format. Examples: WP CAB-1234, ABC-1234, or BUS-101";
    }

    // Years of experience
    if (!formData.yearsOfExperience) {
      errors.yearsOfExperience = "Years of experience is required";
    }

    // Emergency contact validation - Sri Lankan format
    if (!formData.emergencyContact.trim()) {
      errors.emergencyContact = "Emergency contact is required";
    } else {
      const emergencyClean = formData.emergencyContact.replace(/\s+/g, "");
      const phoneClean = formData.phoneNumber?.replace(/\s+/g, "") || "";

      if (!validatePhone(formData.emergencyContact)) {
        errors.emergencyContact =
          "Please enter a valid Sri Lankan phone number";
      } else if (emergencyClean === phoneClean) {
        errors.emergencyContact =
          "Emergency contact must be different from your phone number";
      }
    }

    // Zip code validation
    if (formData.zipCode && !validateZipCode(formData.zipCode)) {
      errors.zipCode = "Sri Lankan postal code must be 5 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setError("Please fix the errors below");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        licenseNumber: formData.licenseNumber.trim(),
        licenseExpiry: formData.licenseExpiry,
        vehicleNumber: formData.vehicleNumber.trim(),
        yearsOfExperience: formData.yearsOfExperience,
        emergencyContact: formData.emergencyContact.trim(),
        country: formData.country,
        address: {
          city: formData.city?.trim() || "",
          state: formData.state?.trim() || "",
          zipCode: formData.zipCode?.trim() || "",
          country: formData.country,
        },

        currentRoute: formData.currentRoute?.trim() || "",
        employmentStatus: formData.employmentStatus || "",
        shiftPreference: formData.shiftPreference || "",
        salary: formData.salary ? parseFloat(formData.salary) : null,
        specialQualifications: formData.specialQualifications?.trim() || "",

        medicalCertificateExpiry: formData.medicalCertificateExpiry || null,
        bloodType: formData.bloodType || "",
        medicalConditions: formData.medicalConditions?.trim() || "",

        weeklySchedule: formData.weeklySchedule,
        preferredRoutes: formData.preferredRoutes,
        availableForOvertime: formData.availableForOvertime,
        maximumWorkingHours: formData.maximumWorkingHours,

        preferences: {
          notifications: {
            email:
              formData.emailNotifications !== undefined
                ? formData.emailNotifications
                : true,
            sms:
              formData.smsNotifications !== undefined
                ? formData.smsNotifications
                : true,
            push:
              formData.pushNotifications !== undefined
                ? formData.pushNotifications
                : true,
          },
          language: formData.language || "en",
          currency: formData.currency || "LKR",
        },
      };

      console.log("Sending update data:", updateData);

      let response;
      if (userId) {
        response = await UserService.updateUser(userId, updateData);
      } else {
        response = await UserService.updateProfile(updateData);
      }

      if (response.success) {
        setSuccess("Profile updated successfully!");
        setOriginalData(formData);
        setHasChanges(false);

        setTimeout(() => {
          if (userId) {
            navigate(`/admin/userdetail/${userId}`);
          } else {
            navigate("/driver/profile");
          }
        }, 2000);
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        if (userId) {
          navigate(`/admin/userdetail/${userId}`);
        } else {
          navigate("/driver/profile");
        }
      }
    } else {
      if (userId) {
        navigate(`/admin/userdetail/${userId}`);
      } else {
        navigate("/driver/profile");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading driver profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {userId ? "Edit Driver Profile" : "Edit My Profile"}
                  </h1>
                  <p className="text-gray-600">
                    Update driver information and settings
                  </p>
                </div>
              </div>
              {hasChanges && (
                <div className="text-sm text-amber-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Unsaved changes
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Success</p>
                <p className="text-sm text-green-700 mt-1">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.firstName
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter first name"
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.firstName}
                    </p>
                  )}
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
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.lastName
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter last name"
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.email
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter email address"
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="0771234567 or +94771234567"
                    maxLength={13}
                    pattern="^(0[0-9]{9}|\+94[0-9]{9})$"
                    title="Sri Lankan phone number: 10 digits starting with 0 or +94"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.phoneNumber
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.phoneNumber && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.phoneNumber}
                    </p>
                  )}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Driver License Information
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Number *
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                      handleInputChange(e);
                    }}
                    placeholder="B1234567"
                    maxLength={8}
                    pattern="[A-Za-z][0-9]{7}"
                    title="License: One letter followed by 7 digits"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.licenseNumber
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.licenseNumber && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.licenseNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Expiry Date *
                  </label>
                  <input
                    type="date"
                    name="licenseExpiry"
                    value={formData.licenseExpiry}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.licenseExpiry
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.licenseExpiry && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.licenseExpiry}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                    placeholder="WP CAB-1234 or BUS-101"
                    maxLength={15}
                    style={{ textTransform: "uppercase" }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.vehicleNumber
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.vehicleNumber && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.vehicleNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <select
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.yearsOfExperience
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select experience</option>
                    <option value="0-1">0-1 years</option>
                    <option value="1-3">1-3 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                  {formErrors.yearsOfExperience && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.yearsOfExperience}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact *
                  </label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="0771234567"
                    maxLength={10}
                    pattern="0[0-9]{9}"
                    title="Valid 10-digit Sri Lankan phone number"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.emergencyContact
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.emergencyContact && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.emergencyContact}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Address Information
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter state or province"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="10400"
                    maxLength={5}
                    pattern="[0-9]{5}"
                    title="5-digit postal code"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.zipCode
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {formErrors.zipCode && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.zipCode}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Car className="w-5 h-5 mr-2" />
                Professional Information
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Route
                  </label>
                  <select
                    name="currentRoute"
                    value={formData.currentRoute}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a route</option>
                    <option value="Route 1 - Colombo to Kandy">
                      Route 1 - Colombo to Kandy
                    </option>
                    <option value="Route 2 - Kandy to Galle">
                      Route 2 - Kandy to Galle
                    </option>
                    <option value="Route 3 - Colombo to Galle">
                      Route 3 - Colombo to Galle
                    </option>
                    <option value="Route 4 - Colombo to Jaffna">
                      Route 4 - Colombo to Jaffna
                    </option>
                    <option value="Route 5 - Kandy to Anuradhapura">
                      Route 5 - Kandy to Anuradhapura
                    </option>
                    <option value="Express Route A">Express Route A</option>
                    <option value="Express Route B">Express Route B</option>
                    <option value="Local Route 1">Local Route 1</option>
                    <option value="Local Route 2">Local Route 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Status
                  </label>
                  <select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select status</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift Preference
                  </label>
                  <select
                    name="shiftPreference"
                    value={formData.shiftPreference}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select preference</option>
                    <option value="morning">Morning (6AM - 2PM)</option>
                    <option value="afternoon">Afternoon (2PM - 10PM)</option>
                    <option value="night">Night (10PM - 6AM)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary/Wage (LKR)
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter monthly salary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Qualifications
                  </label>
                  <textarea
                    name="specialQualifications"
                    value={formData.specialQualifications}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter any special qualifications, certifications, or training"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Health & Safety Information
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Certificate Expiry
                  </label>
                  <input
                    type="date"
                    name="medicalCertificateExpiry"
                    value={formData.medicalCertificateExpiry}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Type
                  </label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select blood type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Conditions/Allergies
                  </label>
                  <textarea
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="List any medical conditions, allergies, or medications that may affect driving"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Password & Security
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:text-blue-800"
                >
                  {showPasswordSection ? "Cancel" : "Change Password"}
                </button>
              </div>
            </div>
            {showPasswordSection && (
              <div className="p-6 space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Password Security
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Your new password must be at least 8 characters long and
                        include a mix of letters, numbers, and special
                        characters.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.currentPassword
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {formErrors.currentPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.newPassword
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {formErrors.newPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.confirmPassword
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-sm text-red-600 mt-1">
                        {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setFormErrors({});
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePasswordSubmit}
                    disabled={saving}
                    className={`px-4 py-2 rounded-lg flex items-center ${
                      saving
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule & Route Management
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                  {[
                    { id: "weekly", label: "Weekly Schedule", icon: Calendar },
                    {
                      id: "preferences",
                      label: "Work Preferences",
                      icon: Clock,
                    },
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveScheduleTab(tab.id)}
                        className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                          activeScheduleTab === tab.id
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

              {activeScheduleTab === "weekly" && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    Weekly Work Schedule
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(formData.weeklySchedule).map(
                      ([day, schedule]) => (
                        <div
                          key={day}
                          className="grid grid-cols-5 gap-4 items-center p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={schedule.isWorking}
                              onChange={(e) =>
                                handleScheduleChange(
                                  day,
                                  "isWorking",
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                            />
                            <label className="font-medium text-gray-700 capitalize">
                              {day}
                            </label>
                          </div>
                          <div>
                            <input
                              type="time"
                              value={schedule.startTime}
                              onChange={(e) =>
                                handleScheduleChange(
                                  day,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              disabled={!schedule.isWorking}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                          </div>
                          <div>
                            <input
                              type="time"
                              value={schedule.endTime}
                              onChange={(e) =>
                                handleScheduleChange(
                                  day,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              disabled={!schedule.isWorking}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                          </div>
                          <div className="col-span-2">
                            <select
                              value={schedule.route}
                              onChange={(e) =>
                                handleScheduleChange(
                                  day,
                                  "route",
                                  e.target.value
                                )
                              }
                              disabled={!schedule.isWorking}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                              <option value="">Select route</option>
                              <option value="Route 1">
                                Route 1 - Colombo to Kandy
                              </option>
                              <option value="Route 2">
                                Route 2 - Kandy to Galle
                              </option>
                              <option value="Route 3">
                                Route 3 - Colombo to Galle
                              </option>
                              <option value="Route 4">
                                Route 4 - Colombo to Jaffna
                              </option>
                              <option value="Express A">Express Route A</option>
                              <option value="Local 1">Local Route 1</option>
                            </select>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {activeScheduleTab === "preferences" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Working Hours per Day
                      </label>
                      <select
                        name="maximumWorkingHours"
                        value={formData.maximumWorkingHours}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={6}>6 hours</option>
                        <option value={8}>8 hours</option>
                        <option value={10}>10 hours</option>
                        <option value={12}>12 hours</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Shift Type
                      </label>
                      <select
                        name="shiftPreference"
                        value={formData.shiftPreference}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select preference</option>
                        <option value="morning">Morning (6AM - 2PM)</option>
                        <option value="afternoon">
                          Afternoon (2PM - 10PM)
                        </option>
                        <option value="night">Night (10PM - 6AM)</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="availableForOvertime"
                      checked={formData.availableForOvertime}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Available for overtime work
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preferred Routes
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.preferredRoutes.map((route, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {route}
                          <button
                            type="button"
                            onClick={() => handleRouteRemove(route)}
                            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleRouteAdd}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Preferred Route
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Preferences & Settings
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Notification Preferences
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        checked={formData.emailNotifications}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Email notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="smsNotifications"
                        checked={formData.smsNotifications}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        SMS notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="pushNotifications"
                        checked={formData.pushNotifications}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Push notifications
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Language
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="si">Sinhala</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency Preference
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="LKR">Sri Lankan Rupee (LKR)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Fields marked with * are required
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving || !hasChanges}
                    className={`px-6 py-2 rounded-lg flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      saving || !hasChanges
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverEdit;
