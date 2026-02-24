import React from 'react';
import { View } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  rounded?: boolean;
  className?: string;
}

export function Skeleton({
  width,
  height = 16,
  rounded = false,
  className = '',
}: SkeletonProps) {
  return (
    <View
      className={`bg-gray-200 animate-pulse ${rounded ? 'rounded-full' : 'rounded-lg'} ${className}`}
      style={{ width: width ?? '100%', height }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-3 mb-3 shadow-sm">
      <Skeleton height={160} className="rounded-xl mb-3" />
      <Skeleton height={14} width="70%" className="mb-2" />
      <Skeleton height={12} width="40%" className="mb-2" />
      <Skeleton height={16} width="30%" />
    </View>
  );
}
