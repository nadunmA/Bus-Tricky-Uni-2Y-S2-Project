const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const UmUserModel = require("../models/UmUserModel.js");
const sendEmail = require("../utils/sendEmail");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const mongoose = require("mongoose");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false });

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
        country: user.country,
        address: user.address,
      },
    });
};

//api/v1/users/register

const registerUser = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    dateOfBirth,
    gender,
    role,
    licenseNumber,
    licenseExpiry,
    vehicleNumber,
    yearsOfExperience,
    emergencyContact,
    country,
    city,
    state,
    zipCode,
    address,
  } = req.body;

  const existingUser = await UmUserModel.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse("User with this email already exists", 400));
  }

  if (role === "driver") {
    if (!licenseNumber || !licenseExpiry) {
      return next(
        new ErrorResponse(
          "License number and expiry date are required for driver registration",
          400
        )
      );
    }

    if (new Date(licenseExpiry) <= new Date()) {
      return next(
        new ErrorResponse("License expiry date must be in the future", 400)
      );
    }
  }

  const userData = {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    dateOfBirth,
    gender,
    role: role || "passenger",
    isVerified: false,
    country: country || "Sri Lanka",
  };

  if (address && typeof address === "object") {
    userData.address = {
      city: address.city || city || "",
      state: address.state || state || "",
      zipCode: address.zipCode || zipCode || "",
      country: address.country || country || "Sri Lanka",
    };
  } else {
    const addressCity = city && city.trim() ? city.trim() : "";
    const addressState = state && state.trim() ? state.trim() : "";
    const addressZipCode = zipCode && zipCode.trim() ? zipCode.trim() : "";
    const addressCountry =
      country && country.trim() ? country.trim() : "Sri Lanka";

    if (addressCity || addressState || addressZipCode) {
      userData.address = {
        city: addressCity,
        state: addressState,
        zipCode: addressZipCode,
        country: addressCountry,
      };
    }
  }

  if (role === "driver") {
    userData.licenseNumber = req.body.licenseNumber;
    userData.licenseExpiry = req.body.licenseExpiry;
    userData.vehicleNumber = req.body.vehicleNumber;
    userData.yearsOfExperience = req.body.yearsOfExperience;
    userData.emergencyContact = req.body.emergencyContact;
  }

  try {
    const user = await UmUserModel.create(userData);

    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {
      const verifyURL = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${verificationToken}`;

      await sendEmail({
        email: user.email,
        subject: "Verify Your Email - Online Bus Tracking System",
        message: `Please click the following link to verify your email: ${verifyURL}`,
      });

      res.status(201).json({
        success: true,
        message:
          "User registered successfully. Please check your email to verify your account.",
        data: {
          id: user._id,
          email: user.email,
          role: user.role,
          country: user.country,
          address: user.address,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return next(
        new ErrorResponse(`Validation Error: ${messages.join(", ")}`, 400)
      );
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return next(new ErrorResponse(`${field} already exists`, 400));
    }

    if (error.code) {
      console.error("MongoDB Error Code:", error.code);
      return next(new ErrorResponse("Database error occurred", 500));
    }

    next(error);
  }
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await UmUserModel.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  if (!user.isActive) {
    return next(
      new ErrorResponse("Account is deactivated. Please contact support.", 401)
    );
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

const logoutUser = asyncHandler(async (req, res, next) => {
  await UmUserModel.findByIdAndUpdate(req.user.id, { refreshToken: undefined });

  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

const verifyEmail = asyncHandler(async (req, res, next) => {
  const emailVerificationToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await UmUserModel.findOne({
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorResponse("Invalid or expired verification token", 400)
    );
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  user.emailVerificationAttempts = 0;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

const resendVerificationEmail = asyncHandler(async (req, res, next) => {
  const user = await UmUserModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("No user found with that email", 404));
  }

  if (user.isVerified) {
    return next(new ErrorResponse("Account is already verified", 400));
  }

  const canRequest = user.canRequestVerificationEmail();

  if (!canRequest.canRequest) {
    return next(new ErrorResponse(canRequest.reason, 400));
  }

  const verificationToken = user.generateEmailVerificationToken();
  user.incrementVerificationAttempts();
  await user.save({ validateBeforeSave: false });

  try {
    const verifyURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/verify-email/${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: "Verify Your Email - Online Bus Tracking System",
      message: `Please click the following link to verify your email: ${verifyURL}`,
    });

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse("Please provide an email address", 400));
  }

  const user = await UmUserModel.findOne({ email });

  if (!user) {
    return next(
      new ErrorResponse("No user found with that email address", 404)
    );
  }

  if (!user.isActive) {
    return next(
      new ErrorResponse("Account is deactivated. Please contact support.", 401)
    );
  }

  const resetToken = user.generatePasswordResetToken();

  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/reset-password/${resetToken}`;

    const message = `
Hello,

We received a request to reset your password for your Online Bus Tracking System account.

To reset your password, please click the link below:
${resetURL}

If you did not make this request, you can safely ignore this email.
Your password will stay the same.

⚠️ Please note: This link will only work for the next 10 minutes.
`;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request - Online Bus Tracking System",
      message,
    });

    res.status(200).json({
      success: true,
      message:
        "Password reset email sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("Email sending error:", error);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new ErrorResponse("Email could not be sent. Please try again later.", 500)
    );
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await UmUserModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid or expired reset token", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

const getUserProfile = asyncHandler(async (req, res, next) => {
  const user = await UmUserModel.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

const updateUserProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phoneNumber: req.body.phoneNumber,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    country: req.body.country,
    updatedAt: Date.now(),
  };

  if (req.body.address) {
    fieldsToUpdate.address = req.body.address;
  }

  if (req.body.licenseNumber !== undefined) {
    fieldsToUpdate.licenseNumber = req.body.licenseNumber;
  }
  if (req.body.licenseExpiry !== undefined) {
    fieldsToUpdate.licenseExpiry = req.body.licenseExpiry;
  }
  if (req.body.vehicleNumber !== undefined) {
    fieldsToUpdate.vehicleNumber = req.body.vehicleNumber;
  }
  if (req.body.yearsOfExperience !== undefined) {
    fieldsToUpdate.yearsOfExperience = req.body.yearsOfExperience;
  }
  if (req.body.emergencyContact !== undefined) {
    fieldsToUpdate.emergencyContact = req.body.emergencyContact;
  }
  if (req.body.currentRoute !== undefined) {
    fieldsToUpdate.currentRoute = req.body.currentRoute;
  }
  if (req.body.employmentStatus !== undefined) {
    const validEmploymentStatuses = [
      "full-time",
      "part-time",
      "contract",
      "temporary",
    ];
    if (
      req.body.employmentStatus === "" ||
      req.body.employmentStatus === null
    ) {
      fieldsToUpdate.employmentStatus = undefined;
    } else if (validEmploymentStatuses.includes(req.body.employmentStatus)) {
      fieldsToUpdate.employmentStatus = req.body.employmentStatus;
    } else {
      return next(
        new ErrorResponse(
          `Invalid employment status. Must be one of: ${validEmploymentStatuses.join(
            ", "
          )}`,
          400
        )
      );
    }
  }

  if (req.body.shiftPreference !== undefined) {
    const validShiftPreferences = ["morning", "afternoon", "night", "flexible"];
    if (req.body.shiftPreference === "" || req.body.shiftPreference === null) {
      fieldsToUpdate.shiftPreference = undefined;
    } else if (validShiftPreferences.includes(req.body.shiftPreference)) {
      fieldsToUpdate.shiftPreference = req.body.shiftPreference;
    } else {
      return next(
        new ErrorResponse(
          `Invalid shift preference. Must be one of: ${validShiftPreferences.join(
            ", "
          )}`,
          400
        )
      );
    }
  }

  if (req.body.salary !== undefined) {
    fieldsToUpdate.salary = req.body.salary;
  }
  if (req.body.specialQualifications !== undefined) {
    fieldsToUpdate.specialQualifications = req.body.specialQualifications;
  }

  if (req.body.medicalCertificateExpiry !== undefined) {
    fieldsToUpdate.medicalCertificateExpiry = req.body.medicalCertificateExpiry;
  }
  if (req.body.bloodType !== undefined) {
    const validBloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (req.body.bloodType === "" || req.body.bloodType === null) {
      fieldsToUpdate.bloodType = undefined;
    } else if (validBloodTypes.includes(req.body.bloodType)) {
      fieldsToUpdate.bloodType = req.body.bloodType;
    } else {
      return next(
        new ErrorResponse(
          `Invalid blood type. Must be one of: ${validBloodTypes.join(", ")}`,
          400
        )
      );
    }
  }
  if (req.body.medicalConditions !== undefined) {
    fieldsToUpdate.medicalConditions = req.body.medicalConditions;
  }

  if (req.body.weeklySchedule !== undefined) {
    fieldsToUpdate.weeklySchedule = req.body.weeklySchedule;
  }
  if (req.body.preferredRoutes !== undefined) {
    fieldsToUpdate.preferredRoutes = req.body.preferredRoutes;
  }
  if (req.body.availableForOvertime !== undefined) {
    fieldsToUpdate.availableForOvertime = req.body.availableForOvertime;
  }
  if (req.body.maximumWorkingHours !== undefined) {
    fieldsToUpdate.maximumWorkingHours = req.body.maximumWorkingHours;
  }

  if (req.body.preferences) {
    fieldsToUpdate.preferences = req.body.preferences;
  }

  if (req.file) {
    fieldsToUpdate.profilePicture = req.file.path;
  }

  try {
    const user = await UmUserModel.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => {
        if (err.kind === "enum") {
          return `${err.path}: "${
            err.value
          }" is not a valid option. Valid options are: ${err.properties.enumValues.join(
            ", "
          )}`;
        }
        return err.message;
      });
      return next(
        new ErrorResponse(`Validation Error: ${messages.join(", ")}`, 400)
      );
    }

    return next(new ErrorResponse("Failed to update profile", 500));
  }
});

