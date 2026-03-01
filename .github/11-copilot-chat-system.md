# 💬 CHAT SYSTEM IMPLEMENTATION CONTROL FILE
## Nepal Woolen eCommerce (MERN + TS Monorepo)

You are GitHub Copilot Pro acting as a Senior Full Stack Architect.

Implement a real-time Customer ↔ Admin chat system across the monorepo:
`packages/shared`, `packages/api`, `apps/web`, `apps/admin`, `apps/mobile`.

This file is the single source of truth for the chat feature.
Follow every instruction strictly. Do NOT deviate from the architecture.

---

# REFERENCE: AUDITED SOURCE

The working chat system in `d:\amira\nevan` was audited.
This plan ports the architecture into the `@amira` monorepo,
fixing all identified defects. Every "FIX" note below references
a specific gap found in the `nevan` implementation.

---

# ARCHITECTURE RULES (MANDATORY)

1. **MongoDB is the source of truth** — Socket.IO is transport only
2. On reconnect, always resync messages from the database
3. Reuse existing middleware, utilities, and patterns — do NOT create duplicates
4. All types, enums, Zod schemas, and constants go in `@amira/shared`
5. Backend follows Controller → Service → Repository pattern (same as all other modules)
6. Web and Admin use **Zustand** for state (NOT Redux)
7. Mobile uses **Zustand** for state (NOT Redux)
8. All API calls use the existing Axios instances with interceptors
9. Use `API_ENDPOINTS` from `@amira/shared/api` for REST paths
10. Use `CHAT_EVENTS` from `@amira/shared` for socket event names
11. All socket event handlers must validate room membership before acting
12. Use atomic MongoDB operations (`$inc`, `findOneAndUpdate` with `upsert`) — never `room.save()` for counters

---

# SCOPE

## Phase 1 — MVP (This File Covers Phases 1–4)

| ✅ Included | ❌ Excluded (Future) |
|------------|---------------------|
| One customer ↔ one admin | Multiple admin assignment |
| Text messages only (Phase 1) | Chat transfer between admins |
| Image attachments (Phase 2) | Video/file attachments |
| Real-time messaging (Socket.IO) | Offline message queue |
| MongoDB persistence | End-to-end encryption |
| Message history (cursor-based pagination) | Message search |
| JWT-based socket authentication | OAuth socket auth |
| Typing indicators | Voice messages |
| Read receipts | Message editing/deletion |
| Unread counts | Chat export |
| Admin chat dashboard (web + mobile) | Analytics dashboard |
| Push notifications (mobile, Phase 3) | Email notifications for chat |

---

# PHASE 1: SHARED PACKAGE + BACKEND INFRASTRUCTURE

## Goal
Set up shared types/schemas/constants and the Socket.IO server infrastructure
in `packages/api`. No UI work yet — backend must be solid first.

---

## Phase 1, Step 1: Shared Package (`packages/shared`)

### 1.1 Create Chat Enums

File: `packages/shared/src/enums/chat.enum.ts`

```typescript
export enum ChatRoomStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

export enum SenderRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}
```

### 1.2 Create Chat Types

File: `packages/shared/src/types/chat.types.ts`

```typescript
import { ChatRoomStatus, MessageStatus, SenderRole } from '../enums/chat.enum';

export interface IChatRoom {
  _id: string;
  customerId: string;
  adminId?: string;
  status: ChatRoomStatus;
  unreadCountCustomer: number;
  unreadCountAdmin: number;
  lastMessageAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatRoomPopulated extends Omit<IChatRoom, 'customerId' | 'adminId'> {
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  adminId?: {
    _id: string;
    name: string;
  };
}

export interface ChatAttachment {
  type: 'image';
  url: string;
}

export interface IChatMessage {
  _id: string;
  roomId: string;
  senderId: string;
  senderRole: SenderRole;
  content: string;
  attachments: ChatAttachment[];
  status: MessageStatus;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Input types
export interface SendMessageInput {
  roomId: string;
  content: string;
  attachments?: ChatAttachment[];
}

export interface JoinChatInput {
  roomId?: string; // Optional — if omitted, server finds/creates room
}
```

### 1.3 Create Chat Zod Schemas

File: `packages/shared/src/schemas/chat.schema.ts`

```typescript
import { z } from 'zod';

export const sendMessageSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters')
    .trim(),
  attachments: z
    .array(
      z.object({
        type: z.literal('image'),
        url: z
          .string()
          .url('Invalid attachment URL')
          .refine((url) => url.startsWith('https://'), 'Attachments must use HTTPS'),
      }),
    )
    .max(5, 'Maximum 5 attachments per message')
    .optional()
    .default([]),
});

export const joinChatSchema = z.object({
  roomId: z.string().optional(),
});

export type SendMessageSchemaType = z.infer<typeof sendMessageSchema>;
export type JoinChatSchemaType = z.infer<typeof joinChatSchema>;
```

### 1.4 Create Chat Constants

File: `packages/shared/src/constants/chat.constants.ts`

```typescript
/**
 * Socket.IO event names for the chat system.
 * Used by both client and server to ensure consistency.
 */
export const CHAT_EVENTS = {
  // Client → Server
  JOIN_CHAT: 'join-chat',
  SEND_MESSAGE: 'send-message',
  TYPING: 'typing',
  STOP_TYPING: 'stop-typing',
  MESSAGE_READ: 'message-read',
  GET_ROOMS: 'get-rooms',
  LOAD_MORE: 'load-more',
  CLOSE_CHAT: 'close-chat',

  // Server → Client
  CHAT_HISTORY: 'chat-history',
  NEW_MESSAGE: 'new-message',
  MESSAGE_STATUS_UPDATE: 'message-status-update',
  USER_TYPING: 'user-typing',
  USER_STOP_TYPING: 'user-stop-typing',
  ROOMS_LIST: 'rooms-list',
  ROOM_UPDATED: 'room-updated',
  CHAT_ERROR: 'chat-error',
} as const;

export const CHAT_DEFAULTS = {
  /** Number of messages loaded on join */
  INITIAL_MESSAGE_LIMIT: 50,
  /** Number of messages per "load more" request */
  PAGINATION_LIMIT: 30,
  /** Max message content length */
  MAX_MESSAGE_LENGTH: 2000,
  /** Max attachments per message */
  MAX_ATTACHMENTS: 5,
  /** Rate limit: messages per second per user */
  RATE_LIMIT_POINTS: 10,
  /** Rate limit window in seconds */
  RATE_LIMIT_DURATION: 1,
  /** Socket.IO namespace */
  NAMESPACE: '/chat',
  /** Typing indicator timeout (ms) */
  TYPING_TIMEOUT: 3000,
} as const;
```

### 1.5 Add Chat Endpoints to API_ENDPOINTS

File: `packages/shared/src/api/endpoints.ts`

Add to the existing `API_ENDPOINTS` object:

```typescript
CHAT: {
  UPLOAD: '/api/v1/chat/upload',
  ROOMS: '/api/v1/chat/rooms',
  MESSAGES: '/api/v1/chat/rooms/:roomId/messages',
},
```

