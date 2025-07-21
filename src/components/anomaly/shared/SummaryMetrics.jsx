import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

export default function SummaryMetrics({ metrics }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {metrics.map((metric, index) => (
        <Grid item xs={12} md={3} key={index}>
          <Paper sx={{ 
            p: 2, 
            textAlign: 'center', 
            bgcolor: metric.bgColor || '#f5f5f5',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 3
            }
          }}>
            <Typography variant="h6" color={metric.color || 'text.primary'}>
              {metric.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {metric.label}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
} 