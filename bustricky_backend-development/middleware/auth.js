const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const UmUserModel = require("../models/UmUserModel");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UmUserModel.findById(decoded.id);
    if (!user) {
      return next(new ErrorResponse("No user found with this token", 401));
    }

    if (!user.isActive) {
      return next(new ErrorResponse("User account is deactivated", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorResponse("Access denied. Admin role required.", 403));
  }
  next();
};

const authorizeOwnerOrAdmin = (req, res, next) => {
  if (req.user.role === "admin" || req.user.id === req.params.id) {
    next();
  } else {
    return next(
      new ErrorResponse("Access denied. Owner or admin role required.", 403)
    );
  }
};

module.exports = {
  protect,
  authorize,
  authorizeAdmin,
  authorizeOwnerOrAdmin,
};