### 1.6 Export from Shared Index

File: `packages/shared/src/index.ts`

Add these exports:

```typescript
// ─── Chat Enums ───
export { ChatRoomStatus, MessageStatus, SenderRole } from './enums/chat.enum';

// ─── Chat Types ───
export type {
  IChatRoom,
  IChatRoomPopulated,
  IChatMessage,
  ChatAttachment,
  SendMessageInput,
  JoinChatInput,
} from './types/chat.types';

// ─── Chat Constants ───
export { CHAT_EVENTS, CHAT_DEFAULTS } from './constants/chat.constants';
```

Also export from `packages/shared/src/schemas/index.ts` (or wherever schemas barrel-export):

```typescript
export { sendMessageSchema, joinChatSchema } from './chat.schema';
export type { SendMessageSchemaType, JoinChatSchemaType } from './chat.schema';
```

### 1.7 Verification

- Run `pnpm --filter @amira/shared build` — must compile with zero errors
- Run `pnpm --filter @amira/shared typecheck` — must pass

---

## Phase 1, Step 2: Backend — Socket.IO Server Setup

### 2.1 Install Dependencies

In `packages/api`:

```bash
pnpm --filter @amira/api add socket.io xss rate-limiter-flexible
pnpm --filter @amira/api add -D @types/xss
```

Optional (for horizontal scaling — can defer):
```bash
pnpm --filter @amira/api add ioredis @socket.io/redis-adapter
```

### 2.2 Add Socket Config to `config/index.ts`

File: `packages/api/src/config/index.ts`

Add to the existing `config` object:

```typescript
// CORS — extend existing
cors: {
  allowedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.ADMIN_URL || 'http://localhost:5174',
    // Mobile dev URLs if needed
  ].filter(Boolean),
},

// Redis (optional — for Socket.IO scaling)
redis: {
  url: process.env.REDIS_URL || '',
},
```

> NOTE: The existing `frontendUrl` and `adminUrl` fields remain.
> `cors.allowedOrigins` is the unified list used by BOTH Express CORS and Socket.IO.
> FIX from nevan: Unify CORS config — nevan had separate env vars for Socket.IO vs Express.

### 2.3 Create Socket.IO Initialization

File: `packages/api/src/config/socket.ts`

This file:
1. Creates the Socket.IO `Server` instance on the `/chat` namespace
2. Configures CORS using unified `config.cors.allowedOrigins`
3. Optionally attaches Redis adapter (graceful fallback)
4. Wires the socket auth middleware (from Step 2.4)
5. Wires chat event handlers (from Phase 1, Step 3)
6. Manages connection tracking (userId → Set<socketId>)

Key structure:

```typescript
import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { config } from './index.js';
import { logger } from '../utils/logger.js';
import { socketAuthMiddleware } from '../middlewares/socketAuth.middleware.js';
import { registerChatHandlers } from '../modules/chat/chat.socket.js';
import { CHAT_DEFAULTS } from '@amira/shared';

// Connection tracking: userId → Set<socketId>
const connectedUsers = new Map<string, Set<string>>();

export function isUserOnline(userId: string): boolean {
  const sockets = connectedUsers.get(userId);
  return !!sockets && sockets.size > 0;
}

export function addConnection(userId: string, socketId: string): void { ... }
export function removeConnection(userId: string, socketId: string): void { ... }

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.cors.allowedOrigins,
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  const chatNamespace = io.of(CHAT_DEFAULTS.NAMESPACE);

  // Auth middleware
  chatNamespace.use(socketAuthMiddleware);

  // Connection handler
  chatNamespace.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    addConnection(userId, socket.id);
    logger.info(`Socket connected: ${socket.id} (user: ${userId})`);

    // Register chat event handlers
    registerChatHandlers(chatNamespace, socket);

    socket.on('disconnect', (reason) => {
      removeConnection(userId, socket.id);
      logger.info(`Socket disconnected: ${socket.id} (reason: ${reason})`);
    });
  });

  logger.info('Socket.IO initialized on namespace /chat');
  return io;
}
```

> FIX from nevan: Single CORS config source, lean user lookup in auth (Step 2.4),
> no Redis zombie keys (add TTL or use heartbeats in Phase 3).

### 2.4 Create Socket Auth Middleware

File: `packages/api/src/middlewares/socketAuth.middleware.ts`

```typescript
import type { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/token.js'; // existing util
import { User } from '../modules/user/user.model.js'; // existing model
import { logger } from '../utils/logger.js';

export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
): Promise<void> {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.id) {
      return next(new Error('Invalid token'));
    }

    // FIX from nevan: Lean query, select only needed fields
    const user = await User.findById(decoded.id)
      .select('_id role isActive name')
      .lean();

    if (!user) {
      return next(new Error('User not found'));
    }

    if (user.isActive === false) {
      return next(new Error('Account is deactivated'));
    }

    // Attach to socket.data for use in handlers
    socket.data.userId = user._id.toString();
    socket.data.userRole = user.role;
    socket.data.userName = user.name;

    next();
  } catch (error) {
    logger.error('Socket auth error:', error);
    next(new Error('Authentication failed'));
  }
}
```

### 2.5 Modify server.ts

File: `packages/api/src/server.ts`

Change from `app.listen()` to `http.createServer(app)`:

```typescript
import http from 'http';
import { app } from './app.js';
import { config } from './config/index.js';
import { connectDB } from './config/database.js';
import { initializeSocket } from './config/socket.js';
import { logger } from './utils/logger.js';

const start = async (): Promise<void> => {
  await connectDB();

  const httpServer = http.createServer(app);
  initializeSocket(httpServer);

  httpServer.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });

  // Graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down gracefully...');
    httpServer.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
```

### 2.6 Verification

- Run `pnpm --filter @amira/api dev` — server starts without errors
- Console shows: "Socket.IO initialized on namespace /chat"
- No new linting errors

---

## Phase 1, Step 3: Backend — Chat Module

### 3.1 Create Chat Models

File: `packages/api/src/modules/chat/chat.model.ts`

**ChatRoom Schema:**
- `customerId`: ObjectId ref User, required
- `adminId`: ObjectId ref User, optional
- `status`: enum ['open', 'closed'], default 'open'
- `unreadCountCustomer`: Number, default 0
- `unreadCountAdmin`: Number, default 0
- `lastMessageAt`: Date
- Timestamps: true
- Apply `softDeletePlugin`
- **FIX from nevan**: Add unique compound partial index:
  ```typescript
  chatRoomSchema.index(
    { customerId: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'open', isDeleted: false } }
  );
  ```
  This enforces one open room per customer at the DB level, eliminating race conditions.
- Also index `{ adminId: 1, status: 1 }` (non-unique, for admin queries)

