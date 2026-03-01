// ─── Enums ───
export { UserRole } from './enums/role.enum';
export { OrderStatus } from './enums/order-status.enum';
export { PaymentStatus } from './enums/payment-status.enum';
export { PaymentMethod } from './enums/payment-method.enum';
export { NotificationType, NotificationChannel, NotificationStatus } from './enums/notification.enum';

// ─── Types ───
export type { IUser, IUserPublic } from './types/user.types';
export type { IProduct, IProductVariant } from './types/product.types';
export type { ICategory } from './types/category.types';
export type { IOrder, IOrderItem } from './types/order.types';
export type { IPayment } from './types/payment.types';
export type { IReview } from './types/review.types';
export type { IAddress } from './types/address.types';
export type { IRefreshToken } from './types/auth.types';
export type { IAuditLog } from './types/audit-log.types';
export type { INotification } from './types/notification.types';
export type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from './types/common.types';
export type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  RefreshTokenInput,
} from './types/auth.types';
export type {
  CreateProductInput,
  UpdateProductInput,
} from './types/product.types';
export type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from './types/category.types';
export type { CreateOrderInput } from './types/order.types';
export type { CreateReviewInput } from './types/review.types';
export type {
  CreateAddressInput,
  UpdateAddressInput,
} from './types/address.types';

// ─── Constants ───
export {
  PAGINATION_DEFAULTS,
  TOKEN_EXPIRY,
} from './constants/index';

// ─── Chat Enums ───
export { ChatRoomStatus, MessageStatus, SenderRole } from './enums/chat.enum';

// ─── Chat Types ───
export type {
  IChatRoom,
  IChatRoomPopulated,
  IChatMessage,
  ChatAttachment,
  SendMessageInput,
  JoinChatInput,
} from './types/chat.types';

// ─── Chat Constants ───
export { CHAT_EVENTS, CHAT_DEFAULTS } from './constants/chat.constants';

// ─── Chat Schemas ───
export { sendMessageSchema, joinChatSchema } from './schemas/chat.schema';
export type { SendMessageSchemaType, JoinChatSchemaType } from './schemas/chat.schema';

// ─── API Endpoints ───
export { API_ENDPOINTS } from './api/endpoints';
