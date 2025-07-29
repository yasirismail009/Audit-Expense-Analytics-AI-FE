import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Area, AreaChart } from 'recharts';
import { colorScheme } from '../../utils/colorScheme';

const ANOMALY_COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const anomalyTypes = [
  { key: 'duplicate_entries', label: 'Duplicate', color: '#FF6384' },
  { key: 'backdated_entries', label: 'Backdated', color: '#36A2EB' },
  { key: 'closing_entries', label: 'Closing', color: '#FFCE56' },
  { key: 'user_anomalies', label: 'User', color: '#4BC0C0' },
  { key: 'unusual_days', label: 'Unusual', color: '#9966FF' },
  { key: 'holiday_entries', label: 'Holiday', color: '#FF9F40' }
];

export default function AnomaliesDistributionChart({ data, title = "Anomalies Distribution", subtitle }) {
  console.log(data)
  if (!data) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2, width: '100%' }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Anomalies Distribution</Typography>
          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No anomaly data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the line chart
  const prepareChartData = () => {
    const chartData = [];
    
    // Handle the new data structure with labels and data arrays
    if (data && data.labels && data.data) {
      data.labels.forEach((label, index) => {
        const count = data.data[index] || 0;
        chartData.push({
          name: label,
          value: count,
          color: ANOMALY_COLORS[index % ANOMALY_COLORS.length]
        });
      });
    } else {
      // Fallback to the old structure
      anomalyTypes.forEach((type, index) => {
        const count = data && data[index] ? data[index] : 0;
        chartData.push({
          name: type.label,
          value: count,
          color: type.color
        });
      });
    }

    return chartData;
  };

  const chartData = prepareChartData();
  console.log(chartData)
  // Custom tooltip
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
            {payload[0].value} anomalies
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
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#925A9B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#925A9B" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#925A9B"
                  strokeWidth={3}
                  fill="url(#anomalyGradient)"
                  dot={{ fill: '#925A9B', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#925A9B', strokeWidth: 2, fill: '#925A9B' }}
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
                  No anomalies detected
                </Typography>
              </Box>
            )}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
} 