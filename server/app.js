import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./modules/auth/auth.routes.js";
import checkboxRoutes from "./modules/checkboxes/checkbox.routes.js";
import { errorHandler } from "./common/utils/errorHandler.js";

export function createApp() {
  const app = express();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientPath = path.resolve(__dirname, "../client");

  app.use(cors());
  app.use(express.json());
  app.use(express.static(clientPath));

  app.use(authRoutes);
  app.use(checkboxRoutes);
  app.use(errorHandler);

  return app;
}
