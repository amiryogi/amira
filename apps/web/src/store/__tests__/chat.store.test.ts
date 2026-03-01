import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from '@/store/chat.store';
import { MessageStatus } from '@amira/shared';
import type { IChatMessage } from '@amira/shared';

function makeMessage(overrides: Partial<IChatMessage> = {}): IChatMessage {
  const id = Math.random().toString(36).slice(2, 10);
  return {
    _id: id,
    roomId: 'room-1',
    senderId: 'user-1',
    senderRole: 'customer',
    content: 'Hello',
    attachments: [],
    status: MessageStatus.SENT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as IChatMessage;
}

describe('useChatStore', () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  // ─── UI toggles ───

  it('should start closed', () => {
    expect(useChatStore.getState().isOpen).toBe(false);
  });

  it('toggleChat flips isOpen', () => {
    useChatStore.getState().toggleChat();
    expect(useChatStore.getState().isOpen).toBe(true);
    useChatStore.getState().toggleChat();
    expect(useChatStore.getState().isOpen).toBe(false);
  });

  it('openChat / closeChat', () => {
    useChatStore.getState().openChat();
    expect(useChatStore.getState().isOpen).toBe(true);
    useChatStore.getState().closeChat();
    expect(useChatStore.getState().isOpen).toBe(false);
  });

  // ─── Messages ───

  it('setMessages replaces the list', () => {
    const msgs = [makeMessage({ _id: 'a' }), makeMessage({ _id: 'b' })];
    useChatStore.getState().setMessages(msgs);
    expect(useChatStore.getState().messages).toHaveLength(2);
  });

  it('addMessage appends and deduplicates', () => {
    const m = makeMessage({ _id: 'dup' });
    useChatStore.getState().addMessage(m);
    useChatStore.getState().addMessage(m);
    expect(useChatStore.getState().messages).toHaveLength(1);
  });

  it('prependMessages adds to the front and deduplicates', () => {
    const m1 = makeMessage({ _id: 'old' });
    const m2 = makeMessage({ _id: 'new' });

    useChatStore.getState().addMessage(m2);
    useChatStore.getState().prependMessages([m1, m2], false);

    const msgs = useChatStore.getState().messages;
    expect(msgs).toHaveLength(2);
    expect(msgs[0]._id).toBe('old');
    expect(useChatStore.getState().hasMoreMessages).toBe(false);
  });

  it('updateMessageStatus updates matching messages', () => {
    useChatStore.getState().setMessages([
      makeMessage({ _id: 'x', roomId: 'r1', status: MessageStatus.SENT }),
      makeMessage({ _id: 'y', roomId: 'r1', status: MessageStatus.READ }),
    ]);

    useChatStore.getState().updateMessageStatus('r1', 'delivered');

    const msgs = useChatStore.getState().messages;
    // Only the SENT one should update (READ stays READ)
    expect(msgs.find((m) => m._id === 'x')?.status).toBe('delivered');
    expect(msgs.find((m) => m._id === 'y')?.status).toBe('read');
  });

  // ─── Connection ───

  it('setConnectionStatus updates state', () => {
    useChatStore.getState().setConnectionStatus('connected');
    expect(useChatStore.getState().connectionStatus).toBe('connected');
  });

  // ─── Typing ───

  it('setTypingUser / removeTypingUser manages typing list', () => {
    useChatStore.getState().setTypingUser({ userId: 'u1', userName: 'Admin' });
    expect(useChatStore.getState().typingUsers).toHaveLength(1);

    // Duplicate should not add again
    useChatStore.getState().setTypingUser({ userId: 'u1', userName: 'Admin' });
    expect(useChatStore.getState().typingUsers).toHaveLength(1);

    useChatStore.getState().removeTypingUser('u1');
    expect(useChatStore.getState().typingUsers).toHaveLength(0);
  });

  // ─── Unread ───

  it('setUnreadCount / incrementUnread', () => {
    useChatStore.getState().setUnreadCount(5);
    expect(useChatStore.getState().unreadCount).toBe(5);

    useChatStore.getState().incrementUnread();
    expect(useChatStore.getState().unreadCount).toBe(6);
  });

  // ─── Loading / Error ───

  it('setLoading / setError', () => {
    useChatStore.getState().setLoading(true);
    expect(useChatStore.getState().isLoading).toBe(true);

    useChatStore.getState().setError('Something failed');
    expect(useChatStore.getState().error).toBe('Something failed');
  });

  // ─── Reset ───

  it('reset returns to initial state', () => {
    useChatStore.getState().openChat();
    useChatStore.getState().setUnreadCount(10);
    useChatStore.getState().addMessage(makeMessage());
    useChatStore.getState().setConnectionStatus('connected');

    useChatStore.getState().reset();

    const s = useChatStore.getState();
    expect(s.isOpen).toBe(false);
    expect(s.unreadCount).toBe(0);
    expect(s.messages).toHaveLength(0);
    expect(s.connectionStatus).toBe('disconnected');
  });
});
