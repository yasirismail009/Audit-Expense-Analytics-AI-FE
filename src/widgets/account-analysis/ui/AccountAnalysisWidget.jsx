import React from 'react';
import { Grid, Typography, Tooltip, Chip, Box } from '@mui/material';
import { dashboardColors as colors } from '../../../utils/dashboardColors';
import { StatusCard } from '../../../shared/ui/status-card/StatusCard';
import { DataTable } from '../../../shared/ui/data-table/DataTable';
import { formatCurrency } from '../../../utils/colorScheme';

export const AccountAnalysisWidget = ({ data }) => {
  if (!data) return null;

  const overviewCards = [
    {
      title: 'COMPLETENESS SCORE',
      value: `${data.overall?.score || 0}%`,
      status: data.overall?.status,
      color: data.overall?.status === 'EXCELLENT' ? '#10b981' : data.overall?.status === 'GOOD' ? '#f59e0b' : '#ef4444',
      trend: data.overall?.status === 'EXCELLENT' ? '▲' : '▼',
      trendValue: data.overall?.status
    },
    {
      title: 'GL TOTAL DEBIT',
      value: formatCurrency(data.comprehensiveStatistics?.document_statistics?.gl_debit_total || 0),
      subtitle: 'Total Debits',
      color: colors.orange
    },
    {
      title: 'GL TOTAL CREDIT',
      value: formatCurrency(data.comprehensiveStatistics?.document_statistics?.gl_credit_total || 0),
      subtitle: 'Total Credits',
      color: colors.orange
    },
    {
      title: 'NET BALANCE',
      value: formatCurrency(data.comprehensiveStatistics?.document_statistics?.gl_net_balance || 0),
      subtitle: 'BALANCED',
      color: colors.primary
    }
  ];

  const financialCards = [
    {
      title: 'MAX AMOUNT',
      value: formatCurrency(data.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.max_amount || 0),
      subtitle: 'Single Transaction',
      color: colors.text
    },
    {
      title: 'MEAN AMOUNT',
      value: formatCurrency(data.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.mean_amount || 0),
      subtitle: 'Average Transaction',
      color: colors.primary
    },
    {
      title: 'MEDIAN AMOUNT',
      value: formatCurrency(data.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.median_amount || 0),
      subtitle: 'Middle Value',
      color: colors.text
    },
    {
      title: 'STD DEVIATION',
      value: formatCurrency(data.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.std_deviation_amount || 0),
      subtitle: 'Variability',
      color: colors.primary
    }
  ];

  const accountCards = [
    {
      title: 'TOTAL USERS',
      value: data.comprehensiveStatistics?.enhanced_statistics?.basic_totals?.total_users || 0,
      subtitle: 'Active Users',
      color: colors.text
    },
    {
      title: 'PROFIT CENTERS',
      value: data.comprehensiveStatistics?.enhanced_statistics?.basic_totals?.total_profit_centers || 0,
      subtitle: 'Business Units',
      color: colors.primary
    },
    {
      title: 'DEBIT ENTRIES',
      value: data.comprehensiveStatistics?.enhanced_statistics?.basic_totals?.total_debit_entries?.toLocaleString() || 0,
      subtitle: 'Journal Lines',
      color: colors.text
    },
    {
      title: 'CREDIT ENTRIES',
      value: data.comprehensiveStatistics?.enhanced_statistics?.basic_totals?.total_credit_entries?.toLocaleString() || 0,
      subtitle: 'Journal Lines',
      color: colors.primary
    }
  ];

  const auditCards = [
    {
      title: 'USERS WITH ACTIVITY',
      value: data.comprehensiveStatistics?.enhanced_statistics?.data_quality_metrics?.users_with_activity || 0,
      subtitle: 'Active Users',
      color: colors.text
    },
    {
      title: 'ACCOUNTS WITH TRANSACTIONS',
      value: data.comprehensiveStatistics?.enhanced_statistics?.data_quality_metrics?.accounts_with_transactions || 0,
      subtitle: 'Active Accounts',
      color: colors.text
    },
    {
      title: 'AVG TRANSACTIONS/USER',
      value: Math.round(data.comprehensiveStatistics?.enhanced_statistics?.data_quality_metrics?.average_transactions_per_user || 0).toLocaleString(),
      subtitle: 'Per User',
      color: colors.text
    },
    {
      title: 'AVG TRANSACTIONS/ACCOUNT',
      value: Math.round(data.comprehensiveStatistics?.enhanced_statistics?.data_quality_metrics?.average_transactions_per_account || 0).toLocaleString(),
      subtitle: 'Per Account',
      color: colors.primary
    }
  ];

  const documentCards = [
    {
      title: 'GL DEBIT TOTAL',
      value: formatCurrency(data?.comprehensiveStatistics?.document_statistics?.gl_debit_total || 0),
      subtitle: 'Total Debit Amount',
      color: colors.primary
    },
    {
      title: 'GL CREDIT TOTAL',
      value: formatCurrency(data?.comprehensiveStatistics?.document_statistics?.gl_credit_total || 0),
      subtitle: 'Total Credit Amount',
      color: colors.orange
    },
    {
      title: 'GL NET BALANCE',
      value: formatCurrency(data?.comprehensiveStatistics?.document_statistics?.gl_net_balance || 0),
      subtitle: 'Net Balance',
      color: colors.secondary
    },
    {
      title: 'UNIQUE ACCOUNTS',
      value: data?.comprehensiveStatistics?.document_statistics?.unique_accounts?.toLocaleString() || '0',
      subtitle: 'Total Unique Accounts',
      color: colors.text
    }
  ];

  const monthlyColumns = [
    { header: 'Month', field: 'month' },
    { 
      header: 'Debit Total', 
      field: 'debit_total', 
      render: (value) => formatCurrency(value || 0),
      tooltip: (value) => `Exact Amount: ${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`
    },
    { 
      header: 'Credit Total', 
      field: 'credit_total', 
      render: (value) => formatCurrency(value || 0),
      tooltip: (value) => `Exact Amount: ${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`
    },
    { 
      header: 'Total Volume', 
      field: 'total_volume', 
      render: (value) => formatCurrency(value || 0),
      tooltip: (value) => `Exact Amount: ${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`
    },
    { header: 'Transactions', field: 'transaction_count', render: (value) => (value || 0).toLocaleString() },
    { 
      header: 'Net Amount', 
      field: 'net_amount', 
      render: (value) => (
        <Chip 
          label={formatCurrency(value || 0)}
          size="small"
          sx={{
            cursor: 'help',
            bgcolor: (value || 0) === 0 ? '#dcfce7' : (value || 0) > 0 ? '#dcfce7' : '#fee2e2',
            color: (value || 0) === 0 ? '#059669' : (value || 0) > 0 ? '#059669' : colors.text,
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        />
      ),
      tooltip: (value) => `Exact Net Amount: ${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`
    }
  ];

  return (
    <Box>
      {/* Overview Tab Content */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {overviewCards.map((card, index) => (
          <Grid size={{xs: 12, sm: 6, md: 3}} key={index}>
            <StatusCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Stats Row */}
      <Grid container spacing={3}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <StatusCard
            title="TOTAL ACCOUNTS"
            value={data.comprehensiveStatistics?.enhanced_statistics?.basic_totals?.total_gl_accounts || 0}
            subtitle="Unique Accounts"
            color={colors.text}
          />
        </Grid>
      </Grid>

      {/* Monthly Statistics Table */}
      <DataTable
        title="Monthly Transaction Summary"
        columns={monthlyColumns}
        data={data.monthlyTrends || []}
        showPagination={false}
      />
    </Box>
  );
};
