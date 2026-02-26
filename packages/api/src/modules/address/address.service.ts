import { AddressRepository } from './address.repository.js';
import { ApiError } from '../../common/ApiError.js';
import type { CreateAddressInput, UpdateAddressInput, IAddress } from '@amira/shared';
import type { IAddressDocument } from './address.model.js';

export class AddressService {
  private addressRepo: AddressRepository;

  constructor() {
    this.addressRepo = new AddressRepository();
  }

  async getUserAddresses(userId: string): Promise<IAddress[]> {
    const addresses = await this.addressRepo.findByUser(userId);
    return addresses.map(this.toAddress);
  }

  async createAddress(userId: string, input: CreateAddressInput): Promise<IAddress> {
    if (input.isDefault) {
      await this.addressRepo.clearDefaultForUser(userId);
    }

    const address = await this.addressRepo.create({ ...input, userId } as Partial<IAddressDocument>);
    return this.toAddress(address);
  }

  async updateAddress(addressId: string, userId: string, input: UpdateAddressInput): Promise<IAddress> {
    const address = await this.addressRepo.findById(addressId);
    if (!address || address.userId.toString() !== userId.toString()) {
      throw ApiError.notFound('Address not found');
    }

    if (input.isDefault) {
      await this.addressRepo.clearDefaultForUser(userId);
    }

    const updated = await this.addressRepo.update(addressId, input);
    if (!updated) throw ApiError.notFound('Address not found');
    return this.toAddress(updated);
  }

  async deleteAddress(addressId: string, userId: string): Promise<void> {
    const address = await this.addressRepo.findById(addressId);
    if (!address || address.userId.toString() !== userId.toString()) {
      throw ApiError.notFound('Address not found');
    }
    await this.addressRepo.softDelete(addressId);
  }

  async setDefault(addressId: string, userId: string): Promise<IAddress> {
    const address = await this.addressRepo.findById(addressId);
    if (!address || address.userId.toString() !== userId.toString()) {
      throw ApiError.notFound('Address not found');
    }

    await this.addressRepo.clearDefaultForUser(userId);
    const updated = await this.addressRepo.setDefault(addressId);
    if (!updated) throw ApiError.notFound('Address not found');
    return this.toAddress(updated);
  }

  private toAddress(doc: IAddressDocument): IAddress {
    return {
      _id: doc._id as string,
      userId: doc.userId.toString(),
      label: doc.label,
      fullName: doc.fullName,
      phone: doc.phone,
      street: doc.street,
      city: doc.city,
      district: doc.district,
      province: doc.province,
      postalCode: doc.postalCode,
      isDefault: doc.isDefault,
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
