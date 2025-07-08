import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip, Divider } from '@mui/material';
import { colorScheme, getRiskColor } from '../../utils/colorScheme';

export default function SummaryInsightsChart({ sheetData, analysisSummary }) {
  if (!sheetData || !analysisSummary) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Summary Insights</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const {
    total_expenses,
    total_amount,
    sheet_date,
    display_name
  } = sheetData;

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value?.toFixed(1)}%`;
  };

  // Calculate anomaly percentages from anomalies_detected
  const anomalies = analysisSummary.anomalies_detected || {};
  const totalFlagged = analysisSummary.total_flagged_expenses || 0;
  
  const amountAnomalyPercentage = totalFlagged > 0 ? (anomalies.amount_anomalies / totalFlagged) * 100 : 0;
  const timingAnomalyPercentage = totalFlagged > 0 ? (anomalies.timing_anomalies / totalFlagged) * 100 : 0;
  const vendorAnomalyPercentage = totalFlagged > 0 ? (anomalies.vendor_anomalies / totalFlagged) * 100 : 0;
  const employeeAnomalyPercentage = totalFlagged > 0 ? (anomalies.employee_anomalies / totalFlagged) * 100 : 0;

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 3, fontWeight: 'bold' }}>
          Comprehensive Analysis Summary
        </Typography>

        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: colorScheme.primary, fontWeight: 'bold' }}>
                Financial Overview
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Total Expenses:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {total_expenses.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Total Amount:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                    {formatCurrency(total_amount)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Average per Expense:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(total_amount / total_expenses)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Analysis Date:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {new Date(sheet_date).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Risk Analysis */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: colorScheme.primary, fontWeight: 'bold' }}>
                Risk Assessment
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Overall Risk Score:</Typography>
                  <Chip 
                    label={formatPercentage(analysisSummary.overall_fraud_score)}
                    size="small"
                    sx={{ 
                      backgroundColor: getRiskColor(getRiskLevel(analysisSummary.overall_fraud_score)),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Risk Level:</Typography>
                  <Chip 
                    label={getRiskLevel(analysisSummary.overall_fraud_score)}
                    size="small"
                    sx={{ 
                      backgroundColor: getRiskColor(getRiskLevel(analysisSummary.overall_fraud_score)),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Flagged Expenses:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {analysisSummary.total_flagged_expenses || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Flag Rate:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatPercentage(analysisSummary.flag_rate)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Detailed Analysis */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: colorScheme.primary, fontWeight: 'bold' }}>
            Anomaly Detection Metrics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Amount Anomalies
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.chartColors[0] }}>
                  {formatPercentage(amountAnomalyPercentage)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Timing Anomalies
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.chartColors[1] }}>
                  {formatPercentage(timingAnomalyPercentage)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Vendor Anomalies
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.chartColors[2] }}>
                  {formatPercentage(vendorAnomalyPercentage)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Employee Anomalies
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.chartColors[3] }}>
                  {formatPercentage(employeeAnomalyPercentage)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Recommendations */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Key Recommendations:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {analysisSummary.overall_fraud_score > 60 && (
              <Typography variant="caption" color="text.secondary">
                • High risk detected - Immediate review of flagged expenses recommended
              </Typography>
            )}
            {amountAnomalyPercentage > 50 && (
              <Typography variant="caption" color="text.secondary">
                • Significant amount anomalies detected - Review expense amounts
              </Typography>
            )}
            {vendorAnomalyPercentage > 50 && (
              <Typography variant="caption" color="text.secondary">
                • High vendor anomaly rate - Verify vendor relationships
              </Typography>
            )}
            {analysisSummary.overall_fraud_score <= 20 && (
              <Typography variant="caption" color="text.secondary">
                • Low risk profile - Continue monitoring for changes
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 