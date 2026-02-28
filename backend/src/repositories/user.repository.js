import {
  findUserByEmail,
  findUserById,
  insertUser,
  updateRefreshToken,
  findUserByRefreshToken,
} from "../models/user.model.js";

const userRepository = {
  findById: (id) => findUserById(id),
  // findByEmail:        (email) => findUserByEmail(email),
  // findByRefreshToken: (token) => findUserByRefreshToken(token),
  //create:            (user)  => insertUser(user),
  // updateRefreshToken: (userId, token) => updateRefreshToken(userId, token),
};

export default userRepository;
