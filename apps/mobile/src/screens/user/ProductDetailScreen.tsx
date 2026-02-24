import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { UserStackParamList } from '@/navigation/UserStack';
import { useProduct } from '@/hooks/useProducts';
import { useProductReviews } from '@/hooks/useReviews';
import { useCartStore } from '@/store/cart.store';
import { Button } from '@/components/Button';

type Route = RouteProp<UserStackParamList, 'ProductDetail'>;
const { width } = Dimensions.get('window');

export function ProductDetailScreen() {
  const route = useRoute<Route>();
  const { data, isLoading } = useProduct(route.params.slug);
  const product = data?.product || data;
  const { data: reviewsData } = useProductReviews(product?._id || '');
  const reviews = reviewsData?.reviews || reviewsData || [];
  const { addItem } = useCartStore();
  const [activeImage, setActiveImage] = useState(0);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    if (product.stock === 0) {
      Alert.alert('Out of Stock', 'This product is currently unavailable.');
      return;
    }
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      stock: product.stock,
    });
    Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
  }, [product, addItem]);

  if (isLoading || !product) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6B4226" />
      </View>
    );
  }

  const images = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/400'];

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Image Carousel */}
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) =>
          setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width))
        }
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={{ width, height: width }} resizeMode="cover" />
        )}
      />
      {/* Image Dots */}
      {images.length > 1 && (
        <View className="flex-row items-center justify-center py-3 gap-1.5">
          {images.map((_, i) => (
            <View
              key={i}
              className={`rounded-full ${i === activeImage ? 'w-6 h-2 bg-brand-500' : 'w-2 h-2 bg-gray-300'}`}
            />
          ))}
        </View>
      )}

      <View className="px-5 pb-8">
        {/* Title & Price */}
        <Text className="text-2xl font-bold text-gray-800 mt-3">{product.name}</Text>

        <View className="flex-row items-center mt-2">
          {product.averageRating > 0 && (
            <View className="flex-row items-center mr-3">
              <Text className="text-yellow-500">
                {'★'.repeat(Math.round(product.averageRating))}
                {'☆'.repeat(5 - Math.round(product.averageRating))}
              </Text>
              <Text className="text-sm text-gray-500 ml-1">
                ({product.reviewCount || 0})
              </Text>
            </View>
          )}
          {product.stock > 0 ? (
            <Text className="text-sm text-green-600">
              {product.stock < 5 ? `Only ${product.stock} left` : 'In Stock'}
            </Text>
          ) : (
            <Text className="text-sm text-red-500">Out of Stock</Text>
          )}
        </View>

        <Text className="text-3xl font-bold text-brand-500 mt-3">
          Rs. {product.price.toLocaleString()}
        </Text>

        {/* Description */}
        {product.description && (
          <View className="mt-5">
            <Text className="text-base font-semibold text-gray-800 mb-2">Description</Text>
            <Text className="text-sm text-gray-600 leading-5">{product.description}</Text>
          </View>
        )}

        {/* Add to Cart */}
        <Button
          title={product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
          fullWidth
          size="lg"
          className="mt-6"
        />

        {/* Reviews */}
        {reviews.length > 0 && (
          <View className="mt-8">
            <Text className="text-base font-semibold text-gray-800 mb-3">
              Reviews ({reviews.length})
            </Text>
            {reviews.slice(0, 5).map((review: { _id: string; user?: { name: string }; rating: number; comment?: string; createdAt: string }) => (
              <View key={review._id} className="bg-gray-50 rounded-2xl p-4 mb-2">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-sm font-medium text-gray-700">
                    {review.user?.name || 'Customer'}
                  </Text>
                  <Text className="text-yellow-500 text-sm">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </Text>
                </View>
                {review.comment && (
                  <Text className="text-sm text-gray-600">{review.comment}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
