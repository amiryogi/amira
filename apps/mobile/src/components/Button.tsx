import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-brand-500 active:bg-brand-600',
  secondary: 'bg-gray-200 active:bg-gray-300',
  outline: 'border border-brand-500 bg-transparent active:bg-brand-50',
  destructive: 'bg-red-600 active:bg-red-700',
  ghost: 'bg-transparent active:bg-gray-100',
};

const textVariantStyles: Record<string, string> = {
  primary: 'text-white',
  secondary: 'text-gray-800',
  outline: 'text-brand-500',
  destructive: 'text-white',
  ghost: 'text-gray-700',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-2',
  md: 'px-5 py-3',
  lg: 'px-6 py-4',
};

const textSizeStyles: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      className={`rounded-xl items-center justify-center flex-row ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''} ${className}`}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#6B4226' : '#fff'}
          className="mr-2"
        />
      )}
      <Text
        className={`font-semibold ${textVariantStyles[variant]} ${textSizeStyles[size]}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
