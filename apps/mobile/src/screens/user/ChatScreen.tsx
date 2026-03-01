import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';
import { SenderRole } from '@amira/shared';
import type { IChatMessage } from '@amira/shared';
import { useChat } from '@/hooks/useChat';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ConnectionBanner } from '@/components/chat/ConnectionBanner';
import { Button } from '@/components/Button';

export function ChatScreen() {
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
  } = useChat();

  const renderMessage = useCallback(
    ({ item }: { item: IChatMessage }) => {
      const isOwn = item.senderRole === SenderRole.CUSTOMER;
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

  if (error && messages.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6" edges={['bottom']}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="text-sm text-gray-600 mt-3 text-center">{error}</Text>
        <Button title="Try Again" variant="outline" size="sm" />
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

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          inverted={false}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
              <Text className="text-sm text-gray-400 mt-3">
                Send a message to start chatting
              </Text>
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
