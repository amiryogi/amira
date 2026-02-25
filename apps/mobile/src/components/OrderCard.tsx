import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Badge } from './Badge';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'info'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  PAID: 'success',
  FAILED: 'destructive',
  REFUNDED: 'warning',
};

interface OrderCardProps {
  order: {
    _id: string;
    orderNumber?: string;
    totalAmount: number;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
    products: Array<{ name: string }>;
  };
  onPress: () => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-semibold text-gray-800">
          #{order.orderNumber || order._id.slice(-8).toUpperCase()}
        </Text>
        <Text className="text-xs text-gray-400">
          {new Date(order.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <Text className="text-xs text-gray-500 mb-2" numberOfLines={1}>
        {order.products.map((i) => i.name).join(', ')}
      </Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-brand-500 font-bold">
          Rs. {order.totalAmount.toLocaleString()}
        </Text>
        <View className="flex-row gap-1.5">
          <Badge label={order.orderStatus} variant={statusVariant[order.orderStatus] || 'default'} />
          <Badge label={order.paymentStatus} variant={statusVariant[order.paymentStatus] || 'default'} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
