// /front/js/ui.js
document.addEventListener("DOMContentLoaded", () => {
  const slot = document.getElementById("nav-auth");
  if (!slot) return;

  // Parse session safely
  let ses = null;
  try {
    ses = JSON.parse(localStorage.getItem("session") || "null");
  } catch (err) {
    ses = null;
  }

  // Consider user logged in if we have either a token or a user object
  const isLogged = ses && (ses.token || ses.user);
  if (isLogged) {
    const nombre = (ses.user && (ses.user.nameCom || ses.user.cuenta)) || "Usuario";
    slot.innerHTML = `<span>Hola, ${nombre}</span> <a href="#" id="logout">Salir</a>`;
    const logoutBtn = document.getElementById("logout");
    logoutBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("session");
      // After logout navigate to home page to show non-auth UI
      location.href = "./index.html";
    });
    // Hide any other links/buttons that point to login.html (hero CTAs, other anchors)
    try {
      document.querySelectorAll('a[href$="login.html"]').forEach(a => {
        // don't hide the nav-auth replacement (it's handled above)
        if (!a.closest('#nav-auth')) {
          a.style.display = 'none';
        }
      });
    } catch (e) {
      // ignore DOM exceptions in older browsers
    }
  } else {
    slot.innerHTML = `<a href="./login.html">Iniciar sesión</a>`;
  }
});
