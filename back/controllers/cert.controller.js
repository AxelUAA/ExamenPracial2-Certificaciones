// back/controllers/cert.controller.js
const USERS = require("../data/users");
const CERTS = require("../data/certificaciones.json");
const PDFDocument = require("pdfkit");

function downloadCert(req, res) {
  try {
    const certId = Number(req.query.certId) || 1;
    const user = USERS.find(u => u.id === req.userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Si quieres exigir pago antes de descargar, descomenta:
    // if (!user.pagoRealizado) return res.status(403).json({ error: "Pago pendiente" });

    const cert = CERTS.find(c => c.id === certId) || CERTS[0];
    const fecha = new Date().toLocaleDateString("es-MX");

    // Generar PDF en el backend usando PDFKit
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    // Cabeceras para descarga
    res.setHeader("Content-Type", "application/pdf");
    const filename = `certificado_${user.cuenta}.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Pipe PDF al response
    doc.pipe(res);

    // Diseño sencillo del certificado
    doc
      .fontSize(20)
      .text(cert?.nombre || "Certificación", { align: "center" })
      .moveDown(1.5);

    doc
      .fontSize(14)
      .text(`Otorgado a:`, { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(22)
      .text(user.nameCom || user.cuenta, { align: "center", underline: true })
      .moveDown(1);

    doc
      .fontSize(12)
      .text(`Fecha: ${fecha}`, { align: "center" })
      .moveDown(2);

    doc
      .fontSize(11)
      .text(`Este documento certifica que la persona ha cumplido con los requisitos de evaluación para la certificación "${cert?.nombre || "Certificación"}".`, {
        align: "center",
        indent: 20,
        height: 300,
        ellipsis: true
      })
      .moveDown(3);

    // Espacio para firma (simple)
    const signatureY = doc.y + 40;
    doc.moveTo(120, signatureY).lineTo(360, signatureY).stroke();
    doc.text("Firma del instructor", 120, signatureY + 6);

    // Finalizar PDF
    doc.end();

    // No return res because stream is piped
  } catch (e) {
    console.error("cert download error:", e);
    return res.status(500).json({ error: "No se pudo generar el certificado" });
  }
}

module.exports = { downloadCert };
