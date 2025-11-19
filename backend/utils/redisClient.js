import { Redis } from "@upstash/redis";

// Initialize Redis from environment variables
const redis = Redis.fromEnv();

/**
 * Get a value from Redis and parse JSON
 */
export async function getCache(key) {
  const data = await redis.get(key);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Set a value in Redis with TTL in seconds
 */
export async function setCache(key, value, ttlSeconds = 600) {
  const str = JSON.stringify(value);
  await redis.set(key, str);
  await redis.expire(key, ttlSeconds);
}

/**
 * Delete a cache key
 */
export async function delCache(key) {
  await redis.del(key);
}

export default redis;
