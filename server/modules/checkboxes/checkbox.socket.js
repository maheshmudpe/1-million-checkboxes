import { Server } from "socket.io";
import { socketAuthMiddleware } from "../auth/auth.middleware.js";
import { getCheckboxStats, toggleCheckbox } from "./checkbox.service.js";
import { hitRateLimit } from "../../common/services/rateLimit.service.js";
import { publishCheckboxUpdate } from "./checkbox.pubsub.js";

const connectedUsers = new Map();

export function createSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use(socketAuthMiddleware);
  registerCheckboxSocket(io);

  return io;
}

function registerCheckboxSocket(io) {
  io.on("connection", async (socket) => {
    const user = socket.user;

    connectedUsers.set(socket.id, {
      socketId: socket.id,
      userId: user?.sub || null,
      username: user?.username || "anonymous",
      connectedAt: Date.now(),
    });

    console.log("User connected:", socket.id, user?.username || "anonymous");

    socket.emit("init", {
      ...(await getCheckboxStats()),
      authenticated: Boolean(user),
      user: user ? { sub: user.sub, username: user.username } : null,
      connectedUsers: connectedUsers.size,
    });

    io.emit("presence", { connectedUsers: connectedUsers.size });

    socket.on("toggle", async (payload) => {
      try {
        if (!socket.user) {
          socket.emit("toggle-rejected", {
            index: payload?.index,
            message: "Login required to change checkboxes",
          });
          return;
        }

        const limit = await hitRateLimit({
          key: `socket:toggle:${socket.user.sub}:${socket.id}`,
          maxRequests: 2,
          windowSeconds: 5,
        });

        if (limit.blocked) {
          socket.emit("rate-limit", {
            index: payload?.index,
            message: "Too many checkbox updates. Slow down.",
          });
          return;
        }

        const update = await toggleCheckbox(payload?.index);
        await publishCheckboxUpdate({
          ...update,
          updatedBy: socket.user.username,
        });
      } catch (err) {
        socket.emit("error-message", {
          index: payload?.index,
          message: err.message || "Unable to toggle checkbox",
        });
      }
    });

    socket.on("disconnect", () => {
      connectedUsers.delete(socket.id);
      io.emit("presence", { connectedUsers: connectedUsers.size });
      console.log("User disconnected:", socket.id);
    });
  });
}
