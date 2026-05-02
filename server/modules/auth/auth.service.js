import crypto from "crypto";
import jwt from "jsonwebtoken";
import redis from "../../common/config/redis.js";
import { env } from "../../common/config/env.js";
import { REDIS_KEYS } from "../../common/constants/redisKeys.js";

const AUTH_CODE_TTL_SECONDS = 120;
const ACCESS_TOKEN_TTL = "1h";

export async function createAuthorizationCode({ username }) {
  const normalizedUsername = String(username || "").trim();

  if (!normalizedUsername) {
    throw new Error("Username is required");
  }

  const user = {
    sub: crypto
      .createHash("sha256")
      .update(normalizedUsername)
      .digest("hex")
      .slice(0, 16),
    username: normalizedUsername,
  };

  const code = crypto.randomBytes(24).toString("hex");

  await redis.set(REDIS_KEYS.authCode(code), JSON.stringify(user), {
    EX: AUTH_CODE_TTL_SECONDS,
  });

  return code;
}

export async function exchangeAuthorizationCode({ code, clientId }) {
  if (clientId !== env.oauthClientId) {
    throw new Error("Invalid OAuth client");
  }

  const key = REDIS_KEYS.authCode(code);
  const data = await redis.get(key);

  if (!data) {
    throw new Error("Invalid or expired authorization code");
  }

  await redis.del(key);

  const user = JSON.parse(data);

  return {
    access_token: generateAccessToken(user),
    id_token: generateIdToken(user),
    token_type: "Bearer",
    expires_in: 3600,
    user,
  };
}

export function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.sub,
      username: user.username,
      scope: "checkboxes:read checkboxes:write",
    },
    env.jwtSecret,
    {
      expiresIn: ACCESS_TOKEN_TTL,
      issuer: env.oauthIssuer,
      audience: env.oauthClientId,
    }
  );
}

export function generateIdToken(user) {
  return jwt.sign(
    {
      sub: user.sub,
      username: user.username,
      name: user.username,
    },
    env.jwtSecret,
    {
      expiresIn: ACCESS_TOKEN_TTL,
      issuer: env.oauthIssuer,
      audience: env.oauthClientId,
    }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret, {
    issuer: env.oauthIssuer,
    audience: env.oauthClientId,
  });
}
