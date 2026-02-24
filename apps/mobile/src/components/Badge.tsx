import React from 'react';
import { View, Text } from 'react-native';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  destructive: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const [bgText] = [variantStyles[variant]];
  return (
    <View className={`px-2.5 py-1 rounded-full self-start ${bgText}`}>
      <Text className={`text-xs font-medium ${bgText.split(' ')[1]}`}>{label}</Text>
    </View>
  );
}
