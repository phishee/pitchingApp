export class ValidationError extends Error {
  constructor(public errors: string[]) {
    super(errors.join(', '));
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class SessionError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SessionError';
  }
}

