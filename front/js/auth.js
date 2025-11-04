// /front/js/auth.js
// Requiere que /front/js/api.js defina window.API_URL (ya lo tienes).

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("loginError");

  if (!form) return;

  // Al enviar el formulario de login hacemos una petición POST a /auth/login
  // Si es correcta, el backend devuelve { token, user } y lo guardamos en localStorage
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Leemos los valores del formulario (cuenta, contraseña y nombre de compañía opcional)
    const cuenta = document.getElementById("cuenta").value.trim();
    const contrasena = document.getElementById("password").value.trim();
    const nameCom = document.getElementById("nameCom").value.trim();

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cuenta, contrasena, nameCom }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Mostrar error recibido desde el servidor (si lo envió)
        errorEl.hidden = false;
        errorEl.textContent = data.error || "Credenciales incorrectas 😢";
        return;
      }

      // Guardamos la sesión para que otras partes del front (ui.js, api.js, etc.) la usen
      // Formato simple: localStorage.session = JSON.stringify({ token, user })
      localStorage.setItem("session", JSON.stringify({ token: data.token, user: data.user }));

      errorEl.hidden = false;
      errorEl.textContent = "✅ Acceso permitido. Redirigiendo…";
      // Redirige al inicio después de un momento para que el usuario vea el mensaje
      setTimeout(() => (window.location.href = "index.html"), 700);
    } catch {
      errorEl.hidden = false;
      errorEl.textContent = "Error al conectar con el servidor 🚨";
    }
  });
});
