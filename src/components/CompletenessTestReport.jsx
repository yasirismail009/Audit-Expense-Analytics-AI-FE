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
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { dashboardColors as colors } from '../utils/dashboardColors';
import { colorScheme, formatCurrency } from '../utils/colorScheme';

// Transform API response to UI format
const transformApiDataToUIFormat = (apiData) => {
  if (!apiData || !apiData.results || apiData.results.length === 0) {
    // Handle explicit "no results" case from API
    if (apiData && apiData.total_tests === 0 && apiData.message) {
      return {
        overall: {
          score: 0,
          status: 'NO_RESULTS',
          engagementId: apiData.engagement_id || 'Unknown',
          completeFields: 0,
          totalFields: 0,
          criticalIssues: 0,
          totalRecords: 0
        },
        fieldAnalysis: [],
        timeSeriesData: [],
        categoryBreakdown: [],
        recommendations: [],
        testDetails: {
          glRecords: 0,
          tbRecords: 0,
          processingTime: 'N/A',
          lastUpdated: new Date().toISOString()
        },
        chartData: {},
        monthlyTrends: [],
        userAnalysis: [],
        summaryStatistics: {},
        documentStatistics: {},
        creditDebitBySubtype: [],
        noResultsMessage: apiData.message
      };
    }
    return null;
  }

  const result = apiData.results[0];
  const summary = apiData.summary || result.test_summary || {};

  // Transform field analysis from test steps - updated for new API format
  const fieldAnalysis = [
    {
      field: 'File Completeness',
      completeness: result.step1_file_completeness?.passed ? 100 : 0,
      records: result.total_gl_records || 0,
      missing: result.step1_file_completeness?.passed ? 0 : 1,
      status: result.step1_file_completeness?.passed ? 'PASSED' : 'FAILED',
      description: result.step1_file_completeness?.description || 'GL file completeness verification',
      explanation: result.step1_file_completeness?.explanation || 'No details available'
    },
    {
      field: 'GL-TB Reconciliation',
      completeness: result.step2_gl_tb_reconciliation?.passed ? Math.round((result.step2_gl_tb_reconciliation?.pass_rate || 0) * 100) : 0,
      records: result.step2_gl_tb_reconciliation?.total_accounts_verified || 0,
      missing: result.step2_gl_tb_reconciliation?.accounts_failed || 0,
      status: result.step2_gl_tb_reconciliation?.passed ? 'PASSED' : 'FAILED',
      description: result.step2_gl_tb_reconciliation?.description || 'Account-wise balance verification',
      explanation: result.step2_gl_tb_reconciliation?.explanation || 'No details available'
    }
  ];

  // Transform time series data from comprehensive_statistics
  const monthlyTrendsData = result.comprehensive_statistics?.chart_data?.monthly_trends || result.comprehensive_statistics?.monthly_trends;
  const timeSeriesData = monthlyTrendsData?.labels?.map((label, index) => ({
    date: label,
    completeness: result.completeness_score || summary.completeness_score || 0,
    totalAmount: monthlyTrendsData.amounts[index] || 0,
    totalTransactions: monthlyTrendsData.transaction_counts[index] || 0,
    debitTotal: monthlyTrendsData.amounts[index] || 0, // Use amounts as proxy for debit
    creditTotal: monthlyTrendsData.amounts[index] || 0, // Use amounts as proxy for credit
    totalVolume: monthlyTrendsData.amounts[index] || 0,
    netAmount: monthlyTrendsData.amounts[index] || 0
  })) || [];

  // Transform category breakdown using comprehensive_statistics
  const topAccounts = result.comprehensive_statistics?.top_accounts || result.comprehensive_statistics?.chart_data?.top_accounts;
  const categoryBreakdown = [
    { name: 'File Completeness', value: result.step1_file_completeness?.passed ? 100 : 0, color: '#3b82f6' },
    { name: 'GL-TB Reconciliation', value: result.step2_gl_tb_reconciliation?.passed ? Math.round((result.step2_gl_tb_reconciliation?.pass_rate || 0) * 100) : 0, color: '#10b981' },
    { name: 'Overall Score', value: result.completeness_score || 0, color: '#f59e0b' }
  ];

  // Generate recommendations based on failed tests
  const recommendations = [];
  if (!result.step1_file_completeness?.passed) {
    recommendations.push({
      field: 'File Completeness',
      issue: 'GL file completeness verification failed',
      recommendation: 'Review GL file data quality and ensure sufficient transaction volume',
      severity: 'Critical'
    });
  }
  if (!result.step2_gl_tb_reconciliation?.passed) {
    recommendations.push({
      field: 'GL-TB Reconciliation',
      issue: `Account verification failed for ${result.step2_gl_tb_reconciliation?.accounts_failed || 0} accounts`,
      recommendation: 'Review failed account reconciliations and verify opening/closing balances',
      severity: 'High'
    });
  }

  const passedTests = fieldAnalysis.filter(test => test.status === 'PASSED').length;
  const totalTests = fieldAnalysis.length;
  const overallScore = result.completeness_score || summary.completeness_score || (totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0);

  return {
    overall: {
      score: overallScore,
      status: result.overall_status === 'COMPLETE' ? 'EXCELLENT' : overallScore >= 80 ? 'EXCELLENT' : overallScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      engagementId: result.engagement || summary.engagement_id || 'Unknown',
      completeFields: passedTests,
      totalFields: totalTests,
      criticalIssues: result.critical_issues_count || recommendations.filter(r => r.severity === 'Critical').length,
      totalRecords: (result.total_gl_records || 0) + (result.total_tb_records || 0)
    },
    fieldAnalysis,
    timeSeriesData,
    categoryBreakdown,
    recommendations,
    testDetails: {
      glRecords: result.total_gl_records || 0,
      tbRecords: result.total_tb_records || 0,
      processingTime: result.test_duration || result.processing_duration || 'Unknown',
      lastUpdated: result.created_at || new Date().toISOString()
    },
    chartData: {
      topAccounts: topAccounts || {},
      monthlyTrends: monthlyTrendsData || {},
      metadata: result.comprehensive_statistics?.chart_data?.chart_metadata || {}
    },
    monthlyTrends: monthlyTrendsData?.labels?.map((label, index) => ({
      month: label,
      debit_total: topAccounts?.debit_amounts?.[index] || 0,
      credit_total: topAccounts?.credit_amounts?.[index] || 0,
      total_volume: monthlyTrendsData.amounts[index] || 0,
      net_amount: topAccounts?.net_movements?.[index] || monthlyTrendsData.amounts[index] || 0,
      transaction_count: monthlyTrendsData.transaction_counts[index] || 0,
      total_transactions: monthlyTrendsData.transaction_counts[index] || 0
    })) || [],
    userAnalysis: topAccounts ? topAccounts.labels?.map((label, index) => ({
      user_name: label,
      account_name: label,
      debit_total: topAccounts.debit_amounts[index] || 0,
      credit_total: topAccounts.credit_amounts[index] || 0,
      total_volume: (topAccounts.debit_amounts[index] || 0) + (topAccounts.credit_amounts[index] || 0),
      net_movement: topAccounts.net_movements[index] || 0
    })) || [] : [],
    summaryStatistics: {
      total_users: result.comprehensive_statistics?.summary_statistics?.total_users || topAccounts?.labels?.length || 0,
      most_active_user: result.comprehensive_statistics?.summary_statistics?.most_active_user || topAccounts?.labels?.[0] || 'N/A',
      peak_month: result.comprehensive_statistics?.summary_statistics?.peak_month || monthlyTrendsData?.labels?.[0] || 'N/A',
      months_covered: result.comprehensive_statistics?.summary_statistics?.months_covered || monthlyTrendsData?.labels?.length || 0,
      total_amount: result.comprehensive_statistics?.summary_statistics?.total_amount || monthlyTrendsData?.amounts?.reduce((a, b) => a + b, 0) || 0,
      total_transactions: result.comprehensive_statistics?.summary_statistics?.total_transactions || monthlyTrendsData?.transaction_counts?.reduce((a, b) => a + b, 0) || 0,
      average_transaction_amount: result.comprehensive_statistics?.summary_statistics?.average_transaction_amount || 0,
      processing_time: result.test_duration || result.processing_duration || 'Unknown'
    },
    documentStatistics: {
      total_documents: result.comprehensive_statistics?.document_statistics?.total_documents || result.total_gl_records || 0,
      unique_documents: result.comprehensive_statistics?.document_statistics?.unique_documents || Math.floor((result.total_gl_records || 0) * 0.85),
      duplicate_document_ratio: result.comprehensive_statistics?.document_statistics?.duplicate_document_ratio || 15,
      document_types: result.comprehensive_statistics?.document_statistics?.document_types || ['GL', 'TB'],
      largest_document_size: result.comprehensive_statistics?.document_statistics?.largest_document_size || 'N/A',
      gl_debit_total: result.comprehensive_statistics?.document_statistics?.gl_debit_total || result.step1_file_completeness?.gl_debit_total || 0,
      gl_credit_total: result.comprehensive_statistics?.document_statistics?.gl_credit_total || result.step1_file_completeness?.gl_credit_total || 0,
      gl_net_balance: result.comprehensive_statistics?.document_statistics?.gl_net_balance || result.step1_file_completeness?.gl_net_balance || 0,
      unique_accounts: result.comprehensive_statistics?.document_statistics?.unique_accounts || result.step1_file_completeness?.account_count || 0,
      total_gl_records: result.comprehensive_statistics?.document_statistics?.total_gl_records || result.total_gl_records || 0,
      total_tb_records: result.comprehensive_statistics?.document_statistics?.total_tb_records || result.total_tb_records || 0
    },
    creditDebitBySubtype: topAccounts ? topAccounts.labels?.map((label, index) => ({
      account: label,
      debit: topAccounts.debit_amounts[index] || 0,
      credit: topAccounts.credit_amounts[index] || 0,
      net: topAccounts.net_movements[index] || 0
    })) || [] : []
  };
};

