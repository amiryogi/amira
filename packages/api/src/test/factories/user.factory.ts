import bcrypt from 'bcrypt';
import { User, IUserDocument } from '../../modules/user/user.model.js';
import { UserRole } from '@amira/shared';

interface CreateUserOverrides {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  phone?: string;
  isVerified?: boolean;
  tokenVersion?: number;
}

let userCounter = 0;

export async function createTestUser(
  overrides: CreateUserOverrides = {},
): Promise<IUserDocument> {
  userCounter++;
  const hashedPassword = await bcrypt.hash(overrides.password || 'Test@1234', 10);

  const userData = {
    name: overrides.name ?? `Test User ${userCounter}`,
    email: overrides.email ?? `testuser${userCounter}@example.com`,
    password: hashedPassword,
    role: overrides.role ?? UserRole.USER,
    phone: overrides.phone ?? `+977-98${String(userCounter).padStart(8, '0')}`,
    isVerified: overrides.isVerified ?? true,
    tokenVersion: overrides.tokenVersion ?? 0,
  };

  return User.create(userData);
}

export async function createTestAdmin(
  overrides: Omit<CreateUserOverrides, 'role'> = {},
): Promise<IUserDocument> {
  return createTestUser({ ...overrides, role: UserRole.ADMIN });
}

export async function createTestUsers(
  count: number,
  overrides: CreateUserOverrides = {},
): Promise<IUserDocument[]> {
  const users: IUserDocument[] = [];
  for (let i = 0; i < count; i++) {
    users.push(await createTestUser(overrides));
  }
  return users;
}

export function resetUserCounter(): void {
  userCounter = 0;
}
