// back/controllers/cert.controller.js
const fs = require("fs");
const path = require("path");

const USERS_PATH = path.join(__dirname, "../data/users.json");
const CERTS_PATH = path.join(__dirname, "../data/certificaciones.json");

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));
}
function readCerts() {
  return JSON.parse(fs.readFileSync(CERTS_PATH, "utf8"));
}

// GET /api/cert/download?certId=1  (protegida)
async function downloadCert(req, res) {
  const { certId } = req.query || {};
  const users = readUsers();
  const user = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  const certs = readCerts();
  const cert = certs.find(c => String(c.id) === String(certId)) || certs[0];

  // Puedes agregar más validaciones aquí (pagoRealizado, examenPresentado, etc.)
  const today = new Date();
  const fecha = today.toLocaleDateString("es-MX");

  const html = `<!doctype html>
<html lang="es"><meta charset="utf-8">
<title>Certificado ${cert?.nombre || "Certificación"}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;margin:40px}
  .card{border:2px solid #222;padding:32px;border-radius:12px}
  h1{margin:0 0 8px}
  .meta{color:#555}
</style>
<div class="card">
  <h1>Certificado de ${cert?.nombre || "Certificación"}</h1>
  <p class="meta">Otorgado a:</p>
  <h2>${user.nameCom || user.cuenta}</h2>
  <p class="meta">Fecha: ${fecha}</p>
  <p>Este documento acredita que la persona ha cumplido con los requisitos de evaluación
  correspondientes a la certificación seleccionada.</p>
</div>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="certificado_${user.cuenta}.html"`);
  return res.status(200).send(html);
}

module.exports = { downloadCert };
