import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createServer, Server as HTTPServer } from 'http';
import { type AddressInfo } from 'net';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { Server as SocketIOServer } from 'socket.io';
import { createTestApp, generateTestAccessToken } from '../../../test/helpers.js';
import { createTestUser, createTestAdmin } from '../../../test/factories/user.factory.js';
import type { IUserDocument } from '../../user/user.model.js';
import { User } from '../../user/user.model.js';
import { initializeSocket } from '../../../config/socket.js';
import { CHAT_EVENTS, CHAT_DEFAULTS } from '@amira/shared';
import { ChatRoom } from '../chat.model.js';
import { Message } from '../chat.model.js';

// ─── Helpers ───

function waitForEvent<T = unknown>(socket: ClientSocket, event: string, timeout = 5000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for "${event}"`)), timeout);
    socket.once(event, (data: T) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

function connectSocket(port: number, token: string): ClientSocket {
  return ioClient(`http://127.0.0.1:${port}${CHAT_DEFAULTS.NAMESPACE}`, {
    auth: { token },
    transports: ['websocket'],
    forceNew: true,
    autoConnect: false,
  });
}

function waitForConnect(socket: ClientSocket, timeout = 5000): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (socket.connected) return resolve();
    const timer = setTimeout(() => reject(new Error('Socket connect timeout')), timeout);
    socket.once('connect', () => { clearTimeout(timer); resolve(); });
    socket.once('connect_error', (err) => { clearTimeout(timer); reject(err); });
    socket.connect();
  });
}

// ─── Setup ───

let httpServer: HTTPServer;
let io: SocketIOServer;
let port: number;

let customer: IUserDocument;
let admin: IUserDocument;
let customer2: IUserDocument;

let customerToken: string;
let adminToken: string;
let customer2Token: string;

const activeSockets: ClientSocket[] = [];

function createAndTrack(token: string): ClientSocket {
  const s = connectSocket(port, token);
  activeSockets.push(s);
  return s;
}

function regenerateTokens(): void {
  customerToken = generateTestAccessToken({
    _id: customer._id.toString(),
    role: customer.role,
    tokenVersion: customer.tokenVersion ?? 0,
  });
  adminToken = generateTestAccessToken({
    _id: admin._id.toString(),
    role: admin.role,
    tokenVersion: admin.tokenVersion ?? 0,
  });
  customer2Token = generateTestAccessToken({
    _id: customer2._id.toString(),
    role: customer2.role,
    tokenVersion: customer2.tokenVersion ?? 0,
  });
}

beforeAll(async () => {
  const app = createTestApp();
  httpServer = createServer(app);
  io = initializeSocket(httpServer);

  await new Promise<void>((resolve) => {
    httpServer.listen(0, '127.0.0.1', () => resolve());
  });
  port = (httpServer.address() as AddressInfo).port;
});

// The global afterEach in setup.ts clears all collections between tests.
// We must recreate users before each test so socket auth can look them up.
beforeEach(async () => {
  customer = await createTestUser({ name: 'Customer One' });
  admin = await createTestAdmin({ name: 'Admin One' });
  customer2 = await createTestUser({ name: 'Customer Two' });
  regenerateTokens();
});

afterEach(() => {
  // Disconnect sockets created during this test
  for (const s of activeSockets) {
    if (s.connected) s.disconnect();
  }
  activeSockets.length = 0;
});

afterAll(async () => {
  io?.close();
  await new Promise<void>((resolve, reject) => {
    httpServer?.close((err) => (err ? reject(err) : resolve()));
  });
});

// ─── Tests ───

