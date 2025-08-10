// Consistent color scheme for all charts
export const colorScheme = {
  // Primary colors
  primary: '#925A9B',
  secondary: '#36A2EB',
  accent: '#FFCE56',
  
  // Purple shades for unusual days charts
  purpleShades: [
    '#925A9B', // Primary Purple
    '#7B4A82', // Darker Purple
    '#A67BB3', // Lighter Purple
    '#8E6C95', // Medium Purple
    '#B894C4', // Very Light Purple
    '#6B3E72', // Very Dark Purple
    '#C4A5D1', // Pale Purple
    '#5A2E61', // Deep Purple
    '#D1B8DC', // Lightest Purple
    '#4A1F50'  // Darkest Purple
  ],
  
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
export const getColorByIndex= (index) => {
  return colorScheme.chartColors[index % colorScheme.chartColors.length];
};

// Get purple shade by index
export const getPurpleShade = (index) => {
  return colorScheme.purpleShades[index % colorScheme.purpleShades.length];
};

// Get risk color
export const getRiskColor = (riskLevel) => {
  return colorScheme.riskColors[riskLevel?.toUpperCase()] || colorScheme.riskColors.LOW;
};

// Shared currency formatting function
export const formatCurrency = (amount, currency = 'SAR') => {
  const num = parseFloat(amount || 0);
  
  if (num >= 1000000000000) {
    return `${(num / 1000000000000).toFixed(1)}T ${currency}`;
  } else if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B ${currency}`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M ${currency}`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K ${currency}`;
  } else {
    return `${num.toFixed(0)} ${currency}`;
  }
}; 