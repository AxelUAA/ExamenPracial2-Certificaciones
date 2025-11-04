// back/routes/auth.js
const router = require("express").Router();
const { login, logout, doPayment } = require("../controllers/aut.controller");

// Si tu middleware está en back/middleware/authRequired.js usa esta ruta:
const authRequired = require("../middleware/authRequired");

// ENDPOINTS
router.post("/login", login);
// logout puede ir protegido (recomendado) para validar el mismo token
router.post("/logout", authRequired, logout);

router.post("/payment", authRequired, doPayment);

module.exports = router;
