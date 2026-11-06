import React, { useState } from 'react';
import { TIME_WINDOWS } from './constants/config';
import { useMarketData } from './hooks/useMarketData';
import { Header } from './components/layout/Header';
import { NavigationTabs } from './components/layout/NavigationTabs';
import { DashboardView } from './views/DashboardView';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './App.css';

export function App() {
  const [activeTab, setActiveTab] = useState(TIME_WINDOWS.CURRENT_DAY);
  const dataState = useMarketData(activeTab);

  return (
    <div className="app-wrapper">
      <Header onRefresh={dataState.refresh} loading={dataState.loading} />
      <main className="app-container">
        <NavigationTabs activeTab={activeTab} onSelectTab={setActiveTab} />
        <ErrorBoundary>
          <DashboardView activeTab={activeTab} dataState={dataState} />
        </ErrorBoundary>
      </main>
      <footer className="app-footer">
        IBM Bob GitHub SDLC Automation Workshop — Finance Dashboard Demo
      </footer>
    </div>
  );
}

export default App;
