import { describe, it, expect, beforeEach } from 'vitest';
import { OrderService } from '../order.service.js';
import { createTestUser } from '../../../test/factories/user.factory.js';
import { createTestProduct } from '../../../test/factories/product.factory.js';
import { createTestCategory } from '../../../test/factories/category.factory.js';
import { createTestOrder } from '../../../test/factories/order.factory.js';
import { OrderStatus, PaymentMethod } from '@amira/shared';
import { Product } from '../../product/product.model.js';
import mongoose from 'mongoose';

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
  });

  describe('createOrder', () => {
    it('should create an order and decrement stock', async () => {
      const user = await createTestUser();
      const category = await createTestCategory();
      const product = await createTestProduct({
        categoryId: category._id as mongoose.Types.ObjectId,
        price: 3000,
        stock: 20,
      });

      const userId = (user._id as mongoose.Types.ObjectId).toString();
      const productId = (product._id as mongoose.Types.ObjectId).toString();

      const result = await orderService.createOrder(userId, {
        products: [{ productId, quantity: 3 }],
        deliveryAddress: {
          label: 'Home',
          fullName: 'Ram Bahadur',
          phone: '+977-9841234567',
          street: 'Durbar Marg',
          city: 'Kathmandu',
          district: 'Kathmandu',
          province: 'Bagmati Province',
        },
        paymentMethod: PaymentMethod.COD,
      });

      expect(result.totalAmount).toBe(9000); // 3000 * 3
      expect(result.orderStatus).toBe(OrderStatus.PENDING);
      expect(result.products).toHaveLength(1);
      expect(result.products[0].quantity).toBe(3);

      // Check stock was decremented
      const updatedProduct = await Product.findById(productId);
      expect(updatedProduct!.stock).toBe(17); // 20 - 3
    });

    it('should throw error for insufficient stock', async () => {
      const user = await createTestUser();
      const product = await createTestProduct({ stock: 2 });
      const userId = (user._id as mongoose.Types.ObjectId).toString();
      const productId = (product._id as mongoose.Types.ObjectId).toString();

      await expect(
        orderService.createOrder(userId, {
          products: [{ productId, quantity: 10 }],
          deliveryAddress: {
            label: 'Work',
            fullName: 'Test User',
            phone: '+977-9841000000',
            street: 'Street',
            city: 'Pokhara',
            district: 'Kaski',
            province: 'Gandaki Province',
          },
          paymentMethod: PaymentMethod.COD,
        }),
      ).rejects.toThrow(/Insufficient stock/);
    });

    it('should throw error for non-existent product', async () => {
      const user = await createTestUser();
      const userId = (user._id as mongoose.Types.ObjectId).toString();
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(
        orderService.createOrder(userId, {
          products: [{ productId: fakeId, quantity: 1 }],
          deliveryAddress: {
            label: 'Home',
            fullName: 'Test',
            phone: '+977-9800000000',
            street: 'Street',
            city: 'Lalitpur',
            district: 'Lalitpur',
            province: 'Bagmati Province',
          },
          paymentMethod: PaymentMethod.COD,
        }),
      ).rejects.toThrow(/not found or unavailable/);
    });
  });

  describe('getOrderById', () => {
    it('should return order for owner', async () => {
      const user = await createTestUser();
      const userId = (user._id as mongoose.Types.ObjectId).toString();
      const order = await createTestOrder({ userId: user._id as mongoose.Types.ObjectId });

      const result = await orderService.getOrderById(
        (order._id as mongoose.Types.ObjectId).toString(),
        userId,
        false,
      );
      expect(result._id).toBeDefined();
    });

    it('should throw forbidden for non-owner non-admin', async () => {
      const owner = await createTestUser();
      const other = await createTestUser();
      const order = await createTestOrder({
        userId: owner._id as mongoose.Types.ObjectId,
      });

      await expect(
        orderService.getOrderById(
          (order._id as mongoose.Types.ObjectId).toString(),
          (other._id as mongoose.Types.ObjectId).toString(),
          false,
        ),
      ).rejects.toThrow('You can only view your own orders');
    });

    it('should allow admin to view any order', async () => {
      const owner = await createTestUser();
      const admin = await createTestUser({ name: 'Admin' });
      const order = await createTestOrder({
        userId: owner._id as mongoose.Types.ObjectId,
      });

      const result = await orderService.getOrderById(
        (order._id as mongoose.Types.ObjectId).toString(),
        (admin._id as mongoose.Types.ObjectId).toString(),
        true,
      );
      expect(result._id).toBeDefined();
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status to CONFIRMED', async () => {
      const order = await createTestOrder();

      const result = await orderService.updateOrderStatus(
        (order._id as mongoose.Types.ObjectId).toString(),
        { orderStatus: OrderStatus.CONFIRMED },
      );

      expect(result.orderStatus).toBe(OrderStatus.CONFIRMED);
    });

    it('should prevent cancelling a delivered order', async () => {
      const order = await createTestOrder();
      // Manually set to DELIVERED
      await orderService.updateOrderStatus(
        (order._id as mongoose.Types.ObjectId).toString(),
        { orderStatus: OrderStatus.DELIVERED },
      );

      await expect(
        orderService.updateOrderStatus(
          (order._id as mongoose.Types.ObjectId).toString(),
          { orderStatus: OrderStatus.CANCELLED },
        ),
      ).rejects.toThrow('Cannot cancel a delivered order');
    });

    it('should restore stock when cancelling order', async () => {
      const product = await createTestProduct({ stock: 50 });
      const user = await createTestUser();

      const order = await createTestOrder({
        userId: user._id as mongoose.Types.ObjectId,
        products: [
          {
            productId: product._id as mongoose.Types.ObjectId,
            name: product.name,
            price: product.price,
            quantity: 5,
          },
        ],
      });

      // Decrement stock to simulate order creation
      await Product.findByIdAndUpdate(product._id, { $inc: { stock: -5 } });

      await orderService.updateOrderStatus(
        (order._id as mongoose.Types.ObjectId).toString(),
        { orderStatus: OrderStatus.CANCELLED },
      );

      const updatedProduct = await Product.findById(product._id);
      expect(updatedProduct!.stock).toBe(50); // 45 + 5 restored
    });
  });

  describe('getUserOrders', () => {
    it('should return paginated orders for user', async () => {
      const user = await createTestUser();
      const userId = user._id as mongoose.Types.ObjectId;

      await createTestOrder({ userId });
      await createTestOrder({ userId });

      const result = await orderService.getUserOrders(userId.toString(), {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });
  });
});
