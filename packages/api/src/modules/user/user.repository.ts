import { User, IUserDocument } from './user.model.js';
import mongoose from 'mongoose';
import { UserRole } from '@amira/shared';

export class UserRepository {
  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email });
  }

  async findAll(
    filter: Record<string, unknown>,
    skip: number,
    limit: number,
    sort: Record<string, 1 | -1>,
  ): Promise<{ users: IUserDocument[]; total: number }> {
    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);
    return { users: users as unknown as IUserDocument[], total };
  }

  async updateProfile(
    id: string,
    data: { name?: string; phone?: string },
  ): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, data, { new: true });
  }

  async updateRole(id: string, role: UserRole): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, { role }, { new: true });
  }

  async softDelete(id: string): Promise<void> {
    await User.findByIdAndUpdate(id, { isDeleted: true });
  }

  async incrementTokenVersion(id: string): Promise<void> {
    await User.findByIdAndUpdate(id, { $inc: { tokenVersion: 1 } });
  }
}
