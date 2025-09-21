import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colorScheme, formatCurrency } from '../../utils/colorScheme';
import { dashboardColors } from '../../utils/dashboardColors';

export default function AccountDistributionChart({ data, currency = 'SAR' }) {
  // Prepare chart data from transformed data structure
  const topAccounts = data?.chartData?.topAccounts;
  const chartData = topAccounts?.labels?.slice(0, 8).map((label, index) => ({
    account: label,
    debit: topAccounts?.debit_amounts?.[index] || 0,
    credit: topAccounts?.credit_amounts?.[index] || 0,
    total: (topAccounts?.debit_amounts?.[index] || 0) + (topAccounts?.credit_amounts?.[index] || 0)
  })) || [];

  if (!data || chartData.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Top Accounts Distribution</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No account data available</Typography>
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
          border: '1px solid #ccc', 
          borderRadius: 2, 
          p: 2,
          boxShadow: 2
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.textPrimary }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
            Debit: {formatCurrency(data.debit, currency)}
          </Typography>
          <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
            Credit: {formatCurrency(data.credit, currency)}
          </Typography>
          <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
            Total: {formatCurrency(data.total, currency)}
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
          Top Accounts Distribution
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="account" 
                tick={{ fontSize: 12, fill: dashboardColors.textSecondary }} 
                axisLine={false} 
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: dashboardColors.textSecondary }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="debitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={dashboardColors.secondary} />
                  <stop offset="100%" stopColor={dashboardColors.purpleLight} />
                </linearGradient>
                <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={dashboardColors.black} />
                  <stop offset="100%" stopColor={dashboardColors.blackMedium} />
                </linearGradient>
              </defs>
              <Bar 
                dataKey="debit" 
                radius={[8, 8, 0, 0]}
                fill="url(#debitGradient)"
                stroke="#ffffff"
                strokeWidth={2}
              />
              <Bar 
                dataKey="credit" 
                radius={[8, 8, 0, 0]}
                fill="url(#creditGradient)"
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
