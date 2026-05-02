import { createClient } from "redis";
import { env } from "./env.js";

const redis = createClient({
  url: env.redisUrl,
});

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});

const publisher = redis.duplicate();
const subscriber = redis.duplicate();

export async function connectRedis() {
  await redis.connect();
  await publisher.connect();
  await subscriber.connect();

  console.log("Redis connected (main + pub/sub)");
}

export { publisher, subscriber };
export default redis;
