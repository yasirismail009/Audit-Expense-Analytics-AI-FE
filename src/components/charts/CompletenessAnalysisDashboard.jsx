import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';

// Import individual chart components
import CompletenessTrendChart from './CompletenessTrendChart';
import AccountDistributionChart from './AccountDistributionChart';
import FinancialMetricsChart from './FinancialMetricsChart';
import ProfitCenterAnalysisChart from './ProfitCenterAnalysisChart';
import UserTransactionCountsChart from './UserTransactionCountsChart';
import UserCreditDebitAnalysisChart from './UserCreditDebitAnalysisChart';
import AccountTransactionCountsChart from './AccountTransactionCountsChart';

export default function CompletenessAnalysisDashboard({ data }) {
  // Extract currency from data or use default
  const currency = data?.currency || data?.test_result?.currency || 'SAR';

  return (
    <Box sx={{ mb: 4 }}>
      {/* Dashboard Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 600, 
          mb: 2, 
          color: '#1f2937',
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <TrendingUpIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
          Completeness Analysis Dashboard
        </Typography>
        <Typography variant="body1" sx={{ 
          color: '#6b7280',
          fontSize: '1rem'
        }}>
          Comprehensive overview of data completeness, account verification, and financial metrics
        </Typography>
      </Box>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Row 1: Main Chart */}
        <Grid item size={{xs: 12}}>
          <CompletenessTrendChart data={data} currency={currency} />
        </Grid>

        {/* Row 2: Distribution Charts */}
        <Grid item size={{xs: 12, md: 8}}>
          <AccountDistributionChart data={data} currency={currency} />
        </Grid>
        <Grid item size={{xs: 12, md: 4}}>
          <FinancialMetricsChart data={data} currency={currency} />
        </Grid>

        {/* Row 3: Enhanced Analysis Charts */}
        <Grid item size={{xs: 12, md: 6}}>
          <ProfitCenterAnalysisChart data={data} currency={currency} />
        </Grid>
        <Grid item size={{xs: 12, md: 6}}>
          <UserTransactionCountsChart data={data} currency={currency} />
        </Grid>

        {/* Row 4: User and Account Analysis */}
        <Grid item size={{xs: 12, md: 6}}>
          <UserCreditDebitAnalysisChart data={data} currency={currency} />
        </Grid>
        <Grid item size={{xs: 12, md: 6}}>
          <AccountTransactionCountsChart data={data} currency={currency} />
        </Grid>
      </Grid>
    </Box>
  );
}
