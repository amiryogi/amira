import mongoose from 'mongoose';
import { OrderRepository } from './order.repository.js';
import { ProductRepository } from '../product/product.repository.js';
import { ApiError } from '../../common/ApiError.js';
import { buildPagination, buildPaginationMeta } from '../../utils/pagination.js';
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '@amira/shared';
import type { CreateOrderInput, IOrder, PaginationParams } from '@amira/shared';
import type { IOrderDocument, IOrderDeliveryAddress } from './order.model.js';
import type { UpdateOrderStatusDTO } from './order.dto.js';

export class OrderService {
  private orderRepo: OrderRepository;
  private productRepo: ProductRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.productRepo = new ProductRepository();
  }

  async createOrder(userId: string, input: CreateOrderInput): Promise<IOrder> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate products and build order items with snapshots
      const orderItems = [];
      let totalAmount = 0;

      for (const item of input.products) {
        const product = await this.productRepo.findById(item.productId);
        if (!product || !product.isActive) {
          throw ApiError.badRequest(`Product ${item.productId} not found or unavailable`);
        }
        if (product.stock < item.quantity) {
          throw ApiError.badRequest(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
        }

        const price = product.discountPrice || product.price;
        totalAmount += price * item.quantity;

        orderItems.push({
          productId: product._id as mongoose.Types.ObjectId,
          name: product.name,
          price,
          quantity: item.quantity,
          image: product.images[0] || undefined,
        });

        // Decrement stock within transaction
        const updated = await this.productRepo.decrementStock(item.productId, item.quantity);
        if (!updated) {
          throw ApiError.badRequest(`Failed to reserve stock for "${product.name}"`);
        }
      }

      const order = await this.orderRepo.create(
        {
          userId: new mongoose.Types.ObjectId(userId),
          products: orderItems,
          totalAmount,
          deliveryAddress: input.deliveryAddress as IOrderDeliveryAddress,
          paymentMethod: input.paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          orderStatus: OrderStatus.PENDING,
        },
        session,
      );

      await session.commitTransaction();
      return this.toOrder(order);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getUserOrders(userId: string, query: PaginationParams) {
    const { skip, limit, sort, page } = buildPagination(query);

    const [orders, total] = await Promise.all([
      this.orderRepo.findByUser(userId, sort, skip, limit),
      this.orderRepo.countByUser(userId),
    ]);

    return {
      data: orders.map(this.toOrder),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async getOrderById(orderId: string, userId: string, isAdmin: boolean): Promise<IOrder> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Non-admin can only view their own orders
    const orderUserId = typeof order.userId === 'object' && order.userId !== null && '_id' in order.userId
      ? (order.userId as unknown as { _id: { toString(): string } })._id.toString()
      : order.userId.toString();
    if (!isAdmin && orderUserId !== userId.toString()) {
      throw ApiError.forbidden('You can only view your own orders');
    }

    return this.toOrder(order);
  }

  async listAllOrders(query: PaginationParams & { orderStatus?: string; paymentStatus?: string; search?: string }) {
    const { skip, limit, sort, page } = buildPagination(query);

    const filter: Record<string, unknown> = {};
    if (query.orderStatus) {
      filter.orderStatus = query.orderStatus;
    }
    if (query.paymentStatus) {
      filter.paymentStatus = query.paymentStatus;
    }
    if (query.search) {
      const searchTerm = query.search.trim();
      // Search by order ID prefix or by user email (populated)
      if (searchTerm.match(/^[a-f0-9]{24}$/i)) {
        filter._id = new mongoose.Types.ObjectId(searchTerm);
      } else {
        // Find users matching the search, then filter orders by those userIds
        const User = mongoose.model('User');
        const matchingUsers = await User.find(
          { $or: [{ email: { $regex: searchTerm, $options: 'i' } }, { name: { $regex: searchTerm, $options: 'i' } }] },
          '_id'
        ).lean();
        filter.userId = { $in: matchingUsers.map((u: { _id: mongoose.Types.ObjectId }) => u._id) };
      }
    }

    const [orders, total] = await Promise.all([
      this.orderRepo.findPaginated(filter, sort, skip, limit),
      this.orderRepo.count(filter),
    ]);

    return {
      data: orders.map(this.toOrder),
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async updateOrderStatus(orderId: string, input: UpdateOrderStatusDTO): Promise<IOrder> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Validate status transitions
    if (input.orderStatus === OrderStatus.CANCELLED && order.orderStatus === OrderStatus.DELIVERED) {
      throw ApiError.badRequest('Cannot cancel a delivered order');
    }

    // If cancelling, restore stock
    if (input.orderStatus === OrderStatus.CANCELLED && order.orderStatus !== OrderStatus.CANCELLED) {
      for (const item of order.products) {
        await this.productRepo.incrementStock(item.productId.toString(), item.quantity);
      }
    }

    const updated = await this.orderRepo.updateStatus(orderId, input);
    if (!updated) throw ApiError.notFound('Order not found');
    return this.toOrder(updated);
  }

  private toOrder(doc: IOrderDocument): IOrder & { user?: { name: string; email: string; phone?: string } } {
    // If userId was populated, extract user info
    const populatedUser = typeof doc.userId === 'object' && doc.userId !== null && 'email' in doc.userId
      ? doc.userId as unknown as { _id: mongoose.Types.ObjectId; name: string; email: string; phone?: string }
      : null;

    return {
      _id: doc._id as string,
      userId: populatedUser ? populatedUser._id.toString() : doc.userId.toString(),
      ...(populatedUser && {
        user: {
          name: populatedUser.name,
          email: populatedUser.email,
          phone: populatedUser.phone,
        },
      }),
      products: doc.products.map((p) => ({
        productId: p.productId.toString(),
        name: p.name,
        price: p.price,
        quantity: p.quantity,
        image: p.image,
      })),
      totalAmount: doc.totalAmount,
      deliveryAddress: doc.deliveryAddress as IOrder['deliveryAddress'],
      paymentMethod: doc.paymentMethod,
      paymentStatus: doc.paymentStatus,
      orderStatus: doc.orderStatus,
      transactionId: doc.transactionId,
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
