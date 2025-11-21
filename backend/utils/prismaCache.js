import redis from "./redisClient.js";
import { getCache, setCache } from "./redisClient.js";

/**
 * Get cache version for a pattern - used to invalidate all related caches
 */
async function getCacheVersion(pattern) {
  const versionKey = `cacheVersion:${pattern}`;
  const version = await redis.get(versionKey);
  return version ? Number(version) : 0;
}

/**
 * Increment cache version for a pattern - invalidates all related caches
 * Returns the new version number
 * Redis INCR is atomic, so this is reliable
 */
async function incrementCacheVersion(pattern) {
  const versionKey = `cacheVersion:${pattern}`;
  const newVersion = await redis.incr(versionKey);
  return newVersion;
}

/**
 * Generic function to cache Prisma queries
 * @param {string} key - Redis cache key
 * @param {Function} queryFn - Async function that returns Prisma query result
 * @param {number} ttlSeconds - TTL in seconds (default 2 minutes)
 * @param {string} versionPattern - Pattern to use for cache versioning (optional)
 */
export async function cachedQuery(
  key,
  queryFn,
  ttlSeconds = 120,
  versionPattern = null
) {
  // If version pattern is provided, check cache version
  if (versionPattern) {
    const initialVersion = await getCacheVersion(versionPattern);
    const cachedVersionKey = `${key}:v${initialVersion}`;
    const cached = await getCache(cachedVersionKey);
    if (cached) {
      // Double-check version hasn't changed (defense against race conditions)
      const currentVersion = await getCacheVersion(versionPattern);
      if (currentVersion === initialVersion) {
        return cached;
      }
      // Version changed, cache is stale, continue to fetch fresh data
    }

    const result = await queryFn();

    // Re-check version right before caching
    const finalVersion = await getCacheVersion(versionPattern);
    const finalCacheKey = `${key}:v${finalVersion}`;

    // Cache with the latest version
    await setCache(finalCacheKey, result, ttlSeconds);
    await redis.sadd("cacheKeys", finalCacheKey);

    return result;
  }

  // Original behavior for backward compatibility
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
 * Uses both tracking set and direct Redis key matching for reliability
 * Also uses cache versioning for instant invalidation
 * @param {string} keyPattern
 */
export async function invalidateCache(keyPattern) {
  try {
    // Strategy 1: Increment cache version for instant invalidation
    // This makes all cached queries with this pattern immediately stale
    // Extract the base pattern (e.g., "questions" from "questions:*" or "question:123")
    let basePattern = keyPattern.split(":")[0];

    // Handle specific patterns
    if (keyPattern.startsWith("question:") && !keyPattern.includes("*")) {
      // Specific question like "question:123" -> use "question" pattern
      basePattern = "question";
    } else if (keyPattern.startsWith("courseQuestions:")) {
      // Course questions pattern -> use "courseQuestions" pattern
      basePattern = "courseQuestions";
    } else if (keyPattern.startsWith("userBookmarks:")) {
      // User bookmarks pattern -> use "userBookmarks" pattern
      basePattern = "userBookmarks";
    }

    if (basePattern) {
      // Increment cache version - this makes all cached data with this pattern immediately stale
      // Redis INCR is atomic, so this is immediately effective
      await incrementCacheVersion(basePattern);
    }

    // Strategy 2: Delete actual cache keys (cleanup)
    // Method 1: Get keys from tracking set (primary method)
    const trackedKeys = await redis.smembers("cacheKeys");
    const regex = new RegExp("^" + keyPattern.replace(/\*/g, ".*") + "$");
    const keysFromTracking = (trackedKeys || []).filter((k) => regex.test(k));

    // Method 2: Try to get keys directly from Redis using pattern matching
    // This is a fallback in case the tracking set is out of sync
    let keysFromRedis = [];
    try {
      // Upstash Redis may support keys() - try it, but don't fail if it doesn't
      if (typeof redis.keys === "function") {
        keysFromRedis = (await redis.keys(keyPattern)) || [];
      }
    } catch (err) {
      // If keys() is not available or fails, that's okay - we'll use tracking set
    }

    // Combine both sets and remove duplicates
    const allKeysToDelete = [
      ...new Set([...keysFromTracking, ...keysFromRedis]),
    ];

    // Also delete any versioned keys that match the pattern (all versions)
    // This ensures old versioned cache keys are removed
    if (basePattern) {
      try {
        // Try to find and delete all versioned keys for this pattern
        // Pattern: {originalKey}:v{anyVersion}
        const versionedKeyPattern = `${keyPattern.replace(/\*/g, "*")}:v*`;
        let versionedKeys = [];
        try {
          if (typeof redis.keys === "function") {
            versionedKeys = (await redis.keys(versionedKeyPattern)) || [];
          }
        } catch (err) {
          // keys() might not be available, that's okay
        }

        // Also check tracking set for versioned keys
        const versionedFromTracking = (trackedKeys || []).filter(
          (k) => k.includes(`:v`) && regex.test(k.replace(/:v\d+$/, ""))
        );

        const allVersionedKeys = [
          ...new Set([...versionedKeys, ...versionedFromTracking]),
        ];
        if (allVersionedKeys.length > 0) {
          allKeysToDelete.push(...allVersionedKeys);
        }
      } catch (err) {
        // If versioned key deletion fails, continue anyway
      }
    }

    // Delete all matching keys from Redis (cleanup, but versioning is the primary mechanism)
    const uniqueKeysToDelete = [...new Set(allKeysToDelete)];
    if (uniqueKeysToDelete.length > 0) {
      const deletePromises = [];

      // Delete keys in batches if there are many (some Redis implementations have limits)
      const batchSize = 100;
      for (let i = 0; i < uniqueKeysToDelete.length; i += batchSize) {
        const batch = uniqueKeysToDelete.slice(i, i + batchSize);
        deletePromises.push(redis.del(...batch));
      }

      // Also remove from tracking set
      deletePromises.push(redis.srem("cacheKeys", ...uniqueKeysToDelete));

      // Wait for all deletions to complete (but don't block on this)
      Promise.all(deletePromises).catch((err) => {
        console.error("Error during cache cleanup:", err);
      });
    }
  } catch (err) {
    console.error("Error invalidating cache:", err);
    // Don't throw - cache invalidation failure shouldn't break the request
  }
}
