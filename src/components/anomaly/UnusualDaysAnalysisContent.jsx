import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  LinearProgress,
  Avatar,
  Badge,
  Button,
  Paper,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  Weekend as WeekendIcon,
  Assessment as AssessmentIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { colorScheme, getRiskColor, formatCurrency } from '../../utils/colorScheme';

// Import chart dashboard
import UnusualDaysDashboard from '../charts/UnusualDaysDashboard';

// Import PDF component
import UnusualDaysAnalysisPDF from './UnusualDaysAnalysisPDF';
import UnifiedAnomalyDrawer from '../FlaggedExpenseDrawer';

export default function UnusualDaysAnalysisContent({ data, distributionData, anomalySummary, sheetId }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [unusualDaysListing, setUnusualDaysListing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    pageSize: 10
  });

  const handlePdfOpen = () => {
    setPdfModalOpen(true);
  };

  const handlePdfClose = () => {
    setPdfModalOpen(false);
  };

  const handleDrawerOpen = (item) => {
    // Handle both user data (from user patterns table) and transaction data (from listing table)
    if (item.user && item.total_transactions) {
      // User data from user patterns table
      const transformedUser = {
        user: item.user,
        total_transactions: item.total_transactions,
        total_amount: item.total_amount,
        average_amount: item.average_amount,
        high_value_count: item.high_value_count,
        high_value_percentage: item.high_value_percentage,
        days_activity: item.days_activity,
        risk_level: getRiskLevel(item.high_value_percentage || 0),
        risk_score: item.high_value_percentage || 0
      };
      setSelectedUser(transformedUser);
    } else {
      // Transaction data from listing table
      const transformedTransaction = {
        transaction_id: item.transaction_id,
        user: item.user,
        account: item.account,
        amount: item.amount,
        posting_date: item.posting_date,
        document_number: item.document_number,
        day_of_week: item.day_of_week,
        day_type: item.day_type,
        is_high_value: item.is_high_value,
        risk_level: item.risk_level || getRiskLevel(item.risk_score || 0),
        risk_score: item.risk_score || 0,
        amount_formatted: item.amount_formatted,
        amount_category: item.amount_category
      };
      setSelectedUser(transformedTransaction);
    }
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
  };

  // Extract currency from data or use default
  const currency = data?.currency || data?.file_info?.currency || 'SAR';

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '#d32f2f';
      case 'high': return '#f57c00';
      case 'medium': return '#fbc02d';
      case 'low': return '#388e3c';
      default: return '#757575';
    }
  };

  // Utility function to safely parse numeric values
  const safeParseFloat = (value, defaultValue = 0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Utility function to validate user data
  const validateUserData = (user) => {
    return user && 
           user.user && 
           typeof user.total_transactions === 'number' &&
           typeof user.total_amount === 'number';
  };

  // Extract data from the new API structure with validation
  const analysisInfo = data?.analysis_info || {};
  const summary = data?.summary || {};
  const unusualDaysAnalysis = data?.unusual_days_analysis || {};
  const patterns = data?.patterns || {};
  const riskAssessment = data?.risk_assessment || {};
  const visualizations = data?.visualizations || {};

  // Extract specific data from new structure with fallbacks
  const dayOfWeekActivity = unusualDaysAnalysis.day_of_week_activity || patterns.day_of_week_activity || {};
  const userDayPatterns = unusualDaysAnalysis.user_day_patterns || patterns.user_day_patterns || [];
  const fsLineDayPatterns = unusualDaysAnalysis.fs_line_day_patterns || patterns.fs_line_day_patterns || [];

  // Validate and calculate totals from new structure
  const totalWeekendTransactions = safeParseFloat(summary.weekend_postings, 0);
  const totalWeekendAmount = Object.values(dayOfWeekActivity).reduce((sum, day) => {
    return sum + safeParseFloat(day?.total_amount, 0);
  }, 0);
  const totalUnusualDays = safeParseFloat(summary.unusual_days_detected, 0);
  const overallRiskScore = safeParseFloat(summary.overall_risk_score || riskAssessment.overall_risk_score, 0);
  const overallRiskLevel = getRiskLevel(overallRiskScore);

  // Get unique users from user day patterns with validation
  const uniqueUsers = userDayPatterns
    .filter(validateUserData) // Filter out invalid entries
    .map(user => user.user) || [];

  // Calculate weekend percentage with validation
  const weekendPercentage = summary.total_transactions && summary.total_transactions > 0 ? 
    ((totalWeekendTransactions / summary.total_transactions) * 100) : 0;

  // Validate data structure and provide fallbacks
  const hasValidData = summary.total_transactions && summary.total_transactions > 0;
  const hasWeekendActivity = totalWeekendTransactions > 0;
  const hasUserPatterns = userDayPatterns.length > 0;
  const hasDayActivity = Object.keys(dayOfWeekActivity).length > 0;

  // Error handling for missing or invalid data
  const hasAnalysisInfo = analysisInfo.analysis_id && analysisInfo.analysis_date;
  const hasRiskAssessment = riskAssessment.overall_risk_score !== undefined;

  // API call to fetch unusual days entries listing
  const fetchUnusualDaysListing = async (page = 1, pageSize = 10) => {
    if (!sheetId) {
      console.warn('No sheetId provided for unusual days listing API call');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/unusual-days-list/${sheetId}/?page=${page}&page_size=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Handle the specific API response format
      const listingData = result.results || result.data || result.unusual_days_entries || [];
      
      setUnusualDaysListing(listingData);
      setPagination({
        count: result.count || 0,
        next: result.next,
        previous: result.previous,
        currentPage: page,
        pageSize: pageSize
      });
    } catch (err) {
      console.error('Error fetching unusual days listing:', err);
      setError(err.message || 'Failed to fetch unusual days entries listing');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchUnusualDaysListing(1, 10);
  }, [sheetId]);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    fetchUnusualDaysListing(newPage, pagination.pageSize);
  };

  const handlePageSizeChange = (newPageSize) => {
    fetchUnusualDaysListing(1, newPageSize);
  };

  // Prepare charts data from the new structure
  const chartsData = {
    // Create weekend_postings from user day patterns for charts that need it
    weekend_postings: userDayPatterns.flatMap(user => {
      const weekendTransactions = [];
      
      // Calculate user risk score based on high value percentage
      const userRiskScore = safeParseFloat(user?.high_value_percentage, 0);
      
      // Add Saturday transactions
      if (user.days_activity?.Saturday) {
        for (let i = 0; i < user.days_activity.Saturday.count; i++) {
          weekendTransactions.push({
            user_name: user.user,
            amount: user.days_activity.Saturday.amount / user.days_activity.Saturday.count,
            posting_date: 'Saturday',
            day_name: 'Saturday',
            risk_score: userRiskScore
          });
        }
      }
      
      // Add Sunday transactions
      if (user.days_activity?.Sunday) {
        for (let i = 0; i < user.days_activity.Sunday.count; i++) {
          weekendTransactions.push({
            user_name: user.user,
            amount: user.days_activity.Sunday.amount / user.days_activity.Sunday.count,
            posting_date: 'Sunday',
            day_name: 'Sunday',
            risk_score: userRiskScore
          });
        }
      }
      
      return weekendTransactions;
    }),
    
    // Create unusual_days data for UnusualDaysDistributionChart
    unusual_days: Object.entries(dayOfWeekActivity).map(([day, data]) => ({
      day_name: day,
      transaction_count: data.count || 0,
      deviation_percentage: ((data.count || 0) / (summary.total_transactions || 1)) * 100
    })),
    
    // Create day_of_week_activity data for DayOfWeekActivityChart
    day_of_week_activity: Object.entries(dayOfWeekActivity).map(([day, data]) => ({
      day_name: day,
      total_amount: data.total_amount || 0,
      total_transactions: data.count || 0,
      average_amount: data.average_amount || 0,
      high_value_count: data.high_value_count || 0,
      high_value_amount: data.high_value_amount || 0
    })),
    
    // Use existing chart data from API response and ensure proper structure
    weekend_by_user: visualizations.chart_data?.weekend_by_user || {
      data: userDayPatterns.map(user => safeParseFloat(user?.total_transactions, 0)),
      title: "Top Users by Unusual Days Transactions",
      labels: userDayPatterns.map(user => user?.user || 'Unknown')
    },
    weekend_by_month: visualizations.chart_data?.weekend_by_month || {
      data: [],
      title: "Unusual Days Transactions by Month",
      labels: []
    },
    weekend_by_account: visualizations.chart_data?.weekend_by_account || {
      data: [],
      title: "Top Accounts by Unusual Days Transactions",
      labels: []
    },
    unusual_days_summary: visualizations.chart_data?.unusual_days_summary || {
      total_transactions: summary.total_transactions || 0,
      weekend_percentage: weekendPercentage,
      total_weekend_transactions: totalWeekendTransactions
    },
    weekend_risk_distribution: visualizations.chart_data?.weekend_risk_distribution || (() => {
      // Calculate risk distribution based on user patterns
      let lowRisk = 0, mediumRisk = 0, highRisk = 0;
      
      userDayPatterns.forEach(user => {
        const riskScore = safeParseFloat(user?.high_value_percentage, 0);
        if (riskScore < 40) {
          lowRisk += safeParseFloat(user?.total_transactions, 0);
        } else if (riskScore < 80) {
          mediumRisk += safeParseFloat(user?.total_transactions, 0);
        } else {
          highRisk += safeParseFloat(user?.total_transactions, 0);
        }
      });
      
      return {
        low_risk: lowRisk,
        high_risk: highRisk,
        medium_risk: mediumRisk
      };
    })(),
    weekend_amount_distribution: visualizations.chart_data?.weekend_amount_distribution || (() => {
      // Calculate amount distribution based on day of week activity
      const amounts = Object.values(dayOfWeekActivity).map(day => safeParseFloat(day?.total_amount, 0));
      const minAmount = Math.min(...amounts);
      const maxAmount = Math.max(...amounts);
      const range = maxAmount - minAmount;
      const bucketSize = range / 5;
      
      const distribution = [0, 0, 0, 0, 0];
      const labels = [];
      
      for (let i = 0; i < 5; i++) {
        const start = minAmount + (i * bucketSize);
        const end = minAmount + ((i + 1) * bucketSize);
        labels.push(`${formatCurrency(start)} - ${formatCurrency(end)}`);
        
        amounts.forEach(amount => {
          if (amount >= start && amount <= end) {
            distribution[i]++;
          }
        });
      }
      
      return {
        data: distribution,
        title: "Unusual Day Transaction Amount Distribution",
        labels: labels
      };
    })(),
    
    // Add day of week activity raw data
    day_of_week_activity_raw: dayOfWeekActivity,
    
    // Add summary data
    summary: summary,
    
    // Add risk assessment
    risk_assessment: riskAssessment,
    
    // Add patterns data for charts
    patterns: patterns,
    
    // Add unusual days analysis data with properly formatted chart data
    unusual_days_analysis: {
      ...unusualDaysAnalysis,
      // Override with properly formatted chart data
      weekend_postings: userDayPatterns.flatMap(user => {
        const weekendTransactions = [];
        
        // Calculate user risk score based on high value percentage
        const userRiskScore = safeParseFloat(user?.high_value_percentage, 0);
        
        // Add Saturday transactions
        if (user.days_activity?.Saturday) {
          for (let i = 0; i < user.days_activity.Saturday.count; i++) {
            weekendTransactions.push({
              user_name: user.user,
              amount: user.days_activity.Saturday.amount / user.days_activity.Saturday.count,
              posting_date: 'Saturday',
              day_name: 'Saturday',
              risk_score: userRiskScore
            });
          }
        }
        
        // Add Sunday transactions
        if (user.days_activity?.Sunday) {
          for (let i = 0; i < user.days_activity.Sunday.count; i++) {
            weekendTransactions.push({
              user_name: user.user,
              amount: user.days_activity.Sunday.amount / user.days_activity.Sunday.count,
              posting_date: 'Sunday',
              day_name: 'Sunday',
              risk_score: userRiskScore
            });
          }
        }
        
        return weekendTransactions;
      }),
      
      // Format day_of_week_activity for charts
      day_of_week_activity: Object.entries(dayOfWeekActivity).map(([day, data]) => ({
        day_name: day,
        total_amount: data.total_amount || 0,
        total_transactions: data.count || 0,
        average_amount: data.average_amount || 0,
        high_value_count: data.high_value_count || 0,
        high_value_amount: data.high_value_amount || 0
      })),
      
      // Add unusual_days data
      unusual_days: Object.entries(dayOfWeekActivity).map(([day, data]) => ({
        day_name: day,
        transaction_count: data.count || 0,
        deviation_percentage: ((data.count || 0) / (summary.total_transactions || 1)) * 100
      }))
    },
    
    // Add analysis info
    analysis_info: analysisInfo,
    
    // Add user day patterns for user-specific charts
    user_day_patterns: userDayPatterns,
    
    // Add fs line day patterns
    fs_line_day_patterns: fsLineDayPatterns
  };

  // Debug: Log charts data structure
  console.log('Charts Data:', chartsData);
  console.log('Visualizations Chart Data:', visualizations.chart_data);
  console.log('Day of Week Activity:', chartsData.day_of_week_activity);
  console.log('Weekend Postings:', chartsData.weekend_postings?.slice(0, 5)); // Show first 5 entries
  console.log('Unusual Days:', chartsData.unusual_days);

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', p: 3 }}>
      {/* Error Alert for Invalid Data */}
      {!hasValidData && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          icon={<ErrorIcon />}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Invalid or missing data detected
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            The analysis data appears to be incomplete or corrupted. Please ensure all required fields are present.
          </Typography>
        </Alert>
      )}

      {/* Analysis Status */}
      <Alert 
        severity={hasWeekendActivity ? "warning" : "success"} 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={hasWeekendActivity ? <WarningIcon /> : <InfoIcon />}
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<PictureAsPdfIcon />}
            onClick={handlePdfOpen}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
            }}
          >
            Download PDF
          </Button>
        }
      >
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {hasWeekendActivity 
            ? `Found ${totalWeekendTransactions} weekend transactions involving ${uniqueUsers.length} users`
            : "No unusual days anomalies found"
          }
        </Typography>
        {hasWeekendActivity && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Total amount involved: {formatCurrency(totalWeekendAmount)}
          </Typography>
        )}
      </Alert>

      {/* Unusual Days Analysis Definitions */}
      <Alert 
        severity="info" 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={<InfoIcon />}
      >
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
          Unusual Days Analysis Classification
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          This analysis identifies transactions on unusual business days (weekends, holidays, etc.) and patterns that deviate from normal business operations.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item size={{xs: 12, sm: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Weekend Postings
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Transactions posted on weekends (Saturday/Sunday)
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, sm: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  High Activity Days
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Days with unusually high transaction volumes
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, sm: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Low Activity Days
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Days with unusually low transaction volumes
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, sm: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Holiday Patterns
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Transactions on holidays or non-business days
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Alert>

      {/* Top Summary Banner */}
      <Card sx={{ 
        mb: 4, 
        background: 'white', 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #e9ecef'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4} alignItems="center">
            {/* Left Section - Analysis Information */}
            <Grid item size={{xs: 12, md: 6}}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#2c3e50', 
                mb: 1,
                fontSize: '1.75rem'
              }}>
                Unusual Days Analysis
              </Typography>
              <Typography variant="body1" sx={{ color: '#6c757d', mb: 0.5 }}>
                Analysis Date: {new Date(analysisInfo.analysis_date || Date.now()).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                Status: {analysisInfo.status || 'COMPLETED'} • Unusual Days: {totalUnusualDays}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', width:'fit-content', marginTop: '10px', gap: '10px' }}>
                <Box sx={{ 
                  width: 120,
                  height: 120, 
                  borderRadius: '50%', 
                  background: '#925a9b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  position: 'relative',
                  boxShadow: '0 4px 16px rgba(146, 90, 155, 0.3)'
                }}>
                  <Typography variant="h2" sx={{ 
                    fontWeight: 800, 
                    color: 'white',
                    fontSize: '1.6rem'
                  }}>
                    {Math.round(overallRiskScore)}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width:'fit-content', marginTop: '10px' }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 1, 
                    color: '#2c3e50',
                    fontSize: '1rem'
                  }}>
                    Final Result
                  </Typography>
                  <Chip 
                    label={overallRiskLevel} 
                    size="medium"
                    sx={{ 
                      backgroundColor: getRiskColor(overallRiskLevel),
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      px: 2,
                      py: 0.5
                    }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Right Section - Analysis Results & Statistics */}
            <Grid item size={{xs: 12, md: 6}}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handlePdfOpen}
                  sx={{
                    backgroundColor: '#925a9b',
                    '&:hover': { backgroundColor: '#7a4a82' },
                    borderRadius: 2,
                    px: 3,
                    py: 1
                  }}
                >
                  Download PDF Report
                </Button>
              </Box>
              <Grid container spacing={2}>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <WeekendIcon sx={{ 
                      color: '#925a9b', 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {totalWeekendTransactions}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Weekend Transactions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CalendarIcon sx={{ 
                      color: '#925a9b', 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {totalUnusualDays}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Unusual Days
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <AccountBalanceIcon sx={{ 
                      color: '#925a9b', 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {formatCurrency(totalWeekendAmount)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Weekend Amount
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <SecurityIcon sx={{ 
                      color: '#925a9b', 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {uniqueUsers.length}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Users Involved
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <TimelineIcon sx={{ 
                      color: '#925a9b', 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {summary.total_transactions || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Total Transactions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <AssessmentIcon sx={{ 
                      color: '#925a9b', 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {overallRiskScore?.toFixed(1) || 0}%
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Risk Score
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Distribution Overview */}
      {distributionData && (
        <Card sx={{ 
          mb: 4, 
          background: 'white', 
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e9ecef'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: '1.25rem'
            }}>
              <TrendingUpIcon sx={{ mr: 1, color: '#925a9b' }} />
              Unusual Days Distribution Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item size={{xs: 12, md: 3}}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                    {distributionData.count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unusual Days Found
                  </Typography>
                </Box>
              </Grid>
              <Grid item size={{xs: 12, md: 3}}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    {distributionData.percentage?.toFixed(1) || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    of Total Anomalies
                  </Typography>
                </Box>
              </Grid>
              <Grid item size={{xs: 12, md: 3}}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                    {anomalySummary?.total_anomalies || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Anomalies
                  </Typography>
                </Box>
              </Grid>
              <Grid item size={{xs: 12, md: 3}}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                    {anomalySummary ? Object.keys(anomalySummary).filter(key => 
                      key !== 'total_anomalies' && (anomalySummary[key] || 0) > 0
                    ).length : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Anomaly Types
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Summary Metrics */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item size={{xs: 12, md: 3}}>
            <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#B894C4', border: '1px solid #925a9b' }}>
              <Typography variant="h5" fontWeight={700} color="white">
                {summary.unusual_days_detected || 0}
              </Typography>
              <Typography variant="body2" fontWeight={600} color="white">
                Unusual Days
              </Typography>
            </Card>
          </Grid>
          <Grid item size={{xs: 12, md: 3}}>
            <Card sx={{ p: 2, textAlign: 'center',  bgcolor: '#B894C4', border: '1px solid #925a9b'  }}>
              <Typography variant="h5" fontWeight={700} color="white">
                {summary.total_transactions || 0}
              </Typography>
              <Typography variant="body2" fontWeight={600} color="white">
                Total Transactions
              </Typography>
            </Card>
          </Grid>
          <Grid item size={{xs: 12, md: 3}}>
            <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#B894C4', border: '1px solid #925a9b' }}>
              <Typography variant="h5" fontWeight={700} color="white">
                {formatCurrency(totalWeekendAmount)}
              </Typography>
              <Typography variant="body2" fontWeight={600} color="white">
                Weekend Amount
              </Typography>
            </Card>
          </Grid>
          <Grid item size={{xs: 12, md: 3}}>
            <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#B894C4', border: '1px solid #925a9b' }}>
              <Typography variant="h5" fontWeight={700} color="white">
                {summary.weekend_postings || 0}
              </Typography>
              <Typography variant="body2" fontWeight={600} color="white">
                Weekend Transactions
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Charts Dashboard */}
      <UnusualDaysDashboard data={chartsData} />

      {/* Unusual Days Listing Table */}
      <Card sx={{ 
        mb: 4, 
        background: 'white', 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #e9ecef'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 600,
            color: '#2c3e50',
            fontSize: '1.25rem'
          }}>
            <WeekendIcon sx={{ mr: 1, color: '#925a9b' }} />
            Unusual Days Transactions Listing
          </Typography>

          {/* Listing Summary */}
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#925a9b' }}>
                    {pagination.count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#925a9b' }}>
                    {unusualDaysListing.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current Page
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#925a9b' }}>
                    {pagination.pageSize}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Page Size
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#925a9b' }}>
                    {Math.ceil(pagination.count / pagination.pageSize)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Pages
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : unusualDaysListing.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Transaction ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Account</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Day of Week</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Risk Level</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unusualDaysListing.map((transaction, index) => (
                      <TableRow key={transaction.transaction_id || index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600, 
                            color: '#2c3e50',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem'
                          }}>
                            {transaction.transaction_id ? 
                              `${transaction.transaction_id.substring(0, 8)}...` : 
                              'N/A'
                            }
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              mr: 2, 
                              bgcolor: transaction.risk_color || getRiskColor(getRiskLevel(transaction.risk_score || 0)),
                              width: 32,
                              height: 32
                            }}>
                              {(transaction.user || 'U').charAt(0)}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                              {transaction.user || 'Unknown User'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ 
                            color: '#2c3e50',
                            fontFamily: 'monospace',
                            fontWeight: 600
                          }}>
                            {transaction.account || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                              {transaction.amount_formatted || formatCurrency(transaction.amount)}
                            </Typography>
                            {transaction.amount_category && (
                              <Chip 
                                label={transaction.amount_category} 
                                size="small"
                                sx={{
                                  backgroundColor: transaction.amount_category === 'HIGH' ? '#dc3545' : 
                                                   transaction.amount_category === 'MEDIUM' ? '#fd7e14' : '#28a745',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.6rem',
                                  height: 16,
                                  mt: 0.5
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.day_of_week || 'Unknown'} 
                            size="small"
                            sx={{
                              backgroundColor: transaction.day_of_week === 'Saturday' ? '#dc3545' : 
                                               transaction.day_of_week === 'Sunday' ? '#fd7e14' : '#6c757d',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={transaction.risk_level || getRiskLevel(transaction.risk_score || 0)} 
                            size="small"
                            sx={{
                              backgroundColor: transaction.risk_color || getRiskColor(getRiskLevel(transaction.risk_score || 0)),
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleDrawerOpen(transaction)}
                              sx={{ 
                                color: '#925a9b',
                                '&:hover': {
                                  backgroundColor: '#925a9b',
                                  color: 'white'
                                }
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mt: 3,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.count)} of{' '}
                    {pagination.count} entries
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={pagination.pageSize}
                      onChange={(e) => handlePageSizeChange(e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value={10}>10 per page</MenuItem>
                      <MenuItem value={25}>25 per page</MenuItem>
                      <MenuItem value={50}>50 per page</MenuItem>
                      <MenuItem value={100}>100 per page</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <Pagination
                  count={Math.ceil(pagination.count / pagination.pageSize)}
                  page={pagination.currentPage}
                  onChange={(e, page) => handlePageChange(page)}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No unusual days transactions found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Day of Week Activity Table */}
      {hasDayActivity && (
        <Card sx={{ 
          mb: 4, 
          background: 'white', 
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e9ecef'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: '1.25rem'
            }}>
              <WeekendIcon sx={{ mr: 1, color: '#925a9b' }} />
              Day of Week Activity Analysis
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Day</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Transaction Count</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Total Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Average Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>High Value Count</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>High Value Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(dayOfWeekActivity).map(([day, data]) => (
                    <TableRow key={day} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {day || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                          {safeParseFloat(data?.count, 0)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {formatCurrency(safeParseFloat(data?.total_amount, 0))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                          {formatCurrency(safeParseFloat(data?.average_amount, 0))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                          {safeParseFloat(data?.high_value_count, 0)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {formatCurrency(safeParseFloat(data?.high_value_amount, 0))}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* User Day Patterns Table */}
      {hasUserPatterns && (
        <Card sx={{ 
          mb: 4, 
          background: 'white', 
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e9ecef'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ 
              mb: 3, 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 600,
              color: '#2c3e50',
              fontSize: '1.25rem'
            }}>
              <CalendarIcon sx={{ mr: 1, color: '#925a9b' }} />
              User Day Patterns Analysis
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Total Transactions</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Total Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>High Value %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userDayPatterns.map((user, index) => (
                    <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ 
                            mr: 2, 
                            bgcolor: getRiskColor(getRiskLevel(safeParseFloat(user?.high_value_percentage, 0))),
                            width: 32,
                            height: 32
                          }}>
                            {(user?.user || 'U').charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            {user?.user || 'Unknown User'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                          {safeParseFloat(user?.total_transactions, 0)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {formatCurrency(safeParseFloat(user?.total_amount, 0))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                          {safeParseFloat(user?.high_value_percentage, 0).toFixed(1)}%
                        </Typography>
                      </TableCell>
                     
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment Summary */}
      <Card sx={{ 
        mb: 4, 
        background: 'white', 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #e9ecef'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 600,
            color: '#2c3e50',
            fontSize: '1.25rem'
          }}>
            <AssessmentIcon sx={{ mr: 1, color: '#925a9b' }} />
            Risk Assessment Summary
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item size={{xs: 12, md: 4}}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 3, 
                bgcolor: '#B894C4', 
                borderRadius: 2,
                border: '1px solid #925a9b',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}>
                <Typography variant="h4" color="white" sx={{ fontWeight: 700, mb: 1 }}>
                  {safeParseFloat(riskAssessment.weekend_risk_score, 0).toFixed(1)}%
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                  Weekend Risk Score
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 4}}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 3, 
                bgcolor: '#B894C4', 
                borderRadius: 2,
                border: '1px solid #925a9b',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}>
                <Typography variant="h4" color="white" sx={{ fontWeight: 700, mb: 1 }}>
                  {safeParseFloat(riskAssessment.unusual_pattern_risk_score, 0).toFixed(1)}%
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                  Pattern Risk Score
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 4}}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 3, 
                bgcolor: '#B894C4', 
                borderRadius: 2,
                border: '1px solid #925a9b',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}>
                <Typography variant="h4" color="white" sx={{ fontWeight: 700, mb: 1 }}>
                  {safeParseFloat(riskAssessment.overall_risk_score, 0).toFixed(1)}%
                </Typography>
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                  Overall Risk Score
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Risk Recommendations */}
          {riskAssessment.risk_assessment?.recommendations && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                Recommendations
              </Typography>
              <Grid container spacing={2}>
                {riskAssessment.risk_assessment.recommendations.map((recommendation, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: '#f8f9fa', 
                      borderRadius: 2, 
                      border: '1px solid #e9ecef',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <InfoIcon sx={{ mr: 1, color: '#925a9b' }} />
                      <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                        {recommendation}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Unified Anomaly Drawer */}
      <UnifiedAnomalyDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        anomaly={selectedUser}
        type="Unusual Days Analysis"
      />

      {/* PDF Modal */}
      <UnusualDaysAnalysisPDF
        open={pdfModalOpen}
        setOpen={setPdfModalOpen}
        data={data}
        currency={currency}
      />
    </Box>
  );
} 