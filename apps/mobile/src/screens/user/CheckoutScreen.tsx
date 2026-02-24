import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { UserStackParamList } from '@/navigation/UserStack';
import { useCartStore } from '@/store/cart.store';
import { useAddresses } from '@/hooks/useAddresses';
import { useCreateOrder } from '@/hooks/useOrders';
import { paymentService } from '@/services/payment.service';
import { Button } from '@/components/Button';

type Nav = NativeStackNavigationProp<UserStackParamList>;
type PaymentMethod = 'COD' | 'ESEWA';

export function CheckoutScreen() {
  const navigation = useNavigation<Nav>();
  const { items, getTotal, clearCart } = useCartStore();
  const { data: addressesData, isLoading: loadingAddresses } = useAddresses();
  const createOrder = useCreateOrder();

  const addresses = addressesData?.addresses || addressesData || [];
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [submitting, setSubmitting] = useState(false);

  // Auto-select default address
  React.useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find((a: { isDefault?: boolean }) => a.isDefault);
      setSelectedAddress(defaultAddr?._id || addresses[0]._id);
    }
  }, [addresses, selectedAddress]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address.');
      return;
    }
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({ product: i.productId, quantity: i.quantity })),
        shippingAddress: selectedAddress,
        paymentMethod,
      };
      const order = await createOrder.mutateAsync(orderPayload);

      if (paymentMethod === 'ESEWA') {
        const esewaData = await paymentService.createEsewa(order._id);
        navigation.navigate('EsewaWebView', {
          paymentUrl: esewaData.paymentUrl,
          orderId: order._id,
        });
      } else {
        clearCart();
        navigation.navigate('OrderSuccess', { orderId: order._id });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert('Order Failed', err.response?.data?.message || 'Could not place order');
    } finally {
      setSubmitting(false);
    }
  };

  const total = getTotal();

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Address Selection */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-gray-800">Delivery Address</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Addresses')}>
              <Text className="text-sm text-brand-500 font-medium">Manage</Text>
            </TouchableOpacity>
          </View>

          {loadingAddresses ? (
            <ActivityIndicator color="#6B4226" />
          ) : addresses.length === 0 ? (
            <TouchableOpacity
              className="border border-dashed border-gray-300 rounded-2xl p-4 items-center"
              onPress={() => navigation.navigate('Addresses')}
            >
              <Ionicons name="add-circle-outline" size={24} color="#6B4226" />
              <Text className="text-sm text-gray-500 mt-1">Add an address</Text>
            </TouchableOpacity>
          ) : (
            addresses.map((addr: { _id: string; fullName: string; street: string; city: string; state: string; phone: string }) => (
              <TouchableOpacity
                key={addr._id}
                className={`border rounded-2xl p-4 mb-2 ${
                  selectedAddress === addr._id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'
                }`}
                onPress={() => setSelectedAddress(addr._id)}
              >
                <Text className="font-medium text-gray-800">{addr.fullName}</Text>
                <Text className="text-sm text-gray-500 mt-0.5">
                  {addr.street}, {addr.city}, {addr.state}
                </Text>
                <Text className="text-sm text-gray-400 mt-0.5">{addr.phone}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Payment Method */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-800 mb-3">Payment Method</Text>
          {(['COD', 'ESEWA'] as const).map((method) => (
            <TouchableOpacity
              key={method}
              className={`border rounded-2xl p-4 mb-2 flex-row items-center ${
                paymentMethod === method ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'
              }`}
              onPress={() => setPaymentMethod(method)}
            >
              <Ionicons
                name={paymentMethod === method ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={paymentMethod === method ? '#6B4226' : '#9CA3AF'}
              />
              <Text className="ml-3 font-medium text-gray-800">
                {method === 'COD' ? 'Cash on Delivery' : 'eSewa'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-base font-semibold text-gray-800 mb-3">Order Summary</Text>
          {items.map((item) => (
            <View key={item.productId} className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600 flex-1" numberOfLines={1}>
                {item.name} × {item.quantity}
              </Text>
              <Text className="text-sm font-medium text-gray-800">
                Rs. {(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
          <View className="border-t border-gray-100 pt-2 mt-2 flex-row justify-between">
            <Text className="font-semibold text-gray-800">Total</Text>
            <Text className="font-bold text-brand-500 text-lg">Rs. {total.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order */}
      <View className="bg-white border-t border-gray-100 px-5 py-4">
        <Button
          title={submitting ? 'Placing Order...' : 'Place Order'}
          onPress={handlePlaceOrder}
          isLoading={submitting}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}
