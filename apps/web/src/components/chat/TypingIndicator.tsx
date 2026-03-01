import React from 'react';

interface TypingIndicatorProps {
  typingUsers: { userId: string; userName: string }[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = React.memo(
  function TypingIndicator({ typingUsers }) {
    if (typingUsers.length === 0) return null;

    const names = typingUsers.map((u) => u.userName).join(', ');

    return (
      <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-warm-500">
        <div className="flex items-center gap-0.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-warm-400 [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-warm-400 [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-warm-400" />
        </div>
        <span>{names} is typing...</span>
      </div>
    );
  },
);