describe('Chat Socket.IO Integration', () => {
  describe('Authentication', () => {
    it('should reject connection without a token', async () => {
      const socket = connectSocket(port, '');
      activeSockets.push(socket);

      await expect(waitForConnect(socket)).rejects.toThrow();
    });

    it('should reject connection with an invalid token', async () => {
      const socket = connectSocket(port, 'invalid.jwt.garbage');
      activeSockets.push(socket);

      await expect(waitForConnect(socket)).rejects.toThrow();
    });

    it('should accept connection with a valid token', async () => {
      const socket = createAndTrack(customerToken);
      await waitForConnect(socket);
      expect(socket.connected).toBe(true);
    });
  });

  describe('JOIN_CHAT — Customer', () => {
    it('should create a room and return chat history', async () => {
      const socket = createAndTrack(customerToken);
      await waitForConnect(socket);

      const historyPromise = waitForEvent<{ roomId: string; messages: unknown[] }>(
        socket,
        CHAT_EVENTS.CHAT_HISTORY,
      );

      socket.emit(CHAT_EVENTS.JOIN_CHAT, {});

      const history = await historyPromise;
      expect(history.roomId).toBeDefined();
      expect(Array.isArray(history.messages)).toBe(true);
    });

    it('should re-use existing open room on subsequent joins', async () => {
      const s1 = createAndTrack(customerToken);
      await waitForConnect(s1);

      const h1Promise = waitForEvent<{ roomId: string }>(s1, CHAT_EVENTS.CHAT_HISTORY);
      s1.emit(CHAT_EVENTS.JOIN_CHAT, {});
      const h1 = await h1Promise;

      s1.disconnect();

      const s2 = createAndTrack(customerToken);
      await waitForConnect(s2);

      const h2Promise = waitForEvent<{ roomId: string }>(s2, CHAT_EVENTS.CHAT_HISTORY);
      s2.emit(CHAT_EVENTS.JOIN_CHAT, {});
      const h2 = await h2Promise;

      expect(h2.roomId).toBe(h1.roomId);
    });
  });

  describe('JOIN_CHAT — Admin', () => {
    it('should emit error when admin joins without roomId', async () => {
      const socket = createAndTrack(adminToken);
      await waitForConnect(socket);

      const errPromise = waitForEvent<{ message: string }>(socket, CHAT_EVENTS.CHAT_ERROR);
      socket.emit(CHAT_EVENTS.JOIN_CHAT, {});
      const err = await errPromise;

      expect(err.message).toMatch(/room/i);
    });

    it('should allow admin to join an existing room', async () => {
      // Customer creates a room first
      const cSocket = createAndTrack(customerToken);
      await waitForConnect(cSocket);

      const cHistory = waitForEvent<{ roomId: string }>(cSocket, CHAT_EVENTS.CHAT_HISTORY);
      cSocket.emit(CHAT_EVENTS.JOIN_CHAT, {});
      const { roomId } = await cHistory;

      // Admin joins the same room
      const aSocket = createAndTrack(adminToken);
      await waitForConnect(aSocket);

      const aHistory = waitForEvent<{ roomId: string; messages: unknown[] }>(
        aSocket,
        CHAT_EVENTS.CHAT_HISTORY,
      );
      aSocket.emit(CHAT_EVENTS.JOIN_CHAT, { roomId });
      const adminHistory = await aHistory;

      expect(adminHistory.roomId).toBe(roomId);

      // Verify admin was assigned
      const room = await ChatRoom.findById(roomId).lean();
      expect(room?.adminId?.toString()).toBe(admin._id.toString());
    });
  });

  describe('SEND_MESSAGE', () => {
    let roomId: string;
    let cSocket: ClientSocket;
    let aSocket: ClientSocket;

    beforeEach(async () => {
      // Clean chat data for predictable state
      await ChatRoom.deleteMany({});
      await Message.deleteMany({});

      cSocket = createAndTrack(customerToken);
      await waitForConnect(cSocket);

      const hPromise = waitForEvent<{ roomId: string }>(cSocket, CHAT_EVENTS.CHAT_HISTORY);
      cSocket.emit(CHAT_EVENTS.JOIN_CHAT, {});
      const h = await hPromise;
      roomId = h.roomId;

      aSocket = createAndTrack(adminToken);
      await waitForConnect(aSocket);

      const aHPromise = waitForEvent<{ roomId: string }>(aSocket, CHAT_EVENTS.CHAT_HISTORY);
      aSocket.emit(CHAT_EVENTS.JOIN_CHAT, { roomId });
      await aHPromise;
    });

    it('should deliver message to both customer and admin', async () => {
      const adminMsgPromise = waitForEvent<{ roomId: string; message: { content: string } }>(
        aSocket,
        CHAT_EVENTS.NEW_MESSAGE,
      );
      const customerMsgPromise = waitForEvent<{ roomId: string; message: { content: string } }>(
        cSocket,
        CHAT_EVENTS.NEW_MESSAGE,
      );

      cSocket.emit(CHAT_EVENTS.SEND_MESSAGE, {
        roomId,
        content: 'Hello from customer',
      });

      const [adminMsg, customerMsg] = await Promise.all([adminMsgPromise, customerMsgPromise]);

      expect(adminMsg.message.content).toBe('Hello from customer');
      expect(customerMsg.message.content).toBe('Hello from customer');
      expect(adminMsg.roomId).toBe(roomId);
    });

    it('should sanitize XSS in message content', async () => {
      const msgPromise = waitForEvent<{ message: { content: string } }>(
        cSocket,
        CHAT_EVENTS.NEW_MESSAGE,
      );

      cSocket.emit(CHAT_EVENTS.SEND_MESSAGE, {
        roomId,
        content: '<script>alert("xss")</script>Hello',
      });

      const data = await msgPromise;
      expect(data.message.content).not.toContain('<script>');
      expect(data.message.content).toContain('Hello');
    });

    it('should reject message when not joined to room', async () => {
      const freshSocket = createAndTrack(customer2Token);
      await waitForConnect(freshSocket);

      const errPromise = waitForEvent<{ message: string }>(freshSocket, CHAT_EVENTS.CHAT_ERROR);

      freshSocket.emit(CHAT_EVENTS.SEND_MESSAGE, {
        roomId,
        content: 'I should not be allowed',
      });

      const err = await errPromise;
      expect(err.message).toMatch(/join/i);
    });

    it('should persist message in the database', async () => {
      const msgPromise = waitForEvent<{ message: { _id: string } }>(
        cSocket,
        CHAT_EVENTS.NEW_MESSAGE,
      );

      cSocket.emit(CHAT_EVENTS.SEND_MESSAGE, {
        roomId,
        content: 'Persist this',
      });

      const { message } = await msgPromise;
      const dbMsg = await Message.findById(message._id).lean();
      expect(dbMsg).not.toBeNull();
      expect(dbMsg?.content).toBe('Persist this');
    });
  });

  describe('TYPING / STOP_TYPING', () => {
    let roomId: string;
    let cSocket: ClientSocket;
    let aSocket: ClientSocket;

    beforeEach(async () => {
      await ChatRoom.deleteMany({});
      await Message.deleteMany({});

      cSocket = createAndTrack(customerToken);
      await waitForConnect(cSocket);

      const h = waitForEvent<{ roomId: string }>(cSocket, CHAT_EVENTS.CHAT_HISTORY);
      cSocket.emit(CHAT_EVENTS.JOIN_CHAT, {});
      roomId = (await h).roomId;

      aSocket = createAndTrack(adminToken);
      await waitForConnect(aSocket);

      const ah = waitForEvent<{ roomId: string }>(aSocket, CHAT_EVENTS.CHAT_HISTORY);
      aSocket.emit(CHAT_EVENTS.JOIN_CHAT, { roomId });
      await ah;
    });

    it('should broadcast typing event to other participants', async () => {
      const typingPromise = waitForEvent<{ roomId: string; userId: string }>(
        aSocket,
        CHAT_EVENTS.USER_TYPING,
      );

      cSocket.emit(CHAT_EVENTS.TYPING, { roomId });

      const typing = await typingPromise;
      expect(typing.roomId).toBe(roomId);
      expect(typing.userId).toBe(customer._id.toString());
    });

    it('should broadcast stop-typing event', async () => {
      const stopPromise = waitForEvent<{ roomId: string; userId: string }>(
        aSocket,
        CHAT_EVENTS.USER_STOP_TYPING,
      );

      cSocket.emit(CHAT_EVENTS.STOP_TYPING, { roomId });

      const stop = await stopPromise;
      expect(stop.roomId).toBe(roomId);
    });
  });

  describe('MESSAGE_READ', () => {
    it('should emit status update to other participant', async () => {
      await ChatRoom.deleteMany({});
      await Message.deleteMany({});

      const cSocket = createAndTrack(customerToken);
      await waitForConnect(cSocket);

      const h = waitForEvent<{ roomId: string }>(cSocket, CHAT_EVENTS.CHAT_HISTORY);
      cSocket.emit(CHAT_EVENTS.JOIN_CHAT, {});
      const { roomId } = await h;

      const aSocket = createAndTrack(adminToken);
      await waitForConnect(aSocket);

      const ah = waitForEvent<{ roomId: string }>(aSocket, CHAT_EVENTS.CHAT_HISTORY);
      aSocket.emit(CHAT_EVENTS.JOIN_CHAT, { roomId });
      await ah;

      // Admin sends a message
      const newMsgPromise = waitForEvent(cSocket, CHAT_EVENTS.NEW_MESSAGE);
      aSocket.emit(CHAT_EVENTS.SEND_MESSAGE, { roomId, content: 'Please read me' });
      await newMsgPromise;

      // Customer reads
      const statusPromise = waitForEvent<{ roomId: string; status: string }>(
        aSocket,
        CHAT_EVENTS.MESSAGE_STATUS_UPDATE,
      );
      cSocket.emit(CHAT_EVENTS.MESSAGE_READ, { roomId });

      const status = await statusPromise;
      expect(status.roomId).toBe(roomId);
      expect(status.status).toBe('read');
    });
  });

  describe('LOAD_MORE', () => {
    it('should return older messages with cursor', async () => {
      await ChatRoom.deleteMany({});
      await Message.deleteMany({});

      const cSocket = createAndTrack(customerToken);
      await waitForConnect(cSocket);

      const h = waitForEvent<{ roomId: string }>(cSocket, CHAT_EVENTS.CHAT_HISTORY);
      cSocket.emit(CHAT_EVENTS.JOIN_CHAT, {});
      const { roomId } = await h;

      // Send a few messages so there is something to load
      for (let i = 0; i < 3; i++) {
        const p = waitForEvent(cSocket, CHAT_EVENTS.NEW_MESSAGE);
        cSocket.emit(CHAT_EVENTS.SEND_MESSAGE, { roomId, content: `Msg ${i}` });
        await p;
      }

      // Load more with first message as cursor (oldest)
      const msgs = await Message.find({ roomId }).sort({ createdAt: 1 }).lean();
      const oldestId = msgs[0]._id.toString();

      const loadPromise = waitForEvent<{ roomId: string; messages: unknown[]; isLoadMore: boolean }>(
        cSocket,
        CHAT_EVENTS.CHAT_HISTORY,
      );

      cSocket.emit(CHAT_EVENTS.LOAD_MORE, { roomId, cursor: oldestId });

      const loaded = await loadPromise;
      expect(loaded.isLoadMore).toBe(true);
      // There are no messages older than the oldest, so empty
      expect(loaded.messages.length).toBe(0);
    });
  });

  describe('GET_ROOMS — Admin only', () => {
    it('should return rooms list for admin', async () => {
      await ChatRoom.deleteMany({});
      await Message.deleteMany({});

      // Customer creates a room
      const cSocket = createAndTrack(customerToken);
      await waitForConnect(cSocket);
      const h = waitForEvent<{ roomId: string }>(cSocket, CHAT_EVENTS.CHAT_HISTORY);
      cSocket.emit(CHAT_EVENTS.JOIN_CHAT, {});
      await h;

      // Admin requests rooms
      const aSocket = createAndTrack(adminToken);
      await waitForConnect(aSocket);

      const roomsPromise = waitForEvent<{ rooms: unknown[] }>(aSocket, CHAT_EVENTS.ROOMS_LIST);
      aSocket.emit(CHAT_EVENTS.GET_ROOMS, {});

      const { rooms } = await roomsPromise;
      expect(Array.isArray(rooms)).toBe(true);
      expect(rooms.length).toBeGreaterThanOrEqual(1);
    });

    it('should reject get-rooms from a customer', async () => {
      const cSocket = createAndTrack(customerToken);
      await waitForConnect(cSocket);

      const errPromise = waitForEvent<{ message: string }>(cSocket, CHAT_EVENTS.CHAT_ERROR);
      cSocket.emit(CHAT_EVENTS.GET_ROOMS, {});

      const err = await errPromise;
      expect(err.message).toMatch(/admin/i);
    });
  });

  describe('CLOSE_CHAT — Admin only', () => {
    it('should close a room and notify participants', async () => {
      await ChatRoom.deleteMany({});
      await Message.deleteMany({});

      // Customer creates room
      const cSocket = createAndTrack(customerToken);
      await waitForConnect(cSocket);
      const h = waitForEvent<{ roomId: string }>(cSocket, CHAT_EVENTS.CHAT_HISTORY);
      cSocket.emit(CHAT_EVENTS.JOIN_CHAT, {});
      const { roomId } = await h;

      // Admin joins
      const aSocket = createAndTrack(adminToken);
      await waitForConnect(aSocket);
      const ah = waitForEvent(aSocket, CHAT_EVENTS.CHAT_HISTORY);
      aSocket.emit(CHAT_EVENTS.JOIN_CHAT, { roomId });
      await ah;

      // Admin closes
      const updatePromise = waitForEvent<{ roomId: string; status: string }>(
        cSocket,
        CHAT_EVENTS.ROOM_UPDATED,
      );
      aSocket.emit(CHAT_EVENTS.CLOSE_CHAT, { roomId });

      const update = await updatePromise;
      expect(update.roomId).toBe(roomId);
      expect(update.status).toBe('closed');

      // Verify in DB
      const room = await ChatRoom.findById(roomId).lean();
      expect(room?.status).toBe('closed');
    });

    it('should reject close-chat from a customer', async () => {
      await ChatRoom.deleteMany({});

      const cSocket = createAndTrack(customerToken);
      await waitForConnect(cSocket);

      const h = waitForEvent<{ roomId: string }>(cSocket, CHAT_EVENTS.CHAT_HISTORY);
      cSocket.emit(CHAT_EVENTS.JOIN_CHAT, {});
      const { roomId } = await h;

      const errPromise = waitForEvent<{ message: string }>(cSocket, CHAT_EVENTS.CHAT_ERROR);
      cSocket.emit(CHAT_EVENTS.CLOSE_CHAT, { roomId });

      const err = await errPromise;
      expect(err.message).toMatch(/admin/i);
    });
  });
});
