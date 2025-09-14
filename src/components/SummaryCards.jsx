import React from 'react';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SavingsIcon from '@mui/icons-material/Savings';
import ShieldIcon from '@mui/icons-material/Shield';
import { colorScheme } from '../utils/colorScheme';

const summaryData = [
  {
    icon: <AccountBalanceIcon sx={{ color: colorScheme.success, fontSize: 28 }} />, 
    title: 'Audit Tests Passed', 
    value: '24/28', 
    change: '+16.0%', 
    changeColor: colorScheme.success, 
    sub: 'vs. 20/28 Last Period'
  },
  {
    icon: <SavingsIcon sx={{ color: colorScheme.error, fontSize: 28 }} />, 
    title: 'Anomalies Detected', 
    value: '12', 
    change: '-8.2%', 
    changeColor: colorScheme.error, 
    sub: 'vs. 15 Last Period'
  },
  {
    icon: <ShieldIcon sx={{ color: colorScheme.warning, fontSize: 28 }} />, 
    title: 'Risk Score', 
    value: '7.2/10', 
    change: '+36.2%', 
    changeColor: colorScheme.warning, 
    sub: 'vs. 5.3/10 Last Period'
  },
];

export default function SummaryCards() {
  return (
    <Card sx={{ 
      bgcolor: colorScheme.cardBackground, 
      borderRadius: 3, 
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
      p: 1,
      border: `1px solid ${colorScheme.border}`
    }}>
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {summaryData.map((item, idx) => (
            <Grid item xs={12} md={4} key={item.title}>
              <Box display="flex" alignItems="center" gap={2}>
                {item.icon}
                <Box>
                  <Typography variant="body2" color="text.secondary">{item.title}</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: colorScheme.textPrimary }}>{item.value} <span style={{ color: item.changeColor, fontWeight: 600, fontSize: 14 }}>{item.change}</span></Typography>
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