import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { colorScheme, formatCurrency } from '../../utils/colorScheme';
import { dashboardColors } from '../../utils/dashboardColors';

export default function AccountTransactionCountsChart({ data, currency = 'SAR' }) {
  // Prepare chart data from enhanced statistics
  const enhancedData = data?.chartData?.enhanced;
  const accountTransactionData = enhancedData?.account_by_transaction_counts;
  
  const chartData = accountTransactionData?.labels?.slice(0, 10).map((label, index) => ({
    account: label,
    transactions: accountTransactionData?.transaction_counts?.[index] || 0,
    index: index + 1
  })) || [];

  if (!data || chartData.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: colorScheme.textPrimary }}>
            Top Accounts by Transaction Count
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
              No account transaction data available
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
            {data.account}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              backgroundColor: dashboardColors.secondary, 
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
          Top Accounts by Transaction Count
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
              <Line 
                type="monotone" 
                dataKey="transactions" 
                stroke={dashboardColors.secondary}
                strokeWidth={3}
                dot={{ fill: dashboardColors.secondary, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: dashboardColors.secondary, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
