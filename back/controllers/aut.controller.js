// back/controllers/aut.controller.js
const crypto = require("crypto");
const USERS = require("../data/users");      // <- carga users.json (Node resuelve .json)
const SESSIONS = require("../data/sessions"); // <- arreglo en memoria (sessions.js)

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

    const token = crypto.randomUUID();
    SESSIONS.push({ token, userId: user.id, createdAt: Date.now() });

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
  try {
    console.log("Acceso a /api/auth/logout");
    const auth = req.headers.authorization || "";
    const [scheme, token] = auth.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Authorization header inválido" });
    }
    const idx = SESSIONS.findIndex(s => s.token === token);
    if (idx >= 0) SESSIONS.splice(idx, 1);
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
