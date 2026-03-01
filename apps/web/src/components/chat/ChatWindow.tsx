import React from 'react';
import { useChatStore } from '@/store/chat.store';
import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';

export const ChatWindow: React.FC = React.memo(function ChatWindow() {
  const isOpen = useChatStore((s) => s.isOpen);
  const closeChat = useChatStore((s) => s.closeChat);
  const error = useChatStore((s) => s.error);

  const {
    connectionStatus,
    typingUsers,
    sendMessage,
    markAsRead,
    startTyping,
    stopTyping,
    loadMore,
  } = useChat();

  // Mark as read when window is visible
  React.useEffect(() => {
    if (isOpen && connectionStatus === 'connected') {
      markAsRead();
    }
  }, [isOpen, connectionStatus, markAsRead]);

  if (!isOpen) return null;

  const statusColor =
    connectionStatus === 'connected'
      ? 'bg-green-400'
      : connectionStatus === 'connecting'
        ? 'bg-yellow-400'
        : 'bg-red-400';

  const statusText =
    connectionStatus === 'connected'
      ? 'Connected'
      : connectionStatus === 'connecting'
        ? 'Connecting...'
        : 'Disconnected';

  return (
    <div className="fixed bottom-20 right-4 z-50 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-warm-200 bg-white shadow-2xl sm:right-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-warm-200 bg-brand-700 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Support Chat</h3>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${statusColor}`} />
              <span className="text-[10px] text-brand-200">{statusText}</span>
            </div>
          </div>
        </div>
        <button
          onClick={closeChat}
          className="rounded-lg p-1 text-brand-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Messages */}
      <MessageList onLoadMore={loadMore} />

      {/* Typing indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Input */}
      <MessageInput
        onSend={sendMessage}
        onTyping={startTyping}
        onStopTyping={stopTyping}
        disabled={connectionStatus !== 'connected'}
      />
    </div>
  );
});
