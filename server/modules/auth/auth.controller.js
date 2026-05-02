import {
  createAuthorizationCode,
  exchangeAuthorizationCode,
} from "./auth.service.js";

export function getOidcConfiguration(req, res) {
  const issuer = `${req.protocol}://${req.get("host")}`;

  res.json({
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    userinfo_endpoint: `${issuer}/oidc/userinfo`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["HS256"],
  });
}

export async function authorize(req, res, next) {
  try {
    const code = await createAuthorizationCode({
      username: req.body.username,
    });

    res.json({
      code,
      tokenUrl: "/oauth/token",
    });
  } catch (err) {
    next(err);
  }
}

export async function token(req, res, next) {
  try {
    const result = await exchangeAuthorizationCode({
      code: req.body.code,
      clientId: req.body.client_id,
    });

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export function userInfo(req, res) {
  res.json({
    sub: req.user.sub,
    username: req.user.username,
    name: req.user.username,
  });
}
