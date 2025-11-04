// Controlador sencillo para certificaciones y contacto
// Comentarios en español y lógica clara (sin código sofisticado)
const fs = require('fs');
const path = require('path');

// Cargamos las certificaciones desde el JSON (solo lectura)
const CERTIFICACIONES = require('../data/certificaciones.json');

// Ruta al archivo donde se guardan los mensajes de contacto
const MESSAGES_FILE = path.join(__dirname, '..', 'data', 'messagesContact.json');

// GET /api/certificaciones
const getCertificaciones = (req, res) => {
    try {
        res.status(200).json(CERTIFICACIONES);
    } catch (error) {
        console.error('Error al obtener certificaciones:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Helper simple: leer JSON desde archivo, devuelve array o null
function readJson(filePath) {
    try {
        if (!fs.existsSync(filePath)) return null;
        const txt = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(txt);
    } catch (e) {
        // Si hay error al leer o parsear, devolvemos null
        return null;
    }
}

// Helper simple: escribir JSON al archivo (síncrono, legible)
function writeJson(filePath, data) {
    const txt = JSON.stringify(data, null, 2); // indentado para lectura
    fs.writeFileSync(filePath, txt, 'utf8');
}

// POST /api/contact
const saveContact = (req, res) => {
    try {
        const { nombre, email, mensaje } = req.body;

        // Validación básica: todos los campos obligatorios
        if (!nombre || !email || !mensaje) {
            return res.status(400).json({ error: 'Todos los campos son requeridos (nombre, email, mensaje)' });
        }

        // Leemos mensajes existentes (si el archivo no existe, usamos array vacío)
        let messages = readJson(MESSAGES_FILE) || [];

        // Creamos el nuevo mensaje con un id simple (longitud + 1)
        const newMessage = {
            id: messages.length + 1,
            nombre: String(nombre),
            email: String(email),
            mensaje: String(mensaje),
            fecha: new Date().toISOString()
        };

        // Agregamos el nuevo mensaje al array
        messages.push(newMessage);

        // Guardamos el array actualizado en el archivo
        try {
            writeJson(MESSAGES_FILE, messages);
        } catch (e) {
            console.error('Error al escribir messagesContact.json:', e);
            return res.status(500).json({ error: 'Error al guardar mensaje' });
        }

        // Imprimimos en consola para seguimiento
        console.log('Nuevo mensaje de contacto recibido:', newMessage);

        // Respondemos al cliente con el mensaje guardado
        res.status(201).json({ message: 'Mensaje guardado exitosamente', data: newMessage });
    } catch (error) {
        console.error('Error al guardar mensaje de contacto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    getCertificaciones,
    saveContact
};