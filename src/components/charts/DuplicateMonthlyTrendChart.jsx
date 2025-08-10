import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colorScheme, formatCurrency } from '../../utils/colorScheme';

export default function DuplicateMonthlyTrendChart({ data, currency = 'SAR' }) {
  // Check for new API response structure first, then fallback to old structure
  const chartData = data?.detailed_results?.duplicate_entries ? {
    // Generate monthly trend from duplicate entries
    labels: Array.from(new Set(
      (data.detailed_results.duplicate_entries || []).map(entry => 
        new Date(entry.transaction1.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      )
    )).sort(),
    data: Array.from(new Set(
      (data.detailed_results.duplicate_entries || []).map(entry => 
        new Date(entry.transaction1.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      )
    )).sort().map(month => 
      (data.detailed_results.duplicate_entries || []).filter(entry => 
        new Date(entry.transaction1.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) === month
      ).length
    )
  } : data?.chart_data?.monthly_duplicate_trend || data?.monthly_trend;

  if (!data || !chartData || (Array.isArray(chartData) && chartData.length === 0)) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Monthly Duplicate Trend</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No monthly trend data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Transform data based on structure
  let transformedData;
  if (chartData.labels && chartData.data) {
    // New structure: chart_data.monthly_duplicate_trend has labels and data arrays
    transformedData = chartData.labels.map((label, index) => ({
      month: label,
      duplicateGroups: chartData.data[index] || 0,
      transactions: (chartData.data[index] || 0) * 2,
      totalAmount: 0, // Will be calculated from duplicate entries
      debitAmount: 0, // Will be calculated from duplicate entries
      creditAmount: 0 // Will be calculated from duplicate entries
    }));
    
    // Calculate amounts from duplicate entries if available
    const duplicateEntries = data?.detailed_results?.duplicate_entries || data?.duplicate_entries;
    if (duplicateEntries) {
      transformedData.forEach(item => {
        const monthDuplicates = duplicateEntries.filter(entry => {
          const entryMonth = new Date(entry.transaction1.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          return entryMonth === item.month;
        });
        item.totalAmount = monthDuplicates.reduce((sum, entry) => 
          sum + entry.transaction1.amount + entry.transaction2.amount, 0
        );
        item.debitAmount = monthDuplicates.reduce((sum, entry) => 
          sum + entry.transaction1.amount, 0
        );
        item.creditAmount = monthDuplicates.reduce((sum, entry) => 
          sum + entry.transaction2.amount, 0
        );
      });
    }
  } else if (Array.isArray(chartData) && chartData.length > 0 && chartData[0].month) {
    // Fallback: chart_data.monthly_trend_chart is an array with month property
    transformedData = chartData.map((item, index) => ({
      month: item.month,
      duplicateGroups: item.duplicate_groups,
      transactions: item.transactions,
      totalAmount: item.total_amount,
      debitAmount: item.debit_amount,
      creditAmount: item.credit_amount
    }));
  } else {
    // Old structure: monthly_trend object
    transformedData = Object.entries(chartData).map(([month, details]) => ({
      month: month,
      duplicateGroups: details.count || 0,
      transactions: details.transactions || 0,
      totalAmount: details.amount || 0,
      debitAmount: details.debit_amount || 0,
      creditAmount: details.credit_amount || 0
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
            Duplicate Groups: {data.duplicateGroups}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transactions: {data.transactions}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Amount: {formatCurrency(data.totalAmount, currency)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Debit: {formatCurrency(data.debitAmount, currency)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Credit: {formatCurrency(data.creditAmount, currency)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Monthly Duplicate Trend</Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={transformedData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#925A9B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#925A9B" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="month" 
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
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="duplicateGroups" 
                stroke="#925A9B"
                strokeWidth={3}
                dot={{ fill: '#925A9B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#925A9B', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
} 