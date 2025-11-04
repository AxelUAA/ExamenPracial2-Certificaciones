const fs = require("fs");
const path = require("path");
const CERTIFICACIONES = require("../data/certificaciones.json");
const MESSAGES_FILE = path.join(__dirname, "..", "data", "messagesContact.json");

// helper: read messages from disk (fresh)
function readMessages() {
    try {
        const raw = fs.readFileSync(MESSAGES_FILE, "utf8");
        return JSON.parse(raw || "[]");
    } catch (e) {
        return [];
    }
}

// GET /api/certificaciones
const getCertificaciones = (req, res) => {
    try {
        res.status(200).json(CERTIFICACIONES);
    } catch (error) {
        console.error("Error al obtener certificaciones:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// POST /api/contact
const saveContact = (req, res) => {
    try {
        const { nombre, email, mensaje } = req.body;

        // Validar que vengan todos los campos
        if (!nombre || !email || !mensaje) {
            return res.status(400).json({ 
                error: "Todos los campos son requeridos (nombre, email, mensaje)" 
            });
        }

        // Read current messages from disk
        const messages = readMessages();

        // Crear nuevo mensaje
        const newMessage = {
            id: (messages.length ? messages[messages.length - 1].id : 0) + 1,
            nombre,
            email,
            mensaje,
            fecha: new Date().toISOString()
        };

        // Push and persist
        messages.push(newMessage);
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf8");

        // Imprimir en consola del servidor
        console.log("Nuevo mensaje de contacto recibido:", newMessage);

        res.status(201).json({ 
            message: "Mensaje guardado exitosamente",
            data: newMessage 
        });
    } catch (error) {
        console.error("Error al guardar mensaje de contacto:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = {
    getCertificaciones,
    saveContact
};