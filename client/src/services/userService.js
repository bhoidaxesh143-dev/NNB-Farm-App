import api from './api';

/**
 * User service
 */
const userService = {
  /**
   * Get user profile
   */
  async getProfile() {
    const response = await api.get('/users/profile/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(userData) {
    const response = await api.put('/users/profile/me', userData);
    return response.data;
  },

  /**
   * Get all users (admin)
   */
  async getUsers(page = 1, limit = 20) {
    const response = await api.get('/users', {
      params: { page, limit },
    });
    return response.data;
  },
};

export default userService;

