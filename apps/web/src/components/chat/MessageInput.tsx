import React, { useState, useRef } from 'react';
import { api } from '@/services/api';
import { API_ENDPOINTS, CHAT_DEFAULTS } from '@amira/shared';

interface MessageInputProps {
  onSend: (content: string, attachments?: { type: 'image'; url: string }[]) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = React.memo(
  function MessageInput({ onSend, onTyping, onStopTyping, disabled }) {
    const [content, setContent] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingRef = useRef(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = content.trim();
      if (!trimmed || disabled) return;
      onSend(trimmed);
      setContent('');
      if (typingRef.current) {
        typingRef.current = false;
        onStopTyping();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      if (val.length > CHAT_DEFAULTS.MAX_MESSAGE_LENGTH) return;
      setContent(val);

      if (!typingRef.current && val.trim()) {
        typingRef.current = true;
        onTyping();
      }
      if (typingRef.current && !val.trim()) {
        typingRef.current = false;
        onStopTyping();
      }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', file);
        const { data } = await api.post(API_ENDPOINTS.CHAT.UPLOAD, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const attachment = data.data as { type: 'image'; url: string };
        onSend('', [attachment]);
      } catch {
        // Silently fail — user can retry
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    const charCount = content.length;
    const showCounter = charCount > CHAT_DEFAULTS.MAX_MESSAGE_LENGTH - 200;

    return (
      <form onSubmit={handleSubmit} className="border-t border-warm-200 bg-white p-3">
        <div className="flex items-end gap-2">
          {/* Image upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-warm-500 transition-colors hover:bg-warm-100 hover:text-warm-700 disabled:opacity-50"
            title="Upload image"
          >
            {isUploading ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          {/* Text input */}
          <div className="relative flex-1">
            <textarea
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              disabled={disabled}
              className="max-h-24 w-full resize-none rounded-xl border border-warm-200 bg-warm-50 px-4 py-2.5 text-sm text-warm-900 placeholder-warm-400 outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
            />
            {showCounter && (
              <span
                className={`absolute bottom-1 right-2 text-[10px] ${
                  charCount >= CHAT_DEFAULTS.MAX_MESSAGE_LENGTH
                    ? 'text-red-500'
                    : 'text-warm-400'
                }`}
              >
                {charCount}/{CHAT_DEFAULTS.MAX_MESSAGE_LENGTH}
              </span>
            )}
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!content.trim() || disabled}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-700 text-white transition-colors hover:bg-brand-800 disabled:opacity-40"
            title="Send message"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </form>
    );
  },
);
