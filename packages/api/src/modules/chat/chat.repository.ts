import mongoose, { FilterQuery } from 'mongoose';
import { ChatRoom, IChatRoomDocument, Message, IMessageDocument } from './chat.model.js';
import { ChatRoomStatus, SenderRole, CHAT_DEFAULTS } from '@amira/shared';
import type { ChatAttachment } from '@amira/shared';

export interface CreateMessageData {
  roomId: string;
  senderId: string;
  senderRole: SenderRole;
  content: string;
  attachments: ChatAttachment[];
}

export class ChatRepository {
  // ─── Room Operations ───

  /**
   * Atomic upsert: finds existing open room or creates one.
   * Combined with the unique partial index on (customerId, status),
   * this eliminates the race condition found in nevan.
   */
  async findOrCreateRoom(customerId: string): Promise<IChatRoomDocument> {
    const filter = {
      customerId: new mongoose.Types.ObjectId(customerId),
      status: ChatRoomStatus.OPEN,
    };
    try {
      const room = await ChatRoom.findOneAndUpdate(
        filter,
        {
          $setOnInsert: {
            customerId: new mongoose.Types.ObjectId(customerId),
            status: ChatRoomStatus.OPEN,
            unreadCountCustomer: 0,
            unreadCountAdmin: 0,
          },
        },
        { upsert: true, new: true },
      );
      return room;
    } catch (error: unknown) {
      // E11000 duplicate key on the unique partial index means another
      // concurrent call won the upsert race — just find the existing room.
      if (error instanceof Error && 'code' in error && (error as { code: number }).code === 11000) {
        const existing = await ChatRoom.findOne(filter);
        if (existing) return existing;
      }
      throw error;
    }
  }

  /**
   * Atomic admin assignment — race-safe.
   * Only assigns if room has no admin or the same admin.
   */
  async assignAdminToRoom(
    roomId: string,
    adminId: string,
  ): Promise<IChatRoomDocument | null> {
    return ChatRoom.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(roomId),
        status: ChatRoomStatus.OPEN,
        $or: [
          { adminId: null },
          { adminId: { $exists: false } },
          { adminId: new mongoose.Types.ObjectId(adminId) },
        ],
      },
      { $set: { adminId: new mongoose.Types.ObjectId(adminId) } },
      { new: true },
    );
  }

  async findRoomById(roomId: string): Promise<IChatRoomDocument | null> {
    return ChatRoom.findById(roomId);
  }

  async findRoomByIdPopulated(roomId: string): Promise<IChatRoomDocument | null> {
    return ChatRoom.findById(roomId)
      .populate('customerId', 'name email')
      .populate('adminId', 'name')
      .lean() as unknown as IChatRoomDocument | null;
  }

  async findRoomByCustomer(customerId: string): Promise<IChatRoomDocument | null> {
    return ChatRoom.findOne({
      customerId: new mongoose.Types.ObjectId(customerId),
      status: ChatRoomStatus.OPEN,
    });
  }

  // ─── Message Operations ───

  /**
   * Cursor-based pagination for message history.
   * Returns messages in descending order (newest first).
   * Caller should reverse for chronological display.
   */
  async getMessages(
    roomId: string,
    cursor?: string,
    limit: number = CHAT_DEFAULTS.PAGINATION_LIMIT,
  ): Promise<IMessageDocument[]> {
    const query: FilterQuery<IMessageDocument> = {
      roomId: new mongoose.Types.ObjectId(roomId),
    };
    if (cursor) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }
    return Message.find(query).sort({ createdAt: -1 }).limit(limit).lean() as unknown as IMessageDocument[];
  }

  async createMessage(data: CreateMessageData): Promise<IMessageDocument> {
    const message = await Message.create({
      roomId: new mongoose.Types.ObjectId(data.roomId),
      senderId: new mongoose.Types.ObjectId(data.senderId),
      senderRole: data.senderRole,
      content: data.content,
      attachments: data.attachments,
    });
    return message.toObject();
  }

  // ─── Atomic Counter Operations ───
  // FIX from nevan: Use $inc instead of room.save() to prevent lost updates

  async incrementUnreadCount(
    roomId: string,
    field: 'unreadCountCustomer' | 'unreadCountAdmin',
  ): Promise<void> {
    await ChatRoom.updateOne(
      { _id: new mongoose.Types.ObjectId(roomId) },
      {
        $inc: { [field]: 1 },
        $set: { lastMessageAt: new Date() },
      },
    );
  }

  async resetUnreadCount(
    roomId: string,
    field: 'unreadCountCustomer' | 'unreadCountAdmin',
  ): Promise<void> {
    await ChatRoom.updateOne(
      { _id: new mongoose.Types.ObjectId(roomId) },
      { $set: { [field]: 0 } },
    );
  }

  // ─── Message Status Operations ───

  async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    await Message.updateMany(
      {
        roomId: new mongoose.Types.ObjectId(roomId),
        senderId: { $ne: new mongoose.Types.ObjectId(userId) },
        status: { $ne: 'read' },
      },
      { $set: { status: 'read', readAt: new Date() } },
    );
  }

  async markMessagesAsDelivered(roomId: string, userId: string): Promise<void> {
    await Message.updateMany(
      {
        roomId: new mongoose.Types.ObjectId(roomId),
        senderId: { $ne: new mongoose.Types.ObjectId(userId) },
        status: 'sent',
      },
      { $set: { status: 'delivered', deliveredAt: new Date() } },
    );
  }

  // ─── Admin Room Queries ───

  /**
   * Paginated room list for admin dashboard.
   * FIX from nevan: Was unpaginated — returned ALL open rooms.
   */
  async getRoomsForAdmin(
    cursor?: string,
    limit: number = 20,
  ): Promise<IChatRoomDocument[]> {
    const query: FilterQuery<IChatRoomDocument> = {
      status: ChatRoomStatus.OPEN,
    };
    if (cursor) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }
    return ChatRoom.find(query)
      .populate('customerId', 'name email')
      .populate('adminId', 'name')
      .sort({ lastMessageAt: -1 })
      .limit(limit)
      .lean() as unknown as IChatRoomDocument[];
  }

  async closeRoom(roomId: string): Promise<void> {
    await ChatRoom.updateOne(
      { _id: new mongoose.Types.ObjectId(roomId) },
      { $set: { status: ChatRoomStatus.CLOSED } },
    );
  }
}
