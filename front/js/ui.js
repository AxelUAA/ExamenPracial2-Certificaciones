// /front/js/ui.js
document.addEventListener("DOMContentLoaded", () => {
  const slot = document.getElementById("nav-auth");
  if (!slot) return;

  const ses = JSON.parse(localStorage.getItem("session") || "null");
  if (ses?.user) {
    const nombre = ses.user.nameCom || ses.user.cuenta || "Usuario";
    slot.innerHTML = `<span>Hola, ${nombre}</span> <a href="#" id="logout">Salir</a>`;
    document.getElementById("logout")?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("session");
      location.reload();
    });
  } else {
    slot.innerHTML = `<a href="./login.html">Iniciar sesión</a>`;
  }
});
