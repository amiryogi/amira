import mongoose from 'mongoose';
import { Order } from '../order/order.model.js';
import { Payment } from '../payment/payment.model.js';
import { Product } from '../product/product.model.js';
import { User } from '../user/user.model.js';

export class AnalyticsRepository {
  async getTotalRevenue(): Promise<number> {
    const result = await Payment.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total || 0;
  }

  async getRevenueByMonth(months: number): Promise<Array<{ month: string; revenue: number; orders: number }>> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return Payment.aggregate([
      { $match: { status: 'PAID', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id',
          revenue: 1,
          orders: 1,
        },
      },
    ]);
  }

  async getRevenueByPaymentMethod(): Promise<Array<{ method: string; total: number; count: number }>> {
    return Payment.aggregate([
      { $match: { status: 'PAID' } },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          method: '$_id',
          total: 1,
          count: 1,
        },
      },
    ]);
  }

  async getTopProducts(limit: number): Promise<Array<{ productId: string; name: string; totalSold: number; revenue: number }>> {
    return Order.aggregate([
      { $match: { orderStatus: { $ne: 'CANCELLED' } } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          name: { $first: '$products.name' },
          totalSold: { $sum: '$products.quantity' },
          revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: 1,
          totalSold: 1,
          revenue: 1,
        },
      },
    ]);
  }

  async getOrderStatusCounts(): Promise<Array<{ status: string; count: number }>> {
    return Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);
  }

  async getDashboardSummary(): Promise<{
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
  }> {
    const [totalUsers, totalProducts, totalOrders, totalRevenue, pendingOrders] =
      await Promise.all([
        User.countDocuments(),
        Product.countDocuments({ isActive: true }),
        Order.countDocuments(),
        this.getTotalRevenue(),
        Order.countDocuments({ orderStatus: 'PENDING' }),
      ]);

    return { totalUsers, totalProducts, totalOrders, totalRevenue, pendingOrders };
  }

  async getFailedPaymentRate(): Promise<{ total: number; failed: number; rate: number }> {
    const [total, failed] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: 'FAILED' }),
    ]);

    return {
      total,
      failed,
      rate: total > 0 ? Math.round((failed / total) * 10000) / 100 : 0,
    };
  }
}
