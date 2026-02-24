import { Address, IAddressDocument } from './address.model.js';
import mongoose from 'mongoose';

export class AddressRepository {
  async create(data: Partial<IAddressDocument>): Promise<IAddressDocument> {
    return Address.create(data);
  }

  async findById(id: string): Promise<IAddressDocument | null> {
    return Address.findById(id);
  }

  async findByUser(userId: string): Promise<IAddressDocument[]> {
    return Address.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ isDefault: -1, createdAt: -1 });
  }

  async update(id: string, data: Partial<IAddressDocument>): Promise<IAddressDocument | null> {
    return Address.findByIdAndUpdate(id, data, { new: true });
  }

  async softDelete(id: string): Promise<void> {
    await Address.findByIdAndUpdate(id, { isDeleted: true });
  }

  async clearDefaultForUser(userId: string): Promise<void> {
    await Address.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), isDefault: true },
      { isDefault: false },
    );
  }

  async setDefault(id: string): Promise<IAddressDocument | null> {
    return Address.findByIdAndUpdate(id, { isDefault: true }, { new: true });
  }
}
