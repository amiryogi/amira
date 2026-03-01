import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useChatStore } from '@/store/chat.store';
import { useAuthStore } from '@/store/auth.store';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  onLoadMore: () => void;
}

export const MessageList: React.FC<MessageListProps> = React.memo(
  function MessageList({ onLoadMore }) {
    const messages = useChatStore((s) => s.messages);
    const hasMore = useChatStore((s) => s.hasMoreMessages);
    const isLoading = useChatStore((s) => s.isLoading);
    const user = useAuthStore((s) => s.user);

    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [showNewPill, setShowNewPill] = useState(false);
    const prevMessageCountRef = useRef(messages.length);
    const isNearBottomRef = useRef(true);

    const checkNearBottom = useCallback(() => {
      const el = containerRef.current;
      if (!el) return true;
      const threshold = 100;
      return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    }, []);

    // Auto-scroll on new messages only if near bottom
    useEffect(() => {
      if (messages.length > prevMessageCountRef.current) {
        if (isNearBottomRef.current) {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
          setShowNewPill(true);
        }
      }
      prevMessageCountRef.current = messages.length;
    }, [messages.length]);

    // Scroll to bottom on initial load
    useEffect(() => {
      if (!isLoading && messages.length > 0) {
        bottomRef.current?.scrollIntoView();
      }
    }, [isLoading]);

    const handleScroll = () => {
      isNearBottomRef.current = checkNearBottom();
      if (isNearBottomRef.current) {
        setShowNewPill(false);
      }
    };

    const scrollToBottom = () => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShowNewPill(false);
    };

    if (isLoading) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-warm-500">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading messages...
          </div>
        </div>
      );
    }

    if (messages.length === 0) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
            <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-warm-700">Start a conversation</p>
          <p className="text-xs text-warm-500">Send a message to get help from our support team.</p>
        </div>
      );
    }

    return (
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto px-4 py-3"
        >
          {/* Load more */}
          {hasMore && (
            <div className="mb-3 flex justify-center">
              <button
                onClick={onLoadMore}
                className="rounded-full bg-warm-100 px-4 py-1.5 text-xs font-medium text-warm-600 transition-colors hover:bg-warm-200"
              >
                Load older messages
              </button>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.senderId === user?._id}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* New messages pill */}
        {showNewPill && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-brand-700 px-4 py-1.5 text-xs font-medium text-white shadow-lg transition-colors hover:bg-brand-800"
          >
            New messages ↓
          </button>
        )}
      </div>
    );
  },
);
