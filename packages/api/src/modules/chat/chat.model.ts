import mongoose, { Schema, Document } from 'mongoose';
import { ChatRoomStatus, MessageStatus, SenderRole } from '@amira/shared';
import { softDeletePlugin } from '../../common/softDeletePlugin.js';

// ─── ChatRoom ───

export interface IChatRoomDocument extends Document {
  customerId: mongoose.Types.ObjectId;
  adminId?: mongoose.Types.ObjectId;
  status: ChatRoomStatus;
  unreadCountCustomer: number;
  unreadCountAdmin: number;
  lastMessageAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chatRoomSchema = new Schema<IChatRoomDocument>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(ChatRoomStatus),
      default: ChatRoomStatus.OPEN,
      index: true,
    },
    unreadCountCustomer: { type: Number, default: 0 },
    unreadCountAdmin: { type: Number, default: 0 },
    lastMessageAt: { type: Date },
  },
  { timestamps: true },
);

// Apply soft delete plugin (adds isDeleted field + auto-filtering)
chatRoomSchema.plugin(softDeletePlugin);

// Unique partial index: enforces one open room per customer at DB level
// This eliminates the race condition found in the nevan implementation
chatRoomSchema.index(
  { customerId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: ChatRoomStatus.OPEN, isDeleted: false },
  },
);

// Non-unique index for admin queries
chatRoomSchema.index({ adminId: 1, status: 1 });

// For sorting by last activity
chatRoomSchema.index({ lastMessageAt: -1 });

export const ChatRoom = mongoose.model<IChatRoomDocument>('ChatRoom', chatRoomSchema);

// ─── Message ───

export interface IMessageDocument extends Document {
  roomId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderRole: SenderRole;
  content: string;
  attachments: { type: 'image'; url: string }[];
  status: MessageStatus;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessageDocument>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: Object.values(SenderRole),
      required: true,
    },
    content: {
      type: String,
      maxlength: 2000,
      trim: true,
      default: '',
    },
    attachments: [
      {
        _id: false,
        type: { type: String, enum: ['image'], default: 'image' },
        url: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.SENT,
    },
    deliveredAt: { type: Date },
    readAt: { type: Date },
  },
  { timestamps: true },
);

// Compound index for efficient paginated history queries
messageSchema.index({ roomId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessageDocument>('Message', messageSchema);
