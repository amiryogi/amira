import React from 'react';
import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { IChatMessage } from '@amira/shared';

interface MessageBubbleProps {
  message: IChatMessage;
  isOwn: boolean;
}

function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'read') {
    return <Ionicons name="checkmark-done" size={14} color="#3B82F6" />;
  }
  if (status === 'delivered') {
    return <Ionicons name="checkmark-done" size={14} color="#9CA3AF" />;
  }
  return <Ionicons name="checkmark" size={14} color="#9CA3AF" />;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <View className={`mb-2 ${isOwn ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isOwn ? 'bg-brand-500 rounded-br-sm' : 'bg-gray-100 rounded-bl-sm'
        }`}
      >
        {message.attachments?.map((att, i) => (
          <Image
            key={i}
            source={{ uri: att.url }}
            className="w-52 h-40 rounded-lg mb-1"
            resizeMode="cover"
          />
        ))}
        {message.content ? (
          <Text
            className={`text-[15px] leading-5 ${
              isOwn ? 'text-white' : 'text-gray-800'
            }`}
          >
            {message.content}
          </Text>
        ) : null}
        <View className="flex-row items-center justify-end mt-1 gap-1">
          <Text
            className={`text-[10px] ${
              isOwn ? 'text-white/70' : 'text-gray-400'
            }`}
          >
            {formatTime(message.createdAt)}
          </Text>
          {isOwn && <StatusIcon status={message.status} />}
        </View>
      </View>
    </View>
  );
}
