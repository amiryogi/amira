import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/AuthStack';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { register } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Min 8 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, phone.trim() || undefined);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert('Registration Failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-brand-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-8">
          <Text className="text-4xl font-bold text-brand-500">Amira</Text>
          <Text className="text-gray-500 mt-1">Create your account</Text>
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-6">Sign Up</Text>

          <Input label="Full Name" placeholder="Your name" value={name} onChangeText={setName} error={errors.name} />
          <Input label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
          <Input label="Phone (optional)" placeholder="98XXXXXXXX" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Input label="Password" placeholder="Min 8 characters" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
          <Input label="Confirm Password" placeholder="Repeat password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry error={errors.confirmPassword} />

          <Button
            title="Create Account"
            onPress={handleRegister}
            isLoading={loading}
            fullWidth
            className="mt-2"
          />
        </View>

        <View className="flex-row items-center justify-center mt-6">
          <Text className="text-gray-500">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-brand-500 font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