const updatePassword = asyncHandler(async (req, res, next) => {
  if (!req.body.currentPassword || !req.body.newPassword) {
    return next(
      new ErrorResponse("Please provide current and new password", 400)
    );
  }

  const user = await UmUserModel.findById(req.user.id).select("+password");

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  const isCurrentPasswordCorrect = await user.comparePassword(
    req.body.currentPassword
  );

  if (!isCurrentPasswordCorrect) {
    return next(new ErrorResponse("Incorrect current password", 401));
  }

  if (req.body.newPassword.length < 8) {
    return next(
      new ErrorResponse("New password must be at least 8 characters long", 400)
    );
  }

  try {
    user.password = req.body.newPassword;
    user.updatedAt = Date.now();

    await user.save();
    const verification = await user.comparePassword(req.body.newPassword);

    if (!verification) {
      return next(
        new ErrorResponse("Password update failed. Please try again.", 500)
      );
    }

    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Password update error:", error);
    return next(new ErrorResponse("Failed to update password", 500));
  }
});

const deleteUserAccount = asyncHandler(async (req, res, next) => {
  try {
    const { password, reason } = req.body;

    const userId = req.user.id || req.user._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return next(new ErrorResponse("Invalid user ID format", 400));
    }

    if (!password) {
      return next(
        new ErrorResponse("Password is required for account deletion", 400)
      );
    }

    const user = await UmUserModel.findById(userId).select("+password");
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid password", 401));
    }

    const deletedUserInfo = {
      id: user._id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      deletedAt: new Date().toISOString(),
    };

    const deletionResult = await UmUserModel.findByIdAndDelete(userId);

    if (!deletionResult) {
      return next(new ErrorResponse("Failed to delete user account", 500));
    }

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      data: {
        deletedUser: deletedUserInfo,
      },
    });
  } catch (error) {
    console.error("Account deletion error:", error);

    if (error.name === "CastError") {
      return next(new ErrorResponse("Invalid user ID format", 400));
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return next(
        new ErrorResponse(`Validation Error: ${messages.join(", ")}`, 400)
      );
    }

    return next(new ErrorResponse("Failed to delete account", 500));
  }
});

