import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DuplicateAmountChart({ data, currency = 'SAR' }) {
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

  // Check for new data structure first, then fallback to old structure
  const chartData = data?.chart_data?.duplicate_amount_distribution || data?.duplicates;

  if (!data || !chartData || (Array.isArray(chartData) && chartData.length === 0)) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Duplicate Amount Distribution</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No duplicate amount data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Transform data based on structure
  let transformedData;
  if (chartData.labels && chartData.data) {
    // New structure: chart_data.duplicate_amount_distribution has labels and data arrays
    transformedData = chartData.labels.map((label, index) => ({
      name: label,
      value: chartData.data[index] || 0,
      totalAmount: 0, // Will be calculated from duplicate entries
      totalTransactions: (chartData.data[index] || 0) * 2
    }));
    
    // Calculate amounts from duplicate entries if available
    if (data.duplicate_entries) {
      transformedData.forEach(item => {
        // Parse the amount range from the label (e.g., "1M-10M SAR")
        const rangeMatch = item.name.match(/(\d+)M-(\d+)M SAR/);
        if (rangeMatch) {
          const minAmount = parseInt(rangeMatch[1]) * 1000000;
          const maxAmount = parseInt(rangeMatch[2]) * 1000000;
          
          const rangeDuplicates = data.duplicate_entries.filter(entry => {
            const totalAmount = entry.transaction1.amount + entry.transaction2.amount;
            return totalAmount >= minAmount && totalAmount <= maxAmount;
          });
          
          item.totalAmount = rangeDuplicates.reduce((sum, entry) => 
            sum + entry.transaction1.amount + entry.transaction2.amount, 0
          );
        }
      });
    }
  } else if (Array.isArray(chartData) && chartData.length > 0 && chartData[0].range) {
    // Fallback: chart_data.amount_distribution_chart is an array with range property
    transformedData = chartData
      .filter(item => item.duplicate_groups > 0) // Only show ranges with data
      .map((item, index) => ({
        name: item.range,
        value: item.duplicate_groups,
        totalAmount: item.total_amount,
        totalTransactions: item.transactions
      }));
  } else {
    // Old structure: duplicates array - group by amount ranges
    const amountRanges = [
      { min: 0, max: 1000, label: `${currency} 0-1K` },
      { min: 1000, max: 5000, label: `${currency} 1K-5K` },
      { min: 5000, max: 10000, label: `${currency} 5K-10K` },
      { min: 10000, max: 50000, label: `${currency} 10K-50K` },
      { min: 50000, max: Infinity, label: `${currency} 50K+` }
    ];

    const amountGroups = chartData.reduce((acc, duplicate) => {
      const amount = duplicate.amount || 0;
      const range = amountRanges.find(r => amount >= r.min && amount < r.max);
      
      if (range) {
        if (!acc[range.label]) {
          acc[range.label] = {
            count: 0,
            totalAmount: 0,
            totalTransactions: 0
          };
        }
        
        acc[range.label].count += 1;
        acc[range.label].totalAmount += amount;
        acc[range.label].totalTransactions += duplicate.count || 0;
      }
      
      return acc;
    }, {});

    transformedData = Object.entries(amountGroups).map(([range, details], index) => ({
      name: range,
      value: details.count,
      totalAmount: details.totalAmount,
      totalTransactions: details.totalTransactions
    }));
  }

  // Generate gradient colors based on #925a9b
  const generateGradientColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const intensity = 0.3 + (i * 0.15); // Vary from 30% to 90% opacity
      colors.push(`rgba(146, 90, 155, ${intensity})`);
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
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Duplicate Amount Distribution</Typography>
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