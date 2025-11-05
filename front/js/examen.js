// Este archivo controla la lógica del examen:
// - Lectura de token (sesión)
// - Petición al backend para iniciar intento y obtener preguntas
// - Renderizado de preguntas y recolección de respuestas
// - Temporizador que auto-envía cuando se acaba el tiempo
// Comentarios en español para facilitar la comprensión.
document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("examForm");
  const container = document.getElementById("questions-container");

  try {
    console.log('Making request to:', `${API_URL}/exams/start`);
    // Llamamos al backend para iniciar el examen y crear un intento (attempt)
    // Esta ruta debe devolver un objeto con { questions, attemptId, ... }
    // Atención: esta llamada está protegida, por eso enviamos el header Authorization
    const res = await fetch(`${API_URL}/exams/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      console.error('Error response:', data);
      Swal.fire("Error", data.message || "No se pudieron cargar las preguntas ❌", "error");
      return;
    }

    if (!data.questions || !Array.isArray(data.questions)) {
      console.error('Invalid questions format:', data);
      Swal.fire("Error", "Formato de preguntas inválido", "error");
      return;
    }

    console.log('Received questions:', data.questions.length);

  // Una vez recibidas las preguntas, las renderizamos en el DOM
  // renderQuestions creará los inputs y arrastra la lógica del temporizador
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

    // Aquí está la lógica del temporizador (timer). La idea:
    // 1) Intentar obtener el tiempo de la certificación desde la API (campo 'tiempoExamen').
    // 2) Si está disponible, extraer el número de minutos (ej. "90 minutos") y usarlo.
    // 3) Calcular la fecha de finalización y actualizar el contador cada segundo.
    // 4) Cuando llegue a 0, auto-enviar el formulario.
    (async () => {
      // Para simplificar este ejemplo usamos certId = 1.
      const certId = 1;

      // minutos tomados de la certificación (fallback = 0)
      let minutos = 0;
      try {
        const r = await fetch(`${API_URL}/certificaciones`);
        if (r.ok) {
          const all = await r.json();
          const cert = (all || []).find(c => Number(c.id) === certId);
          if (cert && cert.tiempoExamen) {
            // Extraemos el primer número que encontremos en el texto
            const m = String(cert.tiempoExamen).match(/(\d+)/);
            minutos = m ? parseInt(m[0], 10) : 0;
          }
        }
      } catch (err) {
        // No crítico: si falla la llamada, usamos minutos = 0 y el contador no sumará tiempo.
        console.warn('No se pudo obtener tiempo de certificacion, usando fallback', err);
      }

      // Si minutos es 0 el contador mostrará 00:00:00 y al finalizar intentará enviar.
      const countDownDate = Date.now() + minutos * 60 * 1000;

      const x = setInterval(function() {
        const now = Date.now();
        const distance = countDownDate - now;

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesLeft = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const elH = document.getElementById("hours");
        const elM = document.getElementById("minutes");
        const elS = document.getElementById("seconds");
        if (elH) elH.innerText = String(hours).padStart(2, '0');
        if (elM) elM.innerText = String(minutesLeft).padStart(2, '0');
        if (elS) elS.innerText = String(seconds).padStart(2, '0');

        // Cuando termine el tiempo, detenemos el intervalo y auto-enviamos el examen.
        if (distance < 0) {
          clearInterval(x);
          const cd = document.getElementById("countdown");
          if (cd) {
            cd.classList.add('ended');
            cd.innerHTML = "¡TIEMPO TERMINADO!";
          }
          // Auto-enviar el formulario: simulamos click en el botón enviar.
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
    // Recolectar respuestas del DOM:
    // Cada .question contiene inputs tipo radio con name="q<id>".
    // Construimos un array de objetos { id, answer } para enviar al backend.
    const answers = Array.from(container.querySelectorAll(".question")).map(q => {
      const id = q.querySelector("input").name.replace("q", "");
      const selected = q.querySelector("input:checked");
      return {
        id: parseInt(id),
        // Si no se seleccionó, enviamos null (backend debe manejar preguntas sin respuesta)
        answer: selected ? selected.value : null
      };
    });

    try {
  // Enviamos las respuestas al endpoint protegido /exams/submit.
  // El backend espera { attemptId, answers } y devolverá calificación, aprobado, etc.
  const res = await fetch(`${API_URL}/exams/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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