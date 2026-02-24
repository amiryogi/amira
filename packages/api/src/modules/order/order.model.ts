import mongoose, { Schema, Document } from 'mongoose';
import { OrderStatus, PaymentStatus, PaymentMethod } from '@amira/shared';
import { softDeletePlugin } from '../../common/softDeletePlugin.js';

export interface IOrderItemDoc {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IOrderDeliveryAddress {
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  province: string;
  postalCode?: string;
}

export interface IOrderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  products: IOrderItemDoc[];
  totalAmount: number;
  deliveryAddress: IOrderDeliveryAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  transactionId?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItemDoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
  },
  { _id: false },
);

const deliveryAddressSchema = new Schema<IOrderDeliveryAddress>(
  {
    label: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    products: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryAddress: { type: deliveryAddressSchema, required: true },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      index: true,
    },
    transactionId: { type: String, index: true },
  },
  { timestamps: true },
);

orderSchema.plugin(softDeletePlugin);
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrderDocument>('Order', orderSchema);
