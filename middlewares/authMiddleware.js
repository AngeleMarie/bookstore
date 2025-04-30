import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = new Redis();

const authentication = async (req, res, next) => {
  try {
    // Check if the Authorization header exists
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is missing' });
    }

    // Extract token from the 'Bearer token' format
    const token = authHeader.split(' ')[1];

    // Check if the token is blacklisted in Redis
    const isBlacklisted = await redisClient.get(token);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token is invalid. Please log in again.' });
    }

    // Verify JWT token
    jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
      if (err) {
        // Check if the error is related to token expiration and give a custom message
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token has expired. Please log in again.' });
        }
        return res.status(403).json({ error: 'Invalid token. Please log in again.' });
      }

      // Store the decoded token data in the request object for further use in the app
      req.user = decodedToken;
      next(); // Proceed to the next middleware or route handler
    });
  } catch (error) {
    console.error('Error in authentication middleware:', error); // Log errors securely in production
    res.status(500).json({ error: 'An error occurred during authentication' });
  }
};

export default authentication;
