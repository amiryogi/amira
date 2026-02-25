import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { UserStackParamList } from '@/navigation/UserStack';
import { useCategories } from '@/hooks/useCategories';
import { EmptyState } from '@/components/EmptyState';

type Nav = NativeStackNavigationProp<UserStackParamList>;

export function CategoriesScreen() {
  const navigation = useNavigation<Nav>();
  const { data, isLoading, refetch, isRefetching } = useCategories();
  const categories = data?.categories || data || [];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-50">
        <ActivityIndicator size="large" color="#6B4226" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-50" edges={['top']}>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-800">Categories</Text>
      </View>

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" message="Check back later for product categories." />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          columnWrapperStyle={{ gap: 12 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6B4226" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-1 bg-white rounded-2xl p-5 mb-3 items-center shadow-sm"
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Products', { categoryId: item._id })}
            >
              <View className="bg-brand-100 rounded-full p-3 mb-3">
                <Ionicons name="grid-outline" size={28} color="#6B4226" />
              </View>
              <Text className="text-sm font-semibold text-gray-800 text-center">{item.name}</Text>
              {item.description && (
                <Text className="text-xs text-gray-400 mt-1 text-center" numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}
