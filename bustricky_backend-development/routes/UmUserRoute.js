const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const UmUserModel = require("../models/UmUserModel");

const {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  updatePassword,
  deleteUserAccount,
  refreshToken,
  getAllUsers,
  getSingleUser,
  updateUserByAdmin,
  deleteUserByAdmin,
  getUserStatus,
  getAdminDashboard,
  activateUser,
  deactivateUser,
  bulkUpdateUsers,
  exportUsers,
  searchUsers,
  getUserActivity,
  changeUserRole,
  sendBulkEmail,
  getLoginAttempts,
  unlockUserAccount,
  getUserAnalytics,
  getDashboardAnalytics,
} = require("../controller/UmUserController");

const {
  protect,
  authorize,
  authorizeAdmin,
  authorizeOwnerOrAdmin,
} = require("../middleware/auth");

const {
  validateRegister,
  validateLogin,
  validatePasswordUpdate,
  validateProfileUpdate,
  validateAdminUpdate,
  validateEmail,
  validatePasswordReset,
  validateBulkUpdate,
  validateRoleChange,
} = require("../middleware/userValidation");

const upload = require("../uploads/upload");
const { handleUploadError } = require("../uploads/upload");

const { googleAuth } = require("../middleware/googleAuth");

const {
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  profileUpdateLimiter,
  genaralLimiter,
} = require("../middleware/rateLimiter");

//public Routes
router.post("/register", authLimiter, validateRegister, registerUser);
router.post("/login", authLimiter, validateLogin, loginUser);
router.post("/refresh-token", genaralLimiter, refreshToken);
router.post("/google", googleAuth);

//email verification part
router.get("/verify-email/:token", emailVerificationLimiter, verifyEmail);
router.post(
  "/resend-verification",
  emailVerificationLimiter,
  validateEmail,
  resendVerificationEmail
);

//password reset part
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validateEmail,
  forgotPassword
);

router.get("/reset-password/:resetToken", async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await UmUserModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send(`
        <html>
          <head><title>Invalid Link</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h2>Invalid or Expired Reset Link</h2>
            <p>This password reset link is invalid or has expired.</p>
            <p>Please request a new password reset.</p>
          </body>
        </html>
      `);
    }

    res.send(`
      <html>
        <head>
          <title>Reset Password - Bus Tracker</title>
          <style>
            body { font-family: Arial; background: #f5f5f5; padding: 50px; }
            .container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
            input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; }
            button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background: #0056b3; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Reset Your Password</h2>
            <p>Enter your new password below:</p>
            <form action="/api/v1/users/reset-password/${req.params.resetToken}" method="POST">
              <input type="password" name="password" placeholder="New Password" required minlength="8">
              <input type="password" name="confirmPassword" placeholder="Confirm Password" required minlength="8">
              <button type="submit">Reset Password</button>
            </form>
          </div>
          <script>
            document.querySelector('form').addEventListener('submit', function(e) {
              const password = document.querySelector('input[name="password"]').value;
              const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;

              if (password !== confirmPassword) {
                e.preventDefault();
                alert('Passwords do not match!');
              }
            });
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

router.put(
  "/reset-password/:resetToken",
  passwordResetLimiter,
  validatePasswordReset,
  resetPassword
);

router.get("/userchecking", (req, res) => {
  res.status(200).json({
    success: true,
    message: "User services is running",
    timestamp: new Date().toISOString(),
  });
});

router.use(protect);

router.get("/profile", getUserProfile);
router.put(
  "/profile",
  profileUpdateLimiter,
  upload.single("ProfilePicture"),
  validateProfileUpdate,
  updateUserProfile
);

router.delete("/profile", deleteUserAccount);

router.post(
  "/profile/upload-picture",
  profileUpdateLimiter,
  upload.single("profilePicture"),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const profilePictureUrl = `/${req.file.path.replace(/\\/g, "/")}`;

      const user = await UmUserModel.findByIdAndUpdate(
        req.user.id,
        {
          profilePicture: profilePictureUrl,
          updatedAt: Date.now(),
        },
        { new: true }
      ).select("-password -refreshToken -resetPasswordToken");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: {
          profilePicture: user.profilePicture,
          user: user,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to upload profile picture",
        error: error.message,
      });
    }
  }
);

router.delete("/profile/picture", async (req, res) => {
  try {
    const user = await UmUserModel.findByIdAndUpdate(
      req.user.id,
      {
        profilePicture: null,
        updatedAt: Date.now(),
      },
      { new: true }
    ).select("-password -refreshToken -resetPasswordToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile picture deleted successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Delete profile picture error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete profile picture",
      error: error.message,
    });
  }
});

router.post("/logout", logoutUser);
router.post("/logout-all", logoutUser);

router.put(
  "/update-password",
  profileUpdateLimiter,
  validatePasswordUpdate,
  updatePassword
);

router.get("/status", getUserStatus);
router.get("/activity", getUserActivity);

router.put("/preferences", profileUpdateLimiter, updateUserProfile);

router.get("/", authorize("admin"), getAllUsers);
router.get("/export", authorize("admin"), exportUsers);
router.get("/dashboard", authorize("admin"), getAdminDashboard);
router.get("/search", authorize("admin"), searchUsers);
router.get("/analytics", authorize("admin"), getUserAnalytics);
router.get("/dashboard/analytics", authorize("admin"), getDashboardAnalytics);

router.put(
  "/bulk/update",
  authorize("admin"),
  validateBulkUpdate,
  bulkUpdateUsers
);
router.post("/bulk/email", authorize("admin"), sendBulkEmail);
router.post("/bulk/activate", authorize("admin"), bulkUpdateUsers);
router.post("/bulk/deactivate", authorize("admin"), bulkUpdateUsers);
router.delete("/bulk/delete", authorize("admin"), bulkUpdateUsers);

router.get("/:id", authorize("admin", "support"), getSingleUser);
router.put(
  "/:id",
  authorize("admin", "support"),
  validateAdminUpdate,
  updateUserByAdmin
);
router.put("/:id/activate", authorize("admin"), activateUser);
router.put("/:id/deactivate", authorize("admin"), deactivateUser);
router.put("/:id/unlock", authorize("admin"), unlockUserAccount);
router.get("/:id/activity", authorize("admin", "support"), getUserActivity);
router.get(
  "/:id/login-attempts",
  authorize("admin", "support"),
  getLoginAttempts
);

router.delete("/:id", authorize("admin"), deleteUserByAdmin);
router.put("/:id/role", authorize("admin"), validateRoleChange, changeUserRole);

router.get("/profile/:id", authorizeOwnerOrAdmin, getSingleUser);

router.use((error, req, res, next) => {
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: Object.values(error.errors).map((e) => e.message),
    });
  }

  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value entered",
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server error",
  });
});

router.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `User route ${req.originalUrl} not found`,
  });
});

module.exports = router;
