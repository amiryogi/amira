import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/hooks/useAddresses';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

interface AddressForm {
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  province: string;
  postalCode: string;
}

const emptyForm: AddressForm = { label: '', fullName: '', phone: '', street: '', city: '', district: '', province: '', postalCode: '' };

export function AddressesScreen() {
  const { data, isLoading, refetch } = useAddresses();
  const createAddr = useCreateAddress();
  const updateAddr = useUpdateAddress();
  const deleteAddr = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const addresses = data?.addresses || data || [];
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyForm);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalVisible(true);
  };

  const openEdit = (addr: AddressForm & { _id: string }) => {
    setEditingId(addr._id);
    setForm({
      label: addr.label || '',
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      district: addr.district || '',
      province: addr.province,
      postalCode: addr.postalCode || '',
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.label || !form.fullName || !form.phone || !form.street || !form.city || !form.district || !form.province) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    try {
      if (editingId) {
        await updateAddr.mutateAsync({ id: editingId, ...form });
      } else {
        await createAddr.mutateAsync(form);
      }
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to save address.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteAddr.mutate(id),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#6B4226" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={addresses}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="location-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-400 mt-3">No addresses saved</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className={`bg-white rounded-2xl p-4 mb-3 border ${item.isDefault ? 'border-brand-500' : 'border-transparent'}`}>
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-semibold text-gray-800">{item.fullName}</Text>
                  {item.isDefault && (
                    <View className="bg-brand-100 px-2 py-0.5 rounded-full">
                      <Text className="text-xs text-brand-500 font-medium">Default</Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-gray-500 mt-0.5">{item.street}</Text>
                <Text className="text-sm text-gray-500">{item.city}, {item.district && `${item.district}, `}{item.province} {item.postalCode}</Text>
                <Text className="text-sm text-gray-400 mt-0.5">{item.phone}</Text>
              </View>
              <View className="flex-row gap-2">
                {!item.isDefault && (
                  <TouchableOpacity onPress={() => setDefault.mutate(item._id)} className="p-1.5">
                    <Ionicons name="star-outline" size={18} color="#6B4226" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => openEdit(item)} className="p-1.5">
                  <Ionicons name="create-outline" size={18} color="#6B4226" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)} className="p-1.5">
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <Button title="Add New Address" variant="outline" onPress={openCreate} fullWidth className="mt-2" />
        }
      />

      {/* Address Form Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          className="flex-1 bg-white"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-800">
              {editingId ? 'Edit Address' : 'New Address'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Input label="Label * (e.g. Home, Office)" value={form.label} onChangeText={(t) => setForm((f) => ({ ...f, label: t }))} />
            <Input label="Full Name *" value={form.fullName} onChangeText={(t) => setForm((f) => ({ ...f, fullName: t }))} />
            <Input label="Phone *" value={form.phone} onChangeText={(t) => setForm((f) => ({ ...f, phone: t }))} keyboardType="phone-pad" />
            <Input label="Street *" value={form.street} onChangeText={(t) => setForm((f) => ({ ...f, street: t }))} />
            <Input label="City *" value={form.city} onChangeText={(t) => setForm((f) => ({ ...f, city: t }))} />
            <Input label="District *" value={form.district} onChangeText={(t) => setForm((f) => ({ ...f, district: t }))} />
            <Input label="Province *" value={form.province} onChangeText={(t) => setForm((f) => ({ ...f, province: t }))} />
            <Input label="Postal Code" value={form.postalCode} onChangeText={(t) => setForm((f) => ({ ...f, postalCode: t }))} />
            <Button
              title={editingId ? 'Update' : 'Save'}
              onPress={handleSave}
              isLoading={createAddr.isPending || updateAddr.isPending}
              fullWidth
              className="mt-4"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
