import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function HolidayUserChart({ data, currency = 'SAR' }) {
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
  const chartData = data?.visualizations?.chart_data?.holiday_by_user;

  if (!data || !chartData || !chartData.labels || !chartData.data) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Holiday Activity by User</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No holiday user data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Transform data for holiday structure
  const transformedData = chartData.labels.map((user, index) => ({
    user: user,
    holidayCount: chartData.data[index] || 0,
    totalAmount: 0, // Will be calculated from holiday entries
    uniqueHolidays: 0 // Will be calculated from holiday entries
  }));
  
  // Calculate amounts and holidays from holiday entries if available
  const holidayEntries = data?.detailed_results?.holiday_postings || [];
  if (holidayEntries.length > 0) {
    transformedData.forEach(item => {
      const userHolidays = holidayEntries.filter(entry => entry.user === item.user);
      item.totalAmount = userHolidays.reduce((sum, entry) => sum + (entry.amount || 0), 0);
      item.uniqueHolidays = new Set(userHolidays.map(entry => entry.holiday_name)).size;
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
            Holiday Transactions: {data.holidayCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: {formatCurrency(data.totalAmount)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Unique Holidays: {data.uniqueHolidays}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Holiday Activity by User</Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transformedData} barGap={8} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="user" 
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
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#C084FC" />
                </linearGradient>
              </defs>
              <Bar 
                dataKey="holidayCount" 
                radius={[8, 8, 0, 0]}
                fill="url(#barGradient)"
                stroke="#ffffff"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
} 