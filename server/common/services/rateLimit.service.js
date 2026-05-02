import redis from "../config/redis.js";
import { REDIS_KEYS } from "../constants/redisKeys.js";

export async function hitRateLimit({ key, maxRequests, windowSeconds }) {
  const count = await redis.incr(REDIS_KEYS.rateLimit(key));

  if (count === 1) {
    await redis.expire(REDIS_KEYS.rateLimit(key), windowSeconds);
  }

  return {
    blocked: count > maxRequests,
    remaining: Math.max(maxRequests - count, 0),
    limit: maxRequests,
    windowSeconds,
  };
}
