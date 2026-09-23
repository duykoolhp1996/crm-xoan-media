import React, { useState } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  CreditCard,
  Package,
  Megaphone,
  FileText,
  Settings,
  Bell,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

export type SaasTab =
  | 'dashboard'
  | 'analytics'
  | 'customers'
  | 'sales'
  | 'products'
  | 'campaigns'
  | 'reports'
  | 'settings';

interface SaasSidebarProps {
  activeTab: SaasTab;
  onSelectTab: (tab: SaasTab) => void;
  onOpenNotifications?: () => void;
}

interface NavItem {
  id: SaasTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'sales', label: 'Sales', icon: CreditCard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export const SaasSidebar: React.FC<SaasSidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNotifications
}) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  return (
    <aside className="w-[72px] shrink-0 flex flex-col items-center py-5 select-none z-30">
      {/* Floating Glass Shell */}
      <div className="w-[66px] h-full flex flex-col items-center justify-between py-4 saas-sidebar-glass rounded-[28px]">
        {/* Brand Logo */}
        <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-[#B8F23D] flex items-center justify-center font-black text-lg shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-transform duration-200 group-hover:scale-105">
            ✦
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-2.5 my-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div
                key={item.id}
                className="relative flex items-center justify-center"
                onMouseEnter={() => setHoveredTab(item.id)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                <button
                  onClick={() => onSelectTab(item.id)}
                  aria-label={item.label}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? 'bg-neutral-900 text-[#B8F23D] shadow-[0_6px_18px_rgba(0,0,0,0.18)] scale-105'
                      : 'text-neutral-400 hover:text-neutral-800 hover:bg-black/[0.04]'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                </button>

                {/* Lime Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -left-1.5 w-1 h-3.5 bg-[#B8F23D] rounded-full shadow-[0_0_8px_#B8F23D]" />
                )}

                {/* Minimal Apple-style Tooltip */}
                {hoveredTab === item.id && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-900 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none animate-in fade-in slide-in-from-left-1 duration-150">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={onOpenNotifications}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-neutral-400 hover:text-neutral-800 hover:bg-black/[0.04] transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4 stroke-[1.8]" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#B8F23D] ring-2 ring-white" />
            </button>
          </div>

          {/* User Avatar */}
          <div
            className="w-10 h-10 rounded-2xl overflow-hidden p-0.5 border border-black/[0.08] hover:border-black/20 transition-all cursor-pointer shadow-sm"
            title="User Profile"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="User"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
