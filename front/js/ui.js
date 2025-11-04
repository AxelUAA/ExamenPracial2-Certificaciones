// /front/js/ui.js
document.addEventListener("DOMContentLoaded", () => {
  const slot = document.getElementById("nav-auth");
  if (!slot) return;

  // Leemos la sesión (si existe) para mostrar en el nav el estado de autenticación
  let ses = null;
  try {
    ses = JSON.parse(localStorage.getItem("session") || "null");
  } catch (err) {
    ses = null;
  }

  // Si existe token o user consideramos al usuario como loggeado
  const isLogged = ses && (ses.token || ses.user);
  if (isLogged) {
    // Mostramos un saludo y un enlace para cerrar sesión
    const nombre = (ses.user && (ses.user.nameCom || ses.user.cuenta)) || "Usuario";
    slot.innerHTML = `<span>Hola, ${nombre}</span> <a href="#" id="logout">Salir</a>`;
    const logoutBtn = document.getElementById("logout");
    logoutBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      // Al cerrar sesión eliminamos la key 'session' y recargamos la página principal
      localStorage.removeItem("session");
      location.href = "./index.html";
    });

    // Ocultamos enlaces que llevan a login.html para evitar que el usuario vea CTA de entrar
    // Esto es solo una mejora visual; la seguridad real la hace el backend.
    try {
      document.querySelectorAll('a[href$="login.html"]').forEach(a => {
        if (!a.closest('#nav-auth')) {
          a.style.display = 'none';
        }
      });
    } catch (e) {
      // ignoramos errores de DOM en navegadores antiguos
    }
  } else {
    // Si no está loggeado, mostramos el link a la página de login
    slot.innerHTML = `<a href="./login.html">Iniciar sesión</a>`;
  }
});
