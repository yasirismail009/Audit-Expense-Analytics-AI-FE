import React from 'react';
import { Paper, Typography } from '@mui/material';

export default function RawDataDisplay({ data, title = 'Raw Analysis Data' }) {
  if (!data) return null;

  return (
    <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {JSON.stringify(data, null, 2)}
      </Typography>
    </Paper>
  );
} 