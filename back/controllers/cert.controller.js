// back/controllers/cert.controller.js
const USERS = require("../data/users");
const CERTS = require("../data/certificaciones.json");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function downloadCert(req, res) {
  try {
    const certId = Number(req.query.certId) || 1;
    const user = USERS.find(u => u.id === req.userId);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

      // Verificar que el usuario haya aprobado el examen antes de permitir descarga
      // Si la propiedad 'aprobado' no existe o es false, denegamos la descarga
      if (!user.aprobado) {
        return res.status(403).json({ error: 'No autorizado: no aprobaste el examen, no puedes descargar el certificado.' });
      }

    const cert = CERTS.find(c => c.id === certId) || CERTS[0];
    const fecha = new Date().toLocaleDateString("es-MX");

    // Preparar PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Cabeceras para descarga
    res.setHeader("Content-Type", "application/pdf");
    const filename = `certificado_${user.cuenta}.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Pipe PDF al response
    doc.pipe(res);

    // Paths relativos a la carpeta del repo (back/controllers -> ../../front/img/imagenes)
    const logoPath = path.join(__dirname, "..", "..", "front", "img", "imagenes", "logoDevBadge.png");
    const instrSig = path.join(__dirname, "..", "..", "front", "img", "imagenes", "firma-instructor.png");
    const ceoSig = path.join(__dirname, "..", "..", "front", "img", "imagenes", "firma-ceo.png");

    // Agregar logo si existe
    if (fs.existsSync(logoPath)) {
      try { doc.image(logoPath, 50, 45, { width: 100 }); } catch(e) { /* ignore image errors */ }
    }

    // Título
    doc
      .fontSize(22)
      .text(cert?.nombre || "Certificación", { align: "center" })
      .moveDown(1.5);

    doc
      .fontSize(12)
      .text("Otorgado a:", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(20)
      .text(user.nameCom || user.cuenta, { align: "center", underline: true })
      .moveDown(1);

    doc
      .fontSize(12)
      .text(`Fecha: ${fecha}`, { align: "center" })
      .moveDown(0.5)
      .text("Ciudad: Aguascalientes, Ags.", { align: "center" })
      .moveDown(1);

    doc
      .fontSize(11)
      .text(`Este documento certifica que la persona ha cumplido con los requisitos de evaluación para la certificación \"${cert?.nombre || "Certificación"}\".`, {
        align: "center",
        indent: 20,
        ellipsis: true
      })
      .moveDown(3);

    // Firmas
    const startY = doc.y;
    const leftX = 100;
    const rightX = 350;

    if (fs.existsSync(instrSig)) {
      try { doc.image(instrSig, leftX, startY, { width: 100 }); } catch(e) {}
    }
    doc.moveTo(leftX, startY + 70).lineTo(leftX + 120, startY + 70).stroke();
    doc.fontSize(10).text('Ing. Juan Daniel A. V.', leftX, startY + 75, { width: 120, align: 'center' });
    doc.fontSize(9).text('Instructor Principal', leftX, startY + 90, { width: 120, align: 'center' });

    if (fs.existsSync(ceoSig)) {
      try { doc.image(ceoSig, rightX, startY, { width: 100 }); } catch(e) {}
    }
    doc.moveTo(rightX, startY + 70).lineTo(rightX + 120, startY + 70).stroke();
    doc.fontSize(10).text('Ing. Jean Puentes P. P.', rightX, startY + 75, { width: 120, align: 'center' });
    doc.fontSize(9).text('CEO DevBadge', rightX, startY + 90, { width: 120, align: 'center' });

    // Footer
    doc.fontSize(8).text('Este certificado verifica la finalización exitosa del programa de certificación y las competencias demostradas por el titular.', 50, doc.page.height - 50, { align: 'center', width: doc.page.width - 100 });

    doc.end();

    // no return porque el stream se envía
  } catch (e) {
    console.error("cert download error:", e);
    return res.status(500).json({ error: "No se pudo generar el certificado" });
  }
}

module.exports = { downloadCert };
