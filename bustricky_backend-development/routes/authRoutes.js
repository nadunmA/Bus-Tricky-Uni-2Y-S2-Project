const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UmUserModel');
const { protect, authorize, authorizeAdmin, authorizeOwnerOrAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const upload = require('../Uploads/upload');
const { handleUploadError } = require('../Uploads/upload');
const {
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  profileUpdateLimiter,
  generalLimiter,
} = require('../middleware/rateLimiter');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const router = express.Router();

// Register route
router.post(
  '/register',
  authLimiter,
  [
    body('firstName', 'First name is required').not().isEmpty(),
    body('lastName', 'Last name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be at least 8 characters').isLength({
      min: 8,
    }),
    body('phoneNumber', 'Phone number is required').optional(),
    body('role', 'User role is required')
      .optional()
      .isIn(['passenger', 'driver', 'admin', 'support'])
      .default('passenger'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
          message: 'Validation failed',
        });
      }

      const {
        firstName,
        lastName,
        email,
        password,
        role,
        phoneNumber,
        dateOfBirth,
        gender,
        address,
        country,
        city,
        state,
        zipCode,
        licenseNumber,
        licenseExpiry,
        vehicleNumber,
        yearsOfExperience,
        emergencyContact,
      } = req.body;

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          success: false,
          message: 'User already exists',
          error: 'EMAIL_EXISTS',
        });
      }

      const userData = {
        firstName,
        lastName,
        email,
        password,
        role: role || 'passenger',
        phoneNumber,
        dateOfBirth,
        gender,
        country,
      };

      if (address) {
        userData.address = address;
      } else if (city || state || zipCode || country) {
        userData.address = {
          city: city || '',
          state: state || '',
          zipCode: zipCode || '',
          country: country || 'Sri Lanka',
        };
      }

      if (role === 'driver') {
        userData.licenseNumber = licenseNumber;
        userData.licenseExpiry = licenseExpiry;
        userData.vehicleNumber = vehicleNumber;
        userData.yearsOfExperience = yearsOfExperience;
        userData.emergencyContact = emergencyContact;
      }

      user = new User(userData);

      await user.save();

      const payload = {
        id: user._id,
        role: user.role,
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Error creating token',
              error: err.message,
            });
          }

          const responseData = {
            success: true,
            message: 'Registration successful',
            token,
            user: {
              id: user._id,
              name: user.name,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
              phoneNumber: user.phoneNumber,
              isActive: user.isActive,
              isVerified: user.isVerified,
              createdAt: user.createdAt,
            },
          };

          res.status(201).json(responseData);
        }
      );
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
          success: false,
          message: `${field} already exists`,
          error: 'DUPLICATE_KEY',
        });
      }

      if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map((e) => ({
          field: e.path,
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validationErrors,
          error: 'VALIDATION_ERROR',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error during registration',
        error: err.message,
      });
    }
  }
);

// Login route
router.post(
  '/login',
  authLimiter,
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
          message: 'Validation failed',
        });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      if (!user.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Account is deactivated. Please contact admin.',
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      user.lastLogin = new Date();
      await user.save();

      const payload = {
        id: user._id,
        role: user.role,
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: 'Error creating token',
              error: err.message,
            });
          }

          res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
              _id: user._id,
              id: user._id,
              name: user.name,
              firstName: user.firstName,
              lastName: user.lastName,
              fullName: user.name,
              email: user.email,
              phone: user.phoneNumber,
              phoneNumber: user.phoneNumber,
              location: user.address?.city || 'Not specified',
              address: user.address,
              city: user.address?.city,
              role: user.role,
              userType: user.role,
              status: user.isActive ? 'Active' : 'Inactive',
              verified: user.isVerified,
              isVerified: user.isVerified,
              profilePicture: user.profilePicture,
              totalTrips: user.totalBookings || 0,
              totalSpent: user.totalSpent || 0,
              createdAt: user.createdAt,
              lastLogin: user.lastLogin,
              preferences: user.preferences,
            },
          });
        }
      );
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: err.message,
      });
    }
  }
);

