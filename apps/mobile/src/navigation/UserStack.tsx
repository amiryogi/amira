import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '@/screens/user/HomeScreen';
import { CategoriesScreen } from '@/screens/user/CategoriesScreen';
import { CartScreen } from '@/screens/user/CartScreen';
import { OrdersScreen } from '@/screens/user/OrdersScreen';
import { ProfileScreen } from '@/screens/user/ProfileScreen';
import { ProductsScreen } from '@/screens/user/ProductsScreen';
import { ProductDetailScreen } from '@/screens/user/ProductDetailScreen';
import { CheckoutScreen } from '@/screens/user/CheckoutScreen';
import { OrderDetailScreen } from '@/screens/user/OrderDetailScreen';
import { AddressesScreen } from '@/screens/user/AddressesScreen';
import { EsewaWebViewScreen } from '@/screens/user/EsewaWebViewScreen';
import { OrderSuccessScreen } from '@/screens/user/OrderSuccessScreen';

export type UserTabParamList = {
  HomeTab: undefined;
  CategoriesTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type UserStackParamList = {
  UserTabs: undefined;
  Products: { category?: string; search?: string };
  ProductDetail: { slug: string };
  Checkout: undefined;
  OrderDetail: { id: string };
  Addresses: undefined;
  EsewaWebView: { paymentUrl: string; orderId: string };
  OrderSuccess: { orderId: string };
};

const Tab = createBottomTabNavigator<UserTabParamList>();
const Stack = createNativeStackNavigator<UserStackParamList>();

function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6B4226',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F3F4F6',
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            HomeTab: 'home-outline',
            CategoriesTab: 'grid-outline',
            CartTab: 'cart-outline',
            OrdersTab: 'receipt-outline',
            ProfileTab: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="CategoriesTab" component={CategoriesScreen} options={{ tabBarLabel: 'Categories' }} />
      <Tab.Screen name="CartTab" component={CartScreen} options={{ tabBarLabel: 'Cart' }} />
      <Tab.Screen name="OrdersTab" component={OrdersScreen} options={{ tabBarLabel: 'Orders' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export function UserStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FDF8F0' },
        headerTintColor: '#6B4226',
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: '#F9FAFB' },
      }}
    >
      <Stack.Screen name="UserTabs" component={UserTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Products" component={ProductsScreen} options={{ title: 'Products' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
      <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: 'My Addresses' }} />
      <Stack.Screen name="EsewaWebView" component={EsewaWebViewScreen} options={{ title: 'eSewa Payment' }} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
