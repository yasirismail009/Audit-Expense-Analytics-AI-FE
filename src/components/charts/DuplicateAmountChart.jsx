import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colorScheme, getColorByIndex } from '../../utils/colorScheme';

export default function DuplicateAmountChart({ data }) {
  if (!data || !data.duplicates || data.duplicates.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Duplicate Amount Distribution</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No duplicate amount data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Group duplicates by amount ranges
  const amountRanges = [
    { min: 0, max: 1000, label: '$0-1K', color: getColorByIndex(0) },
    { min: 1000, max: 5000, label: '$1K-5K', color: getColorByIndex(1) },
    { min: 5000, max: 10000, label: '$5K-10K', color: getColorByIndex(2) },
    { min: 10000, max: 50000, label: '$10K-50K', color: getColorByIndex(3) },
    { min: 50000, max: Infinity, label: '$50K+', color: getColorByIndex(4) }
  ];

  const amountGroups = data.duplicates.reduce((acc, duplicate) => {
    const amount = duplicate.amount || 0;
    const range = amountRanges.find(r => amount >= r.min && amount < r.max);
    
    if (range) {
      if (!acc[range.label]) {
        acc[range.label] = {
          count: 0,
          totalAmount: 0,
          totalTransactions: 0,
          color: range.color
        };
      }
      
      acc[range.label].count += 1;
      acc[range.label].totalAmount += amount;
      acc[range.label].totalTransactions += duplicate.count || 0;
    }
    
    return acc;
  }, {});

  const chartData = Object.entries(amountGroups).map(([range, details]) => ({
    range,
    count: details.count,
    totalAmount: details.totalAmount,
    totalTransactions: details.totalTransactions,
    color: details.color
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
            {data.range}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Duplicate Groups: {data.count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Amount: ${data.totalAmount?.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Transactions: {data.totalTransactions}
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
      background: 'linear-gradient(135deg, #ffffff 0%, #fff0f8 100%)',
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
        background: 'linear-gradient(90deg, #FF6384, #FF9F40, #FFCE56, #4BC0C0)',
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #FF6384, #FF9F40)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>💰</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
            Duplicate Amount Distribution
          </Typography>
        </Box>
        <Box sx={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 14, fontWeight: 'bold', fill: '#666' }} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#666' }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
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