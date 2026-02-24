import { useCustom } from '@refinedev/core';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';

const CHART_COLORS = ['#7d4a25', '#b07535', '#cda876', '#e0c9a9', '#9a5f2b'];

interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
}

interface RevenueData {
  monthly: Array<{ month: string; revenue: number; orders: number }>;
  byPaymentMethod: Array<{ method: string; total: number; count: number }>;
  failedPaymentRate: { total: number; failed: number; rate: number };
}

interface OrderStatusCount {
  status: string;
  count: number;
}

interface TopProduct {
  productId: string;
  name: string;
  totalSold: number;
  revenue: number;
}

export function DashboardPage() {
  const { data: summaryData } = useCustom<DashboardSummary>({
    url: '/api/v1/analytics/dashboard',
    method: 'get',
  });

  const { data: revenueData } = useCustom<RevenueData>({
    url: '/api/v1/analytics/revenue',
    method: 'get',
  });

  const { data: statusData } = useCustom<OrderStatusCount[]>({
    url: '/api/v1/analytics/order-status',
    method: 'get',
  });

  const { data: topProductsData } = useCustom<TopProduct[]>({
    url: '/api/v1/analytics/top-products',
    method: 'get',
  });

  const summary = summaryData?.data as unknown as DashboardSummary | undefined;
  const revenue = revenueData?.data as unknown as RevenueData | undefined;
  const monthlyRevenue = revenue?.monthly || [];
  const paymentMethods = revenue?.byPaymentMethod || [];
  const orderStatus = (statusData?.data as unknown as OrderStatusCount[]) || [];
  const topProducts = (topProductsData?.data as unknown as TopProduct[]) || [];

  const revenueChart = monthlyRevenue.map((m) => ({
    month: m.month,
    revenue: m.revenue,
    orders: m.orders,
  }));

  const statCards = [
    { label: 'Total Revenue', value: `Rs. ${(summary?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600 bg-green-100' },
    { label: 'Total Orders', value: summary?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-600 bg-blue-100' },
    { label: 'Products', value: summary?.totalProducts || 0, icon: Package, color: 'text-purple-600 bg-purple-100' },
    { label: 'Users', value: summary?.totalUsers || 0, icon: Users, color: 'text-primary-600 bg-primary-100' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#7d4a25" strokeWidth={2} dot={{ r: 4 }} name="Revenue (Rs.)" />
                <Line type="monotone" dataKey="orders" stroke="#b07535" strokeWidth={2} dot={{ r: 4 }} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatus.map((s) => ({ name: s.status, value: s.count }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {orderStatus.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  fontSize={12}
                  width={120}
                  tick={{ fill: '#374151' }}
                />
                <Tooltip />
                <Bar dataKey="totalSold" fill="#7d4a25" radius={[0, 4, 4, 0]} name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods.map((p) => ({ name: p.method, value: p.count }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {paymentMethods.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
