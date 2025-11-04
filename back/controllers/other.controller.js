const CERTIFICACIONES = require("../data/certificaciones.json");
const MESSAGES_CONTACT = require("../data/messagesContact.json");

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

        // Crear nuevo mensaje
        const newMessage = {
            id: MESSAGES_CONTACT.length + 1,
            nombre,
            email,
            mensaje,
            fecha: new Date().toISOString()
        };

        // Guardar en el arreglo
        MESSAGES_CONTACT.push(newMessage);

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