// Simple array to store sessions in memory while server is running
const sessions = [];

module.exports = {
    // Get all sessions
    getAll() {
        return sessions;
    },
    
    // Add a new session
    addSession(session) {
        sessions.push(session);
        return session;
    },
    
    // Remove a session
    removeSession(token) {
        const index = sessions.findIndex(s => s.token === token);
        if (index >= 0) {
            sessions.splice(index, 1);
            return true;
        }
        return false;
    },
    
    // Find a session
    findSession(token) {
        return sessions.find(s => s.token === token);
    }
};
