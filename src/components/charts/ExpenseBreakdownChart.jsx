import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { colorScheme, getColorByIndex } from '../../utils/colorScheme';

export default function ExpenseBreakdownChart({ data }) {
  if (!data || !data.labels || !data.data) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Expense Breakdown</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.labels.map((label, index) => ({
    category: label,
    amount: data.data[index],
    count: data.counts?.[index] || 0,
    avgAmount: data.data[index] / (data.counts?.[index] || 1),
    color: getColorByIndex(index)
  }));

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
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Total: ${data.amount.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Count: {data.count} expenses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Average: ${data.avgAmount.toLocaleString()}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Expense Breakdown</Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="amount" 
                fill={colorScheme.primary}
                radius={[6, 6, 0, 0]}
                name="Total Amount"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        {/* Summary Stats */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {chartData.slice(0, 4).map((item, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {item.category}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: item.color }}>
                  ${item.amount.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
} 