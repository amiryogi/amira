import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { IAddress } from './address.types';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IOrder {
  _id: string;
  userId: string;
  products: IOrderItem[];
  totalAmount: number;
  deliveryAddress: IAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  transactionId?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  products: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryAddress: Omit<IAddress, '_id' | 'userId' | 'isDefault' | 'isDeleted' | 'createdAt' | 'updatedAt'>;
  paymentMethod: PaymentMethod;
}
