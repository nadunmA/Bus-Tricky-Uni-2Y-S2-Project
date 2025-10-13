import { AlertCircle, ArrowLeft, Bus, CheckCircle, Mail } from "lucide-react";
import { useState } from "react";
import UserService from "../services/UserService";

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!email) {
      setError("Email address is required");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const result = await UserService.forgotPassword(email);

      if (result.success) {
        setEmailSent(true);
        setMessage(
          result.message || "Password reset instructions sent to your email"
        );
      } else {
        setError(
          result.message || "Failed to send reset email. Please try again."
        );
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Email Sent!</h1>
            <p className="text-green-100">
              Check your email for password reset instructions
            </p>
          </div>

          <div className="p-8 text-center">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                We've sent password reset instructions to:
              </p>
              <p className="font-semibold text-gray-800 bg-gray-100 p-3 rounded-lg">
                {email}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> The reset link will expire in 10 minutes.
                If you don't see the email, check your spam folder.
              </p>
            </div>

            <button
              onClick={onBackToLogin}
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3">
              <Bus className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Forgot Password
          </h1>
          <p className="text-blue-100">
            Enter your email to receive reset instructions
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    error ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                "Send Reset Instructions"
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={onBackToLogin}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200 disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
