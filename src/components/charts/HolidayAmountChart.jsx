import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function HolidayAmountChart({ data, currency = 'SAR' }) {
  // Helper function to format currency
  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    
    if (num >= 1000000000000) {
      return `${(num / 1000000000000).toFixed(1)}T ${currency}`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M ${currency}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K ${currency}`;
    } else {
      return `${num.toFixed(0)} ${currency}`;
    }
  };

  // Check for holiday data structure
  const chartData = data?.visualizations?.chart_data?.holiday_amount_distribution;

  if (!data || !chartData || !chartData.labels || !chartData.data) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Holiday Amount Distribution</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No holiday amount data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Transform data for holiday structure
  const transformedData = chartData.labels.map((range, index) => ({
    name: range,
    value: chartData.data[index] || 0,
    totalAmount: 0, // Will be calculated from holiday entries
    totalTransactions: chartData.data[index] || 0
  }));
  
  // Calculate amounts from holiday entries if available
  const holidayEntries = data?.detailed_results?.holiday_postings || [];
  if (holidayEntries.length > 0) {
    transformedData.forEach(item => {
      // Parse the amount range from the label (e.g., "1M-10M SAR")
      const rangeMatch = item.name.match(/(\d+)M-(\d+)M SAR/);
      if (rangeMatch) {
        const minAmount = parseInt(rangeMatch[1]) * 1000000;
        const maxAmount = parseInt(rangeMatch[2]) * 1000000;
        
        const rangeHolidays = holidayEntries.filter(entry => {
          const amount = entry.amount || 0;
          return amount >= minAmount && amount <= maxAmount;
        });
        
        item.totalAmount = rangeHolidays.reduce((sum, entry) => 
          sum + (entry.amount || 0), 0
        );
      }
    });
  }

  // Generate gradient colors based on purple theme
  const generateGradientColors = (count) => {
    const purpleColors = [
      '#8B5CF6', // Primary Purple
      '#A855F7', // Secondary Purple
      '#C084FC', // Light Purple
      '#DDD6FE', // Very Light Purple
      '#7C3AED', // Dark Purple
      '#9333EA', // Medium Purple
      '#A78BFA', // Medium Light Purple
      '#EDE9FE', // Pale Purple
      '#6D28D9', // Dark Purple
      '#5B21B6'  // Deep Purple
    ];
    
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(purpleColors[i % purpleColors.length]);
    }
    return colors;
  };

  const segmentColors = generateGradientColors(transformedData.length);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ 
          backgroundColor: 'white', 
          border: '1px solid #ccc', 
          borderRadius: 2, 
          p: 2,
          boxShadow: 2
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Count: {data.value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: {formatCurrency(data.totalAmount)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transactions: {data.totalTransactions}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Holiday Amount Distribution</Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={transformedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {transformedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={segmentColors[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: '#666', fontSize: '12px' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
} 