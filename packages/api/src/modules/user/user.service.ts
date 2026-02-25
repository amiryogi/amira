import { UserRepository } from './user.repository.js';
import { ApiError } from '../../common/ApiError.js';
import { buildPagination, buildPaginationMeta } from '../../utils/pagination.js';
import type { IUserPublic, PaginationParams, UserRole } from '@amira/shared';
import type { IUserDocument } from './user.model.js';

export class UserService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async getProfile(userId: string): Promise<IUserPublic> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return this.toPublicUser(user);
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string }): Promise<IUserPublic> {
    const user = await this.userRepo.updateProfile(userId, data);
    if (!user) throw ApiError.notFound('User not found');
    return this.toPublicUser(user);
  }

  async listUsers(params: PaginationParams & { role?: string }) {
    const { skip, limit, sort, page } = buildPagination(params);

    const filter: Record<string, unknown> = {};
    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { email: { $regex: params.search, $options: 'i' } },
      ];
    }
    if (params.role) {
      filter.role = params.role;
    }

    const { users, total } = await this.userRepo.findAll(filter, skip, limit, sort);
    return {
      users: users.map((u) => this.toPublicUser(u)),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async updateRole(userId: string, role: UserRole, adminId: string): Promise<IUserPublic> {
    if (userId === adminId) {
      throw ApiError.forbidden('Cannot change your own role');
    }
    const user = await this.userRepo.updateRole(userId, role);
    if (!user) throw ApiError.notFound('User not found');
    return this.toPublicUser(user);
  }

  async softDeleteUser(userId: string, adminId: string): Promise<void> {
    if (userId === adminId) {
      throw ApiError.forbidden('Cannot delete your own account');
    }
    await this.userRepo.softDelete(userId);
  }

  private toPublicUser(user: IUserDocument): IUserPublic {
    return {
      _id: user._id as string,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
