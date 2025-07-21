import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { colorScheme, getColorByIndex } from '../../utils/colorScheme';

export default function RiskDistributionChart({ data }) {
  console.log(data)
  if (!data || !data.labels || !data.data) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Risk Distribution</Typography>
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
    <Card sx={{  borderRadius: 3, boxShadow: 2, width: '100%', }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Risk Distribution</Typography>
                <Box sx={{ height: 200, width: '100%', minWidth: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartData.length > 0 ? (
              <LineChart data={chartData} height={200}>
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
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={colorScheme.primary}
                  strokeWidth={3}
                  dot={{ fill: colorScheme.primary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: colorScheme.primary, strokeWidth: 2, fill: colorScheme.primary }}
                />
              </LineChart>
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