import React from 'react';

const StatsCard = ({ title, value, icon, color, change }) => {
  // Ensure value is a number or string, not an object
  const displayValue = typeof value === 'object' ? value.total || value.count || 0 : value;
  
  return (
    <div className="stats-card" style={{ borderLeftColor: color }}>
      <div className="stats-card-content">
        <div>
          <p className="stats-title">{title}</p>
          <h3 className="stats-value">{displayValue}</h3>
          {change && (
            <p className={`stats-change ${change > 0 ? 'positive' : 'negative'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className="stats-icon" style={{ color }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;