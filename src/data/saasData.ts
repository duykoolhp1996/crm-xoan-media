export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  rawValue: number;
  change: string;
  isPositive: boolean;
  sparkline: number[];
  accentColor?: string;
  iconName: 'dollar' | 'shopping-bag' | 'users' | 'trending-up';
}

export interface RevenueMonthlyData {
  month: string;
  revenue: number;
  previousPeriod: number;
  target: number;
}

export interface ProductPerformanceItem {
  id: string;
  name: string;
  category: string;
  image: string;
  revenue: string;
  revenueValue: number;
  unitsSold: number;
  growth: string;
  progressPercent: number;
  status: 'top' | 'growing' | 'stable';
}

export interface SalesPeriodData {
  timeLabel: string;
  sales: number;
  orders: number;
  aov: number; // Average Order Value
}

export interface CustomerSegmentData {
  name: string;
  value: number;
  count: number;
  color: string;
}

export interface ActivityEvent {
  id: string;
  type: 'order' | 'customer' | 'campaign' | 'system';
  title: string;
  subtitle: string;
  avatar: string;
  avatarBg: string;
  timestamp: string;
  badge?: string;
  amount?: string;
}

export const SAAS_KPI_METRICS: KpiMetric[] = [
  {
    id: 'kpi-revenue',
    label: 'Revenue',
    value: '$278,860',
    rawValue: 278860,
    change: '+18.6%',
    isPositive: true,
    sparkline: [38, 42, 40, 52, 48, 62, 58, 74, 82],
    accentColor: '#B8F23D',
    iconName: 'dollar'
  },
  {
    id: 'kpi-sales',
    label: 'Total Sales',
    value: '8,426',
    rawValue: 8426,
    change: '+12.4%',
    isPositive: true,
    sparkline: [22, 28, 25, 34, 39, 44, 52, 60, 68],
    iconName: 'shopping-bag'
  },
  {
    id: 'kpi-customers',
    label: 'Active Customers',
    value: '12,842',
    rawValue: 12842,
    change: '+8.2%',
    isPositive: true,
    sparkline: [45, 48, 52, 50, 58, 63, 70, 78, 85],
    iconName: 'users'
  },
  {
    id: 'kpi-conversion',
    label: 'Conversion Rate',
    value: '24.8%',
    rawValue: 24.8,
    change: '+4.6%',
    isPositive: true,
    sparkline: [18, 19, 21, 20, 23, 22, 24, 25, 24.8],
    accentColor: '#B8F23D',
    iconName: 'trending-up'
  }
];

export const SAAS_REVENUE_CHART_DATA: RevenueMonthlyData[] = [
  { month: 'Jan', revenue: 145000, previousPeriod: 118000, target: 150000 },
  { month: 'Feb', revenue: 168000, previousPeriod: 132000, target: 160000 },
  { month: 'Mar', revenue: 195000, previousPeriod: 154000, target: 180000 },
  { month: 'Apr', revenue: 215000, previousPeriod: 178000, target: 200000 },
  { month: 'May', revenue: 242000, previousPeriod: 196000, target: 230000 },
  { month: 'Jun', revenue: 228000, previousPeriod: 210000, target: 240000 },
  { month: 'Jul', revenue: 265000, previousPeriod: 224000, target: 260000 },
  { month: 'Aug', revenue: 278860, previousPeriod: 235000, target: 275000 }
];

export const SAAS_SALES_PERFORMANCE = {
  totalFormatted: '$610.27K',
  totalRaw: 610270,
  growth: '+18.2%',
  categories: [
    { name: 'Enterprise Cloud', value: 42, amount: '$256.3K', color: '#111827' },
    { name: 'AI SaaS Platform', value: 28, amount: '$170.8K', color: '#B8F23D' },
    { name: 'API Subscriptions', value: 18, amount: '$109.8K', color: '#94a3b8' },
    { name: 'Custom Add-ons', value: 12, amount: '$73.2K', color: '#cbd5e1' }
  ]
};

export const SAAS_PRODUCTS: ProductPerformanceItem[] = [
  {
    id: 'prod-1',
    name: 'Cloud Analytics Pro',
    category: 'SaaS Platform',
    image: '⚡',
    revenue: '$118,450',
    revenueValue: 118450,
    unitsSold: 3420,
    growth: '+24.5%',
    progressPercent: 88,
    status: 'top'
  },
  {
    id: 'prod-2',
    name: 'AI Automation Core',
    category: 'Machine Learning',
    image: '🤖',
    revenue: '$84,200',
    revenueValue: 84200,
    unitsSold: 2180,
    growth: '+18.2%',
    progressPercent: 74,
    status: 'top'
  },
  {
    id: 'prod-3',
    name: 'DevFlow Orchestrator',
    category: 'Developer Tools',
    image: '🔄',
    revenue: '$46,310',
    revenueValue: 46310,
    unitsSold: 1450,
    growth: '+12.6%',
    progressPercent: 58,
    status: 'growing'
  },
  {
    id: 'prod-4',
    name: 'Customer 360 CDP',
    category: 'Data Infrastructure',
    image: '📊',
    revenue: '$21,900',
    revenueValue: 21900,
    unitsSold: 890,
    growth: '+8.4%',
    progressPercent: 42,
    status: 'growing'
  },
  {
    id: 'prod-5',
    name: 'Security Shield Enterprise',
    category: 'Cybersecurity',
    image: '🛡️',
    revenue: '$8,000',
    revenueValue: 8000,
    unitsSold: 486,
    growth: '+5.1%',
    progressPercent: 30,
    status: 'stable'
  }
];

