import React from 'react';
import type { IChatMessage } from '@amira/shared';
import { MessageStatus } from '@amira/shared';

interface MessageBubbleProps {
  message: IChatMessage;
  isOwn: boolean;
}

function formatTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function StatusIcon({ status }: { status: string }) {
  if (status === MessageStatus.READ) {
    return (
      <span className="text-blue-400" title="Read">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M1 12l5 5L17 6M7 12l5 5L23 6" />
        </svg>
      </span>
    );
  }
  if (status === MessageStatus.DELIVERED) {
    return (
      <span className="text-warm-400" title="Delivered">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M1 12l5 5L17 6M7 12l5 5L23 6" />
        </svg>
      </span>
    );
  }
  // Sent
  return (
    <span className="text-warm-400" title="Sent">
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
      </svg>
    </span>
  );
}

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  function MessageBubble({ message, isOwn }) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
            isOwn
              ? 'rounded-br-md bg-brand-700 text-white'
              : 'rounded-bl-md bg-warm-100 text-warm-900'
          }`}
        >
          {/* Sender label */}
          <p
            className={`mb-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              isOwn ? 'text-brand-200' : 'text-warm-500'
            }`}
          >
            {isOwn ? 'You' : 'Support'}
          </p>

          {/* Content */}
          {message.content && (
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.content}
            </p>
          )}

          {/* Image attachments */}
          {message.attachments?.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((att, i) => (
                <img
                  key={i}
                  src={att.url}
                  alt="attachment"
                  className="max-h-48 w-full rounded-lg object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          {/* Timestamp + status */}
          <div
            className={`mt-1 flex items-center gap-1.5 text-[10px] ${
              isOwn ? 'justify-end text-brand-200' : 'text-warm-400'
            }`}
          >
            <span>{formatTime(message.createdAt)}</span>
            {isOwn && <StatusIcon status={message.status} />}
          </div>
        </div>
      </div>
    );
  },
);
