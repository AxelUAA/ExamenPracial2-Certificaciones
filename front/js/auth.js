// Asume que ya tienes en api.js una constante API_URL con tu back
// Ejemplo: const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const alertaDiv = document.getElementById("alerta");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cuenta = document.getElementById("cuenta").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cuenta, contrasena }),
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarAlerta("error", data.message || "Credenciales incorrectas 😢");
        return;
      }

      // Guardamos el token y usuario en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      mostrarAlerta("success", "✅ Acceso permitido. Redirigiendo...");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } catch (error) {
      mostrarAlerta("error", "Error al conectar con el servidor 🚨");
    }
  });

  function mostrarAlerta(tipo, mensaje) {
    alertaDiv.innerHTML = `
      <div class="alert ${tipo}">${mensaje}</div>
    `;
  }
});
