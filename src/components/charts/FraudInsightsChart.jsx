import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip, Alert } from '@mui/material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { colorScheme, getRiskColor } from '../../utils/colorScheme';

export default function FraudInsightsChart({ data, analysisSummary }) {
  if (!data || !analysisSummary) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Fraud Detection Insights</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Calculate anomaly scores from the anomalies_detected data
  const anomalies = analysisSummary.anomalies_detected || {};
  const totalExpenses = analysisSummary.total_flagged_expenses || 0;
  
  const radarData = [
    { 
      metric: 'Amount Anomalies', 
      value: totalExpenses > 0 ? (anomalies.amount_anomalies / totalExpenses) * 100 : 0 
    },
    { 
      metric: 'Timing Patterns', 
      value: totalExpenses > 0 ? (anomalies.timing_anomalies / totalExpenses) * 100 : 0 
    },
    { 
      metric: 'Vendor Risk', 
      value: totalExpenses > 0 ? (anomalies.vendor_anomalies / totalExpenses) * 100 : 0 
    },
    { 
      metric: 'Employee Behavior', 
      value: totalExpenses > 0 ? (anomalies.employee_anomalies / totalExpenses) * 100 : 0 
    },
    { 
      metric: 'Duplicate Suspicion', 
      value: totalExpenses > 0 ? (anomalies.duplicate_suspicions / totalExpenses) * 100 : 0 
    },
    { 
      metric: 'Overall Risk', 
      value: analysisSummary.overall_fraud_score || 0 
    }
  ];

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
            Score: {payload[0].value.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Fraud Detection Insights</Typography>
        
        {/* Overall Risk Alert */}
        <Alert 
          severity={getRiskLevel(analysisSummary.overall_fraud_score) === 'CRITICAL' ? 'error' : 
                   getRiskLevel(analysisSummary.overall_fraud_score) === 'HIGH' ? 'warning' : 'info'}
          sx={{ mb: 2 }}
        >
          Overall Fraud Score: {analysisSummary.overall_fraud_score?.toFixed(1)}% 
          <Chip 
            label={getRiskLevel(analysisSummary.overall_fraud_score)} 
            size="small"
            sx={{ 
              ml: 1,
              backgroundColor: getRiskColor(getRiskLevel(analysisSummary.overall_fraud_score)),
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Alert>

        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke={colorScheme.border} />
              <PolarAngleAxis 
                dataKey="metric" 
                tick={{ fontSize: 11, fill: colorScheme.textSecondary }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: colorScheme.textSecondary }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name="Fraud Score"
                dataKey="value"
                stroke={colorScheme.primary}
                fill={colorScheme.primary}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Box>

        {/* Key Insights */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              Key Insights:
            </Typography>
          </Grid>
          {radarData.map((item, index) => (
            <Grid item xs={6} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: item.value > 60 ? colorScheme.error : 
                                   item.value > 40 ? colorScheme.warning : colorScheme.success 
                  }} 
                />
                <Typography variant="caption" color="text.secondary">
                  {item.metric}: {item.value.toFixed(0)}%
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
} 