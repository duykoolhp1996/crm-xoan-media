import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { LoginPage } from './components/auth/LoginPage';

// Real CRM Modules
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { PhotographerDashboard } from './components/dashboard/PhotographerDashboard';
import { CustomerList } from './components/crm/CustomerList';
import { KanbanPipeline } from './components/pipeline/KanbanPipeline';
import { SchoolClassModule } from './components/schools/SchoolClassModule';
import { BookingModule } from './components/booking/BookingModule';
import { PhotoCalendar } from './components/calendar/PhotoCalendar';
import { PhotographerList } from './components/photographers/PhotographerList';
import { ServiceModule } from './components/services/ServiceModule';
import { PhotographerReports } from './components/reports/PhotographerReports';
import { SettingsModule } from './components/settings/SettingsModule';
import { TrashBinModal } from './components/crm/TrashBinModal';
import { CustomerDetail360 } from './components/crm/CustomerDetail360';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { IosPushBanner } from './components/common/IosPushBanner';
import { initGA4, trackPageView } from './lib/analytics';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, currentRole, selectedCustomerId, setSelectedCustomerId } = useApp();

  const isPhotographer = currentRole === 'photographer' || currentUser?.role === 'photographer';

  React.useEffect(() => {
    trackPageView(`/#${activeTab}`, `CRM Xoăn - ${activeTab}`);
  }, [activeTab]);

  const isNoOuterScroll = activeTab === 'pipeline' || activeTab === 'trash';

  return (
    <main className={`flex-1 ${isNoOuterScroll ? 'overflow-hidden flex flex-col min-h-0 p-2 sm:p-4 lg:p-5 pb-20 lg:pb-5' : 'overflow-y-auto p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 custom-scrollbar overscroll-contain'}`}>
      <div className={`${isNoOuterScroll ? 'w-full h-full flex flex-col min-h-0' : 'max-w-7xl mx-auto space-y-6'}`}>
        {activeTab === 'dashboard' && (isPhotographer ? <PhotographerDashboard /> : <ExecutiveDashboard />)}
        {(activeTab === 'customers' || activeTab === 'leads') && <CustomerList />}
        {activeTab === 'pipeline' && <KanbanPipeline />}
        {activeTab === 'trash' && (
          <>
            <KanbanPipeline />
            <TrashBinModal isOpen={true} onClose={() => setActiveTab('pipeline')} />
          </>
        )}
        {activeTab === 'schools' && <SchoolClassModule />}
        {activeTab === 'bookings' && <BookingModule />}
        {activeTab === 'calendar' && <PhotoCalendar />}
        {activeTab === 'photographers' && <PhotographerList />}
        {activeTab === 'services' && <ServiceModule />}
        {activeTab === 'reports-photographer' && <PhotographerReports />}
        {activeTab === 'settings' && <SettingsModule />}

        {/* Global Customer 360 Detail Modal: Hiển thị khi đang ở Calendar, Bookings hoặc Dashboard */}
        {!['customers', 'leads', 'pipeline', 'schools'].includes(activeTab) && selectedCustomerId && (
          <CustomerDetail360
            customerId={selectedCustomerId}
            onClose={() => setSelectedCustomerId(null)}
          />
        )}
      </div>
    </main>
  );
};

const CrmAppShell: React.FC = () => {
  return (
    <div className="relative flex h-screen bg-[#F4FBE8] text-neutral-900 overflow-hidden font-sans selection:bg-[#B8F23D]/60 selection:text-neutral-900">
      {/* Spatial Ambient Glow Layer */}
      <div className="ambient-glow" aria-hidden="true" />

      {/* Soft Glassmorphism Sidebar with all CRM Buttons */}
      <Sidebar />

      {/* Main Application Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
        <Header />
        <MainContent />
      </div>

      {/* Global Search Modal (Cmd+K) */}
      <GlobalSearchModal />

      {/* Mobile Bottom Navigation Bar (iOS / Android App Style) */}
      <MobileBottomNav />

      {/* iOS Push Notification Banner (Dynamic Island Style) */}
      <IosPushBanner />
    </div>
  );
};

const AppShellRouter: React.FC = () => {
  const { isAuthenticated } = useApp();

  // Nếu chưa đăng nhập -> hiển thị màn hình Login
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Luôn ở App CRM Xoăn Media
  return <CrmAppShell />;
};

export const App: React.FC = () => {
  React.useEffect(() => {
    initGA4();
  }, []);

  return (
    <AppProvider>
      <AppShellRouter />
    </AppProvider>
  );
};

export default App;