// Google authentication
router.post('/google', async (req, res) => {
  try {
    const { credential, userData } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required',
      });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const firstName = payload.given_name || '';
    const lastName = payload.family_name || '';
    const profilePicture = payload.picture || '';

    let user = await User.findOne({
      $or: [{ googleId: googleId }, { email: email }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.isGoogleUser = true;
        await user.save();
      }

      user.lastLogin = new Date();
      await user.save();
    } else {
      user = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        googleId: googleId,
        isGoogleUser: true,
        profilePicture: profilePicture,
        isVerified: true,
        phoneNumber: userData?.phoneNumber || '',
        role: userData?.role || 'passenger',
        country: userData?.country || 'Sri Lanka',
        address: {
          city: userData?.city || '',
          state: userData?.state || '',
          zipCode: userData?.zipCode || '',
          country: userData?.country || 'Sri Lanka',
        },
        ...(userData?.role === 'driver' && {
          licenseNumber: userData?.licenseNumber || '',
          licenseExpiry: userData?.licenseExpiry || null,
          vehicleNumber: userData?.vehicleNumber || '',
          yearsOfExperience: userData?.yearsOfExperience || '',
          emergencyContact: userData?.emergencyContact || '',
        }),
      });

      await user.save();
    }

    const jwtPayload = {
      id: user._id,
      role: user.role,
    };

    jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error creating token',
            error: err.message,
          });
        }

        res.status(200).json({
          success: true,
          message: 'Google authentication successful',
          token,
          user: {
            _id: user._id,
            id: user._id,
            name: user.name,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            isActive: user.isActive,
            isVerified: user.isVerified,
            profilePicture: user.profilePicture,
            isGoogleUser: user.isGoogleUser,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            address: user.address,
          },
        });
      }
    );
  } catch (err) {
    if (err.message && err.message.includes('Token used too late')) {
      return res.status(400).json({
        success: false,
        message: 'Google token has expired. Please try signing in again.',
      });
    }

    if (err.message && err.message.includes('Invalid token')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google token. Please try again.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Google authentication failed',
      error: err.message,
    });
  }
});

// ===== PROTECTED ROUTES (require authentication) =====
router.use(protect);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      '-password -resetPasswordToken -emailVerificationToken'
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
});

// Update profile
router.put(
  '/profile',
  profileUpdateLimiter,
  [
    body('firstName', 'First name is required').not().isEmpty(),
    body('lastName', 'Last name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        dateOfBirth,
        gender,
      } = req.body;

      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(400).json({ msg: 'Email is already in use' });
      }

      const updateData = {
        firstName,
        lastName,
        email,
        phoneNumber,
        updatedAt: Date.now(),
      };

      if (dateOfBirth) {
        updateData.dateOfBirth = dateOfBirth;
      }

      if (gender) {
        updateData.gender = gender;
      }

      if (address) {
        updateData.address = {
          city: address.city || '',
          state: address.state || '',
          zipCode: address.zipCode || '',
          country: address.country || 'Sri Lanka',
        };

        if (address.street) {
          updateData.address.street = address.street;
        }
      }

      const user = await User.findByIdAndUpdate(req.user._id, updateData, {
        new: true,
        runValidators: true,
      }).select(
        '-password -resetPasswordToken -emailVerificationToken -refreshToken'
      );

      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      res.json({
        msg: 'Profile updated successfully',
        user,
      });
    } catch (err) {
      res.status(500).json({
        msg: 'Server error',
        error: err.message,
      });
    }
  }
);

