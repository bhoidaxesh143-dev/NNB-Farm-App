import { StatusCodes } from 'http-status-codes';
import userService from '../services/userService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Private/Admin
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const result = await userService.getAllUsers(page, limit);

  successResponse(res, result, 'Users retrieved successfully');
});

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Private/Admin
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  successResponse(res, user, 'User retrieved successfully');
});

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Private/Admin
 */
export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);

  successResponse(res, user, 'User updated successfully');
});

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);

  successResponse(res, null, 'User deleted successfully');
});

/**
 * @route   GET /api/v1/users/profile/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);

  successResponse(res, user, 'Profile retrieved successfully');
});

/**
 * @route   PUT /api/v1/users/profile/me
 * @desc    Update current user profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);

  successResponse(res, user, 'Profile updated successfully');
});

