// Ruta base de tu backend (ajústala si usas otro puerto)
const API_URL = "http://localhost:3000/api";

// Exportamos la URL base para que otros módulos la usen
window.API_URL = API_URL;

// Helper sencillo para obtener certificaciones desde el backend.
// Explicación rápida:
// - Si el usuario inició sesión guardamos token en localStorage.session
// - Si existe token, lo enviamos en el header Authorization: Bearer <token>
// - Si la respuesta no es OK, intentamos leer el texto de error para ayudar al debug
async function getCertificaciones() {
  try {
    const headers = {};
    // Si ya guardamos sesión con { token, user } en localStorage
    const ses = JSON.parse(localStorage.getItem("session") || "null");
    if (ses?.token) headers["Authorization"] = `Bearer ${ses.token}`;

    const res = await fetch(`${API_URL}/certificaciones`, { headers });

    // Si el servidor responde con error, leemos el texto para mostrarlo o lanzarlo
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
