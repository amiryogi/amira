import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AdminStackParamList } from '@/navigation/AdminStack';
import { useOrders } from '@/hooks/useOrders';
import { OrderCard } from '@/components/OrderCard';
import { EmptyState } from '@/components/EmptyState';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

const STATUS_FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export function AdminOrdersScreen() {
  const navigation = useNavigation<Nav>();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isRefetching } = useOrders({
    page,
    limit: 15,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const orders = data?.orders || data || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-800">Orders</Text>
      </View>

      {/* Status Filter */}
      <FlatList
        data={STATUS_FILTERS as unknown as string[]}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`px-3 py-1.5 rounded-full border ${
              statusFilter === item ? 'bg-brand-500 border-brand-500' : 'bg-white border-gray-200'
            }`}
            onPress={() => { setStatusFilter(item); setPage(1); }}
          >
            <Text className={`text-xs ${statusFilter === item ? 'text-white font-semibold' : 'text-gray-600'}`}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6B4226" />
        </View>
      ) : orders.length === 0 ? (
        <EmptyState title="No orders" message="No orders match the selected filter." />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6B4226" />}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => navigation.navigate('AdminOrderDetail', { id: item._id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
