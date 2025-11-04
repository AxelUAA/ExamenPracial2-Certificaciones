// back/routes/auth.js
const router = require("express").Router();
const { login, logout, doPayment } = require("../controllers/aut.controller");
const authRequired = require("../middleware/authRequired");

// ENDPOINTS
router.post("/login", login);
router.post("/logout", authRequired, logout);
router.post("/payment", authRequired, doPayment);

module.exports = router;
