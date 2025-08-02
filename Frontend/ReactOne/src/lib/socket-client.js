import { io } from 'socket.io-client';

class SocketClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
    }

    connect() {
        if (this.socket) return;

        this.socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', {
            withCredentials: true,
            autoConnect: true
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.isConnected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.isConnected = false;
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Expose socket instance methods
    emit(event, data) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }
        this.socket.emit(event, data);
    }

    on(event, callback) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }
        this.socket.on(event, callback);
    }

    off(event, callback) {
        if (!this.socket) {
            console.error('Socket not connected');
            return;
        }
        this.socket.off(event, callback);
    }

    // Level session management
    joinLevel(levelId, sessionId) {
        this.emit('joinLevel', { levelId, sessionId });
    }

    leaveLevel(levelId) {
        this.emit('leaveLevel', { levelId });
    }

    updateProgress(levelId, xp, time) {
        this.emit('updateProgress', { levelId, xp, time });
    }

    // Event listeners
    onSessionJoined(callback) {
        this.on('sessionJoined', callback);
    }

    onProgressUpdated(callback) {
        this.on('progressUpdated', callback);
    }

    onSessionLeft(callback) {
        this.on('sessionLeft', callback);
    }

    onError(callback) {
        this.on('error', callback);
    }

    // Remove event listeners
    offSessionJoined(callback) {
        this.off('sessionJoined', callback);
    }

    offProgressUpdated(callback) {
        this.off('progressUpdated', callback);
    }

    offSessionLeft(callback) {
        this.off('sessionLeft', callback);
    }

    offError(callback) {
        this.off('error', callback);
    }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient;
