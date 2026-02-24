import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService } from '@/services/analytics.service';
import { useAuthStore } from '@/store/auth.store';

export function AdminDashboardScreen() {
  const { user } = useAuthStore();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => analyticsService.getDashboard(),
  });

  const stats = data?.summary || data || {};

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-50">
        <ActivityIndicator size="large" color="#6B4226" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-50" edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6B4226" />}
        contentContainerStyle={{ padding: 20 }}
      >
        <Text className="text-sm text-gray-500">Welcome back,</Text>
        <Text className="text-2xl font-bold text-gray-800 mb-6">{user?.name || 'Admin'}</Text>

        {/* Stat Cards */}
        <View className="flex-row flex-wrap -mx-1.5 mb-4">
          <StatCard icon="cash-outline" label="Revenue" value={`Rs. ${(stats.totalRevenue || 0).toLocaleString()}`} color="#22C55E" />
          <StatCard icon="receipt-outline" label="Orders" value={String(stats.totalOrders || 0)} color="#3B82F6" />
          <StatCard icon="cube-outline" label="Products" value={String(stats.totalProducts || 0)} color="#8B5CF6" />
          <StatCard icon="people-outline" label="Users" value={String(stats.totalUsers || 0)} color="#F59E0B" />
        </View>

        {/* Recent orders */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="font-semibold text-gray-800 mb-3">Quick Stats</Text>
          <InfoRow label="Orders Today" value={String(stats.ordersToday || 0)} />
          <InfoRow label="Pending Orders" value={String(stats.pendingOrders || 0)} />
          <InfoRow label="Failed Payments" value={String(stats.failedPayments || 0)} />
          <InfoRow label="Low Stock Products" value={String(stats.lowStockProducts || 0)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View className="w-1/2 px-1.5 mb-3">
      <View className="bg-white rounded-2xl p-4 shadow-sm">
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={24} color={color} />
        <Text className="text-2xl font-bold text-gray-800 mt-2">{value}</Text>
        <Text className="text-xs text-gray-400 mt-0.5">{label}</Text>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-2 border-b border-gray-50">
      <Text className="text-sm text-gray-600">{label}</Text>
      <Text className="text-sm font-semibold text-gray-800">{value}</Text>
    </View>
  );
}
