import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Modules
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { CustomerList } from './components/crm/CustomerList';
import { KanbanPipeline } from './components/pipeline/KanbanPipeline';
import { SchoolClassModule } from './components/schools/SchoolClassModule';
import { BookingModule } from './components/booking/BookingModule';
import { PhotoCalendar } from './components/calendar/PhotoCalendar';
import { PhotographerList } from './components/photographers/PhotographerList';
import { ServiceModule } from './components/services/ServiceModule';
import { FeedbackModule } from './components/feedback/FeedbackModule';
import { RemarketingModule } from './components/remarketing/RemarketingModule';
import { MarketingReports } from './components/reports/MarketingReports';
import { PhotographerReports } from './components/reports/PhotographerReports';
import { SettingsModule } from './components/settings/SettingsModule';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-6">
        {activeTab === 'dashboard' && <ExecutiveDashboard />}
        {(activeTab === 'customers' || activeTab === 'leads') && <CustomerList />}
        {activeTab === 'pipeline' && <KanbanPipeline />}
        {activeTab === 'schools' && <SchoolClassModule />}
        {activeTab === 'bookings' && <BookingModule />}
        {activeTab === 'calendar' && <PhotoCalendar />}
        {activeTab === 'photographers' && <PhotographerList />}
        {activeTab === 'services' && <ServiceModule />}
        {activeTab === 'feedbacks' && <FeedbackModule />}
        {activeTab === 'remarketing' && <RemarketingModule />}
        {activeTab === 'reports-marketing' && <MarketingReports />}
        {activeTab === 'reports-photographer' && <PhotographerReports />}
        {activeTab === 'settings' && <SettingsModule />}
      </div>
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="relative flex h-screen bg-[#08090c] text-neutral-100 overflow-hidden font-sans selection:bg-orange-500/30 selection:text-orange-200">
        {/* Spatial Ambient Glow Layer */}
        <div className="ambient-glow" aria-hidden="true" />

        {/* Apple-styled Glass Sidebar */}
        <Sidebar />

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <MainContent />
        </div>

        {/* Global Search Modal (Cmd+K) */}
        <GlobalSearchModal />
      </div>
    </AppProvider>
  );
};

export default App;
