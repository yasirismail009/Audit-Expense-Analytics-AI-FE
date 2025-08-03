import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colorScheme, getColorByIndex } from '../../utils/colorScheme';

export default function EmployeeExpensesChart({ data }) {
  // Create fallback data if no data is provided
  const fallbackData = {
    labels: [],
    data: [],
    colors: []
  };

  const chartData = data || fallbackData;

  if (!chartData.labels || !chartData.data || !Array.isArray(chartData.labels) || !Array.isArray(chartData.data)) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Employee Expenses</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No employee data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Ensure we have at least one data point
  if (chartData.labels.length === 0 || chartData.data.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Employee Expenses</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No employee data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Process chart data
  const processedData = chartData.labels.map((label, index) => ({
    employee: label || `Employee ${index + 1}`,
    amount: parseFloat(chartData.data[index]) || 0,
    color: chartData.colors && chartData.colors[index] ? chartData.colors[index] : getColorByIndex(index)
  }));


  // Sort by amount (highest first) for better visualization
  const sortedData = processedData.sort((a, b) => b.amount - a.amount);


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
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
            ${payload[0].value.toLocaleString()}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ width: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Employee Expenses</Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {sortedData.length} employees with total expenses
          </Typography>
        </Box>

        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colorScheme.border} />
              <XAxis 
                dataKey="employee"
                tick={{ fontSize: 11, fill: colorScheme.textSecondary }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: colorScheme.textSecondary }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                label={{ 
                  value: 'Expense Amount ($)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: colorScheme.textSecondary }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="amount" 
                fill={colorScheme.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Summary Stats */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
            Employee Summary:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              Total Employees: {sortedData.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Amount: ${sortedData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg per Employee: ${(sortedData.reduce((sum, item) => sum + item.amount, 0) / sortedData.length).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 