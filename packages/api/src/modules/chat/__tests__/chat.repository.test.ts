import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { ChatRepository } from '../chat.repository.js';
import { ChatRoom, Message } from '../chat.model.js';
import { ChatRoomStatus, MessageStatus, SenderRole } from '@amira/shared';
import { createTestUser, createTestAdmin } from '../../../test/factories/user.factory.js';

describe('ChatRepository', () => {
  let repo: ChatRepository;
  let customerId: string;
  let adminId: string;

  beforeEach(async () => {
    repo = new ChatRepository();
    const customer = await createTestUser();
    const admin = await createTestAdmin();
    customerId = (customer._id as mongoose.Types.ObjectId).toString();
    adminId = (admin._id as mongoose.Types.ObjectId).toString();
  });

  // ─── findOrCreateRoom ───

  describe('findOrCreateRoom', () => {
    it('should create a new room if none exists', async () => {
      const room = await repo.findOrCreateRoom(customerId);

      expect(room).toBeDefined();
      expect(room.customerId.toString()).toBe(customerId);
      expect(room.status).toBe(ChatRoomStatus.OPEN);
      expect(room.unreadCountCustomer).toBe(0);
      expect(room.unreadCountAdmin).toBe(0);
    });

    it('should return existing open room for same customer', async () => {
      const room1 = await repo.findOrCreateRoom(customerId);
      const room2 = await repo.findOrCreateRoom(customerId);

      expect(room1._id.toString()).toBe(room2._id.toString());
    });

    it('should not create duplicate rooms under concurrent calls', async () => {
      const results = await Promise.all([
        repo.findOrCreateRoom(customerId),
        repo.findOrCreateRoom(customerId),
        repo.findOrCreateRoom(customerId),
      ]);

      const uniqueIds = new Set(results.map((r) => r._id.toString()));
      expect(uniqueIds.size).toBe(1);

      const count = await ChatRoom.countDocuments({
        customerId: new mongoose.Types.ObjectId(customerId),
        status: ChatRoomStatus.OPEN,
      });
      expect(count).toBe(1);
    });

    it('should create a new room if previous one is closed', async () => {
      const room1 = await repo.findOrCreateRoom(customerId);
      await repo.closeRoom(room1._id.toString());

      const room2 = await repo.findOrCreateRoom(customerId);
      expect(room2._id.toString()).not.toBe(room1._id.toString());
      expect(room2.status).toBe(ChatRoomStatus.OPEN);
    });
  });

  // ─── assignAdminToRoom ───

  describe('assignAdminToRoom', () => {
    it('should assign admin to an open room', async () => {
      const room = await repo.findOrCreateRoom(customerId);
      const updated = await repo.assignAdminToRoom(room._id.toString(), adminId);

      expect(updated).toBeDefined();
      expect(updated!.adminId!.toString()).toBe(adminId);
    });

    it('should allow same admin to re-assign', async () => {
      const room = await repo.findOrCreateRoom(customerId);
      await repo.assignAdminToRoom(room._id.toString(), adminId);
      const result = await repo.assignAdminToRoom(room._id.toString(), adminId);

      expect(result).toBeDefined();
      expect(result!.adminId!.toString()).toBe(adminId);
    });

    it('should reject assignment if different admin is already assigned', async () => {
      const otherAdmin = await createTestAdmin();
      const otherAdminId = (otherAdmin._id as mongoose.Types.ObjectId).toString();

      const room = await repo.findOrCreateRoom(customerId);
      await repo.assignAdminToRoom(room._id.toString(), adminId);
      const result = await repo.assignAdminToRoom(room._id.toString(), otherAdminId);

      expect(result).toBeNull();
    });
  });

  // ─── createMessage ───

  describe('createMessage', () => {
    it('should create a message with correct fields', async () => {
      const room = await repo.findOrCreateRoom(customerId);
      const roomId = room._id.toString();

      const msg = await repo.createMessage({
        roomId,
        senderId: customerId,
        senderRole: SenderRole.CUSTOMER,
        content: 'Hello!',
        attachments: [],
      });

      expect(msg.roomId.toString()).toBe(roomId);
      expect(msg.senderId.toString()).toBe(customerId);
      expect(msg.senderRole).toBe(SenderRole.CUSTOMER);
      expect(msg.content).toBe('Hello!');
      expect(msg.status).toBe(MessageStatus.SENT);
      expect(msg.createdAt).toBeDefined();
    });

    it('should save message with attachments', async () => {
      const room = await repo.findOrCreateRoom(customerId);
      const msg = await repo.createMessage({
        roomId: room._id.toString(),
        senderId: customerId,
        senderRole: SenderRole.CUSTOMER,
        content: 'Image attached',
        attachments: [{ type: 'image', url: 'https://example.com/img.png' }],
      });

      expect(msg.attachments).toHaveLength(1);
      expect(msg.attachments[0].url).toBe('https://example.com/img.png');
    });
  });

  // ─── getMessages (cursor-based pagination) ───

  describe('getMessages', () => {
    it('should return messages for a room in descending order', async () => {
      const room = await repo.findOrCreateRoom(customerId);
      const roomId = room._id.toString();

      for (let i = 0; i < 5; i++) {
        await repo.createMessage({
          roomId,
          senderId: customerId,
          senderRole: SenderRole.CUSTOMER,
          content: `Message ${i}`,
          attachments: [],
        });
      }

      const messages = await repo.getMessages(roomId, undefined, 10);
      expect(messages).toHaveLength(5);
      // Descending order — newest first
      expect(messages[0].content).toBe('Message 4');
      expect(messages[4].content).toBe('Message 0');
    });

    it('should paginate with cursor', async () => {
      const room = await repo.findOrCreateRoom(customerId);
      const roomId = room._id.toString();

      for (let i = 0; i < 10; i++) {
        await repo.createMessage({
          roomId,
          senderId: customerId,
          senderRole: SenderRole.CUSTOMER,
          content: `Msg ${i}`,
          attachments: [],
        });
      }

      const firstPage = await repo.getMessages(roomId, undefined, 5);
      expect(firstPage).toHaveLength(5);

      const cursor = firstPage[firstPage.length - 1]._id.toString();
      const secondPage = await repo.getMessages(roomId, cursor, 5);
      expect(secondPage).toHaveLength(5);

      // No overlap
      const firstIds = firstPage.map((m) => m._id.toString());
      const secondIds = secondPage.map((m) => m._id.toString());
      const overlap = firstIds.filter((id) => secondIds.includes(id));
      expect(overlap).toHaveLength(0);
    });

    it('should return empty array for room with no messages', async () => {
      const room = await repo.findOrCreateRoom(customerId);
      const messages = await repo.getMessages(room._id.toString());
      expect(messages).toHaveLength(0);
    });
  });

  // ─── incrementUnreadCount ───

  describe('incrementUnreadCount', () => {
    it('should atomically increment admin unread counter', async () => {
      const room = await repo.findOrCreateRoom(customerId);
      const roomId = room._id.toString();

      await repo.incrementUnreadCount(roomId, 'unreadCountAdmin');
      await repo.incrementUnreadCount(roomId, 'unreadCountAdmin');
      await repo.incrementUnreadCount(roomId, 'unreadCountAdmin');

      const updated = await ChatRoom.findById(roomId);
      expect(updated!.unreadCountAdmin).toBe(3);
      expect(updated!.lastMessageAt).toBeDefined();
    });

    it('should atomically increment customer unread counter', async () => {
      const room = await repo.findOrCreateRoom(customerId);
      const roomId = room._id.toString();

      await repo.incrementUnreadCount(roomId, 'unreadCountCustomer');
      const updated = await ChatRoom.findById(roomId);
      expect(updated!.unreadCountCustomer).toBe(1);
    });
  });

  // ─── resetUnreadCount ───

  describe('resetUnreadCount', () => {
    it('should reset unread count to zero', async () => {
      const room = await repo.findOrCreateRoom(customerId);
      const roomId = room._id.toString();

      await repo.incrementUnreadCount(roomId, 'unreadCountAdmin');
      await repo.incrementUnreadCount(roomId, 'unreadCountAdmin');
      await repo.resetUnreadCount(roomId, 'unreadCountAdmin');

      const updated = await ChatRoom.findById(roomId);
      expect(updated!.unreadCountAdmin).toBe(0);
    });
  });

  // ─── markMessagesAsRead / markMessagesAsDelivered ───

  describe('markMessagesAsRead', () => {
    it('should mark unread messages from other sender as read', async () => {
      const room = await repo.findOrCreateRoom(customerId);
      const roomId = room._id.toString();

      // Customer sends messages
      await repo.createMessage({
        roomId,
        senderId: customerId,
        senderRole: SenderRole.CUSTOMER,
        content: 'Hello',
        attachments: [],
      });
      await repo.createMessage({
        roomId,
        senderId: customerId,
        senderRole: SenderRole.CUSTOMER,
        content: 'Are you there?',
        attachments: [],
      });

      // Admin reads them
      await repo.markMessagesAsRead(roomId, adminId);

      const messages = await Message.find({ roomId: room._id });
      expect(messages.every((m) => m.status === MessageStatus.READ)).toBe(true);
      expect(messages.every((m) => m.readAt !== undefined)).toBe(true);
    });

    it('should not change status of own messages', async () => {
      const room = await repo.findOrCreateRoom(customerId);
      const roomId = room._id.toString();

      await repo.createMessage({
        roomId,
        senderId: customerId,
        senderRole: SenderRole.CUSTOMER,
        content: 'My message',
        attachments: [],
      });

      // Customer tries to "read" their own messages — should not change
      await repo.markMessagesAsRead(roomId, customerId);

      const messages = await Message.find({ roomId: room._id });
      expect(messages[0].status).toBe(MessageStatus.SENT);
    });
  });

  describe('markMessagesAsDelivered', () => {
    it('should mark sent messages as delivered', async () => {
      const room = await repo.findOrCreateRoom(customerId);
      const roomId = room._id.toString();

      await repo.createMessage({
        roomId,
        senderId: customerId,
        senderRole: SenderRole.CUSTOMER,
        content: 'Delivered test',
        attachments: [],
      });

      await repo.markMessagesAsDelivered(roomId, adminId);

      const messages = await Message.find({ roomId: room._id });
      expect(messages[0].status).toBe(MessageStatus.DELIVERED);
      expect(messages[0].deliveredAt).toBeDefined();
    });
  });

  // ─── getRoomsForAdmin ───

  describe('getRoomsForAdmin', () => {
    it('should return open rooms with populated customer info', async () => {
      await repo.findOrCreateRoom(customerId);

      const rooms = await repo.getRoomsForAdmin();
      expect(rooms).toHaveLength(1);
    });

    it('should not return closed rooms', async () => {
      const room = await repo.findOrCreateRoom(customerId);
      await repo.closeRoom(room._id.toString());

      const rooms = await repo.getRoomsForAdmin();
      expect(rooms).toHaveLength(0);
    });
  });

  // ─── closeRoom ───

  describe('closeRoom', () => {
    it('should set room status to closed', async () => {
      const room = await repo.findOrCreateRoom(customerId);
      await repo.closeRoom(room._id.toString());

      const updated = await ChatRoom.findById(room._id);
      expect(updated!.status).toBe(ChatRoomStatus.CLOSED);
    });
  });
});
