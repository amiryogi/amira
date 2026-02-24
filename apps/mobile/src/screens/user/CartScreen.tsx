import React, { useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { UserStackParamList } from '@/navigation/UserStack';
import { useCartStore } from '@/store/cart.store';
import { CartItemCard } from '@/components/CartItemCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';

type Nav = NativeStackNavigationProp<UserStackParamList>;

export function CartScreen() {
  const navigation = useNavigation<Nav>();
  const { items, loadCart, isLoaded, updateQuantity, removeItem, getTotal } = useCartStore();

  useEffect(() => {
    if (!isLoaded) loadCart();
  }, [isLoaded, loadCart]);

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-brand-50" edges={['top']}>
        <View className="px-5 pt-4 pb-3">
          <Text className="text-2xl font-bold text-gray-800">Cart</Text>
        </View>
        <EmptyState
          title="Your cart is empty"
          message="Browse our beautiful woolen collection"
          actionTitle="Shop Now"
          onAction={() => navigation.navigate('Products', {})}
        />
      </SafeAreaView>
    );
  }

  const total = getTotal();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-gray-800">Cart ({items.length})</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
        renderItem={({ item }) => (
          <CartItemCard
            item={item}
            onIncrement={() => updateQuantity(item.productId, item.quantity + 1)}
            onDecrement={() => updateQuantity(item.productId, item.quantity - 1)}
            onRemove={() => removeItem(item.productId)}
          />
        )}
      />

      {/* Bottom bar */}
      <View className="bg-white border-t border-gray-100 px-5 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-base text-gray-600">Total</Text>
          <Text className="text-xl font-bold text-brand-500">
            Rs. {total.toLocaleString()}
          </Text>
        </View>
        <Button
          title="Proceed to Checkout"
          onPress={() => navigation.navigate('Checkout')}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
