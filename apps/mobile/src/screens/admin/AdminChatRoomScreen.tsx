import React, { useRef, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SenderRole, CHAT_EVENTS } from '@amira/shared';
import type { IChatMessage } from '@amira/shared';
import type { AdminStackParamList } from '@/navigation/AdminStack';
import { useChat } from '@/hooks/useChat';
import { socketService } from '@/services/socket';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ConnectionBanner } from '@/components/chat/ConnectionBanner';

type Nav = NativeStackNavigationProp<AdminStackParamList, 'AdminChatRoom'>;
type RouteParams = RouteProp<AdminStackParamList, 'AdminChatRoom'>;

export function AdminChatRoomScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteParams>();
  const { roomId, customerName } = route.params;
  const headerHeight = useHeaderHeight();
  const flatListRef = useRef<FlatList<IChatMessage>>(null);

  const {
    messages,
    connectionStatus,
    typingUsers,
    hasMoreMessages,
    isLoading,
    error,
    sendMessage,
    startTyping,
    loadMore,
  } = useChat({ roomId });

  // Add Close Chat button to header
  useLayoutEffect(() => {
    navigation.setOptions({
      title: customerName || 'Chat',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Close Chat', 'Are you sure you want to close this chat?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Close',
                style: 'destructive',
                onPress: () => {
                  const socket = socketService.getSocket();
                  if (socket?.connected) {
                    socket.emit(CHAT_EVENTS.CLOSE_CHAT, { roomId });
                  }
                  navigation.goBack();
                },
              },
            ]);
          }}
          className="mr-2"
        >
          <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, roomId, customerName]);

  const renderMessage = useCallback(
    ({ item }: { item: IChatMessage }) => {
      const isOwn = item.senderRole === SenderRole.ADMIN;
      return <MessageBubble message={item} isOwn={isOwn} />;
    },
    [],
  );

  const keyExtractor = useCallback((item: IChatMessage) => item._id, []);

  const handleLoadMore = useCallback(() => {
    if (hasMoreMessages && !isLoading) {
      loadMore();
    }
  }, [hasMoreMessages, isLoading, loadMore]);

  if (isLoading && messages.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center" edges={['bottom']}>
        <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
        <Text className="text-sm text-gray-400 mt-3">Loading chat...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={headerHeight}
      >
        <ConnectionBanner status={connectionStatus} />

        {error && (
          <View className="bg-red-50 px-4 py-1.5">
            <Text className="text-xs text-red-600">{error}</Text>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Text className="text-sm text-gray-400">No messages yet</Text>
            </View>
          }
          ListHeaderComponent={
            hasMoreMessages ? (
              <View className="items-center py-2">
                <Text className="text-xs text-brand-500">Loading older messages...</Text>
              </View>
            ) : null
          }
        />

        <TypingIndicator typingUsers={typingUsers} />

        <MessageInput
          onSend={sendMessage}
          onTyping={startTyping}
          disabled={connectionStatus !== 'connected'}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