**Message Schema:**
- `roomId`: ObjectId ref ChatRoom, required, indexed
- `senderId`: ObjectId ref User, required
- `senderRole`: enum ['customer', 'admin'], required
- `content`: String, maxlength 2000, trim, default ''
- `attachments`: Array of `{ type: 'image', url: String }`
- `status`: enum ['sent', 'delivered', 'read'], default 'sent'
- `deliveredAt`: Date, optional
- `readAt`: Date, optional
- Timestamps: true
- Index: `{ roomId: 1, createdAt: -1 }` (for paginated history)

### 3.2 Create Chat Repository

File: `packages/api/src/modules/chat/chat.repository.ts`

Methods:

```typescript
class ChatRepository {
  // FIX from nevan: Atomic upsert prevents duplicate open rooms
  async findOrCreateRoom(customerId: string): Promise<IChatRoomDoc> {
    return ChatRoom.findOneAndUpdate(
      { customerId, status: 'open', isDeleted: false },
      { $setOnInsert: { customerId, status: 'open' } },
      { upsert: true, new: true },
    );
  }

  // Atomic admin assignment — same pattern as nevan (this was correct)
  async assignAdminToRoom(roomId: string, adminId: string): Promise<IChatRoomDoc | null> {
    return ChatRoom.findOneAndUpdate(
      {
        _id: roomId,
        status: 'open',
        $or: [{ adminId: null }, { adminId: { $exists: false } }, { adminId }],
      },
      { $set: { adminId } },
      { new: true },
    );
  }

  async findRoomById(roomId: string): Promise<IChatRoomDoc | null>;

  async findRoomByCustomer(customerId: string): Promise<IChatRoomDoc | null>;

  // FIX from nevan: Cursor-based pagination instead of skip
  async getMessages(
    roomId: string,
    cursor?: string, // _id of last seen message
    limit: number = CHAT_DEFAULTS.PAGINATION_LIMIT,
  ): Promise<IMessageDoc[]> {
    const query: FilterQuery<IMessageDoc> = { roomId };
    if (cursor) {
      query._id = { $lt: cursor };
    }
    return Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async createMessage(data: CreateMessageData): Promise<IMessageDoc>;

  // FIX from nevan: Atomic $inc instead of room.save()
  async incrementUnreadCount(
    roomId: string,
    field: 'unreadCountCustomer' | 'unreadCountAdmin',
  ): Promise<void> {
    await ChatRoom.updateOne(
      { _id: roomId },
      { $inc: { [field]: 1 }, $set: { lastMessageAt: new Date() } },
    );
  }

  // FIX from nevan: Atomic reset
  async resetUnreadCount(
    roomId: string,
    field: 'unreadCountCustomer' | 'unreadCountAdmin',
  ): Promise<void> {
    await ChatRoom.updateOne({ _id: roomId }, { $set: { [field]: 0 } });
  }

  async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    await Message.updateMany(
      { roomId, senderId: { $ne: userId }, status: { $ne: 'read' } },
      { $set: { status: 'read', readAt: new Date() } },
    );
  }

  async markMessagesAsDelivered(roomId: string, userId: string): Promise<void> {
    await Message.updateMany(
      { roomId, senderId: { $ne: userId }, status: 'sent' },
      { $set: { status: 'delivered', deliveredAt: new Date() } },
    );
  }

  // FIX from nevan: Paginated room list for admin
  async getRoomsForAdmin(
    cursor?: string,
    limit: number = 20,
  ): Promise<IChatRoomPopulatedDoc[]> {
    const query: FilterQuery<IChatRoomDoc> = { status: 'open', isDeleted: false };
    if (cursor) {
      query._id = { $lt: cursor };
    }
    return ChatRoom.find(query)
      .populate('customerId', 'name email')
      .populate('adminId', 'name')
      .sort({ lastMessageAt: -1 })
      .limit(limit)
      .lean();
  }

  async closeRoom(roomId: string): Promise<void> {
    await ChatRoom.updateOne({ _id: roomId }, { $set: { status: 'closed' } });
  }
}
```

### 3.3 Create Chat Service

File: `packages/api/src/modules/chat/chat.service.ts`

Thin service layer that:
- Injects `ChatRepository`
- Delegates all DB operations
- Adds business logic validations (e.g., verify user has access to room)
- Handles XSS sanitization of message content and attachment URLs

```typescript
import xss from 'xss';

class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  sanitizeContent(content: string): string {
    return xss(content.trim());
  }

  sanitizeAttachments(attachments: ChatAttachment[]): ChatAttachment[] {
    return attachments.map((a) => ({ type: a.type, url: xss(a.url) }));
  }

  async verifyRoomAccess(roomId: string, userId: string, userRole: string): Promise<boolean> {
    const room = await this.chatRepository.findRoomById(roomId);
    if (!room) return false;
    if (userRole === 'admin') return true; // admins can access any room
    return room.customerId.toString() === userId;
  }

  // ... delegates to repository for all other operations
}
```

### 3.4 Create Socket Event Handlers

File: `packages/api/src/modules/chat/chat.socket.ts`

This is the core file. It exports `registerChatHandlers(namespace, socket)`.

