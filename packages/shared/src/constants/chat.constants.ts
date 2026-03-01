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
