import React from 'react';
import { Card, CardContent, Box, Typography, Button, Grid } from '@mui/material';
import { 
  Download as DownloadIcon, 
  PictureAsPdf as PdfIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { dashboardColors as colors } from '../../../utils/dashboardColors';
import { formatCurrency } from '../../../utils/colorScheme';

export const EngagementBanner = ({ 
  engagementName, 
  testTimestamp, 
  overallStatus, 
  totalGlRecords,
  completenessScore,
  testsPassed,
  totalTests,
  criticalIssuesCount,
  processingDuration,
  comprehensiveStatistics,
  onDownload,
  onExportPdf
}) => {
  return (
    <Card sx={{ 
      bgcolor: 'white',
      borderRadius: 3, 
      border: 'none',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      mb: 4
    }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header with Export Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ 
              mb: 1, 
              color: colors.text, 
              fontSize: '1.5rem'
            }}>
              {engagementName || 'Engagement Report'}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: colors.textSecondary, 
              mb: 0.5, 
              fontWeight: 400
            }}>
              Uploaded: {testTimestamp ? new Date(testTimestamp).toLocaleDateString() : 'N/A'}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: colors.textSecondary, 
              fontWeight: 400
            }}>
              Status: {overallStatus || 'N/A'} • Records: {totalGlRecords?.toLocaleString() || '0'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              sx={{
                bgcolor: colors.orange,
                color: 'white',
                minWidth: 'auto',
                width: 40,
                height: 40,
                padding: 0,
                '&:hover': {
                  bgcolor: colors.primaryDark
                }
              }}
              title="Export Excel"
              onClick={onDownload}
            >
              <DownloadIcon />
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#dc2626',
                color: 'white',
                minWidth: 'auto',
                width: 40,
                height: 40,
                padding: 0,
                '&:hover': {
                  bgcolor: '#b91c1c'
                }
              }}
              title="Export PDF Report"
              onClick={onExportPdf}
            >
              <PdfIcon />
            </Button>
          </Box>
        </Box>

        {/* Main Content with Circular Progress and Metrics */}
        <Grid container spacing={2}>
          {/* Circular Progress */}
          <Grid size={{xs: 12, md: 3}} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <Box>
              <Box sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `conic-gradient(${'#10b981'} 0deg ${(completenessScore || 0) * 3.6}deg, #e5e7eb ${(completenessScore || 0) * 3.6}deg 360deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <Box sx={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="h5" fontWeight={700} sx={{ color: colors.textSecondary }}>
                    {completenessScore?.toFixed(0) || '0'}%
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Final Result Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center',flexDirection: 'column' }}>
              <Typography fontSize={'0.8rem'} fontWeight={600} sx={{ color: colors.text, mt: 1 }}>
                Final Result
              </Typography>
              <Box sx={{ 
                bgcolor: '#10b981', 
                color: 'white', 
                fontWeight: 600,
                fontSize: '0.75rem',
                px: 2,
                py: 0.5,
                borderRadius: 1
              }}>
                SUCCESS
              </Box>
            </Box>
          </Grid>

          {/* Key Metrics Grid */}
          <Grid size={{xs: 12, md: 9}}>
            <Grid container spacing={2}>
              {/* Row 1 - Test Results */}
              <Grid size={{xs: 6, md: 3}}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 24, color: colors.orange }} />
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, fontSize: '1.25rem' }}>
                      {testsPassed || '0'}/{totalTests || '0'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Tests Passed
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{xs: 6, md: 3}}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                  <SecurityIcon sx={{ fontSize: 24, color: colors.orange }} />
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, fontSize: '1.25rem' }}>
                      {criticalIssuesCount || '0'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Critical Issues
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{xs: 6, md: 3}}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                  <AssessmentIcon sx={{ fontSize: 24, color: colors.orange }} />
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, fontSize: '1.25rem' }}>
                      {comprehensiveStatistics?.summary_statistics?.account_verification_pass_rate ? 
                        ((comprehensiveStatistics.summary_statistics.account_verification_pass_rate * 100).toFixed(1)) : '0'}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Account Verification
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{xs: 6, md: 3}}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                  <AssessmentIcon sx={{ fontSize: 24, color: colors.orange }} />
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, fontSize: '1.25rem' }}>
                      {processingDuration?.toFixed(2) || '0'}s
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Processing Time
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Row 2 - Financial Stats */}
              <Grid size={{xs: 6, md: 3}}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                  <MoneyIcon sx={{ fontSize: 24, color: colors.orange }} />
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, fontSize: '1.25rem' }}>
                      {formatCurrency((comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.total_debit_amount || 0) + (comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.total_credit_amount || 0))}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Total Amount
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{xs: 6, md: 3}}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                  <AccountBalanceIcon sx={{ fontSize: 24, color: colors.orange }} />
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, fontSize: '1.25rem' }}>
                      {formatCurrency(comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.total_debit_amount || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Total Debit
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{xs: 6, md: 3}}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                  <AccountBalanceIcon sx={{ fontSize: 24, color: colors.orange }} />
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, fontSize: '1.25rem' }}>
                      {formatCurrency(comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.total_credit_amount || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Total Credit
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{xs: 6, md: 3}}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 24, color: colors.orange }} />
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, fontSize: '1.25rem' }}>
                      {comprehensiveStatistics?.enhanced_statistics?.basic_totals?.total_transactions?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                      Transactions
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
