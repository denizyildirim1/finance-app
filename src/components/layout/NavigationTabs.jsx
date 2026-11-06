import React from 'react';
import { TIME_WINDOWS, TIME_WINDOW_LABELS } from '../../constants/config';

export const NavigationTabs = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: TIME_WINDOWS.CURRENT_DAY, label: TIME_WINDOW_LABELS[TIME_WINDOWS.CURRENT_DAY] },
    { id: TIME_WINDOWS.SEVEN_DAYS, label: TIME_WINDOW_LABELS[TIME_WINDOWS.SEVEN_DAYS] },
    { id: TIME_WINDOWS.QUARTER, label: TIME_WINDOW_LABELS[TIME_WINDOWS.QUARTER] }
  ];

  return (
    <nav className="tab-nav" aria-label="Dashboard time windows">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
            role="tab"
            aria-selected={isActive}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};