export const SAAS_SALES_ANALYTICS: Record<'day' | 'week' | 'month', SalesPeriodData[]> = {
  day: [
    { timeLabel: '00:00', sales: 4200, orders: 38, aov: 110 },
    { timeLabel: '04:00', sales: 2100, orders: 19, aov: 110 },
    { timeLabel: '08:00', sales: 8900, orders: 74, aov: 120 },
    { timeLabel: '12:00', sales: 16500, orders: 132, aov: 125 },
    { timeLabel: '16:00', sales: 22400, orders: 168, aov: 133 },
    { timeLabel: '20:00', sales: 14200, orders: 112, aov: 126 }
  ],
  week: [
    { timeLabel: 'Mon', sales: 34200, orders: 280, aov: 122 },
    { timeLabel: 'Tue', sales: 42500, orders: 340, aov: 125 },
    { timeLabel: 'Wed', sales: 48900, orders: 385, aov: 127 },
    { timeLabel: 'Thu', sales: 52100, orders: 405, aov: 128 },
    { timeLabel: 'Fri', sales: 58400, orders: 442, aov: 132 },
    { timeLabel: 'Sat', sales: 24800, orders: 195, aov: 127 },
    { timeLabel: 'Sun', sales: 17960, orders: 145, aov: 123 }
  ],
  month: [
    { timeLabel: 'Week 1', sales: 62400, orders: 490, aov: 127 },
    { timeLabel: 'Week 2', sales: 68900, orders: 535, aov: 128 },
    { timeLabel: 'Week 3', sales: 74200, orders: 570, aov: 130 },
    { timeLabel: 'Week 4', sales: 73360, orders: 565, aov: 129 }
  ]
};

export const SAAS_CUSTOMER_SEGMENTS: CustomerSegmentData[] = [
  { name: 'New Customers', value: 48, count: 6164, color: '#B8F23D' },
  { name: 'Returning', value: 36, count: 4623, color: '#111827' },
  { name: 'Churned', value: 16, count: 2055, color: '#cbd5e1' }
];

export const SAAS_CUSTOMER_METRICS = {
  total: 12842,
  newCount: 6164,
  returningCount: 4623,
  churnRate: '2.4%',
  clv: '$1,420'
};

export const SAAS_RECENT_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'act-1',
    type: 'order',
    title: 'Order #12482',
    subtitle: 'John Doe purchased Cloud Analytics Pro (Annual)',
    avatar: 'JD',
    avatarBg: 'bg-neutral-900 text-[#B8F23D]',
    timestamp: '2 mins ago',
    amount: '+$1,180'
  },
  {
    id: 'act-2',
    type: 'order',
    title: 'Order #12481',
    subtitle: 'Sarah Jenkins purchased DevFlow Orchestrator',
    avatar: 'SJ',
    avatarBg: 'bg-neutral-100 text-neutral-800 border border-neutral-300',
    timestamp: '14 mins ago',
    amount: '+$490'
  },
  {
    id: 'act-3',
    type: 'customer',
    title: 'New Enterprise Customer',
    subtitle: 'Michael Ross from Acme Corp created a team workspace',
    avatar: 'MR',
    avatarBg: 'bg-[#B8F23D]/30 text-neutral-900 border border-[#B8F23D]',
    timestamp: '32 mins ago',
    badge: 'Enterprise'
  },
  {
    id: 'act-4',
    type: 'campaign',
    title: 'Summer Growth Campaign',
    subtitle: 'Automated workflow generated $12,840 in pipeline',
    avatar: '⚡',
    avatarBg: 'bg-amber-100 text-amber-700',
    timestamp: '1 hour ago',
    amount: '+$12,840'
  },
  {
    id: 'act-5',
    type: 'order',
    title: 'Order #12479',
    subtitle: 'Elena Rostova upgraded to AI Automation Core',
    avatar: 'ER',
    avatarBg: 'bg-neutral-900 text-white',
    timestamp: '2 hours ago',
    amount: '+$840'
  }
];
