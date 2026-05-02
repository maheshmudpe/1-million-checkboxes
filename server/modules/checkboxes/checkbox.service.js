import redis from "../../common/config/redis.js";
import { env } from "../../common/config/env.js";
import { REDIS_KEYS } from "../../common/constants/redisKeys.js";

export async function initializeCheckboxes() {
  await redis.setBit(REDIS_KEYS.checkboxBitmap, env.checkboxCount - 1, 0);
}

export async function getCheckboxChunk({ offset = 0, limit = env.checkboxChunkSize }) {
  const normalizedOffset = clampNumber(offset, 0, env.checkboxCount - 1);
  const normalizedLimit = clampNumber(limit, 1, env.checkboxChunkSize);
  const end = Math.min(normalizedOffset + normalizedLimit, env.checkboxCount);
  const values = [];

  for (let index = normalizedOffset; index < end; index += 1) {
    values.push(Boolean(await redis.getBit(REDIS_KEYS.checkboxBitmap, index)));
  }

  return {
    offset: normalizedOffset,
    limit: values.length,
    total: env.checkboxCount,
    checkedCount: await getCheckedCount(),
    values,
  };
}

export async function getCheckboxStats() {
  return {
    total: env.checkboxCount,
    chunkSize: env.checkboxChunkSize,
    checkedCount: await getCheckedCount(),
  };
}

export async function toggleCheckbox(index) {
  const normalizedIndex = Number(index);

  if (
    !Number.isInteger(normalizedIndex) ||
    normalizedIndex < 0 ||
    normalizedIndex >= env.checkboxCount
  ) {
    throw new RangeError("Invalid checkbox index");
  }

  const value = Boolean(
    Number(
      await redis.sendCommand([
        "EVAL",
        "local current = redis.call('GETBIT', KEYS[1], ARGV[1]); local next = 1 - current; redis.call('SETBIT', KEYS[1], ARGV[1], next); return next",
        "1",
        REDIS_KEYS.checkboxBitmap,
        String(normalizedIndex),
      ])
    )
  );

  return {
    index: normalizedIndex,
    value,
    checkedCount: await getCheckedCount(),
  };
}

async function getCheckedCount() {
  return Number(await redis.bitCount(REDIS_KEYS.checkboxBitmap));
}

function clampNumber(value, min, max) {
  const number = Number(value);

  if (!Number.isFinite(number)) return min;

  return Math.min(Math.max(Math.trunc(number), min), max);
}
