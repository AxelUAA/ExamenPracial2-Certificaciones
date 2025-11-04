// back/routes/certificate.js
const router = require("express").Router();
const authRequired = require("../authRequired");
const { downloadCert } = require("../controllers/cert.controller");

router.get("/download", authRequired, downloadCert);

module.exports = router;
