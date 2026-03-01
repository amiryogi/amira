/**
 * Chat DTOs — Response shapes for the chat module.
 * Shared types are in @amira/shared; these extend for API-specific needs.
 */
import type { IChatMessage, IChatRoomPopulated } from '@amira/shared';

export interface ChatHistoryResponse {
  roomId: string;
  messages: IChatMessage[];
  isLoadMore?: boolean;
}

export interface NewMessageResponse {
  roomId: string;
  message: IChatMessage;
}

export interface RoomListResponse {
  rooms: IChatRoomPopulated[];
}

export interface RoomUpdatedResponse {
  roomId: string;
  status?: string;
}

export interface UploadAttachmentResponse {
  type: 'image';
  url: string;
}

export interface TypingResponse {
  roomId: string;
  userId: string;
  userName?: string;
}

export interface MessageStatusUpdateResponse {
  roomId: string;
  userId: string;
  status: 'delivered' | 'read';
}
