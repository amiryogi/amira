import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { UserStackParamList } from '@/navigation/UserStack';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/Skeleton';

type Nav = NativeStackNavigationProp<UserStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { data: productsData, isLoading, refetch, isRefetching } = useProducts({ limit: 6, sort: '-createdAt' });
  const { data: categoriesData } = useCategories();

  const products = productsData?.products || productsData || [];
  const categories = categoriesData?.categories || categoriesData || [];

  const handleProductPress = useCallback(
    (slug: string) => navigation.navigate('ProductDetail', { slug }),
    [navigation],
  );

  return (
    <SafeAreaView className="flex-1 bg-brand-50" edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6B4226" />}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-brand-500">Amira</Text>
            <Text className="text-sm text-gray-500">Nepal Woolen Store</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Products', { search: '' })}
            className="bg-white p-2.5 rounded-full shadow-sm"
          >
            <Ionicons name="search-outline" size={22} color="#6B4226" />
          </TouchableOpacity>
        </View>

        {/* Hero Banner */}
        <View className="mx-5 mb-5 bg-brand-500 rounded-3xl p-6 overflow-hidden">
          <Text className="text-white text-xl font-bold mb-1">Handcrafted Woolen</Text>
          <Text className="text-white text-xl font-bold mb-2">From the Himalayas</Text>
          <Text className="text-brand-100 text-sm mb-4">
            Premium Nepali wool, crafted with tradition
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Products', {})}
            className="bg-white rounded-xl py-2.5 px-5 self-start"
          >
            <Text className="text-brand-500 font-semibold">Shop Now</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        {categories.length > 0 && (
          <View className="mb-5">
            <View className="flex-row items-center justify-between px-5 mb-3">
              <Text className="text-lg font-bold text-gray-800">Categories</Text>
            </View>
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="mr-3 bg-white rounded-2xl p-4 items-center w-24 shadow-sm"
                  onPress={() => navigation.navigate('Products', { category: item.slug })}
                >
                  <Ionicons name="grid-outline" size={24} color="#6B4226" />
                  <Text className="text-xs text-gray-700 mt-2 text-center" numberOfLines={1}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Featured Products */}
        <View className="px-5 mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-800">Featured Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products', {})}>
              <Text className="text-brand-500 text-sm font-medium">See all</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="flex-row flex-wrap -mx-1.5">
              {[1, 2, 3, 4].map((i) => (
                <View key={i} className="w-1/2 px-1.5">
                  <ProductCardSkeleton />
                </View>
              ))}
            </View>
          ) : (
            <FlatList
              data={products.slice(0, 6)}
              numColumns={2}
              scrollEnabled={false}
              keyExtractor={(item) => item._id}
              columnWrapperStyle={{ marginHorizontal: -6 }}
              renderItem={({ item }) => (
                <View className="w-1/2">
                  <ProductCard product={item} onPress={() => handleProductPress(item.slug)} />
                </View>
              )}
            />
          )}
        </View>

        {/* Brand Story */}
        <View className="mx-5 mb-8 bg-white rounded-3xl p-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-2">Our Story</Text>
          <Text className="text-sm text-gray-600 leading-5">
            Amira brings authentic Nepali woolen craftsmanship to your doorstep.
            Each product is handmade by skilled artisans in the Himalayan region,
            preserving centuries-old traditions while supporting local communities.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
