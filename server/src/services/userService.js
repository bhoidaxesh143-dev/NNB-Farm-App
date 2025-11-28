import { StatusCodes } from 'http-status-codes';
import AppError from '../utils/AppError.js';
import userRepository from '../repositories/userRepository.js';
import config from '../config/index.js';

/**
 * User Service - Business Logic Layer
 */
class UserService {
  /**
   * Get user by ID
   */
  async getUserById(id) {
    const user = await userRepository.findById(id);
    
    if (!user) {
      throw new AppError(
        'User not found',
        StatusCodes.NOT_FOUND,
        'USER_NOT_FOUND'
      );
    }

    return user;
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(page = 1, limit = config.pagination.defaultPageSize, filters = {}) {
    // Validate and sanitize pagination
    const validPage = Math.max(1, parseInt(page));
    const validLimit = Math.min(
      Math.max(1, parseInt(limit)),
      config.pagination.maxPageSize
    );

    return await userRepository.findAll(validPage, validLimit, filters);
  }

  /**
   * Update user profile
   */
  async updateUser(id, updateData) {
    // Prevent updating sensitive fields
    const { password, role, ...safeUpdateData } = updateData;

    const user = await userRepository.updateById(id, safeUpdateData);
    
    if (!user) {
      throw new AppError(
        'User not found',
        StatusCodes.NOT_FOUND,
        'USER_NOT_FOUND'
      );
    }

    return user;
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    const user = await userRepository.deleteById(id);
    
    if (!user) {
      throw new AppError(
        'User not found',
        StatusCodes.NOT_FOUND,
        'USER_NOT_FOUND'
      );
    }

    return user;
  }

  /**
   * Get current user profile
   */
  async getProfile(userId) {
    return await this.getUserById(userId);
  }

  /**
   * Update current user profile
   */
  async updateProfile(userId, updateData) {
    return await this.updateUser(userId, updateData);
  }
}

export default new UserService();

