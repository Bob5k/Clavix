/**
 * Error utilities tests
 */

import {
  isError,
  getErrorMessage,
  getErrorStack,
  toError,
  isNodeError,
} from '../../src/utils/error-utils';

describe('Error Utilities', () => {
  describe('isError', () => {
    it('should return true for Error instances', () => {
      expect(isError(new Error('test'))).toBe(true);
      expect(isError(new TypeError('test'))).toBe(true);
      expect(isError(new RangeError('test'))).toBe(true);
      expect(isError(new SyntaxError('test'))).toBe(true);
    });

    it('should return false for non-Error values', () => {
      expect(isError('string')).toBe(false);
      expect(isError(123)).toBe(false);
      expect(isError(null)).toBe(false);
      expect(isError(undefined)).toBe(false);
      expect(isError({})).toBe(false);
      expect(isError([])).toBe(false);
      expect(isError({ message: 'test' })).toBe(false);
    });

    it('should work with custom Error subclasses', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }

      expect(isError(new CustomError('test'))).toBe(true);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from Error instances', () => {
      const error = new Error('Test error message');
      expect(getErrorMessage(error)).toBe('Test error message');
    });

    it('should return string errors directly', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should extract message from error-like objects', () => {
      const errorObj = { message: 'Object error' };
      expect(getErrorMessage(errorObj)).toBe('Object error');
    });

    it('should handle non-string message property', () => {
      const errorObj = { message: 123 };
      expect(getErrorMessage(errorObj)).toBe('An unknown error occurred');
    });

    it('should return default message for unknown error types', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred');
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
      expect(getErrorMessage(123)).toBe('An unknown error occurred');
      expect(getErrorMessage({})).toBe('An unknown error occurred');
      expect(getErrorMessage([])).toBe('An unknown error occurred');
    });

    it('should handle TypeError', () => {
      const error = new TypeError('Type error message');
      expect(getErrorMessage(error)).toBe('Type error message');
    });

    it('should handle empty string errors', () => {
      expect(getErrorMessage('')).toBe('');
    });

    it('should handle objects without message property', () => {
      const obj = { code: 'ERROR', detail: 'Some detail' };
      expect(getErrorMessage(obj)).toBe('An unknown error occurred');
    });
  });

  describe('getErrorStack', () => {
    it('should extract stack trace from Error instances', () => {
      const error = new Error('Test error');
      const stack = getErrorStack(error);

      expect(stack).toBeDefined();
      expect(stack).toContain('Error: Test error');
    });

    it('should return undefined for non-Error values', () => {
      expect(getErrorStack('string')).toBeUndefined();
      expect(getErrorStack(123)).toBeUndefined();
      expect(getErrorStack(null)).toBeUndefined();
      expect(getErrorStack(undefined)).toBeUndefined();
      expect(getErrorStack({})).toBeUndefined();
      expect(getErrorStack({ message: 'test' })).toBeUndefined();
    });

    it('should handle TypeError stack trace', () => {
      const error = new TypeError('Type error');
      const stack = getErrorStack(error);

      expect(stack).toBeDefined();
      expect(stack).toContain('TypeError');
    });

    it('should return undefined for error-like objects', () => {
      const errorObj = { message: 'Error', stack: 'Stack trace' };
      expect(getErrorStack(errorObj)).toBeUndefined();
    });
  });

  describe('toError', () => {
    it('should return Error instances unchanged', () => {
      const error = new Error('Test error');
      const result = toError(error);

      expect(result).toBe(error);
      expect(result.message).toBe('Test error');
    });

    it('should convert string to Error', () => {
      const result = toError('String error');

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('String error');
    });

    it('should convert error-like objects to Error', () => {
      const errorObj = { message: 'Object error' };
      const result = toError(errorObj);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('Object error');
    });

    it('should create default Error for unknown types', () => {
      expect(toError(null)).toBeInstanceOf(Error);
      expect(toError(null).message).toBe('An unknown error occurred');

      expect(toError(undefined)).toBeInstanceOf(Error);
      expect(toError(undefined).message).toBe('An unknown error occurred');

      expect(toError(123)).toBeInstanceOf(Error);
      expect(toError(123).message).toBe('An unknown error occurred');
    });

    it('should preserve TypeError subclass', () => {
      const typeError = new TypeError('Type error');
      const result = toError(typeError);

      expect(result).toBe(typeError);
      expect(result).toBeInstanceOf(TypeError);
    });

    it('should handle empty string', () => {
      const result = toError('');

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('');
    });

    it('should handle objects with non-string message', () => {
      const errorObj = { message: 123 };
      const result = toError(errorObj);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('An unknown error occurred');
    });

    it('should handle objects without message property', () => {
      const obj = { code: 'ERROR' };
      const result = toError(obj);

      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe('An unknown error occurred');
    });
  });

  describe('isNodeError', () => {
    it('should return true for NodeJS errors with code property', () => {
      const error: NodeJS.ErrnoException = new Error('Test error');
      error.code = 'ENOENT';

      expect(isNodeError(error)).toBe(true);
    });

    it('should return false for regular Error instances', () => {
      const error = new Error('Test error');

      expect(isNodeError(error)).toBe(false);
    });

    it('should return false for non-Error values', () => {
      expect(isNodeError('string')).toBe(false);
      expect(isNodeError(123)).toBe(false);
      expect(isNodeError(null)).toBe(false);
      expect(isNodeError(undefined)).toBe(false);
      expect(isNodeError({})).toBe(false);
    });

    it('should return false for error-like objects with code', () => {
      const errorObj = { message: 'Error', code: 'ENOENT' };

      expect(isNodeError(errorObj)).toBe(false);
    });

    it('should return false for Error with non-string code', () => {
      const error: any = new Error('Test error');
      error.code = 123;

      expect(isNodeError(error)).toBe(false);
    });

    it('should handle common NodeJS error codes', () => {
      const codes = ['ENOENT', 'EACCES', 'EEXIST', 'ENOTDIR', 'EISDIR'];

      codes.forEach(code => {
        const error: NodeJS.ErrnoException = new Error('Test error');
        error.code = code;

        expect(isNodeError(error)).toBe(true);
      });
    });
  });

  describe('integration tests', () => {
    it('should handle full error processing workflow', () => {
      const unknownError: unknown = new Error('Original error');

      // Check if it's an error
      expect(isError(unknownError)).toBe(true);

      // Extract message
      expect(getErrorMessage(unknownError)).toBe('Original error');

      // Get stack trace
      const stack = getErrorStack(unknownError);
      expect(stack).toBeDefined();
      expect(stack).toContain('Original error');

      // Convert to Error
      const error = toError(unknownError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should handle string error workflow', () => {
      const unknownError: unknown = 'String error message';

      expect(isError(unknownError)).toBe(false);
      expect(getErrorMessage(unknownError)).toBe('String error message');
      expect(getErrorStack(unknownError)).toBeUndefined();

      const error = toError(unknownError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('String error message');
    });

    it('should handle unknown error workflow', () => {
      const unknownError: unknown = { code: 'UNKNOWN' };

      expect(isError(unknownError)).toBe(false);
      expect(getErrorMessage(unknownError)).toBe('An unknown error occurred');
      expect(getErrorStack(unknownError)).toBeUndefined();

      const error = toError(unknownError);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('An unknown error occurred');
    });

    it('should differentiate between Error and NodeError', () => {
      const regularError = new Error('Regular error');
      const nodeError: NodeJS.ErrnoException = new Error('Node error');
      nodeError.code = 'ENOENT';

      expect(isError(regularError)).toBe(true);
      expect(isNodeError(regularError)).toBe(false);

      expect(isError(nodeError)).toBe(true);
      expect(isNodeError(nodeError)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle circular references in error objects', () => {
      const obj: any = { message: 'Circular error' };
      obj.self = obj;

      expect(getErrorMessage(obj)).toBe('Circular error');
    });

    it('should handle very long error messages', () => {
      const longMessage = 'a'.repeat(10000);
      const error = new Error(longMessage);

      expect(getErrorMessage(error)).toBe(longMessage);
      expect(getErrorMessage(error).length).toBe(10000);
    });

    it('should handle special characters in error messages', () => {
      const specialMessage = 'Error with "quotes" and \\backslashes\\ and \nnewlines';
      const error = new Error(specialMessage);

      expect(getErrorMessage(error)).toBe(specialMessage);
    });

    it('should handle unicode in error messages', () => {
      const unicodeMessage = 'Error with emoji 🚀 and 中文 characters';
      const error = new Error(unicodeMessage);

      expect(getErrorMessage(error)).toBe(unicodeMessage);
    });

    it('should handle nested error objects', () => {
      const nested = {
        message: 'Outer error',
        inner: {
          message: 'Inner error',
        },
      };

      expect(getErrorMessage(nested)).toBe('Outer error');
    });

    it('should handle arrays', () => {
      expect(getErrorMessage(['error', 'array'])).toBe('An unknown error occurred');
      expect(isError(['error', 'array'])).toBe(false);
    });

    it('should handle functions', () => {
      const fn = () => 'error';
      expect(getErrorMessage(fn)).toBe('An unknown error occurred');
      expect(isError(fn)).toBe(false);
    });

    it('should handle symbols', () => {
      const sym = Symbol('error');
      expect(getErrorMessage(sym)).toBe('An unknown error occurred');
      expect(isError(sym)).toBe(false);
    });
  });

  describe('type safety', () => {
    it('should narrow type with isError type guard', () => {
      const unknownError: unknown = new Error('Test');

      if (isError(unknownError)) {
        // TypeScript should recognize this as Error
        expect(unknownError.message).toBe('Test');
        expect(unknownError.stack).toBeDefined();
      }
    });

    it('should narrow type with isNodeError type guard', () => {
      const unknownError: unknown = new Error('Test');
      (unknownError as any).code = 'ENOENT';

      if (isNodeError(unknownError)) {
        // TypeScript should recognize this as NodeJSError
        expect(unknownError.code).toBe('ENOENT');
        expect(unknownError.message).toBe('Test');
      }
    });
  });
});
