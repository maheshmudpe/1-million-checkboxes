import { publisher, subscriber } from "../../common/config/redis.js";
import { REDIS_KEYS } from "../../common/constants/redisKeys.js";

export async function subscribeToCheckboxUpdates(io) {
  await subscriber.subscribe(REDIS_KEYS.checkboxUpdatesChannel, (message) => {
    const data = JSON.parse(message);
    io.emit("update", data);
  });
}

export async function publishCheckboxUpdate(payload) {
  await publisher.publish(
    REDIS_KEYS.checkboxUpdatesChannel,
    JSON.stringify(payload)
  );
}
