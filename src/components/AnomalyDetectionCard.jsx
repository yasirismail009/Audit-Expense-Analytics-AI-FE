import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { 
  SecurityIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  MoreVertIcon,
  WarningIcon,
  ErrorIcon,
  InfoIcon
} from '@mui/icons-material';
import { colorScheme } from '../utils/colorScheme';

const anomalies = [
  {
    id: 1,
    type: 'HIGH_RISK',
    description: 'Unusual spending pattern detected',
    amount: '€12,450',
    user: 'John Doe',
    timestamp: '2 hours ago',
    severity: 'HIGH'
  },
  {
    id: 2,
    type: 'MEDIUM_RISK',
    description: 'Duplicate transaction found',
    amount: '€3,200',
    user: 'Jane Smith',
    timestamp: '4 hours ago',
    severity: 'MEDIUM'
  },
  {
    id: 3,
    type: 'LOW_RISK',
    description: 'Weekend transaction anomaly',
    amount: '€850',
    user: 'Mike Johnson',
    timestamp: '6 hours ago',
    severity: 'LOW'
  },
  {
    id: 4,
    type: 'CRITICAL',
    description: 'Suspicious vendor activity',
    amount: '€25,000',
    user: 'Sarah Wilson',
    timestamp: '8 hours ago',
    severity: 'CRITICAL'
  }
];

const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'CRITICAL':
      return <ErrorIcon sx={{ color: colorScheme.error, fontSize: 20 }} />;
    case 'HIGH':
      return <WarningIcon sx={{ color: colorScheme.warning, fontSize: 20 }} />;
    case 'MEDIUM':
      return <InfoIcon sx={{ color: colorScheme.info, fontSize: 20 }} />;
    case 'LOW':
      return <SecurityIcon sx={{ color: colorScheme.success, fontSize: 20 }} />;
    default:
      return <InfoIcon sx={{ color: colorScheme.textMuted, fontSize: 20 }} />;
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'CRITICAL':
      return colorScheme.error;
    case 'HIGH':
      return colorScheme.warning;
    case 'MEDIUM':
      return colorScheme.info;
    case 'LOW':
      return colorScheme.success;
    default:
      return colorScheme.textMuted;
  }
};

export default function AnomalyDetectionCard() {
  return (
    <Card sx={{ 
      bgcolor: colorScheme.cardBackground, 
      borderRadius: 3, 
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
      border: `1px solid ${colorScheme.border}`,
      height: '100%'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <SecurityIcon sx={{ color: colorScheme.primary, fontSize: 24 }} />
            <Typography variant="h6" fontWeight={700} color={colorScheme.textPrimary}>
              Anomaly Detection
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={`${anomalies.length} Active`}
              size="small"
              sx={{
                bgcolor: colorScheme.error,
                color: 'white',
                fontWeight: 600
              }}
            />
            <IconButton size="small">
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        <List sx={{ p: 0 }}>
          {anomalies.map((anomaly, index) => (
            <ListItem 
              key={anomaly.id}
              sx={{ 
                p: 2, 
                mb: 1, 
                borderRadius: 2, 
                border: `1px solid ${colorScheme.borderLight}`,
                bgcolor: colorScheme.background,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: getSeverityColor(anomaly.severity),
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {getSeverityIcon(anomaly.severity)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2" fontWeight={600} color={colorScheme.textPrimary}>
                      {anomaly.description}
                    </Typography>
                    <Chip 
                      label={anomaly.severity}
                      size="small"
                      sx={{
                        bgcolor: `${getSeverityColor(anomaly.severity)}15`,
                        color: getSeverityColor(anomaly.severity),
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                    <Box>
                      <Typography variant="caption" color={colorScheme.textSecondary}>
                        {anomaly.user} • {anomaly.amount}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color={colorScheme.textMuted}>
                      {anomaly.timestamp}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        <Box 
          sx={{ 
            mt: 2, 
            p: 2, 
            borderRadius: 2, 
            bgcolor: colorScheme.sidebarBackground,
            border: `1px solid ${colorScheme.border}`
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" fontWeight={600} color={colorScheme.textPrimary}>
              Detection Summary
            </Typography>
            <Box display="flex" gap={1}>
              <Chip 
                label="1 Critical"
                size="small"
                sx={{ bgcolor: colorScheme.error, color: 'white', fontSize: '0.75rem' }}
              />
              <Chip 
                label="1 High"
                size="small"
                sx={{ bgcolor: colorScheme.warning, color: 'white', fontSize: '0.75rem' }}
              />
              <Chip 
                label="1 Medium"
                size="small"
                sx={{ bgcolor: colorScheme.info, color: 'white', fontSize: '0.75rem' }}
              />
              <Chip 
                label="1 Low"
                size="small"
                sx={{ bgcolor: colorScheme.success, color: 'white', fontSize: '0.75rem' }}
              />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
