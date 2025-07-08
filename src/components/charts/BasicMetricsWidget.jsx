import React from 'react';
import { Card, CardContent, Typography, Box, Grid, Divider } from '@mui/material';
import { colorScheme } from '../../utils/colorScheme';

export default function BasicMetricsWidget({ basicMetrics }) {
  if (!basicMetrics) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Basic Metrics</Typography>
          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No basic metrics available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const {
    total_expenses,
    total_amount,
    average_expense,
    median_expense,
    largest_expense,
    smallest_expense,
    date_range_days
  } = basicMetrics;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const metrics = [
    {
      label: 'Total Expenses',
      value: total_expenses?.toLocaleString() || '0',
      subtitle: 'Number of transactions',
      color: colorScheme.primary
    },
    {
      label: 'Total Amount',
      value: formatCurrency(total_amount || 0),
      subtitle: 'Sum of all expenses',
      color: colorScheme.chartColors[0]
    },
    {
      label: 'Average Expense',
      value: formatCurrency(average_expense || 0),
      subtitle: 'Mean transaction value',
      color: colorScheme.chartColors[1]
    },
    {
      label: 'Median Expense',
      value: formatCurrency(median_expense || 0),
      subtitle: 'Middle transaction value',
      color: colorScheme.chartColors[2]
    },
    {
      label: 'Largest Expense',
      value: formatCurrency(largest_expense || 0),
      subtitle: 'Highest single transaction',
      color: colorScheme.chartColors[3]
    },
    {
      label: 'Smallest Expense',
      value: formatCurrency(smallest_expense || 0),
      subtitle: 'Lowest single transaction',
      color: colorScheme.chartColors[4]
    },
    {
      label: 'Date Range',
      value: `${date_range_days || 0} days`,
      subtitle: 'Period covered',
      color: colorScheme.chartColors[5]
    }
  ];

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: colorScheme.primary }}>
          Basic Metrics Overview
        </Typography>
        
        <Grid container spacing={2}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box 
                sx={{ 
                  p: 2, 
                  backgroundColor: colorScheme.background, 
                  borderRadius: 2,
                  border: `2px solid ${metric.color}20`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: metric.color,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${metric.color}30`
                  }
                }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: metric.color,
                    mb: 0.5
                  }}
                >
                  {metric.value}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: colorScheme.textPrimary,
                    mb: 0.5
                  }}
                >
                  {metric.label}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: colorScheme.textSecondary,
                    fontStyle: 'italic'
                  }}
                >
                  {metric.subtitle}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Summary Insights */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: colorScheme.textPrimary }}>
            Key Insights:
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                • Average expense is {average_expense && median_expense ? 
                  (average_expense > median_expense ? 'higher' : 'lower') : 'comparable'} to median
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                • Largest expense is {largest_expense && average_expense ? 
                  Math.round((largest_expense / average_expense) * 100) / 100 : 0}x the average
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                • {total_expenses} transactions over {date_range_days} days
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                • Daily average: {date_range_days ? formatCurrency(total_amount / date_range_days) : '$0'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
} 