import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { IChatRoomPopulated } from '@amira/shared';

interface ChatRoomCardProps {
  room: IChatRoomPopulated;
  onPress: () => void;
}

function formatRelativeTime(date: string | Date | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d`;
}

export function ChatRoomCard({ room, onPress }: ChatRoomCardProps) {
  const customer = room.customerId;
  const hasUnread = room.unreadCountAdmin > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center p-4 border-b border-gray-100 ${
        hasUnread ? 'bg-blue-50/40' : 'bg-white'
      }`}
      activeOpacity={0.7}
    >
      <View className="w-11 h-11 rounded-full bg-brand-100 items-center justify-center mr-3">
        <Text className="text-base font-semibold text-brand-600">
          {customer?.name?.charAt(0)?.toUpperCase() || '?'}
        </Text>
      </View>

      <View className="flex-1 mr-2">
        <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>
          {customer?.name || 'Unknown Customer'}
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
          {customer?.email || ''}
        </Text>
      </View>

      <View className="items-end gap-1">
        <Text className="text-[10px] text-gray-400">
          {formatRelativeTime(room.lastMessageAt)}
        </Text>
        {hasUnread && (
          <View className="bg-brand-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
            <Text className="text-[10px] font-bold text-white">
              {room.unreadCountAdmin}
            </Text>
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );
}
