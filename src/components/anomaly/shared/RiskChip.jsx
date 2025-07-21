import React from 'react';
import { Chip } from '@mui/material';

export default function RiskChip({ score, size = 'small' }) {
  const getRiskColor = (score) => {
    if (score >= 80) return 'error';
    if (score >= 60) return 'warning';
    if (score >= 40) return 'info';
    return 'success';
  };

  const getRiskLabel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  return (
    <Chip 
      label={score || 'N/A'} 
      size={size}
      color={getRiskColor(score)}
      title={`Risk Level: ${getRiskLabel(score)}`}
    />
  );
} 