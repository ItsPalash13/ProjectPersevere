import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { getAuthInstance } from './auth';
import { initializeSocketHandlers } from '../sockets';

export const initializeSocket = async (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const auth = getAuthInstance();
      const session = await auth.api.getSession({ headers: socket.handshake.headers as any });
      if (!session) {
        return next(new Error('Unauthorized'));
      }
      socket.data.user = session.user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Initialize socket handlers
  initializeSocketHandlers(io);

  return io;
};
