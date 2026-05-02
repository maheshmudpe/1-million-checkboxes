import fs from "fs";
import path from "path";

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

export const env = {
  port: process.env.PORT || 5000,
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  jwtSecret: process.env.JWT_SECRET || "mysecret",
  checkboxCount: Number(process.env.CHECKBOX_COUNT || 1000000),
  checkboxChunkSize: Number(process.env.CHECKBOX_CHUNK_SIZE || 500),
  oauthClientId: process.env.OAUTH_CLIENT_ID || "checkbox-web-client",
  oauthIssuer:
    process.env.OAUTH_ISSUER || `http://localhost:${process.env.PORT || 5000}`,
};
