import React from 'react';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import ShieldIcon from '@mui/icons-material/Shield';

const summaryData = [
  {
    icon: <AccountBalanceIcon sx={{ color: '#00B686', fontSize: 28 }} />, title: 'Business account', value: '€ 8.672,20', change: '+16.0%', changeColor: '#00B686', sub: 'vs. 7.120,41 Last Period'
  },
  {
    icon: <SavingsIcon sx={{ color: '#F43F5E', fontSize: 28 }} />, title: 'Total Saving', value: '€ 3.765,35', change: '-8.2%', changeColor: '#F43F5E', sub: 'vs. 4.115,50 Last Period'
  },
  {
    icon: <ShieldIcon sx={{ color: '#14b8a6', fontSize: 28 }} />, title: 'Tax Reserve', value: '€ 14.376,16', change: '+36.2%', changeColor: '#00B686', sub: 'vs. 10.235,46 Last Period'
  },
];

export default function SummaryCards() {
  return (
    <Card sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 4px 24px 0 rgba(1,77,78,0.10)', p: 1 }}>
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {summaryData.map((item, idx) => (
            <Grid item xs={12} md={4} key={item.title}>
              <Box display="flex" alignItems="center" gap={2}>
                {item.icon}
                <Box>
                  <Typography variant="body2" color="text.secondary">{item.title}</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#014D4E' }}>{item.value} <span style={{ color: item.changeColor, fontWeight: 600, fontSize: 14 }}>{item.change}</span></Typography>
                  <Typography variant="caption" color="text.secondary">{item.sub}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
} 