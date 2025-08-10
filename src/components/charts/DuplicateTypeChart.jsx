import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colorScheme, formatCurrency } from '../../utils/colorScheme';

export default function DuplicateTypeChart({ data, currency = 'SAR' }) {
  // Check for new API response structure first, then fallback to old structure
  const chartData = data?.visualizations?.chart_data?.duplicate_distribution || 
                   data?.chart_data?.duplicate_types_distribution || 
                   data?.type_breakdown;
  


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
      color: chartData.colors ? chartData.colors[index] : colorScheme.chartColors[index % colorScheme.chartColors.length]
    }));
    
    // Calculate amounts from duplicate entries if available
    const duplicateEntries = data?.detailed_results?.duplicate_entries || data?.duplicate_entries;
    if (duplicateEntries) {
      transformedData.forEach(item => {
        const matchingEntries = duplicateEntries.filter(entry => 
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
      color: colorScheme.chartColors[index % colorScheme.chartColors.length]
    }));
  } else if (typeof chartData === 'object' && !Array.isArray(chartData)) {
    // New API structure: duplicate_distribution is an object like {"type_1": 0, "type_2": 0, "type_3": 1}
    transformedData = Object.entries(chartData)
      .filter(([type, count]) => count > 0) // Only show types with data
      .map(([type, count], index) => ({
        type: type,
        count: count,
        amount: 0, // Will be calculated from duplicate entries
        transactions: count * 2,
        color: colorScheme.chartColors[index % colorScheme.chartColors.length]
      }));
    
    // Calculate amounts from duplicate entries if available
    const duplicateEntries = data?.detailed_results?.duplicate_entries || data?.duplicate_entries;
    if (duplicateEntries) {
      transformedData.forEach(item => {
        const matchingEntries = duplicateEntries.filter(entry => 
          entry.duplicate_type === item.type
        );
        item.amount = matchingEntries.reduce((sum, entry) => 
          sum + entry.transaction1.amount + entry.transaction2.amount, 0
        );
      });
    }
  } else {
    // Old structure: type_breakdown is an object
    transformedData = Object.entries(chartData).map(([type, details], index) => ({
      type: type,
      count: details.count,
      amount: details.total_amount,
      transactions: details.total_transactions,
      color: colorScheme.chartColors[index % colorScheme.chartColors.length]
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
            Amount: {formatCurrency(data.amount, currency)}
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
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="purpleGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="purpleGradient3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C084FC" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#C084FC" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="type" 
                tick={{ fontSize: 12, fill: '#6B7280' }} 
                axisLine={false} 
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#8B5CF6"
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