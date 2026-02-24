import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { AdminStackParamList } from '@/navigation/AdminStack';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/Badge';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function AdminProductsScreen() {
  const navigation = useNavigation<Nav>();
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch, isRefetching } = useProducts({ page, limit: 15 });
  const deleteProduct = useDeleteProduct();

  const products = data?.products || data || [];
  const totalPages = data?.totalPages || 1;

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Product', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteProduct.mutate(id),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-800">Products</Text>
        <TouchableOpacity
          className="bg-brand-500 rounded-full p-2.5"
          onPress={() => navigation.navigate('AdminProductForm', {})}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6B4226" />
        </View>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products"
          message="Start by adding your first product."
          actionTitle="Add Product"
          onAction={() => navigation.navigate('AdminProductForm', {})}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#6B4226" />}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-3 mb-3 flex-row items-center shadow-sm">
              <Image
                source={{ uri: item.images?.[0] || 'https://via.placeholder.com/80' }}
                className="w-16 h-16 rounded-xl"
                resizeMode="cover"
              />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>{item.name}</Text>
                <Text className="text-sm font-bold text-brand-500 mt-0.5">
                  Rs. {item.price?.toLocaleString()}
                </Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <Badge
                    label={`Stock: ${item.stock}`}
                    variant={item.stock === 0 ? 'destructive' : item.stock < 5 ? 'warning' : 'success'}
                  />
                </View>
              </View>
              <View className="flex-col gap-1">
                <TouchableOpacity
                  className="p-2"
                  onPress={() => navigation.navigate('AdminProductForm', { id: item._id })}
                >
                  <Ionicons name="create-outline" size={18} color="#6B4226" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-2"
                  onPress={() => handleDelete(item._id, item.name)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
