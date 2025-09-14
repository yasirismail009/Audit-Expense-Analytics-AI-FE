import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import { colorScheme } from '../utils/colorScheme';

export default function TotalBalanceCard() {
  return (
    <Card sx={{ 
      bgcolor: colorScheme.primary, 
      color: 'white', 
      borderRadius: 3, 
      boxShadow: '0 2px 8px rgba(146, 90, 155, 0.15)', 
      p: 1,
      border: `1px solid ${colorScheme.border}`
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 500 }}>Audit Compliance Score</Typography>
            <Typography variant="h3" fontWeight={700} sx={{ mt: 1, letterSpacing: '-2px' }}>87.5%</Typography>
            <Typography variant="body2" sx={{ color: colorScheme.secondary, mt: 1, fontWeight: 600 }}>+12.3% vs last month</Typography>
          </Box>
          <Box>
            <Button variant="contained" sx={{ bgcolor: colorScheme.secondary, color: 'white', mr: 1, boxShadow: 'none', '&:hover': { bgcolor: '#047857' } }}>RUN AUDIT</Button>
            <Button variant="outlined" sx={{ color: 'white', borderColor: 'white', mr: 1, '&:hover': { borderColor: colorScheme.secondary, color: colorScheme.secondary } }}>EXPORT</Button>
            <Button variant="outlined" sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: colorScheme.secondary, color: colorScheme.secondary } }}>SETTINGS</Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 