```typescript
import { Namespace, Socket } from 'socket.io';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { CHAT_EVENTS, CHAT_DEFAULTS, SenderRole } from '@amira/shared';
import { sendMessageSchema } from '@amira/shared/schemas';
import { ChatService } from './chat.service.js';
import { ChatRepository } from './chat.repository.js';
import { isUserOnline } from '../../config/socket.js';
import { logger } from '../../utils/logger.js';

const rateLimiter = new RateLimiterMemory({
  points: CHAT_DEFAULTS.RATE_LIMIT_POINTS,
  duration: CHAT_DEFAULTS.RATE_LIMIT_DURATION,
});

const chatService = new ChatService(new ChatRepository());

export function registerChatHandlers(
  namespace: Namespace,
  socket: Socket,
): void {
  const userId = socket.data.userId as string;
  const userRole = socket.data.userRole as string;
  const userName = socket.data.userName as string;

  // Track which rooms this socket has joined (for typing validation)
  const joinedRooms = new Set<string>();

  // ── JOIN CHAT ─────────────────────────────────────────
  socket.on(CHAT_EVENTS.JOIN_CHAT, async (data, callback) => {
    try {
      let room;

      if (userRole === 'admin') {
        // Admin joins a specific room
        if (!data?.roomId) {
          return callback?.({ error: 'Room ID required for admin' });
        }
        room = await chatService.assignAdminToRoom(data.roomId, userId);
      } else {
        // Customer: find or create their open room (atomic upsert)
        room = await chatService.findOrCreateRoom(userId);
      }

      if (!room) {
        return callback?.({ error: 'Could not join chat room' });
      }

      const roomName = `room:${room._id}`;
      socket.join(roomName);
      joinedRooms.add(roomName);

      // Mark messages as delivered when recipient joins
      await chatService.markMessagesAsDelivered(room._id.toString(), userId);

      // Load initial messages (newest first, then reverse for chronological)
      const messages = await chatService.getMessages(
        room._id.toString(),
        undefined,
        CHAT_DEFAULTS.INITIAL_MESSAGE_LIMIT,
      );

      callback?.({
        success: true,
        room: room,
        messages: messages.reverse(), // Chronological order
      });
    } catch (error) {
      logger.error('join-chat error:', error);
      callback?.({ error: 'Failed to join chat' });
    }
  });

  // ── SEND MESSAGE ──────────────────────────────────────
  socket.on(CHAT_EVENTS.SEND_MESSAGE, async (data, callback) => {
    try {
      // Rate limit
      await rateLimiter.consume(userId);

      // Validate with Zod
      const parsed = sendMessageSchema.safeParse(data);
      if (!parsed.success) {
        return callback?.({ error: parsed.error.errors[0].message });
      }

      const { roomId, content, attachments } = parsed.data;

      // Verify room access
      const hasAccess = await chatService.verifyRoomAccess(roomId, userId, userRole);
      if (!hasAccess) {
        return callback?.({ error: 'Access denied' });
      }

      // Sanitize
      const sanitizedContent = chatService.sanitizeContent(content);
      const sanitizedAttachments = chatService.sanitizeAttachments(attachments ?? []);

      // Save to DB
      const senderRole = userRole === 'admin' ? SenderRole.ADMIN : SenderRole.CUSTOMER;
      const message = await chatService.createMessage({
        roomId,
        senderId: userId,
        senderRole,
        content: sanitizedContent,
        attachments: sanitizedAttachments,
      });

      // FIX from nevan: Atomic unread count increment
      const unreadField =
        senderRole === SenderRole.CUSTOMER ? 'unreadCountAdmin' : 'unreadCountCustomer';
      await chatService.incrementUnreadCount(roomId, unreadField);

      // Broadcast to room
      const roomName = `room:${roomId}`;
      namespace.to(roomName).emit(CHAT_EVENTS.NEW_MESSAGE, message);

      // Notify room of update (for admin room list)
      namespace.emit(CHAT_EVENTS.ROOM_UPDATED, { roomId });

      callback?.({ success: true, message });
    } catch (error: any) {
      if (error?.constructor?.name === 'RateLimiterRes') {
        return callback?.({ error: 'Rate limit exceeded. Please slow down.' });
      }
      logger.error('send-message error:', error);
      callback?.({ error: 'Failed to send message' });
    }
  });

  // ── TYPING ────────────────────────────────────────────
  // FIX from nevan: Validate room membership before broadcasting
  socket.on(CHAT_EVENTS.TYPING, (data) => {
    const roomName = `room:${data?.roomId}`;
    if (!joinedRooms.has(roomName)) return; // Silent reject
    socket.to(roomName).emit(CHAT_EVENTS.USER_TYPING, {
      roomId: data.roomId,
      userId,
      userName,
    });
  });

  socket.on(CHAT_EVENTS.STOP_TYPING, (data) => {
    const roomName = `room:${data?.roomId}`;
    if (!joinedRooms.has(roomName)) return;
    socket.to(roomName).emit(CHAT_EVENTS.USER_STOP_TYPING, {
      roomId: data.roomId,
      userId,
    });
  });

  // ── MESSAGE READ ──────────────────────────────────────
  socket.on(CHAT_EVENTS.MESSAGE_READ, async (data, callback) => {
    try {
      const { roomId } = data;
      const hasAccess = await chatService.verifyRoomAccess(roomId, userId, userRole);
      if (!hasAccess) return callback?.({ error: 'Access denied' });

      await chatService.markMessagesAsRead(roomId, userId);

      // FIX from nevan: Atomic unread reset
      const unreadField =
        userRole === 'admin' ? 'unreadCountAdmin' : 'unreadCountCustomer';
      await chatService.resetUnreadCount(roomId, unreadField);

      // Notify sender that messages were read
      const roomName = `room:${roomId}`;
      socket.to(roomName).emit(CHAT_EVENTS.MESSAGE_STATUS_UPDATE, {
        roomId,
        status: 'read',
        readBy: userId,
      });

      callback?.({ success: true });
    } catch (error) {
      logger.error('message-read error:', error);
      callback?.({ error: 'Failed to mark as read' });
    }
  });

  // ── LOAD MORE (pagination) ────────────────────────────
  // FIX from nevan: Was completely missing — only 50 messages available
  socket.on(CHAT_EVENTS.LOAD_MORE, async (data, callback) => {
    try {
      const { roomId, cursor } = data;
      const hasAccess = await chatService.verifyRoomAccess(roomId, userId, userRole);
      if (!hasAccess) return callback?.({ error: 'Access denied' });

      const messages = await chatService.getMessages(
        roomId,
        cursor,
        CHAT_DEFAULTS.PAGINATION_LIMIT,
      );

      callback?.({
        success: true,
        messages: messages.reverse(),
        hasMore: messages.length === CHAT_DEFAULTS.PAGINATION_LIMIT,
      });
    } catch (error) {
      logger.error('load-more error:', error);
      callback?.({ error: 'Failed to load messages' });
    }
  });

  // ── GET ROOMS (admin only) ────────────────────────────
  // FIX from nevan: Now paginated
  socket.on(CHAT_EVENTS.GET_ROOMS, async (data, callback) => {
    try {
      if (userRole !== 'admin') {
        return callback?.({ error: 'Admin access required' });
      }

      const rooms = await chatService.getRoomsForAdmin(data?.cursor, data?.limit);

      callback?.({
        success: true,
        rooms,
        hasMore: rooms.length === (data?.limit || 20),
      });
    } catch (error) {
      logger.error('get-rooms error:', error);
      callback?.({ error: 'Failed to get rooms' });
    }
  });

  // ── CLOSE CHAT (admin only) ───────────────────────────
  socket.on(CHAT_EVENTS.CLOSE_CHAT, async (data, callback) => {
    try {
      if (userRole !== 'admin') {
        return callback?.({ error: 'Admin access required' });
      }

      await chatService.closeRoom(data.roomId);

      const roomName = `room:${data.roomId}`;
      namespace.to(roomName).emit(CHAT_EVENTS.ROOM_UPDATED, {
        roomId: data.roomId,
        status: 'closed',
      });

      callback?.({ success: true });
    } catch (error) {
      logger.error('close-chat error:', error);
      callback?.({ error: 'Failed to close chat' });
    }
  });
}
```

### 3.5 Create Chat Controller (REST — for file upload)

File: `packages/api/src/modules/chat/chat.controller.ts`

```typescript
import { Request, Response } from 'express';
import { sendResponse } from '../../common/responseFormatter.js';
import { uploadToCloudinary } from '../../config/cloudinary.js';

export class ChatController {
  static async uploadAttachment(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      sendResponse(res, 400, 'No file uploaded');
      return;
    }

    const result = await uploadToCloudinary(req.file, 'amira/chat');

    sendResponse(res, 200, 'File uploaded successfully', {
      type: 'image',
      url: result.secure_url,
    });
  }
}
```

### 3.6 Create Chat Routes

