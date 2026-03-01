import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { socketService } from '@/services/socket';
import { CHAT_EVENTS } from '@amira/shared';
import type { IChatRoomPopulated } from '@amira/shared';
import type { AdminStackParamList } from '@/navigation/AdminStack';
import { ChatRoomCard } from '@/components/chat/ChatRoomCard';

type Nav = NativeStackNavigationProp<AdminStackParamList>;

export function AdminChatListScreen() {
  const navigation = useNavigation<Nav>();
  const [rooms, setRooms] = useState<IChatRoomPopulated[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback((refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const socket = socketService.connect();

      const emitGetRooms = () => {
        socket.emit(
          CHAT_EVENTS.GET_ROOMS,
          {},
          (response: { success?: boolean; rooms?: IChatRoomPopulated[]; error?: string }) => {
            setIsLoading(false);
            setIsRefreshing(false);
            if (response.error) {
              setError(response.error);
              return;
            }
            if (response.rooms) {
              setRooms(response.rooms);
            }
          },
        );
      };

      if (socket.connected) {
        emitGetRooms();
      } else {
        socket.once('connect', emitGetRooms);
      }
    } catch {
      setIsLoading(false);
      setIsRefreshing(false);
      setError('Failed to connect');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRooms();

      let socket: ReturnType<typeof socketService.connect> | null = null;
      try {
        socket = socketService.connect();
      } catch {
        return;
      }

      const handleRoomUpdated = () => {
        socket?.emit(
          CHAT_EVENTS.GET_ROOMS,
          {},
          (response: { rooms?: IChatRoomPopulated[] }) => {
            if (response.rooms) setRooms(response.rooms);
          },
        );
      };

      socket.on(CHAT_EVENTS.ROOM_UPDATED, handleRoomUpdated);

      return () => {
        socket?.off(CHAT_EVENTS.ROOM_UPDATED, handleRoomUpdated);
        socketService.disconnect();
      };
    }, [fetchRooms]),
  );

  const renderItem = useCallback(
    ({ item }: { item: IChatRoomPopulated }) => (
      <ChatRoomCard
        room={item}
        onPress={() =>
          navigation.navigate('AdminChatRoom', {
            roomId: item._id,
            customerName: item.customerId?.name,
          })
        }
      />
    ),
    [navigation],
  );

  if (isLoading && rooms.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center" edges={['bottom']}>
        <ActivityIndicator size="large" color="#6B4226" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      {error && (
        <View className="bg-red-50 px-4 py-2">
          <Text className="text-xs text-red-600">{error}</Text>
        </View>
      )}

      <FlatList
        data={rooms}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchRooms(true)}
            tintColor="#6B4226"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
            <Text className="text-sm text-gray-400 mt-3">No active chats</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
