import { useChatStore } from '@/store/chat.store';
import { MessageStatus } from '@amira/shared';
import type { IChatMessage, IChatRoom } from '@amira/shared';

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

const fakeRoom: IChatRoom = {
  _id: 'room-1',
  customerId: 'c-1',
  status: 'open' as IChatRoom['status'],
  unreadCountCustomer: 0,
  unreadCountAdmin: 0,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('mobile useChatStore', () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  it('should start in initial state', () => {
    const s = useChatStore.getState();
    expect(s.messages).toHaveLength(0);
    expect(s.activeRoomId).toBeNull();
    expect(s.connectionStatus).toBe('disconnected');
  });

  it('setActiveRoom sets room and roomId', () => {
    useChatStore.getState().setActiveRoom(fakeRoom);
    expect(useChatStore.getState().activeRoomId).toBe('room-1');
    expect(useChatStore.getState().activeRoom?._id).toBe('room-1');
  });

  it('setMessages replaces message list', () => {
    const msgs = [makeMessage({ _id: 'a' }), makeMessage({ _id: 'b' })];
    useChatStore.getState().setMessages(msgs);
    expect(useChatStore.getState().messages).toHaveLength(2);
  });

  it('addMessage deduplicates by _id', () => {
    const m = makeMessage({ _id: 'dup' });
    useChatStore.getState().addMessage(m);
    useChatStore.getState().addMessage(m);
    expect(useChatStore.getState().messages).toHaveLength(1);
  });

  it('prependMessages adds to front and deduplicates', () => {
    const m1 = makeMessage({ _id: 'old' });
    const m2 = makeMessage({ _id: 'new' });

    useChatStore.getState().addMessage(m2);
    useChatStore.getState().prependMessages([m1, m2], false);

    const msgs = useChatStore.getState().messages;
    expect(msgs).toHaveLength(2);
    expect(msgs[0]._id).toBe('old');
    expect(useChatStore.getState().hasMoreMessages).toBe(false);
  });

  it('updateMessageStatus updates non-read messages matching roomId', () => {
    useChatStore.getState().setMessages([
      makeMessage({ _id: 'x', roomId: 'r1', status: MessageStatus.SENT }),
      makeMessage({ _id: 'y', roomId: 'r1', status: MessageStatus.READ }),
    ]);
    useChatStore.getState().updateMessageStatus('r1', 'delivered');

    const msgs = useChatStore.getState().messages;
    expect(msgs.find((m) => m._id === 'x')?.status).toBe('delivered');
    expect(msgs.find((m) => m._id === 'y')?.status).toBe('read');
  });

  it('setConnectionStatus updates status', () => {
    useChatStore.getState().setConnectionStatus('connected');
    expect(useChatStore.getState().connectionStatus).toBe('connected');
  });

  it('typing user management', () => {
    useChatStore.getState().setTypingUser({ userId: 'u1', userName: 'Admin' });
    expect(useChatStore.getState().typingUsers).toHaveLength(1);

    // Duplicate ignored
    useChatStore.getState().setTypingUser({ userId: 'u1', userName: 'Admin' });
    expect(useChatStore.getState().typingUsers).toHaveLength(1);

    useChatStore.getState().removeTypingUser('u1');
    expect(useChatStore.getState().typingUsers).toHaveLength(0);
  });

  it('unread count operations', () => {
    useChatStore.getState().setUnreadCount(5);
    expect(useChatStore.getState().unreadCount).toBe(5);

    useChatStore.getState().incrementUnread();
    expect(useChatStore.getState().unreadCount).toBe(6);
  });

  it('loading and error state', () => {
    useChatStore.getState().setLoading(true);
    expect(useChatStore.getState().isLoading).toBe(true);

    useChatStore.getState().setError('Network error');
    expect(useChatStore.getState().error).toBe('Network error');
  });

  it('reset returns to initial state', () => {
    useChatStore.getState().setActiveRoom(fakeRoom);
    useChatStore.getState().setUnreadCount(10);
    useChatStore.getState().addMessage(makeMessage());
    useChatStore.getState().setConnectionStatus('connected');

    useChatStore.getState().reset();

    const s = useChatStore.getState();
    expect(s.activeRoomId).toBeNull();
    expect(s.unreadCount).toBe(0);
    expect(s.messages).toHaveLength(0);
    expect(s.connectionStatus).toBe('disconnected');
  });
});
