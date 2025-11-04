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
    const res = await fetch(`${API_URL}/exam/start`, {
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
      const res = await fetch("/api/exam/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ attemptId, answers })
      });

      const data = await res.json();

      if (res.ok) {
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
