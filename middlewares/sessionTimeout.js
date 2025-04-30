import jwt from 'jsonwebtoken';
import Redis from 'ioredis';

const redisClient = new Redis();

const sessionTimeout = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.SECRET_KEY, async (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const userId = decodedToken.id; // Use user ID or any unique identifier

    // Retrieve the last activity timestamp from Redis (if available)
    const lastActivity = await redisClient.get(`user:${userId}:lastActivity`);

    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
    const timeoutDuration = 5 * 60; // 5 minutes

    if (lastActivity) {
      // Check if the session has been inactive for more than 5 minutes
      const inactivityDuration = currentTime - lastActivity;
      if (inactivityDuration > timeoutDuration) {
        return res.status(401).json({ error: 'Session expired due to inactivity. Please log in again.' });
      }
    }

    // Update the last activity timestamp in Redis
    await redisClient.set(`user:${userId}:lastActivity`, currentTime);

    // Pass the user info to the next middleware
    req.user = decodedToken;
    next();
  });
};

export default sessionTimeout;
