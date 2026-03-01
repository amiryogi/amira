import { Server as SocketIOServer, Namespace } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { config } from './index.js';
import { logger } from '../utils/logger.js';
import { socketAuthMiddleware } from '../middlewares/socketAuth.middleware.js';
import { registerChatHandlers } from '../modules/chat/chat.socket.js';
import { CHAT_DEFAULTS } from '@amira/shared';

// ─── Connection Tracking: userId → Set<socketId> ───
const connectedUsers = new Map<string, Set<string>>();

export function isUserOnline(userId: string): boolean {
  const sockets = connectedUsers.get(userId);
  return !!sockets && sockets.size > 0;
}

export function addConnection(userId: string, socketId: string): void {
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set());
  }
  connectedUsers.get(userId)!.add(socketId);
}

export function removeConnection(userId: string, socketId: string): void {
  const sockets = connectedUsers.get(userId);
  if (sockets) {
    sockets.delete(socketId);
    if (sockets.size === 0) {
      connectedUsers.delete(userId);
    }
  }
}

// ─── Socket.IO Initialization ───

let chatNamespace: Namespace | null = null;

export function getChatNamespace(): Namespace | null {
  return chatNamespace;
}

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.cors.allowedOrigins,
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  chatNamespace = io.of(CHAT_DEFAULTS.NAMESPACE);

  // Auth middleware
  chatNamespace.use(socketAuthMiddleware);

  // Connection handler
  chatNamespace.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    addConnection(userId, socket.id);
    logger.info(`Socket connected: ${socket.id} (user: ${userId})`);

    // Register chat event handlers
    registerChatHandlers(chatNamespace!, socket);

    socket.on('disconnect', (reason) => {
      removeConnection(userId, socket.id);
      logger.info(`Socket disconnected: ${socket.id} (reason: ${reason})`);
    });
  });

  logger.info('Socket.IO initialized on namespace /chat');
  return io;
}
