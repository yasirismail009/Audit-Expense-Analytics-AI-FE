import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Container,
  useTheme,
  alpha
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Assessment as AssessmentIcon,
  TableChart as TableChartIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  NotificationsNone as NotificationsIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { dashboardColors as colors } from '../utils/dashboardColors';
import { colorScheme } from '../utils/colorScheme';

// Transform API response to UI format
const transformApiDataToUIFormat = (apiData) => {
  if (!apiData || !apiData.results || apiData.results.length === 0) {
    return null;
  }

  const result = apiData.results[0];
  const summary = apiData.summary || {};

  // Transform field analysis from test steps
  const fieldAnalysis = [
    {
      field: 'GL-TB Reconciliation',
      completeness: result.step1_gl_tb_reconciliation?.passed ? 100 : 0,
      records: (result.total_gl_records || 0) + (result.total_tb_records || 0),
      missing: result.step1_gl_tb_reconciliation?.passed ? 0 : 1,
      status: result.step1_gl_tb_reconciliation?.passed ? 'PASSED' : 'FAILED',
      description: result.step1_gl_tb_reconciliation?.description || 'GL totals reconciliation test',
      explanation: result.step1_gl_tb_reconciliation?.explanation || 'No details available'
    },
    {
      field: 'Debit-Credit Balance',
      completeness: result.step2_debit_credit_balance?.passed ? 100 : 0,
      records: (result.total_gl_records || 0) + (result.total_tb_records || 0),
      missing: result.step2_debit_credit_balance?.passed ? 0 : 1,
      status: result.step2_debit_credit_balance?.passed ? 'PASSED' : 'FAILED',
      description: result.step2_debit_credit_balance?.description || 'Debit-credit balance test',
      explanation: result.step2_debit_credit_balance?.explanation || 'No details available'
    },
    {
      field: 'Account Coverage',
      completeness: result.step3_account_coverage?.coverage_percentage || 0,
      records: result.step3_account_coverage?.tb_account_count || 0,
      missing: result.step3_account_coverage?.missing_count || 0,
      status: result.step3_account_coverage?.passed ? 'PASSED' : 'FAILED',
      description: result.step3_account_coverage?.description || 'Account coverage test',
      explanation: result.step3_account_coverage?.explanation || 'No details available'
    },
    {
      field: 'Transaction Gaps',
      completeness: result.step4_transaction_gaps?.passed ? 100 : 0,
      records: result.step4_transaction_gaps?.total_documents || 0,
      missing: result.step4_transaction_gaps?.document_gaps_found || 0,
      status: result.step4_transaction_gaps?.passed ? 'PASSED' : 'FAILED',
      description: result.step4_transaction_gaps?.description || 'Transaction gaps test',
      explanation: result.step4_transaction_gaps?.explanation || 'No details available'
    }
  ];

  // Transform time series data from the new API structure
  const timeSeriesData = result.monthly_trends?.map(trend => ({
    date: trend.month,
    completeness: summary.completeness_score || overallScore,
    debitTotal: trend.debit_total,
    creditTotal: trend.credit_total,
    netAmount: trend.net_amount,
    totalVolume: trend.total_volume,
    totalTransactions: trend.total_transactions,
    debitCount: trend.debit_count,
    creditCount: trend.credit_count
  })) || [];

  // Transform category breakdown
  const categoryBreakdown = [
    { name: 'GL Tests', value: result.step1_gl_tb_reconciliation?.passed ? 100 : 0, color: '#3b82f6' },
    { name: 'Balance Tests', value: result.step2_debit_credit_balance?.passed ? 100 : 0, color: '#10b981' },
    { name: 'Coverage Tests', value: result.step3_account_coverage?.coverage_percentage || 0, color: '#f59e0b' },
    { name: 'Gap Tests', value: result.step4_transaction_gaps?.passed ? 100 : 0, color: '#ef4444' }
  ];

  // Generate recommendations based on failed tests
  const recommendations = [];
  if (!result.step1_gl_tb_reconciliation?.passed) {
    recommendations.push({
      field: 'GL-TB Reconciliation',
      issue: 'GL and TB totals do not reconcile',
      recommendation: 'Review GL totals calculation and ensure TB balances are correctly captured',
      severity: 'Critical'
    });
  }
  if (!result.step2_debit_credit_balance?.passed) {
    recommendations.push({
      field: 'Debit-Credit Balance',
      issue: 'Debit and credit totals are imbalanced',
      recommendation: 'Verify all transactions are properly classified as debit or credit',
      severity: 'High'
    });
  }
  if (!result.step3_account_coverage?.passed) {
    recommendations.push({
      field: 'Account Coverage',
      issue: 'Some TB accounts missing from GL',
      recommendation: 'Ensure all trial balance accounts have corresponding general ledger entries',
      severity: 'Medium'
    });
  }
  if (!result.step4_transaction_gaps?.passed) {
    recommendations.push({
      field: 'Transaction Gaps',
      issue: 'Document sequence gaps detected',
      recommendation: 'Review document numbering system and identify missing transactions',
      severity: 'High'
    });
  }

  const passedTests = fieldAnalysis.filter(test => test.status === 'PASSED').length;
  const totalTests = fieldAnalysis.length;
  const overallScore = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return {
    overall: {
      score: overallScore,
      status: overallScore >= 80 ? 'EXCELLENT' : overallScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      engagementId: result.engagement_id || 'Unknown',
      completeFields: passedTests,
      totalFields: totalTests,
      criticalIssues: recommendations.filter(r => r.severity === 'Critical').length,
      totalRecords: (result.total_gl_records || 0) + (result.total_tb_records || 0)
    },
    fieldAnalysis,
    timeSeriesData,
    categoryBreakdown,
    recommendations,
    testDetails: {
      glRecords: result.total_gl_records || 0,
      tbRecords: result.total_tb_records || 0,
      processingTime: result.processing_time || 'Unknown',
      lastUpdated: result.created_at || new Date().toISOString()
    },
    chartData: result.chart_data || {},
    monthlyTrends: result.monthly_trends || [],
    userAnalysis: result.credit_debit_by_user || [],
    summaryStatistics: result.summary_statistics || {},
    documentStatistics: result.document_statistics || {},
    creditDebitBySubtype: result.credit_debit_by_subtype || []
  };
};

