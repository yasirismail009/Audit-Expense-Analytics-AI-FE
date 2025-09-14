// Modern audit and anomaly detection color scheme with purple theme
export const colorScheme = {
  // Primary colors - Purple theme for audit and anomaly detection
  primary: '#925A9B', // Purple for trust and reliability
  primaryDark: '#7B4A82', // Darker purple
  secondary: '#A67BB0', // Light purple for secondary elements
  accent: '#7A4A82', // Dark purple for accents
  
  // Audit status colors - using purple shades
  auditColors: [
    '#925A9B', // Primary Purple
    '#A67BB0', // Light Purple
    '#7A4A82', // Dark Purple
    '#5A3A62', // Very Dark Purple
    '#B88BC4', // Very Light Purple
    '#8B5A95', // Medium Purple
    '#C49BD0', // Lightest Purple
    '#6B4A72', // Darker Purple
    '#A67BB3', // Light Purple
    '#9A6BA3'  // Medium Light Purple
  ],
  
  // Chart colors for anomaly detection - using purple shades
  chartColors: [
    '#925A9B', // Primary Purple
    '#A67BB0', // Light Purple
    '#7A4A82', // Dark Purple
    '#5A3A62', // Very Dark Purple
    '#B88BC4', // Very Light Purple
    '#8B5A95', // Medium Purple
    '#C49BD0', // Lightest Purple
    '#6B4A72', // Darker Purple
    '#A67BB3', // Light Purple
    '#9A6BA3'  // Medium Light Purple
  ],
  
  // Risk level colors for anomaly detection - using purple shades
  riskColors: {
    LOW: '#A67BB0', // Light purple
    MEDIUM: '#925A9B', // Purple
    HIGH: '#7A4A82', // Dark purple
    CRITICAL: '#5A3A62' // Very dark purple
  },
  
  // Audit test status colors - using purple shades
  testStatusColors: {
    PASSED: '#925A9B', // Purple
    FAILED: '#7A4A82', // Dark purple
    WARNING: '#A67BB0', // Light purple
    PENDING: '#666666', // Dark gray
    RUNNING: '#925A9B' // Purple
  },
  
  // Background colors
  background: '#F8FAFC', // Light gray-blue
  cardBackground: '#FFFFFF',
  sidebarBackground: '#F1F5F9',
  
  // Text colors - darker shades
  textPrimary: '#2b2b2b', // Custom black for main text
  textSecondary: '#2D2D2D', // Dark gray for secondary text
  textMuted: '#404040', // Medium dark gray for muted text
  
  // Border colors - darker shades
  border: '#666666',
  borderLight: '#999999',
  
  // Status colors - all using main purple
  success: '#925A9B', // Purple
  error: '#925A9B', // Purple
  warning: '#925A9B', // Purple
  info: '#925A9B', // Purple
  
  // Anomaly detection specific colors - using purple shades
  anomalyColors: {
    normal: '#925A9B', // Purple
    suspicious: '#A67BB0', // Light purple
    fraudulent: '#7A4A82', // Dark purple
    unknown: '#666666' // Dark gray
  }
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