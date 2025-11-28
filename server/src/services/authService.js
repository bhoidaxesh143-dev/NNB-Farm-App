import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import config from '../config/index.js';
import AppError from '../utils/AppError.js';
import userRepository from '../repositories/userRepository.js';
import { setCache, getCache, deleteCache } from '../utils/cache.js';

/**
 * Authentication Service - Business Logic Layer
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError(
        'Email already registered',
        StatusCodes.CONFLICT,
        'EMAIL_EXISTS'
      );
    }

    // Create user
    const user = await userRepository.create(userData);

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Store refresh token in cache
    await setCache(
      `refresh_token:${user._id}`,
      tokens.refreshToken,
      7 * 24 * 60 * 60 // 7 days
    );

    return { user, tokens };
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Find user with password
    const user = await userRepository.findByEmail(email);
    
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError(
        'Invalid credentials',
        StatusCodes.UNAUTHORIZED,
        'INVALID_CREDENTIALS'
      );
    }

    if (!user.isActive) {
      throw new AppError(
        'Account is deactivated',
        StatusCodes.FORBIDDEN,
        'ACCOUNT_DEACTIVATED'
      );
    }

    // Update last login
    await userRepository.updateLastLogin(user._id);

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Store refresh token in cache
    await setCache(
      `refresh_token:${user._id}`,
      tokens.refreshToken,
      7 * 24 * 60 * 60
    );

    // Remove password from response
    user.password = undefined;

    return { user, tokens };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

      // Check if token exists in cache
      const cachedToken = await getCache(`refresh_token:${decoded.id}`);
      if (!cachedToken || cachedToken !== refreshToken) {
        throw new AppError(
          'Invalid refresh token',
          StatusCodes.UNAUTHORIZED,
          'INVALID_REFRESH_TOKEN'
        );
      }

      // Get user
      const user = await userRepository.findById(decoded.id);
      if (!user) {
        throw new AppError(
          'User not found',
          StatusCodes.UNAUTHORIZED,
          'USER_NOT_FOUND'
        );
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Update refresh token in cache
      await setCache(
        `refresh_token:${user._id}`,
        tokens.refreshToken,
        7 * 24 * 60 * 60
      );

      return tokens;
    } catch (error) {
      throw new AppError(
        'Invalid refresh token',
        StatusCodes.UNAUTHORIZED,
        'INVALID_REFRESH_TOKEN'
      );
    }
  }

  /**
   * Logout user
   */
  async logout(userId) {
    // Remove refresh token from cache
    await deleteCache(`refresh_token:${userId}`);
    return true;
  }

  /**
   * Generate access and refresh tokens
   */
  generateTokens(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }
}

export default new AuthService();

