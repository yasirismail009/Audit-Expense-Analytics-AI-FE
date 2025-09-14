import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import TotalBalanceCard from './TotalBalanceCard';
import CashFlowChart from './CashFlowChart';
import SummaryCards from './SummaryCards';
import IncomeExpenseCard from './IncomeExpenseCard';
import RecentActivityTable from './RecentActivityTable';
import MyCardsSection from './MyCardsSection';
import AuditTestCard from './AuditTestCard';
import AnomalyDetectionCard from './AnomalyDetectionCard';
import { colorScheme } from '../utils/colorScheme';

export default function Dashboard() {
  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 4 },
        py: 4,
        background: colorScheme.background,
        minHeight: '100vh',
        width: '100%',
        maxWidth: '1600px', // Optional: for very large screens
        mx: 'auto',
      }}
    >
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} color={colorScheme.textPrimary} mb={1}>
          Audit & Anomaly Detection Dashboard
        </Typography>
        <Typography variant="body1" color={colorScheme.textSecondary}>
          Monitor audit tests, detect anomalies, and manage risk assessment
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Top row - Audit Overview */}
        <Grid item size={{xs:12, md:8}}>
          <TotalBalanceCard />
        </Grid>
        <Grid item size={{xs:12, md:4}}>
          <CashFlowChart />
        </Grid>
        
        {/* Second row - Audit Tests and Anomaly Detection */}
        <Grid item size={{xs:12, md:6}}>
          <AuditTestCard />
        </Grid>
        <Grid item size={{xs:12, md:6}}>
          <AnomalyDetectionCard />
        </Grid>
        
        {/* Third row - Summary and Activity */}
        <Grid item size={{xs:12, md:4}}>
          <SummaryCards />
        </Grid>
        <Grid item size={{xs:12, md:4}}>
          <IncomeExpenseCard />
        </Grid>
        <Grid item size={{xs:12, md:4}}>
          <RecentActivityTable />
        </Grid>
        
        {/* Bottom row */}
        <Grid item size={{xs:12, md:4}} sx={{ display: { xs: 'none', md: 'block' } }}>
          <MyCardsSection />
        </Grid>
      </Grid>
    </Box>
  );
} 