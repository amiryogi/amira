import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/services/payment.service';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

const statusVariant = {
  PENDING: 'warning' as const,
  PAID: 'success' as const,
  COMPLETED: 'success' as const,
  FAILED: 'destructive' as const,
  REFUNDED: 'warning' as const,
};

export function AdminPaymentsScreen() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-payments', { page, status: statusFilter, search }],
    queryFn: () =>
      paymentService.list({
        page,
        limit: 15,
        status: statusFilter || undefined,
        search: search || undefined,
      }),
  });

  const payments = data?.payments || data || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-800">Payments</Text>
      </View>

      {/* Search */}
      <View className="px-5 mb-2">
        <View className="flex-row items-center bg-white rounded-xl px-3 border border-gray-200">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 py-2.5 px-2 text-sm text-gray-800"
            placeholder="Search transaction ID..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={(t) => { setSearch(t); setPage(1); }}
          />
        </View>
      </View>

      {/* Filter */}
      <FlatList
        data={['', 'PENDING', 'PAID', 'FAILED']}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 6, gap: 8 }}
        keyExtractor={(item) => item || 'ALL'}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`px-3 py-1.5 rounded-full border ${
              statusFilter === item ? 'bg-brand-500 border-brand-500' : 'bg-white border-gray-200'
            }`}
            onPress={() => { setStatusFilter(item); setPage(1); }}
          >
            <Text className={`text-xs ${statusFilter === item ? 'text-white font-semibold' : 'text-gray-600'}`}>
              {item || 'ALL'}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6B4226" />
        </View>
      ) : payments.length === 0 ? (
        <EmptyState title="No payments" message="No payment records found." />
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6B4226" />}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm font-semibold text-gray-800">
                  {item.transactionId || item._id.slice(-8).toUpperCase()}
                </Text>
                <Badge
                  label={item.status}
                  variant={statusVariant[item.status as keyof typeof statusVariant] || 'default'}
                />
              </View>
              <Text className="text-xs text-gray-400 mb-1">
                {item.method || item.paymentMethod} · {new Date(item.createdAt).toLocaleString()}
              </Text>
              <Text className="text-sm font-bold text-brand-500">
                Rs. {item.amount?.toLocaleString()}
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
