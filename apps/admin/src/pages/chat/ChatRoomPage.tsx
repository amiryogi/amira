import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socketService } from '@/lib/socket';
import { CHAT_EVENTS, CHAT_DEFAULTS, API_ENDPOINTS, SenderRole } from '@amira/shared';
import type { IChatMessage, IChatRoomPopulated, ChatAttachment } from '@amira/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Send,
  ImagePlus,
  X,
  Loader2,
  CheckCheck,
  Check,
  User,
} from 'lucide-react';
import api from '@/providers/api';

function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatRoomPage() {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [room, setRoom] = useState<IChatRoomPopulated | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Socket connection + event handlers
  useEffect(() => {
    if (!roomId) return;

    setIsLoading(true);
    setError(null);

    let socket: ReturnType<typeof socketService.connect>;
    try {
      socket = socketService.connect();
    } catch {
      setError('Failed to connect');
      setIsLoading(false);
      return;
    }

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit(
        CHAT_EVENTS.JOIN_CHAT,
        { roomId },
        (response: {
          success?: boolean;
          room?: IChatRoomPopulated;
          messages?: IChatMessage[];
          hasMore?: boolean;
          error?: string;
        }) => {
          setIsLoading(false);
          if (response.error) {
            setError(response.error);
            return;
          }
          if (response.room) setRoom(response.room);
          if (response.messages) {
            setMessages(response.messages);
            setTimeout(scrollToBottom, 100);
          }
          if (response.hasMore !== undefined) setHasMore(response.hasMore);
        },
      );
    };

    const handleDisconnect = () => setIsConnected(false);

    const handleNewMessage = (message: IChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
      setTimeout(scrollToBottom, 50);

      // Mark as read if from customer
      if (message.senderRole === SenderRole.CUSTOMER) {
        socket.emit(CHAT_EVENTS.MESSAGE_READ, { roomId });
      }
    };

    const handleStatusUpdate = (data: {
      messageIds: string[];
      status: string;
      readAt?: string;
    }) => {
      setMessages((prev) =>
        prev.map((m) =>
          data.messageIds.includes(m._id)
            ? {
                ...m,
                status: data.status as IChatMessage['status'],
                ...(data.readAt ? { readAt: new Date(data.readAt) } : {}),
              }
            : m,
        ),
      );
    };

    const handleTyping = (data: { userId: string; userName: string; name?: string }) => {
      setTypingUser(data.userName || data.name || 'Customer');
    };

    const handleStopTyping = () => {
      setTypingUser(null);
    };

    const handleChatError = (data: { message: string }) => {
      setError(data.message);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(CHAT_EVENTS.NEW_MESSAGE, handleNewMessage);
    socket.on(CHAT_EVENTS.MESSAGE_STATUS_UPDATE, handleStatusUpdate);
    socket.on(CHAT_EVENTS.USER_TYPING, handleTyping);
    socket.on(CHAT_EVENTS.USER_STOP_TYPING, handleStopTyping);
    socket.on(CHAT_EVENTS.CHAT_ERROR, handleChatError);

    if (socket.connected) handleConnect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(CHAT_EVENTS.NEW_MESSAGE, handleNewMessage);
      socket.off(CHAT_EVENTS.MESSAGE_STATUS_UPDATE, handleStatusUpdate);
      socket.off(CHAT_EVENTS.USER_TYPING, handleTyping);
      socket.off(CHAT_EVENTS.USER_STOP_TYPING, handleStopTyping);
      socket.off(CHAT_EVENTS.CHAT_ERROR, handleChatError);
      socketService.disconnect();
    };
  }, [roomId, scrollToBottom]);

  const handleSendMessage = useCallback(() => {
    if ((!inputValue.trim() && pendingAttachments.length === 0) || !roomId || isSending) return;

    setIsSending(true);
    const socket = socketService.getSocket();
    if (!socket?.connected) {
      setError('Not connected');
      setIsSending(false);
      return;
    }

    socket.emit(
      CHAT_EVENTS.SEND_MESSAGE,
      {
        roomId,
        content: inputValue.trim(),
        attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
      },
      (response: { success?: boolean; message?: IChatMessage; error?: string }) => {
        setIsSending(false);
        if (response.error) {
          setError(response.error);
          return;
        }
        setInputValue('');
        setPendingAttachments([]);
        isTypingRef.current = false;
      },
    );
  }, [inputValue, pendingAttachments, roomId, isSending]);

  const handleTyping = useCallback(() => {
    const socket = socketService.getSocket();
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
  }, [roomId]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await api.post(API_ENDPOINTS.CHAT.UPLOAD, formData);
        setPendingAttachments((prev) => [...prev, { type: 'image', url: data.data.url }]);
      } catch {
        setError('Image upload failed');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [],
  );

  const handleLoadMore = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket?.connected || !roomId || messages.length === 0) return;

    const oldestId = messages[0]._id;
    socket.emit(
      CHAT_EVENTS.LOAD_MORE,
      { roomId, before: oldestId },
      (response: { messages?: IChatMessage[]; hasMore?: boolean }) => {
        if (response.messages && response.messages.length > 0) {
          setMessages((prev) => [...response.messages!, ...prev]);
        }
        if (response.hasMore !== undefined) setHasMore(response.hasMore);
      },
    );
  }, [roomId, messages]);

  const handleCloseChat = useCallback(() => {
    const socket = socketService.getSocket();
    if (!socket?.connected || !roomId) return;
    socket.emit(CHAT_EVENTS.CLOSE_CHAT, { roomId });
    navigate('/chat');
  }, [roomId, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const customer = room?.customerId;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Main Chat Area */}
      <Card className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/chat')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {customer?.name || 'Customer'}
            </p>
            <p className="text-xs text-gray-500">{customer?.email || ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-400'}`}
            />
            {room?.status === 'open' ? (
              <Badge variant="success">Open</Badge>
            ) : (
              <Badge variant="secondary">Closed</Badge>
            )}
            {room?.status === 'open' && (
              <Button variant="outline" size="sm" onClick={handleCloseChat}>
                Close Chat
              </Button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
            {error}
            <button onClick={() => setError(null)} className="ml-2">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-3">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {hasMore && (
                <div className="mb-3 text-center">
                  <Button variant="ghost" size="sm" onClick={handleLoadMore}>
                    Load older messages
                  </Button>
                </div>
              )}

              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No messages yet
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => {
                    const isAdmin = msg.senderRole === 'admin';
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            isAdmin
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {msg.attachments?.map((att, i) => (
                            <img
                              key={i}
                              src={att.url}
                              alt="attachment"
                              className="mb-1 max-h-48 rounded"
                            />
                          ))}
                          {msg.content && (
                            <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                          )}
                          <div
                            className={`mt-1 flex items-center gap-1 text-[10px] ${
                              isAdmin ? 'justify-end text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            <span>{formatTime(msg.createdAt)}</span>
                            {isAdmin && (
                              <span>
                                {msg.status === 'read' ? (
                                  <CheckCheck className="h-3 w-3 text-blue-400" />
                                ) : msg.status === 'delivered' ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {typingUser && (
                <div className="mt-2 text-xs text-gray-400">{typingUser} is typing...</div>
              )}
            </>
          )}
        </div>

        {/* Input Area */}
        {room?.status === 'open' && (
          <div className="border-t px-4 py-3">
            {/* Pending attachments */}
            {pendingAttachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {pendingAttachments.map((att, i) => (
                  <div key={i} className="relative">
                    <img src={att.url} alt="" className="h-16 w-16 rounded object-cover" />
                    <button
                      onClick={() =>
                        setPendingAttachments((prev) => prev.filter((_, idx) => idx !== i))
                      }
                      className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  handleTyping();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                maxLength={CHAT_DEFAULTS.MAX_MESSAGE_LENGTH}
                disabled={!isConnected || isSending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={
                  (!inputValue.trim() && pendingAttachments.length === 0) ||
                  !isConnected ||
                  isSending
                }
                size="icon"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {inputValue.length > CHAT_DEFAULTS.MAX_MESSAGE_LENGTH - 200 && (
              <p className="mt-1 text-right text-xs text-gray-400">
                {inputValue.length}/{CHAT_DEFAULTS.MAX_MESSAGE_LENGTH}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Customer Info Sidebar */}
      <Card className="hidden w-72 flex-shrink-0 lg:block">
        <CardContent className="p-4">
          <div className="flex flex-col items-center gap-3 border-b pb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">{customer?.name || 'Customer'}</p>
              <p className="text-xs text-gray-500">{customer?.email || ''}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500">Room ID</p>
              <p className="text-sm text-gray-700">{roomId}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Status</p>
              <Badge variant={room?.status === 'open' ? 'success' : 'secondary'}>
                {room?.status || '-'}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Messages</p>
              <p className="text-sm text-gray-700">{messages.length}</p>
            </div>
            {room?.createdAt && (
              <div>
                <p className="text-xs font-medium text-gray-500">Created</p>
                <p className="text-sm text-gray-700">
                  {new Date(room.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
