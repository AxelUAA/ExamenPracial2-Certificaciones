document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("listaCertificaciones");
  const usuario = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  const fechas = [
    "Disponible a partir del 15 de noviembre de 2025",
    "Disponible a partir del 1 de diciembre de 2025",
    "Disponible a partir del 10 de enero de 2026",
  ];

  try {
    const data = await getCertificaciones(); // viene de api.js
    contenedor.innerHTML = "";

    data.forEach((cert, i) => {
      const card = document.createElement("div");
      card.classList.add("card");

      // solo la primera certificación está activa
      const activa = cert.id === 1;

      card.innerHTML = `
        <h3>${cert.nombre}</h3>
        <p>${cert.descripcion}</p>
        <h4>Ventajas:</h4>
        <ul>${cert.ventajas.map(v => `<li>${v}</li>`).join("")}</ul>
        <p><strong>Puntaje mínimo:</strong> ${cert.puntajeMinimo}</p>
        <p><strong>Tiempo:</strong> ${cert.tiempoExamen}</p>
        <p><strong>Costo:</strong> $${cert.costo.toFixed(2)}</p>

        <div class="acciones">
          <button class="btn pagar" ${!activa ? "disabled" : ""} data-id="${cert.id}">Pagar</button>
          <button class="btn iniciar" ${!activa ? "disabled" : ""} data-id="${cert.id}">Iniciar Examen</button>
        </div>

        ${!activa ? `<p class="fecha">${fechas[i - 1]}</p>` : ""}
      `;

      contenedor.appendChild(card);
    });

    // eventos
    document.querySelectorAll(".pagar").forEach(btn => btn.addEventListener("click", pagarCertificacion));
    document.querySelectorAll(".iniciar").forEach(btn => btn.addEventListener("click", iniciarExamen));

  } catch (err) {
    contenedor.innerHTML = `<p style="color:red;">Error al cargar certificaciones 😢</p>`;
  }

  // --- FUNCIONES ---

  async function pagarCertificacion(e) {
    const id = e.target.dataset.id;

    if (!usuario || !token) {
      return Swal.fire("Debes iniciar sesión primero", "", "warning");
    }

    if (usuario.pagoRealizado) {
      return Swal.fire("Aviso", "Ya realizaste el pago de esta certificación.", "info");
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ idCertificacion: id }),
      });

      const data = await res.json();

      if (data.ok) {
        usuario.pagoRealizado = true;
        localStorage.setItem("user", JSON.stringify(usuario));
        Swal.fire("Pago exitoso", "Tu pago fue registrado correctamente 💳", "success");
      } else {
        Swal.fire("Error", data.error || "No se pudo procesar el pago.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
    }
  }

  function iniciarExamen(e) {
    if (!usuario || !token) {
      return Swal.fire("Debes iniciar sesión para comenzar el examen.", "", "warning");
    }
    if (!usuario.pagoRealizado) {
      return Swal.fire("Debes realizar el pago antes de iniciar el examen.", "", "warning");
    }

    Swal.fire("¡Examen iniciado!", "Buena suerte 🍀", "success");
    window.location.href = "examen.html";
  }
});
