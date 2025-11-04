const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

module.exports = function authRequired(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [scheme, token] = auth.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Authorization header inválido" });
    }

    // Verify JWT signature and extract payload
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Token no válido" });
    }

    req.userId = payload.userId;
    next();
  } catch (err) {
    console.error("authRequired error:", err);
    res.status(500).json({ error: "Error de autenticación" });
  }
};
