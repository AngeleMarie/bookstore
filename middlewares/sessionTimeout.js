import jwt from "jsonwebtoken";
import Redis from "ioredis";

const redisClient = new Redis({
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});
redisClient.on("error", (err) => {
  console.error("Redis session timeout error:", err);
});

const timeoutDuration = 5 * 60; 

const sessionTimeout = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }
    const key = `user:${userId}:lastActivity`;

    const lastActivity = await redisClient.get(key);

    if (!lastActivity) {
      await redisClient.set(key, Date.now(), "EX", timeoutDuration);
      return next();
    }

    const currentTime = Date.now();
    const lastActivityTime = parseInt(lastActivity);

    if (currentTime - lastActivityTime > timeoutDuration * 1000) {
      await redisClient.del(key);
      return res.status(401).json({
        error: "Session expired due to inactivity. Please log in again.",
      });
    }

    await redisClient.set(key, Date.now(), "EX", timeoutDuration);

    next();
  } catch (error) {
    console.error("Session timeout middleware error:", error);
    next();
  }
};
const initializeSession = async (userId) => {
  try {
    const key = `user:${userId}:lastActivity`;
    await redisClient.set(key, Date.now(), "EX", timeoutDuration);
    return true;
  } catch (error) {
    console.error("Error initializing session:", error);
    return false;
  }
};

const clearSession = async (userId) => {
  try {
    const key = `user:${userId}:lastActivity`;
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("Error clearing session:", error);
    return false;
  }
};

export { sessionTimeout, initializeSession, clearSession };
