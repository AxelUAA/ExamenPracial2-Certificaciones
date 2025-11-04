document.addEventListener("DOMContentLoaded", async () => {
  // Read token from the shared `session` object saved by auth.js
  let ses = null;
  try {
    ses = JSON.parse(localStorage.getItem("session") || "null");
  } catch (err) {
    ses = null;
  }
  const token = ses?.token || null;
  const form = document.getElementById("examForm");
  const container = document.getElementById("questions-container");
  if (!token) {
    Swal.fire("No autorizado", "Por favor inicia sesión antes de comenzar el examen.", "warning")
      .then(() => window.location.href = "./login.html");
    return;
  }

  try {
    // Use API_URL from ../js/api.js (must be loaded before this script)
  const res = await fetch(`${API_URL}/exams/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      Swal.fire("Error", data.message || "No se pudieron cargar las preguntas ❌", "error");
      return;
    }

    renderQuestions(data.questions);
    form.classList.remove("hidden");
    form.dataset.attemptId = data.attemptId;

  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudieron cargar las preguntas ❌", "error");
  }

  function renderQuestions(questions) {
    container.innerHTML = "";
    questions.forEach((q, index) => {
      const div = document.createElement("div");
      div.classList.add("question");
      div.innerHTML = `
        <h3>${index + 1}. ${q.text}</h3>
        ${q.options.map(opt => `
          <label>
            <input type="radio" name="q${q.id}" value="${opt}" required>
            ${opt}
          </label>
        `).join("<br>")}
      `;
      container.appendChild(div);
    });

    // Aqui hago la logica del timer
    (async () => {
      // Obtener certId desde query params (si está presente) o usar 1
      const certId =  1;

      // Intentar obtener la certificación desde la API para leer su tiempo
      let minutos = 0;
      try {
        // Hacemos la llamada a la API como pide el requisito
        const r = await fetch(`${API_URL}/certificaciones`);
        if (r.ok) {
          const all = await r.json();
          // Buscamos específicamente la certificación con el ID 1
          const cert = (all || []).find(c => Number(c.id) === certId);
          
          // Verificamos el JSON que me diste
          if (cert && cert.tiempoExamen) { 
            // Extraemos solo el número (90)
            const m = String(cert.tiempoExamen).match(/(\d+)/);
            minutos = m ? parseInt(m[0], 10) : 0;
          }
        }
      } catch (err) {
        console.warn('No se pudo obtener tiempo de certificacion, usando fallback', err);
      }
      // --- 1. Establece la fecha de finalización ---
      // La cuenta regresiva terminará en 'minutos' a partir de ahora.
      const countDownDate = Date.now() + minutos * 60 * 1000;

      // --- 2. Actualiza el contador cada segundo ---
      const x = setInterval(function() {

        // --- 3. Obtiene la fecha y hora actual ---
        const now = new Date().getTime();
        // --- 4. Calcula la distancia que falta ---
        const distance = countDownDate - now;

        // --- 5. Cálculos de tiempo para días, horas, minutos y segundos ---
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesLeft = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // --- 6. Muestra el resultado en el HTML ---
        // Busca los elementos por su ID y les pone el valor calculado.
        const elH = document.getElementById("hours");
        const elM = document.getElementById("minutes");
        const elS = document.getElementById("seconds");
        if (elH) elH.innerText = String(hours).padStart(2, '0');
        if (elM) elM.innerText = String(minutesLeft).padStart(2, '0');
        if (elS) elS.innerText = String(seconds).padStart(2, '0');

        // --- 7. (Opcional) ¿Qué hacer cuando termine? ---
        // Si la distancia es menor que 0, el contador terminó.
        if (distance < 0) {
          clearInterval(x); // Detiene el intervalo
          const cd = document.getElementById("countdown");
          if (cd) {
            cd.classList.add('ended');
            cd.innerHTML = "¡TIEMPO TERMINADO!";
          }
          // Enviar el formulario automáticamente cuando termine el tiempo
          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn) submitBtn.click();
        }
      }, 1000);
    })();
  }

  // ---- Enviar examen ----
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const attemptId = form.dataset.attemptId;
    const answers = Array.from(container.querySelectorAll(".question")).map(q => {
      const id = q.querySelector("input").name.replace("q", "");
      const selected = q.querySelector("input:checked");
      return {
        id: parseInt(id),
        answer: selected ? selected.value : null
      };
    });

    try {
  const res = await fetch(`${API_URL}/exams/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ attemptId, answers })
      });

      const data = await res.json();

      if (res.ok) {
        // Actualizar el estado del usuario en localStorage para habilitar descargas
        try {
          const session = JSON.parse(localStorage.getItem("session") || "null");
          if (session && session.user) {
            session.user.examenPresentado = true;
            localStorage.setItem("session", JSON.stringify(session));
          }
        } catch (err) {
          console.warn("No se pudo actualizar session en localStorage", err);
        }

        Swal.fire({
          title: data.aprobado ? "🎉 ¡Aprobado!" : "❌ No aprobado",
          html: `
            <b>Calificación:</b> ${data.calificacion.toFixed(1)}%<br>
            <b>Respuestas correctas:</b> ${data.score}/${data.total}
          `,
          icon: data.aprobado ? "success" : "error"
        }).then(() => window.location.href = "./certificaciones.html");
      } else {
        Swal.fire("Error", data.message || "No se pudo enviar el examen", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Hubo un problema al enviar tus respuestas ❌", "error");
    }
  });
});

 // Crear objeto de fecha
    const hoy = new Date();

    // Formatear la fecha (ejemplo: 4/11/2025)
    const fechaFormateada = hoy.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Mostrar la fecha en el elemento con id="fecha"
    document.getElementById('fecha').textContent = fechaFormateada;