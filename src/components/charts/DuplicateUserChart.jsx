import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DuplicateUserChart({ data, currency = 'SAR' }) {
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
  const chartData = data?.chart_data?.user_breakdown_chart || data?.charts_data?.user_breakdown;

  if (!data || !chartData || (Array.isArray(chartData) && chartData.length === 0)) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Duplicate Activity by User</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No user duplicate data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Transform data based on structure
  let transformedData;
  if (Array.isArray(chartData)) {
    // New structure: chart_data.user_breakdown_chart is an array
    transformedData = chartData.map((user, index) => ({
      user: user.user,
      duplicateCount: user.duplicate_groups,
      totalAmount: user.total_amount,
      duplicateTypes: user.duplicate_types?.length || 0
    }));
  } else {
    // Old structure: charts_data.user_breakdown is an array
    transformedData = chartData.map((user, index) => ({
      user: user.user_name,
      duplicateCount: user.duplicate_count,
      totalAmount: user.total_amount,
      duplicateTypes: user.duplicate_types?.length || 0
    }));
  }

  const CustomTooltip = ({ active, payload, label }) => {
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
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Count: {data.duplicateCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: {formatCurrency(data.totalAmount)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Types: {data.duplicateTypes}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Duplicate Activity by User</Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transformedData} barGap={8} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="user" 
                tick={{ fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="duplicateCount" 
                radius={[8, 8, 0, 0]}
                fill="url(#barGradient)"
                stroke="#ffffff"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#925a9b" />
                  <stop offset="100%" stopColor="#e0bdc8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
} 