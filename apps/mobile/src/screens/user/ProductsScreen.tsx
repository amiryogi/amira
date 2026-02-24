import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { UserStackParamList } from '@/navigation/UserStack';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';

type Route = RouteProp<UserStackParamList, 'Products'>;
type Nav = NativeStackNavigationProp<UserStackParamList>;

export function ProductsScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState(route.params?.search || '');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('-createdAt');

  const { data, isLoading, refetch, isRefetching } = useProducts({
    page,
    limit: 10,
    category: route.params?.category,
    search: search || undefined,
    sort: sortBy,
  });

  const products = data?.products || data || [];
  const totalPages = data?.totalPages || 1;

  const handleProductPress = useCallback(
    (slug: string) => navigation.navigate('ProductDetail', { slug }),
    [navigation],
  );

  const sortOptions = [
    { label: 'Newest', value: '-createdAt' },
    { label: 'Price ↑', value: 'price' },
    { label: 'Price ↓', value: '-price' },
    { label: 'Rating', value: '-averageRating' },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 py-2.5 px-2 text-base text-gray-800"
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={(t) => { setSearch(t); setPage(1); }}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(''); setPage(1); }}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort Pills */}
      <FlatList
        data={sortOptions}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`px-4 py-1.5 rounded-full border ${
              sortBy === item.value
                ? 'bg-brand-500 border-brand-500'
                : 'bg-white border-gray-200'
            }`}
            onPress={() => { setSortBy(item.value); setPage(1); }}
          >
            <Text className={`text-sm ${sortBy === item.value ? 'text-white font-semibold' : 'text-gray-600'}`}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Product Grid */}
      {isLoading ? (
        <View className="flex-row flex-wrap px-4">
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="w-1/2 px-1.5">
              <ProductCardSkeleton />
            </View>
          ))}
        </View>
      ) : products.length === 0 ? (
        <EmptyState title="No products found" message="Try a different search or category." />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6B4226" />}
          renderItem={({ item }) => (
            <View className="w-1/2">
              <ProductCard product={item} onPress={() => handleProductPress(item.slug)} />
            </View>
          )}
          ListFooterComponent={
            totalPages > 1 ? (
              <View className="flex-row items-center justify-center gap-4 py-4">
                <TouchableOpacity
                  disabled={page === 1}
                  onPress={() => setPage((p) => p - 1)}
                  className={`px-4 py-2 rounded-xl ${page === 1 ? 'bg-gray-200' : 'bg-brand-500'}`}
                >
                  <Text className={page === 1 ? 'text-gray-400' : 'text-white'}>Prev</Text>
                </TouchableOpacity>
                <Text className="text-gray-600">{page} / {totalPages}</Text>
                <TouchableOpacity
                  disabled={page === totalPages}
                  onPress={() => setPage((p) => p + 1)}
                  className={`px-4 py-2 rounded-xl ${page === totalPages ? 'bg-gray-200' : 'bg-brand-500'}`}
                >
                  <Text className={page === totalPages ? 'text-gray-400' : 'text-white'}>Next</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
