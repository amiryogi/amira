import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  message,
  actionTitle,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-6">
      <Text className="text-xl font-bold text-gray-800 mb-2 text-center">{title}</Text>
      {message && (
        <Text className="text-gray-500 text-center mb-6">{message}</Text>
      )}
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} size="sm" />
      )}
    </View>
  );
}
