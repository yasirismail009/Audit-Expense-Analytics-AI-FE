import React, { useState } from 'react';
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
  Divider,
  LinearProgress,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import { getRiskColor } from '../../utils/colorScheme';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

export default function ClosingAnalysisContent({ data, distributionData, anomalySummary }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  // Extract currency from data or use default
  const currency = data?.currency || data?.file_info?.currency || 'SAR';

  // Color scheme - using purple theme like DuplicateAnalysisContent
  const primaryColor = '#925a9b';
  const textPrimary = '#2c3e50';
  const textSecondary = '#6c757d';

  const handleDrawerOpen = (entry) => {
    setSelectedEntry(entry);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedEntry(null);
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  // Helper function to format currency
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

  // Extract data from the API structure
  const fileInfo = data?.file_info || {};
  const analysisInfo = data?.analysis_info || {};
  const summary = data?.summary || {};
  const detailedResults = data?.closing_entries_analysis || {};
  const visualizations = data?.visualizations || {};
  const exportData = data?.export_data || {};
  const riskAssessment = data?.risk_assessment || {};
  const patterns = data?.patterns || {};
  
  // Map new structure to component expectations
  const summaryStats = {
    closing_entries: summary.closing_entries_count || 0,
    total_transactions: summary.total_transactions || 0,
    total_amount: 0, // Calculate from closing entries
    avg_amount: 0,
    closing_dates: [],
    overall_risk_score: summary.overall_risk_score || 0,
    risk_level: summary.risk_level || 'LOW'
  };
  
  // Extract closing entries from the actual data structure
  const closingEntries = detailedResults.closing_entries || [];
  
  // Calculate total amount from closing entries
  if (closingEntries.length > 0) {
    summaryStats.total_amount = closingEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    summaryStats.avg_amount = summaryStats.total_amount / closingEntries.length;
  }
  
  // Extract unique closing dates
  if (closingEntries.length > 0) {
    summaryStats.closing_dates = [...new Set(closingEntries.map(entry => entry.posting_date))];
  }
  
  // Extract user data from closing entries
  const userNames = [...new Set(closingEntries.map(entry => entry.user_name))];
  
  // Extract account data from closing entries
  const accountNames = [...new Set(closingEntries.map(entry => entry.fs_line))];
  
  // Extract GL account data from closing entries
  const glAccountNames = [...new Set(closingEntries.map(entry => entry.gl_account))];
  
  // Map chart data from visualizations
  const chartData = {
    closing_entries_by_user: {
      labels: userNames,
      data: userNames.map(user => {
        const userEntries = closingEntries.filter(entry => entry.user_name === user);
        return userEntries.length;
      })
    },
    closing_entries_by_account: {
      labels: accountNames,
      data: accountNames.map(account => {
        const accountEntries = closingEntries.filter(entry => entry.fs_line === account);
        return accountEntries.length;
      })
    },
    closing_entries_by_gl_account: {
      labels: glAccountNames,
      data: glAccountNames.map(glAccount => {
        const glAccountEntries = closingEntries.filter(entry => entry.gl_account === glAccount);
        return glAccountEntries.length;
      })
    },
    closing_entries_by_date: {
      labels: summaryStats.closing_dates,
      data: summaryStats.closing_dates.map(date => {
        const dateEntries = closingEntries.filter(entry => entry.posting_date === date);
        return dateEntries.length;
      })
    },
    // Map visualization data from API
    month_end_patterns: visualizations.chart_data?.month_end_patterns || {},
    chart_types: visualizations.chart_types || []
  };
  
  // Extract recommendations from risk assessment
  const recommendations = riskAssessment.risk_assessment_details?.recommendations || [];
  const auditImplications = {
    immediate_actions: recommendations.map(rec => rec.description || rec.action || rec)
  };
  const criticalAlerts = recommendations.filter(rec => rec.severity === 'HIGH') || [];

  // Calculate overall risk score
  const totalEntries = summaryStats.closing_entries || 0;
  const totalTransactions = summaryStats.total_transactions || 0;
  
  // Use the risk score from the API
  const overallRiskScore = summaryStats.overall_risk_score || 0;
  const riskLevel = summaryStats.risk_level || 'LOW';

  // Prepare chart data from the rich API structure
  const userClosingData = detailedResults.user_closing || {};
  const fsLineClosingData = detailedResults.fs_line_closing || {};
  
  // User Analysis Chart Data
  const userChartData = Object.keys(userClosingData).map(userName => {
    const userData = userClosingData[userName];
    return {
      name: userName,
      totalAmount: userData.total_amount || 0,
      entries: userData.entries?.length || 0,
      monthEndCount: userData.month_end_count || 0,
      preCloseCount: userData.pre_close_count || 0
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount);

  // FS Line Chart Data
  const fsLineChartData = Object.keys(fsLineClosingData).map(fsLine => {
    const fsData = fsLineClosingData[fsLine];
    return {
      name: fsLine,
      totalAmount: fsData.total_amount || 0,
      entries: fsData.entries?.length || 0,
      monthEndCount: fsData.month_end_count || 0,
      uniqueUsers: fsData.unique_users?.length || 0
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount);

  // Risk Distribution Chart Data - using purple variants
  const riskDistributionData = [
    { name: 'Low Risk', value: closingEntries.filter(entry => (entry.risk_score || 0) < 40).length, color: '#B894C4' },
    { name: 'Medium Risk', value: closingEntries.filter(entry => (entry.risk_score || 0) >= 40 && (entry.risk_score || 0) < 60).length, color: '#A67BB3' },
    { name: 'High Risk', value: closingEntries.filter(entry => (entry.risk_score || 0) >= 60 && (entry.risk_score || 0) < 80).length, color: '#8E6C95' },
    { name: 'Critical Risk', value: closingEntries.filter(entry => (entry.risk_score || 0) >= 80).length, color: '#7B4A82' }
  ];

  // Closing Window Type Distribution - using purple variants
  const closingWindowData = [
    { name: 'Month End', value: closingEntries.filter(entry => entry.closing_window_type === 'month_end').length, color: '#925a9b' },
    { name: 'Pre Close', value: closingEntries.filter(entry => entry.closing_window_type === 'pre_close').length, color: '#6B3E72' }
  ];

  // Purple color variants for charts
  const purpleVariants = [
    '#925a9b', // Primary purple
    '#7B4A82', // Darker purple
    '#A67BB3', // Lighter purple
    '#8E6C95', // Medium purple
    '#B894C4', // Very light purple
    '#6B3E72', // Very dark purple
    '#C4A5D1', // Pale purple
    '#5A2E61', // Deep purple
    '#D1B8DC', // Lightest purple
    '#4A1F50'  // Darkest purple
  ];

  // Chart colors - using purple variants
  const chartColors = purpleVariants;

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', p: 3 }}>
      {/* Analysis Status */}
      <Alert 
        severity={totalEntries > 0 ? "warning" : "success"} 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={totalEntries > 0 ? <WarningIcon /> : <InfoIcon />}
      >
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {totalEntries > 0 
            ? `Found ${closingEntries.length} closing entries involving ${totalTransactions} transactions`
            : "No closing entries found"
          }
        </Typography>
        {totalEntries > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Total amount involved: {formatCurrency(summaryStats.total_amount || 0)}
          </Typography>
        )}
      </Alert>

      {/* Closing Entries Definitions */}
      <Alert 
        severity="info" 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={<InfoIcon />}
      >
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
          Closing Entries Analysis
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Analysis of transactions posted on month-end closing dates. These entries are critical for financial reporting and require special attention.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item size={{xs: 12, md: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}>
                  Month-End Entries
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Transactions posted on the last day of the month
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}>
                  Quarter-End Entries
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Transactions posted on the last day of the quarter
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}>
                  Year-End Entries
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Transactions posted on the last day of the fiscal year
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2e7d32', mb: 1 }}>
                  Adjusting Entries
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Entries made to adjust account balances
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Alert>

      {/* Open Report Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => setPdfModalOpen(true)}
          sx={{
            backgroundColor: primaryColor,
            color: 'white',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.9rem',
            boxShadow: `0 2px 8px ${primaryColor}40`,
            '&:hover': {
              backgroundColor: '#7a4a82',
              boxShadow: `0 4px 12px ${primaryColor}60`,
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          📄 Open Report
        </Button>
      </Box>

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
            {/* Left Section - File Information */}
            <Grid item size={{xs: 12, md: 6}}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: textPrimary, 
                mb: 1,
                fontSize: '1.75rem'
              }}>
                Closing Entries Analysis
              </Typography>
              <Typography variant="body1" sx={{ color: textSecondary, mb: 0.5 }}>
                Analysis Date: {new Date(analysisInfo.analysis_date || Date.now()).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ color: textSecondary }}>
                Status: {analysisInfo.status || 'COMPLETED'} • Entries: {closingEntries.length}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', width:'fit-content', marginTop: '10px', gap: '10px' }}>
                <Box sx={{ 
                  width: 120,
                  height: 120, 
                  borderRadius: '50%', 
                  background: primaryColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  position: 'relative',
                  boxShadow: `0 4px 16px ${primaryColor}50`
                }}>
                  <Typography variant="h2" sx={{ 
                    fontWeight: 800, 
                    color: 'white',
                    fontSize: '1.6rem'
                  }}>
                    {overallRiskScore.toFixed(0)}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width:'fit-content', marginTop: '10px' }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 1, 
                    color: textPrimary,
                    fontSize: '1rem'
                  }}>
                    Final Result
                  </Typography>
                  <Chip 
                    label={riskLevel} 
                    size="medium"
                    sx={{ 
                      backgroundColor: getRiskColor(riskLevel),
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
              <Grid container spacing={2}>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <EventIcon sx={{ 
                      color: primaryColor, 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: textPrimary,
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {closingEntries.length}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: textSecondary,
                      fontSize: '0.8rem'
                    }}>
                      Closing Entries
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <AccountBalanceIcon sx={{ 
                      color: primaryColor, 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: textPrimary,
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {formatCurrency(summaryStats.total_amount || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: textSecondary,
                      fontSize: '0.8rem'
                    }}>
                      Total Amount
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <PersonIcon sx={{ 
                      color: primaryColor, 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: textPrimary,
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {chartData.closing_entries_by_user?.labels?.length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: textSecondary,
                      fontSize: '0.8rem'
                    }}>
                      Users Involved
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CalendarIcon sx={{ 
                      color: primaryColor, 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: textPrimary,
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {summaryStats.closing_dates?.length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: textSecondary,
                      fontSize: '0.8rem'
                    }}>
                      Closing Dates
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <AssessmentIcon sx={{ 
                      color: primaryColor, 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: textPrimary,
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {formatCurrency(summaryStats.avg_amount || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: textSecondary,
                      fontSize: '0.8rem'
                    }}>
                      Average Amount
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ 
                      color: primaryColor, 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: textPrimary,
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {chartData.closing_entries_by_account?.labels?.length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: textSecondary,
                      fontSize: '0.8rem'
                    }}>
                      GL Accounts
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
        <Box sx={{ mb: 4, p: 3, backgroundColor: '#e8f5e8', borderRadius: 2, border: '1px solid #4caf50' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#2e7d32' }}>
            📊 Closing Entries Distribution Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item size={{xs: 12, md: 3}}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  {distributionData.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Closing Entries Found
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 3}}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                  {distributionData.percentage?.toFixed(1) || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  of Total Anomalies
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 3}}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                  {anomalySummary?.total_anomalies || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Anomalies
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 3}}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#c2185b' }}>
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
        </Box>
      )}

      {/* Summary Metrics */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item size={{xs: 12, md: 3}}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="h6" color="#e65100">
                {summary.closing_entries_count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Closing Entries
              </Typography>
            </Paper>
          </Grid>
          <Grid item size={{xs: 12, md: 3}}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e8' }}>
              <Typography variant="h6" color="#2e7d32">
                {summary.total_transactions || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Transactions
              </Typography>
            </Paper>
          </Grid>
          <Grid item size={{xs: 12, md: 3}}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
              <Typography variant="h6" color="#1565c0">
                {formatCurrency(summaryStats.total_amount || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
            </Paper>
          </Grid>
              <Grid item size={{xs: 12, md: 3}}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fce4ec' }}>
              <Typography variant="h6" color="#c2185b">
                {summaryStats.closing_dates?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Closing Dates
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* User Analysis Chart */}
        {userChartData.length > 0 && (
          <Grid item size={{xs: 12, md: 6}}>
            <Card sx={{ 
              background: 'white', 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e9ecef',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: textPrimary,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <PersonIcon sx={{ color: primaryColor, fontSize: 20 }} />
                  User Analysis by Total Amount
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userChartData}>
                    <defs>
                      <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#925a9b" />
                        <stop offset="50%" stopColor="#8E6C95" />
                        <stop offset="100%" stopColor="#7B4A82" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'totalAmount' ? `${formatCurrency(value)}` : value,
                        name === 'totalAmount' ? 'Total Amount' : name === 'entries' ? 'Entries' : name
                      ]}
                    />
                    <Bar dataKey="totalAmount" fill="url(#userGradient)" name="Total Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* FS Line Analysis Chart */}
        {fsLineChartData.length > 0 && (
          <Grid item size={{xs: 12, md: 6}}>
            <Card sx={{ 
              background: 'white', 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e9ecef',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: textPrimary,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <AccountBalanceIcon sx={{ color: primaryColor, fontSize: 20 }} />
                  FS Line Analysis by Total Amount
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={fsLineChartData}>
                    <defs>
                      <linearGradient id="fsLineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A67BB3" />
                        <stop offset="50%" stopColor="#9B7BA8" />
                        <stop offset="100%" stopColor="#8E6C95" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis 
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'totalAmount' ? `${formatCurrency(value)}` : value,
                        name === 'totalAmount' ? 'Total Amount' : name === 'entries' ? 'Entries' : name
                      ]}
                    />
                    <Bar dataKey="totalAmount" fill="url(#fsLineGradient)" name="Total Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Risk Distribution Pie Chart */}
        {riskDistributionData.some(item => item.value > 0) && (
          <Grid item size={{xs: 12, md: 6}}>
            <Card sx={{ 
              background: 'white', 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e9ecef',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: textPrimary,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <AssessmentIcon sx={{ color: primaryColor, fontSize: 20 }} />
                  Risk Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <defs>
                      <linearGradient id="lowRiskGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#B894C4" />
                        <stop offset="100%" stopColor="#A67BB3" />
                      </linearGradient>
                      <linearGradient id="mediumRiskGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#A67BB3" />
                        <stop offset="100%" stopColor="#8E6C95" />
                      </linearGradient>
                      <linearGradient id="highRiskGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#8E6C95" />
                        <stop offset="100%" stopColor="#7B4A82" />
                      </linearGradient>
                      <linearGradient id="criticalRiskGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#7B4A82" />
                        <stop offset="100%" stopColor="#6B3E72" />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={riskDistributionData.filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistributionData.filter(item => item.value > 0).map((entry, index) => {
                        const gradientId = entry.name === 'Low Risk' ? 'lowRiskGradient' :
                                         entry.name === 'Medium Risk' ? 'mediumRiskGradient' :
                                         entry.name === 'High Risk' ? 'highRiskGradient' : 'criticalRiskGradient';
                        return <Cell key={`cell-${index}`} fill={`url(#${gradientId})`} />;
                      })}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Closing Window Type Distribution */}
        {closingWindowData.some(item => item.value > 0) && (
          <Grid item size={{xs: 12, md: 6}}>
            <Card sx={{ 
              background: 'white', 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e9ecef',
              height: '100%'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: textPrimary,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <EventIcon sx={{ color: primaryColor, fontSize: 20 }} />
                  Closing Window Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <defs>
                      <linearGradient id="monthEndGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#925a9b" />
                        <stop offset="100%" stopColor="#7B4A82" />
                      </linearGradient>
                      <linearGradient id="preCloseGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#6B3E72" />
                        <stop offset="100%" stopColor="#5A2E61" />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={closingWindowData.filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {closingWindowData.filter(item => item.value > 0).map((entry, index) => {
                        const gradientId = entry.name === 'Month End' ? 'monthEndGradient' : 'preCloseGradient';
                        return <Cell key={`cell-${index}`} fill={`url(#${gradientId})`} />;
                      })}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* User Entries vs Amount Comparison */}
        {userChartData.length > 0 && (
          <Grid item size={{xs: 12}}>
            <Card sx={{ 
              background: 'white', 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e9ecef'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: textPrimary,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <TrendingUpIcon sx={{ color: primaryColor, fontSize: 20 }} />
                  User Analysis: Entries vs Amount
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={userChartData}>
                    <defs>
                      <linearGradient id="entriesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#925a9b" />
                        <stop offset="50%" stopColor="#8E6C95" />
                        <stop offset="100%" stopColor="#7B4A82" />
                      </linearGradient>
                      <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A67BB3" />
                        <stop offset="50%" stopColor="#9B7BA8" />
                        <stop offset="100%" stopColor="#8E6C95" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis yAxisId="left" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" fontSize={12} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'totalAmount' ? `${formatCurrency(value)}` : value,
                        name === 'totalAmount' ? 'Total Amount' : name === 'entries' ? 'Entries' : name
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="entries" fill="url(#entriesGradient)" name="Entries" />
                    <Bar yAxisId="right" dataKey="totalAmount" fill="url(#amountGradient)" name="Total Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* All Content in One View */}
      <Grid container spacing={3} sx={{ mt: 3 }}>

        {/* Section 1: Detailed Tables */}
        <Grid item size={{xs: 12, md: 12}}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              mb: 3, 
              color: textPrimary,
              fontSize: '1.25rem'
            }}>
              Detailed Analysis Tables
            </Typography>

            {/* Closing Entries Table */}
            {closingEntries && closingEntries.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: textPrimary,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <EventIcon sx={{ color: primaryColor, fontSize: 20 }} />
                  Detailed Closing Entries Analysis
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
                              color: textPrimary,
                              fontSize: '0.875rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }
                          }}>
                            <TableCell>Transaction ID</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Posting Date</TableCell>
                            <TableCell>GL Account</TableCell>
                            <TableCell>FS Line</TableCell>
                            <TableCell>Transaction Type</TableCell>
                            <TableCell>Closing Window</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="center">Risk Score</TableCell>
                          </TableRow>
                        </TableHead>
                      <TableBody>
                        {closingEntries.map((entry, index) => (
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
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: textPrimary,
                                fontSize: '0.875rem'
                              }}>
                                {entry.transaction_id}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  backgroundColor: primaryColor,
                                  fontSize: '0.875rem',
                                  fontWeight: 600
                                }}>
                                  {entry.user_name?.charAt(0) || 'U'}
                                </Avatar>
                                <Typography variant="body2" sx={{ 
                                  color: textSecondary,
                                  fontSize: '0.875rem',
                                  fontWeight: 500
                                }}>
                                  {entry.user_name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                color: textSecondary,
                                fontSize: '0.875rem'
                              }}>
                                {new Date(entry.posting_date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip 
                                label={entry.gl_account}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  borderColor: primaryColor,
                                  color: primaryColor,
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip 
                                label={entry.fs_line}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  borderColor: '#1565c0',
                                  color: '#1565c0',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip 
                                label={entry.transaction_type}
                                size="small"
                                sx={{ 
                                  backgroundColor: entry.transaction_type === 'DEBIT' ? '#dc3545' : '#28a745',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip 
                                label={entry.closing_window_type.replace('_', ' ').charAt(0).toUpperCase() + entry.closing_window_type.replace('_', ' ').slice(1)}
                                size="small"
                                sx={{ 
                                  backgroundColor: entry.closing_window_type === 'month_end' ? '#ff9800' : '#9c27b0',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 700, 
                                color: primaryColor,
                                fontSize: '0.875rem'
                              }}>
                                {formatCurrency(entry.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Chip 
                                label={entry.risk_score || 'N/A'} 
                                size="small"
                                sx={{ 
                                  backgroundColor: getRiskColor(getRiskLevel(entry.risk_score || 0)),
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                                                        </TableRow>
                          ))}
                        </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
            )}

            {/* User Breakdown Table */}
            {chartData.closing_entries_by_user && chartData.closing_entries_by_user.labels.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: textPrimary,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <PersonIcon sx={{ color: primaryColor, fontSize: 20 }} />
                  User Breakdown Analysis
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
                          <TableCell>User Name</TableCell>
                          <TableCell align="right">Closing Entries</TableCell>
                          <TableCell align="right">Total Amount</TableCell>
                          <TableCell align="right">Average Amount</TableCell>
                          <TableCell align="center">Risk Level</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {chartData.closing_entries_by_user.labels.map((userName, index) => {
                          const userEntries = closingEntries.filter(entry => entry.user_name === userName);
                          const totalAmount = userEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
                          const avgAmount = userEntries.length > 0 ? totalAmount / userEntries.length : 0;
                          const avgRiskScore = userEntries.length > 0 ? 
                            userEntries.reduce((sum, entry) => sum + (entry.risk_score || 0), 0) / userEntries.length : 0;
                          
                          return (
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
                              backgroundColor: primaryColor,
                              fontSize: '0.875rem',
                              fontWeight: 600
                            }}>
                              {userName?.charAt(0) || 'U'}
                            </Avatar>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: textPrimary,
                              fontSize: '0.875rem'
                            }}>
                              {userName}
                            </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: primaryColor,
                                fontSize: '0.875rem'
                              }}>
                                {userEntries.length}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: '#4caf50',
                                fontSize: '0.875rem'
                              }}>
                                {formatCurrency(totalAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                color: '#6c757d',
                                fontSize: '0.875rem'
                              }}>
                                {formatCurrency(avgAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Chip 
                                label={getRiskLevel(avgRiskScore)}
                                size="small"
                                sx={{ 
                                  backgroundColor: getRiskColor(getRiskLevel(avgRiskScore)),
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )})}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
            )}

            {/* GL Account Breakdown Table */}
            {chartData.closing_entries_by_gl_account && chartData.closing_entries_by_gl_account.labels.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: '#2c3e50',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <AccountBalanceIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                  GL Account Breakdown
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
                          <TableCell>GL Account</TableCell>
                          <TableCell align="right">Closing Entries</TableCell>
                          <TableCell align="right">Total Amount</TableCell>
                          <TableCell align="right">Average Amount</TableCell>
                          <TableCell align="center">Risk Level</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {chartData.closing_entries_by_gl_account.labels.map((glAccount, index) => {
                          const glAccountEntries = closingEntries.filter(entry => entry.gl_account === glAccount);
                          const totalAmount = glAccountEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
                          const avgAmount = glAccountEntries.length > 0 ? totalAmount / glAccountEntries.length : 0;
                          const avgRiskScore = glAccountEntries.length > 0 ? 
                            glAccountEntries.reduce((sum, entry) => sum + (entry.risk_score || 0), 0) / glAccountEntries.length : 0;
                          
                          return (
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
                              <Chip 
                                label={glAccount}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  borderColor: primaryColor,
                                  color: primaryColor,
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                                                          <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: primaryColor,
                              fontSize: '0.875rem'
                            }}>
                              {glAccountEntries.length}
                            </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: '#4caf50',
                                fontSize: '0.875rem'
                              }}>
                                {formatCurrency(totalAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                color: '#6c757d',
                                fontSize: '0.875rem'
                              }}>
                                {formatCurrency(avgAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Chip 
                                label={getRiskLevel(avgRiskScore)}
                                size="small"
                                sx={{ 
                                  backgroundColor: getRiskColor(getRiskLevel(avgRiskScore)),
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )})}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
            )}

            {/* Account Breakdown Table */}
            {chartData.closing_entries_by_account && chartData.closing_entries_by_account.labels.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: textPrimary,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <AccountBalanceIcon sx={{ color: primaryColor, fontSize: 20 }} />
                  FS Line Breakdown
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
                          <TableCell>GL Account</TableCell>
                          <TableCell align="right">Closing Entries</TableCell>
                          <TableCell align="right">Total Amount</TableCell>
                          <TableCell align="right">Average Amount</TableCell>
                          <TableCell align="center">Risk Level</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {chartData.closing_entries_by_account.labels.map((account, index) => {
                          const accountEntries = closingEntries.filter(entry => entry.fs_line === account);
                          const totalAmount = accountEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
                          const avgAmount = accountEntries.length > 0 ? totalAmount / accountEntries.length : 0;
                          const avgRiskScore = accountEntries.length > 0 ? 
                            accountEntries.reduce((sum, entry) => sum + (entry.risk_score || 0), 0) / accountEntries.length : 0;
                          
                          return (
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
                              <Chip 
                                label={account}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  borderColor: primaryColor,
                                  color: primaryColor,
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: primaryColor,
                                fontSize: '0.875rem'
                              }}>
                                {accountEntries.length}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: '#4caf50',
                                fontSize: '0.875rem'
                              }}>
                                {formatCurrency(totalAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                color: '#6c757d',
                                fontSize: '0.875rem'
                              }}>
                                {formatCurrency(avgAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Chip 
                                label={getRiskLevel(avgRiskScore)}
                                size="small"
                                sx={{ 
                                  backgroundColor: getRiskColor(getRiskLevel(avgRiskScore)),
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )})}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Section 2: Detailed Insights */}
        {(recommendations.length > 0 || (auditImplications.immediate_actions && auditImplications.immediate_actions.length > 0)) && (
          <Grid item size={{xs: 12}}>
            <Card sx={{ 
              background: 'white', 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e9ecef'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: textPrimary,
                  fontSize: '1.25rem'
                }}>
                  Detailed Insights & Recommendations
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <Grid item size={{xs: 12, md: 6}}>
                      <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: textPrimary,
                          fontSize: '1.1rem'
                        }}>
                          Recommendations
                        </Typography>
                        <List dense>
                          {recommendations.map((recommendation, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <InfoIcon sx={{ color: primaryColor, fontSize: 16 }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={recommendation.action}
                                secondary={recommendation.recommendation || recommendation.description}
                                sx={{ 
                                  '& .MuiListItemText-primary': {
                                    fontSize: '0.875rem',
                                    color: textPrimary,
                                    fontWeight: 600
                                  },
                                  '& .MuiListItemText-secondary': {
                                    fontSize: '0.75rem',
                                    color: textSecondary
                                  }
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Grid>
                  )}

                  {/* Audit Implications */}
                  {auditImplications.immediate_actions && (
                    <Grid item size={{xs: 12, md: 6}}>
                      <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: textPrimary,
                          fontSize: '1.1rem'
                        }}>
                          Audit Implications
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            color: primaryColor,
                            mb: 1
                          }}>
                            Immediate Actions:
                          </Typography>
                          <List dense>
                            {auditImplications.immediate_actions.map((action, index) => (
                              <ListItem key={index} sx={{ py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                  <WarningIcon sx={{ color: primaryColor, fontSize: 16 }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={action}
                                  sx={{ 
                                    '& .MuiListItemText-primary': {
                                      fontSize: '0.875rem',
                                      color: textSecondary
                                    }
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {/* Critical Alerts */}
                  {criticalAlerts.length > 0 && (
                    <Grid item size={{xs: 12}}>
                      <Box sx={{ p: 2, background: '#fff3cd', borderRadius: 2, border: '1px solid #ffeaa7' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: '#856404',
                          fontSize: '1.1rem'
                        }}>
                          Critical Alerts
                        </Typography>
                        <List dense>
                          {criticalAlerts.map((alert, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <ErrorIcon sx={{ color: '#dc3545', fontSize: 16 }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={alert.description}
                                secondary={`Severity: ${alert.severity} • Count: ${alert.count} • Amount: ${formatCurrency(alert.total_amount)}`}
                                sx={{ 
                                  '& .MuiListItemText-primary': {
                                    fontSize: '0.875rem',
                                    color: '#856404',
                                    fontWeight: 600
                                  },
                                  '& .MuiListItemText-secondary': {
                                    fontSize: '0.75rem',
                                    color: '#856404'
                                  }
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Section 3: Visualization Data */}
        {chartData.month_end_patterns && Object.keys(chartData.month_end_patterns).length > 0 && (
          <Grid item size={{xs: 12}}>
            <Card sx={{ 
              background: 'white', 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e9ecef'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: textPrimary,
                  fontSize: '1.25rem'
                }}>
                  Chart Visualization Data
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Month End Patterns */}
                  <Grid item size={{xs: 12, md: 6}}>
                    <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                                              <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: textPrimary,
                          fontSize: '1.1rem'
                        }}>
                          Month End Patterns
                        </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#6c757d', mb: 1 }}>
                          <strong>Labels:</strong> {chartData.month_end_patterns.labels?.join(', ') || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6c757d', mb: 1 }}>
                          <strong>Closing Entries:</strong> {chartData.month_end_patterns.closing_entries?.join(', ') || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6c757d', mb: 1 }}>
                          <strong>Post Close Entries:</strong> {chartData.month_end_patterns.post_close_entries?.join(', ') || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6c757d' }}>
                          <strong>Total Transactions:</strong> {chartData.month_end_patterns.total_transactions?.join(', ') || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Chart Types */}
                  <Grid item size={{xs: 12, md: 6}}>
                    <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        mb: 2, 
                        color: textPrimary,
                        fontSize: '1.1rem'
                      }}>
                        Available Chart Types
                      </Typography>
                      <List dense>
                        {chartData.chart_types.map((chartType, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <TrendingUpIcon sx={{ color: primaryColor, fontSize: 16 }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={chartType}
                              sx={{ 
                                '& .MuiListItemText-primary': {
                                  fontSize: '0.875rem',
                                  color: textPrimary,
                                  fontWeight: 600
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Raw Data Display */}
      <Paper sx={{ p: 2, bgcolor: '#f8f9fa', mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Raw Analysis Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          {JSON.stringify(data, null, 2)}
        </Typography>
      </Paper>
    </Box>
  );
} 