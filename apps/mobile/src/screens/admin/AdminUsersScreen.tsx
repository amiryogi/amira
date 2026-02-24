import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';

export function AdminUsersScreen() {
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin-users', { page, role: roleFilter }],
    queryFn: () =>
      userService.list({
        page,
        limit: 15,
        role: roleFilter || undefined,
      }),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      userService.updateRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const users = data?.users || data || [];

  const handleChangeRole = (id: string, currentRole: string, name: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    Alert.alert(
      'Change Role',
      `Change ${name}'s role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: () => updateRole.mutate({ id, role: newRole }),
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-800">Users</Text>
      </View>

      {/* Role Filter */}
      <FlatList
        data={['', 'USER', 'ADMIN']}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}
        keyExtractor={(item) => item || 'ALL'}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`px-4 py-1.5 rounded-full border ${
              roleFilter === item ? 'bg-brand-500 border-brand-500' : 'bg-white border-gray-200'
            }`}
            onPress={() => { setRoleFilter(item); setPage(1); }}
          >
            <Text className={`text-xs ${roleFilter === item ? 'text-white font-semibold' : 'text-gray-600'}`}>
              {item || 'ALL'}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6B4226" />
        </View>
      ) : users.length === 0 ? (
        <EmptyState title="No users" message="No users match the filter." />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6B4226" />}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-brand-100 items-center justify-center mr-3">
                <Text className="text-brand-500 font-bold">
                  {item.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-800">{item.name}</Text>
                <Text className="text-xs text-gray-400">{item.email}</Text>
                <Badge
                  label={item.role}
                  variant={item.role === 'ADMIN' ? 'info' : 'default'}
                />
              </View>
              <TouchableOpacity
                className="p-2"
                onPress={() => handleChangeRole(item._id, item.role, item.name)}
              >
                <Ionicons name="swap-horizontal-outline" size={20} color="#6B4226" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
