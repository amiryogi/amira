import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CartItemCardProps {
  item: {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    stock: number;
  };
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export function CartItemCard({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: CartItemCardProps) {
  return (
    <View className="flex-row bg-white rounded-2xl p-3 mb-3 shadow-sm">
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/100' }}
        className="w-20 h-20 rounded-xl"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3 justify-between">
        <View>
          <Text className="text-sm font-medium text-gray-800" numberOfLines={2}>
            {item.name}
          </Text>
          <Text className="text-brand-500 font-bold mt-1">
            Rs. {item.price.toLocaleString()}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center bg-gray-100 rounded-xl">
            <TouchableOpacity
              onPress={onDecrement}
              className="px-3 py-1.5"
              disabled={item.quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={16}
                color={item.quantity <= 1 ? '#D1D5DB' : '#374151'}
              />
            </TouchableOpacity>
            <Text className="text-base font-semibold text-gray-800 mx-2">
              {item.quantity}
            </Text>
            <TouchableOpacity
              onPress={onIncrement}
              className="px-3 py-1.5"
              disabled={item.quantity >= item.stock}
            >
              <Ionicons
                name="add"
                size={16}
                color={item.quantity >= item.stock ? '#D1D5DB' : '#374151'}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onRemove} className="p-2">
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
