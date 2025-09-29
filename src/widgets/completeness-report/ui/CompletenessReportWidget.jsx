import React from 'react';
import { Card, CardContent, Box, Typography, CircularProgress, Grid } from '@mui/material';
import { dashboardColors as colors } from '../../../utils/dashboardColors';
import { StatusCard } from '../../../shared/ui/status-card/StatusCard';
import { DataTable } from '../../../shared/ui/data-table/DataTable';

export const CompletenessReportWidget = ({ data, onTestClick }) => {
  if (!data) return null;

  const statusConfig = {
    EXCELLENT: { color: '#10b981', status: 'Excellent' },
    GOOD: { color: '#f59e0b', status: 'Good' },
    NEEDS_IMPROVEMENT: { color: '#ef4444', status: 'Needs Work' },
    NO_RESULTS: { color: '#6b7280', status: 'No Results' }
  };

  const overallStatus = statusConfig[data.overall?.status] || { color: '#6b7280', status: 'Unknown' };

  const testColumns = [
    { header: 'Test', field: 'field' },
    { 
      header: 'Status', 
      field: 'status', 
      render: (value) => (
        <Box sx={{
          bgcolor: value === 'PASSED' ? '#dcfce7' : '#fee2e2',
          color: value === 'PASSED' ? '#059669' : colors.text,
          fontSize: '0.75rem',
          fontWeight: 600,
          px: 1.5,
          py: 0.5,
          borderRadius: 1
        }}>
          {value}
        </Box>
      )
    },
    { header: 'Score', field: 'completeness', render: (value) => `${value || 0}%` },
    { header: 'Records', field: 'records', render: (value) => (value || 0).toLocaleString() },
    { header: 'Description', field: 'description' }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Test Results Card */}
      <Grid size={{xs: 12, md: 4}}>
        <Card sx={{ 
          bgcolor: colors.surface, 
          borderRadius: 3, 
          height: '100%',
          border: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Typography variant="h6" fontWeight={600} color={colors.text} sx={{ fontSize: '1rem' }}>
                Test Results
              </Typography>
              <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem' }}>
                {data.fieldAnalysis?.length || 0} Categories
              </Typography>
            </Box>
            
            <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={120}
                  thickness={8}
                  sx={{ color: colors.lightGray }}
                />
                <CircularProgress
                  variant="determinate"
                  value={data.overall?.score || 0}
                  size={120}
                  thickness={8}
                  sx={{ 
                    color: overallStatus.color,
                    position: 'absolute',
                    left: 0,
                    top: 0
                  }}
                />
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <Box sx={{ color: '#10b981', mb: 0.5 }}>▲</Box>
                  <Typography variant="h6" fontWeight={700} color={colors.text}>
                    {data.overall?.score || 0}%
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              {(data.categoryBreakdown || []).map((category, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: category.color,
                    mr: 2
                  }} />
                  <Typography variant="body2" sx={{ flex: 1, fontSize: '0.875rem', color: colors.text }}>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color={category.color} sx={{ fontSize: '0.875rem' }}>
                    {category.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Test Details Table */}
      <Grid size={{xs: 12, md: 8}}>
        <DataTable
          title="Test Details"
          columns={testColumns}
          data={data.fieldAnalysis || []}
          showPagination={false}
        />
      </Grid>
    </Grid>
  );
};