File: `packages/api/src/modules/chat/chat.routes.ts`

```typescript
import { Router } from 'express';
import { ChatController } from './chat.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { upload } from '../../middlewares/upload.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.post(
  '/upload',
  authMiddleware,
  upload.single('image'),
  asyncHandler(ChatController.uploadAttachment),
);

export { router as chatRoutes };
```

### 3.7 Register Chat Routes

File: `packages/api/src/routes/index.ts`

Add:
```typescript
import { chatRoutes } from '../modules/chat/chat.routes.js';
router.use('/chat', chatRoutes);
```

### 3.8 Create Chat DTOs

File: `packages/api/src/modules/chat/chat.dto.ts`

```typescript
import type { IChatMessage, IChatRoom, IChatRoomPopulated } from '@amira/shared';

export interface ChatRoomResponse extends IChatRoom {}
export interface ChatRoomPopulatedResponse extends IChatRoomPopulated {}
export interface ChatMessageResponse extends IChatMessage {}

export interface ChatHistoryResponse {
  room: ChatRoomResponse;
  messages: ChatMessageResponse[];
}

export interface PaginatedMessagesResponse {
  messages: ChatMessageResponse[];
  hasMore: boolean;
}

export interface PaginatedRoomsResponse {
  rooms: ChatRoomPopulatedResponse[];
  hasMore: boolean;
}
```

### 3.9 Create Chat Validation

File: `packages/api/src/modules/chat/chat.validation.ts`

```typescript
// Re-export from @amira/shared for consistency with other modules
export { sendMessageSchema, joinChatSchema } from '@amira/shared/schemas';
```

### 3.10 Verification

- Run `pnpm --filter @amira/api dev` — server starts, Socket.IO initializes
- Use a Socket.IO client (e.g., Postman or a test script) to:
  - Connect to `ws://localhost:5000/chat` with valid JWT
  - Emit `join-chat` → receive `chat-history` callback
  - Emit `send-message` → receive `new-message` broadcast
- Verify MongoDB has `chatrooms` and `messages` collections with correct indexes

---

# PHASE 2: WEB APP — CUSTOMER CHAT + ADMIN DASHBOARD

## Goal
Build the customer chat widget for `apps/web` and the admin chat dashboard for `apps/admin`.

---

## Phase 2, Step 1: Web Customer App (`apps/web`)

### 1.1 Install Dependencies

```bash
pnpm --filter @amira/web add socket.io-client
```

### 1.2 Create Socket Service

File: `apps/web/src/services/socket.ts`

Singleton class:

```typescript
import { io, Socket } from 'socket.io-client';
import { CHAT_DEFAULTS } from '@amira/shared';
import { useAuthStore } from '../store/auth.store';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  connect(): Socket {
    if (this.socket?.connected) return this.socket;

    const token = useAuthStore.getState().token;
    if (!token) throw new Error('No auth token');

    // Derive socket URL: strip /api/v1 from API base
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

    this.socket = io(`${baseUrl}${CHAT_DEFAULTS.NAMESPACE}`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect_error', async (error) => {
      if (error.message.includes('Authentication') && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        // FIX from nevan: Integrate with existing token refresh
        try {
          await useAuthStore.getState().refreshToken();
          const newToken = useAuthStore.getState().token;
          if (newToken && this.socket) {
            this.socket.auth = { token: newToken };
            this.socket.connect();
          }
        } catch {
          this.disconnect();
        }
      }
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
    });

    return this.socket;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.reconnectAttempts = 0;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
```

### 1.3 Create Chat Store (Zustand)

File: `apps/web/src/store/chat.store.ts`

```typescript
import { create } from 'zustand';
import type { IChatMessage, IChatRoom } from '@amira/shared';

interface TypingUser {
  userId: string;
  userName: string;
}

interface ChatState {
  // UI state
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Chat data
  activeRoomId: string | null;
  activeRoom: IChatRoom | null;
  messages: IChatMessage[];
  unreadCount: number;
  typingUsers: TypingUser[];
  hasMoreMessages: boolean;

  // Connection
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';

  // Actions
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  setActiveRoom: (room: IChatRoom) => void;
  setMessages: (messages: IChatMessage[]) => void;
  prependMessages: (messages: IChatMessage[], hasMore: boolean) => void;
  addMessage: (message: IChatMessage) => void;
  updateMessageStatus: (roomId: string, status: string) => void;
  setConnectionStatus: (status: ChatState['connectionStatus']) => void;
  setTypingUser: (user: TypingUser) => void;
  removeTypingUser: (userId: string) => void;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  reset: () => void;
}

const initialState = {
  isOpen: false,
  isLoading: false,
  error: null,
  activeRoomId: null,
  activeRoom: null,
  messages: [],
  unreadCount: 0,
  typingUsers: [],
  hasMoreMessages: true,
  connectionStatus: 'disconnected' as const,
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,

  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  setActiveRoom: (room) =>
    set({ activeRoom: room, activeRoomId: room._id }),

  setMessages: (messages) => set({ messages }),

  prependMessages: (messages, hasMore) =>
    set((s) => ({
      // Deduplicate by _id
      messages: [
        ...messages.filter((m) => !s.messages.some((existing) => existing._id === m._id)),
        ...s.messages,
      ],
      hasMoreMessages: hasMore,
    })),

  // FIX from nevan: Dedup by _id to prevent double-renders
  addMessage: (message) =>
    set((s) => {
      if (s.messages.some((m) => m._id === message._id)) return s;
      return { messages: [...s.messages, message] };
    }),

  updateMessageStatus: (roomId, status) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.roomId === roomId && m.status !== 'read'
          ? { ...m, status: status as IChatMessage['status'] }
          : m,
      ),
    })),

  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setTypingUser: (user) =>
    set((s) => ({
      typingUsers: s.typingUsers.some((t) => t.userId === user.userId)
        ? s.typingUsers
        : [...s.typingUsers, user],
    })),
  removeTypingUser: (userId) =>
    set((s) => ({ typingUsers: s.typingUsers.filter((t) => t.userId !== userId) })),
  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setHasMore: (hasMore) => set({ hasMoreMessages: hasMore }),
  reset: () => set(initialState),
}));
```

### 1.4 Create useChat Hook

File: `apps/web/src/hooks/useChat.ts`

This hook manages the full socket lifecycle:

- On mount: connect socket, register event listeners
- On unmount: remove listeners, disconnect
- Exposes: `sendMessage`, `markAsRead`, `startTyping`, `stopTyping`, `loadMore`
- Uses `useRef` for `activeRoomId` to avoid stale closures in callbacks
- **FIX from nevan**: Always clean up listeners before re-registering (prevents duplication)
- **FIX from nevan**: On reconnect, auto re-join room and re-fetch history

### 1.5 Create Chat UI Components

Directory: `apps/web/src/components/chat/`

**ChatWidget.tsx** — Floating button (bottom-right corner)
- Shows unread badge count
- Connection status dot (green/yellow/red)
- Only renders for authenticated users (check `useAuthStore`)
- Toggles chat window open/close
- Uses Tailwind CSS

