const createRateLimiter = (maxAttempts, windowMs, message) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    for (let [ip, data] of attempts.entries()) {
      if (data.resetTime < now) {
        attempts.delete(ip);
      }
    }

    let attemptData = attempts.get(key);

    if (!attemptData) {
      attemptData = {
        count: 0,
        resetTime: now + windowMs,
      };
      attempts.set(key, attemptData);
    }

    if (attemptData.resetTime > now) {
      if (attemptData.count >= maxAttempts) {
        return res.status(429).json({
          success: false,
          message: message || "Too many requests, please try again later.",
          retryAfter: Math.ceil((attemptData.resetTime - now) / 1000),
        });
      }
      attemptData.count++;
    } else {
      attemptData.count = 1;
      attemptData.resetTime = now + windowMs;
    }

    next();
  };
};

const authLimiter = createRateLimiter(
  5,
  1 * 60 * 1000,
  "Too many authentication attempts, please try again in 15 minutes"
);

const passwordResetLimiter = createRateLimiter(
  3,
  60 * 60 * 1000,
  "Too many password reset attempts, please try again in 1 hour"
);

const emailVerificationLimiter = createRateLimiter(
  5,
  60 * 60 * 1000,
  "Too many email verification attempts, please try again in 1 hour"
);

const profileUpdateLimiter = createRateLimiter(
  10,
  60 * 60 * 1000,
  "Too many profile update attempts, please try again later"
);

const genaralLimiter = createRateLimiter(
  100,
  15 * 60 * 1000,
  "Too many requests, please try again later"
);

module.exports = {
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  profileUpdateLimiter,
  genaralLimiter,
};
