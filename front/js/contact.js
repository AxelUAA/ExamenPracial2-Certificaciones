// front/js/contact.js
// Manejador del formulario de contacto — muestra una alerta (Swal) al enviar.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = (document.getElementById('nombre') || {}).value || '';
    const email = (document.getElementById('correo') || {}).value || '';
    const mensaje = (document.getElementById('mensaje') || {}).value || '';

    if (!nombre.trim() || !email.trim() || !mensaje.trim()) {
      if (window.Swal) {
        Swal.fire({ icon: 'error', title: 'Campos incompletos', text: 'Por favor completa todos los campos.' });
      } else {
        alert('Por favor completa todos los campos.');
      }
      return;
    }

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre.trim(), email: email.trim(), mensaje: mensaje.trim() })
      });

      if (res.ok) {
        form.reset();
        if (window.Swal) {
          Swal.fire({ icon: 'success', title: 'Mensaje Enviado', text: 'Gracias por contactarnos. Te responderemos pronto.' });
        } else {
          alert('Mensaje Enviado. Gracias por contactarnos.');
        }
      } else {
        let err = 'No se pudo enviar el mensaje.';
        try { const j = await res.json(); if (j && j.error) err = j.error; } catch(e){}
        if (window.Swal) Swal.fire({ icon: 'error', title: 'Error', text: err });
        else alert(err);
      }
    } catch (error) {
      if (window.Swal) Swal.fire({ icon: 'error', title: 'Error de conexión', text: 'No se pudo conectar con el servidor.' });
      else alert('No se pudo conectar con el servidor.');
    }
  });
});
