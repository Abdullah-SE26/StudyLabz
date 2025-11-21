import { getCache, setCache, delCache } from "./redisClient.js";
import redis from "./redisClient.js"; // 🔹 import the actual Redis client

/**
 * Generic function to cache Prisma queries
 * @param {string} key - Redis cache key
 * @param {Function} queryFn - Async function that returns Prisma query result
 * @param {number} ttlSeconds - TTL in seconds (default 2 minutes)
 */
export async function cachedQuery(key, queryFn, ttlSeconds = 120) {
  const cached = await getCache(key);
  if (cached) return cached;

  const result = await queryFn();
  await setCache(key, result, ttlSeconds);

  return result;
}

/**
 * Invalidate cache for a specific key or key pattern
 * @param {string} keyPattern
 */
export async function invalidateCache(keyPattern) {
  if (keyPattern.includes("*")) {
    // get all keys matching the pattern
    const keys = await redis.keys(keyPattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } else {
    await redis.del(keyPattern);
  }
}
