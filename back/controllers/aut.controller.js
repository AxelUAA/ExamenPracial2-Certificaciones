// back/controllers/authCtrl.js
const crypto = require("crypto");
const USERS = require("../data/users");
const SESSIONS = require("../data/sessions"); // ← ahora es un arreglo []
const PAYMENTS = require("../data/payments");

// POST /api/auth/login
async function login(req, res) {
  const { cuenta, contrasena } = req.body || {};
  const user = USERS.find(u => u.cuenta === cuenta && u.password === password);
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const token = crypto.randomUUID();

  // Guardar sesión en el ARREGLO
  SESSIONS.push({ token, userId: user.id, createdAt: Date.now() });

  const userPublic = {
    id: user.id,
    cuenta: user.cuenta,
    nombreCompleto: user.nombreCompleto,
    pagoRealizado: user.pagoRealizado,
    examenPresentado: user.examenPresentado
  };

  return res.json({ token, user: userPublic });
}

// POST /api/auth/logout (protegida)
async function logout(req, res) {
  const auth = req.headers.authorization || "";
  const token = auth.split(" ")[1];

  if (token) {
    const idx = SESSIONS.findIndex(s => s.token === token);
    if (idx !== -1) SESSIONS.splice(idx, 1); // eliminar la sesión
  }

  return res.json({ ok: true, message: "Sesión cerrada" });
}

// POST /api/auth/payment (protegida)
async function doPayment(req, res) {
  const user = USERS.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  if (user.pagoRealizado) {
    return res.status(400).json({ error: "El pago ya fue registrado" });
  }
  user.pagoRealizado = true;
  PAYMENTS.push({ id: crypto.randomUUID(), userId: user.id, at: Date.now(), monto: 199 });
  return res.json({ ok: true, message: "Pago registrado", userId: user.id });
}

module.exports = { login, logout, doPayment };
