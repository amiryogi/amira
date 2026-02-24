import React, { useRef, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { UserStackParamList } from '@/navigation/UserStack';
import { paymentService } from '@/services/payment.service';
import { useCartStore } from '@/store/cart.store';

type Route = RouteProp<UserStackParamList, 'EsewaWebView'>;
type Nav = NativeStackNavigationProp<UserStackParamList>;

const SUCCESS_URL = 'payment/esewa/success';
const FAILURE_URL = 'payment/esewa/failure';

export function EsewaWebViewScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { clearCart } = useCartStore();
  const verifying = useRef(false);

  const handleNavigationChange = useCallback(
    async (navState: { url: string }) => {
      const { url } = navState;

      if (url.includes(SUCCESS_URL) && !verifying.current) {
        verifying.current = true;
        try {
          // Extract query params from redirect URL
          const urlObj = new URL(url);
          const params: Record<string, string> = {};
          urlObj.searchParams.forEach((value, key) => {
            params[key] = value;
          });

          await paymentService.verifyEsewa(params);
          clearCart();
          navigation.replace('OrderSuccess', { orderId: route.params.orderId });
        } catch {
          navigation.goBack();
        }
      } else if (url.includes(FAILURE_URL)) {
        navigation.goBack();
      }
    },
    [navigation, route.params.orderId, clearCart],
  );

  return (
    <View className="flex-1">
      <WebView
        source={{ uri: route.params.paymentUrl }}
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
        renderLoading={() => (
          <View className="absolute inset-0 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#6B4226" />
          </View>
        )}
      />
    </View>
  );
}
