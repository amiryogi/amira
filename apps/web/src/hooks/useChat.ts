import { useEffect, useRef, useCallback } from 'react';
import { socketService } from '@/services/socket';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { CHAT_EVENTS, CHAT_DEFAULTS } from '@amira/shared';
import type { IChatMessage, IChatRoom } from '@amira/shared';

let typingTimeout: ReturnType<typeof setTimeout> | null = null;

export function useChat() {
  const {
    isOpen,
    activeRoomId,
    messages,
    connectionStatus,
    typingUsers,
    hasMoreMessages,
    unreadCount,
    isLoading,
    error,
    setActiveRoom,
    setMessages,
    prependMessages,
    addMessage,
    updateMessageStatus,
    setConnectionStatus,
    setTypingUser,
    removeTypingUser,
    setUnreadCount,
    incrementUnread,
    setLoading,
    setError,
    setHasMore,
  } = useChatStore();

  const { isAuthenticated, user } = useAuthStore();
  const activeRoomRef = useRef(activeRoomId);

  // Keep ref in sync
  useEffect(() => {
    activeRoomRef.current = activeRoomId;
  }, [activeRoomId]);

  // ─── Socket Lifecycle ───
  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;

    setConnectionStatus('connecting');
    setLoading(true);

    let socket;
    try {
      socket = socketService.connect();
    } catch {
      setConnectionStatus('error');
      setError('Failed to connect to chat');
      setLoading(false);
      return;
    }

    // ── Event Handlers ──
    const handleConnect = () => {
      setConnectionStatus('connected');
      setError(null);

      // Join/create chat room
      socket.emit(CHAT_EVENTS.JOIN_CHAT, {}, (response: {
        success?: boolean;
        error?: string;
        room?: IChatRoom;
        messages?: IChatMessage[];
      }) => {
        setLoading(false);
        if (response.error) {
          setError(response.error);
          return;
        }
        if (response.room) {
          setActiveRoom(response.room);
          setUnreadCount(response.room.unreadCountCustomer);
        }
        if (response.messages) {
          setMessages(response.messages);
          setHasMore(response.messages.length >= CHAT_DEFAULTS.INITIAL_MESSAGE_LIMIT);
        }
      });
    };

    const handleDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    const handleConnectError = () => {
      setConnectionStatus('error');
    };

    const handleNewMessage = (message: IChatMessage) => {
      addMessage(message);
      // If the chat isn't open or message is from someone else, increment unread
      if (message.senderId !== user?._id) {
        if (!useChatStore.getState().isOpen) {
          incrementUnread();
        }
      }
    };

    const handleMessageStatusUpdate = (data: { roomId: string; status: string }) => {
      updateMessageStatus(data.roomId, data.status);
    };

    const handleUserTyping = (data: { userId: string; userName: string }) => {
      if (data.userId !== user?._id) {
        setTypingUser(data);
        // Auto-clear typing after timeout
        setTimeout(() => removeTypingUser(data.userId), CHAT_DEFAULTS.TYPING_TIMEOUT);
      }
    };

    const handleUserStopTyping = (data: { userId: string }) => {
      removeTypingUser(data.userId);
    };

    const handleChatError = (data: { message: string }) => {
      setError(data.message);
    };

    // Register listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on(CHAT_EVENTS.NEW_MESSAGE, handleNewMessage);
    socket.on(CHAT_EVENTS.MESSAGE_STATUS_UPDATE, handleMessageStatusUpdate);
    socket.on(CHAT_EVENTS.USER_TYPING, handleUserTyping);
    socket.on(CHAT_EVENTS.USER_STOP_TYPING, handleUserStopTyping);
    socket.on(CHAT_EVENTS.CHAT_ERROR, handleChatError);

    // If already connected, trigger join immediately
    if (socket.connected) {
      handleConnect();
    }

    // Cleanup
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off(CHAT_EVENTS.NEW_MESSAGE, handleNewMessage);
      socket.off(CHAT_EVENTS.MESSAGE_STATUS_UPDATE, handleMessageStatusUpdate);
      socket.off(CHAT_EVENTS.USER_TYPING, handleUserTyping);
      socket.off(CHAT_EVENTS.USER_STOP_TYPING, handleUserStopTyping);
      socket.off(CHAT_EVENTS.CHAT_ERROR, handleChatError);
      socketService.disconnect();
    };
  }, [isAuthenticated, isOpen]);

  // ─── Actions ───
  const sendMessage = useCallback(
    (content: string, attachments?: { type: 'image'; url: string }[]) => {
      const socket = socketService.getSocket();
      if (!socket || !activeRoomRef.current) return;

      socket.emit(
        CHAT_EVENTS.SEND_MESSAGE,
        {
          roomId: activeRoomRef.current,
          content,
          attachments: attachments || [],
        },
        (response: { success?: boolean; error?: string }) => {
          if (response.error) {
            setError(response.error);
          }
        },
      );
    },
    [],
  );

  const markAsRead = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket || !activeRoomRef.current) return;

    socket.emit(CHAT_EVENTS.MESSAGE_READ, {
      roomId: activeRoomRef.current,
    });
    setUnreadCount(0);
  }, []);

  const startTyping = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket || !activeRoomRef.current) return;

    socket.emit(CHAT_EVENTS.TYPING, { roomId: activeRoomRef.current });

    // Auto-stop after timeout
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit(CHAT_EVENTS.STOP_TYPING, { roomId: activeRoomRef.current });
    }, CHAT_DEFAULTS.TYPING_TIMEOUT - 500);
  }, []);

  const stopTyping = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket || !activeRoomRef.current) return;

    if (typingTimeout) clearTimeout(typingTimeout);
    socket.emit(CHAT_EVENTS.STOP_TYPING, { roomId: activeRoomRef.current });
  }, []);

  const loadMore = useCallback(() => {
    const socket = socketService.getSocket();
    const store = useChatStore.getState();
    if (!socket || !store.activeRoomId || !store.hasMoreMessages) return;

    const oldestMessage = store.messages[0];
    if (!oldestMessage) return;

    socket.emit(
      CHAT_EVENTS.LOAD_MORE,
      { roomId: store.activeRoomId, cursor: oldestMessage._id },
      (response: { success?: boolean; messages?: IChatMessage[]; hasMore?: boolean }) => {
        if (response.messages) {
          prependMessages(response.messages, response.hasMore ?? false);
        }
      },
    );
  }, []);

  return {
    messages,
    connectionStatus,
    typingUsers,
    hasMoreMessages,
    unreadCount,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    loadMore,
  };
}
