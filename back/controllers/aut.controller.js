
const crypto = require("crypto");
const { readJson, writeJsonAtomic } = require("../utils/fileUtil");
const path = require("path");
const USERS = require("../data/users");      
const SESSIONS = require("../data/sessions"); 

const USERS_FILE_PATH = path.join(__dirname, "../data/users.json");

// POST /api/auth/login
const login = (req, res) => {
  try {
    const { cuenta, contrasena, nameCom } = req.body || {};
    console.log("Acceso a /api/auth/login:", cuenta);

    if (!cuenta || !contrasena || !nameCom) {
      return res.status(400).json({ error: "Faltan credenciales o nombre completo" });
    }

    const user = USERS.find(u => u.cuenta === cuenta && u.contrasena === contrasena);
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Actualizar el nombre completo del usuario
    user.nameCom = nameCom;

    const token = crypto.randomUUID();
    SESSIONS.push({ token, userId: user.id, createdAt: Date.now() });

    // Devuelve SOLO lo necesario al front
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        cuenta: user.cuenta,
        nameCom: user.nameCom || "",
        pagoRealizado: user.pagoRealizado,
        examenPresentado: user.examenPresentado
      }
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// POST /api/auth/logout  
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
    const users = readJson(USERS_FILE_PATH);
    const userIndex = users.findIndex(u => u.id === req.userId);
    
    if (userIndex === -1) return res.status(404).json({ error: "Usuario no encontrado" });
    
    if (users[userIndex].pagoRealizado) {
      return res.status(400).json({ error: "El pago ya estaba registrado" });
    }

    users[userIndex].pagoRealizado = true;
    writeJsonAtomic(USERS_FILE_PATH, users);
    
    console.log(`Pago registrado para userId=${req.userId}`);
    return res.json({ ok: true, userId: req.userId });
  } catch (e) {
    console.error("payment error:", e);
    return res.status(500).json({ error: "Error al registrar pago" });
  }
}

module.exports = { login, logout, doPayment };
