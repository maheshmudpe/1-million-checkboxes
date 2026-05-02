import { verifyToken } from "./auth.service.js";

export function optionalHttpAuth(req, res, next) {
  const token = getBearerToken(req.headers.authorization);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

export function requireHttpAuth(req, res, next) {
  optionalHttpAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ message: "Login required" });
    }

    next();
  });
}

export function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    socket.user = null;
    return next();
  }

  try {
    socket.user = verifyToken(token);
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
}

function getBearerToken(header) {
  if (!header) return null;

  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" ? token : null;
}
