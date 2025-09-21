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
  alpha,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination
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
  NotificationsNone as NotificationsIcon,
  AccountBalance as AccountBalanceIcon,
  PictureAsPdf as PdfIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Shield as ShieldIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
// Chart imports removed - charts replaced with placeholders for cleaner interface
import { dashboardColors as colors } from '../utils/dashboardColors';
import { colorScheme, formatCurrency } from '../utils/colorScheme';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import CompletenessAnalysisDashboard from './charts/CompletenessAnalysisDashboard';

// Transform API response to UI format
const transformApiDataToUIFormat = (apiData) => {
  if (!apiData || !apiData.test_result) {
      return {
        overall: {
          score: 0,
          status: 'NO_RESULTS',
        engagementId: apiData?.engagement_id || 'Unknown',
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
      noResultsMessage: 'No test results available'
      };
  }

  const testResult = apiData.test_result;
  const summary = apiData.summary || testResult.test_summary || {};
  const comprehensiveStats = testResult.comprehensive_statistics || {};

  // Transform field analysis from test steps - updated for new API format
  const fieldAnalysis = [
    {
      field: 'GL Completeness',
      completeness: testResult.step1_summary?.passed ? 100 : 0,
      records: testResult.total_gl_records || 0,
      missing: testResult.step1_summary?.passed ? 0 : 1,
      status: testResult.step1_summary?.passed ? 'PASSED' : 'FAILED',
      description: testResult.step1_summary?.description || 'GL completeness verification: Credit - Debit should equal 0 and sufficient data volume',
      explanation: testResult.step1_summary?.explanation || 'No details available'
    },
    {
      field: 'Account-wise Balance Verification',
      completeness: testResult.step2_summary?.passed ? Math.round((testResult.step2_summary?.pass_rate || 0) * 100) : 0,
      records: testResult.step2_summary?.accounts_verified || 0,
      missing: testResult.step2_summary?.accounts_failed || 0,
      status: testResult.step2_summary?.passed ? 'PASSED' : 'FAILED',
      description: testResult.step2_summary?.description || 'Account-wise balance verification: Opening + Debits - Credits = Closing for each GL account',
      explanation: testResult.step2_summary?.explanation || 'No details available'
    }
  ];

  // Transform time series data from comprehensive_statistics
  const monthlyTrendsData = comprehensiveStats?.chart_data?.monthly_trends;
  // Create time series data from actual monthly trends
  const timeSeriesData = monthlyTrendsData?.labels?.map((label, index) => ({
    date: label,
    completeness: testResult.completeness_score || summary.completeness_score || 0,
    totalAmount: monthlyTrendsData?.amounts?.[index] || 0,
    totalTransactions: monthlyTrendsData?.transaction_counts?.[index] || 0,
    debitTotal: comprehensiveStats?.document_statistics?.gl_debit_total || 0,
    creditTotal: comprehensiveStats?.document_statistics?.gl_credit_total || 0,
    totalVolume: monthlyTrendsData?.amounts?.[index] || 0,
    netAmount: comprehensiveStats?.document_statistics?.gl_net_balance || 0
  })) || [{
      date: '2025-01',
      completeness: testResult.completeness_score || summary.completeness_score || 0,
      totalAmount: monthlyTrendsData?.total_amount || 0,
      totalTransactions: monthlyTrendsData?.total_transactions || 0,
      debitTotal: comprehensiveStats?.document_statistics?.gl_debit_total || 0,
      creditTotal: comprehensiveStats?.document_statistics?.gl_credit_total || 0,
      totalVolume: monthlyTrendsData?.total_amount || 0,
      netAmount: comprehensiveStats?.document_statistics?.gl_net_balance || 0
  }];

  // Transform category breakdown using comprehensive_statistics
  const topAccounts = comprehensiveStats?.chart_data?.top_accounts;
  const categoryBreakdown = [
    { name: 'GL Completeness', value: testResult.step1_summary?.passed ? 100 : 0, color: '#3b82f6' },
    { name: 'Account Verification', value: testResult.step2_summary?.passed ? Math.round((testResult.step2_summary?.pass_rate || 0) * 100) : 0, color: '#10b981' },
    { name: 'Overall Score', value: testResult.completeness_score || 0, color: '#f59e0b' }
  ];

  // Generate recommendations based on failed tests
  const recommendations = [];
  if (!testResult.step1_summary?.passed) {
    recommendations.push({
      field: 'GL Completeness',
      issue: 'GL file completeness verification failed',
      recommendation: 'Review GL file data quality and ensure sufficient transaction volume',
      severity: 'Critical'
    });
  }
  if (!testResult.step2_summary?.passed) {
    recommendations.push({
      field: 'Account-wise Balance Verification',
      issue: `Account verification failed for ${testResult.step2_summary?.accounts_failed || 0} accounts`,
      recommendation: 'Review failed account reconciliations and verify opening/closing balances',
      severity: 'High'
    });
  }

  const passedTests = fieldAnalysis.filter(test => test.status === 'PASSED').length;
  const totalTests = fieldAnalysis.length;
  const overallScore = testResult.completeness_score || summary.completeness_score || (totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0);

  // Debug logging to verify transformation
  console.log('=== TRANSFORMATION DEBUG ===');
  console.log('API Data monthly_trends:', monthlyTrendsData);
  console.log('Transformed monthlyTrends:', monthlyTrendsData?.labels?.map((label, index) => ({
    month: label,
    total_volume: monthlyTrendsData?.amounts?.[index] || 0,
    transaction_count: monthlyTrendsData?.transaction_counts?.[index] || 0
  })));
  console.log('Top Accounts:', topAccounts);
  console.log('Enhanced Data:', comprehensiveStats?.enhanced_statistics?.chart_data_enhanced);
  console.log('Overall Score:', overallScore);
  console.log('===========================');

  return {
    overall: {
      score: overallScore,
      status: testResult.overall_status === 'COMPLETE' ? 'EXCELLENT' : overallScore >= 80 ? 'EXCELLENT' : overallScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      engagementId: testResult.engagement_id || summary.engagement_id || 'Unknown',
      completeFields: passedTests,
      totalFields: totalTests,
      criticalIssues: testResult.critical_issues_count || recommendations.filter(r => r.severity === 'Critical').length,
      totalRecords: (testResult.total_gl_records || 0) + (testResult.total_tb_records || 0)
    },
    fieldAnalysis,
    timeSeriesData,
    categoryBreakdown,
    recommendations,
    testDetails: {
      glRecords: testResult.total_gl_records || 0,
      tbRecords: testResult.total_tb_records || 0,
      processingTime: testResult.processing_duration || 'Unknown',
      lastUpdated: testResult.created_at || new Date().toISOString()
    },
    chartData: {
      topAccounts: topAccounts || {},
      monthlyTrends: monthlyTrendsData || {},
      metadata: comprehensiveStats?.chart_data?.chart_metadata || {},
      enhanced: comprehensiveStats?.enhanced_statistics?.chart_data_enhanced || {}
    },
    monthlyTrends: monthlyTrendsData?.labels?.map((label, index) => ({
      month: label,
      debit_total: comprehensiveStats?.document_statistics?.gl_debit_total || 0,
      credit_total: comprehensiveStats?.document_statistics?.gl_credit_total || 0,
      total_volume: monthlyTrendsData?.amounts?.[index] || 0,
      net_amount: comprehensiveStats?.document_statistics?.gl_net_balance || 0,
      transaction_count: monthlyTrendsData?.transaction_counts?.[index] || 0,
      total_transactions: monthlyTrendsData?.transaction_counts?.[index] || 0
    })) || [{
      month: '2025-01',
      debit_total: comprehensiveStats?.document_statistics?.gl_debit_total || 0,
      credit_total: comprehensiveStats?.document_statistics?.gl_credit_total || 0,
      total_volume: monthlyTrendsData?.total_amount || 0,
      net_amount: comprehensiveStats?.document_statistics?.gl_net_balance || 0,
      transaction_count: monthlyTrendsData?.total_transactions || 0,
      total_transactions: monthlyTrendsData?.total_transactions || 0
    }],
    userAnalysis: [{
      user_name: 'Top Account',
      account_name: 'Top Account',
      debit_total: topAccounts?.total_debit_amount || 0,
      credit_total: topAccounts?.total_credit_amount || 0,
      total_volume: (topAccounts?.total_debit_amount || 0) + (topAccounts?.total_credit_amount || 0),
      net_movement: topAccounts?.net_balance || 0
    }],
    summaryStatistics: {
      total_users: comprehensiveStats?.enhanced_statistics?.basic_totals?.total_users || 0,
      most_active_user: 'N/A', // Not available in new structure
      peak_month: monthlyTrendsData?.labels?.[0] || 'N/A',
      months_covered: comprehensiveStats?.chart_data?.chart_metadata?.total_months || monthlyTrendsData?.labels?.length || 0,
      total_amount: comprehensiveStats?.enhanced_statistics?.amount_statistics?.total_debit_amount || 0,
      total_transactions: comprehensiveStats?.enhanced_statistics?.basic_totals?.total_transactions || 0,
      average_transaction_amount: comprehensiveStats?.enhanced_statistics?.amount_statistics?.mean_amount || 0,
      processing_time: testResult.processing_duration || 'Unknown'
    },
    documentStatistics: {
      total_documents: comprehensiveStats?.document_statistics?.total_documents || 0,
      unique_documents: comprehensiveStats?.document_statistics?.unique_documents || 0,
      duplicate_document_ratio: comprehensiveStats?.document_statistics?.duplicate_document_ratio || 0,
      document_types: comprehensiveStats?.document_statistics?.document_types || ['GL', 'TB'],
      largest_document_size: comprehensiveStats?.document_statistics?.largest_document_size || 'N/A',
      gl_debit_total: comprehensiveStats?.document_statistics?.gl_debit_total || 0,
      gl_credit_total: comprehensiveStats?.document_statistics?.gl_credit_total || 0,
      gl_net_balance: comprehensiveStats?.document_statistics?.gl_net_balance || 0,
      unique_accounts: comprehensiveStats?.document_statistics?.unique_accounts || 0,
      total_gl_records: comprehensiveStats?.document_statistics?.total_gl_records || 0,
      total_tb_records: comprehensiveStats?.document_statistics?.total_tb_records || 0
    },
    creditDebitBySubtype: topAccounts ? topAccounts.labels?.map((label, index) => ({
      account: label,
      debit: topAccounts.debit_amounts?.[index] || 0,
      credit: topAccounts.credit_amounts?.[index] || 0,
      net: topAccounts.net_movements?.[index] || 0
    })) || [] : [],
    // New comprehensive statistics
    comprehensiveStatistics: comprehensiveStats,
    basicTotals: comprehensiveStats?.enhanced_statistics?.basic_totals || {},
    amountStatistics: comprehensiveStats?.enhanced_statistics?.amount_statistics || {},
    dataQualityMetrics: comprehensiveStats?.enhanced_statistics?.data_quality_metrics || {},
    perAccountStatistics: comprehensiveStats?.enhanced_statistics?.per_account_statistics || {},
    auditCalculationStatistics: comprehensiveStats?.enhanced_statistics?.audit_calculation_statistics || {},
    // Additional mappings for the new API structure
    step1Summary: testResult.step1_summary || {},
    step2Summary: testResult.step2_summary || {},
    // Additional fields for banner
    engagementName: testResult.engagement_name,
    clientName: testResult.client_name,
    testTimestamp: testResult.test_timestamp,
    overallStatus: testResult.overall_status,
    totalGlRecords: testResult.total_gl_records,
    completenessScore: testResult.completeness_score,
    testsPassed: testResult.tests_passed,
    totalTests: testResult.total_tests,
    criticalIssuesCount: testResult.critical_issues_count,
    processingDuration: testResult.processing_duration
  };
};

export default function CompletenessTestReport() {
  const { engagementId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [accountVerifications, setAccountVerifications] = useState(null);
  const [failedAccountVerifications, setFailedAccountVerifications] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const fetchCompletenessData = async () => {
    if (!engagementId) {
      setError('No engagement ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
      try {
        // Fetch completeness test data first
        const completenessResponse = await axios.get(`http://localhost:8000/api/completeness-test/engagement/${engagementId}/`, {
          timeout: 10000
        });
        
        const transformedData = transformApiDataToUIFormat(completenessResponse.data);
        if (transformedData) {
          setData(transformedData);
        } else {
          throw new Error('Invalid or empty API response');
        }

        // Try to fetch account verifications data (optional - don't fail if unavailable)
        try {
          const [accountVerificationsResponse, failedAccountVerificationsResponse] = await Promise.all([
            axios.get(`http://localhost:8000/api/account-verifications/engagement/${engagementId}/`, {
              timeout: 5000 // Shorter timeout for optional data
            }),
            axios.get(`http://localhost:8000/api/account-verifications/engagement/${engagementId}/`, {
              timeout: 5000,
              params: {
                failed_only: true
              }
            })
          ]);

          // Set account verifications data if available
          if (accountVerificationsResponse?.data) {
            setAccountVerifications(accountVerificationsResponse.data);
            setCurrentPage(1); // Reset to first page when new data loads
            console.log('Account verifications loaded:', accountVerificationsResponse.data);
          }

          if (failedAccountVerificationsResponse?.data) {
            setFailedAccountVerifications(failedAccountVerificationsResponse.data);
            console.log('Failed account verifications loaded:', failedAccountVerificationsResponse.data);
            console.log('Failed account verifications results:', failedAccountVerificationsResponse.data?.results?.results);
          }
        } catch (accountError) {
          // Silently handle account verification errors - this is optional data
          console.log('Account verifications not available for this engagement:', accountError.message);
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


      {/* Engagement Banner - Redesigned */}
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
                {data?.engagementName || 'Engagement Report'}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: colors.textSecondary, 
                mb: 0.5, 
                fontWeight: 400
              }}>
                Uploaded: {data?.testTimestamp ? new Date(data.testTimestamp).toLocaleDateString() : 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: colors.textSecondary, 
                fontWeight: 400
              }}>
                Status: {data?.overallStatus || 'N/A'} • Records: {data?.totalGlRecords?.toLocaleString() || '0'}
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
                background: `conic-gradient(${'#10b981'} 0deg ${(data?.completenessScore || 0) * 3.6}deg, #e5e7eb ${(data?.completenessScore || 0) * 3.6}deg 360deg)`,
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
                    {data?.completenessScore?.toFixed(0) || '0'}%
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Final Result Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center',flexDirection: 'column' }}>
              <Typography fontSize={'0.8rem'} fontWeight={600} sx={{ color: colors.text, mt: 1 }}>
                Final Result
              </Typography>
              <Chip 
                label="SUCCESS" 
                sx={{ 
                  bgcolor: '#10b981', 
                  color: 'white', 
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  px: 2,
                  py: 0.5
                }} 
              />
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
                        {data?.testsPassed || '0'}/{data?.totalTests || '0'}
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
                        {data?.criticalIssuesCount || '0'}
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
                        {data?.comprehensiveStatistics?.summary_statistics?.account_verification_pass_rate ? 
                          ((data.comprehensiveStatistics.summary_statistics.account_verification_pass_rate * 100).toFixed(1)) : '0'}%
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        Account Verification
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid size={{xs: 6, md: 3}}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                    <InfoIcon sx={{ fontSize: 24, color: colors.orange }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, fontSize: '1.25rem' }}>
                        {data?.processingDuration?.toFixed(2) || '0'}s
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        Processing Time
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Row 2 - Financial Stats */}
                <Grid size={{xs: 6, md: 3}}>
                  <Tooltip title={`Full Amount: ${((data?.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.total_debit_amount || 0) + (data?.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.total_credit_amount || 0)).toLocaleString()} SAR`} arrow>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, cursor: 'pointer' }}>
                      <MoneyIcon sx={{ fontSize: 24, color: colors.orange }} />
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, fontSize: '1.25rem' }}>
                          {formatCurrency((data?.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.total_debit_amount || 0) + (data?.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.total_credit_amount || 0))}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Total Amount
                        </Typography>
                      </Box>
                    </Box>
                  </Tooltip>
                </Grid>
                <Grid size={{xs: 6, md: 3}}>
                  <Tooltip title={`Full Debit Amount: ${(data?.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.total_debit_amount || 0).toLocaleString()} SAR`} arrow>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, cursor: 'pointer' }}>
                      <AccountBalanceIcon sx={{ fontSize: 24, color: colors.orange }} />
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, fontSize: '1.25rem' }}>
                          {formatCurrency(data?.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.total_debit_amount || 0)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Total Debit
                        </Typography>
                      </Box>
                    </Box>
                  </Tooltip>
                </Grid>
                <Grid size={{xs: 6, md: 3}}>
                  <Tooltip title={`Full Credit Amount: ${(data?.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.total_credit_amount || 0).toLocaleString()} SAR`} arrow>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, cursor: 'pointer' }}>
                      <AccountBalanceIcon sx={{ fontSize: 24, color: colors.orange }} />
                      <Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, fontSize: '1.25rem' }}>
                          {formatCurrency(data?.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.total_credit_amount || 0)}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          Total Credit
                        </Typography>
                      </Box>
                    </Box>
                  </Tooltip>
                </Grid>
                <Grid size={{xs: 6, md: 3}}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                    <TrendingUpIcon sx={{ fontSize: 24, color: colors.orange }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: colors.text, fontSize: '1.25rem' }}>
                        {data?.comprehensiveStatistics?.enhanced_statistics?.basic_totals?.total_transactions?.toLocaleString() || '0'}
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

      {/* Tabbed Dashboard */}
      <Card sx={{ 
        bgcolor: colors.surface, 
        borderRadius: 3, 
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        mb: 4
      }}>
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '12px 12px 0 0'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ 
              px: 3,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
              }
            }}
          >
            <Tab 
              icon={<AssessmentIcon />} 
              label="Overview" 
              iconPosition="start"
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600,
                minHeight: 64,
                px: 3,
                py: 2,
                borderRadius: '8px 8px 0 0',
                mx: 0.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.08)',
                  transform: 'translateY(-2px)'
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(102, 126, 234, 0.12)',
                  color: colors.primary,
                  '& .MuiSvgIcon-root': {
                    color: colors.primary
                  }
                }
              }}
            />
            <Tab 
              icon={<TrendingUpIcon />} 
              label="Financial Data" 
              iconPosition="start"
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600,
                minHeight: 64,
                px: 3,
                py: 2,
                borderRadius: '8px 8px 0 0',
                mx: 0.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.08)',
                  transform: 'translateY(-2px)'
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(102, 126, 234, 0.12)',
                  color: colors.primary,
                  '& .MuiSvgIcon-root': {
                    color: colors.primary
                  }
                }
              }}
            />
            <Tab 
              icon={<AccountBalanceIcon />} 
              label="Account Analysis" 
              iconPosition="start"
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600,
                minHeight: 64,
                px: 3,
                py: 2,
                borderRadius: '8px 8px 0 0',
                mx: 0.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.08)',
                  transform: 'translateY(-2px)'
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(102, 126, 234, 0.12)',
                  color: colors.primary,
                  '& .MuiSvgIcon-root': {
                    color: colors.primary
                  }
                }
              }}
            />
            <Tab 
              icon={<SecurityIcon />} 
              label="Audit & Quality" 
              iconPosition="start"
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600,
                minHeight: 64,
                px: 3,
                py: 2,
                borderRadius: '8px 8px 0 0',
                mx: 0.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.08)',
                  transform: 'translateY(-2px)'
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(102, 126, 234, 0.12)',
                  color: colors.primary,
                  '& .MuiSvgIcon-root': {
                    color: colors.primary
                  }
                }
              }}
            />
            <Tab 
              icon={<InfoIcon />} 
              label="Document Stats" 
              iconPosition="start"
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600,
                minHeight: 64,
                px: 3,
                py: 2,
                borderRadius: '8px 8px 0 0',
                mx: 0.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(102, 126, 234, 0.08)',
                  transform: 'translateY(-2px)'
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(102, 126, 234, 0.12)',
                  color: colors.primary,
                  '& .MuiSvgIcon-root': {
                    color: colors.primary
                  }
                }
              }}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Box>
              {/* Key Metrics Row */}
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
                      <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {formatCurrency(data.comprehensiveStatistics?.document_statistics?.gl_debit_total || 0)}
              </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Total Debits
                      </Typography>
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
                            GL TOTAL CREDIT
                          </Typography>
                        </Box>
                        <TrendingUpIcon sx={{ fontSize: 20, color: colors.orange }} />
                      </Box>
                      <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {formatCurrency(data.comprehensiveStatistics?.document_statistics?.gl_credit_total || 0)}
                      </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Total Credits
                      </Typography>
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
                            NET BALANCE
                          </Typography>
                </Box>
                        <CheckCircleIcon sx={{ fontSize: 20, color: colors.primary }} />
              </Box>
                      <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {formatCurrency(data.comprehensiveStatistics?.document_statistics?.gl_net_balance || 0)}
                      </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        BALANCED
                      </Typography>
            </CardContent>
          </Card>
                </Grid>
        </Grid>

              {/* Quick Stats Row */}
              <Grid container spacing={3}>
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
                            TOTAL ACCOUNTS
                  </Typography>
                </Box>
                        <AssessmentIcon sx={{ fontSize: 20, color: colors.text }} />
              </Box>
                      <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {data.comprehensiveStatistics?.enhanced_statistics?.basic_totals?.total_gl_accounts || 0}
              </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Unique Accounts
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>



              </Grid>
            </Box>
          )}

          {/* Financial Data Tab */}
          {activeTab === 1 && (
            <Box>
              <Grid container spacing={3}>
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
                            MAX AMOUNT
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 20, color: colors.text }} />
              </Box>
                      <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {formatCurrency(data.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.max_amount || 0)}
              </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Single Transaction
                      </Typography>
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
                            MEAN AMOUNT
                  </Typography>
                </Box>
                        <TrendingUpIcon sx={{ fontSize: 20, color: colors.primary }} />
              </Box>
                      <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {formatCurrency(data.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.mean_amount || 0)}
              </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Average Transaction
                      </Typography>
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
                            MEDIAN AMOUNT
                          </Typography>
                </Box>
                        <AssessmentIcon sx={{ fontSize: 20, color: colors.text }} />
              </Box>
                      <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {formatCurrency(data.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.median_amount || 0)}
                      </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Middle Value
                      </Typography>
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
                            STD DEVIATION
                  </Typography>
                </Box>
                        <InfoIcon sx={{ fontSize: 20, color: colors.primary }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {formatCurrency(data.comprehensiveStatistics?.enhanced_statistics?.amount_statistics?.std_deviation_amount || 0)}
              </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Variability
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Account Analysis Tab */}
          {activeTab === 2 && (
            <Box>
              <Grid container spacing={3}>
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
                            TOTAL USERS
                          </Typography>
                        </Box>
                        <InfoIcon sx={{ fontSize: 20, color: colors.text }} />
                      </Box>
                      <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {data.comprehensiveStatistics?.enhanced_statistics?.basic_totals?.total_users || 0}
                      </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Active Users
                      </Typography>
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
                            PROFIT CENTERS
                          </Typography>
                </Box>
                        <TrendingUpIcon sx={{ fontSize: 20, color: colors.primary }} />
              </Box>
                      <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {data.comprehensiveStatistics?.enhanced_statistics?.basic_totals?.total_profit_centers || 0}
                      </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Business Units
                      </Typography>
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
                            DEBIT ENTRIES
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 20, color: colors.text }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {data.comprehensiveStatistics?.enhanced_statistics?.basic_totals?.total_debit_entries?.toLocaleString() || 0}
              </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Journal Lines
                      </Typography>
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
                            CREDIT ENTRIES
                  </Typography>
                </Box>
                        <AssessmentIcon sx={{ fontSize: 20, color: colors.primary }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {data.comprehensiveStatistics?.enhanced_statistics?.basic_totals?.total_credit_entries?.toLocaleString() || 0}
              </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Journal Lines
                      </Typography>
            </CardContent>
          </Card>
        </Grid>
              </Grid>
            </Box>
          )}

          {/* Audit & Quality Tab */}
          {activeTab === 3 && (
            <Box>
              <Grid container spacing={3}>
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
                            USERS WITH ACTIVITY
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 20, color: colors.text }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {data.comprehensiveStatistics?.enhanced_statistics?.data_quality_metrics?.users_with_activity || 0}
              </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Active Users
                      </Typography>
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
                            ACCOUNTS WITH TRANSACTIONS
                  </Typography>
                </Box>
                <AssessmentIcon sx={{ fontSize: 20, color: colors.text }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {data.comprehensiveStatistics?.enhanced_statistics?.data_quality_metrics?.accounts_with_transactions || 0}
              </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Active Accounts
                      </Typography>
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
                            AVG TRANSACTIONS/USER
                          </Typography>
                </Box>
                        <TrendingUpIcon sx={{ fontSize: 20, color: colors.text }} />
              </Box>
                      <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {Math.round(data.comprehensiveStatistics?.enhanced_statistics?.data_quality_metrics?.average_transactions_per_user || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Per User
                      </Typography>
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
                            AVG TRANSACTIONS/ACCOUNT
                          </Typography>
                </Box>
                        <AssessmentIcon sx={{ fontSize: 20, color: colors.primary }} />
              </Box>
                      <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {Math.round(data.comprehensiveStatistics?.enhanced_statistics?.data_quality_metrics?.average_transactions_per_account || 0).toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Per Account
                      </Typography>
            </CardContent>
          </Card>
        </Grid>
              </Grid>
            </Box>
          )}


          {/* Document Stats Tab */}
          {activeTab === 4 && (
            <Box>
              <Grid container spacing={3}>
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
                            GL DEBIT TOTAL
                  </Typography>
                </Box>
                        <TrendingUpIcon sx={{ fontSize: 20, color: colors.primary }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {formatCurrency(data?.comprehensiveStatistics?.document_statistics?.gl_debit_total || 0)}
              </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Total Debit Amount
                      </Typography>
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
                            GL CREDIT TOTAL
                  </Typography>
                </Box>
                        <TrendingUpIcon sx={{ fontSize: 20, color: colors.orange }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {formatCurrency(data?.comprehensiveStatistics?.document_statistics?.gl_credit_total || 0)}
              </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Total Credit Amount
                      </Typography>
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
                            GL NET BALANCE
                          </Typography>
                </Box>
                        <InfoIcon sx={{ fontSize: 20, color: colors.secondary }} />
              </Box>
                      <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {formatCurrency(data?.comprehensiveStatistics?.document_statistics?.gl_net_balance || 0)}
                      </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Net Balance
                      </Typography>
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
                            UNIQUE ACCOUNTS
                          </Typography>
                </Box>
                        <AccountBalanceIcon sx={{ fontSize: 20, color: colors.text }} />
              </Box>
                      <Typography variant="h4" fontWeight={700} color={colors.text} sx={{ mb: 1, fontSize: '1.875rem' }}>
                        {data?.comprehensiveStatistics?.document_statistics?.unique_accounts?.toLocaleString() || '0'}
                      </Typography>
                      <Typography variant="body2" color={colors.textSecondary} sx={{ fontSize: '0.75rem' }}>
                        Total Unique Accounts
                      </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
            </Box>
          )}

        </Box>
      </Card>

      {/* Charts Dashboard */}
      <CompletenessAnalysisDashboard data={data} />




















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

       {/* Account Verifications Section - Optional */}
       {accountVerifications && accountVerifications.results && (
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
           {(() => {
             console.log('Failed Account Verifications Debug:', {
               failedAccountVerifications,
               hasResults: !!failedAccountVerifications?.results,
               hasResultsArray: !!failedAccountVerifications?.results?.results,
               resultsLength: failedAccountVerifications?.results?.results?.length || 0
             });
             return failedAccountVerifications?.results?.results && failedAccountVerifications.results.results.length > 0;
           })() && (
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
                          <Box sx={{ height: 80 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={[
                                { 
                                  name: 'GL', 
                                  value: account.gl_debit_total || 0,
                                  type: 'Debit'
                                },
                                { 
                                  name: 'TB', 
                                  value: account.tb_debit_total || 0,
                                  type: 'Debit'
                                },
                                { 
                                  name: 'GL', 
                                  value: account.gl_credit_total || 0,
                                  type: 'Credit'
                                },
                                { 
                                  name: 'TB', 
                                  value: account.tb_credit_total || 0,
                                  type: 'Credit'
                                }
                              ]} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                <XAxis 
                                  dataKey="name" 
                                  tick={{ fontSize: 8, fill: colors.textSecondary }}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <YAxis 
                                  tick={{ fontSize: 8, fill: colors.textSecondary }}
                                  axisLine={false}
                                  tickLine={false}
                                  tickFormatter={(value) => formatCurrency(value, 'SAR', true)}
                                />
                                <Bar 
                                  dataKey="value" 
                                  fill={(entry) => entry.type === 'Debit' ? colors.secondary : colors.primary}
                                  radius={[2, 2, 0, 0]}
                                />
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
                  Account Verification Summary
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
                    {accountVerifications.results?.results?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((account, index) => (
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
              {accountVerifications.results?.results?.length > itemsPerPage && (
                <Box sx={{ 
                  p: 2, 
                  borderTop: `1px solid ${colors.lightGray}`, 
                  bgcolor: colors.lightGray,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, accountVerifications.results?.results?.length || 0)} of {accountVerifications.results?.results?.length || 0} account verifications
                  </Typography>
                  <Pagination
                    count={Math.ceil((accountVerifications.results?.results?.length || 0) / itemsPerPage)}
                    page={currentPage}
                    onChange={(event, page) => setCurrentPage(page)}
                    size="small"
                    color="primary"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontSize: '0.75rem',
                        minWidth: '32px',
                        height: '32px'
                      }
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
         </Box>
       )}

       {/* Account Verification Not Available Message */}
       {!accountVerifications && (
         <Box sx={{ mb: 4, textAlign: 'center', py: 4 }}>
           <Typography variant="body2" sx={{ color: colors.textSecondary, fontStyle: 'italic' }}>
             Account verification details are not available for this engagement
           </Typography>
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