export class DiglettError extends Error {
  constructor(message: string, errorType: string) {
    super(message);
    this.name = errorType;
  }
}

export class FileNotFoundError extends DiglettError {
  constructor(message: string) {
    super(message, 'FileNotFoundError');
  }
}

export class ParseError extends DiglettError {
  constructor(message: string) {
    super(message, 'ParseError');
  }
}

export class InvalidProjectTypeError extends DiglettError {
  constructor(message: string) {
    super(message, 'InvalidProjectTypeError');
  }
}

export class InvalidArgumentError extends DiglettError {
  constructor(message: string) {
    super(message, 'InvalidArgumentError');
  }
}

export class StaleLockfileError extends DiglettError {
  constructor(message: string) {
    super(message, 'StaleLockfileError');
  }
}
