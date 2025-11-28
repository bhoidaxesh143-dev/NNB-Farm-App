import { successResponse, errorResponse } from '../../../utils/response.js';

describe('Response Utilities', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('successResponse', () => {
    it('should send success response with default values', () => {
      successResponse(res, { id: 1 });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: { id: 1 },
        timestamp: expect.any(String),
      });
    });

    it('should send success response with custom values', () => {
      successResponse(res, { user: 'test' }, 'Custom message', 201);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Custom message',
        data: { user: 'test' },
        timestamp: expect.any(String),
      });
    });
  });

  describe('errorResponse', () => {
    it('should send error response with default values', () => {
      errorResponse(res, 'Error occurred');

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ERROR',
          message: 'Error occurred',
        },
        timestamp: expect.any(String),
      });
    });

    it('should send error response with details', () => {
      errorResponse(res, 'Validation error', 400, 'VALIDATION_ERROR', ['Field is required']);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation error',
          details: ['Field is required'],
        },
        timestamp: expect.any(String),
      });
    });
  });
});

