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
  roomId?: string;
}
