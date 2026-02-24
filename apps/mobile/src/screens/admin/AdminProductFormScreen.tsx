import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { AdminStackParamList } from '@/navigation/AdminStack';
import { useProduct, useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

type Route = RouteProp<AdminStackParamList, 'AdminProductForm'>;

export function AdminProductFormScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const editId = route.params?.id;

  const { data: productData, isLoading: loadingProduct } = useProduct(editId || '');
  const { data: categoriesData } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const product = productData?.product || productData;
  const categories = categoriesData?.categories || categoriesData || [];

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  useEffect(() => {
    if (product && editId) {
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(String(product.price || ''));
      setStock(String(product.stock || ''));
      setCategory(product.category?._id || product.category || '');
      setImages(product.images || []);
    }
  }, [product, editId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setNewImages((prev) => [...prev, ...result.assets]);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !price || !stock || !category) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('description', description.trim());
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('category', category);

    newImages.forEach((img) => {
      const uri = img.uri;
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('images', { uri, name: filename, type } as unknown as Blob);
    });

    try {
      if (editId) {
        await updateProduct.mutateAsync({ id: editId, formData });
        Alert.alert('Success', 'Product updated.');
      } else {
        await createProduct.mutateAsync(formData);
        Alert.alert('Success', 'Product created.');
      }
      navigation.goBack();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert('Error', err.response?.data?.message || 'Failed to save product.');
    }
  };

  if (editId && loadingProduct) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6B4226" />
      </View>
    );
  }

  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Input label="Product Name *" value={name} onChangeText={setName} placeholder="e.g., Himalayan Shawl" />
        <Input label="Description" value={description} onChangeText={setDescription} placeholder="Product description" multiline numberOfLines={4} className="h-24" />
        <Input label="Price (Rs.) *" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="0" />
        <Input label="Stock *" value={stock} onChangeText={setStock} keyboardType="numeric" placeholder="0" />

        {/* Category Picker */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {categories.map((cat: { _id: string; name: string }) => (
              <TouchableOpacity
                key={cat._id}
                className={`mr-2 px-4 py-2 rounded-xl border ${
                  category === cat._id ? 'bg-brand-500 border-brand-500' : 'bg-white border-gray-200'
                }`}
                onPress={() => setCategory(cat._id)}
              >
                <Text className={`text-sm ${category === cat._id ? 'text-white font-semibold' : 'text-gray-600'}`}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Images */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {/* Existing images */}
            {images.map((uri, i) => (
              <View key={`existing-${i}`} className="mr-2 relative">
                <Image source={{ uri }} className="w-20 h-20 rounded-xl" resizeMode="cover" />
              </View>
            ))}
            {/* New images */}
            {newImages.map((img, i) => (
              <View key={`new-${i}`} className="mr-2 relative">
                <Image source={{ uri: img.uri }} className="w-20 h-20 rounded-xl" resizeMode="cover" />
                <TouchableOpacity
                  className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center"
                  onPress={() => setNewImages((prev) => prev.filter((_, j) => j !== i))}
                >
                  <Ionicons name="close" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center"
              onPress={pickImage}
            >
              <Ionicons name="camera-outline" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        <Button
          title={editId ? 'Update Product' : 'Create Product'}
          onPress={handleSubmit}
          isLoading={isSubmitting}
          fullWidth
          size="lg"
          className="mt-4"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
