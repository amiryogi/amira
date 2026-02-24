import { AnalyticsRepository } from './analytics.repository.js';
import type { DashboardSummaryDTO, RevenueDataDTO, TopProductDTO } from './analytics.dto.js';

export class AnalyticsService {
  private analyticsRepo: AnalyticsRepository;

  constructor() {
    this.analyticsRepo = new AnalyticsRepository();
  }

  async getDashboard(): Promise<DashboardSummaryDTO> {
    return this.analyticsRepo.getDashboardSummary();
  }

  async getRevenue(months: number): Promise<RevenueDataDTO> {
    const [monthly, byPaymentMethod, failedPaymentRate] = await Promise.all([
      this.analyticsRepo.getRevenueByMonth(months),
      this.analyticsRepo.getRevenueByPaymentMethod(),
      this.analyticsRepo.getFailedPaymentRate(),
    ]);

    return { monthly, byPaymentMethod, failedPaymentRate };
  }

  async getTopProducts(limit: number): Promise<TopProductDTO[]> {
    return this.analyticsRepo.getTopProducts(limit);
  }

  async getOrderStatusBreakdown(): Promise<Array<{ status: string; count: number }>> {
    return this.analyticsRepo.getOrderStatusCounts();
  }
}
