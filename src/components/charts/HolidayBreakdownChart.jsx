import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colorScheme, formatCurrency } from '../../utils/colorScheme';

export default function HolidayBreakdownChart({ data, currency = 'SAR' }) {
  // Check for holiday data structure
  const chartData = data?.visualizations?.chart_data?.holiday_breakdown_chart;

  if (!data || !chartData || !chartData.labels || !chartData.data) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Holiday Breakdown</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No holiday breakdown data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Transform data for holiday structure
  const transformedData = chartData.labels.map((holiday, index) => ({
    holiday: holiday,
    count: chartData.data[index] || 0,
    amount: 0, // Will be calculated from holiday entries
    transactions: chartData.data[index] || 0,
    color: colorScheme.chartColors[index % colorScheme.chartColors.length] // Use colorScheme for colors
  }));
  
  // Calculate amounts from holiday entries if available
  const holidayEntries = data?.detailed_results?.holiday_postings || [];
  if (holidayEntries.length > 0) {
    transformedData.forEach(item => {
      const matchingEntries = holidayEntries.filter(entry => 
        entry.holiday_name === item.holiday
      );
      item.amount = matchingEntries.reduce((sum, entry) => 
        sum + (entry.amount || 0), 0
      );
    });
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
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Holiday Breakdown</Typography>
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
                dataKey="holiday" 
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