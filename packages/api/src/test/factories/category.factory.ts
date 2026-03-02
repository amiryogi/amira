import { Category, ICategoryDocument } from '../../modules/category/category.model.js';

interface CreateCategoryOverrides {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

let categoryCounter = 0;

const NEPAL_CATEGORIES = [
  'Pashmina Shawls',
  'Woolen Sweaters',
  'Handknit Caps',
  'Yak Wool Blankets',
  'Felt Products',
  'Dhaka Fabric',
  'Cashmere Scarves',
  'Woolen Socks',
];

export async function createTestCategory(
  overrides: CreateCategoryOverrides = {},
): Promise<ICategoryDocument> {
  categoryCounter++;
  const name =
    overrides.name ?? NEPAL_CATEGORIES[(categoryCounter - 1) % NEPAL_CATEGORIES.length];
  const slug = overrides.slug ?? name.toLowerCase().replace(/\s+/g, '-') + `-${categoryCounter}`;

  return Category.create({
    name,
    slug,
    description: overrides.description ?? `High quality ${name} from Nepal`,
    isActive: overrides.isActive ?? true,
  });
}

export async function createTestCategories(
  count: number,
  overrides: CreateCategoryOverrides = {},
): Promise<ICategoryDocument[]> {
  const categories: ICategoryDocument[] = [];
  for (let i = 0; i < count; i++) {
    categories.push(await createTestCategory(overrides));
  }
  return categories;
}

export function resetCategoryCounter(): void {
  categoryCounter = 0;
}
