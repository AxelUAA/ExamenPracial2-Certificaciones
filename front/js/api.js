// Ruta base de tu backend (ajústala si usas otro puerto)
const API_URL = "http://localhost:3000/api";

// Obtener certificaciones del backend (con manejo de token/errores)
async function getCertificaciones() {
  try {
    const headers = {};
    // Si ya guardamos sesión con { token, user } en localStorage
    const ses = JSON.parse(localStorage.getItem("session") || "null");
    if (ses?.token) headers["Authorization"] = `Bearer ${ses.token}`;

    const res = await fetch(`${API_URL}/certificaciones`, { headers });

    // Lee texto por si el backend devuelve error legible
    if (!res.ok) {
      const maybeText = await res.text().catch(() => "");
      throw new Error(maybeText || "Error al obtener certificaciones");
    }
    return await res.json();
  } catch (err) {
    console.error("[getCertificaciones]", err);
    throw err;
  }
}
