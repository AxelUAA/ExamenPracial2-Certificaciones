document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("listaCertificaciones");
  const sesion = JSON.parse(localStorage.getItem("session") || "null");
  const usuario = sesion?.user || null;
  const token = sesion?.token || null;
  const fechas = [
    "Disponible a partir del 15 de noviembre de 2025",
    "Disponible a partir del 1 de diciembre de 2025",
    "Disponible a partir del 10 de enero de 2026",
  ];

  try {
    const data = await getCertificaciones();
    contenedor.innerHTML = "";

    data.forEach((cert, i) => {
      const card = document.createElement("div");
      card.classList.add("card");

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
          <button class="btn descargar-examen" ${!activa || !usuario?.examenPresentado ? "disabled" : ""} data-id="${cert.id}">Descargar Certificacion</button>
        </div>

        ${!activa ? `<p class="fecha">${fechas[i - 1]}</p>` : ""}
      `;

      contenedor.appendChild(card);
    });

    document.querySelectorAll(".pagar").forEach(btn =>
      btn.addEventListener("click", pagarCertificacion)
    );
    document.querySelectorAll(".iniciar").forEach(btn =>
      btn.addEventListener("click", iniciarExamen)
    );
    document.querySelectorAll('.descargar-examen').forEach(btn =>
      btn.addEventListener('click', descargarCertificacion)
    );

  } catch (err) {
    console.error(err);
    contenedor.innerHTML = `<p style="color:red;">Error al cargar certificaciones 😢</p>`;
  }

  // === Funciones ===
  async function pagarCertificacion(e) {
    const id = e.target.dataset.id;

    if (!usuario || !token) {
      return Swal.fire({
        icon: "warning",
        title: "Inicia sesión",
        text: "Debes iniciar sesión primero para realizar el pago.",
        confirmButtonColor: "#2563eb"
      });
    }

    if (usuario.pagoRealizado) {
      return Swal.fire({
        icon: "info",
        title: "Pago ya realizado",
        text: "Ya realizaste el pago de esta certificación 💳",
        confirmButtonColor: "#2563eb"
      });
    }

    const confirm = await Swal.fire({
      icon: "question",
      title: "¿Deseas realizar el pago?",
      text: "Se cargará el costo de la certificación.",
      showCancelButton: true,
      confirmButtonText: "Sí, pagar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b"
    });

    if (!confirm.isConfirmed) return;

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
        localStorage.setItem("session", JSON.stringify({ ...sesion, user: usuario }));
        Swal.fire({
          icon: "success",
          title: "Pago exitoso 💳",
          text: "Tu pago fue registrado correctamente.",
          confirmButtonColor: "#2563eb"
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al procesar pago",
          text: data.error || "No se pudo procesar el pago.",
          confirmButtonColor: "#2563eb"
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor.",
        confirmButtonColor: "#2563eb"
      });
    }
  }

  function iniciarExamen(e) {
    if (!usuario || !token) {
      return Swal.fire({
        icon: "warning",
        title: "Inicia sesión",
        text: "Debes iniciar sesión para comenzar el examen.",
        confirmButtonColor: "#2563eb"
      });
    }
    if (!usuario.pagoRealizado) {
      return Swal.fire({
        icon: "info",
        title: "Pago pendiente",
        text: "Debes realizar el pago antes de iniciar el examen.",
        confirmButtonColor: "#2563eb"
      });
    }

    Swal.fire({
      icon: "success",
      title: "¡Examen iniciado!",
      text: "Buena suerte 🍀",
      confirmButtonColor: "#2563eb"
    }).then(() => {
      window.location.href = "examen.html";
    });
  }

  // Descargar examen (actualmente descarga el certificado en PDF generado por el backend)
  async function descargarCertificacion(e) {
    const id = e.target.dataset.id;

    if (!usuario || !token) {
      return Swal.fire({ icon: 'warning', title: 'Inicia sesión', text: 'Debes iniciar sesión para descargar.', confirmButtonColor: '#2563eb' });
    }

    if (!usuario.examenPresentado) {
      return Swal.fire({ icon: 'info', title: 'Examen pendiente', text: 'Debes completar el examen antes de descargar.', confirmButtonColor: '#2563eb' });
    }

    try {
      const res = await fetch(`${API_URL}/cert/download?certId=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => 'Error al descargar');
        throw new Error(txt || 'Error al descargar');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `certificado_${usuario.cuenta}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      Swal.fire({ icon: 'success', title: 'Descargado', text: 'El archivo se descargó correctamente.', confirmButtonColor: '#2563eb' });
    } catch (err) {
      console.error('descargarCertificacion error', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo descargar el archivo.', confirmButtonColor: '#2563eb' });
    }
  }
});
