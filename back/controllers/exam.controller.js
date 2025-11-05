const crypto = require("crypto"); // Para generar IDs de intento únicos
const ALL_QUESTIONS = require("../data/questions");
const CERTIFICATIONS = require("../data/certificaciones");

// --- Almacén en memoria para intentos de examen ---
// Estructura: Map<attemptId, { correctAnswers, submitted, certificationId }>
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
  const certificationId = 1; 
  console.log(`Solicitud /start recibida`);

  // Seleccionar 8 preguntas aleatorias sin validaciones

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

  // Log para debug
  console.log('Selected questions:', selectedQuestions.length);

  activeAttempts.set(attemptId, {
    certificationId,
    correctAnswers,
    submitted: false // aun no se envia 
  });

  // Ya no marcamos el usuario como que presentó el examen
  console.log('Examen iniciado exitosamente');

  // devolver preguntas y attemptId al front
  res.status(200).json({
    message: "Examen iniciado. ¡Suerte!",
    attemptId,
    questions: examForFront
  });
};


// Enviar del middleware y calificar
const enviarExamen = (req, res) => {
  const { attemptId, answers } = req.body;
  console.log(`Solicitud /submit recibida para attemptId: ${attemptId}`);

  //validar el intento
  const attempt = activeAttempts.get(attemptId);

  if (!attempt) {
    return res.status(404).json({ message: "Intento de examen no encontrado o expirado." });
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

  // guardamos el resultado 
  attempt.submitted = true;
  attempt.calificacion = calificacion;
  attempt.aprobado = aprobado;

  console.log(`Examen ${attemptId} calificado. Resultado: ${calificacion}%. Aprobado: ${aprobado}`);
  
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