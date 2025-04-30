import _ from 'lodash';
import userValidation from '../validators/userValidation.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import generateCode from '../utils/codeGenerator.js';



const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password', 'activationCode'] } });
    if (!user) return res.status(404).json({ message: "User not found." });

    return res.status(200).json({ data: user });
  } catch (error) {
    console.error("Error in getting user:", error);
    return res.status(500).json({ error: "An error occurred." });
  }
};

const getAllClients = async (req, res) => {
  try {
    const clients = await User.findAll({ where: { role: 'client' }, attributes: { exclude: ['password', 'activationCode'] } });
    return res.status(200).json({ data: clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return res.status(500).json({ error: "An error occurred." });
  }
};

const searchUserByName = async (req, res) => {
  try {
    const { name } = req.query;
    const users = await User.findAll({
      where: {
        fullName: { [Op.iLike]: `%${name}%` } // case insensitive search
      },
      attributes: { exclude: ['password', 'activationCode'] }
    });

    return res.status(200).json({ data: users });
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({ error: "An error occurred." });
  }
};

const updateUser = async (req, res) => {
  try {
    const updates = _.pick(req.body, ['fullName', 'address', 'phoneNumber']);
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    await user.update(updates);

    return res.status(200).json({ message: "User updated successfully.", data: _.omit(user.toJSON(), ['password', 'activationCode']) });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "An error occurred." });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "Profile image is required." });
    }

    const userId = req.params.id; 

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.profileImage = `/uploads/${file.filename}`;
    await user.save();

    return res.status(200).json({ message: "Profile image updated successfully", data: user });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ error: "Failed to upload profile image" });
  }
};
const removeProfileImage = async (req, res) => {
  try {
    const userId = req.params.id; // Get the user ID from the URL params

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Remove the profile image by setting it to null
    user.profileImage = null;
    await user.save();

    return res.status(200).json({ message: "Profile image removed successfully", data: user });
  } catch (error) {
    console.error("Error removing profile image:", error);
    res.status(500).json({ error: "Failed to remove profile image" });
  }
};

export default {
  removeProfileImage,
  getCurrentUser,
  getAllClients,
  searchUserByName,
  updateUser,
  uploadProfileImage
};
