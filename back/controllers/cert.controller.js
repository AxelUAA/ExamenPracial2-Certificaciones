// back/controllers/cert.controller.js
const USERS = require("../data/users");
const CERTS = require("../data/certificaciones.json");

function downloadCert(req, res) {
  try {
    const certId = Number(req.query.certId) || 1;
    const user = USERS.find(u => u.id === req.userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Si quieres exigir pago antes de descargar, descomenta:
    // if (!user.pagoRealizado) return res.status(403).json({ error: "Pago pendiente" });

    const cert = CERTS.find(c => c.id === certId) || CERTS[0];
    const fecha = new Date().toLocaleDateString("es-MX");

    const html = `<!doctype html><html lang="es"><meta charset="utf-8">
<title>Certificado ${cert?.nombre || "Certificación"}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;margin:40px}
  .card{border:2px solid #222;padding:32px;border-radius:12px;max-width:800px}
  h1{margin:0 0 8px}.meta{color:#555}
</style>
<div class="card">
  <h1>Certificado de ${cert?.nombre || "Certificación"}</h1>
  <p class="meta">Otorgado a:</p>
  <h2>${user.nameCom || user.cuenta}</h2>
  <p class="meta">Fecha: ${fecha}</p>
  <p>Este documento acredita que la persona ha cumplido con los requisitos de evaluación
  correspondientes a la certificación seleccionada.</p>
</div></html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="certificado_${user.cuenta}.html"`);
    return res.status(200).send(html);
  } catch (e) {
    console.error("cert download error:", e);
    return res.status(500).json({ error: "No se pudo generar el certificado" });
  }
}

module.exports = { downloadCert };
