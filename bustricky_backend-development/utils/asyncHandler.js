/**
 * Higher-order function to handle async/await errors in Express routes
 * Eliminates the need for try-catch blocks in every controller function
 *
 * Usage:
 * const asyncHandler = require('../utils/asyncHandler');
 *
 * const getUsers = asyncHandler(async (req, res, next) => {
 *   const users = await User.find();
 *   res.json(users);
 * });
 *
 * @param {Function} fn
 * @returns {Function}
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