**ChatWindow.tsx** — Main chat panel
- Slides up from bottom-right
- Header: "Support Chat" title, connection status, close button
- Body: `<MessageList />`
- Footer: `<MessageInput />` + `<TypingIndicator />`

**MessageList.tsx** — Scrollable message container
- Maps `messages` from `useChatStore`
- Auto-scrolls to bottom on new messages
- **FIX from nevan**: Only auto-scroll if user is within 100px of bottom; otherwise show "New messages ↓" pill
- "Load more" button/spinner at top when `hasMoreMessages` is true

**MessageBubble.tsx** — Individual message
- Right-aligned (blue gradient) for own messages
- Left-aligned (gray) for received messages
- Shows sender role label ("You" / "Support")
- Timestamp (relative: "2m ago")
- **FIX from nevan**: Read receipt icons (✓ sent, ✓✓ delivered, blue ✓✓ read) — actually connected to message `status` prop
- Image attachments with lazy loading and max-height constraint

**MessageInput.tsx** — Text input + actions
- Text input with 2000-char limit (show counter near limit)
- Send button (disabled when empty)
- Image upload button → POST to `/api/v1/chat/upload` → emit `send-message` with attachment
- Typing indicator: emit `typing` on keypress, `stop-typing` on 2s debounce

**TypingIndicator.tsx** — Animated dots
- Shows "{name} is typing..." when `typingUsers` is non-empty
- Auto-dismisses after `CHAT_DEFAULTS.TYPING_TIMEOUT`

### 1.6 Integrate ChatWidget into App

File: `apps/web/src/app/App.tsx`

Add `<ChatWidget />` inside the layout, visible on all pages for authenticated users:

```tsx
{isAuthenticated && <ChatWidget />}
```

### 1.7 Verification

- Login as customer → floating chat button appears (bottom-right)
- Click button → chat window slides up
- Send message → message appears in list
- Open admin → respond → customer sees message in real-time
- Typing indicator appears bidirectionally
- Refresh page → messages reload from server

---

## Phase 2, Step 2: Admin Dashboard Chat (`apps/admin`)

### 2.1 Install Dependencies

```bash
pnpm --filter @amira/admin add socket.io-client
```

### 2.2 Create Socket Service for Admin

File: `apps/admin/src/lib/socket.ts`

Same singleton pattern as web, but token comes from admin auth provider's in-memory storage.

### 2.3 Create Admin Chat Pages

Directory: `apps/admin/src/pages/chat/`

**ChatListPage.tsx** — Room list
- Table with columns: Customer, Last Message, Unread, Last Activity, Status
- Uses `get-rooms` socket event with cursor pagination
- Click row → navigate to room detail
- Unread badge on rows with unread messages
- Auto-refresh on `room-updated` events
- Uses `@tanstack/react-table` (already installed in admin)

**ChatRoomPage.tsx** — Individual room chat
- Full-width message view (same `MessageList` + `MessageBubble` pattern)
- Customer info sidebar (name, email, order history link)
- `MessageInput` at bottom
- "Close Chat" button in header (emits `close-chat`)
- Mark messages as read on entry

### 2.4 Register Chat Resource in Refine

File: `apps/admin/src/app/App.tsx`

Add to the Refine `resources` array:

```tsx
{
  name: 'chat',
  list: '/chat',
  show: '/chat/:id',
  meta: { label: 'Chat', icon: <MessageSquareIcon /> },
}
```

Add routes:

```tsx
<Route path="/chat" element={<ChatListPage />} />
<Route path="/chat/:id" element={<ChatRoomPage />} />
```

### 2.5 Add Chat Nav Item to Sidebar

File: `apps/admin/src/layouts/AdminLayout.tsx`

Add "Chat" with `MessageSquare` icon from `lucide-react` to the sidebar nav array.
Show unread badge (total unreadCountAdmin across all rooms).

### 2.6 Verification

- Login as admin → "Chat" appears in sidebar
- Click Chat → room list page loads
- Customer sends message → room appears in list with unread badge
- Click room → chat opens, messages load
- Reply as admin → customer sees reply in real-time
- Close Chat → room moves to closed status

---

# PHASE 3: MOBILE APP — CUSTOMER + ADMIN CHAT

## Goal
Build chat screens for both customer and admin roles in `apps/mobile`.
This was a gap in `nevan` where mobile only supported customer chat.

---

## Phase 3, Step 1: Mobile Socket + State

### 1.1 Install Dependencies

```bash
pnpm --filter @amira/mobile add socket.io-client
```

### 1.2 Create Socket Service

File: `apps/mobile/src/services/socket.ts`

Same singleton pattern but:
- `connect()` is `async` — reads token from existing `getTokens()` (SecureStore)
- **FIX from nevan**: Add token refresh on `connect_error` using existing `refreshAccessToken` from auth service
- On reconnect, auto re-join room

### 1.3 Create Chat Store (Zustand)

File: `apps/mobile/src/store/chat.store.ts`

Same as web store (minus `isOpen` — mobile uses navigation for open/close):
- `activeRoomId`, `activeRoom`, `messages`, `connectionStatus`, `typingUsers`, `unreadCount`, `hasMoreMessages`
- Actions: `setActiveRoom`, `addMessage`, `setMessages`, `prependMessages`, `updateMessageStatus`, `setTypingUser`, `removeTypingUser`, `reset`

### 1.4 Create useChat Hook

File: `apps/mobile/src/hooks/useChat.ts`

Same socket lifecycle management as web, but uses `useFocusEffect` from React Navigation:
- Connect socket on screen **focus**
- Disconnect on screen **blur** (saves battery/data)
- Auto re-join room on reconnect

---

## Phase 3, Step 2: Customer Chat Screen

### 2.1 ChatScreen

File: `apps/mobile/src/screens/user/ChatScreen.tsx`

- `FlatList` (inverted) for messages — better RN performance than manual scroll
- `KeyboardAvoidingView` with **FIX from nevan**: Use `useHeaderHeight()` for dynamic `keyboardVerticalOffset` instead of hardcoded values
- Message bubbles (right/left aligned)
- Text input with 2000-char limit + send button
- Image picker: `expo-image-picker` → FormData upload to `/api/v1/chat/upload` → send with attachment
- Typing indicator component
- Connection status banner (shown only when disconnected/reconnecting)
- Error state with retry button

### 2.2 Add to Navigation

Update `apps/mobile/src/navigation/RootNavigator.tsx`:

- Add `Chat` screen to user profile stack (or main stack):
  ```tsx
  <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Support Chat' }} />
  ```

- Add navigation trigger: "Chat with Support" button in Profile screen or a floating action button

Update navigation type definitions in `apps/mobile/src/navigation/types.ts`:
```typescript
// Add to UserStackParamList
Chat: undefined;
```

---

## Phase 3, Step 3: Admin Chat Screens (NEW — missing in nevan)

### 3.1 AdminChatListScreen

