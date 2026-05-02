import http from "http";
import { createApp } from "./app.js";
import { env } from "./common/config/env.js";
import { connectRedis } from "./common/config/redis.js";
import { initializeCheckboxes } from "./modules/checkboxes/checkbox.service.js";
import { createSocketServer } from "./modules/checkboxes/checkbox.socket.js";
import { subscribeToCheckboxUpdates } from "./modules/checkboxes/checkbox.pubsub.js";

const app = createApp();
const server = http.createServer(app);
const io = createSocketServer(server);

await connectRedis();
await initializeCheckboxes();
await subscribeToCheckboxUpdates(io);

server.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
