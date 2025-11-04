const crypto = require("crypto"); // Para generar IDs de intento únicos
const ALL_QUESTIONS = require("../data/questions");
const USERS = require("../data/users"); // Tu "base de datos" de usuarios (array cargado desde JSON)
const CERTIFICATIONS = require("../data/certificaciones");
const fs = require('fs');
const path = require('path');

// --- Almacén en memoria para intentos de examen ---
// Estructura: Map<attemptId, { userId, correctAnswers, submitted, certificationId }>
const activeAttempts = new Map();

// Funcion para bajajear, se uiso el algoritmo Fisher-Yates)
function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

//Iniciar examen
const iniciarExamen = (req, res) => {
  // El ID de usuario viene del middleware simulado (checkAuth)
  const userId = req.userId;
  const certificationId = 1; 

  console.log(`Solicitud /start recibida para userId: ${userId}`);

  
  const user = USERS.find(u => u.id === userId); //busamos el usuario
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado." });
  }

  //verifica requisitos 
  if (!user.pagoRealizado) {
    return res.status(403).json({ message: "Primero Paga!." });
  }
  if (user.examenPresentado) {
    return res.status(403).json({ message: "Ya has presentado este examen!." });
  }

  // Seleccionar 8 preguntas aleatorias
  const shuffledQuestions = shuffleArray(ALL_QUESTIONS);
  const selectedQuestions = shuffledQuestions.slice(0, 8);

  // Barajar opciones y preparar datos para el front  
  const examForFront = selectedQuestions.map(q => {
    return {
      id: q.id,
      text: q.text,
      options: shuffleArray(q.options) // opciones barajadas
    };
  });

  // guardamos el intento 
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
    submitted: false // aun no se envia 
  });

  // Se marca el usuario como que ya presentó el examen
  user.examenPresentado = true;
  console.log(`Usuario ${userId} marcado como examenPresentado: true`); // y lo decimos en consola

  // devolver preguntas y attemptId al front
  res.status(200).json({
    message: "Examen iniciado. ¡Suerte!",
    attemptId,
    questions: examForFront
  });
};


// Enviar del middleware y calificar
const enviarExamen = (req, res) => {
  const userId = req.userId; // Del middleware de juan
  const { attemptId, answers } = req.body; // Respuestas del team frontn 


  console.log(`Solicitud /submit recibida para attemptId: ${attemptId}`);

  //validar el intento
  const attempt = activeAttempts.get(attemptId);

  if (!attempt) {
    return res.status(404).json({ message: "Intento de examen no encontrado o expirado." });
  }

  // validar que el intento pertenezca al usuario
  if (attempt.userId !== userId) {
    return res.status(403).json({ message: "No autorizado para enviar este examen." });
  }

  // validar que no se haya enviado antes
  if (attempt.submitted) {
    return res.status(400).json({ message: "Este examen ya fue calificado." });
  }

  const { correctAnswers } = attempt; // Las respuestas correctas que guardamos
  let score = 0;

  for (const q of correctAnswers) {
    const userAnswer = answers.find(a => a.id === q.id);
    if (userAnswer && userAnswer.answer === q.correct) {
      score++; //checamos una por una como en clase 
    }
  }

  // calificamos
  const totalQuestions = correctAnswers.length; // 8
  const calificacion = (score / totalQuestions) * 100;

  // Buscamos el puntaje mínimo de la certificación
  const cert = CERTIFICATIONS.find(c => c.id === attempt.certificationId);
  const puntajeMinimo = cert ? cert.puntajeMinimo : 70; // Default por si acaso
  const aprobado = calificacion >= puntajeMinimo;

  // guardamos el resultado en memoria
  attempt.submitted = true;
  attempt.calificacion = calificacion;
  attempt.aprobado = aprobado;

  console.log(`Examen ${attemptId} calificado. Resultado: ${calificacion}%. Aprobado: ${aprobado}`);

  // Persistir resultado en users.json (escritura síncrona simple)
  try {
    const user = USERS.find(u => u.id === userId);
    if (user) {
      user.examenPresentado = true;
      user.aprobado = aprobado; // true o false
      const usersFile = path.join(__dirname, '..', 'data', 'users.json');
      fs.writeFileSync(usersFile, JSON.stringify(USERS, null, 2), 'utf8');
      console.log(`Estado del usuario ${userId} persistido en users.json (aprobado=${aprobado})`);
    }
  } catch (e) {
    console.error('Error al persistir users.json:', e);
    // No impedimos responder al front si falla la persistencia
  }

  // responder al front
  res.status(200).json({
    message: "Examen evaluado.",
    calificacion,
    aprobado,
    score,
    total: totalQuestions
  });
};
//se envian las funciones
module.exports = { iniciarExamen, enviarExamen };