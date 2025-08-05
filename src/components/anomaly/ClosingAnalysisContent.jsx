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
  Divider,
  LinearProgress,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel
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

export default function ClosingAnalysisContent({ data, distributionData, anomalySummary, sheetId }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [listingData, setListingData] = useState(null);
  const [listingLoading, setListingLoading] = useState(false);
  const [listingError, setListingError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [paginationLoading, setPaginationLoading] = useState(false);

  // Extract currency from data or use default
  const currency = data?.currency || data?.file_info?.currency || 'SAR';

  // Color scheme - using purple theme only
  const primaryColor = '#925a9b';
  const textPrimary = '#2c3e50';
  const textSecondary = '#6c757d';
  
  // Purple color variants for consistent theming
  const purpleVariants = {
    primary: '#925a9b',
    dark: '#7B4A82',
    darker: '#6B3E72',
    darkest: '#5A2E61',
    light: '#A67BB3',
    lighter: '#B894C4',
    lightest: '#C4A5D1',
    pale: '#D1B8DC',
    deep: '#4A1F50',
    success: '#8E6C95',
    warning: '#A67BB3',
    error: '#7B4A82',
    info: '#B894C4'
  };

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

  // Helper function to calculate average risk score from risk levels
  const calculateAverageRiskScore = (riskLevels, totalEntries) => {
    if (!riskLevels || Object.keys(riskLevels).length === 0 || totalEntries === 0) {
      return 0;
    }
    
    const riskScores = {
      'LOW': 20,
      'MEDIUM': 50,
      'HIGH': 70,
      'CRITICAL': 90
    };
    
    return Object.entries(riskLevels).reduce((sum, [level, count]) => {
      return sum + (riskScores[level] || 0) * count;
    }, 0) / totalEntries;
  };

  // Helper function to safely get data with fallbacks
  const getSafeData = (data, path, defaultValue = 0) => {
    try {
      return path.split('.').reduce((obj, key) => obj?.[key], data) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Function to call the listing API with pagination
  const fetchListingData = async (fileId, page = 1, size = 10) => {
    if (!fileId) {
      console.log('No file_id available for listing API call');
      return;
    }

    setListingLoading(true);
    setListingError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/closing-entries-list/${fileId}/?page=${page}&page_size=${size}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const listingResponse = await response.json();
      console.log('Listing API Response:', listingResponse);
      setListingData(listingResponse);
    } catch (error) {
      console.error('Error fetching listing data:', error);
      setListingError(error.message);
    } finally {
      setListingLoading(false);
    }
  };

  // Pagination handlers
  const handlePageChange = async (newPage) => {
    setPaginationLoading(true);
    setCurrentPage(newPage);
    await fetchListingData(sheetId, newPage, pageSize);
    setPaginationLoading(false);
  };

  const handlePageSizeChange = async (newPageSize) => {
    setPaginationLoading(true);
    setPageSize(newPageSize);
    setCurrentPage(1);
    await fetchListingData(sheetId, 1, newPageSize);
    setPaginationLoading(false);
  };

  // Call the listing API when component mounts or file_id changes
  useEffect(() => {
    const fileId = sheetId;
    if (fileId) {
      fetchListingData(fileId, currentPage, pageSize);
    }
  }, [sheetId, currentPage, pageSize]);

  // Extract data from the API structure
  const fileInfo = data?.file_info || {};
  const analysisInfo = data?.analysis_info || {};
  const summary = data?.summary || {};
  const detailedAnalysis = data?.detailed_analysis || {};
  const visualizations = data?.visualizations || {};
  const exportData = data?.export_data || {};
  const riskAssessment = data?.risk_assessment || {};
  const patterns = data?.patterns || {};
  
  // Map new structure to component expectations
  const summaryStats = {
    closing_entries: summary.closing_entries_count || 0,
    total_transactions: summary.total_transactions || 0,
    total_amount: detailedAnalysis.amount_analysis?.total_amount || 0,
    avg_amount: detailedAnalysis.amount_analysis?.average_amount || 0,
    closing_dates: Object.keys(detailedAnalysis.temporal_analysis || {}),
    overall_risk_score: summary.overall_risk_score || 0,
    risk_level: summary.risk_level || 'LOW'
  };
  
  // Extract user analysis from detailed_analysis
  const userAnalysis = detailedAnalysis.user_analysis || {};
  const accountAnalysis = detailedAnalysis.account_analysis || {};
  const temporalAnalysis = detailedAnalysis.temporal_analysis || {};
  const riskDistribution = detailedAnalysis.risk_distribution || {};
  
  // Extract user names from user analysis
  const userNames = Object.keys(userAnalysis);
  
  // Extract account names from account analysis
  const accountNames = Object.keys(accountAnalysis);
  
  // Extract GL account names from account analysis
  const glAccountNames = Object.keys(accountAnalysis);
  
  // Map chart data from visualizations and detailed analysis
  const chartData = {
    closing_entries_by_user: {
      labels: userNames,
      data: userNames.map(user => userAnalysis[user]?.total_entries || 0)
    },
    closing_entries_by_account: {
      labels: accountNames,
      data: accountNames.map(account => accountAnalysis[account]?.total_entries || 0)
    },
    closing_entries_by_gl_account: {
      labels: glAccountNames,
      data: glAccountNames.map(glAccount => accountAnalysis[glAccount]?.total_entries || 0)
    },
    closing_entries_by_date: {
      labels: Object.keys(temporalAnalysis),
      data: Object.keys(temporalAnalysis).map(date => temporalAnalysis[date]?.total_entries || 0)
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
  const userClosingData = detailedAnalysis.user_analysis || {};
  const fsLineClosingData = detailedAnalysis.account_analysis || {};
  
  // User Analysis Chart Data
  const userChartData = Object.keys(userClosingData).map(userName => {
    const userData = userClosingData[userName];
    return {
      name: userName,
      totalAmount: userData.total_amount || 0,
      entries: userData.total_entries || 0,
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
      entries: fsData.total_entries || 0,
      monthEndCount: fsData.month_end_count || 0,
      uniqueUsers: fsData.users?.length || 0
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount);

  // Risk Distribution Chart Data - using purple variants
  const riskDistributionData = [
    { name: 'Low Risk', value: riskDistribution.LOW || 0, color: '#B894C4' },
    { name: 'Medium Risk', value: riskDistribution.MEDIUM || 0, color: '#A67BB3' },
    { name: 'High Risk', value: riskDistribution.HIGH || 0, color: '#8E6C95' },
    { name: 'Critical Risk', value: riskDistribution.CRITICAL || 0, color: '#7B4A82' }
  ];

  // Closing Window Type Distribution - using purple variants
  const closingWindowData = [
    { name: 'Month End', value: Object.values(temporalAnalysis).filter(entry => entry.days_from_month_end === 0).reduce((sum, entry) => sum + entry.total_entries, 0), color: '#925a9b' },
    { name: 'Pre Close', value: Object.values(temporalAnalysis).filter(entry => entry.days_from_month_end > 0).reduce((sum, entry) => sum + entry.total_entries, 0), color: '#6B3E72' }
  ];

  // Chart colors - using purple variants
  const chartColors = [
    purpleVariants.primary,
    purpleVariants.dark,
    purpleVariants.light,
    purpleVariants.success,
    purpleVariants.lighter,
    purpleVariants.darker,
    purpleVariants.lightest,
    purpleVariants.deepest,
    purpleVariants.pale,
    purpleVariants.deep
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', p: 3 }}>
      {/* Analysis Status */}
      <Alert 
        severity={totalEntries > 0 ? "warning" : "info"} 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: totalEntries > 0 ? `${purpleVariants.warning}20` : `${purpleVariants.info}20`,
          borderColor: totalEntries > 0 ? purpleVariants.warning : purpleVariants.info,
          color: totalEntries > 0 ? purpleVariants.darker : purpleVariants.dark
        }}
        icon={totalEntries > 0 ? <WarningIcon /> : <InfoIcon />}
      >
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {totalEntries > 0 
            ? `Found ${summaryStats.closing_entries} closing entries involving ${totalTransactions} transactions`
            : "No closing entries found"
          }
        </Typography>
        {totalEntries > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Total amount involved: {formatCurrency(summaryStats.total_amount || 0)}
          </Typography>
        )}
      </Alert>

      {/* Listing API Status */}
      <Alert 
        severity={listingError ? "error" : listingLoading ? "info" : listingData ? "success" : "info"} 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: listingError ? `${purpleVariants.error}20` : listingLoading ? `${purpleVariants.info}20` : listingData ? `${purpleVariants.success}20` : `${purpleVariants.info}20`,
          borderColor: listingError ? purpleVariants.error : listingLoading ? purpleVariants.info : listingData ? purpleVariants.success : purpleVariants.info,
          color: listingError ? purpleVariants.darker : listingLoading ? purpleVariants.dark : listingData ? purpleVariants.dark : purpleVariants.dark
        }}
        icon={listingError ? <ErrorIcon /> : listingLoading ? <InfoIcon /> : listingData ? <InfoIcon /> : <InfoIcon />}
      >
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {listingError 
            ? `Listing API Error: ${listingError}`
            : listingLoading 
            ? "Fetching detailed closing entries list..."
            : listingData 
            ? `Listing API Response Received - ${listingData.count || 0} total entries (Page ${currentPage} of ${Math.ceil((listingData.count || 0) / pageSize)})`
            : "Listing API not called yet"
          }
        </Typography>
        {listingData && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Showing {listingData.results?.length || 0} entries on current page. File ID: {data?.file_info?.file_id || 'N/A'}
          </Typography>
        )}
        {listingLoading && (
          <LinearProgress sx={{ mt: 1, backgroundColor: `${purpleVariants.info}40`, '& .MuiLinearProgress-bar': { backgroundColor: purpleVariants.info } }} />
        )}
      </Alert>

      {/* Closing Entries Definitions */}
      <Alert 
        severity="info" 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: `${purpleVariants.info}20`,
          borderColor: purpleVariants.info,
          color: purpleVariants.dark
        }}
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
              <Box sx={{ p: 2, backgroundColor: `${purpleVariants.info}20`, borderRadius: 2, border: `1px solid ${purpleVariants.info}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: purpleVariants.dark, mb: 1 }}>
                  Month-End Entries
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: textSecondary }}>
                  Transactions posted on the last day of the month
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 6}}>
              <Box sx={{ p: 2, backgroundColor: `${purpleVariants.info}20`, borderRadius: 2, border: `1px solid ${purpleVariants.info}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: purpleVariants.dark, mb: 1 }}>
                  Quarter-End Entries
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: textSecondary }}>
                  Transactions posted on the last day of the quarter
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 6}}>
              <Box sx={{ p: 2, backgroundColor: `${purpleVariants.info}20`, borderRadius: 2, border: `1px solid ${purpleVariants.info}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: purpleVariants.dark, mb: 1 }}>
                  Year-End Entries
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: textSecondary }}>
                  Transactions posted on the last day of the fiscal year
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 6}}>
              <Box sx={{ p: 2, backgroundColor: `${purpleVariants.info}20`, borderRadius: 2, border: `1px solid ${purpleVariants.info}` }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: purpleVariants.dark, mb: 1 }}>
                  Adjusting Entries
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: textSecondary }}>
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
                Status: {analysisInfo.status || 'COMPLETED'} • Entries: {summaryStats.closing_entries}
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
                      {summaryStats.closing_entries}
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
        <Box sx={{ mb: 4, p: 3, backgroundColor: `${purpleVariants.info}20`, borderRadius: 2, border: `1px solid ${purpleVariants.info}` }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: purpleVariants.dark }}>
            📊 Closing Entries Distribution Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item size={{xs: 12, md: 3}}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: purpleVariants.dark }}>
                  {distributionData.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Closing Entries Found
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 3}}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: purpleVariants.primary }}>
                  {distributionData.percentage?.toFixed(1) || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  of Total Anomalies
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 3}}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: purpleVariants.success }}>
                  {anomalySummary?.total_anomalies || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Anomalies
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 3}}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: purpleVariants.warning }}>
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
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${purpleVariants.lightest}20` }}>
              <Typography variant="h6" sx={{ color: purpleVariants.dark }}>
                {summary.closing_entries_count || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Closing Entries
              </Typography>
            </Paper>
          </Grid>
          <Grid item size={{xs: 12, md: 3}}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${purpleVariants.info}20` }}>
              <Typography variant="h6" sx={{ color: purpleVariants.dark }}>
                {summary.total_transactions || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Transactions
              </Typography>
            </Paper>
          </Grid>
          <Grid item size={{xs: 12, md: 3}}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${purpleVariants.lighter}20` }}>
              <Typography variant="h6" sx={{ color: purpleVariants.primary }}>
                {formatCurrency(summaryStats.total_amount || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
            </Paper>
          </Grid>
              <Grid item size={{xs: 12, md: 3}}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${purpleVariants.pale}20` }}>
              <Typography variant="h6" sx={{ color: purpleVariants.warning }}>
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
                            color: textPrimary,
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
                          const userData = userAnalysis[userName] || {};
                          const totalAmount = userData.total_amount || 0;
                          const totalEntries = userData.total_entries || 0;
                          const avgAmount = totalEntries > 0 ? totalAmount / totalEntries : 0;
                          const riskLevels = userData.risk_levels || {};
                          const avgRiskScore = calculateAverageRiskScore(riskLevels, totalEntries);
                          
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
                                {totalEntries}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: purpleVariants.success,
                                fontSize: '0.875rem'
                              }}>
                                {formatCurrency(totalAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                color: textSecondary,
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
                  color: textPrimary,
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <AccountBalanceIcon sx={{ color: purpleVariants.success, fontSize: 20 }} />
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
                          const accountData = accountAnalysis[glAccount] || {};
                          const totalAmount = accountData.total_amount || 0;
                          const totalEntries = accountData.total_entries || 0;
                          const avgAmount = totalEntries > 0 ? totalAmount / totalEntries : 0;
                          const riskLevels = accountData.risk_levels || {};
                          const avgRiskScore = calculateAverageRiskScore(riskLevels, totalEntries);
                          
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
                                {totalEntries}
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
                            color: textPrimary,
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
                          const accountData = accountAnalysis[account] || {};
                          const totalAmount = accountData.total_amount || 0;
                          const totalEntries = accountData.total_entries || 0;
                          const avgAmount = totalEntries > 0 ? totalAmount / totalEntries : 0;
                          const riskLevels = accountData.risk_levels || {};
                          const avgRiskScore = calculateAverageRiskScore(riskLevels, totalEntries);
                          
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
                                {totalEntries}
                            </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: purpleVariants.success,
                                fontSize: '0.875rem'
                              }}>
                                {formatCurrency(totalAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                color: textSecondary,
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
                                primary={recommendation}
                                secondary={recommendation || recommendation.description}
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
                      <Box sx={{ p: 2, background: `${purpleVariants.warning}20`, borderRadius: 2, border: `1px solid ${purpleVariants.warning}` }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: purpleVariants.darker,
                          fontSize: '1.1rem'
                        }}>
                          Critical Alerts
                        </Typography>
                        <List dense>
                          {criticalAlerts.map((alert, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <ErrorIcon sx={{ color: purpleVariants.error, fontSize: 16 }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={alert.description}
                                secondary={`Severity: ${alert.severity} • Count: ${alert.count} • Amount: ${formatCurrency(alert.total_amount)}`}
                                sx={{ 
                                  '& .MuiListItemText-primary': {
                                    fontSize: '0.875rem',
                                    color: purpleVariants.darker,
                                    fontWeight: 600
                                  },
                                  '& .MuiListItemText-secondary': {
                                    fontSize: '0.75rem',
                                    color: purpleVariants.darker
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

        {/* Section 3: Temporal Analysis */}
        {Object.keys(temporalAnalysis).length > 0 && (
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
                  Temporal Analysis - Closing Entries by Date
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
                          <TableCell>Date</TableCell>
                          <TableCell align="right">Closing Entries</TableCell>
                          <TableCell align="right">Total Amount</TableCell>
                          <TableCell align="right">Days from Month End</TableCell>
                          <TableCell align="center">Risk Level</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(temporalAnalysis)
                          .sort(([a], [b]) => new Date(b) - new Date(a))
                          .map(([date, data], index) => {
                          const riskLevels = data.risk_levels || {};
                          const avgRiskScore = calculateAverageRiskScore(riskLevels, data.total_entries || 0);
                          
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
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: textPrimary,
                                fontSize: '0.875rem'
                              }}>
                                {new Date(date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: primaryColor,
                                fontSize: '0.875rem'
                              }}>
                                {data.total_entries || 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: purpleVariants.success,
                                fontSize: '0.875rem'
                              }}>
                                {formatCurrency(data.total_amount || 0)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                color: textSecondary,
                                fontSize: '0.875rem'
                              }}>
                                {data.days_from_month_end || 0}
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
              </CardContent>
            </Card>
      </Grid>
        )}

        {/* Section 4: Detailed Closing Entries List with Pagination */}
        {listingData && listingData.results && (
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
                  Detailed Closing Entries List
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
                          <TableCell>Posting Date</TableCell>
                          <TableCell>Document Number</TableCell>
                          <TableCell>Account</TableCell>
                          <TableCell>User</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="center">Risk Level</TableCell>
                          <TableCell align="center">Days from Month End</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      {paginationLoading && (
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={8} sx={{ py: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <LinearProgress sx={{ 
                                  width: '100%', 
                                  backgroundColor: `${purpleVariants.info}40`, 
                                  '& .MuiLinearProgress-bar': { backgroundColor: purpleVariants.info } 
                                }} />
                              </Box>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      )}
                      <TableBody>
                        {listingData.results.map((entry, index) => (
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
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 600, 
                                  color: textPrimary,
                                  fontSize: '0.875rem'
                                }}>
                                  {new Date(entry.posting_date).toLocaleDateString()}
                                </Typography>
                                {entry.month_end_indicator && (
                                  <Chip 
                                    label="MONTH END"
                                    size="small"
                                    sx={{ 
                                      backgroundColor: '#4caf50',
                                      color: 'white',
                                      fontWeight: 600,
                                      fontSize: '0.6rem',
                                      height: '16px',
                                      width: 'fit-content'
                                    }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                color: textPrimary,
                                fontSize: '0.875rem'
                              }}>
                                {entry.document_number || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                color: textPrimary,
                                fontSize: '0.875rem'
                              }}>
                                {entry.account || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                color: textPrimary,
                                fontSize: '0.875rem'
                              }}>
                                {entry.user || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 600, 
                                  color: purpleVariants.success,
                                  fontSize: '0.875rem'
                                }}>
                                  {entry.amount_formatted || formatCurrency(entry.amount || 0)}
                                </Typography>
                                {entry.is_high_value && (
                                  <Chip 
                                    label="HIGH VALUE"
                                    size="small"
                                    sx={{ 
                                      backgroundColor: '#ff6b6b',
                                      color: 'white',
                                      fontWeight: 600,
                                      fontSize: '0.6rem',
                                      height: '16px'
                                    }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                <Chip 
                                  label={entry.risk_level || 'LOW'}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: entry.risk_color || getRiskColor(entry.risk_level || 'LOW'),
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                  }}
                                />
                                {entry.amount_category && (
                                  <Chip 
                                    label={entry.amount_category}
                                    size="small"
                                    sx={{ 
                                      backgroundColor: entry.amount_category === 'HIGH' ? '#ff9800' : 
                                                     entry.amount_category === 'MEDIUM' ? '#2196f3' : '#4caf50',
                                      color: 'white',
                                      fontWeight: 600,
                                      fontSize: '0.6rem',
                                      height: '16px'
                                    }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                color: textSecondary,
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}>
                                {entry.days_from_month_end || 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleDrawerOpen(entry)}
                                sx={{ 
                                  color: primaryColor,
                                  '&:hover': {
                                    backgroundColor: `${primaryColor}20`
                                  }
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
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
                    p: 2,
                    borderTop: '1px solid #e9ecef',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ color: textSecondary }}>
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, listingData.count || 0)} of {listingData.count || 0} entries
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Page Size</InputLabel>
                        <Select
                          value={pageSize}
                          label="Page Size"
                          disabled={paginationLoading}
                          onChange={(e) => handlePageSizeChange(e.target.value)}
                          sx={{ 
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: primaryColor
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: purpleVariants.dark
                            }
                          }}
                        >
                          <MenuItem value={5}>5 per page</MenuItem>
                          <MenuItem value={10}>10 per page</MenuItem>
                          <MenuItem value={25}>25 per page</MenuItem>
                          <MenuItem value={50}>50 per page</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={!listingData.previous || paginationLoading}
                          onClick={() => handlePageChange(currentPage - 1)}
                          sx={{
                            borderColor: primaryColor,
                            color: primaryColor,
                            '&:hover': {
                              borderColor: purpleVariants.dark,
                              backgroundColor: `${primaryColor}10`
                            },
                            '&:disabled': {
                              borderColor: '#ccc',
                              color: '#ccc'
                            }
                          }}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={!listingData.next || paginationLoading}
                          onClick={() => handlePageChange(currentPage + 1)}
                          sx={{
                            borderColor: primaryColor,
                            color: primaryColor,
                            '&:hover': {
                              borderColor: purpleVariants.dark,
                              backgroundColor: `${primaryColor}10`
                            },
                            '&:disabled': {
                              borderColor: '#ccc',
                              color: '#ccc'
                            }
                          }}
                        >
                          Next
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Section 5: API Information */}
        <Grid item size={{xs: 12}}>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              backgroundColor: `${purpleVariants.info}20`,
              borderColor: purpleVariants.info,
              color: purpleVariants.dark
            }}
            icon={<InfoIcon />}
          >
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              API Endpoints
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • Analysis Data: <code>api/closing-entries-analysis/&lt;uuid:file_id&gt;/</code>
            </Typography>
            <Typography variant="body2">
              • Detailed List: <code>api/closing-entries-list/&lt;uuid:file_id&gt;/</code>
            </Typography>
          </Alert>
        </Grid>
      </Grid>

    </Box>
  );
} 