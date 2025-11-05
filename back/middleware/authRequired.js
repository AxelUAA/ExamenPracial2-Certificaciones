const sessions = require("../data/sessions");

module.exports = function authRequired(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [scheme, token] = auth.split(" ");
    
    // Log para debugging
    console.log('Auth header:', auth);
    console.log('Token received:', token);
    
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Authorization header inválido" });
    }

    // Buscar la sesión
    const session = sessions.findSession(token);
    console.log('Session found:', session);
    
    if (!session) {
      return res.status(401).json({ error: "Token no válido" });
    }

    req.userId = session.userId;
    next();
  } catch (err) {
    console.error("authRequired error:", err);
    res.status(500).json({ error: "Error de autenticación" });
  }
};
