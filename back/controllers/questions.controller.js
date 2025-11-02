const QUESTIONS = require("../data/questions");

          // --- 1) Enviar preguntas al frontend ---  

          const startQuiz = (req, res) => {
            //
            console.log("Acceso al  /api/questions/start");

            // Crea una copia de todas las preguntas SIN el campo 'correct'
            const publicQuestions = QUESTIONS.map(({ id, text, options }) => ({
              id, text, options
            }));

            res.status(200).json({
              message: "Preguntas listas. ¡Éxito!",
              questions: publicQuestions
            });
          };

          // --- 2) Recibir y evaluar respuestas ---
          const submitAnswers = (req, res) => {
            //mostrar el JSON recibido
            console.log("Acceso al  /api/questions/submit Jean Puentes");
            console.log("Respuestas recibidas:", JSON.stringify(req.body));

            // 1 Toma las respuestas enviadas por el usuario
            // Si req.body.answers es un arreglo → devuelve true
            // El servidor no truena, simplemente no califica nada y responde con score 0.
            const userAnswers = Array.isArray(req.body.answers) ? req.body.answers : [];

            // 2 Inicializa puntaje y arreglo de detalles
            let score = 0;
            const details = [];

            // 3 Recorre todas las preguntas del servidor
            for (const q of QUESTIONS) {
              // 3.1) Busca la respuesta enviada para esta pregunta
              const user = userAnswers.find(a => a.id === q.id);

              // 3.2) Determina si es correcta
              //isCorrect será verdadero solo si existe user y además la respuesta del usuario es igual a la correcta
              const isCorrect = !!user && user.answer === q.correct;

              // 3.3) Suma al puntaje si acierta
              if (isCorrect) score++;

              // 3.4) Agrega la información detallada de la pregunta
              details.push({
                id: q.id,
                text: q.text,
                yourAnswer: user ? user.answer : null,
                correctAnswer: q.correct,
                correct: isCorrect
              });
            }

            // 4 Envía el resultado al cliente
            return res.status(200).json({
              message: "Respuestas evaluadas.",
              score,
              total: QUESTIONS.length,
              details
            });
            
          };

          module.exports = { startQuiz, submitAnswers };