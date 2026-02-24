import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    averageRating?: number;
    stock: number;
  };
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-3 mb-3 shadow-sm flex-1 mx-1.5"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Image
        source={{ uri: product.images[0] || 'https://via.placeholder.com/300' }}
        className="w-full h-40 rounded-xl mb-2"
        resizeMode="cover"
      />

      <Text className="text-sm font-medium text-gray-800 mb-1" numberOfLines={2}>
        {product.name}
      </Text>

      {product.averageRating !== undefined && product.averageRating > 0 && (
        <View className="flex-row items-center mb-1">
          <Text className="text-yellow-500 text-xs">
            {'★'.repeat(Math.round(product.averageRating))}
            {'☆'.repeat(5 - Math.round(product.averageRating))}
          </Text>
          <Text className="text-xs text-gray-400 ml-1">
            {product.averageRating.toFixed(1)}
          </Text>
        </View>
      )}

      <View className="flex-row items-center justify-between">
        <Text className="text-brand-500 font-bold text-base">
          Rs. {product.price.toLocaleString()}
        </Text>
        {product.stock < 5 && product.stock > 0 && (
          <Text className="text-xs text-orange-500">Low stock</Text>
        )}
        {product.stock === 0 && (
          <Text className="text-xs text-red-500">Sold out</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
