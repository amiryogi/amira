import { PAGINATION_DEFAULTS } from '@amira/shared';

interface PaginationInput {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface PaginationResult {
  skip: number;
  limit: number;
  sort: Record<string, 1 | -1>;
  page: number;
}

export function buildPagination(input: PaginationInput): PaginationResult {
  const page = Math.max(1, input.page || PAGINATION_DEFAULTS.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION_DEFAULTS.MAX_LIMIT,
    Math.max(1, input.limit || PAGINATION_DEFAULTS.DEFAULT_LIMIT),
  );
  const skip = (page - 1) * limit;

  const sortField = input.sort || 'createdAt';
  const sortOrder = input.order === 'asc' ? 1 : -1;

  return {
    skip,
    limit,
    sort: { [sortField]: sortOrder } as Record<string, 1 | -1>,
    page,
  };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
