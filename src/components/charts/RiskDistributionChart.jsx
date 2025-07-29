import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Area, AreaChart } from 'recharts';
import { colorScheme, getColorByIndex } from '../../utils/colorScheme';

export default function RiskDistributionChart({ data, title = "Risk Distribution", subtitle }) {
  console.log(data)
  if (!data || !data.labels || !data.data) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2, width: '100%' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ mb: 2, color: '#6c757d', fontSize: '0.875rem' }}>
            {subtitle}
          </Typography>
        )}
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.data[index],
    color: getColorByIndex(index)
  }));


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
            {payload[0].value} expenses
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2, width: '100%', height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ mb: 2, color: '#6c757d', fontSize: '0.875rem' }}>
            {subtitle}
          </Typography>
        )}
                <Box sx={{ height: 200, width: '100%', minWidth: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartData.length > 0 ? (
              <AreaChart data={chartData} height={200}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colorScheme.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colorScheme.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={colorScheme.primary}
                  strokeWidth={3}
                  fill="url(#colorGradient)"
                  dot={{ fill: colorScheme.primary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: colorScheme.primary, strokeWidth: 2, fill: colorScheme.primary }}
                />
              </AreaChart>
            ) : (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  No data to display
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  All risk categories have zero values
                </Typography>
              </Box>
            )}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
} 