const express = require("express");
const router = express.Router();
const { getCertificaciones, saveContact } = require("../controllers/other.controller");

// Ruta pública para obtener todas las certificaciones
router.get("/certificaciones", getCertificaciones);

// Ruta pública para guardar mensajes de contacto
router.post("/contact", saveContact);

module.exports = router;