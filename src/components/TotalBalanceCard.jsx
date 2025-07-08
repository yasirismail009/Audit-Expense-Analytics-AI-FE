import React from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';

export default function TotalBalanceCard() {
  return (
    <Card sx={{ bgcolor: '#014D4E', color: 'white', borderRadius: 3, boxShadow: '0 4px 24px 0 rgba(1,77,78,0.10)', p: 1 }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 500 }}>Total Balance</Typography>
            <Typography variant="h3" fontWeight={700} sx={{ mt: 1, letterSpacing: '-2px' }}>€ 320.845,20</Typography>
            <Typography variant="body2" sx={{ color: '#6ee7b7', mt: 1, fontWeight: 600 }}>+15.8%</Typography>
          </Box>
          <Box>
            <Button variant="contained" sx={{ bgcolor: '#00B686', color: 'white', mr: 1, boxShadow: 'none', '&:hover': { bgcolor: '#019e76' } }}>+ ADD</Button>
            <Button variant="outlined" sx={{ color: 'white', borderColor: 'white', mr: 1, '&:hover': { borderColor: '#00B686', color: '#00B686' } }}>SEND</Button>
            <Button variant="outlined" sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: '#00B686', color: '#00B686' } }}>REQUEST</Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 