// Profile picture routes
router.post(
  '/profile/upload-picture',
  profileUpdateLimiter,
  upload.single('profilePicture'),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      let profilePicturePath;

      if (req.file.path) {
        profilePicturePath = req.file.path.startsWith('/')
          ? req.file.path
          : `/${req.file.path}`;
      } else {
        profilePicturePath = `/uploads/profiles/${req.file.filename}`;
      }

      const user = await User.findByIdAndUpdate(
        req.user.id || req.user._id,
        {
          profilePicture: profilePicturePath,
          updatedAt: Date.now(),
        },
        { new: true }
      ).select('-password -refreshToken -resetPasswordToken');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: {
          profilePicture: user.profilePicture,
          user: user,
        },
      });
    } catch (error) {
      console.error('Profile picture upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload profile picture',
        error: error.message,
      });
    }
  }
);

router.delete('/profile/picture', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id || req.user._id,
      {
        profilePicture: null,
        updatedAt: Date.now(),
      },
      { new: true }
    ).select('-password -refreshToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile picture',
      error: error.message,
    });
  }
});

// Delete profile
router.delete('/profile', async (req, res) => {
  try {
    const { password, reason } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required for account deletion',
      });
    }

    const user = await User.findById(req.user.id || req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password',
      });
    }

    await User.findByIdAndDelete(req.user.id || req.user._id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message,
    });
  }
});

// Check account deletion eligibility
router.get('/profile/deletion-check', async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const restrictions = [];
    const canDelete = restrictions.length === 0;

    res.status(200).json({
      success: true,
      data: {
        canDelete,
        restrictions,
        accountAge: Math.floor(
          (new Date() - user.createdAt) / (1000 * 60 * 60 * 24)
        ),
        totalBookings: user.totalBookings || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check deletion eligibility',
      error: error.message,
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Change password
router.put(
  '/change-password',
  profileUpdateLimiter,
  [
    body('currentPassword', 'Current password is required').exists(),
    body('newPassword', 'New password must be at least 8 characters').isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
          message: 'Validation failed',
        });
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      user.password = newPassword;
      user.updatedAt = Date.now();
      await user.save();

      res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message,
      });
    }
  }
);

// ===== ADMIN ROUTES =====
router.get('/analytics', authorize('admin'), async (req, res) => {
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
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: last7Days } }),
      User.countDocuments({ createdAt: { $gte: last7Days } }),
      User.countDocuments({ isVerified: true }),
      User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
      User.aggregate([
        { $match: { "address.city": { $exists: true, $ne: "" } } },
        { $group: { _id: "$address.city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
      User.find({ lastLogin: { $exists: true } })
        .select("email firstName lastName lastLogin address.city")
        .sort({ lastLogin: -1 })
        .limit(10),
    ]);

    const inactiveUsers = totalUsers - activeUsers;
    const pendingVerification = totalUsers - verifiedUsers;

    // User growth data (last 7 days)
    const userGrowthData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const dailyUsers = await User.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      const dailyActive = await User.countDocuments({
        lastLogin: { $gte: startOfDay, $lte: endOfDay },
      });

      userGrowthData.push({
        date: startOfDay.toLocaleDateString("en-US", { weekday: "short" }),
        users: dailyUsers,
        active: dailyActive,
      });
    }

    // User type distribution
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

    // Location data
    const totalWithCity = usersByCity.reduce(
      (sum, city) => sum + city.count,
      0
    );
    const locationData = usersByCity.map((item) => ({
      city: item._id,
      users: item.count,
      percentage: ((item.count / totalWithCity) * 100).toFixed(1),
    }));

    // Recent activity
    const recentActivity = recentUsers.map((user) => ({
      user: user.email,
      name: `${user.firstName} ${user.lastName}`,
      action: "Bus Tracking",
      location: user.address?.city || "Unknown",
      device: "Mobile",
      time: getTimeAgo(user.lastLogin),
    }));

    // Device data (mock for now)
    const deviceData = [
      { device: "Mobile", users: Math.floor(totalUsers * 0.65), percentage: 65 },
      { device: "Desktop", users: Math.floor(totalUsers * 0.25), percentage: 25 },
      { device: "Tablet", users: Math.floor(totalUsers * 0.1), percentage: 10 },
    ];

    // Activity data (mock for now)
    const activityData = [
      { time: "00:00", logins: 12 },
      { time: "04:00", logins: 8 },
      { time: "08:00", logins: 45 },
      { time: "12:00", logins: 67 },
      { time: "16:00", logins: 89 },
      { time: "20:00", logins: 56 },
    ];

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
        deviceData,
        activityData,
      },
    });
  } catch (error) {
    console.error("User analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user analytics",
      error: error.message,
    });
  }
});

