// back/routes/certificate.js
const router = require("express").Router();
const authRequired = require("../middleware/authRequired");
const { downloadCert } = require("../controllers/cert.controller");

router.get("/download", authRequired, downloadCert);

module.exports = router;
