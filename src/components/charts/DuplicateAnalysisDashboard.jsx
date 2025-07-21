import React from 'react';
import { Box, Grid, Typography, Paper } from '@mui/material';
import DuplicateTypeChart from './DuplicateTypeChart';
import DuplicateRiskChart from './DuplicateRiskChart';
import DuplicateUserChart from './DuplicateUserChart';
import DuplicateAmountChart from './DuplicateAmountChart';

export default function DuplicateAnalysisDashboard({ data }) {
  if (!data) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No duplicate analysis data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f8ff 100%)',
      borderRadius: 3,
      p: 3,
      border: '1px solid rgba(255,255,255,0.3)'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        p: 2,
        background: 'linear-gradient(135deg, #925A9B, #36A2EB)',
        borderRadius: 2,
        color: 'white'
      }}>
        <Box sx={{ 
          width: 50, 
          height: 50, 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 3
        }}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>📊</Typography>
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Duplicate Analysis Dashboard
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Comprehensive overview of duplicate detection results
          </Typography>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Type Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            transform: 'translateY(0)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': { transform: 'translateY(-8px)' }
          }}>
            <DuplicateTypeChart data={data} />
          </Box>
        </Grid>
        
        {/* Risk Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            transform: 'translateY(0)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': { transform: 'translateY(-8px)' }
          }}>
            <DuplicateRiskChart data={data} />
          </Box>
        </Grid>
        
        {/* User Activity Chart */}
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            transform: 'translateY(0)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': { transform: 'translateY(-8px)' }
          }}>
            <DuplicateUserChart data={data} />
          </Box>
        </Grid>
        
        {/* Amount Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            transform: 'translateY(0)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': { transform: 'translateY(-8px)' }
          }}>
            <DuplicateAmountChart data={data} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
} 