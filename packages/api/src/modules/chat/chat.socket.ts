import { Namespace, Socket } from 'socket.io';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { ChatService } from './chat.service.js';
import { logger } from '../../utils/logger.js';
import {
  CHAT_EVENTS,
  CHAT_DEFAULTS,
  UserRole,
  SenderRole,
  sendMessageSchema,
  joinChatSchema,
} from '@amira/shared';

// ─── Rate Limiter (per userId) ───
const messageLimiter = new RateLimiterMemory({
  points: CHAT_DEFAULTS.RATE_LIMIT_POINTS,
  duration: CHAT_DEFAULTS.RATE_LIMIT_DURATION,
});

const chatService = new ChatService();

// Track which rooms each socket has joined
const socketRooms = new Map<string, Set<string>>();

function getJoinedRooms(socketId: string): Set<string> {
  if (!socketRooms.has(socketId)) {
    socketRooms.set(socketId, new Set());
  }
  return socketRooms.get(socketId)!;
}

function emitError(socket: Socket, message: string): void {
  socket.emit(CHAT_EVENTS.CHAT_ERROR, { message });
}

export function registerChatHandlers(namespace: Namespace, socket: Socket): void {
  const userId = socket.data.userId as string;
  const userRole = socket.data.userRole as string;
  const userName = socket.data.userName as string;

  // ─── JOIN CHAT ───
  socket.on(CHAT_EVENTS.JOIN_CHAT, async (data: unknown) => {
    try {
      const parsed = joinChatSchema.safeParse(data);
      if (!parsed.success) {
        return emitError(socket, parsed.error.errors[0]?.message ?? 'Invalid input');
      }

      let roomId = parsed.data.roomId;

      // If USER → find or create their room
      if (userRole === UserRole.USER) {
        const room = await chatService.findOrCreateRoom(userId);
        roomId = room._id.toString();
      }

      if (!roomId) {
        return emitError(socket, 'Room ID is required for admin');
      }

      // Verify access
      const hasAccess = await chatService.verifyRoomAccess(roomId, userId, userRole);
      if (!hasAccess) {
        return emitError(socket, 'Access denied to this chat room');
      }

      // Join the Socket.IO room
      await socket.join(roomId);
      getJoinedRooms(socket.id).add(roomId);

      // If ADMIN → assign self to room
      if (userRole === UserRole.ADMIN) {
        await chatService.assignAdminToRoom(roomId, userId);
      }

      // Mark messages as delivered (they opened the chat)
      await chatService.markMessagesAsDelivered(roomId, userId);

      // Reset unread count for the joining user
      const counterField =
        userRole === UserRole.ADMIN ? 'unreadCountAdmin' : 'unreadCountCustomer';
      await chatService.resetUnreadCount(roomId, counterField);

      // Load initial messages
      const messages = await chatService.getMessages(
        roomId,
        undefined,
        CHAT_DEFAULTS.INITIAL_MESSAGE_LIMIT,
      );

      socket.emit(CHAT_EVENTS.CHAT_HISTORY, {
        roomId,
        messages,
      });
    } catch (error) {
      logger.error({ err: error }, 'Error in join-chat handler');
      emitError(socket, 'Failed to join chat');
    }
  });

  // ─── SEND MESSAGE ───
  socket.on(CHAT_EVENTS.SEND_MESSAGE, async (data: unknown) => {
    try {
      // Rate limit
      try {
        await messageLimiter.consume(userId);
      } catch {
        return emitError(socket, 'Too many messages. Please slow down.');
      }

      // Validate
      const parsed = sendMessageSchema.safeParse(data);
      if (!parsed.success) {
        return emitError(socket, parsed.error.errors[0]?.message ?? 'Invalid message');
      }

      const { roomId, content, attachments } = parsed.data;

      // Verify sender has joined this room
      if (!getJoinedRooms(socket.id).has(roomId)) {
        return emitError(socket, 'You must join the chat room first');
      }

      // Verify access
      const hasAccess = await chatService.verifyRoomAccess(roomId, userId, userRole);
      if (!hasAccess) {
        return emitError(socket, 'Access denied to this chat room');
      }

      // Sanitize
      const sanitizedContent = chatService.sanitizeContent(content);
      const sanitizedAttachments = attachments
        ? chatService.sanitizeAttachments(attachments)
        : [];

      // Determine sender role
      const senderRole =
        userRole === UserRole.ADMIN ? SenderRole.ADMIN : SenderRole.CUSTOMER;

      // Persist
      const message = await chatService.createMessage({
        roomId,
        senderId: userId,
        senderRole,
        content: sanitizedContent,
        attachments: sanitizedAttachments,
      });

      // Broadcast to room (including sender)
      namespace.to(roomId).emit(CHAT_EVENTS.NEW_MESSAGE, {
        roomId,
        message,
      });

      // Increment unread counter for the OTHER side
      const otherCounterField =
        userRole === UserRole.ADMIN ? 'unreadCountCustomer' : 'unreadCountAdmin';
      await chatService.incrementUnreadCount(roomId, otherCounterField);

      // Notify room update (for admin room list)
      namespace.emit(CHAT_EVENTS.ROOM_UPDATED, { roomId });
    } catch (error) {
      logger.error({ err: error }, 'Error in send-message handler');
      emitError(socket, 'Failed to send message');
    }
  });

  // ─── TYPING ───
  socket.on(CHAT_EVENTS.TYPING, (data: { roomId?: string }) => {
    const roomId = data?.roomId;
    if (!roomId || !getJoinedRooms(socket.id).has(roomId)) return;

    socket.to(roomId).emit(CHAT_EVENTS.USER_TYPING, {
      roomId,
      userId,
      userName,
    });
  });

  // ─── STOP TYPING ───
  socket.on(CHAT_EVENTS.STOP_TYPING, (data: { roomId?: string }) => {
    const roomId = data?.roomId;
    if (!roomId || !getJoinedRooms(socket.id).has(roomId)) return;

    socket.to(roomId).emit(CHAT_EVENTS.USER_STOP_TYPING, {
      roomId,
      userId,
    });
  });

  // ─── MESSAGE READ ───
  socket.on(CHAT_EVENTS.MESSAGE_READ, async (data: { roomId?: string }) => {
    try {
      const roomId = data?.roomId;
      if (!roomId || !getJoinedRooms(socket.id).has(roomId)) return;

      await chatService.markMessagesAsRead(roomId, userId);

      const counterField =
        userRole === UserRole.ADMIN ? 'unreadCountAdmin' : 'unreadCountCustomer';
      await chatService.resetUnreadCount(roomId, counterField);

      // Notify room about read status
      socket.to(roomId).emit(CHAT_EVENTS.MESSAGE_STATUS_UPDATE, {
        roomId,
        userId,
        status: 'read',
      });
    } catch (error) {
      logger.error({ err: error }, 'Error in message-read handler');
    }
  });

  // ─── LOAD MORE (cursor-based pagination) ───
  socket.on(
    CHAT_EVENTS.LOAD_MORE,
    async (data: { roomId?: string; cursor?: string }) => {
      try {
        const roomId = data?.roomId;
        if (!roomId || !getJoinedRooms(socket.id).has(roomId)) {
          return emitError(socket, 'You must join the chat room first');
        }

        const messages = await chatService.getMessages(
          roomId,
          data.cursor,
          CHAT_DEFAULTS.PAGINATION_LIMIT,
        );

        socket.emit(CHAT_EVENTS.CHAT_HISTORY, {
          roomId,
          messages,
          isLoadMore: true,
        });
      } catch (error) {
        logger.error({ err: error }, 'Error in load-more handler');
        emitError(socket, 'Failed to load messages');
      }
    },
  );

  // ─── GET ROOMS (Admin only) ───
  socket.on(
    CHAT_EVENTS.GET_ROOMS,
    async (data?: { cursor?: string; limit?: number }) => {
      try {
        if (userRole !== UserRole.ADMIN) {
          return emitError(socket, 'Only admins can view all rooms');
        }

        const rooms = await chatService.getRoomsForAdmin(
          data?.cursor,
          data?.limit,
        );

        socket.emit(CHAT_EVENTS.ROOMS_LIST, { rooms });
      } catch (error) {
        logger.error({ err: error }, 'Error in get-rooms handler');
        emitError(socket, 'Failed to load rooms');
      }
    },
  );

  // ─── CLOSE CHAT (Admin only) ───
  socket.on(CHAT_EVENTS.CLOSE_CHAT, async (data: { roomId?: string }) => {
    try {
      if (userRole !== UserRole.ADMIN) {
        return emitError(socket, 'Only admins can close chats');
      }

      const roomId = data?.roomId;
      if (!roomId) {
        return emitError(socket, 'Room ID is required');
      }

      await chatService.closeRoom(roomId);

      // Notify everyone in the room
      namespace.to(roomId).emit(CHAT_EVENTS.ROOM_UPDATED, {
        roomId,
        status: 'closed',
      });

      logger.info(`Chat room ${roomId} closed by admin ${userId}`);
    } catch (error) {
      logger.error({ err: error }, 'Error in close-chat handler');
      emitError(socket, 'Failed to close chat');
    }
  });

  // ─── CLEANUP on disconnect ───
  socket.on('disconnect', () => {
    socketRooms.delete(socket.id);
  });
}
