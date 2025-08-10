import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Area, AreaChart } from 'recharts';
import { colorScheme, getColorByIndex } from '../../utils/colorScheme';

export default function RiskDistributionChart({ data, title = "Risk Distribution", subtitle }) {
  console.log("data", data);
  
  // Transform data to handle both formats
  let chartData = [];
  
  if (data && typeof data === 'object') {
    if (data.labels && data.data) {
      // Format: { labels: [...], data: [...] }
      chartData = data.labels.map((label, index) => ({
        name: label,
        value: data.data[index],
        color: getColorByIndex(index)
      }));
    } else {
      // Format: { "low_risk": 0, "high_risk": 364, "medium_risk": 0 }
      chartData = Object.entries(data)
        .filter(([key, value]) => value > 0) // Only show categories with data
        .map(([key, value], index) => ({
          name: key.replace('_risk', '').toUpperCase(),
          value: value,
          color: getColorByIndex(index)
        }));
    }
  }

  if (!data || chartData.length === 0) {
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
                    <stop offset="5%" stopColor="#835090" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#835090" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
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
                  stroke="#835090"
                  strokeWidth={3}
                  fill="url(#colorGradient)"
                  dot={{ fill: '#835090', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2, fill: '#8B5CF6' }}
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