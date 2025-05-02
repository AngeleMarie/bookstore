import _ from 'lodash';
import userValidation from '../validators/userValidation.js';
import { Op } from 'sequelize';
import User from '../models/User.js';
import bcrypt from 'bcrypt';



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
    const clients = await User.findAll({ where: { role: 'client' }, attributes: { exclude: ['password', 'activationCode','balance','role','status'] } });
    return res.status(200).json({ data: clients });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return res.status(500).json({ error: "An error occurred." });
  }
};

const searchUserByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: "Query parameter 'name' is required." });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${name}%` } },
          { lastName: { [Op.iLike]: `%${name}%` } }
        ]
      },
      attributes: {
        exclude: ['password', 'activationCode', 'balance', 'role', 'status']
      }
    });

    return res.status(200).json({ data: users });
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({ error: "An error occurred." });
  }
};

/**
 * Updates the currently logged-in user's profile information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with updated user data or error message
 */
const updateUser = async (req, res) => {
  try {
    // Validate input - only allow specific fields to be updated
    const allowedFields = ['firstName', 'lastName', 'address', 'phoneNumber', 'balance'];
    const updates = _.pick(req.body, allowedFields);
    
    // Check if there are any fields to update
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update." });
    }
    
    // Find the currently logged-in user
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    
    // Additional validation could be done here
    if (updates.phoneNumber && !/^\+?[\d\s()-]{10,15}$/.test(updates.phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number format." });
    }
    
    // Update the user record
    await user.update(updates);
    
    // Return success response with updated user data (excluding sensitive info)
    return res.status(200).json({ 
      message: "User profile updated successfully.", 
      data: _.omit(user.toJSON(), ['password', 'activationCode', 'resetToken']) 
    });
    
  } catch (error) {
    console.error("Error updating user:", error);
    
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors.map(e => e.message) 
      });
    }
    
    return res.status(500).json({ message: "An internal server error occurred." });
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

    // Ensure the authenticated user can only modify their own profile
    if (user.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to modify this profile." });
    }

    user.profileImage = `/uploads/${file.filename}`;
    await user.save();

    return res.status(200).json({ 
      message: "Profile image updated successfully", 
      data: _.omit(user.toJSON(), ['password', 'activationCode'])
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return res.status(500).json({ error: "Failed to upload profile image" });
  }
};

const removeProfileImage = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Ensure the authenticated user can only modify their own profile
    if (user.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Not authorized to modify this profile." });
    }

    user.profileImage = null;
    await user.save();

    return res.status(200).json({ 
      message: "Profile image removed successfully", 
      data: _.omit(user.toJSON(), ['password', 'activationCode'])
    });
  } catch (error) {
    console.error("Error removing profile image:", error);
    return res.status(500).json({ error: "Failed to remove profile image" });
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
