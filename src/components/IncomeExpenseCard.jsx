import React from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function IncomeExpenseCard() {
  return (
    <Card sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 4px 24px 0 rgba(1,77,78,0.10)', p: 1 }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <ArrowUpwardIcon sx={{ color: '#00B686', fontSize: 28 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Income</Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#014D4E' }}>€ 12.378,20 <span style={{ color: '#00B686', fontWeight: 600, fontSize: 14 }}>+45.0%</span></Typography>
            </Box>
          </Box>
          <Divider />
          <Box display="flex" alignItems="center" gap={1}>
            <ArrowDownwardIcon sx={{ color: '#F43F5E', fontSize: 28 }} />
            <Box>
              <Typography variant="body2" color="text.secondary">Expense</Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#014D4E' }}>€ 5.788,21 <span style={{ color: '#F43F5E', fontWeight: 600, fontSize: 14 }}>-12.5%</span></Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 