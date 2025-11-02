//lo de base
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const examsRoutes = require("./routes/examen.routes");
const otherRoutes = require("./routes/other.routes");

app.use("/api/exams", examsRoutes);
app.use("/api", otherRoutes);

// Arranque del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});