import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CHAT_DEFAULTS, API_ENDPOINTS } from '@amira/shared';
import api from '@/services/api';

interface MessageInputProps {
  onSend: (content: string, attachments?: { type: 'image'; url: string }[]) => void;
  onTyping: () => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, onTyping, disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 0.8,
        allowsEditing: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      setIsUploading(true);
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('image', {
        uri: asset.uri,
        name: asset.fileName || 'image.jpg',
        type: asset.mimeType || 'image/jpeg',
      } as unknown as Blob);

      const { data } = await api.post(API_ENDPOINTS.CHAT.UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSend('', [{ type: 'image', url: data.data.url }]);
    } catch {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangeText = (value: string) => {
    setText(value);
    onTyping();
  };

  return (
    <View className="flex-row items-end gap-2 px-4 py-3 bg-white border-t border-gray-100">
      <TouchableOpacity
        onPress={handleImagePick}
        disabled={disabled || isUploading}
        className="pb-1"
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#6B4226" />
        ) : (
          <Ionicons name="image-outline" size={24} color="#6B4226" />
        )}
      </TouchableOpacity>

      <TextInput
        ref={inputRef}
        value={text}
        onChangeText={handleChangeText}
        placeholder="Type a message..."
        placeholderTextColor="#9CA3AF"
        maxLength={CHAT_DEFAULTS.MAX_MESSAGE_LENGTH}
        multiline
        editable={!disabled}
        className="flex-1 bg-gray-50 rounded-2xl px-4 py-2.5 text-[15px] text-gray-800 max-h-24"
      />

      <TouchableOpacity
        onPress={handleSend}
        disabled={disabled || !text.trim()}
        className={`pb-1 ${!text.trim() ? 'opacity-40' : ''}`}
      >
        <Ionicons
          name="send"
          size={24}
          color={text.trim() ? '#6B4226' : '#9CA3AF'}
        />
      </TouchableOpacity>
    </View>
  );
}
