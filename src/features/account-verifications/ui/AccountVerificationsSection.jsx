import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip, Button, Tooltip } from '@mui/material';
import { Error as ErrorIcon, Assessment as AssessmentIcon, CheckCircle as CheckCircleIcon, TrendingUp as TrendingUpIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { dashboardColors as colors } from '../../../utils/dashboardColors';
import { StatusCard } from '../../../shared/ui/status-card/StatusCard';
import { DataTable } from '../../../shared/ui/data-table/DataTable';
import { formatCurrency } from '../../../utils/colorScheme';

export const AccountVerificationsSection = ({ 
  accountVerifications, 
  failedAccountVerifications,
  onAccountClick 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!accountVerifications) {
    return (
      <Box sx={{ mb: 4, textAlign: 'center', py: 4 }}>
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontStyle: 'italic' }}>
          Account verification details are not available for this engagement
        </Typography>
      </Box>
    );
  }

  const summaryCards = [
    {
      title: 'TOTAL VERIFICATIONS',
      value: (accountVerifications.results?.total_verifications || 0).toLocaleString(),
      subtitle: `${accountVerifications.count || 0} Accounts`,
      color: colors.orange,
      icon: AssessmentIcon
    },
    {
      title: 'PASSED ACCOUNTS',
      value: accountVerifications.count || 0,
      subtitle: `${((accountVerifications.count || 0) / (accountVerifications.results?.total_verifications || 1) * 100).toFixed(1)}% Success`,
      color: '#10b981',
      icon: CheckCircleIcon
    },
    {
      title: 'FAILED ACCOUNTS',
      value: failedAccountVerifications?.results?.results?.length || 0,
      subtitle: 'Requires Review',
      color: colors.lightGray,
      icon: ErrorIcon
    },
    {
      title: 'PASS RATE',
      value: `${((accountVerifications.count || 0) / (accountVerifications.results?.total_verifications || 1) * 100).toFixed(1)}%`,
      subtitle: 'Account Level',
      color: colors.lightGray,
      icon: TrendingUpIcon
    }
  ];

  const tableColumns = [
    { header: 'Account Code', field: 'account_code' },
    { header: 'GL Debit', field: 'gl_debit_total', render: (value) => formatCurrency(value || 0) },
    { header: 'GL Credit', field: 'gl_credit_total', render: (value) => formatCurrency(value || 0) },
    { header: 'TB Debit', field: 'tb_debit', render: (value) => formatCurrency(value || 0) },
    { header: 'TB Credit', field: 'tb_credit', render: (value) => formatCurrency(value || 0) },
    { header: 'Balance Variance', field: 'variance_formatted', render: (value) => value || '0.00' },
    { 
      header: 'Status', 
      field: 'status', 
      render: (value, row) => (
        <Chip 
          label={`${row.status_icon} ${value}`}
          size="small"
          sx={{
            bgcolor: value === 'PASS' ? '#dcfce7' : '#fee2e2',
            color: value === 'PASS' ? '#059669' : '#dc2626',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        />
      )
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: colors.text }}>
        Account Verifications Details
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, index) => (
          <Grid item size={{xs: 12, sm: 6, md: 3}} key={index}>
            <StatusCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Failed Account Verifications Cards */}
      {failedAccountVerifications?.results?.results && failedAccountVerifications.results.results.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ color: colors.text, mb: 3 }}>
            Failed Account Verifications
            <Chip 
              label={`${failedAccountVerifications.results.results.length} Issues`}
              size="small"
              sx={{
                bgcolor: colors.primary,
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                ml: 1
              }}
            />
          </Typography>
          
          <Grid container spacing={3}>
            {failedAccountVerifications.results.results.map((account, index) => (
              <Grid item size={{xs: 12, sm: 6, md: 6, lg: 4}} key={index}>
                <Card sx={{ 
                  bgcolor: colors.surface,
                  borderRadius: 3,
                  height: '100%',
                  border: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'box-shadow 0.2s ease'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    {/* Account Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: colors.primary
                        }} />
                        <Typography variant="h6" fontWeight={600} sx={{ color: colors.text, fontSize: '1rem' }}>
                          {account.status_icon} {account.account_code}
                        </Typography>
                      </Box>
                      <Chip 
                        label={account.status}
                        size="small"
                        sx={{
                          bgcolor: colors.background,
                          color: colors.primary,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          border: `1px solid ${colors.primary}`
                        }}
                      />
                    </Box>

                    {/* Variance Information */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem', fontWeight: 600, mb: 1, display: 'block' }}>
                        AUDIT VARIANCE
                      </Typography>
                      <Typography variant="h6" fontWeight={600} sx={{ color: colors.text, fontSize: '1.1rem' }}>
                        {account.audit_variance_formatted || formatCurrency(account.audit_variance || 0)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem' }}>
                        {account.variance_note || 'Balance discrepancy detected'}
                      </Typography>
                    </Box>

                    {/* Key Metrics */}
                    <Box>
                      <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem', fontWeight: 600, mb: 1, display: 'block' }}>
                        KEY METRICS
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Box sx={{ p: 1.5, bgcolor: colors.background, borderRadius: 1 }}>
                            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
                              Opening Balance
                            </Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, fontSize: '0.8rem' }}>
                              {formatCurrency(account.opening_balance || 0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ p: 1.5, bgcolor: colors.background, borderRadius: 1 }}>
                            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
                              Closing Balance
                            </Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, fontSize: '0.8rem' }}>
                              {formatCurrency(account.closing_balance || 0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ p: 1.5, bgcolor: colors.background, borderRadius: 1 }}>
                            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
                              Debit Variance
                            </Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, fontSize: '0.8rem' }}>
                              {formatCurrency(account.gl_vs_tb_debit_variance || 0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ p: 1.5, bgcolor: colors.background, borderRadius: 1 }}>
                            <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
                              Credit Variance
                            </Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, fontSize: '0.8rem' }}>
                              {formatCurrency(account.gl_vs_tb_credit_variance || 0)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Status Indicators */}
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${colors.borderLight}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
                            Movements Match
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, fontSize: '0.75rem' }}>
                            {account.gl_tb_movements_match ? '✅ Yes' : '❌ No'}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
                            Balance Equation
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ color: colors.text, fontSize: '0.75rem' }}>
                            {account.balance_equation_correct ? '✅ Correct' : '❌ Incorrect'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* View Details Button */}
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="View Account Details" arrow>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => onAccountClick && onAccountClick(account)}
                            sx={{
                              borderColor: colors.primary,
                              color: colors.primary,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: 'rgba(59, 130, 246, 0.1)',
                                borderColor: colors.primary
                              }
                            }}
                          >
                            View Details
                          </Button>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Account Verification Results Table */}
      {accountVerifications.results?.results && (
        <DataTable
          title="Account Verification Summary"
          subtitle="GL vs TB account-level reconciliation results"
          columns={tableColumns}
          data={accountVerifications.results.results}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </Box>
  );
};
