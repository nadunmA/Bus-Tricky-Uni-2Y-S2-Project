import { AlertCircle, CheckCircle, Mail, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const EmailVerification = () => {
  const [verificationStatus, setVerificationStatus] = useState("loading");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const verifyEmail = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        setVerificationStatus("success");

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        const errorData = await response.json();
        if (errorData.code === "TOKEN_EXPIRED") {
          setVerificationStatus("expired");
        } else {
          setVerificationStatus("error");
          setError(errorData.message || "Verification failed");
        }
      }
    } catch {
      setVerificationStatus("error");
      setError("Network error. Please try again.");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setVerificationStatus("error");
      setError("Invalid verification link");
    }
  }, [token, verifyEmail]);

  const handleResendVerification = async () => {
    if (!email) {
      setError("Email address not found. Please register again.");
      return;
    }

    setIsResending(true);
    setResendMessage("");
    setError("");

    try {
      // Replace with your API endpoint
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendMessage("Verification email sent! Please check your inbox.");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to resend verification email");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case "loading":
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verifying Email
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 mb-4">
              Your email has been successfully verified. You can now access your
              account.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </div>
        );

      case "expired":
        return (
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Link Expired
            </h2>
            <p className="text-gray-600 mb-6">
              This verification link has expired. Please request a new one.
            </p>

            {resendMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                <p className="text-green-700 text-sm">{resendMessage}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </button>
          </div>
        );

      case "error":
      default:
        return (
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "We couldn't verify your email. The link may be invalid or expired."}
            </p>

            {resendMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                <p className="text-green-700 text-sm">{resendMessage}</p>
              </div>
            )}

            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center mb-4"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </button>

            <button
              onClick={() => navigate("/login")}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition duration-200"
            >
              Back to Login
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        {renderContent()}
      </div>
    </div>
  );
};

export default EmailVerification;
