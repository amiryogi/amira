import mongoose from 'mongoose';
import { Order, IOrderDocument } from '../../modules/order/order.model.js';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@amira/shared';
import { createTestUser } from './user.factory.js';
import { createTestProduct } from './product.factory.js';

interface CreateOrderOverrides {
  userId?: mongoose.Types.ObjectId;
  products?: Array<{
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  totalAmount?: number;
  deliveryAddress?: {
    label: string;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    district: string;
    province: string;
    postalCode?: string;
  };
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  transactionId?: string;
}

let orderCounter = 0;

export async function createTestOrder(
  overrides: CreateOrderOverrides = {},
): Promise<IOrderDocument> {
  orderCounter++;

  let userId = overrides.userId;
  if (!userId) {
    const user = await createTestUser();
    userId = user._id as mongoose.Types.ObjectId;
  }

  let products = overrides.products;
  if (!products) {
    const product = await createTestProduct();
    products = [
      {
        productId: product._id as mongoose.Types.ObjectId,
        name: product.name,
        price: product.price,
        quantity: 2,
        image: product.images[0],
      },
    ];
  }

  const totalAmount =
    overrides.totalAmount ?? products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return Order.create({
    userId,
    products,
    totalAmount,
    deliveryAddress: overrides.deliveryAddress ?? {
      label: 'Home',
      fullName: `Test Customer ${orderCounter}`,
      phone: '+977-9841000000',
      street: 'Thamel Street 5',
      city: 'Kathmandu',
      district: 'Kathmandu',
      province: 'Bagmati Province',
      postalCode: '44600',
    },
    paymentMethod: overrides.paymentMethod ?? PaymentMethod.COD,
    paymentStatus: overrides.paymentStatus ?? PaymentStatus.PENDING,
    orderStatus: overrides.orderStatus ?? OrderStatus.PENDING,
    transactionId: overrides.transactionId,
  });
}

export async function createTestOrders(
  count: number,
  overrides: CreateOrderOverrides = {},
): Promise<IOrderDocument[]> {
  const orders: IOrderDocument[] = [];
  for (let i = 0; i < count; i++) {
    orders.push(await createTestOrder(overrides));
  }
  return orders;
}

export function resetOrderCounter(): void {
  orderCounter = 0;
}
