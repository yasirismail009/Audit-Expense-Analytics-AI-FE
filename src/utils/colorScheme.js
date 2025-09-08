// Modern audit and anomaly detection color scheme
export const colorScheme = {
  // Primary colors - Professional audit theme
  primary: '#1E40AF', // Deep blue for trust and reliability
  primaryDark: '#1E3A8A', // Darker blue
  secondary: '#059669', // Green for success/approved
  accent: '#DC2626', // Red for alerts/critical
  
  // Audit status colors
  auditColors: [
    '#1E40AF', // Primary Blue
    '#059669', // Success Green
    '#DC2626', // Critical Red
    '#D97706', // Warning Orange
    '#7C3AED', // Purple
    '#0891B2', // Cyan
    '#BE185D', // Pink
    '#65A30D', // Lime
    '#9333EA', // Violet
    '#EA580C'  // Orange
  ],
  
  // Chart colors for anomaly detection
  chartColors: [
    '#1E40AF', // Primary Blue
    '#059669', // Success Green
    '#DC2626', // Critical Red
    '#D97706', // Warning Orange
    '#7C3AED', // Purple
    '#0891B2', // Cyan
    '#BE185D', // Pink
    '#65A30D', // Lime
    '#9333EA', // Violet
    '#EA580C'  // Orange
  ],
  
  // Risk level colors for anomaly detection
  riskColors: {
    LOW: '#059669', // Green
    MEDIUM: '#D97706', // Orange
    HIGH: '#DC2626', // Red
    CRITICAL: '#7C2D12' // Dark red
  },
  
  // Audit test status colors
  testStatusColors: {
    PASSED: '#059669', // Green
    FAILED: '#DC2626', // Red
    WARNING: '#D97706', // Orange
    PENDING: '#6B7280', // Gray
    RUNNING: '#1E40AF' // Blue
  },
  
  // Background colors
  background: '#F8FAFC', // Light gray-blue
  cardBackground: '#FFFFFF',
  sidebarBackground: '#F1F5F9',
  
  // Text colors
  textPrimary: '#0F172A', // Dark slate
  textSecondary: '#64748B', // Slate gray
  textMuted: '#94A3B8', // Light slate
  
  // Border colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // Status colors
  success: '#059669', // Green
  error: '#DC2626', // Red
  warning: '#D97706', // Orange
  info: '#1E40AF', // Blue
  
  // Anomaly detection specific colors
  anomalyColors: {
    normal: '#059669', // Green
    suspicious: '#D97706', // Orange
    fraudulent: '#DC2626', // Red
    unknown: '#6B7280' // Gray
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