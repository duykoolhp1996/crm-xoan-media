import React, { useState } from 'react';
import { SaasSidebar, SaasTab } from './SaasSidebar';
import { SaasHeader } from './SaasHeader';
import { SaasHeroSection } from './SaasHeroSection';
import { SaasKpiCards } from './SaasKpiCards';
import { SaasRevenueChart } from './SaasRevenueChart';
import { SaasSalesPerformance } from './SaasSalesPerformance';
import { SaasProductTable } from './SaasProductTable';
import { SaasSalesAnalytics } from './SaasSalesAnalytics';
import { SaasCustomerOverview } from './SaasCustomerOverview';
import { SaasActivityList } from './SaasActivityList';
import { SaasAddWidgetModal } from './SaasAddWidgetModal';
import { SaasCompareModal } from './SaasCompareModal';
import { SaasProModal } from './SaasProModal';
import { SAAS_KPI_METRICS } from '../../data/saasData';
import {
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Download,
  Filter,
  CheckCircle2,
  Boxes,
  Zap,
  ShieldAlert,
  Sliders,
  DollarSign
} from 'lucide-react';

interface SaasDashboardAppProps {
  onSwitchToCrm?: () => void;
}

export const SaasDashboardApp: React.FC<SaasDashboardAppProps> = ({ onSwitchToCrm }) => {
  const [activeTab, setActiveTab] = useState<SaasTab>('dashboard');
  const [dateFilter, setDateFilter] = useState('All Time (2024)');
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [customWidgets, setCustomWidgets] = useState<string[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleAddWidget = (title: string) => {
    if (!customWidgets.includes(title)) {
      setCustomWidgets(prev => [...prev, title]);
    }
  };

  return (
    <div className="relative flex h-screen saas-canvas overflow-hidden font-sans selection:bg-[#B8F23D]/60 selection:text-neutral-900">
      {/* Decorative Subtle Abstract Background Shapes */}
      <div className="saas-abstract-shape-1" aria-hidden="true" />
      <div className="saas-abstract-shape-2" aria-hidden="true" />

      {/* Floating Left Icon-Only Sidebar */}
      <SaasSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Top Header */}
        <SaasHeader
          activeTab={activeTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onOpenProModal={() => setIsProModalOpen(true)}
          onSwitchWorkspace={onSwitchToCrm}
        />

        {/* Scrollable Dashboard Viewport */}
        <main className="flex-1 overflow-y-auto px-6 sm:px-8 pb-10 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto space-y-6">
            {/* TAB: DASHBOARD (MAIN VIEW) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 1. Hero / Page Title */}
                <SaasHeroSection
                  activeFilter={dateFilter}
                  onFilterChange={setDateFilter}
                  onOpenCompare={() => setIsCompareOpen(true)}
                  onOpenAddWidget={() => setIsAddWidgetOpen(true)}
                />

                {/* 2. 4 Horizontal KPI Cards */}
                <SaasKpiCards metrics={SAAS_KPI_METRICS} />

                {/* 3. Main Analytics Area (2 Columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
                  {/* Left Column: Revenue Overview (8 cols) */}
                  <div className="lg:col-span-8">
                    <SaasRevenueChart />
                  </div>

                  {/* Right Column: Sales Performance (4 cols) */}
                  <div className="lg:col-span-4">
                    <SaasSalesPerformance />
                  </div>
                </div>

                {/* 4. Product Sales Performance Table */}
                <SaasProductTable />

                {/* 5. Bottom 3-Card Analytics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                  {/* Card 1: Sales Analytics */}
                  <div>
                    <SaasSalesAnalytics />
                  </div>

                  {/* Card 2: Customer Overview */}
                  <div>
                    <SaasCustomerOverview />
                  </div>

                  {/* Card 3: Recent Activity Panel */}
                  <div>
                    <SaasActivityList />
                  </div>
                </div>

                {/* 6. Dynamic Custom Added Widgets */}
                {customWidgets.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#83c906]" />
                        Custom Operational Widgets
                      </h3>
                      <button
                        onClick={() => setCustomWidgets([])}
                        className="text-xs text-neutral-400 hover:text-neutral-700"
                      >
                        Reset layout
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {customWidgets.map((title) => (
                        <div key={title} className="saas-card p-6 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-neutral-900">{title}</span>
                            <span className="saas-lime-badge text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          </div>
                          <div className="h-36 flex items-center justify-center text-xs text-neutral-400 border border-dashed border-black/[0.08] rounded-2xl my-4 bg-neutral-50/50">
                            Telemetry streaming live data for {title}...
                          </div>
                          <div className="text-[11px] text-neutral-500 flex justify-between">
                            <span>Status: Connected</span>
                            <span>Latency: 24ms</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900">Analytics Intelligence</h1>
                    <p className="text-xs text-neutral-500 mt-1">Deep-dive financial and conversion funnel diagnostics</p>
                  </div>
                  <button className="px-4 py-2 bg-neutral-900 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8">
                    <SaasRevenueChart />
                  </div>
                  <div className="lg:col-span-4">
                    <SaasCustomerOverview />
                  </div>
                </div>

                <SaasSalesAnalytics />
              </div>
            )}

            {/* TAB: CUSTOMERS */}
            {activeTab === 'customers' && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900">Customer Base & Cohorts</h1>
                    <p className="text-xs text-neutral-500 mt-1">12,842 total accounts across 4 tiers</p>
                  </div>
                  <span className="saas-lime-badge text-xs font-bold px-3 py-1.5 rounded-full">
                    97.6% Retention Rate
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SaasCustomerOverview />
                  <SaasActivityList />
                </div>
              </div>
            )}

            {/* TAB: SALES */}
            {activeTab === 'sales' && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900">Sales Transactions</h1>
                    <p className="text-xs text-neutral-500 mt-1">8,426 successful transactions this cycle</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7">
                    <SaasSalesAnalytics />
                  </div>
                  <div className="lg:col-span-5">
                    <SaasSalesPerformance />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRODUCTS */}
            {activeTab === 'products' && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900">SaaS Products & Add-ons</h1>
                    <p className="text-xs text-neutral-500 mt-1">Manage catalog and SKU revenue contributions</p>
                  </div>
                </div>

                <SaasProductTable />
              </div>
            )}

            {/* TAB: CAMPAIGNS */}
            {activeTab === 'campaigns' && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-200">
                <div>
                  <h1 className="text-2xl font-extrabold text-neutral-900">Growth Campaigns</h1>
                  <p className="text-xs text-neutral-500 mt-1">Active outbound and inbound automation triggers</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { name: 'Summer Enterprise Inbound', leads: 420, roas: '4.8x', spend: '$3,200', active: true },
                    { name: 'Product Hunt Launch Blast', leads: 1850, roas: '6.2x', spend: '$1,500', active: true },
                    { name: 'Developer Community Retargeting', leads: 310, roas: '3.4x', spend: '$900', active: false }
                  ].map((camp) => (
                    <div key={camp.name} className="saas-card p-6 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-neutral-900">{camp.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          camp.active ? 'saas-lime-badge' : 'bg-neutral-100 text-neutral-500'
                        }`}>
                          {camp.active ? 'Running' : 'Paused'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 my-4 py-3 bg-neutral-50 rounded-xl text-center text-xs">
                        <div>
                          <span className="text-[10px] text-neutral-400">Leads</span>
                          <p className="font-bold text-neutral-900 mt-0.5">{camp.leads}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400">ROAS</span>
                          <p className="font-bold text-emerald-600 mt-0.5">{camp.roas}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400">Spend</span>
                          <p className="font-bold text-neutral-900 mt-0.5">{camp.spend}</p>
                        </div>
                      </div>

                      <button className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs font-semibold text-neutral-800">
                        Edit Campaign
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: REPORTS */}
            {activeTab === 'reports' && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-extrabold text-neutral-900">Financial & Audit Reports</h1>
                    <p className="text-xs text-neutral-500 mt-1">Automated compliance, GAAP metrics and statements</p>
                  </div>
                  <button className="px-4 py-2 bg-neutral-900 text-white rounded-2xl text-xs font-bold flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" />
                    Download All Statements
                  </button>
                </div>

                <div className="saas-card p-6 space-y-4">
                  {[
                    { title: 'August 2024 Monthly Recurring Revenue (MRR) Statement', size: '2.4 MB', date: 'Aug 31, 2024' },
                    { title: 'Q2 2024 Consolidated Investor Metrics Package', size: '4.8 MB', date: 'Jun 30, 2024' },
                    { title: 'SOC 2 Type II Security & Access Audit Log', size: '1.1 MB', date: 'Jul 15, 2024' }
                  ].map((rep) => (
                    <div key={rep.title} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-neutral-50 border border-black/[0.04] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-700">
                          PDF
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900">{rep.title}</p>
                          <span className="text-[11px] text-neutral-400">{rep.date} • {rep.size}</span>
                        </div>
                      </div>
                      <button className="p-2 rounded-xl hover:bg-neutral-200 text-neutral-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 pt-4 animate-in fade-in duration-200">
                <div>
                  <h1 className="text-2xl font-extrabold text-neutral-900">Workspace Settings</h1>
                  <p className="text-xs text-neutral-500 mt-1">Configure telemetry, webhook endpoints and team permissions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="saas-card p-6 space-y-4">
                    <h2 className="text-sm font-bold text-neutral-900">Company Information</h2>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-neutral-500 font-medium">Workspace Name</label>
                        <input
                          type="text"
                          defaultValue="Acme SaaS Analytics"
                          className="w-full mt-1 px-3.5 py-2 bg-neutral-100/80 rounded-xl border border-black/[0.06] text-neutral-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                        />
                      </div>
                      <div>
                        <label className="text-neutral-500 font-medium">Primary Domain</label>
                        <input
                          type="text"
                          defaultValue="analytics.acme-saas.io"
                          className="w-full mt-1 px-3.5 py-2 bg-neutral-100/80 rounded-xl border border-black/[0.06] text-neutral-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#B8F23D]"
                        />
                      </div>
                      <button className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-bold text-xs">
                        Save Changes
                      </button>
                    </div>
                  </div>

                  <div className="saas-card p-6 space-y-4">
                    <h2 className="text-sm font-bold text-neutral-900">API & Webhooks</h2>
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 bg-neutral-50 rounded-xl border border-black/[0.04]">
                        <span className="text-[10px] text-neutral-400 font-mono">LIVE_KEY: sk_live_948274a92f8</span>
                        <p className="text-xs font-bold text-neutral-800 mt-0.5">Stripe Webhook Listener</p>
                      </div>
                      <div className="p-3 bg-neutral-50 rounded-xl border border-black/[0.04]">
                        <span className="text-[10px] text-neutral-400 font-mono">SEGMENT_KEY: seg_prod_00281</span>
                        <p className="text-xs font-bold text-neutral-800 mt-0.5">Segment Telemetry Stream</p>
                      </div>
                      <button className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs">
                        Generate New API Key
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <SaasAddWidgetModal
        isOpen={isAddWidgetOpen}
        onClose={() => setIsAddWidgetOpen(false)}
        onAddWidget={handleAddWidget}
      />

      <SaasCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />

      <SaasProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />

      {/* Quick Search Spotlight Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] p-4 flex items-start justify-center pt-24 animate-in fade-in duration-200">
          <div onClick={() => setIsSearchOpen(false)} className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md" />
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-black/[0.08] shadow-2xl p-4 z-10">
            <input
              type="text"
              autoFocus
              placeholder="Search metrics, products, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-100 rounded-2xl text-sm font-semibold focus:outline-none"
            />
            <div className="mt-3 py-2 text-xs text-neutral-400 text-center">
              Type to search in real-time or press ESC to close
            </div>
          </div>
        </div>
      )}

      {/* Quick Notification Drawer */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-200">
          <div onClick={() => setIsNotificationOpen(false)} className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
                <h3 className="font-extrabold text-sm text-neutral-900">Notifications</h3>
                <button onClick={() => setIsNotificationOpen(false)} className="text-xs text-neutral-400 hover:text-neutral-700">
                  Close
                </button>
              </div>
              <div className="space-y-3 mt-4 text-xs">
                <div className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.04]">
                  <p className="font-bold text-neutral-900">Monthly Revenue Goal Met</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">August revenue exceeded target plan by +18.6%.</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-2xl border border-black/[0.04]">
                  <p className="font-bold text-neutral-900">New Enterprise Sign-up</p>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Acme Corp signed annual contract for Cloud Analytics Pro.</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsNotificationOpen(false)} className="w-full py-2.5 bg-neutral-100 text-neutral-800 font-bold text-xs rounded-xl">
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
