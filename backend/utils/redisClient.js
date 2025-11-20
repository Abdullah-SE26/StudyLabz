import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

/** Get cached value */
export async function getCache(key) {
  const data = await redis.get(key);
  return data ?? null; // Upstash already parses JSON automatically
}

/** Set cache with TTL */
export async function setCache(key, value, ttlSeconds = 600) {
  await redis.set(key, value, { ex: ttlSeconds });
}

/** Delete cache key */
export async function delCache(key) {
  await redis.del(key);
}

export default redis;
