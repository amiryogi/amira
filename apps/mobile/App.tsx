import './src/global.css';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';

import { useAuthStore } from '@/store/auth.store';
import { RootNavigator } from '@/navigation/RootNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  const { tryRestoreSession, isLoading } = useAuthStore();

  useEffect(() => {
    tryRestoreSession();
  }, [tryRestoreSession]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-50">
        <ActivityIndicator size="large" color="#6B4226" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
