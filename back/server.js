//lo de base
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const examsRoutes = require("./routes/examen.routes");
const otherRoutes = require("./routes/other.routes");
const authRoutes = require("./routes/auth");
const certificateRoutes = require("./routes/certificate");


app.use("/api/auth", authRoutes);
app.use("/api/exams", examsRoutes);
app.use("/api", otherRoutes);
app.use("/api/cert", certificateRoutes);


// Arranque del servidor
const PORT = process.env.PORT || 3000;
// Escuchar en todas las interfaces de red (0.0.0.0) para permitir conexiones LAN
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en todas las interfaces en el puerto ${PORT}`);
    console.log('Para acceder desde LAN, usa la IP de tu computadora. Ejemplos:');
    console.log(`- http://192.168.1.x:${PORT}`);
    console.log(`- http://IP_DE_TU_PC:${PORT}`);
});