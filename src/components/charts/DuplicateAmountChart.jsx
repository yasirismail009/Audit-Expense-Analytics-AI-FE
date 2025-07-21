import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DuplicateAmountChart({ data }) {
  if (!data || !data.duplicates || data.duplicates.length === 0) {
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

  // Group duplicates by amount ranges
  const amountRanges = [
    { min: 0, max: 1000, label: '$0-1K' },
    { min: 1000, max: 5000, label: '$1K-5K' },
    { min: 5000, max: 10000, label: '$5K-10K' },
    { min: 10000, max: 50000, label: '$10K-50K' },
    { min: 50000, max: Infinity, label: '$50K+' }
  ];

  const amountGroups = data.duplicates.reduce((acc, duplicate) => {
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

  const chartData = Object.entries(amountGroups).map(([range, details], index) => ({
    name: range,
    value: details.count,
    totalAmount: details.totalAmount,
    totalTransactions: details.totalTransactions
  }));

  // Generate gradient colors based on #925a9b
  const generateGradientColors = (count) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const intensity = 0.3 + (i * 0.15); // Vary from 30% to 90% opacity
      colors.push(`rgba(146, 90, 155, ${intensity})`);
    }
    return colors;
  };

  const segmentColors = generateGradientColors(chartData.length);

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
            Amount: ${data.totalAmount?.toLocaleString()}
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
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
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