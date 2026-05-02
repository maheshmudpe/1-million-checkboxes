import { Router } from "express";
import {
  authorize,
  getOidcConfiguration,
  token,
  userInfo,
} from "./auth.controller.js";
import { optionalHttpAuth, requireHttpAuth } from "./auth.middleware.js";
import { httpRateLimit } from "../../common/middleware/httpRateLimit.middleware.js";

const router = Router();

router.get("/.well-known/openid-configuration", getOidcConfiguration);
router.post(
  "/oauth/authorize",
  httpRateLimit({ scope: "oauth-authorize", maxRequests: 10, windowSeconds: 60 }),
  authorize
);
router.post(
  "/oauth/token",
  httpRateLimit({ scope: "oauth-token", maxRequests: 20, windowSeconds: 60 }),
  token
);
router.get("/oidc/userinfo", requireHttpAuth, userInfo);

router.post("/login", optionalHttpAuth, async (req, res, next) => {
  try {
    await authorize(req, res, next);
  } catch (err) {
    next(err);
  }
});

export default router;
