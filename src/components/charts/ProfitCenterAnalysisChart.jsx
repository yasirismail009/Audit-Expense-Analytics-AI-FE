import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { colorScheme, formatCurrency } from '../../utils/colorScheme';
import { dashboardColors } from '../../utils/dashboardColors';

export default function ProfitCenterAnalysisChart({ data, currency = 'SAR' }) {
  // Debug logging
  console.log('=== PROFIT CENTER CHART DEBUG ===');
  console.log('Full data:', data);
  console.log('chartData:', data?.chartData);
  console.log('enhanced:', data?.chartData?.enhanced);
  console.log('profit_center_analysis:', data?.chartData?.enhanced?.profit_center_analysis);
  console.log('===================================');

  // Prepare chart data from enhanced statistics
  const enhancedData = data?.chartData?.enhanced;
  const profitCenterData = enhancedData?.profit_center_analysis;
  
  const chartData = profitCenterData?.labels?.map((label, index) => ({
    name: label,
    value: profitCenterData?.total_amounts?.[index] || 0,
    transactionCount: profitCenterData?.transaction_counts?.[index] || 0
  })) || [];

  // Generate colors for pie chart using black and purple theme
  const COLORS = dashboardColors.chartColors;

  if (!data || chartData.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: colorScheme.textPrimary }}>
            Profit Center Analysis
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
              No profit center data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
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
            {data.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              backgroundColor: payload[0].color, 
              borderRadius: '50%', 
              mr: 1 
            }} />
            <Typography variant="body2" sx={{ color: dashboardColors.textSecondary }}>
              Amount: <strong>{formatCurrency(data.value, currency)}</strong>
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: dashboardColors.textSecondary }}>
            Transactions: <strong>{data.transactionCount.toLocaleString()}</strong>
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
          Profit Center Analysis
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
