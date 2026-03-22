export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, code: string, statusCode: number, public readonly cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class InvalidCommandError extends AppError {
  constructor(message = 'Invalid command') {
    super(message, 'INVALID_COMMAND', 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class DuplicateCommandError extends AppError {
  public readonly traceId: string;

  constructor(traceId: string) {
    super(`Duplicate command blocked: ${traceId}`, 'DUPLICATE_COMMAND', 409);
    this.traceId = traceId;
  }
}

export class UnsupportedIntentError extends AppError {
  constructor(text: string) {
    super(`Unsupported intent for: "${text}"`, 'UNSUPPORTED_INTENT', 422);
  }
}

export class ExecutionError extends AppError {
  constructor(message: string, cause?: unknown) {
    super(message, 'EXECUTION_FAILED', 500, cause);
  }
}
