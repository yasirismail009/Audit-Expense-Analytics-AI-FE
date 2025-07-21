import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colorScheme, getColorByIndex } from '../../utils/colorScheme';

export default function DuplicateUserChart({ data }) {
  if (!data || !data.charts_data?.user_breakdown || data.charts_data.user_breakdown.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Duplicate Activity by User</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No user duplicate data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.charts_data.user_breakdown.map((user, index) => ({
    user: user.user_name,
    duplicateCount: user.duplicate_count,
    totalAmount: user.total_amount,
    duplicateTypes: user.duplicate_types?.length || 0,
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
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: data.color }}>
            {data.user}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Duplicate Count: {data.duplicateCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Amount: ${data.totalAmount?.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Duplicate Types: {data.duplicateTypes}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 3, 
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)',
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
        background: 'linear-gradient(90deg, #925A9B, #36A2EB, #4BC0C0, #9966FF)',
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
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>👥</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
            Duplicate Activity by User
          </Typography>
        </Box>
        <Box sx={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="user" 
                tick={{ fontSize: 12, fontWeight: 'bold', fill: '#666' }} 
                axisLine={false} 
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#666' }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="duplicateCount" 
                radius={[8, 8, 0, 0]}
                fill={(entry) => entry.color}
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