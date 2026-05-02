import { Router } from "express";
import {
  getCheckboxChunk,
  getCheckboxStats,
} from "./checkbox.service.js";
import { httpRateLimit } from "../../common/middleware/httpRateLimit.middleware.js";

const router = Router();

router.get(
  "/checkboxes",
  httpRateLimit({ scope: "checkbox-read", maxRequests: 120, windowSeconds: 60 }),
  async (req, res, next) => {
    try {
      res.json(
        await getCheckboxChunk({
          offset: req.query.offset,
          limit: req.query.limit,
        })
      );
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/checkboxes/stats",
  httpRateLimit({ scope: "checkbox-stats", maxRequests: 120, windowSeconds: 60 }),
  async (req, res, next) => {
    try {
      res.json(await getCheckboxStats());
    } catch (err) {
      next(err);
    }
  }
);

export default router;
