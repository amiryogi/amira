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

export function registerChatHandlers(namespace: Namespace, socket: Socket): void {
  const userId = socket.data.userId as string;
  const userRole = socket.data.userRole as string;
  const userName = socket.data.userName as string;

  // ─── JOIN CHAT ───
  socket.on(CHAT_EVENTS.JOIN_CHAT, async (data: unknown, callback?: (response: unknown) => void) => {
    const cb = typeof callback === 'function' ? callback : (() => {});
    try {
      const parsed = joinChatSchema.safeParse(data);
      if (!parsed.success) {
        return cb({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
      }

      let roomId = parsed.data.roomId;
      let room;

      // If USER → find or create their room
      if (userRole === UserRole.USER) {
        room = await chatService.findOrCreateRoom(userId);
        roomId = room._id.toString();
      }

      if (!roomId) {
        return cb({ error: 'Room ID is required for admin' });
      }

      // Verify access
      const hasAccess = await chatService.verifyRoomAccess(roomId, userId, userRole);
      if (!hasAccess) {
        return cb({ error: 'Access denied to this chat room' });
      }

      // Join the Socket.IO room
      await socket.join(roomId);
      getJoinedRooms(socket.id).add(roomId);

      // If ADMIN → assign self to room and get populated room
      if (userRole === UserRole.ADMIN) {
        await chatService.assignAdminToRoom(roomId, userId);
        room = await chatService.findRoomByIdPopulated(roomId);
      }

      // Fallback: fetch room if not loaded yet
      if (!room) {
        room = await chatService.findRoomById(roomId);
      }

      // Mark messages as delivered (they opened the chat)
      await chatService.markMessagesAsDelivered(roomId, userId);

      // Reset unread count for the joining user
      const counterField =
        userRole === UserRole.ADMIN ? 'unreadCountAdmin' : 'unreadCountCustomer';
      await chatService.resetUnreadCount(roomId, counterField);

      // Load initial messages (newest first from DB, reverse for chronological)
      const messages = await chatService.getMessages(
        roomId,
        undefined,
        CHAT_DEFAULTS.INITIAL_MESSAGE_LIMIT,
      );

      cb({
        success: true,
        room,
        messages: messages.reverse(),
        hasMore: messages.length >= CHAT_DEFAULTS.INITIAL_MESSAGE_LIMIT,
      });
    } catch (error) {
      logger.error({ err: error }, 'Error in join-chat handler');
      cb({ error: 'Failed to join chat' });
    }
  });

  // ─── SEND MESSAGE ───
  socket.on(CHAT_EVENTS.SEND_MESSAGE, async (data: unknown, callback?: (response: unknown) => void) => {
    const cb = typeof callback === 'function' ? callback : (() => {});
    try {
      // Rate limit
      try {
        await messageLimiter.consume(userId);
      } catch {
        return cb({ error: 'Too many messages. Please slow down.' });
      }

      // Validate
      const parsed = sendMessageSchema.safeParse(data);
      if (!parsed.success) {
        return cb({ error: parsed.error.errors[0]?.message ?? 'Invalid message' });
      }

      const { roomId, content, attachments } = parsed.data;

      // Verify sender has joined this room
      if (!getJoinedRooms(socket.id).has(roomId)) {
        return cb({ error: 'You must join the chat room first' });
      }

      // Verify access
      const hasAccess = await chatService.verifyRoomAccess(roomId, userId, userRole);
      if (!hasAccess) {
        return cb({ error: 'Access denied to this chat room' });
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

      // Broadcast to room (including sender) — send message directly, not wrapped
      namespace.to(roomId).emit(CHAT_EVENTS.NEW_MESSAGE, message);

      // Increment unread counter for the OTHER side
      const otherCounterField =
        userRole === UserRole.ADMIN ? 'unreadCountCustomer' : 'unreadCountAdmin';
      await chatService.incrementUnreadCount(roomId, otherCounterField);

      // Notify room update (for admin room list)
      namespace.emit(CHAT_EVENTS.ROOM_UPDATED, { roomId });

      cb({ success: true, message });
    } catch (error) {
      logger.error({ err: error }, 'Error in send-message handler');
      cb({ error: 'Failed to send message' });
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
  socket.on(CHAT_EVENTS.MESSAGE_READ, async (data: { roomId?: string }, callback?: (response: unknown) => void) => {
    const cb = typeof callback === 'function' ? callback : (() => {});
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

      cb({ success: true });
    } catch (error) {
      logger.error({ err: error }, 'Error in message-read handler');
      cb({ error: 'Failed to mark as read' });
    }
  });

  // ─── LOAD MORE (cursor-based pagination) ───
  socket.on(
    CHAT_EVENTS.LOAD_MORE,
    async (data: { roomId?: string; cursor?: string; before?: string }, callback?: (response: unknown) => void) => {
      const cb = typeof callback === 'function' ? callback : (() => {});
      try {
        const roomId = data?.roomId;
        if (!roomId || !getJoinedRooms(socket.id).has(roomId)) {
          return cb({ error: 'You must join the chat room first' });
        }

        // Support both 'cursor' and 'before' field names from clients
        const cursorId = data.cursor || data.before;

        const messages = await chatService.getMessages(
          roomId,
          cursorId,
          CHAT_DEFAULTS.PAGINATION_LIMIT,
        );

        cb({
          success: true,
          messages: messages.reverse(),
          hasMore: messages.length >= CHAT_DEFAULTS.PAGINATION_LIMIT,
        });
      } catch (error) {
        logger.error({ err: error }, 'Error in load-more handler');
        cb({ error: 'Failed to load messages' });
      }
    },
  );

  // ─── GET ROOMS (Admin only) ───
  socket.on(
    CHAT_EVENTS.GET_ROOMS,
    async (data: { cursor?: string; limit?: number } | undefined, callback?: (response: unknown) => void) => {
      const cb = typeof callback === 'function' ? callback : (() => {});
      try {
        if (userRole !== UserRole.ADMIN) {
          return cb({ error: 'Only admins can view all rooms' });
        }

        const limit = data?.limit || 20;
        const rooms = await chatService.getRoomsForAdmin(
          data?.cursor,
          limit,
        );

        cb({
          success: true,
          rooms,
          hasMore: rooms.length >= limit,
        });
      } catch (error) {
        logger.error({ err: error }, 'Error in get-rooms handler');
        cb({ error: 'Failed to load rooms' });
      }
    },
  );

  // ─── CLOSE CHAT (Admin only) ───
  socket.on(CHAT_EVENTS.CLOSE_CHAT, async (data: { roomId?: string }, callback?: (response: unknown) => void) => {
    const cb = typeof callback === 'function' ? callback : (() => {});
    try {
      if (userRole !== UserRole.ADMIN) {
        return cb({ error: 'Only admins can close chats' });
      }

      const roomId = data?.roomId;
      if (!roomId) {
        return cb({ error: 'Room ID is required' });
      }

      await chatService.closeRoom(roomId);

      // Notify everyone in the room
      namespace.to(roomId).emit(CHAT_EVENTS.ROOM_UPDATED, {
        roomId,
        status: 'closed',
      });

      logger.info(`Chat room ${roomId} closed by admin ${userId}`);
      cb({ success: true });
    } catch (error) {
      logger.error({ err: error }, 'Error in close-chat handler');
      cb({ error: 'Failed to close chat' });
    }
  });

  // ─── CLEANUP on disconnect ───
  socket.on('disconnect', () => {
    socketRooms.delete(socket.id);
  });
}
