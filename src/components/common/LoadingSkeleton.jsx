import React from 'react';

export const LoadingSkeleton = ({ count = 5 }) => {
  return (
    <div className="skeleton-grid" data-testid="loading-skeleton">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="skeleton-card">
          <div className="skeleton-line short" />
          <div className="skeleton-line large" />
          <div className="skeleton-line medium" />
        </div>
      ))}
    </div>
  );
};
