import React from 'react';
import { View, TextInput, Text, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  containerClassName = '',
  className = '',
  ...props
}: InputProps) {
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>
      )}
      <TextInput
        className={`border rounded-xl px-4 py-3 text-base text-gray-900 bg-white ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
