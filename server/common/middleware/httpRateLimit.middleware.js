import { hitRateLimit } from "../services/rateLimit.service.js";

export function httpRateLimit({
  scope,
  maxRequests = 60,
  windowSeconds = 60,
} = {}) {
  return async (req, res, next) => {
    try {
      const identity = req.user?.sub || req.ip || "anonymous";
      const result = await hitRateLimit({
        key: `http:${scope || req.path}:${identity}`,
        maxRequests,
        windowSeconds,
      });

      res.setHeader("X-RateLimit-Limit", result.limit);
      res.setHeader("X-RateLimit-Remaining", result.remaining);

      if (result.blocked) {
        return res.status(429).json({
          message: "Too many requests",
          windowSeconds: result.windowSeconds,
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
