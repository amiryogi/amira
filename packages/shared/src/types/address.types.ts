export interface IAddress {
  _id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  province: string;
  postalCode?: string;
  isDefault: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressInput {
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  province: string;
  postalCode?: string;
  isDefault?: boolean;
}

export type UpdateAddressInput = Partial<CreateAddressInput>;
