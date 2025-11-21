import redis from "./redisClient.js";
import { getCache, setCache } from "./redisClient.js";

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

  // Track this key for easier invalidation later
  await redis.sadd("cacheKeys", key);

  return result;
}

/**
 * Invalidate cache for a specific key or pattern
 * Uses a Redis Set to track all cache keys reliably
 * @param {string} keyPattern
 */
export async function invalidateCache(keyPattern) {

  // Get all keys from our tracking set
  const allKeys = await redis.smembers("cacheKeys");
  if (!allKeys || allKeys.length === 0) {
    return;
  }

  // Filter keys that match the pattern (supporting '*' wildcard)
  const regex = new RegExp("^" + keyPattern.replace(/\*/g, ".*") + "$");
  const keysToDelete = allKeys.filter((k) => regex.test(k));

  if (keysToDelete.length === 0) {
    return;
  }
  await redis.del(...keysToDelete);
  // Remove deleted keys from tracking set
  await redis.srem("cacheKeys", ...keysToDelete);
}
