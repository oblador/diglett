const path = require('path');

class DiglettError extends Error {
  constructor(message, errorType) {
    super(message);
    this.name = errorType;
  }
}

class FileNotFoundError extends DiglettError {
  constructor(message) {
    super(message, 'FileNotFoundError');
  }
}

class ParseError extends DiglettError {
  constructor(message) {
    super(message, 'ParseError');
  }
}

class InvalidProjectTypeError extends DiglettError {
  constructor(message) {
    super(message, 'InvalidProjectTypeError');
  }
}

class InvalidArgumentError extends DiglettError {
  constructor(message) {
    super(message, 'InvalidArgumentError');
  }
}

module.exports = {
  DiglettError,
  FileNotFoundError,
  ParseError,
  InvalidProjectTypeError,
  InvalidArgumentError,
};
