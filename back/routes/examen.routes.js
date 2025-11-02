const express = require("express");
const router = express.Router();
const { iniciarExamen, enviarExamen } = require("../controllers/exam.controller");
const checkAuth = require("../middleware/authRequired");

// POST para iniciar el examen (Protegido)
// Primero verifica el auth, luego inicia el examen
router.post("/start", checkAuth, iniciarExamen);

// POST para enviar respuestas (Protegido)
router.post("/submit", checkAuth, enviarExamen);

module.exports = router;