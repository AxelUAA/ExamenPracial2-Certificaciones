const SESSIONS = require("../data/sessions");

module.exports = function authRequired(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [scheme, token] = auth.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Authorization header inválido" });
    }

    // Las sesiones están en memoria en `back/data/sessions.js` (exporta un arreglo)
    const session = SESSIONS.find(s => s.token === token);
    if (!session) return res.status(401).json({ error: "Token no válido" });

    req.userId = session.userId;
    next();
  } catch (err) {
    console.error("authRequired error:", err);
    res.status(500).json({ error: "Error de autenticación" });
  }
};
