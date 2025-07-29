// Consistent color scheme for all charts
export const colorScheme = {
  // Primary colors
  primary: '#925A9B',
  secondary: '#36A2EB',
  accent: '#FFCE56',
  
  // Chart colors
  chartColors: [
    '#925A9B', // Purple (Primary)
    '#36A2EB', // Blue
    '#FFCE56', // Yellow
    '#FF9F40', // Orange
    '#FF6384', // Pink
    '#9966FF', // Purple
    '#4BC0C0', // Cyan
    '#FF9F40', // Orange
    '#C9CBCF', // Gray
    '#4BC0C0', // Light Teal
  ],
  
  // Risk level colors
  riskColors: {
    LOW: '#4BC0C0',
    MEDIUM: '#FFCE56',
    HIGH: '#FF9F40',
    CRITICAL: '#FF6384'
  },
  
  // Background colors
  background: '#f4f6fa',
  cardBackground: '#ffffff',
  
  // Text colors
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
  
  // Border colors
  border: '#e0e0e0',
  
  // Success/Error colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3'
};

// Get color by index with fallback
export const getColorByIndex = (index) => {
  return colorScheme.chartColors[index % colorScheme.chartColors.length];
};

// Get risk color
export const getRiskColor = (riskLevel) => {
  return colorScheme.riskColors[riskLevel?.toUpperCase()] || colorScheme.riskColors.LOW;
};

// Shared currency formatting function
export const formatCurrency = (amount) => {
  const num = parseFloat(amount || 0);
  
  if (num >= 1000000000000) {
    return `${(num / 1000000000000).toFixed(1)}T SAR`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M SAR`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K SAR`;
  } else {
    return `${num.toFixed(0)} SAR`;
  }
}; 