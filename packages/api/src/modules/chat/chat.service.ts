import xss from 'xss';
import { ChatRepository, CreateMessageData } from './chat.repository.js';
import { IChatRoomDocument, IMessageDocument } from './chat.model.js';
import { CHAT_DEFAULTS, UserRole } from '@amira/shared';
import type { ChatAttachment } from '@amira/shared';

export class ChatService {
  private chatRepository: ChatRepository;

  constructor() {
    this.chatRepository = new ChatRepository();
  }

  // ─── Sanitization ───

  sanitizeContent(content: string): string {
    return xss(content.trim());
  }

  sanitizeAttachments(attachments: ChatAttachment[]): ChatAttachment[] {
    return attachments.map((a) => ({
      type: a.type,
      url: xss(a.url),
    }));
  }

  // ─── Room Operations ───

  async findOrCreateRoom(customerId: string): Promise<IChatRoomDocument> {
    return this.chatRepository.findOrCreateRoom(customerId);
  }

  async assignAdminToRoom(
    roomId: string,
    adminId: string,
  ): Promise<IChatRoomDocument | null> {
    return this.chatRepository.assignAdminToRoom(roomId, adminId);
  }

  async findRoomById(roomId: string): Promise<IChatRoomDocument | null> {
    return this.chatRepository.findRoomById(roomId);
  }

  async findRoomByIdPopulated(roomId: string): Promise<IChatRoomDocument | null> {
    return this.chatRepository.findRoomByIdPopulated(roomId);
  }

  async verifyRoomAccess(
    roomId: string,
    userId: string,
    userRole: string,
  ): Promise<boolean> {
    const room = await this.chatRepository.findRoomById(roomId);
    if (!room) return false;
    if (userRole === UserRole.ADMIN) return true;
    return room.customerId.toString() === userId;
  }

  // ─── Message Operations ───

  async getMessages(
    roomId: string,
    cursor?: string,
    limit: number = CHAT_DEFAULTS.PAGINATION_LIMIT,
  ): Promise<IMessageDocument[]> {
    return this.chatRepository.getMessages(roomId, cursor, limit);
  }

  async createMessage(data: CreateMessageData): Promise<IMessageDocument> {
    return this.chatRepository.createMessage(data);
  }

  // ─── Counter Operations ───

  async incrementUnreadCount(
    roomId: string,
    field: 'unreadCountCustomer' | 'unreadCountAdmin',
  ): Promise<void> {
    return this.chatRepository.incrementUnreadCount(roomId, field);
  }

  async resetUnreadCount(
    roomId: string,
    field: 'unreadCountCustomer' | 'unreadCountAdmin',
  ): Promise<void> {
    return this.chatRepository.resetUnreadCount(roomId, field);
  }

  // ─── Status Operations ───

  async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    return this.chatRepository.markMessagesAsRead(roomId, userId);
  }

  async markMessagesAsDelivered(roomId: string, userId: string): Promise<void> {
    return this.chatRepository.markMessagesAsDelivered(roomId, userId);
  }

  // ─── Admin Operations ───

  async getRoomsForAdmin(
    cursor?: string,
    limit?: number,
  ): Promise<IChatRoomDocument[]> {
    return this.chatRepository.getRoomsForAdmin(cursor, limit);
  }

  async closeRoom(roomId: string): Promise<void> {
    return this.chatRepository.closeRoom(roomId);
  }
}
