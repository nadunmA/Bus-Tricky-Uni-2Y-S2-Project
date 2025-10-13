/**
 * Standardized API Response Helper
 * Provides consistent response format across all API endpoints
 */

class ApiResponse {
  /**
   * Success Response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {String} message - Success message
   * @param {Number} statusCode - HTTP status code (default: 200)
   */
  static success(res, data = null, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      statusCode,
    });
  }

  /**
   * Error Response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   * @param {Number} statusCode - HTTP status code (default: 500)
   * @param {*} errors - Detailed error information
   */
  static error(
    res,
    message = "Internal Server Error",
    statusCode = 500,
    errors = null
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
      statusCode,
    });
  }

  /**
   * Validation Error Response
   * @param {Object} res - Express response object
   * @param {Array} errors - Validation errors array
   * @param {String} message - Error message
   */
  static validationError(res, errors, message = "Validation failed") {
    return res.status(400).json({
      success: false,
      message,
      errors: errors.map((error) => ({
        field: error.param || error.path,
        message: error.msg || error.message,
        value: error.value,
      })),
      timestamp: new Date().toISOString(),
      statusCode: 400,
    });
  }

  /**
   * Unauthorized Response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static unauthorized(res, message = "Access denied. No token provided.") {
    return res.status(401).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
      statusCode: 401,
    });
  }

  /**
   * Forbidden Response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static forbidden(
    res,
    message = "Access forbidden. Insufficient permissions."
  ) {
    return res.status(403).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
      statusCode: 403,
    });
  }

  /**
   * Not Found Response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static notFound(res, message = "Resource not found") {
    return res.status(404).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
      statusCode: 404,
    });
  }

  /**
   * Conflict Response
   * @param {Object} res - Express response object
   * @param {String} message - Error message
   */
  static conflict(res, message = "Resource already exists") {
    return res.status(409).json({
      success: false,
      message,
      timestamp: new Date().toISOString(),
      statusCode: 409,
    });
  }

  /**
   * Paginated Response
   * @param {Object} res - Express response object
   * @param {Array} data - Response data array
   * @param {Object} pagination - Pagination info
   * @param {String} message - Success message
   */
  static paginated(
    res,
    data,
    pagination,
    message = "Data retrieved successfully"
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: pagination.limit,
        hasNextPage: pagination.page < pagination.totalPages,
        hasPrevPage: pagination.page > 1,
      },
      timestamp: new Date().toISOString(),
      statusCode: 200,
    });
  }

  /**
   * Created Response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {String} message - Success message
   */
  static created(res, data, message = "Resource created successfully") {
    return this.success(res, data, message, 201);
  }

  /**
   * Updated Response
   * @param {Object} res - Express response object
   * @param {*} data - Response data
   * @param {String} message - Success message
   */
  static updated(res, data, message = "Resource updated successfully") {
    return this.success(res, data, message, 200);
  }

  /**
   * Deleted Response
   * @param {Object} res - Express response object
   * @param {String} message - Success message
   */
  static deleted(res, message = "Resource deleted successfully") {
    return this.success(res, null, message, 200);
  }
}

module.exports = ApiResponse;