// Dashboard analytics endpoint
router.get('/dashboard/analytics', authorize('admin'), async (req, res) => {
  try {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch real user data
    const [totalUsers, activeUsers, newUsersToday] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLogin: { $gte: last7Days } }),
      User.countDocuments({
        createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
      }),
    ]);

    // Mock bus stats (replace with real data when you have a Bus model)
    const busStats = {
      totalBuses: 45,
      activeBuses: 38,
      totalRoutes: 12,
      alertsCount: 3,
    };

    // Generate bus performance data for last 24 hours
    const busPerformance = [];
    for (let i = 0; i < 7; i++) {
      const hour = i * 4;
      busPerformance.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        active: Math.floor(Math.random() * 20) + 20,
        delayed: Math.floor(Math.random() * 5) + 1,
        onTime: Math.floor(Math.random() * 30) + 20,
      });
    }

    // Generate user growth data for last 6 months
    const userGrowth = [];
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0);

      const monthUsers = await User.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd },
      });

      const monthActive = await User.countDocuments({
        lastLogin: { $gte: monthStart, $lte: monthEnd },
      });

      userGrowth.push({
        month: months[i],
        users: monthUsers,
        active: monthActive,
      });
    }

    // Fetch recent activity from actual users
    const recentUsers = await User.find({ lastLogin: { $exists: true } })
      .select('email firstName lastName lastLogin')
      .sort({ lastLogin: -1 })
      .limit(5);

    const recentActivity = recentUsers.map((user, index) => ({
      id: index + 1,
      message: `User login: ${user.firstName} ${user.lastName}`,
      time: getTimeAgo(user.lastLogin),
      status: 'info',
    }));

    // Add some bus-related mock activities
    recentActivity.unshift({
      id: 0,
      message: 'Bus #12 completed route successfully',
      time: '5 minutes ago',
      status: 'success',
    });

    // Mock route usage data (replace with real data when you have routes)
    const routeUsage = [
      { name: 'Route A', value: 145, color: '#3B82F6' },
      { name: 'Route B', value: 98, color: '#10B981' },
      { name: 'Route C', value: 76, color: '#F59E0B' },
      { name: 'Route D', value: 54, color: '#EF4444' },
      { name: 'Route E', value: 32, color: '#8B5CF6' },
    ];

    res.status(200).json({
      success: true,
      data: {
        stats: {
          ...busStats,
          totalUsers,
          activeUsers,
          newUsersToday,
        },
        recentActivity,
        busPerformance,
        userGrowth,
        routeUsage,
      },
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics',
      error: error.message,
    });
  }
});

// Get all users with pagination
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ [sortBy]: sortOrder })
        .limit(limit)
        .skip(skip)
        .select('-password -refreshToken -resetPasswordToken'),
      User.countDocuments(query),
    ]);

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
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
});

// Dynamic routes (must be last)
router.get('/:id', authorize('admin', 'support'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      '-password -refreshToken -resetPasswordToken'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user by ID error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
});

router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.password;
    updateData.updatedAt = Date.now();

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password -refreshToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Update user error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: `Validation Error: ${messages.join(', ')}`,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
});

router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUser: {
          id: user._id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        },
      },
    });
  } catch (error) {
    console.error('Delete user error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
});

// Helper function for time formatting
function getTimeAgo(date) {
  if (!date) return "Never";
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
}

module.exports = router;