import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { colorScheme, getColorByIndex } from '../../utils/colorScheme';

export default function DuplicateTypeChart({ data }) {
  if (!data || !data.type_breakdown) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Duplicate Types Distribution</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No duplicate type data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(data.type_breakdown).map(([type, details], index) => ({
    name: type,
    value: details.count,
    amount: details.total_amount,
    transactions: details.total_transactions,
    color: getColorByIndex(index)
  }));

  const CustomTooltip = ({ active, payload }) => {
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
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: data.color }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Count: {data.value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: ${data.amount?.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transactions: {data.transactions}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mt: 3 }}>
      {payload.map((entry, index) => (
        <Box key={index} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          p: 1,
          borderRadius: 2,
          backgroundColor: `${entry.color}15`,
          border: `1px solid ${entry.color}30`
        }}>
          <Box 
            sx={{ 
              width: 16, 
              height: 16, 
              backgroundColor: entry.color, 
              borderRadius: '50%',
              boxShadow: `0 2px 8px ${entry.color}40`
            }} 
          />
          <Typography variant="body2" sx={{ color: entry.color, fontWeight: 'bold', fontSize: '0.875rem' }}>
            {entry.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  return (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 3, 
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
      border: '1px solid rgba(255,255,255,0.2)',
      overflow: 'hidden',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #925A9B, #36A2EB, #FFCE56, #FF9F40, #FF6384)',
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #925A9B, #36A2EB)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>📊</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
            Duplicate Types Distribution
          </Typography>
        </Box>
        <Box sx={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                stroke="#ffffff"
                strokeWidth={3}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
} 