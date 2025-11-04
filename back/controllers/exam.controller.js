const crypto = require("crypto"); // Para generar IDs de intento únicos
const ALL_QUESTIONS = require("../data/questions");
const USERS = require("../data/users"); // Tu "base de datos" de usuarios
const CERTIFICATIONS = require("../data/certificaciones");

// --- Almacén en memoria para intentos de examen ---
// Guarda los intentos activos. En un proyecto real, usarías una BD (Redis o SQL/Mongo).
// Estructura: Map<attemptId, { userId, correctAnswers, submitted, certificationId }>
const activeAttempts = new Map();

// --- Función de utilidad para barajar ---
// (Algoritmo Fisher-Yates)
function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// --- 1) Iniciar Examen ---
const iniciarExamen = (req, res) => {
  // El ID de usuario viene del middleware simulado (checkAuth)
  const userId = req.userId;
  const certificationId = 1; 

  console.log(`Solicitud /start recibida para userId: ${userId}`);

  // 1. Buscar al usuario
  const user = USERS.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado." });
  }

  // 2. Verificar requisitos (Pago y si ya presentó)
  if (!user.pagoRealizado) {
    return res.status(403).json({ message: "Primero Paga!." });
  }
  if (user.examenPresentado) {
    return res.status(403).json({ message: "Ya has presentado este examen!." });
  }

  // 3. Seleccionar 8 preguntas aleatorias
  const shuffledQuestions = shuffleArray(ALL_QUESTIONS);
  const selectedQuestions = shuffledQuestions.slice(0, 8);

  // 4. Barajar opciones y preparar datos para el front
  // NOTA: Mencionaste "esto se hara en front", pero tu requisito decía:
  // "Devolver al front las 8 preguntas (con sus opciones ya barajadas)".
  // Siguiendo el requisito, lo hacemos aquí en el backend:
  
  const examForFront = selectedQuestions.map(q => {
    return {
      id: q.id,
      text: q.text,
      options: shuffleArray(q.options) // Opciones barajadas
    };
  });

  // 5. Guardar el "intento" en memoria
  const attemptId = crypto.randomUUID(); // Genera un ID único (ej: "a1b2c3d4-...")
  
  // Guardamos las respuestas correctas en el backend para la calificación
  const correctAnswers = selectedQuestions.map(q => ({
    id: q.id,
    correct: q.correct
  }));

  activeAttempts.set(attemptId, {
    userId,
    certificationId,
    correctAnswers,
    submitted: false // Aún no lo ha enviado
  });

  // 6. Marcar al usuario (simulación de guardado en BD)
  user.examenPresentado = true;
  console.log(`Usuario ${userId} marcado como examenPresentado: true`);

  // 7. Devolver preguntas y attemptId al front
  res.status(200).json({
    message: "Examen iniciado. ¡Suerte!",
    attemptId,
    questions: examForFront
  });
};


// --- 2) Enviar Examen ---
const enviarExamen = (req, res) => {
  const userId = req.userId; // Del middleware
  const { attemptId, answers } = req.body; // Respuestas del front

  console.log(`Solicitud /submit recibida para attemptId: ${attemptId}`);

  // 1. Validar el intento
  const attempt = activeAttempts.get(attemptId);

  if (!attempt) {
    return res.status(404).json({ message: "Intento de examen no encontrado o expirado." });
  }

  // 2. Validar que el intento pertenezca al usuario
  if (attempt.userId !== userId) {
    return res.status(403).json({ message: "No autorizado para enviar este examen." });
  }

  // 3. Validar que no se haya enviado antes
  if (attempt.submitted) {
    return res.status(400).json({ message: "Este examen ya fue calificado." });
  }

  // 4. Calificar (100% en backend)
  const { correctAnswers } = attempt; // Las respuestas correctas que guardamos
  let score = 0;

  for (const q of correctAnswers) {
    const userAnswer = answers.find(a => a.id === q.id);
    if (userAnswer && userAnswer.answer === q.correct) {
      score++;
    }
  }

  // 5. Calcular calificación y aprobación
  const totalQuestions = correctAnswers.length; // 8
  const calificacion = (score / totalQuestions) * 100; // Ej: (6 / 8) * 100 = 75

  // Buscamos el puntaje mínimo de la certificación
  const cert = CERTIFICATIONS.find(c => c.id === attempt.certificationId);
  const puntajeMinimo = cert ? cert.puntajeMinimo : 70; // Default por si acaso
  const aprobado = calificacion >= puntajeMinimo;

  // 6. Guardar el resultado (marcar como enviado)
  attempt.submitted = true;
  attempt.calificacion = calificacion;
  attempt.aprobado = aprobado;
  // 7. Guardar resultado en el perfil del usuario (simulación de BD)
  const user = USERS.find(u => u.id === userId);
  if (user) {
    user.calificacion = calificacion;
    user.aprobado = aprobado;
    // Puedes añadir un flag que permita descargar certificado
    if (aprobado) user.tieneCertificado = true;
  }
  // (En un proyecto real, aquí guardarías 'calificacion' y 'aprobado' 
  // en el perfil del usuario en la BD).

  console.log(`Examen ${attemptId} calificado. Resultado: ${calificacion}%. Aprobado: ${aprobado}`);
  
  // 7. Responder al front
  res.status(200).json({
    message: "Examen evaluado.",
    calificacion,
    aprobado,
    score,
    total: totalQuestions
});
};
module.exports = { iniciarExamen, enviarExamen };