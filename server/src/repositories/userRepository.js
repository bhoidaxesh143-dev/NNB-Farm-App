import User from '../models/User.js';

/**
 * User Repository - Data Access Layer
 */
class UserRepository {
  /**
   * Create a new user
   */
  async create(userData) {
    const user = await User.create(userData);
    return user;
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    return await User.findById(id);
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    return await User.findOne({ email }).select('+password');
  }

  /**
   * Find all users with pagination
   */
  async findAll(page = 1, limit = 20, filters = {}) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filters),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update user by ID
   */
  async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete user by ID
   */
  async deleteById(id) {
    return await User.findByIdAndDelete(id);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id) {
    return await User.findByIdAndUpdate(
      id,
      { lastLogin: new Date() },
      { new: true }
    );
  }
}

export default new UserRepository();

