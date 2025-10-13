import {
  AlertTriangle,
  Bus,
  Calendar,
  Car,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
  UserCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const validateDriverForm = (formData) => {
  const errors = {};

  // Name validation
  if (!formData.firstName?.trim()) {
    errors.firstName = "First name is required";
  } else if (formData.firstName.trim().length < 2) {
    errors.firstName = "First name must be at least 2 characters";
  } else if (formData.firstName.trim().length > 50) {
    errors.firstName = "First name must not exceed 50 characters";
  } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) {
    errors.firstName =
      "First name should only contain letters, spaces, hyphens, and apostrophes";
  }

  if (!formData.lastName?.trim()) {
    errors.lastName = "Last name is required";
  } else if (formData.lastName.trim().length < 2) {
    errors.lastName = "Last name must be at least 2 characters";
  } else if (formData.lastName.trim().length > 50) {
    errors.lastName = "Last name must not exceed 50 characters";
  } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) {
    errors.lastName =
      "Last name should only contain letters, spaces, hyphens, and apostrophes";
  }

  // Email validation
  // Email validation
  if (!formData.email?.trim()) {
    errors.email = "Email is required";
  } else {
    const trimmedEmail = formData.email.trim();

    if (trimmedEmail.length > 254) {
      errors.email = "Email is too long";
    } else if (
      !/^[a-zA-Z0-9]([a-zA-Z0-9._-]{0,63})?@[a-zA-Z0-9]([a-zA-Z0-9.-]{0,253})?[a-zA-Z0-9]\.[a-zA-Z]{2,63}$/.test(
        trimmedEmail
      )
    ) {
      errors.email = "Please enter a valid email address";
    } else {
      const [localPart, domain] = trimmedEmail.split("@");

      // Additional validation checks
      if (localPart.startsWith(".") || localPart.endsWith(".")) {
        errors.email = "Email format is invalid";
      } else if (localPart.includes("..") || domain.includes("..")) {
        errors.email = "Email cannot contain consecutive dots";
      } else {
        // Validate domain has valid TLD
        const domainParts = domain.split(".");
        const tld = domainParts[domainParts.length - 1];

        // Check if TLD contains only letters (no numbers or special chars)
        if (!/^[a-zA-Z]{2,63}$/.test(tld)) {
          errors.email = "Please enter a valid email address";
        }

        // Optional: Check for common valid TLDs
        const commonTLDs = [
          "com",
          "org",
          "net",
          "edu",
          "gov",
          "mil",
          "int",
          "co",
          "uk",
          "us",
          "ca",
          "de",
          "jp",
          "fr",
          "au",
          "in",
          "cn",
          "br",
          "ru",
          "lk",
          "io",
          "ai",
          "app",
          "dev",
        ];
        if (!commonTLDs.includes(tld.toLowerCase()) && tld.length < 2) {
          errors.email = "Please enter a valid email domain";
        }
      }
    }
  }

  // Phone number validation - Sri Lankan format
  if (!formData.phoneNumber?.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else {
    const phoneClean = formData.phoneNumber.replace(/[\s\-()]/g, "");

    // Sri Lankan mobile: 0771234567 (10 digits starting with 07)
    // Sri Lankan landline: 0112345678 (10 digits starting with 011)
    const localMobileRegex = /^07[0-9]{8}$/;
    const localLandlineRegex = /^011[0-9]{7}$/;

    if (
      !localMobileRegex.test(phoneClean) &&
      !localLandlineRegex.test(phoneClean)
    ) {
      errors.phoneNumber =
        "Please enter a valid Sri Lankan phone number (e.g., 0771234567 or 0112345678)";
    }
  }

  // CRITICAL: Location validations - REQUIRED FIELDS
  if (!formData.country?.trim()) {
    errors.country = "Country is required";
  }

  if (!formData.city?.trim()) {
    errors.city = "City is required";
  } else if (formData.city.trim().length < 2) {
    errors.city = "City must be at least 2 characters";
  } else if (formData.city.trim().length > 100) {
    errors.city = "City must not exceed 100 characters";
  } else if (!/^[a-zA-Z\s',.-]+$/.test(formData.city.trim())) {
    errors.city = "City contains invalid characters";
  }

  if (!formData.state?.trim()) {
    errors.state = "State/Province is required";
  } else if (formData.state.trim().length < 2) {
    errors.state = "State/Province must be at least 2 characters";
  } else if (formData.state.trim().length > 100) {
    errors.state = "State/Province must not exceed 100 characters";
  } else if (!/^[a-zA-Z\s',.-]+$/.test(formData.state.trim())) {
    errors.state = "State/Province contains invalid characters";
  }

  // Zip code validation for Sri Lanka - REQUIRED
  if (!formData.zipCode?.trim()) {
    errors.zipCode = "Postal code is required";
  } else {
    const cleanZipCode = formData.zipCode.trim();
    if (!/^\d{5}$/.test(cleanZipCode)) {
      errors.zipCode = "Sri Lankan postal code must be exactly 5 digits";
    } else if (cleanZipCode === "00000") {
      errors.zipCode = "Invalid postal code";
    }
  }

  // Driver-specific validations
  if (formData.role === "driver") {
    if (!formData.licenseNumber?.trim()) {
      errors.licenseNumber = "License number is required for drivers";
    } else {
      const licenseClean = formData.licenseNumber.trim().toUpperCase();
      if (!/^[A-Z][0-9]{7}$/.test(licenseClean)) {
        errors.licenseNumber =
          "License must be in format: One letter followed by 7 digits (e.g., B1234567)";
      }
    }

    // License expiry validation
    if (!formData.licenseExpiry) {
      errors.licenseExpiry = "License expiry date is required for drivers";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiryDate = new Date(formData.licenseExpiry);
      expiryDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

      if (expiryDate <= today) {
        errors.licenseExpiry = "License expiry date must be in the future";
      } else if (daysDiff <= 30) {
        errors.licenseExpiry =
          "License expires within 30 days - please renew before registering";
      } else if (daysDiff > 3650) {
        errors.licenseExpiry =
          "License expiry date seems invalid (too far in future)";
      }
    }

    if (!formData.vehicleNumber?.trim()) {
      errors.vehicleNumber = "Vehicle/Bus number is required for drivers";
    } else {
      const vehicleClean = formData.vehicleNumber.trim().toUpperCase();
      if (
        !/^([A-Z]{2,3}-\d{4}|[A-Z]{2}\s[A-Z]{2,3}-\d{4}|BUS-\d{3,4})$/i.test(
          vehicleClean
        )
      ) {
        errors.vehicleNumber =
          "Invalid vehicle number format. Examples: WP CAB-1234, ABC-1234, or BUS-101";
      }
    }

    // Years of experience validation
    if (!formData.yearsOfExperience) {
      errors.yearsOfExperience = "Years of experience is required for drivers";
    }

    // Emergency contact validation - Sri Lankan format
    if (!formData.emergencyContact?.trim()) {
      errors.emergencyContact = "Emergency contact is required for drivers";
    } else {
      const emergencyClean = formData.emergencyContact.replace(/[\s\-()]/g, "");
      const phoneClean = formData.phoneNumber?.replace(/[\s\-()]/g, "") || "";

      const localMobileRegex = /^07[0-9]{8}$/;
      const localLandlineRegex = /^011[0-9]{7}$/;

      if (
        !localMobileRegex.test(emergencyClean) &&
        !localLandlineRegex.test(emergencyClean)
      ) {
        errors.emergencyContact =
          "Emergency contact must be a valid Sri Lankan phone number";
      } else if (emergencyClean === phoneClean) {
        errors.emergencyContact =
          "Emergency contact must be different from your phone number";
      }
    }
  }

  // Password validation (only for non-Google signup)
  if (!formData.isGoogleSignup) {
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    } else if (formData.password.length > 128) {
      errors.password = "Password must not exceed 128 characters";
    } else {
      const hasUpper = /[A-Z]/.test(formData.password);
      const hasLower = /[a-z]/.test(formData.password);
      const hasNumber = /\d/.test(formData.password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>_+=[\]\\/`~;'-]/.test(
        formData.password
      );

      if (!hasUpper || !hasLower || !hasNumber) {
        errors.password =
          "Password must contain uppercase, lowercase, and number";
      } else if (!hasSpecial) {
        errors.password =
          "Password must contain at least one special character";
      }

      // Check for common weak passwords
      const commonPasswords = ["password", "12345678", "qwerty123", "admin123"];
      if (
        commonPasswords.some((common) =>
          formData.password.toLowerCase().includes(common)
        )
      ) {
        errors.password =
          "Password is too common. Please choose a stronger password";
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
  }

  // Terms agreement
  if (!formData.agreeToTerms) {
    errors.agreeToTerms = "You must agree to the terms and conditions";
  }

  return errors;
};

const handleRegistration = async (formData) => {
  try {
    const registrationPayload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.toLowerCase().trim(),
      phoneNumber: formData.phoneNumber.trim(),
      role: formData.role,

      country: formData.country || "Sri Lanka",
      city: formData.city?.trim() || "",
      state: formData.state?.trim() || "",
      zipCode: formData.zipCode?.trim() || "",
    };

    if (formData.role === "driver") {
      registrationPayload.licenseNumber = formData.licenseNumber.trim();
      registrationPayload.licenseExpiry = formData.licenseExpiry;
      registrationPayload.vehicleNumber = formData.vehicleNumber.trim();
      registrationPayload.yearsOfExperience = formData.yearsOfExperience;
      registrationPayload.emergencyContact = formData.emergencyContact.trim();
      registrationPayload.currentRoute = formData.currentRoute;
      registrationPayload.employmentStatus = formData.employmentStatus;
      registrationPayload.shiftPreference = formData.shiftPreference;
      registrationPayload.maximumWorkingHours = formData.maximumWorkingHours;
      registrationPayload.availableForOvertime = formData.availableForOvertime;
    }

    if (!formData.isGoogleSignup) {
      registrationPayload.password = formData.password;
    }

    if (formData.dateOfBirth)
      registrationPayload.dateOfBirth = formData.dateOfBirth;
    if (formData.gender) registrationPayload.gender = formData.gender;

    console.log("Registration payload prepared:", {
      ...registrationPayload,
      password: registrationPayload.password ? "***" : "N/A",
    });

    const response = await fetch(
      "http://localhost:8000/api/v1/users/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationPayload),
      }
    );

    const data = await response.json();
    console.log("Response data:", data);

    if (!response.ok) {
      throw new Error(
        data.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    if (data.success) {
      console.log("Registration successful:", data);

      // DON'T store token/user during registration
      // User must login to get authenticated

      return {
        success: true,
        message: data.message || "Registration successful",
        data: data.data || data,
        user: data.user,
      };
    } else {
      throw new Error(data.message || "Registration failed");
    }
  } catch (error) {
    console.error("Registration error:", error);

    let errorMessage = error.message;

    if (errorMessage.includes("license")) {
      errorMessage =
        "License information validation failed. Please check your license details.";
    } else if (errorMessage.includes("email")) {
      errorMessage =
        "Email already exists or is invalid. Please use a different email.";
    } else if (errorMessage.includes("vehicle")) {
      errorMessage =
        "Vehicle information is invalid. Please check your vehicle details.";
    } else if (errorMessage.includes("validation")) {
      errorMessage =
        "Please check that all required fields are filled correctly.";
    }

    return {
      success: false,
      message: errorMessage,
      error: error,
    };
  }
};

const DriverRegistrationSection = ({ formData, handleChange, errors }) => {
  const [showLicenseHelp, setShowLicenseHelp] = useState(false);
  const [showVehicleHelp, setShowVehicleHelp] = useState(false);

  const handleLicenseInput = (e) => {
    e.target.value = e.target.value.toUpperCase();
    handleChange(e);
  };

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-blue-900 flex items-center">
            <Car className="w-4 h-4 mr-2" />
            Driver License & Vehicle Information
          </h3>
          <div className="text-xs text-blue-600">
            All fields required for drivers
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Driver's License Number *
            </label>
            <button
              type="button"
              onClick={() => setShowLicenseHelp(!showLicenseHelp)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Need help?
            </button>
          </div>

          {showLicenseHelp && (
            <div className="mb-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
              Enter your full driving license number as shown on your license
              card. Format: One letter followed by 7 digits (e.g., B1234567)
            </div>
          )}

          <div className="relative">
            <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleLicenseInput}
              className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200 ${
                errors.licenseNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., B1234567"
              maxLength={8}
              pattern="[A-Za-z][0-9]{7}"
              title="License must be one letter followed by 7 digits"
            />
          </div>
          {errors.licenseNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Expiry Date *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              name="licenseExpiry"
              value={formData.licenseExpiry}
              onChange={handleChange}
              min={
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]
              }
              max={
                new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]
              }
              className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200 ${
                errors.licenseExpiry ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          {errors.licenseExpiry && (
            <p className="text-red-500 text-xs mt-1">{errors.licenseExpiry}</p>
          )}
          {formData.licenseExpiry && (
            <p className="text-xs text-gray-600 mt-1">
              Expires in{" "}
              {Math.ceil(
                (new Date(formData.licenseExpiry) - new Date()) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              days
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Vehicle/Bus Number *
            </label>
            <button
              type="button"
              onClick={() => setShowVehicleHelp(!showVehicleHelp)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Need help?
            </button>
          </div>

          {showVehicleHelp && (
            <div className="mb-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
              Enter the registration number of the bus/vehicle you'll be
              driving. Examples: WP CAB-1234, Bus-101, KL-01-AB-1234
            </div>
          )}

          <div className="relative">
            <Bus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200 ${
                errors.vehicleNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., WP CAB-1234 or BUS-101"
              maxLength={15}
              style={{ textTransform: "uppercase" }}
            />
          </div>
          {errors.vehicleNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.vehicleNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience *
            </label>
            <select
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200 ${
                errors.yearsOfExperience ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select experience</option>
              <option value="0-1">Less than 1 year</option>
              <option value="1-3">1-3 years</option>
              <option value="3-5">3-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
            {errors.yearsOfExperience && (
              <p className="text-red-500 text-xs mt-1">
                {errors.yearsOfExperience}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Contact *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200 ${
                  errors.emergencyContact ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0771234567"
                maxLength={10}
                pattern="0[0-9]{9}"
                title="Must be a valid 10-digit Sri Lankan phone number"
              />
            </div>
            {errors.emergencyContact && (
              <p className="text-red-500 text-xs mt-1">
                {errors.emergencyContact}
              </p>
            )}
            <p className="text-xs text-gray-600 mt-1">
              Must be different from your phone number
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Professional Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Route
            </label>
            <select
              name="currentRoute"
              value={formData.currentRoute}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select preferred route</option>
              <option value="Route 1 - Colombo to Kandy">
                Route 1 - Colombo to Kandy
              </option>
              <option value="Route 2 - Kandy to Galle">
                Route 2 - Kandy to Galle
              </option>
              <option value="Route 3 - Colombo to Galle">
                Route 3 - Colombo to Galle
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Type
            </label>
            <select
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select employment type</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shift Preference
            </label>
            <select
              name="shiftPreference"
              value={formData.shiftPreference}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select shift preference</option>
              <option value="morning">Morning (6AM - 2PM)</option>
              <option value="afternoon">Afternoon (2PM - 10PM)</option>
              <option value="night">Night (10PM - 6AM)</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Work Availability</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Working Hours per Day
            </label>
            <select
              name="maximumWorkingHours"
              value={formData.maximumWorkingHours}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={6}>6 hours</option>
              <option value={8}>8 hours</option>
              <option value={10}>10 hours</option>
              <option value={12}>12 hours</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="availableForOvertime"
              checked={formData.availableForOvertime}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Available for overtime work
            </label>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Driver Verification Process
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Your license and vehicle information will be verified by our
                    admin team
                  </li>
                  <li>Account activation may take 2-3 business days</li>
                  <li>
                    You'll be contacted for document verification if needed
                  </li>
                  <li>
                    Keep your driving license and vehicle registration ready
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const DriverRegistrationSuccess = ({ driverData, onContinueToLogin }) => {
  return (
    <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
          <UserCheck className="w-6 h-6 text-white" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-green-800 mb-2">
        Driver Account Created Successfully!
      </h3>

      <div className="text-sm mb-4 space-y-2">
        <p className="font-medium">
          Welcome to Bus Tracking System, {driverData?.firstName}!
        </p>
        <p>Your driver account has been registered with:</p>

        <div className="bg-white rounded-md p-3 text-left">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <strong>License:</strong> {driverData?.licenseNumber || "N/A"}
            </div>
            <div>
              <strong>Vehicle:</strong> {driverData?.vehicleNumber || "N/A"}
            </div>
            <div>
              <strong>Experience:</strong>{" "}
              {driverData?.yearsOfExperience || "N/A"} years
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
        <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1 text-left">
          <li>Check your email and verify your account</li>
          <li>Wait for admin approval (2-3 business days)</li>
          <li>You'll be contacted for document verification if needed</li>
          <li>Complete your profile after approval</li>
          <li>Start accepting ride assignments</li>
        </ol>
      </div>

      <div className="space-y-3">
        <button
          onClick={onContinueToLogin}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition duration-200"
        >
          Continue to Login
        </button>

        <p className="text-xs text-green-600">
          Auto-redirecting to login page in 5 seconds...
        </p>
      </div>
    </div>
  );
};

const Signup = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "passenger",
    agreeToTerms: false,
    country: "Sri Lanka",
    city: "",
    state: "",
    zipCode: "",
    licenseNumber: "",
    licenseExpiry: "",
    vehicleNumber: "",
    yearsOfExperience: "",
    emergencyContact: "",
    isGoogleSignup: false,
    googleId: "",
    googleCredential: "",
    currentRoute: "",
    employmentStatus: "",
    shiftPreference: "",
    maximumWorkingHours: "",
    availableForOvertime: false,
  });

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  const countries = [
    "Sri Lanka",
    "United States",
    "United Kingdom",
    "India",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "Singapore",
    "Malaysia",
    "Thailand",
    "Other",
  ];

  const handleGoogleSignIn = useCallback(async (response) => {
    try {
      setLoading(true);
      setErrors({});

      if (!response.credential) {
        throw new Error("No credential received from Google");
      }

      const userInfo = parseJwt(response.credential);

      if (!userInfo) {
        throw new Error("Failed to parse Google credential");
      }

      setFormData((prev) => ({
        ...prev,
        firstName: userInfo.given_name || "",
        lastName: userInfo.family_name || "",
        email: userInfo.email || "",
        isGoogleSignup: true,
        googleId: userInfo.sub,
        googleCredential: response.credential,
      }));

      setShowAddressForm(true);
      setLoading(false);
    } catch (error) {
      console.error("Google Sign-In error:", error);
      setErrors({ general: "Google Sign-In failed. Please try again." });
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,

            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          console.log("Google Sign-In initialized successfully");
        } catch (error) {
          console.error("Failed to initialize Google Sign-In:", error);
          setErrors({ general: "Failed to initialize Google Sign-In" });
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
    } else {
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log("Google script loaded");
          setTimeout(initializeGoogleSignIn, 100);
        };
        script.onerror = () => {
          console.error("Failed to load Google script");
          setErrors({
            general:
              "Failed to load Google Sign-In. Please check your internet connection.",
          });
        };
        document.head.appendChild(script);
      }
    }

    return () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.cancel();
          // eslint-disable-next-line no-unused-vars
        } catch (error) {
          // error
        }
      }
    };
  }, [handleGoogleSignIn]);

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to parse JWT:", error);
      return null;
    }
  };

  const handleGoogleSignUp = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setErrors({ general: "Google Client ID not configured" });
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        const buttonContainer = document.createElement("div");
        buttonContainer.style.position = "fixed";
        buttonContainer.style.top = "50%";
        buttonContainer.style.left = "50%";
        buttonContainer.style.transform = "translate(-50%, -50%)";
        buttonContainer.style.zIndex = "9999";
        buttonContainer.style.background = "white";
        buttonContainer.style.padding = "20px";
        buttonContainer.style.borderRadius = "8px";
        buttonContainer.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";

        document.body.appendChild(buttonContainer);

        window.google.accounts.id.renderButton(buttonContainer, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signup_with",
          shape: "rectangular",
        });

        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "✕";
        closeBtn.style.position = "absolute";
        closeBtn.style.top = "5px";
        closeBtn.style.right = "10px";
        closeBtn.style.border = "none";
        closeBtn.style.background = "none";
        closeBtn.style.fontSize = "18px";
        closeBtn.onclick = () => document.body.removeChild(buttonContainer);
        buttonContainer.appendChild(closeBtn);
      } catch (error) {
        console.error("Error showing Google sign-in:", error);
        setErrors({
          general: "Failed to show Google Sign-In. Please try again.",
        });
      }
    } else {
      setErrors({
        general:
          "Google Sign-In is not available. Please refresh the page and try again.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const newErrors = validateDriverForm(formData);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      let result;

      if (formData.isGoogleSignup) {
        result = await callGoogleAuth();
      } else {
        result = await handleRegistration(formData);
      }

      if (result?.success) {
        setRegistrationResult(result);
        setSuccess(true);
        setLoading(false);

        // Redirect to login page instead of profile
        setTimeout(() => {
          navigate("/user/login", {
            replace: true,
            state: {
              message:
                "Account created successfully! Please login to continue.",
              email: formData.email,
            },
          });
        }, 2000);
        return;
      } else {
        throw new Error(result?.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage =
        err.message || "Registration failed. Please try again.";
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const callGoogleAuth = async () => {
    const userData = {
      phoneNumber: formData.phoneNumber,
      role: formData.role,
      country: formData.country,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
    };

    if (formData.role === "driver") {
      userData.licenseNumber = formData.licenseNumber;
      userData.licenseExpiry = formData.licenseExpiry;
      userData.vehicleNumber = formData.vehicleNumber;
      userData.yearsOfExperience = formData.yearsOfExperience;
      userData.emergencyContact = formData.emergencyContact;
      userData.currentRoute = formData.currentRoute;
      userData.employmentStatus = formData.employmentStatus;
      userData.shiftPreference = formData.shiftPreference;
      userData.maximumWorkingHours = formData.maximumWorkingHours;
      userData.availableForOvertime = formData.availableForOvertime;
    }

    try {
      console.log("Sending Google Auth request with:", {
        credential: formData.googleCredential ? "Present" : "Missing",
        userData: userData,
      });

      const response = await fetch("http://localhost:8000/api/v1/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: formData.googleCredential,
          userData: userData,
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            console.log("Error response data:", errorData);
          } else {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          }
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      return data;
    } catch (fetchError) {
      console.error("Error details:", {
        message: fetchError.message,
        stack: fetchError.stack,
      });
      throw fetchError;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      console.log("New form data:", newData);
      return newData;
    });

    if (name === "role" && value !== "driver") {
      setFormData((prev) => ({
        ...prev,
        licenseNumber: "",
        licenseExpiry: "",
        vehicleNumber: "",
        yearsOfExperience: "",
        emergencyContact: "",
      }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBackToGoogleOptions = () => {
    setShowAddressForm(false);
    setFormData((prev) => ({
      ...prev,
      firstName: "",
      lastName: "",
      email: "",
      isGoogleSignup: false,
      googleId: "",
      googleCredential: "",
      phoneNumber: "",
      country: "Sri Lanka",
      city: "",
      state: "",
      zipCode: "",
    }));
  };

  const handleSwitchToRegularSignup = () => {
    setShowAddressForm(true);
    setFormData((prev) => ({
      ...prev,
      isGoogleSignup: false,
      googleId: "",
      googleCredential: "",
    }));
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white rounded-full p-3">
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-blue-100">
              {showAddressForm
                ? "Complete your profile information"
                : "Join our bus tracking system today!"}
            </p>
          </div>

          <div className="p-6">
            {!showAddressForm ? (
              <div className="space-y-4">
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {errors.general}
                  </div>
                )}

                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Welcome to Bus Tracking System
                  </h2>
                  <p className="text-sm text-gray-600">
                    Choose how you'd like to create your account
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-4 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {loading ? "Connecting..." : "Continue with Google"}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSwitchToRegularSignup}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                >
                  Sign up with Email
                </button>

                <div className="text-center">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={onSwitchToLogin}
                      className="text-blue-600 hover:text-blue-700 font-semibold transition duration-200"
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {errors.general}
                  </div>
                )}
                {success &&
                  (formData.role === "driver" ? (
                    <DriverRegistrationSuccess
                      driverData={registrationResult?.user || formData}
                      onContinueToLogin={onSwitchToLogin}
                    />
                  ) : (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <span className="font-semibold">
                          Account created successfully!
                        </span>
                      </div>
                      <p className="text-sm mb-3">
                        Please login with your credentials to access your
                        account.
                      </p>
                      <p className="text-xs text-green-600 mt-2">
                        Redirecting to login page in 2 seconds...
                      </p>
                    </div>
                  ))}
                <div className="space-y-4">
                  {formData.isGoogleSignup && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            Google Account Connected
                          </p>
                          <p className="text-xs text-green-600">
                            {formData.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          disabled={formData.isGoogleSignup}
                          className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200 ${
                            errors.firstName
                              ? "border-red-500"
                              : "border-gray-300"
                          } ${formData.isGoogleSignup ? "bg-gray-100" : ""}`}
                          placeholder="First name"
                          autoComplete="given-name"
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          disabled={formData.isGoogleSignup}
                          className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200 ${
                            errors.lastName
                              ? "border-red-500"
                              : "border-gray-300"
                          } ${formData.isGoogleSignup ? "bg-gray-100" : ""}`}
                          placeholder="Last name"
                          autoComplete="family-name"
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={formData.isGoogleSignup}
                        className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        } ${formData.isGoogleSignup ? "bg-gray-100" : ""}`}
                        placeholder="Enter your email"
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200 ${
                          errors.phoneNumber
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="0771234567"
                        maxLength={10}
                        pattern="0[0-9]{9}"
                        title="Phone number must be 10 digits starting with 0"
                        autoComplete="tel"
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Location Information
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200 ${
                            errors.country
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Country</option>
                          {countries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.country && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.country}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200 ${
                            errors.city ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter city"
                          maxLength={100}
                        />
                        {errors.city && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.city}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200 ${
                            errors.state ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter state/province"
                          maxLength={100}
                        />
                        {errors.state && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.state}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Zip/Postal Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200 ${
                          errors.zipCode ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="10400"
                        maxLength={5}
                        pattern="[0-9]{5}"
                        title="Postal code must be exactly 5 digits"
                      />
                      {errors.zipCode && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.zipCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Type
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200"
                    >
                      <option value="passenger">Passenger</option>
                      <option value="driver">Bus Driver</option>
                      <option value="support">Support Staff</option>
                      <option value="admin">System Admin</option>
                    </select>
                  </div>

                  {formData.role === "driver" && (
                    <DriverRegistrationSection
                      formData={formData}
                      handleChange={handleChange}
                      errors={errors}
                    />
                  )}

                  {!formData.isGoogleSignup && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full pl-9 pr-9 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200 ${
                              errors.password
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.password}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full pl-9 pr-9 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition duration-200 ${
                              errors.confirmPassword
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <div className="flex items-start">
                      <input
                        id="agreeToTerms"
                        name="agreeToTerms"
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 ${
                          errors.agreeToTerms ? "border-red-500" : ""
                        }`}
                      />
                      <label
                        htmlFor="agreeToTerms"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        I agree to the{" "}
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Terms and Conditions
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Privacy Policy
                        </button>
                      </label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.agreeToTerms}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    {formData.isGoogleSignup && (
                      <button
                        type="button"
                        onClick={handleBackToGoogleOptions}
                        className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                      >
                        Back
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </div>
                </div>
                {!formData.isGoogleSignup && (
                  <div className="mt-4 text-center">
                    <p className="text-gray-600 text-sm">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="text-blue-600 hover:text-blue-700 font-semibold transition duration-200"
                      >
                        Sign in here
                      </button>
                    </p>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Signup;
