import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConnectionBannerProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  onRetry?: () => void;
}

export function ConnectionBanner({ status, onRetry }: ConnectionBannerProps) {
  if (status === 'connected') return null;

  const configs = {
    connecting: {
      bg: 'bg-yellow-500',
      text: 'Connecting...',
      icon: 'reload-outline' as const,
    },
    disconnected: {
      bg: 'bg-red-500',
      text: 'Connection lost',
      icon: 'cloud-offline-outline' as const,
    },
    error: {
      bg: 'bg-red-600',
      text: 'Connection error',
      icon: 'alert-circle-outline' as const,
    },
  };

  const config = configs[status];

  return (
    <View className={`${config.bg} flex-row items-center justify-center py-1.5 px-4`}>
      <Ionicons name={config.icon} size={14} color="white" />
      <Text className="text-xs text-white font-medium ml-1.5">{config.text}</Text>
      {status !== 'connecting' && onRetry && (
        <TouchableOpacity onPress={onRetry} className="ml-3">
          <Text className="text-xs text-white font-bold underline">Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
