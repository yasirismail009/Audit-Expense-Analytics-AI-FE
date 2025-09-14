import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  LinearProgress
} from '@mui/material';

import { dashboardColors as colors } from '../../utils/dashboardColors';

export default function AnnualProfitsCard({ 
  year = "2023",
  profits = ["1 Completed", "2 Pending", "0 Processing", "0 Failed"]
}) {
  // Parse the status data to get actual numbers and labels
  const statusData = profits.map(profit => {
    const parts = profit.split(' ');
    const count = parseInt(parts[0]) || 0;
    const label = parts.slice(1).join(' ');
    return { count, label, original: profit };
  });

  const totalFiles = statusData.reduce((sum, item) => sum + item.count, 0);
  
  // Color mapping for different statuses
  const getStatusColor = (label) => {
    switch (label.toLowerCase()) {
      case 'completed': return colors.text;
      case 'pending': return colors.orange;
      case 'processing': return '#3B82F6';
      case 'failed': return '#EF4444';
      default: return colors.gray;
    }
  };
  return (
    <Grid item size={{xs:12, md:3}}>
      <Card sx={{
        height: '100%',
        minHeight: 400, // Set minimum height to make it bigger
        bgcolor: colors.surface,
        borderRadius: 3,
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: colors.text,
              fontSize: '1rem'
            }}>
              File Status
            </Typography>
            <Chip
              label={year}
              size="small"
              sx={{
                bgcolor: colors.lightGray,
                color: colors.text,
                fontSize: '0.75rem'
              }}
            />
          </Box>
          
          {/* Summary Stats */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              color: colors.text,
              fontSize: '2.5rem',
              mb: 1
            }}>
              {totalFiles}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: colors.textSecondary,
              fontSize: '0.9rem'
            }}>
              Total Files
            </Typography>
          </Box>

          {/* Status Breakdown */}
          <Box sx={{ flex: 1 }}>
            {statusData.map((status, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: getStatusColor(status.label)
                    }} />
                    <Typography variant="body2" sx={{ 
                      color: colors.text,
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}>
                      {status.label}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ 
                    color: colors.text,
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    {status.count}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={totalFiles > 0 ? (status.count / totalFiles) * 100 : 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: colors.lightGray,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getStatusColor(status.label),
                      borderRadius: 4
                    }
                  }}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}
