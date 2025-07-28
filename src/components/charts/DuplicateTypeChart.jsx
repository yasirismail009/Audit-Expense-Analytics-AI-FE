import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colorScheme, getColorByIndex } from '../../utils/colorScheme';

export default function DuplicateTypeChart({ data, currency = 'SAR' }) {
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
  const chartData = data?.chart_data?.duplicate_types_distribution || data?.type_breakdown;

  if (!data || !chartData || (Array.isArray(chartData) && chartData.length === 0) || (typeof chartData === 'object' && Object.keys(chartData).length === 0)) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Duplicate Types Distribution</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No duplicate type data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Transform data based on structure
  let transformedData;
  if (chartData.labels && chartData.data) {
    // New structure: chart_data.duplicate_types_distribution has labels and data arrays
    transformedData = chartData.labels.map((label, index) => ({
      type: label,
      count: chartData.data[index] || 0,
      amount: 0, // Will be calculated from duplicate entries
      transactions: (chartData.data[index] || 0) * 2,
      color: chartData.colors ? chartData.colors[index] : getColorByIndex(index)
    }));
    
    // Calculate amounts from duplicate entries if available
    if (data.duplicate_entries) {
      transformedData.forEach(item => {
        const matchingEntries = data.duplicate_entries.filter(entry => 
          entry.duplicate_type === item.type
        );
        item.amount = matchingEntries.reduce((sum, entry) => 
          sum + entry.transaction1.amount + entry.transaction2.amount, 0
        );
      });
    }
  } else if (Array.isArray(chartData)) {
    // Fallback: chart_data is an array
    transformedData = chartData.map((item, index) => ({
      type: item.type,
      count: item.groups,
      amount: item.total_amount,
      transactions: item.transactions,
      color: getColorByIndex(index)
    }));
  } else {
    // Old structure: type_breakdown is an object
    transformedData = Object.entries(chartData).map(([type, details], index) => ({
      type: type,
      count: details.count,
      amount: details.total_amount,
      transactions: details.total_transactions,
      color: getColorByIndex(index)
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
            Count: {data.count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: {formatCurrency(data.amount)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transactions: {data.transactions}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Duplicate Types Distribution</Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transformedData}>
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#925A9B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#925A9B" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="type" 
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
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#925A9B"
                strokeWidth={3}
                fill="url(#purpleGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
} 