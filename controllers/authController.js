import _ from 'lodash';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import generateCode from '../utils/codeGenerator.js';
import { sendEmail } from '../config/emailConfig.js';
import fs from 'fs';
import path from 'path';
import  userValidation  from '../validators/userValidation.js'; 

const redisClient = new Redis();

const loadTemplate = (filePath, code) => {
    const template = fs.readFileSync(filePath, 'utf-8');
    return template.replace('{{code}}', code);
  }; 
  
  const createUser = async (req, res) => {
    try {
      const value = await userValidation.validateAsync(req.body);
      const { fullName, email, password, address, phoneNumber } = _.pick(req.body, ['fullName', 'email', 'password', 'address', 'phoneNumber']);
      
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: `Email ${email} is already registered.` });
      }
  
      const salt = 10;
      const hashedPassword = await bcrypt.hash(password, salt);
      const activationCode = generateCode();
      
      const newUser = await User.create({ 
        fullName, 
        email, 
        password: hashedPassword,
        address,
        phoneNumber,
        status: 'Pending', 
        activationCode
      });
  
    const html = loadTemplate(path.resolve('templates', 'activationEmail.html'), activationCode);
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

export const initiateAccountActivation = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: "User not found." });

    const activationCode = generateCode();
    user.activationCode = activationCode;
    await user.save();

    const html = loadTemplate(path.resolve('templates', 'activationEmail.html'), activationCode);
    await sendEmail({ to: email, subject: 'Activate Your Account', html });

    res.status(200).json({ message: "Activation email sent." });
  } catch (error) {
    console.error("Error sending activation email:", error);
    res.status(500).json({ error: "Error sending activation email." });
  }
};

export const activateAccount = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || user.activationCode !== code) {
      return res.status(400).json({ message: "Invalid activation code." });
    }

    user.status = 'active';
    user.activationCode = null;
    await user.save();

    res.status(200).json({ message: "Account activated successfully." });
  } catch (error) {
    console.error("Error activating account:", error);
    res.status(500).json({ error: "Error activating account." });
  }
};

export const initiateResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: "User not found." });

    const activationCode = generateActivationCode();
    user.activationCode = activationCode;
    user.status = 'reset';
    await user.save();

    const html = loadTemplate(path.resolve('templates', 'resetPasswordEmail.html'), activationCode);
    await sendEmail({ to: email, subject: 'Reset Your Password', html });

    res.status(200).json({ message: "Password reset email sent." });
  } catch (error) {
    console.error("Error sending reset password email:", error);
    res.status(500).json({ error: "Error sending reset password email." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || user.activationCode !== code || user.status !== 'reset') {
      return res.status(400).json({ message: "Invalid reset code or user status." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.status = 'active';
    user.activationCode = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Error resetting password." });
  }
};

export const loginUser = async (req, res) => {
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

    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({
      message: `User logged in successfully as ${user.role}`,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("An error occurred while logging in", error);
    res.status(500).json({ error: "An error occurred while logging in." });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: "Unauthenticated, header missing" });
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.decode(token);
    const expiry = decodedToken.exp;

    await redisClient.set(token, true, 'EX', expiry - Math.floor(Date.now() / 1000));
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'An error occurred during logout' });
  }
};

export default {
  createUser,
  initiateAccountActivation,
  activateAccount,
  initiateResetPassword,
  resetPassword,
  loginUser,
  logoutUser,
};
