import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import { colorScheme, getColorByIndex } from '../../utils/colorScheme';

export default function TimingAnomalyChart({ timingAnomalyData }) {
  if (!timingAnomalyData || timingAnomalyData.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Timing Anomaly Analysis</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No timing anomaly data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for the chart
  const chartData = timingAnomalyData
    .sort((a, b) => a.day_of_month - b.day_of_month)
    .map((item, index) => ({
      day: `Day ${item.day_of_month}`,
      expenseCount: item.expense_count,
      expected: item.expected,
      anomalyScore: item.etas_score,
      color: getColorByIndex(index)
    }));

  // Find significant anomalies (score > 1.0)
  const significantAnomalies = chartData.filter(item => item.anomalyScore > 1.0);

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
          <Typography variant="body2" color="text.secondary">
            Actual: {data.expenseCount} expenses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Expected: {data.expected.toFixed(1)} expenses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Anomaly Score: {data.anomalyScore.toFixed(2)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Timing Anomaly Analysis</Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Expense timing patterns across days of the month
          </Typography>
          {significantAnomalies.length > 0 && (
            <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
              {significantAnomalies.length} significant timing anomalies detected
            </Typography>
          )}
        </Box>

        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colorScheme.border} />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 11, fill: colorScheme.textSecondary }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: colorScheme.textSecondary }}
                label={{ 
                  value: 'Expense Count', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: colorScheme.textSecondary }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="expenseCount" 
                fill={colorScheme.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Anomaly Score Chart */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
            Anomaly Scores (Higher = More Anomalous)
          </Typography>
          <Box sx={{ height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colorScheme.border} />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 10, fill: colorScheme.textSecondary }}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: colorScheme.textSecondary }}
                  label={{ 
                    value: 'Anomaly Score', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: colorScheme.textSecondary, fontSize: 10 }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="anomalyScore" 
                  stroke={colorScheme.warning}
                  strokeWidth={2}
                  dot={{ fill: colorScheme.warning, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: colorScheme.warning, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Summary Stats */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
            Timing Analysis Summary:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              Total Days: {chartData.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg Anomaly Score: {(chartData.reduce((sum, item) => sum + item.anomalyScore, 0) / chartData.length).toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Significant Anomalies: {significantAnomalies.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Expenses: {chartData.reduce((sum, item) => sum + item.expenseCount, 0)}
            </Typography>
          </Box>
        </Box>

        {/* Key Insights */}
        {significantAnomalies.length > 0 && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
              Key Insights:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {significantAnomalies.slice(0, 3).map((anomaly, index) => (
                <Typography key={index} variant="caption" color="text.secondary">
                  • {anomaly.day}: {anomaly.expenseCount} expenses (expected {anomaly.expected.toFixed(1)})
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 