export default function CompletenessTestReport() {
  const { engagementId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompletenessData = async () => {
    if (!engagementId) {
      setError('No engagement ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:8000/api/completeness-test/engagement/${engagementId}/`, {
        timeout: 10000
      });
      
      const transformedData = transformApiDataToUIFormat(response.data);
      if (transformedData) {
        setData(transformedData);
      } else {
        throw new Error('Invalid or empty API response');
      }
    } catch (err) {
      console.error('Error fetching completeness data:', err);
      let errorMessage = 'Failed to load completeness test data';
      if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Backend server is not running. Please start the backend server.';
      } else if (err.code === 'ENOTFOUND') {
        errorMessage = 'Cannot connect to backend server. Please check if the server is running on localhost:8000.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Completeness test data not found for this engagement.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Backend server error. Please try again later.';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else {
        errorMessage = `Failed to load data: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletenessData();
  }, [engagementId]);

  const handleRefresh = () => fetchCompletenessData();
  const handleDownload = () => console.log('Download PDF');
  const handlePrint = () => console.log('Print report');

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ 
        bgcolor: '#fafafa', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} sx={{ color: colors.accent }} />
        <Typography variant="body1" sx={{ color: colors.textSecondary }}>
          Loading completeness test data...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh', p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
          sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!data || !data.overall || typeof data.overall.score === 'undefined') {
    return (
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh', p: 3 }}>
        <Alert 
          severity="warning" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
          sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}
        >
          Data is incomplete or malformed. Please try refreshing the report.
        </Alert>
      </Box>
    );
  }

  const overallStatus = {
    EXCELLENT: { color: '#10b981', icon: CheckCircleIcon, status: 'Excellent' },
    GOOD: { color: '#f59e0b', icon: WarningIcon, status: 'Good' },
    NEEDS_IMPROVEMENT: { color: '#ef4444', icon: ErrorIcon, status: 'Needs Work' }
  }[data.overall.status] || { color: '#6b7280', icon: InfoIcon, status: 'Unknown' };

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', p: 3 }}>
      {/* Modern Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} color={colors.text} sx={{ fontSize: '1.5rem', mb: 0.5 }}>
            Welcome, Analytics Team 👋
          </Typography>
          <Typography variant="body2" color={colors.textSecondary}>
            Let's analyze the completeness report today!
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            bgcolor: colors.surface, 
            borderRadius: 2, 
            px: 2, 
            py: 1, 
            display: 'flex', 
            alignItems: 'center',
            minWidth: 200,
            border: `1px solid ${colors.gray}`
          }}>
            <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem' }}>
              Search...
            </Typography>
          </Box>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: colors.lightGray,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: colors.text
          }}>
            AT
          </Box>
        </Box>
      </Box>

      {/* Main Stats Cards - Crypto Style */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card sx={{ 
            bgcolor: colors.surface, 
            borderRadius: 3, 
            height: '100%',
            border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: overallStatus.color
                  }} />
                  <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    SCORE/TOTAL
                  </Typography>
                </Box>
                <overallStatus.icon sx={{ fontSize: 20, color: overallStatus.color }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                {data.overall?.score || 0}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: overallStatus.color === '#10b981' ? '#dcfce7' : '#fee2e2',
                  color: overallStatus.color === '#10b981' ? '#059669' : colors.secondary,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {overallStatus.color === '#10b981' ? '▲' : '▼'} {overallStatus.status}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card sx={{ 
            bgcolor: colors.surface, 
            borderRadius: 3, 
            height: '100%',
            border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: colors.primary
                  }} />
                  <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    TESTS/TOTAL
                  </Typography>
                </Box>
                <TableChartIcon sx={{ fontSize: 20, color: colors.primary }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                {data.overall?.completeFields || 0}/{data.overall?.totalFields || 0}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: colors.lightGray,
                  color: colors.primary,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Tests Passed
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card sx={{ 
            bgcolor: colors.surface, 
            borderRadius: 3, 
            height: '100%',
            border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: colors.accent
                  }} />
                  <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    ISSUES/TOTAL
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 20, color: colors.accent }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                {data.overall?.criticalIssues || 0}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: colors.lightGray,
                  color: colors.accent,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Critical Issues
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card sx={{ 
            bgcolor: colors.surface, 
            borderRadius: 3, 
            height: '100%',
            border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: colors.orange
                  }} />
                  <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    RECORDS
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 20, color: colors.orange }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                {data.overall?.totalRecords?.toLocaleString() || '0'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: colors.lightGray,
                  color: colors.orange,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  GL + TB Records
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card sx={{ 
            bgcolor: colors.surface, 
            borderRadius: 3, 
            height: '100%',
            border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: colors.primary
                  }} />
                  <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    TOTAL USERS
                  </Typography>
                </Box>
                <SecurityIcon sx={{ fontSize: 20, color: colors.primary }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                {data.summaryStatistics?.total_users || 0}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: colors.lightGray,
                  color: colors.primary,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Most Active: {data.summaryStatistics?.most_active_user || 'N/A'}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card sx={{ 
            bgcolor: colors.surface, 
            borderRadius: 3, 
            height: '100%',
            border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: colors.secondary
                  }} />
                  <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    TOTAL DOCS
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 20, color: colors.secondary }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                {data.documentStatistics?.total_documents?.toLocaleString() || '0'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: colors.lightGray,
                  color: colors.secondary,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {data.documentStatistics?.duplicate_document_ratio?.toFixed(1) || 0}% Duplicates
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card sx={{ 
            bgcolor: colors.surface, 
            borderRadius: 3, 
            height: '100%',
            border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: colors.accent
                  }} />
                  <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    PEAK MONTH
                  </Typography>
                </Box>
                <NotificationsIcon sx={{ fontSize: 20, color: colors.accent }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                {data.summaryStatistics?.peak_month || 'N/A'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: colors.lightGray,
                  color: colors.accent,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {data.summaryStatistics?.months_covered || 0} Months Covered
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs: 12, sm: 6, md: 3}}>
          <Card sx={{ 
            bgcolor: colors.surface, 
            borderRadius: 3, 
            height: '100%',
            border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: colors.orange
                  }} />
                  <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    UNIQUE DOCS
                  </Typography>
                </Box>
                <TableChartIcon sx={{ fontSize: 20, color: colors.orange }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                {data.documentStatistics?.unique_documents?.toLocaleString() || '0'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: colors.lightGray,
                  color: colors.orange,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Document Analysis
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Wallet Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{xs: 12, md: 4}}>
          <Card sx={{ 
            bgcolor: colors.surface, 
            borderRadius: 3, 
            height: '100%',
            border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Typography variant="h6" fontWeight={600} color={colors.text} sx={{ fontSize: '1rem' }}>
                  Test Results
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem' }}>
                  {data.fieldAnalysis?.length || 0} Categories
                </Typography>
              </Box>
              
              <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={120}
                    thickness={8}
                    sx={{ color: '#f3f4f6' }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={data.overall?.score || 0}
                    size={120}
                    thickness={8}
                    sx={{ 
                      color: overallStatus.color,
                      position: 'absolute',
                      left: 0,
                      top: 0
                    }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <Box sx={{ color: '#10b981', mb: 0.5 }}>▲</Box>
                    <Typography variant="h6" fontWeight={700} color={colors.text}>
                      {data.overall?.score || 0}%
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                {(data.categoryBreakdown || []).map((category, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: category.color,
                      mr: 2
                    }} />
                    <Typography variant="body2" sx={{ flex: 1, fontSize: '0.875rem', color: colors.text }}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color={category.color} sx={{ fontSize: '0.875rem' }}>
                      {category.value}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs: 12, md: 8}}>
          <Card sx={{ 
            bgcolor: colors.surface, 
            borderRadius: 3, 
            height: '100%',
            border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600} color={colors.text} sx={{ fontSize: '1rem' }}>
                  Statistics
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['1D', '7D', '1M', '1Y', 'All'].map((period) => (
                    <Button
                      key={period}
                      size="small"
                      variant={period === '7D' ? 'contained' : 'text'}
                      sx={{ 
                        minWidth: 32,
                        height: 28,
                        fontSize: '0.75rem',
                        bgcolor: period === '7D' ? colors.primary : 'transparent',
                        color: period === '7D' ? colors.surface : colors.textSecondary,
                        '&:hover': {
                          bgcolor: period === '7D' ? colors.primary : colors.lightGray
                        }
                      }}
                    >
                      {period}
                    </Button>
                  ))}
                </Box>
              </Box>
              
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.timeSeriesData || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: colors.textSecondary }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: colors.textSecondary }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        if (name === 'debitTotal' || name === 'creditTotal' || name === 'totalVolume') {
                          return [`$${(value / 1000000).toFixed(2)}M`, name === 'debitTotal' ? 'Debit Total' : name === 'creditTotal' ? 'Credit Total' : 'Total Volume'];
                        }
                        if (name === 'totalTransactions') {
                          return [value.toLocaleString(), 'Total Transactions'];
                        }
                        return [value, name];
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="debitTotal" 
                      stroke={colors.primary} 
                      strokeWidth={2}
                      dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: colors.primary, strokeWidth: 2 }}
                      name="Debit Total"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="creditTotal" 
                      stroke={colors.secondary} 
                      strokeWidth={2}
                      dot={{ fill: colors.secondary, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: colors.secondary, strokeWidth: 2 }}
                      name="Credit Total"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalVolume" 
                      stroke={colors.accent} 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: colors.accent, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: colors.accent, strokeWidth: 2 }}
                      name="Total Volume"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Test Results Table */}
      <Card sx={{ 
        bgcolor: colors.surface, 
        borderRadius: 3, 
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        mb: 4
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} color={colors.text} sx={{ fontSize: '1rem', mb: 3 }}>
            Test Details
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: '0.875rem' }}>Test</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: '0.875rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: '0.875rem' }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: '0.875rem' }}>Records</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: '0.875rem' }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data.fieldAnalysis || []).map((test, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{test.field}</TableCell>
                    <TableCell>
                      <Chip 
                        label={test.status}
                        size="small"
                        sx={{
                          bgcolor: test.status === 'PASSED' ? '#dcfce7' : '#fee2e2',
                          color: test.status === 'PASSED' ? '#059669' : '#dc2626',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{test.completeness || 0}%</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{(test.records || 0).toLocaleString()}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', color: colors.textSecondary }}>{test.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* User Analytics Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{xs: 12, md: 6}}>
          <Card sx={{ 
            bgcolor: colors.surface, 
            borderRadius: 3, 
            border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} color={colors.text} sx={{ fontSize: '1rem', mb: 3 }}>
                Top Users by Transaction Volume
              </Typography>
              
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(data.userAnalysis || []).slice(0, 10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="user_name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: colors.textSecondary }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: colors.textSecondary }}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => [
                        `$${(value / 1000000).toFixed(2)}M`, 
                        name === 'debit_total' ? 'Debit Total' : 'Credit Total'
                      ]}
                    />
                    <Bar dataKey="debit_total" fill={colors.primary} name="Debit Total" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="credit_total" fill={colors.secondary} name="Credit Total" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{xs: 12, md: 6}}>
          <Card sx={{ 
            bgcolor: colors.surface, 
            borderRadius: 3, 
            border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} color={colors.text} sx={{ fontSize: '1rem', mb: 3 }}>
                User Volume Distribution (Top 8)
              </Typography>
              
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(data.userAnalysis || []).slice(0, 8).map((user, index) => ({
                        name: user.user_name,
                        value: user.total_volume,
                        fill: [
                          '#FF6384',
                          '#36A2EB', 
                          '#FFCE56',
                          '#4BC0C0',
                          '#9966FF',
                          '#FF9F40',
                          '#FF6384',
                          '#C9CBCF'
                        ][index]
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                      labelLine={false}
                    />
                    <RechartsTooltip 
                      formatter={(value) => [`$${(value / 1000000).toFixed(2)}M`, 'Volume']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Statistics Table */}
      <Card sx={{ 
        bgcolor: colors.surface, 
        borderRadius: 3, 
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        mb: 4
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} color={colors.text} sx={{ fontSize: '1rem', mb: 3 }}>
            Monthly Transaction Summary
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: '0.875rem' }}>Month</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: '0.875rem' }}>Debit Total</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: '0.875rem' }}>Credit Total</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: '0.875rem' }}>Total Volume</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: '0.875rem' }}>Transactions</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: '0.875rem' }}>Net Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data.monthlyTrends || []).map((month, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{month.month}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>${(month.debit_total / 1000000).toFixed(2)}M</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>${(month.credit_total / 1000000).toFixed(2)}M</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>${(month.total_volume / 1000000).toFixed(2)}M</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{month.total_transactions.toLocaleString()}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      <Chip 
                        label={`$${(month.net_amount / 1000000).toFixed(2)}M`}
                        size="small"
                        sx={{
                          bgcolor: month.net_amount === 0 ? '#dcfce7' : month.net_amount > 0 ? '#dcfce7' : '#fee2e2',
                          color: month.net_amount === 0 ? '#059669' : month.net_amount > 0 ? '#059669' : '#dc2626',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{ 
            borderColor: colors.gray,
            color: colors.textSecondary,
            '&:hover': { 
              borderColor: colors.textSecondary,
              bgcolor: colors.lightGray
            }
          }}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          sx={{ 
            bgcolor: colors.primary,
            '&:hover': { 
              bgcolor: alpha(colors.primary, 0.8)
            }
          }}
        >
          Export PDF
        </Button>
      </Box>
    </Box>
  );
}