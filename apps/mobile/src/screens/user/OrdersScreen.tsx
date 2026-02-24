import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { UserStackParamList } from '@/navigation/UserStack';
import { useOrders } from '@/hooks/useOrders';
import { OrderCard } from '@/components/OrderCard';
import { EmptyState } from '@/components/EmptyState';

type Nav = NativeStackNavigationProp<UserStackParamList>;

export function OrdersScreen() {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, refetch, isRefetching } = useOrders();
  const orders = data?.orders || data || [];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6B4226" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-800">My Orders</Text>
      </View>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="Your order history will appear here."
          actionTitle="Start Shopping"
          onAction={() => navigation.navigate('Products', {})}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6B4226" />}
          renderItem={({ item }) => (
            <OrderCard order={item} onPress={() => navigation.navigate('OrderDetail', { id: item._id })} />
          )}
        />
      )}
    </SafeAreaView>
  );
}
