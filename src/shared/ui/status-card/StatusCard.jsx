import React from 'react';
import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Error as ErrorIcon, Warning as WarningIcon, Info as InfoIcon } from '@mui/icons-material';
import { dashboardColors as colors } from '../../../utils/dashboardColors';

const statusConfig = {
  EXCELLENT: { color: '#10b981', icon: CheckCircleIcon, status: 'Excellent' },
  GOOD: { color: '#f59e0b', icon: WarningIcon, status: 'Good' },
  NEEDS_IMPROVEMENT: { color: '#ef4444', icon: ErrorIcon, status: 'Needs Work' },
  NO_RESULTS: { color: '#6b7280', icon: InfoIcon, status: 'No Results' }
};

export const StatusCard = ({ 
  title, 
  value, 
  subtitle, 
  status, 
  icon: Icon, 
  color, 
  trend,
  trendValue 
}) => {
  const statusInfo = statusConfig[status] || { color: '#6b7280', icon: InfoIcon, status: 'Unknown' };
  const StatusIcon = statusInfo.icon;

  return (
    <Card sx={{ 
      bgcolor: colors.surface, 
      borderRadius: 3, 
      height: '100%',
      border: 'none',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: color || statusInfo.color
            }} />
            <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {title}
            </Typography>
          </Box>
          {Icon ? <Icon sx={{ fontSize: 20, color: color || statusInfo.color }} /> : <StatusIcon sx={{ fontSize: 20, color: statusInfo.color }} />}
        </Box>
        <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
            {subtitle}
          </Typography>
        )}
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: statusInfo.color === '#10b981' ? '#dcfce7' : '#fee2e2',
              color: statusInfo.color === '#10b981' ? '#059669' : colors.secondary,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              {trend} {trendValue || statusInfo.status}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