File: `apps/mobile/src/screens/admin/AdminChatListScreen.tsx`

- `FlatList` of open chat rooms
- Each item: customer name, last message preview (truncated), unread badge, relative timestamp
- Pull-to-refresh
- Real-time updates via `room-updated` event
- Tap → navigate to `AdminChatRoom`

### 3.2 AdminChatRoomScreen

File: `apps/mobile/src/screens/admin/AdminChatRoomScreen.tsx`

- Same `FlatList` + `KeyboardAvoidingView` pattern as customer
- Header shows customer name
- "Close Chat" action in header right (headerRight)
- Typing indicator + read receipts

### 3.3 Add to Admin Navigation

Update admin stack/tabs in `apps/mobile/src/navigation/RootNavigator.tsx`:

- Add `AdminChatList` and `AdminChatRoom` to admin navigation
- Add "Chat" tab with badge to admin bottom tabs (or add to admin stack)

Update type definitions:
```typescript
// Add to AdminStackParamList
AdminChatList: undefined;
AdminChatRoom: { roomId: string; customerName?: string };
```

---

## Phase 3, Step 4: Shared Mobile Components

Directory: `apps/mobile/src/components/chat/`

- **MessageBubble.tsx** — NativeWind styled, right/left alignment, read receipts, timestamps, image attachments with `expo-image` for caching
- **MessageInput.tsx** — `TextInput` + send + image picker buttons, keyboard-aware
- **TypingIndicator.tsx** — Animated dots with NativeWind
- **ChatRoomCard.tsx** — List item for admin room list (customer name, preview, badge, time)
- **ConnectionBanner.tsx** — Top banner showing "Connecting..." / "Connection lost" with retry

### Phase 3 Verification

- Customer: Login → Profile → "Support Chat" → send message → appears in real-time
- Admin (mobile): Login → Chat tab → see room list → tap room → respond → customer sees reply
- Kill app → reopen → messages persist from server
- Background/foreground → socket reconnects, messages resync

---

# PHASE 4: TESTING + HARDENING

## Goal
Ensure production-readiness with comprehensive tests and bug fixes.

---

## Phase 4, Step 1: Backend Tests

File: `packages/api/src/modules/chat/__tests__/`

### chat.repository.test.ts — Unit tests
- `findOrCreateRoom`: creates room if none exists, returns existing if one exists
- `findOrCreateRoom`: concurrent calls don't create duplicates (test with parallel promises)
- `assignAdminToRoom`: assigns admin atomically, rejects if different admin assigned
- `getMessages`: returns paginated results with cursor
- `incrementUnreadCount`: atomic increment verified
- `createMessage`: saves and returns with correct fields

### chat.service.test.ts — Unit tests
- `sanitizeContent`: strips XSS (test `<script>`, `<img onerror>`, etc.)
- `sanitizeAttachments`: strips XSS from URLs
- `verifyRoomAccess`: customer can only access own room, admin can access any

### chat.integration.test.ts — Integration tests
**FIX from nevan**: Test the REAL `initializeSocket`, NOT a duplicate server.

```typescript
import { createServer } from 'http';
import { io as ioc } from 'socket.io-client';
import { initializeSocket } from '../../../config/socket.js';
import { app } from '../../../app.js';
```

Test scenarios:
1. **Authentication**: Valid token connects, invalid rejects, expired rejects, inactive user rejects
2. **join-chat (customer)**: Creates room on first join, returns same room on rejoin, returns message history
3. **join-chat (admin)**: Assigns admin to room, load history
4. **send-message**: Text message saves + broadcasts, XSS sanitized, rate limit enforced, empty content rejected, HTTPS-only attachments
5. **message-read**: Marks messages as read, resets unread count, notifies sender
6. **typing**: Only works after joining room, doesn't broadcast to non-joined rooms
7. **load-more**: Returns paginated older messages with cursor
8. **get-rooms (admin)**: Returns paginated rooms, rejects non-admin
9. **close-chat**: Admin can close, customer cannot
10. **concurrent room creation**: Parallel `join-chat` calls from same customer → single room

Use `mongodb-memory-server` for DB isolation.
Use `socket.io-client` for real WebSocket connections.
**Run in CI** — NO `describe.skip`.

### chat.controller.test.ts — Upload endpoint test
- Upload image → returns Cloudinary URL
- No file → 400
- Non-image → rejected

---

## Phase 4, Step 2: Web Tests

Directory: `apps/web/src/components/chat/__tests__/`

- **ChatWidget.test.tsx**: Renders for authed users, hidden for guests, toggles window, shows unread badge
- **ChatWindow.test.tsx**: Renders messages, sends via mock socket, shows typing indicator
- **MessageBubble.test.tsx**: Own message right-aligned, received left-aligned, shows correct status icon
- **chat.store.test.ts**: All actions work correctly, deduplication works, reset clears state

Mock `socketService` in all tests.

---

## Phase 4, Step 3: Mobile Tests

Directory: `apps/mobile/src/screens/chat/__tests__/`

- **ChatScreen.test.tsx**: Renders message list, sends message, focus/blur lifecycle
- **AdminChatListScreen.test.tsx**: Renders room list, navigates on tap
- **chat.store.test.ts**: All actions work correctly

---

## Phase 4, Step 4: Hardening Checklist

- [ ] All tests pass: `pnpm test`
- [ ] No TypeScript errors: `pnpm typecheck`
- [ ] No lint errors: `pnpm lint`
- [ ] Coverage ≥ 70% for chat module
- [ ] Socket reconnection tested manually across web/mobile
- [ ] No duplicate rooms under concurrent load (verified by integration test)
- [ ] XSS payloads in messages are sanitized (verified by integration test)
- [ ] Rate limiting works (verified by integration test)
- [ ] Image upload to Cloudinary works end-to-end
- [ ] Admin can see room list, join rooms, respond, close chats
- [ ] Mobile admin can manage chats (NEW — was missing in nevan)
- [ ] Unread counts are accurate under concurrent messaging
- [ ] "Load more" pagination works in all clients
- [ ] Message read receipts display correctly in all clients

---

# DEPENDENCY MAP

```
@amira/shared (types, schemas, constants)
    ↓ consumed by
@amira/api (backend — Socket.IO server + REST upload)
    ↓ connected to via WebSocket
@amira/web (customer chat widget)
@amira/admin (admin chat dashboard)
@amira/mobile (customer + admin chat screens)
```

Build order: shared → api → web/admin/mobile (parallel)

---

# FILES CREATED/MODIFIED PER PHASE

## Phase 1 (Shared + Backend)

### New Files:
- `packages/shared/src/enums/chat.enum.ts`
- `packages/shared/src/types/chat.types.ts`
- `packages/shared/src/schemas/chat.schema.ts`
- `packages/shared/src/constants/chat.constants.ts`
- `packages/api/src/config/socket.ts`
- `packages/api/src/middlewares/socketAuth.middleware.ts`
- `packages/api/src/modules/chat/chat.model.ts`
- `packages/api/src/modules/chat/chat.repository.ts`
- `packages/api/src/modules/chat/chat.service.ts`
- `packages/api/src/modules/chat/chat.socket.ts`
- `packages/api/src/modules/chat/chat.controller.ts`
- `packages/api/src/modules/chat/chat.routes.ts`
- `packages/api/src/modules/chat/chat.dto.ts`
- `packages/api/src/modules/chat/chat.validation.ts`

