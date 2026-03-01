import { create } from 'zustand';
import type { IChatMessage, IChatRoom } from '@amira/shared';

interface TypingUser {
  userId: string;
  userName: string;
}

interface ChatState {
  // Chat data
  activeRoomId: string | null;
  activeRoom: IChatRoom | null;
  messages: IChatMessage[];
  unreadCount: number;
  typingUsers: TypingUser[];
  hasMoreMessages: boolean;

  // Status
  isLoading: boolean;
  error: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';

  // Actions
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
  activeRoomId: null,
  activeRoom: null,
  messages: [] as IChatMessage[],
  unreadCount: 0,
  typingUsers: [] as TypingUser[],
  hasMoreMessages: true,
  isLoading: false,
  error: null,
  connectionStatus: 'disconnected' as const,
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,

  setActiveRoom: (room) =>
    set({ activeRoom: room, activeRoomId: room._id }),

  setMessages: (messages) => set({ messages }),

  prependMessages: (messages, hasMore) =>
    set((s) => ({
      messages: [
        ...messages.filter((m) => !s.messages.some((existing) => existing._id === m._id)),
        ...s.messages,
      ],
      hasMoreMessages: hasMore,
    })),

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
    set((s) => ({ typingUsers: s.typingUsers.filter((t) => t.userId !== userId) })),

  setUnreadCount: (count) => set({ unreadCount: count }),
  incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setHasMore: (hasMore) => set({ hasMoreMessages: hasMore }),
  reset: () => set(initialState),
}));