const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new ErrorResponse("Refresh token required", 401));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await UmUserModel.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return next(new ErrorResponse("Invalid refresh token", 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    return next(new ErrorResponse("Invalid refresh token", 401));
  }
});

const getAllUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  let query = {};

  if (req.query.role) {
    query.role = req.query.role;
  }

  if (req.query.isActive !== undefined) {
    query.isActive = req.query.isActive === "true";
  }

  if (req.query.isVerified !== undefined) {
    query.isVerified = req.query.isVerified === "true";
  }

  const total = await UmUserModel.countDocuments(query);
  const users = await UmUserModel.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(startIndex);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    data: users,
  });
});

const getSingleUser = asyncHandler(async (req, res, next) => {
  const user = await UmUserModel.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

const updateUserByAdmin = asyncHandler(async (req, res, next) => {
  try {
    const existingUser = await UmUserModel.findById(req.params.id);

    if (!existingUser) {
      return next(new ErrorResponse("User not found", 404));
    }

    if (req.body.address !== undefined) {
      if (
        typeof existingUser.address === "string" ||
        existingUser.address === ""
      ) {
        await UmUserModel.findByIdAndUpdate(req.params.id, {
          $unset: { address: "" },
        });

        if (typeof req.body.address === "string" && req.body.address.trim()) {
          await UmUserModel.findByIdAndUpdate(req.params.id, {
            $set: {
              address: {
                city: req.body.address.trim(),
                state: "",
                zipCode: "",
                country: "Sri Lanka",
              },
            },
          });
        } else if (req.body.address === "" || !req.body.address) {
          console.log("Address is empty, leaving unset");
        }
      }
    }

    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.address;
    updateData.updatedAt = Date.now();

    const newRole = updateData.role || existingUser.role;
    const currentRole = existingUser.role;

    if (newRole === "driver") {
      const licenseNumber =
        updateData.licenseNumber || existingUser.licenseNumber;
      const licenseExpiry =
        updateData.licenseExpiry || existingUser.licenseExpiry;

      if (!licenseNumber || !licenseExpiry) {
        return next(
          new ErrorResponse(
            "License number and expiry date are required for drivers",
            400
          )
        );
      }

      if (new Date(licenseExpiry) <= new Date()) {
        return next(
          new ErrorResponse("License expiry date must be in the future", 400)
        );
      }

      updateData.licenseNumber = licenseNumber;
      updateData.licenseExpiry = licenseExpiry;
    } else if (currentRole === "driver" && newRole !== "driver") {
      updateData.licenseNumber = undefined;
      updateData.licenseExpiry = undefined;
      updateData.busAssigned = updateData.busAssigned || undefined;
      updateData.emergencyContact = updateData.emergencyContact || undefined;
    }

    const updatedUser = await UmUserModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return next(new ErrorResponse("User not found after update", 404));
    }

    console.log("User updated successfully");

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update Error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return next(
        new ErrorResponse(`Validation Error: ${messages.join(", ")}`, 400)
      );
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return next(new ErrorResponse(`${field} already exists`, 400));
    }

    if (error.code === 28) {
      return next(
        new ErrorResponse("Database field conflict. Please try again.", 500)
      );
    }

    next(error);
  }
});

