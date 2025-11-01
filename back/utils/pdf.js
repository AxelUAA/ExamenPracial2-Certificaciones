function escapePDFText(s = "") {
  return String(s).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPDFBuffer({ title = "CERTIFICADO", lines = [] } = {}) {
  const yStart = 770, lineGap = 20;
  let content = "BT\n";
  content += "/F1 24 Tf\n";
  content += `1 0 0 1 72 ${yStart} Tm\n(${escapePDFText(title)}) Tj\n`;
  content += "/F1 12 Tf\n";
  let y = yStart - 40;
  for (const line of lines) {
    content += `1 0 0 1 72 ${y} Tm\n(${escapePDFText(line)}) Tj\n`;
    y -= lineGap;
  }
  content += "ET\n";

  const len = Buffer.byteLength(content, "utf8");
  const objects = [];
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);
  objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n`);
  objects.push(`4 0 obj\n<< /Length ${len} >>\nstream\n${content}endstream\nendobj\n`);
  objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  let pos = Buffer.byteLength(pdf, "utf8");
  for (const obj of objects) { offsets.push(pos); pdf += obj; pos += Buffer.byteLength(obj, "utf8"); }
  const xrefStart = pos; const total = objects.length + 1;
  pdf += `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let i = 1; i < total; i++) pdf += `${String(offsets[i]).padStart(10,"0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

function generateCertificatePDF(res, { user, cert, attempt }) {
  const title = "CERTIFICADO DE APROBACIÓN";
  const lines = [
    `Se otorga a: ${user.nameCom || user.cuenta}`,
    `Certificación: ${cert.nombre}`,
    `Fecha: ${new Date(attempt.finishedAt || Date.now()).toLocaleString()}`,
    `Folio intento: ${attempt.id}`,
    `Calificación: ${attempt.calificacion}/${attempt.total} (${attempt.porcentaje}%)`,
    `Resultado: ${attempt.aprobado ? "APROBADO" : "NO APROBADO"}`
  ];
  const buf = buildPDFBuffer({ title, lines });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=cert_${attempt.id}.pdf`);
  res.end(buf);
}

module.exports = { generateCertificatePDF };
