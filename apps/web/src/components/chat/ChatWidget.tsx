import React from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useChatStore } from '@/store/chat.store';
import { ChatWindow } from './ChatWindow';

export const ChatWidget: React.FC = React.memo(function ChatWidget() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isOpen = useChatStore((s) => s.isOpen);
  const toggleChat = useChatStore((s) => s.toggleChat);
  const unreadCount = useChatStore((s) => s.unreadCount);
  const connectionStatus = useChatStore((s) => s.connectionStatus);

  if (!isAuthenticated) return null;

  const statusDotColor =
    connectionStatus === 'connected'
      ? 'bg-green-400'
      : connectionStatus === 'connecting'
        ? 'bg-yellow-400 animate-pulse'
        : 'bg-warm-300';

  return (
    <>
      {/* Chat window */}
      <ChatWindow />

      {/* Floating button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg transition-all hover:bg-brand-800 hover:shadow-xl active:scale-95 sm:right-6"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
        )}

        {/* Connection status dot */}
        <span
          className={`absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white ${statusDotColor}`}
        />

        {/* Unread badge */}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </>
  );
});