### Modified Files:
- `packages/shared/src/index.ts` — add chat exports
- `packages/shared/src/api/endpoints.ts` — add CHAT endpoints
- `packages/shared/src/constants/index.ts` — add chat constants export
- `packages/api/package.json` — add socket.io, xss, rate-limiter-flexible
- `packages/api/src/server.ts` — http.createServer + initializeSocket
- `packages/api/src/config/index.ts` — add cors.allowedOrigins, redis config
- `packages/api/src/routes/index.ts` — mount chatRoutes

## Phase 2 (Web + Admin)

### New Files:
- `apps/web/src/services/socket.ts`
- `apps/web/src/store/chat.store.ts`
- `apps/web/src/hooks/useChat.ts`
- `apps/web/src/components/chat/ChatWidget.tsx`
- `apps/web/src/components/chat/ChatWindow.tsx`
- `apps/web/src/components/chat/MessageList.tsx`
- `apps/web/src/components/chat/MessageBubble.tsx`
- `apps/web/src/components/chat/MessageInput.tsx`
- `apps/web/src/components/chat/TypingIndicator.tsx`
- `apps/admin/src/lib/socket.ts`
- `apps/admin/src/pages/chat/ChatListPage.tsx`
- `apps/admin/src/pages/chat/ChatRoomPage.tsx`

### Modified Files:
- `apps/web/package.json` — add socket.io-client
- `apps/web/src/app/App.tsx` — render ChatWidget
- `apps/admin/package.json` — add socket.io-client
- `apps/admin/src/app/App.tsx` — add chat resource + routes
- `apps/admin/src/layouts/AdminLayout.tsx` — add Chat nav item

## Phase 3 (Mobile)

### New Files:
- `apps/mobile/src/services/socket.ts`
- `apps/mobile/src/store/chat.store.ts`
- `apps/mobile/src/hooks/useChat.ts`
- `apps/mobile/src/screens/user/ChatScreen.tsx`
- `apps/mobile/src/screens/admin/AdminChatListScreen.tsx`
- `apps/mobile/src/screens/admin/AdminChatRoomScreen.tsx`
- `apps/mobile/src/components/chat/MessageBubble.tsx`
- `apps/mobile/src/components/chat/MessageInput.tsx`
- `apps/mobile/src/components/chat/TypingIndicator.tsx`
- `apps/mobile/src/components/chat/ChatRoomCard.tsx`
- `apps/mobile/src/components/chat/ConnectionBanner.tsx`

### Modified Files:
- `apps/mobile/package.json` — add socket.io-client
- `apps/mobile/src/navigation/RootNavigator.tsx` — add chat screens
- `apps/mobile/src/navigation/types.ts` — add chat param types

## Phase 4 (Tests)

### New Files:
- `packages/api/src/modules/chat/__tests__/chat.repository.test.ts`
- `packages/api/src/modules/chat/__tests__/chat.service.test.ts`
- `packages/api/src/modules/chat/__tests__/chat.integration.test.ts`
- `packages/api/src/modules/chat/__tests__/chat.controller.test.ts`
- `apps/web/src/components/chat/__tests__/ChatWidget.test.tsx`
- `apps/web/src/components/chat/__tests__/ChatWindow.test.tsx`
- `apps/web/src/components/chat/__tests__/MessageBubble.test.tsx`
- `apps/web/src/store/__tests__/chat.store.test.ts`
- `apps/mobile/src/screens/chat/__tests__/ChatScreen.test.tsx`
- `apps/mobile/src/screens/chat/__tests__/AdminChatListScreen.test.tsx`
- `apps/mobile/src/store/__tests__/chat.store.test.ts`

---

# FIXES APPLIED FROM NEVAN AUDIT

| # | Nevan Gap | Fix Applied |
|---|-----------|-------------|
| 1 | Tests skipped in CI | No `describe.skip` — all chat tests run in CI |
| 2 | Tests use duplicate server | Tests import real `initializeSocket` |
| 3 | Non-atomic unread counts (`room.save()`) | Use `$inc` and `$set` in repository |
| 4 | Race condition on room creation | `findOneAndUpdate` with `upsert: true` + unique partial index |
| 5 | Mobile no token refresh | Socket service has auth error → refresh → reconnect |
| 6 | Mobile admin can't manage chats | `AdminChatListScreen` + `AdminChatRoomScreen` added |
| 7 | `setMessages([])` dispatch bug | Using Zustand `set()` — no dispatch needed |
| 8 | Event listener duplication on reconnect | Hook cleanup always runs `off()` before `on()` |
| 9 | No typing room membership check | `joinedRooms` Set checked before broadcasting |
| 10 | `deliveredAt` never set | `markMessagesAsDelivered` called on room join |
| 11 | Read receipts not passed to UI | `status` prop properly wired in all MessageBubble components |
| 12 | Types duplicated across apps | All types in `@amira/shared` — single source of truth |
| 13 | Redux instead of Zustand | All stores use Zustand |
| 14 | No room list pagination | Cursor-based pagination in `get-rooms` |
| 15 | No message "load more" | `load-more` event with cursor pagination |
| 16 | Auto-scroll fights user | Scroll-near-bottom detection + "new messages" pill |
| 17 | Dual CORS config | Unified `config.cors.allowedOrigins` for HTTP + WS |
| 18 | Redis zombie connection entries | Deferred to Phase 3 scaling (TTL or heartbeat) |

---

# EXECUTION ORDER

```
Phase 1, Step 1  → Shared package (types, schemas, constants)
Phase 1, Step 2  → Backend Socket.IO infrastructure
Phase 1, Step 3  → Backend chat module (model → repo → service → socket → controller → routes)
                    ↓ VERIFY: Backend works with Postman/test client
Phase 2, Step 1  → Web customer chat (socket service → store → hook → components → integrate)
Phase 2, Step 2  → Admin dashboard chat (socket → pages → Refine resource → sidebar)
                    ↓ VERIFY: Web bidirectional chat works
Phase 3, Step 1  → Mobile socket + state
Phase 3, Step 2  → Mobile customer chat screen
Phase 3, Step 3  → Mobile admin chat screens
Phase 3, Step 4  → Mobile shared components
                    ↓ VERIFY: Mobile bidirectional chat works
Phase 4, Step 1  → Backend tests (unit + integration)
Phase 4, Step 2  → Web tests
Phase 4, Step 3  → Mobile tests
Phase 4, Step 4  → Hardening checklist
                    ↓ VERIFY: All tests pass, coverage ≥ 70%
```

---

# END OF CHAT SYSTEM CONTROL FILE
