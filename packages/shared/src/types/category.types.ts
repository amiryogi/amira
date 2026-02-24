export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
