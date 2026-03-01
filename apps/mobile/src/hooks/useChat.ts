import { useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { socketService } from '@/services/socket';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { CHAT_EVENTS, CHAT_DEFAULTS, SenderRole } from '@amira/shared';
import type { IChatMessage, IChatRoomPopulated } from '@amira/shared';

interface UseChatOptions {
  /** For admin: pass roomId to join. For customer: omit. */
  roomId?: string;
}

export function useChat(options: UseChatOptions = {}) {
  const { roomId: targetRoomId } = options;
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const {
    messages,
    activeRoomId,
    connectionStatus,
    typingUsers,
    hasMoreMessages,
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
    setLoading,
    setError,
    setHasMore,
    reset,
  } = useChatStore();

  const activeRoomIdRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  // Connect on focus, disconnect on blur
  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      setConnectionStatus('connecting');
      setLoading(true);
      setError(null);

      let socket: ReturnType<typeof socketService.connect>;
      try {
        socket = socketService.connect();
      } catch {
        setConnectionStatus('error');
        setError('Failed to connect');
        setLoading(false);
        return;
      }

      const handleConnect = () => {
        setConnectionStatus('connected');

        const joinData = isAdmin && targetRoomId
          ? { roomId: targetRoomId }
          : {};

        socket.emit(
          CHAT_EVENTS.JOIN_CHAT,
          joinData,
          (response: {
            success?: boolean;
            room?: IChatRoomPopulated;
            messages?: IChatMessage[];
            hasMore?: boolean;
            error?: string;
          }) => {
            setLoading(false);
            if (response.error) {
              setError(response.error);
              return;
            }
            if (response.room) {
              setActiveRoom(response.room as unknown as ReturnType<typeof useChatStore.getState>['activeRoom'] & { _id: string });
            }
            if (response.messages) {
              setMessages(response.messages);
            }
            if (response.hasMore !== undefined) {
              setHasMore(response.hasMore);
            }
          },
        );
      };

      const handleDisconnect = () => {
        setConnectionStatus('disconnected');
      };

      const handleNewMessage = (message: IChatMessage) => {
        addMessage(message);

        // Auto mark as read if it's from the other party
        const myRole = isAdmin ? SenderRole.ADMIN : SenderRole.CUSTOMER;
        if (message.senderRole !== myRole && activeRoomIdRef.current) {
          socket.emit(CHAT_EVENTS.MESSAGE_READ, {
            roomId: activeRoomIdRef.current,
          });
        }
      };

      const handleStatusUpdate = (data: {
        roomId: string;
        status: string;
      }) => {
        updateMessageStatus(data.roomId, data.status);
      };

      const handleTyping = (data: { userId: string; userName: string }) => {
        setTypingUser({ userId: data.userId, userName: data.userName });
        // Auto-clear after timeout
        setTimeout(() => {
          removeTypingUser(data.userId);
        }, CHAT_DEFAULTS.TYPING_TIMEOUT + 500);
      };

      const handleStopTyping = (data: { userId: string }) => {
        removeTypingUser(data.userId);
      };

      const handleError = (data: { message: string }) => {
        setError(data.message);
      };

      // Register listeners
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on(CHAT_EVENTS.NEW_MESSAGE, handleNewMessage);
      socket.on(CHAT_EVENTS.MESSAGE_STATUS_UPDATE, handleStatusUpdate);
      socket.on(CHAT_EVENTS.USER_TYPING, handleTyping);
      socket.on(CHAT_EVENTS.USER_STOP_TYPING, handleStopTyping);
      socket.on(CHAT_EVENTS.CHAT_ERROR, handleError);

      // If already connected, join immediately
      if (socket.connected) {
        handleConnect();
      }

      // Cleanup on blur/unmount
      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off(CHAT_EVENTS.NEW_MESSAGE, handleNewMessage);
        socket.off(CHAT_EVENTS.MESSAGE_STATUS_UPDATE, handleStatusUpdate);
        socket.off(CHAT_EVENTS.USER_TYPING, handleTyping);
        socket.off(CHAT_EVENTS.USER_STOP_TYPING, handleStopTyping);
        socket.off(CHAT_EVENTS.CHAT_ERROR, handleError);
        socketService.disconnect();
        reset();
      };
    }, [user, targetRoomId, isAdmin]),
  );

  const sendMessage = useCallback(
    (content: string, attachments?: { type: 'image'; url: string }[]) => {
      const socket = socketService.getSocket();
      const roomId = activeRoomIdRef.current;
      if (!socket?.connected || !roomId || !content.trim()) return;

      socket.emit(
        CHAT_EVENTS.SEND_MESSAGE,
        {
          roomId,
          content: content.trim(),
          attachments: attachments && attachments.length > 0 ? attachments : undefined,
        },
        (response: { success?: boolean; error?: string }) => {
          if (response.error) {
            setError(response.error);
          }
        },
      );
    },
    [setError],
  );

  const startTyping = useCallback(() => {
    const socket = socketService.getSocket();
    const roomId = activeRoomIdRef.current;
    if (!socket?.connected || !roomId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit(CHAT_EVENTS.TYPING, { roomId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit(CHAT_EVENTS.STOP_TYPING, { roomId });
    }, CHAT_DEFAULTS.TYPING_TIMEOUT);
  }, []);

  const stopTyping = useCallback(() => {
    const socket = socketService.getSocket();
    const roomId = activeRoomIdRef.current;
    if (!socket?.connected || !roomId || !isTypingRef.current) return;

    isTypingRef.current = false;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit(CHAT_EVENTS.STOP_TYPING, { roomId });
  }, []);

  const loadMore = useCallback(() => {
    const socket = socketService.getSocket();
    const roomId = activeRoomIdRef.current;
    if (!socket?.connected || !roomId || messages.length === 0) return;

    const oldestId = messages[0]._id;
    socket.emit(
      CHAT_EVENTS.LOAD_MORE,
      { roomId, cursor: oldestId },
      (response: { messages?: IChatMessage[]; hasMore?: boolean }) => {
        if (response.messages && response.messages.length > 0) {
          prependMessages(response.messages, response.hasMore ?? false);
        } else {
          setHasMore(false);
        }
      },
    );
  }, [messages, prependMessages, setHasMore]);

  return {
    messages,
    connectionStatus,
    typingUsers,
    hasMoreMessages,
    isLoading,
    error,
    sendMessage,
    startTyping,
    stopTyping,
    loadMore,
  };
}
