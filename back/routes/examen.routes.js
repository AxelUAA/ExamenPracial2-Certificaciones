const express = require("express");
const router = express.Router();
const { iniciarExamen, enviarExamen } = require("../controllers/exam.controller");

// POST para iniciar el examen
router.post("/start", iniciarExamen);

// POST para enviar respuestas
router.post("/submit", enviarExamen);

module.exports = router;