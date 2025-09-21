import React from 'react';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colorScheme, formatCurrency } from '../../utils/colorScheme';
import { dashboardColors } from '../../utils/dashboardColors';

export default function FinancialMetricsChart({ data, currency = 'SAR' }) {
  // Prepare chart data from transformed data structure
  const chartData = [
    {
      metric: 'Total Debit',
      value: data?.monthlyTrends?.[0]?.debit_total || 0,
    },
    {
      metric: 'Total Credit',
      value: data?.monthlyTrends?.[0]?.credit_total || 0,
    },
    {
      metric: 'Net Balance',
      value: data?.monthlyTrends?.[0]?.net_amount || 0,
    }
  ];

  if (!data || chartData.every(item => item.value === 0)) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Financial Metrics</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No financial data available</Typography>
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
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: {formatCurrency(data.value, currency)}
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
          Financial Metrics
        </Typography>
        <Box sx={{ height: 200, mb: 3 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="metric" 
                tick={{ fontSize: 12, fill: dashboardColors.textSecondary }} 
                axisLine={false} 
                tickLine={false}
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
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={dashboardColors.purpleDark} />
                  <stop offset="100%" stopColor={dashboardColors.purpleMedium} />
                </linearGradient>
              </defs>
              <Bar 
                dataKey="value" 
                radius={[8, 8, 0, 0]}
                fill={(entry) => {
                  if (entry.metric === 'Total Debit') return 'url(#debitGradient)';
                  if (entry.metric === 'Total Credit') return 'url(#creditGradient)';
                  return 'url(#balanceGradient)';
                }}
                stroke="#ffffff"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 2, 
              textAlign: 'center',
              border: '1px solid #e9ecef'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: '#3B82F6',
                fontSize: '1.1rem'
              }}>
                {formatCurrency(chartData[0].value, currency)}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#6b7280',
                fontSize: '0.75rem'
              }}>
                Total Debit
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 2, 
              textAlign: 'center',
              border: '1px solid #e9ecef'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: '#10B981',
                fontSize: '1.1rem'
              }}>
                {formatCurrency(chartData[1].value, currency)}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#6b7280',
                fontSize: '0.75rem'
              }}>
                Total Credit
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f8f9fa', 
              borderRadius: 2, 
              textAlign: 'center',
              border: '1px solid #e9ecef'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700, 
                color: '#F59E0B',
                fontSize: '1.1rem'
              }}>
                {formatCurrency(chartData[2].value, currency)}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#6b7280',
                fontSize: '0.75rem'
              }}>
                Net Balance
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
