import { describe, it, expect, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { ChatService } from '../chat.service.js';
import { ChatRoom } from '../chat.model.js';
import { ChatRoomStatus, SenderRole, UserRole } from '@amira/shared';
import { createTestUser, createTestAdmin } from '../../../test/factories/user.factory.js';

describe('ChatService', () => {
  let service: ChatService;
  let customerId: string;
  let adminId: string;

  beforeEach(async () => {
    service = new ChatService();
    const customer = await createTestUser();
    const admin = await createTestAdmin();
    customerId = (customer._id as mongoose.Types.ObjectId).toString();
    adminId = (admin._id as mongoose.Types.ObjectId).toString();
  });

  // ─── Sanitization ───

  describe('sanitizeContent', () => {
    it('should strip script tags', () => {
      const result = service.sanitizeContent('<script>alert("xss")</script>Hello');
      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
    });

    it('should strip event handlers', () => {
      const result = service.sanitizeContent('<img onerror="alert(1)" src=x>');
      expect(result).not.toContain('onerror');
    });

    it('should trim whitespace', () => {
      const result = service.sanitizeContent('  hello  ');
      expect(result).toBe('hello');
    });

    it('should preserve plain text content', () => {
      const result = service.sanitizeContent('Hello, how can I help you?');
      expect(result).toBe('Hello, how can I help you?');
    });

    it('should strip nested malicious tags', () => {
      const result = service.sanitizeContent(
        '<div onmouseover="steal()"><b>bold</b></div>',
      );
      expect(result).not.toContain('onmouseover');
      expect(result).not.toContain('steal');
    });
  });

  describe('sanitizeAttachments', () => {
    it('should strip XSS from URLs', () => {
      const result = service.sanitizeAttachments([
        { type: 'image', url: 'https://example.com/img.png?"><script>alert(1)</script>' },
      ]);
      expect(result[0].url).not.toContain('<script>');
      expect(result[0].type).toBe('image');
    });

    it('should pass through clean URLs', () => {
      const result = service.sanitizeAttachments([
        { type: 'image', url: 'https://res.cloudinary.com/amira/chat/img.webp' },
      ]);
      expect(result[0].url).toBe('https://res.cloudinary.com/amira/chat/img.webp');
    });
  });

  // ─── Room Access Verification ───

  describe('verifyRoomAccess', () => {
    it('should allow customer to access their own room', async () => {
      const room = await service.findOrCreateRoom(customerId);
      const hasAccess = await service.verifyRoomAccess(
        room._id.toString(),
        customerId,
        UserRole.USER,
      );
      expect(hasAccess).toBe(true);
    });

    it('should deny customer access to another customer room', async () => {
      const otherCustomer = await createTestUser();
      const otherCustomerId = (otherCustomer._id as mongoose.Types.ObjectId).toString();
      const room = await service.findOrCreateRoom(otherCustomerId);

      const hasAccess = await service.verifyRoomAccess(
        room._id.toString(),
        customerId,
        UserRole.USER,
      );
      expect(hasAccess).toBe(false);
    });

    it('should allow admin to access any room', async () => {
      const room = await service.findOrCreateRoom(customerId);
      const hasAccess = await service.verifyRoomAccess(
        room._id.toString(),
        adminId,
        UserRole.ADMIN,
      );
      expect(hasAccess).toBe(true);
    });

    it('should return false for non-existent room', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const hasAccess = await service.verifyRoomAccess(
        fakeId,
        customerId,
        UserRole.USER,
      );
      expect(hasAccess).toBe(false);
    });
  });

  // ─── Room Operations (delegate to repo, verify behavior) ───

  describe('findOrCreateRoom', () => {
    it('should create and return a room', async () => {
      const room = await service.findOrCreateRoom(customerId);
      expect(room).toBeDefined();
      expect(room.customerId.toString()).toBe(customerId);
    });
  });

  describe('closeRoom', () => {
    it('should close the room', async () => {
      const room = await service.findOrCreateRoom(customerId);
      await service.closeRoom(room._id.toString());

      const updated = await ChatRoom.findById(room._id);
      expect(updated!.status).toBe(ChatRoomStatus.CLOSED);
    });
  });

  // ─── Message Operations ───

  describe('createMessage', () => {
    it('should create and return message', async () => {
      const room = await service.findOrCreateRoom(customerId);
      const msg = await service.createMessage({
        roomId: room._id.toString(),
        senderId: customerId,
        senderRole: SenderRole.CUSTOMER,
        content: 'Test message',
        attachments: [],
      });

      expect(msg.content).toBe('Test message');
      expect(msg.senderRole).toBe(SenderRole.CUSTOMER);
    });
  });

  describe('getMessages', () => {
    it('should return messages for a room', async () => {
      const room = await service.findOrCreateRoom(customerId);
      const roomId = room._id.toString();

      await service.createMessage({
        roomId,
        senderId: customerId,
        senderRole: SenderRole.CUSTOMER,
        content: 'Hello',
        attachments: [],
      });

      const messages = await service.getMessages(roomId);
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Hello');
    });
  });

  // ─── Counter operations ───

  describe('incrementUnreadCount / resetUnreadCount', () => {
    it('should increment and then reset', async () => {
      const room = await service.findOrCreateRoom(customerId);
      const roomId = room._id.toString();

      await service.incrementUnreadCount(roomId, 'unreadCountAdmin');
      await service.incrementUnreadCount(roomId, 'unreadCountAdmin');

      let updated = await ChatRoom.findById(room._id);
      expect(updated!.unreadCountAdmin).toBe(2);

      await service.resetUnreadCount(roomId, 'unreadCountAdmin');
      updated = await ChatRoom.findById(room._id);
      expect(updated!.unreadCountAdmin).toBe(0);
    });
  });
});