const deleteUserByAdmin = asyncHandler(async (req, res, next) => {
  try {
    const user = await UmUserModel.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: {
        deletedUser: {
          id: user._id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        },
      },
    });
  } catch (error) {
    console.error("Delete user error:", error);

    if (error.name === "CastError") {
      return next(new ErrorResponse("Invalid user ID format", 400));
    }

    return next(new ErrorResponse("Failed to delete user", 500));
  }
});

const getUserStatus = asyncHandler(async (req, res, next) => {
  const user = await UmUserModel.findById(req.user.id);

  const stats = {
    profile: {
      completeness: calculateProfileCompleteness(user),
      verificationStatus: user.isVerified,
      accountStatus: user.isActive,
    },
    activity: {
      lastLogin: user.lastLogin,
      totalBookings: user.totalBookings,
      totalSpent: user.totalSpent,
    },
    preferences: user.preferences,
  };

  res.status(200).json({
    success: true,
    data: stats,
  });
});

const getAdminDashboard = asyncHandler(async (req, res, next) => {
  try {
    const totalUsers = await UmUserModel.countDocuments();
    const activeUsers = await UmUserModel.countDocuments({ isActive: true });
    const verifiedUsers = await UmUserModel.countDocuments({
      isVerified: true,
    });
    const newUsersToday = await UmUserModel.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const roleDistribution = await UmUserModel.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        newUsersToday,
        roleDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
});

const activateUser = asyncHandler(async (req, res, next) => {
  const user = await UmUserModel.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  );

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User activated successfully",
    data: user,
  });
});

const deactivateUser = asyncHandler(async (req, res, next) => {
  const user = await UmUserModel.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User deactivated successfully",
    data: user,
  });
});

