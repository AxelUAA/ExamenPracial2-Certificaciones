const path = require("path");
const { readJSON } = require("../utils/jsondb");

const SESSIONS_PATH = path.join(__dirname, "..", "data", "sessions.json");

module.exports = async function authRequired(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [scheme, token] = auth.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Authorization header inválido" });
    }
    const sessions = await readJSON(SESSIONS_PATH, []);
    const session = sessions.find(s => s.token === token);
    if (!session) return res.status(401).json({ error: "Token no válido" });

    req.userId = session.userId;
    next();
  } catch (err) {
    console.error("authRequired error:", err);
    res.status(500).json({ error: "Error de autenticación" });
  }
};
