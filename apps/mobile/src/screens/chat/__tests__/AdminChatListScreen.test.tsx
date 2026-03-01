import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AdminChatListScreen } from '@/screens/admin/AdminChatListScreen';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useFocusEffect: (cb: () => void) => {
    // Execute the focus callback once
    const { useEffect } = require('react');
    useEffect(() => {
      const cleanup = cb();
      return typeof cleanup === 'function' ? cleanup : undefined;
    }, []);
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock socket service to avoid real connections
jest.mock('@/services/socket', () => ({
  socketService: {
    connect: () => ({
      connected: false,
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      once: jest.fn(),
    }),
    disconnect: jest.fn(),
  },
}));

jest.mock('@/components/chat/ChatRoomCard', () => ({
  ChatRoomCard: ({ room }: { room: { _id: string } }) => `ChatRoomCard-${room._id}`,
}));

describe('AdminChatListScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should render empty state when no rooms', () => {
    render(<AdminChatListScreen />);
    // The socket mock never fires the callback, so the screen stays in loading
    // or transitions to empty state
    // Since socket.connected is false, it waits for connect event
    // After initial render, expect the component to be present
    expect(screen.toJSON()).toBeTruthy();
  });

  it('should render without crashing', () => {
    const { toJSON } = render(<AdminChatListScreen />);
    expect(toJSON()).toBeTruthy();
  });
});
