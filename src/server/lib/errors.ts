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
