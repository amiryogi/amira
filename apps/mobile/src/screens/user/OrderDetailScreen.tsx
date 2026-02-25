import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { UserStackParamList } from '@/navigation/UserStack';
import { useOrder } from '@/hooks/useOrders';
import { Badge } from '@/components/Badge';

type Route = RouteProp<UserStackParamList, 'OrderDetail'>;

const statusVariant = {
  PENDING: 'warning' as const,
  CONFIRMED: 'info' as const,
  PROCESSING: 'info' as const,
  SHIPPED: 'info' as const,
  DELIVERED: 'success' as const,
  CANCELLED: 'destructive' as const,
  PAID: 'success' as const,
  FAILED: 'destructive' as const,
  REFUNDED: 'warning' as const,
};

export function OrderDetailScreen() {
  const route = useRoute<Route>();
  const { data, isLoading } = useOrder(route.params.id);
  const order = data?.order || data;

  if (isLoading || !order) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6B4226" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 20 }}>
      {/* Order Info */}
      <View className="bg-white rounded-2xl p-4 mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-bold text-gray-800">
            #{order.orderNumber || order._id.slice(-8).toUpperCase()}
          </Text>
          <Text className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View className="flex-row gap-2 mb-3">
          <Badge label={order.orderStatus} variant={statusVariant[order.orderStatus as keyof typeof statusVariant] || 'default'} />
          <Badge label={order.paymentStatus} variant={statusVariant[order.paymentStatus as keyof typeof statusVariant] || 'default'} />
        </View>
        <Text className="text-sm text-gray-500">
          Payment: {order.paymentMethod}
        </Text>
      </View>

      {/* Items */}
      <View className="bg-white rounded-2xl p-4 mb-4">
        <Text className="font-semibold text-gray-800 mb-3">Items</Text>
        {order.products?.map((item: { product: string; name: string; price: number; quantity: number; image?: string }, i: number) => (
          <View key={i} className="flex-row items-center mb-3">
            {item.image && (
              <Image
                source={{ uri: item.image }}
                className="w-14 h-14 rounded-xl mr-3"
                resizeMode="cover"
              />
            )}
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>{item.name}</Text>
              <Text className="text-xs text-gray-400">Qty: {item.quantity}</Text>
            </View>
            <Text className="text-sm font-semibold text-gray-800">
              Rs. {(item.price * item.quantity).toLocaleString()}
            </Text>
          </View>
        ))}
        <View className="border-t border-gray-100 pt-3 flex-row justify-between">
          <Text className="font-semibold text-gray-800">Total</Text>
          <Text className="font-bold text-brand-500 text-lg">
            Rs. {order.totalAmount?.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Shipping Address */}
      {order.deliveryAddress && (
        <View className="bg-white rounded-2xl p-4">
          <Text className="font-semibold text-gray-800 mb-2">Shipping Address</Text>
          <Text className="text-sm text-gray-600">
            {order.deliveryAddress.fullName}
          </Text>
          <Text className="text-sm text-gray-500">
            {order.deliveryAddress.street}, {order.deliveryAddress.city}
          </Text>
          <Text className="text-sm text-gray-500">
            {order.deliveryAddress.district && `${order.deliveryAddress.district}, `}{order.deliveryAddress.province} {order.deliveryAddress.postalCode}
          </Text>
          <Text className="text-sm text-gray-400 mt-1">
            {order.deliveryAddress.phone}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
