export interface DashboardSummaryDTO {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export interface RevenueDataDTO {
  monthly: Array<{ month: string; revenue: number; orders: number }>;
  byPaymentMethod: Array<{ method: string; total: number; count: number }>;
  failedPaymentRate: { total: number; failed: number; rate: number };
}

export interface TopProductDTO {
  productId: string;
  name: string;
  totalSold: number;
  revenue: number;
}
