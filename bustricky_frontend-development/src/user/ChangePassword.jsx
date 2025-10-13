import { AlertCircle, Check, Eye, EyeOff, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { apiService, API_ENDPOINTS, handleApiError } from "../services/api";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    setSuccess(false);

    // Client-side validation
    const validation = validatePassword(formData.newPassword);

    if (!validation.isValid) {
      setErrors({ newPassword: "Password does not meet requirements" });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setIsLoading(false);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setErrors({
        newPassword: "New password must be different from current password",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Call the API
      const response = await apiService.put(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }
      );

      console.log("Password change response:", response.data);

      // Success
      setSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);

      // Optional: If the API returns a new token, update it
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
    } catch (error) {
      console.error("Password change error:", error);
      const apiError = handleApiError(error);

      // Handle specific error cases
      if (apiError.status === 401) {
        setErrors({ currentPassword: "Current password is incorrect" });
      } else if (apiError.status === 400) {
        setErrors({ general: apiError.message || "Invalid password format" });
      } else {
        setErrors({
          general:
            apiError.message || "Failed to change password. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
    if (errors.general) {
      setErrors({ ...errors, general: "" });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const passwordValidation = validatePassword(formData.newPassword);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-700">
              Password changed successfully! You may need to log in again.
            </span>
          </div>
        )}

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  handleInputChange("currentPassword", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                  errors.currentPassword ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter your current password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.current ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.currentPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                  errors.newPassword ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter your new password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {formData.newPassword && (
              <div className="mt-3 space-y-2">
                <div className="text-sm text-gray-600 font-medium">
                  Password Requirements:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div
                    className={`flex items-center gap-2 ${
                      passwordValidation.minLength
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    At least 8 characters
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      passwordValidation.hasUpper
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    Uppercase letter
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      passwordValidation.hasLower
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    Lowercase letter
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      passwordValidation.hasNumber
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    Number
                  </div>
                  <div
                    className={`flex items-center gap-2 ${
                      passwordValidation.hasSpecial
                        ? "text-green-600"
                        : "text-gray-400"
                    } sm:col-span-2`}
                  >
                    <Check className="w-4 h-4" />
                    Special character (!@#$%^&*)
                  </div>
                </div>
              </div>
            )}
            {errors.newPassword && (
              <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                  errors.confirmPassword ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Confirm your new password"
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">
                  Security Tips
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use a unique password you don't use elsewhere</li>
                  <li>• Consider using a password manager</li>
                  <li>• Don't share your password with anyone</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={
                isLoading ||
                !passwordValidation.isValid ||
                !formData.currentPassword ||
                !formData.confirmPassword
              }
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? "Changing Password..." : "Change Password"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
                setErrors({});
                setSuccess(false);
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
