import AppError from '../../../utils/AppError.js';

describe('AppError', () => {
  it('should create an error with default values', () => {
    const error = new AppError('Test error');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.isOperational).toBe(true);
    expect(error.timestamp).toBeDefined();
  });

  it('should create an error with custom values', () => {
    const error = new AppError('Custom error', 404, 'NOT_FOUND', false);

    expect(error.message).toBe('Custom error');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.isOperational).toBe(false);
  });

  it('should capture stack trace', () => {
    const error = new AppError('Stack trace test');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('AppError');
  });
});

