import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';

export default function MyCardsSection() {
  return (
    <Card sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 4px 24px 0 rgba(1,77,78,0.10)', p: 1 }}>
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="subtitle2">My Cards</Typography>
          <Button size="small" variant="text" sx={{ color: '#014D4E', fontWeight: 600 }}>See All</Button>
        </Box>
        <Box sx={{ bgcolor: '#014D4E', borderRadius: 2, p: 2, color: 'white', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CreditCardIcon sx={{ fontSize: 32, color: 'white', opacity: 0.8 }} />
            <Typography variant="body2" fontWeight={600} sx={{ letterSpacing: 2 }}>VISA **** 2104</Typography>
          </Box>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>€ 4.540,20</Typography>
        </Box>
      </CardContent>
    </Card>
  );
} 