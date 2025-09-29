import React from 'react';
import { Card, CardContent, Box, Typography, Tooltip } from '@mui/material';
import { dashboardColors as colors } from '../../../utils/dashboardColors';
import { formatCurrency } from '../../../utils/colorScheme';

export const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = colors.text,
  tooltip,
  onClick
}) => {
  const cardContent = (
    <Card sx={{ 
      bgcolor: colors.surface, 
      borderRadius: 3, 
      height: '100%',
      border: 'none',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick ? {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'box-shadow 0.2s ease'
      } : {}
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: color
            }} />
            <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {title}
            </Typography>
          </Box>
          {Icon && <Icon sx={{ fontSize: 20, color }} />
        </Box>
        <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
          {typeof value === 'number' && value > 1000 ? formatCurrency(value) : value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {cardContent}
      </Tooltip>
    );
  }

  return cardContent;
};
