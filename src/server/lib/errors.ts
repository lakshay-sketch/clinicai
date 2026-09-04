export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: unknown) {
    super("NOT_FOUND", message, 404, details);
  }
}

export class InternalError extends AppError {
  constructor(message = "Something went wrong", details?: unknown) {
    super("INTERNAL_ERROR", message, 500, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid request parameters", details?: unknown) {
    super("VALIDATION_ERROR", message, 400, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action", details?: unknown) {
    super("FORBIDDEN", message, 403, details);
  }
}