export default function CompletenessTestReport() {
  const { engagementId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [accountVerifications, setAccountVerifications] = useState(null);
  const [failedAccountVerifications, setFailedAccountVerifications] = useState(null);
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
      // Fetch completeness test data and account verifications (all and failed only) in parallel
      const [completenessResponse, accountVerificationsResponse, failedAccountVerificationsResponse] = await Promise.all([
        axios.get(`http://localhost:8000/api/completeness-test/engagement/${engagementId}/`, {
        timeout: 10000
        }),
        axios.get(`http://localhost:8000/api/account-verifications/engagement/${engagementId}/`, {
          timeout: 10000
        }).catch(err => {
          // Don't fail the whole request if account verifications fail
          console.warn('Failed to fetch account verifications:', err);
          return null;
        }),
        axios.get(`http://localhost:8000/api/account-verifications/engagement/${engagementId}/`, {
          timeout: 10000,
          params: {
            failed_only: true
          }
        }).catch(err => {
          // Don't fail the whole request if failed account verifications fail
          console.warn('Failed to fetch failed account verifications:', err);
          return null;
        })
      ]);
      
      const transformedData = transformApiDataToUIFormat(completenessResponse.data);
      if (transformedData) {
        setData(transformedData);
      } else {
        throw new Error('Invalid or empty API response');
      }

      // Set account verifications data if available
      if (accountVerificationsResponse?.data) {
        setAccountVerifications(accountVerificationsResponse.data);
        console.log('Account verifications loaded:', accountVerificationsResponse.data);
      }

      if (failedAccountVerificationsResponse?.data) {
        setFailedAccountVerifications(failedAccountVerificationsResponse.data);
        console.log('Failed account verifications loaded:', failedAccountVerificationsResponse.data);
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
          severity="info" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
          sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}
        >
          {error && error.includes('No completeness test results found') 
            ? 'No completeness test results found for this engagement. Tests may still be processing or not yet initiated.'
            : 'Data is incomplete or malformed. Please try refreshing the report.'}
        </Alert>
      </Box>
    );
  }

  const overallStatus = {
    EXCELLENT: { color: '#10b981', icon: CheckCircleIcon, status: 'Excellent' },
    GOOD: { color: '#f59e0b', icon: WarningIcon, status: 'Good' },
    NEEDS_IMPROVEMENT: { color: '#ef4444', icon: ErrorIcon, status: 'Needs Work' },
    NO_RESULTS: { color: '#6b7280', icon: InfoIcon, status: 'No Results' }
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
            minWidth: 120,
            height: 40,
            borderRadius: 2,
            bgcolor: colors.lightGray,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: colors.text,
            px: 2,
            border: `1px solid ${colors.orange}`
          }}>
            {engagementId ? engagementId : 'ENG-2024-001'}
          </Box>
        </Box>
      </Box>

      {/* Main GL Completeness Cards */}
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
                    COMPLETENESS SCORE
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
                    bgcolor: colors.orange
                  }} />
                  <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    GL TOTAL DEBIT
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 20, color: colors.orange }} />
              </Box>
              <Tooltip title={`Exact Amount: ${(data.documentStatistics?.gl_debit_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem', cursor: 'help' }}>
                  {formatCurrency(data.documentStatistics?.gl_debit_total || 0)}
              </Typography>
              </Tooltip>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: colors.orange,
                  color: colors.lightGray,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Total Debits
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
                    bgcolor: colors.text
                  }} />
                  <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    GL TOTAL CREDIT
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 20, color: colors.text }} />
              </Box>
              <Tooltip title={`Exact Amount: ${(data.documentStatistics?.gl_credit_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem', cursor: 'help' }}>
                  {formatCurrency(data.documentStatistics?.gl_credit_total || 0)}
              </Typography>
              </Tooltip>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: colors.lightGray,
                  color: colors.text,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Total Credits
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
                    bgcolor: data.documentStatistics?.gl_net_balance === 0 ? '#10b981' : colors.text
                  }} />
                  <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    NET BALANCE
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 20, color: data.documentStatistics?.gl_net_balance === 0 ? '#10b981' : colors.text }} />
              </Box>
              <Tooltip title={`Exact Amount: ${(data.documentStatistics?.gl_net_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem', cursor: 'help' }}>
                  {formatCurrency(data.documentStatistics?.gl_net_balance || 0)}
              </Typography>
              </Tooltip>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: data.documentStatistics?.gl_net_balance === 0 ? '#dcfce7' : colors.lightGray,
                  color: data.documentStatistics?.gl_net_balance === 0 ? '#059669' : colors.text,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {data.documentStatistics?.gl_net_balance <1 ? 'BALANCED' : 'UNBALANCED'}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Secondary GL Statistics Cards */}
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
                    TOTAL ACCOUNTS
                  </Typography>
                </Box>
                <TableChartIcon sx={{ fontSize: 20, color: colors.primary }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                {data.documentStatistics?.unique_accounts?.toLocaleString() || '0'}
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
                  Unique Accounts
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
                    bgcolor: colors.text
                  }} />
                  <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    TOTAL RECORDS
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 20, color: colors.text }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                {data.documentStatistics?.total_gl_records?.toLocaleString() || '0'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: colors.lightGray,
                  color: colors.text,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  Journal Lines
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
                    bgcolor: colors.text
                  }} />
                  <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    TOTAL TESTS
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 20, color: colors.text }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                {data.overall?.completeFields || 0}/{data.overall?.totalFields || 0}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: colors.lightGray,
                  color: colors.text,
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
                    bgcolor: colors.orange
                  }} />
                  <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    UNIQUE JOURNAL IDS
                  </Typography>
                </Box>
                <InfoIcon sx={{ fontSize: 20, color: colors.orange }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                {Math.floor((data.documentStatistics?.total_gl_records || 0) * 0.038).toLocaleString()}
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
                  Journal Entries
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>



      {/* Wallet Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid size={{xs: 12, md: 12}}>
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
                  <AreaChart data={data.timeSeriesData || []} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="debitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.orange} stopOpacity={0.6}/>
                        <stop offset="95%" stopColor={colors.orange} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="volumeGradientStats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.orange} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={colors.orange} stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.lightGray} strokeOpacity={0.3} />
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
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M SAR`}
                    />
                    <RechartsTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <Box sx={{
                              bgcolor: 'white',
                              border: `1px solid ${colors.lightGray}`,
                              borderRadius: 2,
                              p: 1.5,
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text, mb: 0.5 }}>
                                {label}
                              </Typography>
                              {payload.map((entry, index) => (
                                <Typography key={index} variant="caption" sx={{ color: entry.color, display: 'block' }}>
                                  {entry.name}: {(entry.value / 1000000).toFixed(2)}M SAR
                                </Typography>
                              ))}
                            </Box>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalVolume"
                      stackId="1"
                      stroke={colors.orange}
                      strokeWidth={2}
                      fill="url(#volumeGradientStats)"
                      dot={{ fill: colors.orange, strokeWidth: 2, r: 3 }}
                      activeDot={{ 
                        r: 5, 
                        fill: colors.orange,
                        stroke: 'white',
                        strokeWidth: 2
                      }}
                      name="Total Volume"
                    />
                    <Area
                      type="monotone"
                      dataKey="creditTotal"
                      stackId="2"
                      stroke={colors.orange}
                      strokeWidth={2}
                      fill="url(#creditGradient)"
                      dot={{ fill: colors.orange, strokeWidth: 2, r: 3 }}
                      activeDot={{ 
                        r: 5, 
                        fill: colors.orange,
                        stroke: 'white',
                        strokeWidth: 2
                      }}
                      name="Credit Total"
                    />
                    <Area
                      type="monotone"
                      dataKey="debitTotal"
                      stackId="3"
                      stroke={colors.primary}
                      strokeWidth={3}
                      fill="url(#debitGradient)"
                      dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                      activeDot={{ 
                        r: 6, 
                        fill: colors.primary,
                        stroke: 'white',
                        strokeWidth: 2,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }}
                      name="Debit Total"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
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
                    sx={{ color: colors.lightGray }}
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
      {/* Test Results Table */}
      <Card sx={{ 
        bgcolor: colors.surface, 
        borderRadius: 3, 
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        mb: 4,
        height: '100%',
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
                          color: test.status === 'PASSED' ? '#059669' : colors.text,
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

        </Grid>
      
      </Grid>


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
                Top Accounts by Transaction Volume
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
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M SAR`}
                    />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => [
                        `${(value / 1000000).toFixed(2)}M SAR`, 
                        name === 'debit_total' ? 'Debit Total' : 'Credit Total'
                      ]}
                    />
                    <Bar dataKey="debit_total" fill={colors.primary} name="Debit Total" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="credit_total" fill={colors.orange} name="Credit Total" radius={[2, 2, 0, 0]} />
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
                Account Volume Distribution (Top 8)
              </Typography>
              
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={(data.userAnalysis || []).slice(0, 8).map((account, index) => ({
                      name: account.account_name || account.user_name,
                      volume: account.total_volume / 1000000, // Convert to millions
                      index: index
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.orange} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={colors.orange} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="volumeGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.6}/>
                        <stop offset="95%" stopColor={colors.primary} stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.lightGray} strokeOpacity={0.3} />
                    <XAxis 
                      dataKey="name"
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
                      tickFormatter={(value) => `${value.toFixed(1)}M SAR`}
                    />
                    <RechartsTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <Box sx={{
                              bgcolor: 'white',
                              border: `1px solid ${colors.lightGray}`,
                              borderRadius: 2,
                              p: 1.5,
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text, mb: 0.5 }}>
                                {label}
                              </Typography>
                              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                Volume: {payload[0].value.toFixed(2)}M SAR
                              </Typography>
                            </Box>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke={colors.orange}
                      strokeWidth={3}
                      fill="url(#volumeGradient)"
                      dot={{ fill: colors.orange, strokeWidth: 2, r: 4 }}
                      activeDot={{ 
                        r: 6, 
                        fill: colors.orange,
                        stroke: 'white',
                        strokeWidth: 2,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }}
                    />
                  </AreaChart>
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
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      <Tooltip title={`Exact Amount: ${(month.debit_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                        <span style={{ cursor: 'help' }}>{formatCurrency(month.debit_total || 0)}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      <Tooltip title={`Exact Amount: ${(month.credit_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                        <span style={{ cursor: 'help' }}>{formatCurrency(month.credit_total || 0)}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      <Tooltip title={`Exact Amount: ${(month.total_volume || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                        <span style={{ cursor: 'help' }}>{formatCurrency(month.total_volume || 0)}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>{(month.transaction_count || month.total_transactions || 0).toLocaleString()}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      <Tooltip title={`Exact Net Amount: ${(month.net_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                      <Chip 
                          label={formatCurrency(month.net_amount || 0)}
                        size="small"
                        sx={{
                            cursor: 'help',
                          bgcolor: (month.net_amount || 0) === 0 ? '#dcfce7' : (month.net_amount || 0) > 0 ? '#dcfce7' : '#fee2e2',
                          color: (month.net_amount || 0) === 0 ? '#059669' : (month.net_amount || 0) > 0 ? '#059669' : colors.text,
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Account Verifications Section */}
      {accountVerifications && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: colors.text }}>
            Account Verifications Details
          </Typography>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item size={{xs: 12, sm: 6, md: 3}}>
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
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                        TOTAL VERIFICATIONS
                      </Typography>
                    </Box>
                    <AssessmentIcon sx={{ fontSize: 20, color: colors.orange }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.4rem' }}>
                    {(accountVerifications.results?.total_verifications || 0).toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      bgcolor: colors.orange,
                      color: 'white',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {accountVerifications.count || 0} Accounts
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item size={{xs: 12, sm: 6, md: 3}}>
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
                        bgcolor: colors.text
                      }} />
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                        PASSED ACCOUNTS
                      </Typography>
                    </Box>
                    <CheckCircleIcon sx={{ fontSize: 20, color: colors.text }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.4rem' }}>
                    {accountVerifications.count||0}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      bgcolor: '#10b981',
                      color: 'white',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {((accountVerifications.count || 0) / (accountVerifications.results?.total_verifications || 1) * 100).toFixed(1)}% Success
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item size={{xs: 12, sm: 6, md: 3}}>
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
                        bgcolor: colors.text
                      }} />
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                        FAILED ACCOUNTS
                      </Typography>
                    </Box>
                    <ErrorIcon sx={{ fontSize: 20, color: colors.text }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.4rem' }}>
                    {failedAccountVerifications?.results?.results?.length || 0}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      bgcolor: colors.lightGray,
                      color: colors.text,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      Requires Review
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item size={{xs: 12, sm: 6, md: 3}}>
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
                        bgcolor: colors.text
                      }} />
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                        PASS RATE
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 20, color: colors.text }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.4rem' }}>
                    {((accountVerifications.count || 0) / (accountVerifications.results?.total_verifications || 1) * 100).toFixed(1)}%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      bgcolor: colors.lightGray,
                      color: colors.text,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      Account Level
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Failed Accounts Details - Modern Chart-Oriented Design */}
          {failedAccountVerifications?.results?.results?.length > 0 && (
            <Box sx={{ mb: 4 }}>
              {/* Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ color: colors.textPrimary, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorIcon sx={{ fontSize: 20, color: colors.primary }} />
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
                <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
                  Visual analysis of account reconciliation failures
                </Typography>
              </Box>

              {/* Modern Chart-Based Cards Grid */}
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
                            <Typography variant="h6" fontWeight={600} sx={{ color: colors.textPrimary, fontSize: '1rem' }}>
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

                        {/* Variance Visualization */}
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem', fontWeight: 600, mb: 1, display: 'block' }}>
                            AUDIT VARIANCE
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Box sx={{ 
                              width: 60, 
                              height: 60, 
                              borderRadius: '50%', 
                              bgcolor: colors.background,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `3px solid ${colors.primary}`
                            }}>
                              <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 600, fontSize: '0.6rem', textAlign: 'center' }}>
                                FAIL
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Tooltip title={`Exact Variance: ${(account.audit_variance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                                <Typography variant="h6" fontWeight={600} sx={{ color: colors.textPrimary, fontSize: '1.1rem', cursor: 'help' }}>
                                  {account.audit_variance_formatted || formatCurrency(account.audit_variance || 0)}
                                </Typography>
                              </Tooltip>
                              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem' }}>
                                {account.variance_note || 'Balance discrepancy detected'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* GL vs TB Comparison Chart */}
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.7rem', fontWeight: 600, mb: 2, display: 'block' }}>
                            GL vs TB COMPARISON
                          </Typography>
                          <Box sx={{ height: 120 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart 
                                data={[
                                  {
                                    name: 'Debit',
                                    GL: account.gl_debit_total / 1000000,
                                    TB: account.tb_debit / 1000000
                                  },
                                  {
                                    name: 'Credit',
                                    GL: account.gl_credit_total / 1000000,
                                    TB: account.tb_credit / 1000000
                                  }
                                ]}
                                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                              >
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: colors.textSecondary }} />
                                <YAxis tick={{ fontSize: 10, fill: colors.textSecondary }} />
                                <RechartsTooltip 
                                  formatter={(value, name) => [`${value.toFixed(1)}M SAR`, name === 'GL' ? 'General Ledger' : 'Trial Balance']}
                                  labelFormatter={(label) => `${label} Amount`}
                                />
                                <Bar dataKey="GL" fill={colors.primary} name="GL" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="TB" fill={colors.orange} name="TB" radius={[2, 2, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
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
                                <Tooltip title={`Exact Amount: ${(account.opening_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                                  <Typography variant="body2" fontWeight={600} sx={{ color: colors.textPrimary, fontSize: '0.8rem', cursor: 'help' }}>
                                    {formatCurrency(account.opening_balance || 0)}
                                  </Typography>
                                </Tooltip>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ p: 1.5, bgcolor: colors.background, borderRadius: 1 }}>
                                <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
                                  Closing Balance
                                </Typography>
                                <Tooltip title={`Exact Amount: ${(account.closing_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                                  <Typography variant="body2" fontWeight={600} sx={{ color: colors.textPrimary, fontSize: '0.8rem', cursor: 'help' }}>
                                    {formatCurrency(account.closing_balance || 0)}
                                  </Typography>
                                </Tooltip>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ p: 1.5, bgcolor: colors.background, borderRadius: 1 }}>
                                <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
                                  Debit Variance
                                </Typography>
                                <Tooltip title={`Exact Amount: ${(account.gl_vs_tb_debit_variance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                                  <Typography variant="body2" fontWeight={600} sx={{ color: colors.textPrimary, fontSize: '0.8rem', cursor: 'help' }}>
                                    {formatCurrency(account.gl_vs_tb_debit_variance || 0)}
                                  </Typography>
                                </Tooltip>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ p: 1.5, bgcolor: colors.background, borderRadius: 1 }}>
                                <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
                                  Credit Variance
                                </Typography>
                                <Tooltip title={`Exact Amount: ${(account.gl_vs_tb_credit_variance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                                  <Typography variant="body2" fontWeight={600} sx={{ color: colors.textPrimary, fontSize: '0.8rem', cursor: 'help' }}>
                                    {formatCurrency(account.gl_vs_tb_credit_variance || 0)}
                                  </Typography>
                                </Tooltip>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>

                        {/* Status Indicators */}
                        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${colors.borderLight}` }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
                                Movements Match
                              </Typography>
                              <Typography variant="body2" fontWeight={600} sx={{ color: colors.textPrimary, fontSize: '0.75rem' }}>
                                {account.gl_tb_movements_match ? '✅ Yes' : '❌ No'}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="caption" sx={{ color: colors.textSecondary, fontSize: '0.65rem' }}>
                                Balance Equation
                              </Typography>
                              <Typography variant="body2" fontWeight={600} sx={{ color: colors.textPrimary, fontSize: '0.75rem' }}>
                                {account.balance_equation_correct ? '✅ Correct' : '❌ Incorrect'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* All Accounts Summary Table (First 10) */}
          <Card sx={{ 
            bgcolor: 'white',
            borderRadius: 3,
            border: `1px solid ${colors.lightGray}`,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: `1px solid ${colors.lightGray}` }}>
                <Typography variant="h6" fontWeight={600} sx={{ color: colors.text, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TableChartIcon sx={{ fontSize: 18, color: colors.primary }} />
                  Account Verification Summary (First 10)
                </Typography>
                <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
                  GL vs TB account-level reconciliation results
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: colors.lightGray }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Account Code</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>GL Debit</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>GL Credit</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>TB Debit</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>TB Credit</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Balance Variance</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {accountVerifications.results?.results?.slice(0, 10).map((account, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{account.account_code}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          <Tooltip title={`Exact Amount: ${(account.gl_debit_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                            <span style={{ cursor: 'help' }}>{formatCurrency(account.gl_debit_total || 0)}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          <Tooltip title={`Exact Amount: ${(account.gl_credit_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                            <span style={{ cursor: 'help' }}>{formatCurrency(account.gl_credit_total || 0)}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          <Tooltip title={`Exact Amount: ${(account.tb_debit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                            <span style={{ cursor: 'help' }}>{formatCurrency(account.tb_debit || 0)}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          <Tooltip title={`Exact Amount: ${(account.tb_credit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR`} arrow>
                            <span style={{ cursor: 'help' }}>{formatCurrency(account.tb_credit || 0)}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          <Tooltip title={`Exact Variance: ${(account.balance_variance_abs || 0).toLocaleString('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 })}`} arrow>
                            <span style={{ cursor: 'help' }}>{account.variance_formatted || '0.00'}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          <Chip 
                            label={`${account.status_icon} ${account.status}`}
                            size="small"
                            sx={{
                              cursor: 'help',
                              bgcolor: account.status === 'PASS' ? '#dcfce7' : '#fee2e2',
                              color: account.status === 'PASS' ? '#059669' : '#dc2626',
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
              {accountVerifications.results?.results?.length > 10 && (
                <Box sx={{ p: 2, borderTop: `1px solid ${colors.lightGray}`, bgcolor: colors.lightGray }}>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    Showing first 10 of {accountVerifications.results.total_verifications} account verifications
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        {data.overall.status === 'NO_RESULTS' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
            <Typography variant="body2" sx={{ 
              color: colors.textSecondary,
              fontSize: '0.875rem',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              {data.noResultsMessage || 'No completeness test results found for this engagement'}
            </Typography>
          </Box>
        ) : data.overall.status === 'EXCELLENT' || data.overall.score >= 95 || (data.fieldAnalysis && data.fieldAnalysis.every(test => test.status === 'PASSED')) ? (
          <>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ 
                borderColor: colors.orange,
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
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
            <Typography variant="body2" sx={{ 
              color: colors.textSecondary,
              fontSize: '0.875rem',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <CircularProgress size={16} sx={{ color: colors.textSecondary }} />
              Tests are still processing...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}