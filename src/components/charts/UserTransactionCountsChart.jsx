import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { colorScheme, formatCurrency } from '../../utils/colorScheme';
import { dashboardColors } from '../../utils/dashboardColors';

export default function UserTransactionCountsChart({ data, currency = 'SAR' }) {
  // Prepare chart data from enhanced statistics
  const enhancedData = data?.chartData?.enhanced;
  const userTransactionData = enhancedData?.user_by_transaction_counts;
  
  const chartData = userTransactionData?.labels?.slice(0, 10).map((label, index) => ({
    user: label,
    transactions: userTransactionData?.transaction_counts?.[index] || 0,
    index: index + 1
  })) || [];

  if (!data || chartData.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: colorScheme.textPrimary }}>
            Top Users by Transaction Count
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
              No user transaction data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ 
          backgroundColor: 'white', 
          border: '1px solid #E5E7EB', 
          borderRadius: 8, 
          p: 2,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          minWidth: 200
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: dashboardColors.text, mb: 1 }}>
            {data.user}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              backgroundColor: dashboardColors.black, 
              borderRadius: '50%', 
              mr: 1 
            }} />
            <Typography variant="body2" sx={{ color: dashboardColors.textSecondary }}>
              Transactions: <strong>{data.transactions.toLocaleString()}</strong>
            </Typography>
          </Box>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: dashboardColors.text }}>
          Top Users by Transaction Count
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="userTransactionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={dashboardColors.black} stopOpacity={0.8}/>
                  <stop offset="100%" stopColor={dashboardColors.black} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="index" 
                tick={{ fontSize: 12, fill: dashboardColors.textSecondary }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(value) => `#${value}`}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: dashboardColors.textSecondary }} 
                axisLine={false} 
                tickLine={false}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="transactions" 
                stroke={dashboardColors.black}
                strokeWidth={3}
                fill="url(#userTransactionGradient)"
                dot={{ fill: dashboardColors.black, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: dashboardColors.black, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
