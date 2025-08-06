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
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
  Timeline as TimelineIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import { getRiskColor } from '../../utils/colorScheme';

// Import chart components (if needed for future use)
// import RiskDistributionChart from '../charts/RiskDistributionChart';
// import AnomaliesDistributionChart from '../charts/AnomaliesDistributionChart';
// import BasicMetricsWidget from '../charts/BasicMetricsWidget';

// Import drawer component
import UserAnalysisDrawer from '../UserAnalysisDrawer';

// Import dashboard component
import UserAnalysisDashboard from '../charts/UserAnalysisDashboard';

// Import PDF component
import UserAnalysisPDF from './UserAnalysisPDF';

// Import Recharts for custom charts (if needed for future use)
// import { 
//   BarChart, 
//   Bar, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   ResponsiveContainer, 
//   Tooltip, 
//   Legend, 
//   PieChart, 
//   Pie, 
//   Cell,
//   LineChart,
//   Line,
//   Area,
//   AreaChart
// } from 'recharts';

export default function UserAnalysisContent({ data, distributionData, anomalySummary, sheetId }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  
  // New state for API integration
  const [userListing, setUserListing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    pageSize: 10
  });

  // Extract currency from data or use default
  const currency = data?.currency || data?.file_info?.currency || 'SAR';

  const handleDrawerOpen = (user) => {
    // Transform the user data to match the expected drawer format
    const transformedUser = {
      user: user.user,
      transaction_count: user.transaction_count,
      total_amount: user.total_amount,
      avg_amount: user.avg_amount,
      risk_level: user.risk_level,
      risk_score: user.risk_score,
      anomaly_count: user.anomaly_count,
      accounts: user.accounts || [],
      accounts_count: user.accounts_count,
      is_high_activity: user.is_high_activity,
      activity_category: user.activity_category,
      user_severity: user.user_severity,
      amount_formatted: user.amount_formatted,
      avg_amount_formatted: user.avg_amount_formatted,
      risk_color: user.risk_color,
      // Add additional fields for drawer compatibility
      account_details: user.accounts || [],
      anomaly_type: user.anomaly_count > 0 ? 'HIGH_ACTIVITY' : 'NORMAL',
      severity: user.user_severity
    };
    setSelectedUser(transformedUser);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
  };

  const handlePdfOpen = () => {
    setPdfModalOpen(true);
  };

  const handlePdfClose = () => {
    setPdfModalOpen(false);
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    
    if (num >= 1000000000000) {
      return `${(num / 1000000000000).toFixed(1)}T ${currency}`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M ${currency}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K ${currency}`;
    } else {
      return `${num.toFixed(0)} ${currency}`;
    }
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

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'HIGH_ACTIVITY': return <ErrorIcon />;
      case 'HIGH_AMOUNT': return <ErrorIcon />;
      case 'UNUSUAL_BALANCE': return <WarningIcon />;
      case 'ACCOUNT_CONCENTRATION': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  // API call to fetch user entries listing
  const fetchUserListing = async (page = 1, pageSize = 10) => {
    if (!sheetId) {
      console.warn('No sheetId provided for user listing API call');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/user-list/${sheetId}/?page=${page}&page_size=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Handle the specific API response format with better error handling
      const listingData = result.results || result.data || result.user_entries || [];
      
      // Validate that we have an array of data
      if (!Array.isArray(listingData)) {
        throw new Error('Invalid response format: expected array of user entries');
      }
      
      setUserListing(listingData);
      setPagination({
        count: result.count || listingData.length,
        next: result.next,
        previous: result.previous,
        currentPage: page,
        pageSize: pageSize
      });
    } catch (err) {
      console.error('Error fetching user listing:', err);
      setError(err.message || 'Failed to fetch user entries listing');
      setUserListing([]);
      setPagination({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1,
        pageSize: pageSize
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchUserListing(1, 10);
  }, [sheetId]);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    fetchUserListing(newPage, pagination.pageSize);
  };

  const handlePageSizeChange = (newPageSize) => {
    fetchUserListing(1, newPageSize);
  };

  // Extract data from the API structure
  const userSummary = data?.user_analysis?.user_transaction_summary || [];
  const userAnomalies = data?.anomaly_detection?.user_anomalies || [];
  const userRiskScores = data?.risk_assessment?.user_risk_scores || [];
  const userAccountDistribution = data?.user_analysis?.user_account_distribution || [];
  const userDebitAnalysis = data?.user_analysis?.user_debit_analysis || [];
  const summary = data?.summary || {};
  const riskDistribution = summary?.risk_distribution || {};
  const anomalyTypes = data?.anomaly_detection?.anomaly_types || {};
  const chartData = data?.visualizations?.chart_data || {};
  const analysisInfo = data?.analysis_info || {};

  // Prepare chart data from the new structure
  const userAmountsData = (chartData.user_summary || []).map(user => ({
    user: user.user,
    amount: parseFloat(user.total_amount || 0)
  })).sort((a, b) => b.amount - a.amount);

  const userActivityData = (chartData.user_summary || []).map(user => ({
    user: user.user,
    activity: parseInt(user.transaction_count || 0)
  })).sort((a, b) => b.activity - a.activity);

  const riskDistributionData = Object.entries(riskDistribution).map(([level, count]) => ({
    level: level.toUpperCase(),
    count: parseInt(count)
  }));

  const anomalyDistributionData = Object.entries(anomalyTypes).map(([type, data]) => ({
    type: type.replace('_', ' ').toUpperCase(),
    count: parseInt(data.count || 0)
  }));

  // Calculate total amounts and risk scores
  const totalAmount = userSummary.reduce((sum, user) => sum + (user.total_amount || 0), 0);
  const totalTransactions = userSummary.reduce((sum, user) => sum + (user.transaction_count || 0), 0);
  
  // Calculate average risk score based on risk levels (since no numeric scores in new API)
  const riskLevelScores = {
    'LOW': 20,
    'MEDIUM': 50,
    'HIGH': 80,
    'CRITICAL': 95
  };
  
  const avgRiskScore = userRiskScores.length > 0 ? 
    userRiskScores.reduce((sum, user) => sum + (riskLevelScores[user.risk_level] || 0), 0) / userRiskScores.length : 0;
  const overallRiskLevel = avgRiskScore >= 60 ? 'HIGH' : avgRiskScore >= 40 ? 'MEDIUM' : 'LOW';

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', p: 3 }}>
      {/* Analysis Status */}
      <Alert 
        severity={userAnomalies.length > 0 ? "warning" : "success"} 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={userAnomalies.length > 0 ? <WarningIcon /> : <InfoIcon />}
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
          {userAnomalies.length > 0 
            ? `Found ${userAnomalies.length} users with anomalies involving ${totalTransactions} transactions`
            : "No user anomalies found"
          }
        </Typography>
        {userAnomalies.length > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Total amount involved: {formatCurrency(totalAmount)}
          </Typography>
        )}
      </Alert>

      {/* User Analysis Definitions */}
      <Alert 
        severity="info" 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={<InfoIcon />}
      >
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
          User Anomaly Classification Types
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          This analysis identifies user behavior patterns and transaction anomalies. The classification for User Anomalies are categorized as below:
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item size={{xs: 12, sm: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  High Amount Anomaly
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Unusually large transaction amounts
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, sm: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Unusual Balance Pattern
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Abnormal debit/credit balance ratios
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, sm: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Account Concentration
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Limited account diversity usage
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, sm: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Transaction Pattern
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Unusual transaction frequency patterns
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
                User Analysis
              </Typography>
              <Typography variant="body1" sx={{ color: '#6c757d', mb: 0.5 }}>
                Analysis Date: {new Date(analysisInfo.analysis_date || Date.now()).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                Status: {analysisInfo.status || 'COMPLETED'} • Users: {userSummary.length}
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
                    {Math.round(avgRiskScore)}%
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
                    <PersonIcon sx={{ 
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
                      {summary.total_users || userSummary.length}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Total Users
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <WarningIcon sx={{ 
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
                      {summary.high_risk_users || userRiskScores.filter(r => r.risk_level === 'HIGH' || r.risk_level === 'CRITICAL').length}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      High Risk Users
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
                      {totalTransactions}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Transactions
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
                      {formatCurrency(totalAmount)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Total Amount
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
                      {userAnomalies.length}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Anomalies
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
                      {formatCurrency(totalAmount / Math.max(userSummary.length, 1))}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Avg Per User
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Charts Dashboard */}
      <UserAnalysisDashboard data={data} />

      {/* User Analysis Table */}
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
            <SecurityIcon sx={{ mr: 1, color: '#925a9b' }} />
            User Analysis & Risk Assessment
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Transactions</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Risk Score</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Anomalies</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Risk Level</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userSummary.map((user, index) => {
                  const userAnomaly = userAnomalies.find(a => a.user === user.user);
                  const userRisk = userRiskScores.find(r => r.user === user.user);
                  const userAccount = userAccountDistribution.find(a => a.user === user.user);
                  
                  return (
                    <React.Fragment key={index}>
                      <TableRow sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              mr: 2, 
                              bgcolor: getRiskColor(userRisk?.risk_level || 'medium'),
                              width: 40,
                              height: 40
                            }}>
                              {user.user.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                                {user.user}
                              </Typography>
                              <Typography variant="caption" color="#6c757d">
                                {user.accounts?.length || 0} accounts
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            {formatCurrency(user.total_amount)}
                          </Typography>
                          <Typography variant="caption" color="#6c757d">
                            Avg: {formatCurrency(user.avg_amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                            {user.transaction_count}
                          </Typography>
                          <Typography variant="caption" color="#6c757d">
                            Accounts: {user.accounts?.length || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress
                              variant="determinate"
                              value={riskLevelScores[userRisk?.risk_level] || 0}
                              sx={{ 
                                width: 60, 
                                mr: 1,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: '#e9ecef',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: getRiskColor(userRisk?.risk_level || 'medium'),
                                  borderRadius: 3
                                }
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                              {riskLevelScores[userRisk?.risk_level] || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Badge badgeContent={userAnomaly ? 1 : 0} color="error">
                            <Chip 
                              label={userAnomaly?.anomaly_type?.replace('_', ' ') || 'N/A'} 
                              size="small"
                              sx={{
                                backgroundColor: getRiskColor(userAnomaly?.risk_level || 'medium'),
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            />
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={userRisk?.risk_level || 'N/A'} 
                            size="small"
                            sx={{
                              backgroundColor: getRiskColor(userRisk?.risk_level || 'medium'),
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleDrawerOpen({
                              ...user,
                              ...userRisk,
                              ...userAnomaly,
                              account_details: user.accounts || []
                            })}
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
                        </TableCell>
                      </TableRow>
                      

                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

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
                bgcolor: '#fff3e0', 
                borderRadius: 2,
                border: '1px solid #ffcc02',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}>
                <Typography variant="h4" color="error" sx={{ fontWeight: 700, mb: 1 }}>
                  {riskDistribution.high || 0}
                </Typography>
                <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                  High Risk Users
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 4}}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 3, 
                bgcolor: '#fff8e1', 
                borderRadius: 2,
                border: '1px solid #ffb300',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}>
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700, mb: 1 }}>
                  {riskDistribution.medium || 0}
                </Typography>
                <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                  Medium Risk Users
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 4}}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 3, 
                bgcolor: '#f1f8e9', 
                borderRadius: 2,
                border: '1px solid #4caf50',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)'
                }
              }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
                  {riskDistribution.low || 0}
                </Typography>
                <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                  Low Risk Users
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* User Analysis Drawer */}
      <UserAnalysisDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        userData={selectedUser}
        type="User Analysis"
      />

      {/* API Fetched User Listing */}
      <Card sx={{ 
        mb: 4, 
        background: 'white', 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #e9ecef'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: '#2c3e50',
              fontSize: '1.25rem'
            }}>
              User Entries Listing
            </Typography>
            <Button
              variant="outlined"
              onClick={() => fetchUserListing(pagination.currentPage, pagination.pageSize)}
              disabled={loading}
              sx={{
                borderColor: '#925a9b',
                color: '#925a9b',
                fontWeight: 600,
                px: 2,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: '#925a9b',
                  color: 'white',
                  borderColor: '#925a9b'
                }
              }}
            >
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </Button>
          </Box>

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <LinearProgress sx={{ width: '100%', mb: 2 }} />
              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                Fetching user entries listing...
              </Typography>
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Error Loading User Listing
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {error}
              </Typography>
              <Button
                variant="contained"
                onClick={() => fetchUserListing(pagination.currentPage, pagination.pageSize)}
                sx={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: '#c82333'
                  }
                }}
              >
                🔄 Retry
              </Button>
            </Alert>
          )}

          {/* Success State - Display Data */}
          {!loading && !error && userListing.length > 0 && (
            <Box>
              <Typography variant="body1" sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: '#2c3e50',
                fontSize: '1rem'
              }}>
                Found {pagination.count} user entries from API (showing page {pagination.currentPage} of {Math.ceil(pagination.count / pagination.pageSize)})
              </Typography>
              
              <Paper sx={{ 
                borderRadius: 3, 
                boxShadow: 2,
                overflow: 'hidden'
              }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ 
                        backgroundColor: '#f8f9fa',
                        '& th': {
                          borderBottom: '2px solid #e9ecef',
                          fontWeight: 700,
                          color: '#2c3e50',
                          fontSize: '0.875rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }
                      }}>
                                                 <TableCell>User</TableCell>
                         <TableCell>Transaction Count</TableCell>
                         <TableCell>Total Amount</TableCell>
                         <TableCell>Avg Amount</TableCell>
                         <TableCell>Risk Level</TableCell>
                         <TableCell>Risk Score</TableCell>
                         <TableCell>Anomaly Count</TableCell>
                         <TableCell>Accounts</TableCell>
                         <TableCell>Activity Category</TableCell>
                         <TableCell>Severity</TableCell>
                         <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userListing.map((entry, index) => (
                        <TableRow 
                          key={index}
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: '#f8f9fa',
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease-in-out'
                            },
                            '&:nth-of-type(even)': {
                              backgroundColor: '#fafbfc'
                            }
                          }}
                        >
                                                     <TableCell sx={{ py: 2 }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                               <Avatar sx={{ 
                                 width: 32, 
                                 height: 32, 
                                 backgroundColor: '#925a9b',
                                 fontSize: '0.875rem',
                                 fontWeight: 600
                               }}>
                                 {entry.user?.charAt(0) || 'U'}
                               </Avatar>
                               <Box>
                                 <Typography variant="body2" sx={{ 
                                   fontWeight: 600, 
                                   color: '#2c3e50',
                                   fontSize: '0.875rem'
                                 }}>
                                   {entry.user || `User-${index + 1}`}
                                 </Typography>
                                 <Typography variant="caption" sx={{ 
                                   color: '#6c757d',
                                   fontSize: '0.75rem'
                                 }}>
                                   API Entry #{index + 1}
                                 </Typography>
                               </Box>
                             </Box>
                           </TableCell>
                           <TableCell sx={{ py: 2 }}>
                             <Typography variant="body2" sx={{ 
                               color: '#6c757d',
                               fontSize: '0.875rem',
                               fontWeight: 500
                             }}>
                               {entry.transaction_count || 0}
                             </Typography>
                           </TableCell>
                                                     <TableCell align="right" sx={{ py: 2 }}>
                             <Typography variant="body2" sx={{ 
                               fontWeight: 700, 
                               color: '#925a9b',
                               fontSize: '0.875rem'
                             }}>
                               {entry.amount_formatted || formatCurrency(entry.total_amount || 0)}
                             </Typography>
                           </TableCell>
                           <TableCell align="right" sx={{ py: 2 }}>
                             <Typography variant="body2" sx={{ 
                               color: '#6c757d',
                               fontSize: '0.875rem'
                             }}>
                               {entry.avg_amount_formatted || formatCurrency(entry.avg_amount || 0)}
                             </Typography>
                           </TableCell>
                                                     <TableCell align="center" sx={{ py: 2 }}>
                             <Chip 
                               label={entry.risk_level?.toUpperCase() || 'N/A'} 
                               size="small"
                               sx={{ 
                                 backgroundColor: getRiskColor(entry.risk_level?.toUpperCase()),
                                 color: 'white',
                                 fontWeight: 600,
                                 fontSize: '0.75rem'
                               }}
                             />
                           </TableCell>
                                                     <TableCell align="center" sx={{ py: 2 }}>
                             <Typography variant="body2" sx={{ 
                               color: '#6c757d',
                               fontSize: '0.875rem',
                               fontWeight: 500
                             }}>
                               {entry.risk_score || 0}
                             </Typography>
                           </TableCell>
                           <TableCell align="center" sx={{ py: 2 }}>
                             <Chip 
                               label={entry.anomaly_count || 0} 
                               size="small"
                               sx={{ 
                                 backgroundColor: entry.anomaly_count > 0 ? '#dc3545' : '#6c757d',
                                 color: 'white',
                                 fontWeight: 600,
                                 fontSize: '0.75rem'
                               }}
                             />
                           </TableCell>
                                                     <TableCell sx={{ py: 2 }}>
                             <Box>
                               <Typography variant="body2" sx={{ 
                                 color: '#6c757d',
                                 fontSize: '0.875rem',
                                 fontWeight: 500
                               }}>
                                 {entry.accounts_count || 0} accounts
                               </Typography>
                               <Typography variant="caption" sx={{ 
                                 color: '#6c757d',
                                 fontSize: '0.75rem'
                               }}>
                                 {entry.accounts?.slice(0, 3).join(', ')}
                                 {entry.accounts?.length > 3 ? '...' : ''}
                               </Typography>
                             </Box>
                           </TableCell>
                                                     <TableCell align="center" sx={{ py: 2 }}>
                             <Chip 
                               label={entry.activity_category?.toUpperCase() || 'N/A'} 
                               size="small"
                               sx={{ 
                                 backgroundColor: entry.activity_category === 'HIGH' ? '#dc3545' : 
                                                  entry.activity_category === 'MEDIUM' ? '#ffc107' : '#28a745',
                                 color: 'white',
                                 fontWeight: 600,
                                 fontSize: '0.75rem'
                               }}
                             />
                           </TableCell>
                           <TableCell align="center" sx={{ py: 2 }}>
                             <Chip 
                               label={entry.user_severity?.toUpperCase() || 'N/A'} 
                               size="small"
                               sx={{ 
                                 backgroundColor: entry.user_severity === 'HIGH' ? '#dc3545' : 
                                                  entry.user_severity === 'MEDIUM' ? '#ffc107' : '#28a745',
                                 color: 'white',
                                 fontWeight: 600,
                                 fontSize: '0.75rem'
                               }}
                             />
                           </TableCell>
                           <TableCell align="center" sx={{ py: 2 }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                               <IconButton
                                 size="small"
                                 onClick={() => handleDrawerOpen(entry)}
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
              </Paper>
              
              {/* Pagination Controls */}
              {pagination.count > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mt: 3,
                  p: 2,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#6c757d' }}>
                      Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.count)} of {pagination.count} entries
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Page Size</InputLabel>
                      <Select
                        value={pagination.pageSize}
                        label="Page Size"
                        onChange={(e) => handlePageSizeChange(e.target.value)}
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value={5}>5 per page</MenuItem>
                        <MenuItem value={10}>10 per page</MenuItem>
                        <MenuItem value={25}>25 per page</MenuItem>
                        <MenuItem value={50}>50 per page</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <Pagination
                    count={Math.ceil(pagination.count / pagination.pageSize)}
                    page={pagination.currentPage}
                    onChange={(event, newPage) => handlePageChange(newPage)}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* No Data State */}
          {!loading && !error && userListing.length === 0 && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                No User Entries Found
              </Typography>
              <Typography variant="body2">
                The API returned no user entries for this analysis. This could mean either no user entries were found, or the data is still being processed.
              </Typography>
            </Alert>
          )}

          {/* API Data Summary */}
          {!loading && !error && userListing.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: '#2c3e50',
                fontSize: '1.1rem'
              }}>
                API Data Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item size={{xs: 6, sm: 3}}>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#925a9b',
                      fontSize: '1.5rem'
                    }}>
                      {pagination.count}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.875rem'
                    }}>
                      Total Users
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, sm: 3}}>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#925a9b',
                      fontSize: '1.5rem'
                    }}>
                                             {formatCurrency(userListing.reduce((sum, entry) => sum + (entry.total_amount || 0), 0))}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.875rem'
                    }}>
                      Total Amount
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, sm: 3}}>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#925a9b',
                      fontSize: '1.5rem'
                    }}>
                                             {new Set(userListing.map(entry => entry.user)).size}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.875rem'
                    }}>
                      Unique Users
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, sm: 3}}>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#925a9b',
                      fontSize: '1.5rem'
                    }}>
                                             {userListing.reduce((sum, entry) => sum + (entry.accounts_count || 0), 0)}
                    </Typography>
                                         <Typography variant="body2" sx={{ 
                       color: '#6c757d',
                       fontSize: '0.875rem'
                     }}>
                       Total Accounts
                     </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* User Analysis PDF */}
      <UserAnalysisPDF
        open={pdfModalOpen}
        setOpen={setPdfModalOpen}
        data={data}
        currency={currency}
      />
    </Box>
  );
} 