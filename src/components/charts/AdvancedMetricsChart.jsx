import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip, Alert, Divider } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { colorScheme, getColorByIndex, getRiskColor } from '../../utils/colorScheme';

export default function AdvancedMetricsChart({ advancedMetrics }) {
  if (!advancedMetrics) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Advanced Metrics</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No advanced metrics available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const {
    expense_velocity_ratio,
    approval_concentration_index,
    payment_method_risk_score,
    vendor_concentration_ratio,
    high_value_expense_frequency,
    basic_metrics,
    risk_indicators,
    category_deviation_index,
    department_expense_intensity,
    recurring_expense_variance,
    expense_complexity_scores,
    cross_department_expense_ratio,
    expense_timing_anomaly_score,
    vendor_loyalty_index,
    expense_categorization_accuracy
  } = advancedMetrics;

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

  // Prepare data for charts
  const departmentIntensityData = Object.entries(department_expense_intensity).map(([dept, amount]) => ({
    department: dept,
    amount: amount,
    color: getColorByIndex(Object.keys(department_expense_intensity).indexOf(dept))
  }));

  const categoryDeviationData = category_deviation_index
    .filter(item => item.cdi > 1.5) // Show only significant deviations
    .sort((a, b) => b.cdi - a.cdi)
    .slice(0, 10)
    .map((item, index) => ({
      ...item,
      color: getColorByIndex(index)
    }));

  const recurringVarianceData = recurring_expense_variance
    .sort((a, b) => b.variance - a.variance)
    .map((item, index) => ({
      ...item,
      color: getColorByIndex(index)
    }));

  const crossDeptData = cross_department_expense_ratio
    .sort((a, b) => b.total_spend - a.total_spend)
    .map((item, index) => ({
      ...item,
      color: getColorByIndex(index)
    }));

  const timingAnomalyData = expense_timing_anomaly_score
    .filter(item => item.etas_score > 1.0) // Show only significant anomalies
    .sort((a, b) => b.etas_score - a.etas_score)
    .map((item, index) => ({
      ...item,
      color: getColorByIndex(index)
    }));

  const complexityScoreDistribution = expense_complexity_scores.reduce((acc, expense) => {
    acc[expense.score] = (acc[expense.score] || 0) + 1;
    return acc;
  }, {});

  const complexityData = Object.entries(complexityScoreDistribution).map(([score, count]) => ({
    score: `Level ${score}`,
    count: count,
    color: getColorByIndex(parseInt(score))
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
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" color="text.secondary">
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: colorScheme.primary }}>
          Advanced Analytics Dashboard
        </Typography>

        {/* Key Risk Indicators */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Risk Indicators
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Expense Velocity
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.chartColors[0] }}>
                  {expense_velocity_ratio.toFixed(1)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Approval Concentration
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.chartColors[1] }}>
                  {approval_concentration_index.toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Payment Risk
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.chartColors[2] }}>
                  {payment_method_risk_score.toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Vendor Concentration
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.chartColors[3] }}>
                  {vendor_concentration_ratio.toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Risk Warnings */}
        {Object.values(risk_indicators).some(warning => warning) && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Risk Warnings Detected:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {risk_indicators.high_aci_warning && (
                <Typography variant="caption">• High approval concentration detected</Typography>
              )}
              {risk_indicators.high_pmrs_warning && (
                <Typography variant="caption">• High payment method risk detected</Typography>
              )}
              {risk_indicators.high_vcr_warning && (
                <Typography variant="caption">• High vendor concentration detected</Typography>
              )}
              {risk_indicators.high_hvef_warning && (
                <Typography variant="caption">• High value expense frequency detected</Typography>
              )}
            </Box>
          </Alert>
        )}

        {/* High Value Expense Analysis */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            High Value Expense Analysis
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  High Value Count
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.error }}>
                  {high_value_expense_frequency.count}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Percentage
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.error }}>
                  {high_value_expense_frequency.percentage.toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Threshold
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.warning }}>
                  {formatCurrency(high_value_expense_frequency.threshold)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Total Expenses
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.textSecondary }}>
                  {high_value_expense_frequency.total_count}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Department Expense Intensity Chart */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Department Expense Intensity
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentIntensityData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="department" 
                  tick={{ fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="amount" 
                  fill={colorScheme.primary}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Category Deviation Index */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Category Deviation Index (Top Anomalies)
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDeviationData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colorScheme.border} />
                <XAxis 
                  dataKey="category"
                  tick={{ fontSize: 11, fill: colorScheme.textSecondary }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: colorScheme.textSecondary }}
                  label={{ 
                    value: 'Deviation Index', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: colorScheme.textSecondary }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="cdi" 
                  fill={colorScheme.chartColors[4]}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          
          {/* Additional Information */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
              Deviation Analysis:
            </Typography>
            <Grid container spacing={2}>
              {categoryDeviationData.slice(0, 3).map((item, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.category}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.chartColors[4] }}>
                      CDI: {item.cdi.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ${item.spend.toLocaleString()} vs ${item.department_avg.toFixed(0)} avg
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Expense Complexity Distribution */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Expense Complexity Distribution
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complexityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {complexityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{
                    paddingTop: '20px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
          
          {/* Additional Information */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
              Complexity Breakdown:
            </Typography>
            <Grid container spacing={2}>
              {complexityData.map((item, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        backgroundColor: item.color, 
                        borderRadius: '50%', 
                        mx: 'auto', 
                        mb: 0.5 
                      }} 
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.count} expenses
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {((item.count / complexityData.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Cross Department Expense Ratio */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Cross-Department Expense Distribution
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crossDeptData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="total_spend" 
                  fill={colorScheme.chartColors[5]}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* Expense Categorization Accuracy */}
        {expense_categorization_accuracy.misclassification_count > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Potential Categorization Issues:
            </Typography>
            <Typography variant="body2">
              {expense_categorization_accuracy.misclassification_count} expenses may be misclassified
            </Typography>
          </Alert>
        )}

        {/* Basic Metrics Summary */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Basic Metrics Summary:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                Total Expenses: {basic_metrics.total_expenses}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                Total Amount: {formatCurrency(basic_metrics.total_amount)}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                Average: {formatCurrency(basic_metrics.average_expense)}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                Date Range: {basic_metrics.date_range_days} days
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
} 