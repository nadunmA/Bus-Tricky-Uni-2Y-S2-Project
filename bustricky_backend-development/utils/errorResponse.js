class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad Request") {
    return new ErrorResponse(message, 400);
  }

  static unauthorized(message = "Unauthorized") {
    return new ErrorResponse(message, 401);
  }

  static forbidden(message = "Forbidden") {
    return new ErrorResponse(message, 403);
  }

  static notFound(message = "Not Found") {
    return new ErrorResponse(message, 404);
  }

  static conflict(message = "Conflict") {
    return new ErrorResponse(message, 409);
  }

  static unprocessableEntity(message = "Unprocessable Entity") {
    return new ErrorResponse(message, 422);
  }

  static internal(message = "Internal Server Error") {
    return new ErrorResponse(message, 500);
  }

  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        status: this.status,
        statusCode: this.statusCode,
        ...(process.env.NODE_ENV === "development" && { stack: this.stack }),
      },
    };
  }
}

module.exports = ErrorResponse;
