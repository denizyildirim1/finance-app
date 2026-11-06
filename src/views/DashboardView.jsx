import React from 'react';
import { TIME_WINDOWS } from '../constants/config';
import { CurrentDayView } from './CurrentDayView';
import { SevenDayView } from './SevenDayView';
import { QuarterView } from './QuarterView';
import { CustomCompanyView } from './CustomCompanyView';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const DashboardView = ({ activeTab, dataState }) => {
  const { quotes, historicalData, companies, loading, error, refresh } = dataState;

  // CustomCompanyView manages its own independent dynamic search state
  if (activeTab === TIME_WINDOWS.CUSTOM) {
    return <CustomCompanyView />;
  }

  if (loading) {
    return <LoadingSkeleton count={5} />;
  }

  if (error) {
    return (
      <div className="error-card" role="alert">
        <h3>Unable to load market data</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={refresh}>Retry Fetch</button>
      </div>
    );
  }

  switch (activeTab) {
    case TIME_WINDOWS.CURRENT_DAY:
      return <CurrentDayView quotes={quotes} companies={companies} />;
    case TIME_WINDOWS.SEVEN_DAYS:
      return <SevenDayView historicalData={historicalData} companies={companies} />;
    case TIME_WINDOWS.QUARTER:
      return <QuarterView historicalData={historicalData} companies={companies} />;
    default:
      return <CurrentDayView quotes={quotes} companies={companies} />;
  }
};
