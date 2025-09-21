import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colorScheme, formatCurrency } from '../../utils/colorScheme';
import { dashboardColors } from '../../utils/dashboardColors';

export default function UserCreditDebitAnalysisChart({ data, currency = 'SAR' }) {
  // Prepare chart data from enhanced statistics
  const enhancedData = data?.chartData?.enhanced;
  const userCreditDebitData = enhancedData?.user_credit_debit_analysis;
  
  const chartData = userCreditDebitData?.labels?.slice(0, 8).map((label, index) => ({
    user: label,
    debitTotal: userCreditDebitData?.debit_totals?.[index] || 0,
    creditTotal: userCreditDebitData?.credit_totals?.[index] || 0,
    netAmount: userCreditDebitData?.net_amounts?.[index] || 0
  })) || [];

  if (!data || chartData.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: colorScheme.textPrimary }}>
            User Credit/Debit Analysis
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
              No user credit/debit data available
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
          <Typography variant="body2" sx={{ fontWeight: 600, color: colorScheme.textPrimary, mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
            Debit: <strong>{formatCurrency(data.debitTotal, currency)}</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
            Credit: <strong>{formatCurrency(data.creditTotal, currency)}</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
            Net: <strong>{formatCurrency(data.netAmount, currency)}</strong>
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
          User Credit/Debit Analysis
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="user" 
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
                tickFormatter={(value) => formatCurrency(value, currency, true)}
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
                dataKey="debitTotal" 
                radius={[8, 8, 0, 0]}
                fill="url(#debitGradient)"
                stroke="#ffffff"
                strokeWidth={2}
              />
              <Bar 
                dataKey="creditTotal" 
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
