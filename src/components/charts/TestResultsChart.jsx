import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { colorScheme, formatCurrency } from '../../utils/colorScheme';

export default function TestResultsChart({ data, currency = 'SAR' }) {
  // Prepare chart data from transformed data structure
  const passedTests = data?.overall?.completeFields || 0;
  const failedTests = data?.overall?.totalFields - data?.overall?.completeFields || 0;
  const totalTests = data?.overall?.totalFields || 0;

  const chartData = [
    { 
      name: 'Passed', 
      value: passedTests, 
      percentage: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
    },
    { 
      name: 'Failed', 
      value: failedTests, 
      percentage: totalTests > 0 ? Math.round((failedTests / totalTests) * 100) : 0
    }
  ];

  if (!data || totalTests === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Test Results</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No test data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Generate gradient colors based on purple theme
  const generateGradientColors = (count) => {
    const purpleColors = [
      '#10B981', // Green for passed
      '#EF4444', // Red for failed
    ];
    
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(purpleColors[i % purpleColors.length]);
    }
    return colors;
  };

  const segmentColors = generateGradientColors(chartData.length);

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
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Count: {data.value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Percentage: {data.percentage}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Test Results</Typography>
        <Box sx={{ height: 300, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={segmentColors[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: '#666', fontSize: '12px' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Progress Circle */}
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <CircularProgress
              variant="determinate"
              value={data?.overall?.score || 0}
              size={80}
              thickness={4}
              sx={{ 
                color: '#3B82F6',
                mb: 1
              }}
            />
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              color: '#1f2937',
              fontSize: '1.2rem'
            }}>
              {data?.overall?.score || 0}%
            </Typography>
            <Typography variant="caption" sx={{ 
              color: '#6b7280',
              fontSize: '0.75rem'
            }}>
              Overall Score
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