const bulkUpdateUsers = asyncHandler(async (req, res, next) => {
  const { userIds, updateData } = req.body;

  const result = await UmUserModel.updateMany(
    { _id: { $in: userIds } },
    updateData
  );
  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} users updated successfully`,
  });
});

const exportUsers = asyncHandler(async (req, res, next) => {
  const users = await UmUserModel.find().select("-password -refreshToken");

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

const searchUsers = asyncHandler(async (req, res, next) => {
  const { q, role, status } = req.query;

  let query = {};

  if (q) {
    query.$or = [
      { firstName: { $regex: q, $options: "i" } },
      { lastName: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ];
  }

  if (role) {
    query.role = role;
  }

  if (status) {
    query.isActive = status === "active";
  }

  const users = await UmUserModel.find(query).limit(50);

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

const getUserActivity = asyncHandler(async (req, res, next) => {
  const user = await UmUserModel.findById(req.params.id || req.user.id);

  res.status(200).json({
    success: true,
    data: {
      lastLogin: user.lastLogin,
      totalBookings: user.totalBookings,
      totalSpent: user.totalSpent,
      createdAt: user.createdAt,
    },
  });
});

const changeUserRole = asyncHandler(async (req, res, next) => {
  const user = await UmUserModel.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true }
  );

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    data: user,
  });
});

const sendBulkEmail = asyncHandler(async (req, res, next) => {
  const { userIds, subject, message } = req.body;

  const users = await UmUserModel.find({ _id: { $in: userIds } });

  const emailPromises = users.map((user) =>
    sendEmail({
      email: user.email,
      subject,
      message,
    })
  );

  await Promise.all(emailPromises);

  res.status(200).json({
    success: true,
    message: `Email sent to ${users.length} users successfully`,
  });
});

const getLoginAttempts = asyncHandler(async (req, res, next) => {
  const user = await UmUserModel.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      loginAttempts: user.loginAttempts,
      lockUntil: user.lockUntil,
      lastLogin: user.lastLogin,
    },
  });
});

const unlockUserAccount = asyncHandler(async (req, res, next) => {
  const user = await UmUserModel.findByIdAndUpdate(
    req.params.id,
    {
      loginAttempts: 0,
      lockUntil: undefined,
    },
    { new: true }
  );

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User account unlocked successfully",
    data: user,
  });
});

const getUserAnalytics = asyncHandler(async (req, res, next) => {
  try {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      newUsers,
      verifiedUsers,
      usersByRole,
      usersByCity,
      recentUsers,
    ] = await Promise.all([
      UmUserModel.countDocuments(),

      UmUserModel.countDocuments({
        lastLogin: { $gte: last7Days },
      }),

      UmUserModel.countDocuments({
        createdAt: { $gte: last7Days },
      }),

      UmUserModel.countDocuments({
        isVerified: true,
      }),

      UmUserModel.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),

      UmUserModel.aggregate([
        { $match: { "address.city": { $exists: true, $ne: "" } } },
        { $group: { _id: "$address.city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),

      UmUserModel.find({ lastLogin: { $exists: true } })
        .select("email firstName lastName lastLogin address.city")
        .sort({ lastLogin: -1 })
        .limit(5),
    ]);

    const inactiveUsers = totalUsers - activeUsers;
    const pendingVerification = totalUsers - verifiedUsers;

    const userGrowthData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const dailyUsers = await UmUserModel.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      userGrowthData.push({
        date: startOfDay.toLocaleDateString("en-US", { weekday: "short" }),
        users: dailyUsers,
        active: dailyUsers,
      });
    }

    const roleColors = {
      passenger: "#3B82F6",
      driver: "#1D4ED8",
      admin: "#60A5FA",
      support: "#93C5FD",
    };

    const userTypeData = usersByRole.map((item) => ({
      name: item._id.charAt(0).toUpperCase() + item._id.slice(1) + " Users",
      value: item.count,
      color: roleColors[item._id] || "#6B7280",
    }));

    const totalWithCity = usersByCity.reduce(
      (sum, city) => sum + city.count,
      0
    );
    const locationData = usersByCity.map((item) => ({
      city: item._id,
      users: item.count,
      percentage: ((item.count / totalWithCity) * 100).toFixed(1),
    }));

    const recentActivity = recentUsers.map((user) => ({
      user: user.email,
      name: `${user.firstName} ${user.lastName}`,
      action: "Bus Tracking",
      location: user.address?.city || "Unknown",
      device: "Mobile",
      time: getTimeAgo(user.lastLogin),
    }));

    res.status(200).json({
      success: true,
      data: {
        userStats: {
          totalUsers,
          activeUsers,
          newUsers,
          inactiveUsers,
          verifiedUsers,
          pendingVerification,
        },
        userGrowthData,
        userTypeData,
        locationData,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return next(new ErrorResponse("Failed to fetch analytics data", 500));
  }
});

const getDashboardAnalytics = asyncHandler(async (req, res, next) => {
  try {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      verifiedUsers,
      usersByRole,
      userGrowthData,
      recentActivity,
    ] = await Promise.all([
      UmUserModel.countDocuments(),

      UmUserModel.countDocuments({
        lastLogin: { $gte: last7Days },
      }),

      UmUserModel.countDocuments({
        createdAt: { $gte: today },
      }),

      UmUserModel.countDocuments({
        isVerified: true,
      }),

      UmUserModel.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),

      UmUserModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$createdAt" },
            },
            users: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $gte: ["$lastLogin", last30Days] }, 1, 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      UmUserModel.find({
        $or: [
          { createdAt: { $gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) } },
          { lastLogin: { $gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) } },
        ],
      })
        .select("email firstName lastName createdAt lastLogin")
        .sort({ createdAt: -1, lastLogin: -1 })
        .limit(10),
    ]);

    const busStats = {
      totalBuses: 45,
      activeBuses: 38,
      totalRoutes: 12,
      alertsCount: 3,
    };

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const formattedUserGrowth = userGrowthData.map((item) => {
      const [year, month] = item._id.split("-");
      const monthName = monthNames[parseInt(month) - 1];
      return {
        month: monthName,
        users: item.users,
        active: item.active,
      };
    });

    const formattedActivity = recentActivity.map((user, index) => {
      const isNewUser =
        user.createdAt > new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const timeAgo = getTimeAgo(isNewUser ? user.createdAt : user.lastLogin);

      return {
        id: index + 1,
        type: isNewUser ? "user_registration" : "user_login",
        message: isNewUser
          ? `New user registered: ${user.email}`
          : `User logged in: ${user.firstName} ${user.lastName}`,
        time: timeAgo,
        status: isNewUser ? "info" : "success",
      };
    });

    const systemActivities = [
      {
        id: formattedActivity.length + 1,
        type: "system_update",
        message: "System backup completed successfully",
        time: "30 mins ago",
        status: "success",
      },
      {
        id: formattedActivity.length + 2,
        type: "maintenance",
        message: "Database optimization completed",
        time: "1 hour ago",
        status: "info",
      },
    ];

    const allActivity = [...formattedActivity, ...systemActivities].slice(
      0,
      10
    );

    const busPerformance = [
      { time: "6:00", active: 12, delayed: 2, onTime: 10 },
      { time: "8:00", active: 35, delayed: 5, onTime: 30 },
      { time: "10:00", active: 42, delayed: 3, onTime: 39 },
      { time: "12:00", active: 38, delayed: 4, onTime: 34 },
      { time: "14:00", active: 40, delayed: 2, onTime: 38 },
      { time: "16:00", active: 45, delayed: 6, onTime: 39 },
      { time: "18:00", active: 43, delayed: 4, onTime: 39 },
      { time: "20:00", active: 28, delayed: 1, onTime: 27 },
    ];

    const routeUsage = [
      { name: "Route 1", value: 450, color: "#2563eb" },
      { name: "Route 2", value: 320, color: "#2563eb" },
      { name: "Route 3", value: 280, color: "#2563eb" },
      { name: "Route 4", value: 200, color: "#2563eb" },
    ];

    res.status(200).json({
      success: true,
      data: {
        stats: {
          ...busStats,
          totalUsers,
          activeUsers,
          newUsersToday,
          verifiedUsers,
        },
        recentActivity: allActivity,
        busPerformance,
        userGrowth: formattedUserGrowth,
        routeUsage,
        usersByRole: usersByRole.map((role) => ({
          role: role._id,
          count: role.count,
        })),
      },
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return next(
      new ErrorResponse("Failed to fetch dashboard analytics data", 500)
    );
  }
});

const calculateProfileCompleteness = (user) => {
  let completeness = 0;
  const fields = [
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "dateOfBirth",
    "gender",
    "profilePicture",
  ];

  fields.forEach((field) => {
    if (user[field]) completeness += 100 / fields.length;
  });

  return Math.round(completeness);
};

const getTimeAgo = (date) => {
  if (!date) return "Never";
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
};

const registerDriver = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    dateOfBirth,
    gender,
    role,
    licenseNumber,
    licenseExpiry,
    vehicleNumber,
    yearsOfExperience,
    emergencyContact,
    country,
    city,
    state,
    zipCode,
    address,
  } = req.body;

  try {
    if (role !== "driver") {
      return next(
        new ErrorResponse("This endpoint is for driver registration only", 400)
      );
    }

    const existingUser = await UmUserModel.findOne({ email });
    if (existingUser) {
      return next(
        new ErrorResponse("Driver with this email already exists", 400)
      );
    }

    const driverValidation = validateDriverData({
      licenseNumber,
      licenseExpiry,
      vehicleNumber,
      yearsOfExperience,
      emergencyContact,
    });

    if (!driverValidation.isValid) {
      return next(new ErrorResponse(driverValidation.errors.join(", "), 400));
    }

    const driverData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      phoneNumber: phoneNumber.trim(),
      role: "driver",
      isVerified: false,
      country: country || "Sri Lanka",

      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      ...(gender && { gender }),

      address: constructAddress({ address, city, state, zipCode, country }),

      licenseNumber: licenseNumber.trim().toUpperCase(),
      licenseExpiry: new Date(licenseExpiry),
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      yearsOfExperience,
      emergencyContact: emergencyContact.trim(),

      driverStatus: "pending_verification",
      profileCompleteness: calculateDriverProfileCompleteness({
        firstName,
        lastName,
        email,
        phoneNumber,
        licenseNumber,
        licenseExpiry,
        vehicleNumber,
        yearsOfExperience,
        emergencyContact,
        city,
        dateOfBirth,
        gender,
      }),

      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true,
          shiftReminders: true,
          routeUpdates: true,
          maintenanceAlerts: true,
        },
        language: "en",
        currency: "LKR",
        workingHours: {
          preferredStartTime: "06:00",
          preferredEndTime: "18:00",
          availableWeekends: false,
        },
      },
    };

    const driver = await UmUserModel.create(driverData);

    const verificationToken = driver.generateEmailVerificationToken();
    await driver.save({ validateBeforeSave: false });

    try {
      const welcomeMessage = generateDriverWelcomeEmail(
        driver,
        verificationToken,
        req
      );

      await sendEmail({
        email: driver.email,
        subject: "Welcome to Bus Tracking System - Driver Account Created",
        message: welcomeMessage,
      });
    } catch (emailError) {
      console.error("Welcome email failed:", emailError);
    }

    const responseData = {
      success: true,
      message:
        "Driver registration successful. Please check your email for verification.",
      data: {
        driver: {
          id: driver._id,
          firstName: driver.firstName,
          lastName: driver.lastName,
          email: driver.email,
          role: driver.role,
          licenseNumber: driver.licenseNumber,
          vehicleNumber: driver.vehicleNumber,
          driverStatus: driver.driverStatus,
          profileCompleteness: driver.profileCompleteness,
          isVerified: driver.isVerified,
          createdAt: driver.createdAt,
          address: driver.address,
        },
        nextSteps: [
          "Check your email and verify your account",
          "Wait for admin approval of your driver license",
          "Complete your profile with additional details",
          "Attend driver orientation (if required)",
        ],
      },
    };

    res.status(201).json(responseData);
  } catch (error) {
    console.error("Driver registration error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return next(
        new ErrorResponse(`Validation Error: ${messages.join(", ")}`, 400)
      );
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      let message = `${field} already exists`;

      if (field === "licenseNumber") {
        message = "A driver with this license number is already registered";
      } else if (field === "vehicleNumber") {
        message = "This vehicle number is already assigned to another driver";
      }

      return next(new ErrorResponse(message, 400));
    }

    next(new ErrorResponse("Driver registration failed", 500));
  }
});

const validateDriverData = (driverFields) => {
  const errors = [];
  const {
    licenseNumber,
    licenseExpiry,
    vehicleNumber,
    yearsOfExperience,
    emergencyContact,
  } = driverFields;

  if (
    !licenseNumber ||
    typeof licenseNumber !== "string" ||
    licenseNumber.trim().length < 5
  ) {
    errors.push("License number must be at least 5 characters long");
  }

  if (!licenseExpiry) {
    errors.push("License expiry date is required");
  } else {
    const expiryDate = new Date(licenseExpiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(expiryDate.getTime())) {
      errors.push("Invalid license expiry date format");
    } else if (expiryDate <= today) {
      errors.push("License expiry date must be in the future");
    } else if (
      expiryDate > new Date(today.getTime() + 20 * 365 * 24 * 60 * 60 * 1000)
    ) {
      errors.push("License expiry date seems too far in the future");
    }
  }

  if (
    !vehicleNumber ||
    typeof vehicleNumber !== "string" ||
    vehicleNumber.trim().length < 3
  ) {
    errors.push("Vehicle number must be at least 3 characters long");
  }

  const validExperienceOptions = ["0-1", "1-3", "3-5", "5-10", "10+"];
  if (
    !yearsOfExperience ||
    !validExperienceOptions.includes(yearsOfExperience)
  ) {
    errors.push("Please select a valid years of experience option");
  }

  if (!emergencyContact || typeof emergencyContact !== "string") {
    errors.push("Emergency contact is required");
  } else if (!/^[0-9]{10}$/.test(emergencyContact.replace(/\s+/g, ""))) {
    errors.push("Emergency contact must be a valid 10-digit phone number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const constructAddress = ({ address, city, state, zipCode, country }) => {
  if (address && typeof address === "object") {
    return {
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      country: address.country || country || "Sri Lanka",
    };
  }

  const addressObj = {
    city: city?.trim() || "",
    state: state?.trim() || "",
    zipCode: zipCode?.trim() || "",
    country: country?.trim() || "Sri Lanka",
  };

  const hasAddressData = Object.values(addressObj).some(
    (value) => value && value !== "Sri Lanka"
  );
  return hasAddressData ? addressObj : { country: "Sri Lanka" };
};

const calculateDriverProfileCompleteness = (data) => {
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "licenseNumber",
    "licenseExpiry",
    "vehicleNumber",
    "yearsOfExperience",
    "emergencyContact",
  ];

  const optionalFields = ["city", "dateOfBirth", "gender"];

  const completedRequired = requiredFields.filter(
    (field) => data[field] && data[field] !== ""
  ).length;

  const completedOptional = optionalFields.filter(
    (field) => data[field] && data[field] !== ""
  ).length;

  const totalFields = requiredFields.length + optionalFields.length;
  const completedFields = completedRequired + completedOptional;

  return Math.round((completedFields / totalFields) * 100);
};

const generateDriverWelcomeEmail = (driver, verificationToken, req) => {
  const verifyURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/verify-email/${verificationToken}`;

  return `
Dear ${driver.firstName} ${driver.lastName},

Welcome to the Bus Tracking System! Your driver account has been successfully created.

Account Details:
- Name: ${driver.firstName} ${driver.lastName}
- Email: ${driver.email}
- License Number: ${driver.licenseNumber}
- Vehicle Number: ${driver.vehicleNumber}
- Registration Date: ${new Date(driver.createdAt).toLocaleDateString()}

Next Steps:
1. Verify your email by clicking the link below:
   ${verifyURL}

2. Your driver license and vehicle information will be verified by our admin team.

3. Once approved, you'll receive login credentials and can access the driver portal.

4. Complete your profile with additional details for better service.

Important Notes:
- Keep your license and vehicle documents ready for verification
- You will be contacted within 2-3 business days for the verification process
- Make sure your contact information is always up to date

If you have any questions, please contact our support team.

Best regards,
Bus Tracking System Team

⚠️ This verification link expires in 24 hours.
  `;
};

