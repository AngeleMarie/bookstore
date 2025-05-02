import Redis from 'ioredis';
import jwt from 'jsonwebtoken';


const redisClient = new Redis({
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redisClient.on('error', (err) => {
  console.error('Redis token service error:', err);
});

/**
 * Blacklist a token by adding it to Redis
 * @param {string} token - The JWT token to blacklist
 * @returns {boolean} - Success status
 */
const blacklistToken = async (token) => {
  try {
    if (!token) {
      console.error('No token provided for blacklisting');
      return false;
    }
    
    // Decode token to get expiration time (without verification)
    const decodedToken = jwt.decode(token);
    
    if (!decodedToken || !decodedToken.exp) {
      console.error('Invalid token format for blacklisting');
      return false;
    }
    
    // Calculate remaining TTL for the token
    const currentTime = Math.floor(Date.now() / 1000);
    const tokenExpiry = decodedToken.exp;
    const timeToExpire = tokenExpiry - currentTime;
    
    // Only blacklist if token is not already expired
    if (timeToExpire > 0) {
      // Add token to blacklist with TTL matching its remaining lifetime
      await redisClient.set(`blacklisted_token:${token}`, 'true', 'EX', timeToExpire);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error blacklisting token:', error);
    return false;
  }
};

/**
 * Generates a JWT token for a user
 * @param {Object} payload - User data to include in token
 * @param {string} expiresIn - Token expiration time (e.g., '1h', '7d')
 * @returns {string} - JWT token
 */
const generateToken = (payload, expiresIn = '1h') => {
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn });
};

/**
 * Verify a token is valid
 * @param {string} token - JWT token to verify
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
};

export { blacklistToken, generateToken, verifyToken };