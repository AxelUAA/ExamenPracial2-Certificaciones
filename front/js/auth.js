// /front/js/auth.js
// Requiere que /front/js/api.js defina window.API_URL (ya lo tienes).

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorEl = document.getElementById("loginError");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cuenta = document.getElementById("cuenta").value.trim();
    const contrasena = document.getElementById("password").value.trim();

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cuenta, contrasena }),
      });
      const data = await res.json();

      if (!res.ok) {
        errorEl.hidden = false;
        errorEl.textContent = data.error || "Credenciales incorrectas 😢";
        return;
      }

      // Guarda sesión con el formato que usa el resto del front: { token, user }
      localStorage.setItem("session", JSON.stringify({ token: data.token, user: data.user }));

      errorEl.hidden = false;
      errorEl.textContent = "✅ Acceso permitido. Redirigiendo…";
      setTimeout(() => (window.location.href = "index.html"), 700);
    } catch {
      errorEl.hidden = false;
      errorEl.textContent = "Error al conectar con el servidor 🚨";
    }
  });
});
