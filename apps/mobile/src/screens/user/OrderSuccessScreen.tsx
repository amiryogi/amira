import React from 'react';
import { View, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { UserStackParamList } from '@/navigation/UserStack';
import { Button } from '@/components/Button';

type Route = RouteProp<UserStackParamList, 'OrderSuccess'>;
type Nav = NativeStackNavigationProp<UserStackParamList>;

export function OrderSuccessScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();

  return (
    <View className="flex-1 bg-brand-50 items-center justify-center px-6">
      <View className="bg-green-100 rounded-full p-5 mb-6">
        <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
      </View>

      <Text className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</Text>
      <Text className="text-gray-500 text-center mb-2">
        Your order has been placed successfully.
      </Text>
      <Text className="text-sm text-gray-400 mb-8">
        Order ID: {route.params.orderId.slice(-8).toUpperCase()}
      </Text>

      <Button
        title="View Order"
        onPress={() =>
          navigation.reset({
            index: 1,
            routes: [
              { name: 'UserTabs' },
              { name: 'OrderDetail', params: { id: route.params.orderId } },
            ],
          })
        }
        fullWidth
        className="mb-3"
      />
      <Button
        title="Continue Shopping"
        variant="outline"
        onPress={() =>
          navigation.reset({ index: 0, routes: [{ name: 'UserTabs' }] })
        }
        fullWidth
      />
    </View>
  );
}
