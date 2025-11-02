// Ruta base de tu backend (ajústala si usas otro puerto)
const API_URL = "http://localhost:3000/api";

// Obtener certificaciones del backend
async function getCertificaciones() {
  res = await fetch(`${API_URL}/certificaciones`);
  if (!res.ok) throw new Error("Error al obtener certificaciones");
  return res.json();
}
