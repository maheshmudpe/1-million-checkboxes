export const REDIS_KEYS = {
  checkboxBitmap: "checkboxes:bitmap",
  checkboxUpdatesChannel: "checkbox-updates",
  authCode: (code) => `auth:code:${code}`,
  rateLimit: (userId) => `rate:${userId}`,
};
