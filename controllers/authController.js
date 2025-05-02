import _ from 'lodash';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import generateCode from '../utils/codeGenerator.js';
import { sendEmail } from '../config/emailConfig.js';
import path from 'path';
import userValidation from '../validators/userValidation.js'; 
import { loadTemplate } from '../utils/loadTemplate.js';
import { blacklistToken, generateToken } from '../middlewares/tokenService.js';
import { initializeSession, clearSession } from '../middlewares/sessionTimeout.js';

const createUser = async (req, res) => {
  try {
    const value = await userValidation.validateAsync(req.body);
    const { firstName, lastName, email, password, address, phoneNumber } = _.pick(req.body, ['firstName', 'lastName', 'email', 'password', 'address', 'phoneNumber']);
    
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { phoneNumber }
        ]
      }
    });
    
    if (existingUser) {
      let errorMessage = '';
      if (existingUser.email === email) {
        errorMessage = `Email ${email} is already registered. `;
      }
      if (existingUser.phoneNumber === phoneNumber) {
        errorMessage += `Phone number ${phoneNumber} is already registered.`;
      }
      return res.status(400).json({ message: errorMessage });
    }
    
    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);
    const activationCode = generateCode();
    
    const newUser = await User.create({ 
      firstName,
      lastName, 
      email, 
      password: hashedPassword,
      address,
      phoneNumber,
      status: 'pending', 
      activationCode
    });

    const html = loadTemplate(path.resolve('templates', 'activationEmail.html'), {
      fullName: `${newUser.firstName} ${newUser.lastName}`,
      activationCode: `${newUser.activationCode.split('').join(' ')}`,
    });
    await sendEmail({ to: email, subject: 'Activate Your Account', html });

    return res.status(201).json({
      message: "User created successfully. Activation code sent to email.",
      data: _.omit(newUser.toJSON(), ['password', 'activationCode']),
    });

  } catch (error) {
    console.error("Error in creating user:", error);
    if (error.isJoi) {
      return res.status(400).json({ error: `Validation error: ${error.details.map(detail => detail.message).join(', ')}` });
    }
    return res.status(500).json({ error: "An error occurred while creating the user." });
  }
};

const activateAccount = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || user.activationCode !== code) {
      return res.status(400).json({ message: "Invalid activation code." });
    }

    user.status = 'active';
    user.activationCode = null;
    await user.save();

    const html = loadTemplate(path.resolve('templates', 'activationSuccess.html'), {
      fullName: `${user.firstName} ${user.lastName}`,
    });
    await sendEmail({
      to: email,
      subject: 'Your Account Has Been Activated 🎉',
      html,
    });

    res.status(200).json({ message: "Account activated successfully." });
  } catch (error) {
    console.error("Error activating account:", error);
    res.status(500).json({ error: "Error activating account." });
  }
};

const initiateResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: "User not found." });

    const activationCode = generateCode();
    user.activationCode = activationCode;
    user.status = 'reset';
    await user.save();

    const html = loadTemplate(path.resolve('templates', 'resetPasswordEmail.html'), {
      fullName: `${user.firstName} ${user.lastName}`,
      activationCode: `${user.activationCode.split('').join(' ')}`,
    });
    await sendEmail({ to: email, subject: 'Reset Your Password', html });

    res.status(200).json({ message: "Password reset email sent." });
  } catch (error) {
    console.error("Error sending reset password email:", error);
    res.status(500).json({ error: "Error sending reset password email." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || user.activationCode !== resetCode || user.status !== 'reset') {
      return res.status(400).json({ message: "Invalid reset code or user status." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.status = 'active';
    user.activationCode = null;
    await user.save();

    const html = loadTemplate(path.resolve('templates', 'resetSuccess.html'), {
      fullName: `${user.firstName} ${user.lastName}`,
    });
    await sendEmail({
      to: email,
      subject: 'Password Reset Successful',
      html,
    });

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Error resetting password." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(403).json({ message: "User not found. Please register." });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: "Please activate your account first." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password incorrect." });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate JWT token with 1 hour expiry
    const token = generateToken(payload, "1h");
    
    // Initialize user session
    await initializeSession(user.id);

    res.status(200).json({
      message: `User logged in successfully as ${user.role}`,
      token,
      user: {
        id: user.id,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("An error occurred while logging in", error);
    res.status(500).json({ error: "An error occurred while logging in." });
  }
};

const logoutUser = async (req, res) => {
  try {
    // Get token from request (set by authentication middleware)
    const token = req.token;
    const userId = req.user?.id;
    
    if (!token || !userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Blacklist the token
    await blacklistToken(token);
    
    // Clear the user session
    await clearSession(userId);
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'An error occurred during logout' });
  }
};

export default {
  createUser,
  activateAccount,
  initiateResetPassword,
  resetPassword,
  loginUser,
  logoutUser,
};