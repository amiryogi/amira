import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AdminDashboardScreen } from '@/screens/admin/AdminDashboardScreen';
import { AdminOrdersScreen } from '@/screens/admin/AdminOrdersScreen';
import { AdminOrderDetailScreen } from '@/screens/admin/AdminOrderDetailScreen';
import { AdminProductsScreen } from '@/screens/admin/AdminProductsScreen';
import { AdminProductFormScreen } from '@/screens/admin/AdminProductFormScreen';
import { AdminPaymentsScreen } from '@/screens/admin/AdminPaymentsScreen';
import { AdminUsersScreen } from '@/screens/admin/AdminUsersScreen';
import { AdminChatListScreen } from '@/screens/admin/AdminChatListScreen';
import { AdminChatRoomScreen } from '@/screens/admin/AdminChatRoomScreen';

export type AdminTabParamList = {
  DashboardTab: undefined;
  OrdersTab: undefined;
  ProductsTab: undefined;
  PaymentsTab: undefined;
  UsersTab: undefined;
  ChatTab: undefined;
};

export type AdminStackParamList = {
  AdminTabs: undefined;
  AdminOrderDetail: { id: string };
  AdminProductForm: { id?: string };
  AdminChatRoom: { roomId: string; customerName?: string };
};

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createNativeStackNavigator<AdminStackParamList>();

function AdminTabs() {
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
            DashboardTab: 'bar-chart-outline',
            OrdersTab: 'receipt-outline',
            ProductsTab: 'cube-outline',
            PaymentsTab: 'card-outline',
            UsersTab: 'people-outline',
            ChatTab: 'chatbubbles-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={AdminDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="OrdersTab" component={AdminOrdersScreen} options={{ tabBarLabel: 'Orders' }} />
      <Tab.Screen name="ProductsTab" component={AdminProductsScreen} options={{ tabBarLabel: 'Products' }} />
      <Tab.Screen name="PaymentsTab" component={AdminPaymentsScreen} options={{ tabBarLabel: 'Payments' }} />
      <Tab.Screen name="UsersTab" component={AdminUsersScreen} options={{ tabBarLabel: 'Users' }} />
      <Tab.Screen name="ChatTab" component={AdminChatListScreen} options={{ tabBarLabel: 'Chat' }} />
    </Tab.Navigator>
  );
}

export function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FDF8F0' },
        headerTintColor: '#6B4226',
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: '#F9FAFB' },
      }}
    >
      <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
      <Stack.Screen name="AdminOrderDetail" component={AdminOrderDetailScreen} options={{ title: 'Order Details' }} />
      <Stack.Screen name="AdminProductForm" component={AdminProductFormScreen} options={{ title: 'Product' }} />
      <Stack.Screen name="AdminChatRoom" component={AdminChatRoomScreen} options={{ title: 'Chat' }} />
    </Stack.Navigator>
  );
}
