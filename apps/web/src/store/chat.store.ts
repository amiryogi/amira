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
  messages: [] as IChatMessage[],
  unreadCount: 0,
  typingUsers: [] as TypingUser[],
  hasMoreMessages: true,
  connectionStatus: 'disconnected' as const,
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,

  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  setActiveRoom: (room) => set({ activeRoom: room, activeRoomId: room._id }),

  setMessages: (messages) => set({ messages }),

  prependMessages: (messages, hasMore) =>
    set((s) => ({
      messages: [
        ...messages.filter(
          (m) => !s.messages.some((existing) => existing._id === m._id),
        ),
        ...s.messages,
      ],
      hasMoreMessages: hasMore,
    })),

  // Dedup by _id to prevent double-renders on reconnect
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
    set((s) => ({
      typingUsers: s.typingUsers.filter((t) => t.userId !== userId),
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setHasMore: (hasMore) => set({ hasMoreMessages: hasMore }),
  reset: () => set(initialState),
}));
