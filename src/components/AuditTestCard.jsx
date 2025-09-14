import React from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress, IconButton } from '@mui/material';
import { 
  CheckCircleIcon, 
  ErrorIcon, 
  WarningIcon, 
  PlayArrowIcon,
  RefreshIcon 
} from '@mui/icons-material';
import { colorScheme } from '../utils/colorScheme';

const auditTests = [
  {
    id: 1,
    name: 'Duplicate Detection',
    status: 'PASSED',
    progress: 100,
    lastRun: '2 hours ago',
    anomalies: 0
  },
  {
    id: 2,
    name: 'Amount Validation',
    status: 'FAILED',
    progress: 75,
    lastRun: '1 hour ago',
    anomalies: 3
  },
  {
    id: 3,
    name: 'Date Consistency',
    status: 'WARNING',
    progress: 90,
    lastRun: '30 min ago',
    anomalies: 1
  },
  {
    id: 4,
    name: 'User Activity',
    status: 'RUNNING',
    progress: 45,
    lastRun: 'Running...',
    anomalies: 0
  }
];

const getStatusIcon = (status) => {
  switch (status) {
    case 'PASSED':
      return <CheckCircleIcon sx={{ color: colorScheme.success, fontSize: 20 }} />;
    case 'FAILED':
      return <ErrorIcon sx={{ color: colorScheme.error, fontSize: 20 }} />;
    case 'WARNING':
      return <WarningIcon sx={{ color: colorScheme.warning, fontSize: 20 }} />;
    case 'RUNNING':
      return <RefreshIcon sx={{ color: colorScheme.info, fontSize: 20 }} />;
    default:
      return <CheckCircleIcon sx={{ color: colorScheme.textMuted, fontSize: 20 }} />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'PASSED':
      return colorScheme.success;
    case 'FAILED':
      return colorScheme.error;
    case 'WARNING':
      return colorScheme.warning;
    case 'RUNNING':
      return colorScheme.info;
    default:
      return colorScheme.textMuted;
  }
};

export default function AuditTestCard() {
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
          <Typography variant="h6" fontWeight={700} color={colorScheme.textPrimary}>
            Audit Tests
          </Typography>
          <IconButton 
            size="small" 
            sx={{ 
              bgcolor: colorScheme.primary, 
              color: 'white',
              '&:hover': { bgcolor: colorScheme.primaryDark }
            }}
          >
            <PlayArrowIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          {auditTests.map((test) => (
            <Box 
              key={test.id}
              sx={{ 
                p: 2, 
                borderRadius: 2, 
                border: `1px solid ${colorScheme.borderLight}`,
                bgcolor: colorScheme.background,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: colorScheme.border,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  {getStatusIcon(test.status)}
                  <Typography variant="body2" fontWeight={600} color={colorScheme.textPrimary}>
                    {test.name}
                  </Typography>
                </Box>
                <Chip 
                  label={test.status}
                  size="small"
                  sx={{
                    bgcolor: `${getStatusColor(test.status)}15`,
                    color: getStatusColor(test.status),
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
              
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Box flexGrow={1}>
                  <LinearProgress 
                    variant="determinate" 
                    value={test.progress} 
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: colorScheme.borderLight,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getStatusColor(test.status),
                        borderRadius: 3
                      }
                    }}
                  />
                </Box>
                <Typography variant="caption" color={colorScheme.textSecondary}>
                  {test.progress}%
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" color={colorScheme.textSecondary}>
                  Last run: {test.lastRun}
                </Typography>
                {test.anomalies > 0 && (
                  <Chip 
                    label={`${test.anomalies} anomaly${test.anomalies > 1 ? 'ies' : ''}`}
                    size="small"
                    sx={{
                      bgcolor: colorScheme.error,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
