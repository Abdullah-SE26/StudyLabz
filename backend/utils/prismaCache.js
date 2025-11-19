import { getCache, setCache, delCache } from "./redisClient.js";

/**
 * Generic function to cache Prisma queries
 * @param {string} key - Redis cache key
 * @param {Function} queryFn - Async function that returns Prisma query result
 * @param {number} ttlSeconds - TTL in seconds (default 2 minutes)
 */
export async function cachedQuery(key, queryFn, ttlSeconds = 120) {
  // 1️⃣ Try Redis first
  const cached = await getCache(key);
  if (cached) return cached;

  // 2️⃣ Execute the query
  const result = await queryFn();

  // 3️⃣ Save to Redis
  await setCache(key, result, ttlSeconds);

  return result;
}

/**
 * Invalidate cache for a specific key
 * @param {string} key
 */
export async function invalidateCache(key) {
  await delCache(key);
}
