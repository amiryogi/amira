import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { UserStackParamList } from '@/navigation/UserStack';
import { useAuthStore } from '@/store/auth.store';
import { userService } from '@/services/user.service';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

type Nav = NativeStackNavigationProp<UserStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout, setUser } = useAuthStore();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await userService.updateProfile({ name: name.trim(), phone: phone.trim() });
      setUser(updated.user || updated);
      setEditing(false);
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch {
      Alert.alert('Error', 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-50" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-2xl font-bold text-gray-800 mb-6">Profile</Text>

        {/* Avatar */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-brand-500 items-center justify-center mb-2">
            <Text className="text-3xl font-bold text-white">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text className="text-lg font-semibold text-gray-800">{user?.name}</Text>
          <Text className="text-sm text-gray-500">{user?.email}</Text>
        </View>

        {/* Profile Info */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          {editing ? (
            <>
              <Input label="Name" value={name} onChangeText={setName} />
              <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <View className="flex-row gap-3">
                <Button title="Cancel" variant="outline" onPress={() => setEditing(false)} className="flex-1" />
                <Button title="Save" onPress={handleSave} isLoading={saving} className="flex-1" />
              </View>
            </>
          ) : (
            <>
              <ProfileRow icon="person-outline" label="Name" value={user?.name || ''} />
              <ProfileRow icon="mail-outline" label="Email" value={user?.email || ''} />
              <ProfileRow icon="call-outline" label="Phone" value={user?.phone || 'Not set'} />
              <Button title="Edit Profile" variant="outline" onPress={() => setEditing(true)} fullWidth className="mt-3" />
            </>
          )}
        </View>

        {/* Menu Items */}
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <MenuItem icon="location-outline" label="My Addresses" onPress={() => navigation.navigate('Addresses')} />
          <MenuItem icon="receipt-outline" label="My Orders" onPress={() => navigation.navigate('UserTabs')} />
        </View>

        <Button title="Logout" variant="destructive" onPress={handleLogout} fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center py-2.5">
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color="#6B4226" />
      <View className="ml-3">
        <Text className="text-xs text-gray-400">{label}</Text>
        <Text className="text-sm text-gray-800">{value}</Text>
      </View>
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity className="flex-row items-center px-5 py-4 border-b border-gray-50" onPress={onPress}>
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color="#6B4226" />
      <Text className="flex-1 ml-3 text-sm font-medium text-gray-800">{label}</Text>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );
}
