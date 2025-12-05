import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorHandler, AppError, asyncHandler } from '../../../src/middleware/errorHandler';

describe('Error Handler Middleware Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {};
    mockResponse = {
      status: statusMock,
      json: jsonMock
    };
    mockNext = jest.fn();
  });

  describe('ZodError Handling', () => {
    it('should handle Zod validation errors with 400 status', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number'
        }
      ]);

      errorHandler(
        zodError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Validation Error',
        details: [
          {
            field: 'name',
            message: 'Expected string, received number'
          }
        ]
      });
    });

    it('should handle multiple Zod validation errors', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['first_name'],
          message: 'Required'
        },
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['last_name'],
          message: 'Required'
        }
      ]);

      errorHandler(
        zodError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Validation Error',
        details: expect.arrayContaining([
          expect.objectContaining({ field: 'first_name' }),
          expect.objectContaining({ field: 'last_name' })
        ])
      });
    });

    it('should handle nested field path in Zod errors', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['emails', 0, 'email_address'],
          message: 'Invalid email'
        }
      ]);

      errorHandler(
        zodError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          details: [
            {
              field: 'emails.0.email_address',
              message: 'Invalid email'
            }
          ]
        })
      );
    });
  });

  describe('AppError Handling', () => {
    it('should handle AppError with custom status code', () => {
      const appError = new AppError('Resource not found', 404);

      errorHandler(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Resource not found'
      });
    });

    it('should handle AppError with default 500 status', () => {
      const appError = new AppError('Something went wrong');

      errorHandler(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Something went wrong'
      });
    });

    it('should handle AppError with 400 status (Bad Request)', () => {
      const appError = new AppError('Invalid input', 400);

      errorHandler(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should handle AppError with 403 status (Forbidden)', () => {
      const appError = new AppError('Access denied', 403);

      errorHandler(
        appError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(403);
    });
  });

  describe('PostgreSQL Error Handling', () => {
    it('should handle unique constraint violation (23505)', () => {
      const pgError: any = new Error('Duplicate key');
      pgError.code = '23505';
      pgError.detail = 'Key (email)=(test@example.com) already exists.';

      errorHandler(
        pgError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Duplicate entry',
        detail: pgError.detail
      });
    });

    it('should handle foreign key violation (23503)', () => {
      const pgError: any = new Error('Foreign key violation');
      pgError.code = '23503';
      pgError.detail = 'Key (parent_id)=(999) is not present in table "parent".';

      errorHandler(
        pgError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Referenced record does not exist',
        detail: pgError.detail
      });
    });

    it('should handle not null violation (23502)', () => {
      const pgError: any = new Error('Not null violation');
      pgError.code = '23502';
      pgError.detail = 'Failing row contains (1, null, ...).';

      errorHandler(
        pgError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Required field missing',
        detail: pgError.detail
      });
    });

    it('should handle unknown PostgreSQL error code', () => {
      const pgError: any = new Error('Unknown PG error');
      pgError.code = '42P01'; // undefined_table
      pgError.detail = 'Some detail';

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      errorHandler(
        pgError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Generic Error Handling', () => {
    it('should handle unknown error types', () => {
      const genericError = new Error('Unknown error');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      errorHandler(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unhandled error:', genericError);

      consoleErrorSpy.mockRestore();
    });

    it('should show error message in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const genericError = new Error('Detailed error message');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      errorHandler(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Detailed error message'
      });

      consoleErrorSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should hide error message in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const genericError = new Error('Detailed error message');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      errorHandler(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });

      consoleErrorSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle errors with no message', () => {
      const noMessageError = new Error();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      errorHandler(
        noMessageError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(500);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('AppError Class', () => {
    it('should create AppError with message and status code', () => {
      const error = new AppError('Test error', 404);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
      expect(error instanceof Error).toBe(true);
    });

    it('should create AppError with default 500 status code', () => {
      const error = new AppError('Default status');

      expect(error.statusCode).toBe(500);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Stack trace test', 500);

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });

    it('should mark error as operational', () => {
      const error = new AppError('Operational error', 400);

      expect(error.isOperational).toBe(true);
    });
  });

  describe('asyncHandler Wrapper', () => {
    it('should call next with error when promise rejects', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);

      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should not call next when promise resolves', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);

      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass through request, response, and next to wrapped function', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);

      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(asyncFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
    });

    it('should handle errors thrown in async functions', async () => {
      const error = new Error('Error in async');
      const asyncFn = async () => {
        throw error;
      };

      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle AppError in async functions', async () => {
      const appError = new AppError('Not found', 404);
      const asyncFn = jest.fn().mockRejectedValue(appError);

      const wrappedFn = asyncHandler(asyncFn);

      await wrappedFn(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(appError);
    });
  });

  describe('Error Handler Edge Cases', () => {
    it('should handle error with undefined properties', () => {
      const strangeError: any = new Error();
      strangeError.code = undefined;
      strangeError.detail = undefined;

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      errorHandler(
        strangeError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(500);

      consoleErrorSpy.mockRestore();
    });

    it('should handle error that is not an Error instance', () => {
      const notAnError: any = { message: 'Not an error object' };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      errorHandler(
        notAnError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(500);

      consoleErrorSpy.mockRestore();
    });

    it('should handle error with only message property', () => {
      const simpleError: any = { message: 'Simple error object' };
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      errorHandler(
        simpleError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(500);

      consoleErrorSpy.mockRestore();
    });
  });
});
