// back/controllers/aut.controller.js
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const USERS = require("../data/users");
// secret for signing JWTs; in production use env var
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

// POST /api/auth/login
const login = (req, res) => {
  try {
    const { cuenta, contrasena } = req.body || {};
    console.log("Acceso a /api/auth/login:", cuenta);

    if (!cuenta || !contrasena) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    const user = USERS.find(u => u.cuenta === cuenta && u.contrasena === contrasena);
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Create a signed JWT instead of an in-memory session token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "8h" });

    // Devuelve SOLO lo necesario al front, siguiendo tu estilo
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        cuenta: user.cuenta,
        nameCom: user.nameCom || "",
        pagoRealizado: !!user.pagoRealizado,
        examenPresentado: !!user.examenPresentado
      }
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// POST /api/auth/logout  (opcional ya desde el punto 1; si prefieres lo vemos en el 2)
const logout = (req, res) => {
  // With JWT we can't invalidate existing tokens server-side without a blacklist.
  // For simplicity, just respond OK and let the client remove token from localStorage.
  try {
    console.log("Acceso a /api/auth/logout");
    return res.status(200).json({ message: "Sesión cerrada" });
  } catch (err) {
    console.error("logout error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// POST /api/auth/payment  (requiere token)
function doPayment(req, res) {
  try {
    // authRequired ya colocó req.userId
    const user = USERS.find(u => u.id === req.userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (user.pagoRealizado) {
      return res.status(400).json({ error: "El pago ya estaba registrado" });
    }

    user.pagoRealizado = true; // solo en memoria (como trabajas el resto)
    console.log(`Pago registrado para userId=${user.id}`);
    return res.json({ ok: true, userId: user.id });
  } catch (e) {
    console.error("payment error:", e);
    return res.status(500).json({ error: "Error al registrar pago" });
  }
}

module.exports = { login, logout, doPayment };
