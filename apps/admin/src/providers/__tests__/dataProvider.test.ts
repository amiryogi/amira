import { describe, it, expect } from 'vitest';
import { dataProvider } from '@/providers/dataProvider';

describe('dataProvider', () => {
  describe('getList', () => {
    it('should fetch paginated list of products', async () => {
      const result = await dataProvider.getList({
        resource: 'products',
        pagination: { current: 1, pageSize: 10 },
      });
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should fetch list of orders', async () => {
      const result = await dataProvider.getList({
        resource: 'orders',
        pagination: { current: 1, pageSize: 10 },
      });
      expect(result.data).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should fetch list of users', async () => {
      const result = await dataProvider.getList({
        resource: 'users',
      });
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBe(3);
    });
  });

  describe('getOne', () => {
    it('should fetch a single product by id', async () => {
      const result = await dataProvider.getOne({
        resource: 'products',
        id: 'prod-1',
      });
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe('Pashmina Shawl');
    });

    it('should return 404 for non-existent product', async () => {
      await expect(
        dataProvider.getOne({ resource: 'products', id: 'non-existent' })
      ).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const result = await dataProvider.create({
        resource: 'products',
        variables: { name: 'New Product', price: 1000 },
      });
      expect(result.data).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const result = await dataProvider.update({
        resource: 'products',
        id: 'prod-1',
        variables: { name: 'Updated Product' },
      });
      expect(result.data).toBeDefined();
    });
  });

  describe('deleteOne', () => {
    it('should delete a product', async () => {
      const result = await dataProvider.deleteOne({
        resource: 'products',
        id: 'prod-1',
      });
      expect(result.data).toBeDefined();
    });
  });

  describe('getApiUrl', () => {
    it('should return the correct API URL', () => {
      expect(dataProvider.getApiUrl()).toBe('/api/v1');
    });
  });
});
