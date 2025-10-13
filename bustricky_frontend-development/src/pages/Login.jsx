import { Bus, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "../components/ForgotPassword";
import UserService from "../services/UserService";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const trimmedEmail = email.trim();

  if (trimmedEmail.length > 254) return false; // RFC 5321
  if (trimmedEmail.startsWith(".") || trimmedEmail.endsWith(".")) return false;
  if (trimmedEmail.includes("..")) return false;

  return emailRegex.test(trimmedEmail);
};

const validateLoginForm = (formData) => {
  const errors = {};

  // Email validation
  if (!formData.email?.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(formData.email)) {
    errors.email = "Please enter a valid email address";
  } else if (formData.email.trim().length > 254) {
    errors.email = "Email address is too long";
  }

  // Password validation
  if (!formData.password) {
    errors.password = "Password is required";
  } else if (formData.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else if (formData.password.length > 128) {
    errors.password = "Password is too long";
  }

  return errors;
};

const Login = ({ onLogin, onSwitchToSignup }) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const normalizeRole = (role) => {
    if (!role) return null;
    const normalizedRole = role.toLowerCase().trim();

    if (normalizedRole === "admin" || normalizedRole.includes("admin"))
      return "admin";
    if (normalizedRole === "passenger") return "passenger";
    if (normalizedRole === "driver") return "driver";
    if (normalizedRole === "operator") return "operator";

    return normalizedRole;
  };

  // Check for account lockout
  useEffect(() => {
    const lockoutTime = localStorage.getItem("loginLockoutTime");
    if (lockoutTime) {
      const lockoutEnd = new Date(lockoutTime);
      const now = new Date();

      if (now < lockoutEnd) {
        setIsLocked(true);
        const remainingTime = Math.ceil((lockoutEnd - now) / 1000 / 60);
        setErrors({
          general: `Too many failed login attempts. Please try again in ${remainingTime} minute(s).`,
        });

        // Auto-unlock after time expires
        setTimeout(() => {
          setIsLocked(false);
          setErrors({});
          localStorage.removeItem("loginLockoutTime");
          setLoginAttempts(0);
        }, lockoutEnd - now);
      } else {
        localStorage.removeItem("loginLockoutTime");
        setIsLocked(false);
      }
    }
  }, []);

  const handleGoogleLogin = useCallback(
    async (response) => {
      try {
        setLoading(true);
        setErrors({});

        if (!response.credential) {
          throw new Error("No credential received from Google");
        }

        console.log("Google login credential received");

        const result = await fetch("http://localhost:8000/api/v1/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credential: response.credential,
            userData: {},
          }),
        });

        const data = await result.json();
        console.log("Google login response:", data);

        if (data.success && data.token && data.user) {
          const user = data.user;
          const token = data.token;

          console.log("Google login successful for:", user.email);

          const essentialUserData = {
            _id: user._id || user.id,
            id: user._id || user.id,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email,
            role: user.role || "passenger",
            phoneNumber: user.phoneNumber || "",
            isActive: user.isActive !== false,
            isGoogleUser: user.isGoogleUser || false,
            createdAt: user.createdAt || new Date().toISOString(),
          };

          localStorage.setItem("userInfo", JSON.stringify(essentialUserData));
          localStorage.setItem("user", JSON.stringify(essentialUserData));
          localStorage.setItem("token", token);
          localStorage.setItem("authToken", token);
          localStorage.setItem("userId", essentialUserData._id);
          localStorage.setItem("user_id", essentialUserData._id);

          // Reset login attempts on success
          setLoginAttempts(0);
          localStorage.removeItem("loginLockoutTime");

          if (typeof onLogin === "function") {
            onLogin(essentialUserData);
          }

          const userRole = essentialUserData.role;
          const normalizedRole = normalizeRole(userRole);

          const isAdminUser =
            normalizedRole === "admin" ||
            essentialUserData.email?.toLowerCase().includes("admin");

          setTimeout(() => {
            if (isAdminUser || normalizedRole === "admin") {
              navigate("/admin/admindashboard", { replace: true });
            } else if (normalizedRole === "driver") {
              navigate("/driver/profile", { replace: true });
            } else if (normalizedRole === "operator") {
              navigate("/operator/dashboard", { replace: true });
            } else {
              navigate("/user/userprofile", { replace: true });
            }
          }, 500);
        } else {
          throw new Error(data.message || "Google login failed");
        }
      } catch (error) {
        console.error("Google login error:", error);
        let errorMessage = "Google login failed. Please try again.";

        if (error.message.includes("User not found")) {
          errorMessage =
            "No account found with this Google account. Please sign up first.";
        } else if (error.message.includes("token")) {
          errorMessage = "Google authentication failed. Please try again.";
        }

        setErrors({ general: errorMessage });
      } finally {
        setLoading(false);
      }
    },
    [navigate, onLogin]
  );

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleGoogleLogin,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
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
          console.log("Google script loaded for login");
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
        } catch {
          // Silent error handling
        }
      }
    };
  }, [handleGoogleLogin]);

  const handleSwitchToForgotPassword = () => {
    console.log("Switching to forgot password view");
    setCurrentView("forgot-password");
  };

  const handleBackToLogin = () => {
    console.log("Switching back to login view");
    setCurrentView("login");
    setErrors({});
  };

  const handleGoogleLoginClick = () => {
    if (isLocked) {
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log(
              "Google Sign-In prompt not displayed:",
              notification.getNotDisplayedReason()
            );
            setErrors({
              general:
                "Google Sign-In popup was blocked. Please check your popup blocker settings and try again.",
            });
          } else if (notification.isSkippedMoment()) {
            console.log(
              "Google Sign-In prompt skipped:",
              notification.getSkippedReason()
            );
          }
        });
      } catch (error) {
        console.error("Error showing Google prompt:", error);
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

    // Check if locked
    if (isLocked) {
      return;
    }

    setLoading(true);
    setErrors({});

    // Validate form
    const newErrors = validateLoginForm(formData);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // Clean and prepare data
    const cleanedData = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    try {
      console.log("Starting login process");
      console.log("Login credentials:", {
        email: cleanedData.email,
        password: "***",
      });

      const result = await UserService.login(cleanedData);

      if (result?.success && result?.data?.token && result?.data?.user) {
        const user = result.data.user;
        const token = result.data.token;

        // Reset login attempts on success
        setLoginAttempts(0);
        localStorage.removeItem("loginLockoutTime");

        try {
          const essentialUserData = {
            _id: user._id || user.id || `temp_${Date.now()}`,
            id: user._id || user.id || `temp_${Date.now()}`,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || cleanedData.email,
            role: user.role || user.userType || user.accountType || "passenger",
            phoneNumber: user.phoneNumber || user.phone || "",
            isActive: user.isActive !== false,
            createdAt: user.createdAt || new Date().toISOString(),
          };

          localStorage.setItem("userInfo", JSON.stringify(essentialUserData));
          localStorage.setItem("user", JSON.stringify(essentialUserData));
          localStorage.setItem("token", token);
          localStorage.setItem("authToken", token);
          localStorage.setItem("userId", essentialUserData._id);
          localStorage.setItem("user_id", essentialUserData._id);

          if (typeof onLogin === "function") {
            onLogin(essentialUserData);
          }

          const userRole = essentialUserData.role;
          const normalizedRole = normalizeRole(userRole);

          const isAdminUser =
            normalizedRole === "admin" ||
            essentialUserData.email?.toLowerCase().includes("admin") ||
            essentialUserData.email === "admin2@gmail.com";

          setTimeout(() => {
            if (isAdminUser || normalizedRole === "admin") {
              navigate("/admin/admindashboard", { replace: true });
            } else if (normalizedRole === "driver") {
              navigate("/driver/profile", { replace: true });
            } else if (normalizedRole === "operator") {
              navigate("/operator/dashboard", { replace: true });
            } else {
              navigate("/user/userprofile", { replace: true });
            }
          }, 500);
        } catch (storageError) {
          console.error("Storage error:", storageError);
          setErrors({
            general: "Failed to save login data. Please try again.",
          });
        }
      } else {
        // Handle failed login attempt
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
          const lockoutEnd = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
          localStorage.setItem("loginLockoutTime", lockoutEnd.toISOString());
          setIsLocked(true);
          setErrors({
            general:
              "Too many failed login attempts. Your account has been temporarily locked for 15 minutes.",
          });
        } else {
          console.error("Login failed:", result);
          const errorMessage =
            result?.message ||
            result?.error?.message ||
            "Invalid email or password";

          const remainingAttempts = 5 - newAttempts;
          setErrors({
            general: `${errorMessage}. ${remainingAttempts} attempt(s) remaining before temporary lockout.`,
          });
        }
      }
    } catch (err) {
      console.error("Login exception:", err);

      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      let errorMessage = "Something went wrong. Please try again.";

      if (err.response?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (err.response?.status === 429) {
        errorMessage = "Too many login attempts. Please wait and try again.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Lock after 5 attempts
      if (newAttempts >= 5) {
        const lockoutEnd = new Date(Date.now() + 15 * 60 * 1000);
        localStorage.setItem("loginLockoutTime", lockoutEnd.toISOString());
        setIsLocked(true);
        setErrors({
          general:
            "Too many failed login attempts. Your account has been temporarily locked for 15 minutes.",
        });
      } else {
        const remainingAttempts = 5 - newAttempts;
        setErrors({
          general: `${errorMessage}. ${remainingAttempts} attempt(s) remaining before temporary lockout.`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (errors.general) setErrors((prev) => ({ ...prev, general: "" }));
  };

  if (currentView === "forgot-password") {
    return <ForgotPassword onBackToLogin={handleBackToLogin} />;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-3">
                <Bus className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Bus Tracker</h1>
            <p className="text-blue-100">
              Welcome back! Please sign in to your account
            </p>
          </div>

          <div className="p-8">
            {errors.general && (
              <div
                className={`border px-4 py-3 rounded-lg mb-4 ${
                  isLocked
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {errors.general}
              </div>
            )}

            {loginAttempts > 0 && loginAttempts < 5 && !errors.general && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-4">
                Warning: {5 - loginAttempts} login attempt(s) remaining
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLocked}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      } ${isLocked ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      placeholder="Enter your email"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLocked}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      } ${isLocked ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLocked}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition duration-200 disabled:cursor-not-allowed"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      disabled={isLocked}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:cursor-not-allowed"
                    />
                    <label
                      htmlFor="remember-me"
                      className={`ml-2 block text-sm text-gray-700 ${
                        isLocked ? "opacity-50" : ""
                      }`}
                    >
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleSwitchToForgotPassword}
                    disabled={loading || isLocked}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || isLocked}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : isLocked ? (
                    "Account Temporarily Locked"
                  ) : (
                    "Sign In"
                  )}
                </button>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLoginClick}
                    disabled={loading || isLocked}
                    className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                </div>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToSignup}
                  disabled={loading || isLocked}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
