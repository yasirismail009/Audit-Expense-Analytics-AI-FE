import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colorScheme, formatCurrency } from '../../utils/colorScheme';
import { dashboardColors } from '../../utils/dashboardColors';

export default function CompletenessTrendChart({ data, currency = 'SAR' }) {
  // Prepare chart data from transformed data structure
  const chartData = data?.monthlyTrends?.map((item, index) => ({
    month: item.month || `Month ${index + 1}`,
    amount: item.total_volume || 0,
    transactions: item.transaction_count || 0,
    completeness: data?.overall?.score || 99.28
  })) || [];

  if (!data || chartData.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Monthly Completeness Trends</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No trend data available</Typography>
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
            {label}
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
              Amount: <strong>{formatCurrency(data.amount, currency)}</strong>
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: dashboardColors.textSecondary }}>
            Transactions: <strong>{data.transactions.toLocaleString()}</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: dashboardColors.textSecondary }}>
            Completeness: <strong>{data.completeness}%</strong>
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: dashboardColors.text }}>
          Monthly Amount Trends
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={dashboardColors.secondary} stopOpacity={0.8}/>
                  <stop offset="100%" stopColor={dashboardColors.secondary} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: dashboardColors.textSecondary }} 
                axisLine={false} 
                tickLine={false}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: dashboardColors.textSecondary }} 
                axisLine={false} 
                tickLine={false}
                tickMargin={8}
                domain={[0, 'dataMax + 100000000']}
                tickFormatter={(value) => formatCurrency(value, currency, true)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke={dashboardColors.secondary}
                strokeWidth={2}
                fill="url(#amountGradient)"
                dot={{ fill: dashboardColors.secondary, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: dashboardColors.secondary, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
