import React from 'react';
import { Box, Grid } from '@mui/material';
import TotalBalanceCard from './TotalBalanceCard';
import CashFlowChart from './CashFlowChart';
import SummaryCards from './SummaryCards';
import IncomeExpenseCard from './IncomeExpenseCard';
import RecentActivityTable from './RecentActivityTable';
import MyCardsSection from './MyCardsSection';
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
      <Grid container spacing={3}>
        {/* Top row */}
        <Grid item size={{xs:12, md:8}}>
          <TotalBalanceCard />
        </Grid>
        <Grid item size={{xs:12, md:4}}>
          <CashFlowChart />
        </Grid>
        {/* Second row */}
        <Grid item size={{xs:12, md:4}}>
          <IncomeExpenseCard />
        </Grid>
        <Grid item size={{xs:12, md:4}}>
          <SummaryCards />
        </Grid>
        <Grid item size={{xs:12, md:4}}>
          <RecentActivityTable />
        </Grid>
        {/* Bottom right */}
        <Grid item size={{xs:12, md:4}} sx={{ display: { xs: 'none', md: 'block' } }}>
          <MyCardsSection />
        </Grid>
      </Grid>
    </Box>
  );
} 