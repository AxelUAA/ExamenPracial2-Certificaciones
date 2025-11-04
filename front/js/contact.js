document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const errorEl = document.getElementById('contactError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('correo').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();

    if (!nombre || !email || !mensaje) {
      alert('Todos los campos son requeridos');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, mensaje })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Mensaje enviado correctamente. Gracias!');
        form.reset();
      } else {
        alert(data.error || 'No se pudo enviar el mensaje');
      }
    } catch (err) {
      console.error(err);
      alert('Error al conectar con el servidor');
    }
  });
});