const getDriverProfile = asyncHandler(async (req, res, next) => {
  try {
    const driver = await UmUserModel.findById(req.user.id);

    if (!driver) {
      return next(new ErrorResponse("Driver not found", 404));
    }

    if (driver.role !== "driver") {
      return next(
        new ErrorResponse("Access denied - not a driver account", 403)
      );
    }

    const currentCompleteness =
      UserService.checkDriverProfileCompleteness(driver);

    const enhancedDriverData = {
      ...driver.toObject(),
      profileAnalysis: currentCompleteness,
      licenseStatus: getLicenseStatus(driver.licenseExpiry),
      accountAge: getAccountAge(driver.createdAt),
      lastProfileUpdate: driver.updatedAt,
    };

    res.status(200).json({
      success: true,
      data: enhancedDriverData,
      message: "Driver profile retrieved successfully",
    });
  } catch (error) {
    console.error("Get driver profile error:", error);
    next(new ErrorResponse("Failed to retrieve driver profile", 500));
  }
});

const getLicenseStatus = (expiryDate) => {
  if (!expiryDate) return { status: "unknown", daysRemaining: null };

  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysRemaining = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  let status = "valid";
  if (daysRemaining <= 0) status = "expired";
  else if (daysRemaining <= 30) status = "expires_soon";
  else if (daysRemaining <= 90) status = "renewal_due";

  return { status, daysRemaining };
};

const getAccountAge = (createdAt) => {
  const today = new Date();
  const created = new Date(createdAt);
  const diffInDays = Math.floor((today - created) / (1000 * 60 * 60 * 24));

  if (diffInDays < 30) return `${diffInDays} days`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months`;
  return `${Math.floor(diffInDays / 365)} years`;
};

module.exports = {
  registerDriver,
  getDriverProfile,
  validateDriverData,
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
  deleteUserAccount,
};
