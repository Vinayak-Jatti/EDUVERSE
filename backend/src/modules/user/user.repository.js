import * as userModel from "./user.model.js";

const userRepository = {
  /**
   * Find user by ID
   */
  findById: async (id) => {
    return await userModel.findUserById(id);
  },

  /**
   * Find user by email
   */
  findByEmail: async (email) => {
    return await userModel.findUserByEmail(email);
  },

  /**
   * Create a new core user record
   */
  create: async (userData) => {
    return await userModel.createUser(userData);
  },

  /**
   * Deactivate user (soft delete)
   */
  deactivate: async (id) => {
    return await userModel.softDeleteUser(id);
  }
};

export default userRepository;
