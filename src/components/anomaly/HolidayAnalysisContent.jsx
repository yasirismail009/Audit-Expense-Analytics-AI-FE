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
  Button,
  Paper,
  Avatar,
  Divider,
  LinearProgress,
  IconButton,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { getRiskColor, formatCurrency } from '../../utils/colorScheme';
import UnifiedAnomalyDrawer from '../FlaggedExpenseDrawer';

// Import chart components
import DuplicateTypeChart from '../charts/DuplicateTypeChart';
import DuplicateRiskChart from '../charts/DuplicateRiskChart';
import DuplicateUserChart from '../charts/DuplicateUserChart';
import DuplicateAmountChart from '../charts/DuplicateAmountChart';
import MonthlyTrendChart from '../charts/MonthlyTrendChart';
import RiskDistributionChart from '../charts/RiskDistributionChart';
import HolidayUserChart from '../charts/HolidayUserChart';
import HolidayBreakdownChart from '../charts/HolidayBreakdownChart';
import HolidayAmountChart from '../charts/HolidayAmountChart';
import HolidayAccountChart from '../charts/HolidayAccountChart';
import HolidayDistributionLineChart from '../charts/HolidayDistributionLineChart';

export default function HolidayAnalysisContent({ data, distributionData, anomalySummary, sheetId }) {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  
  // New state for API integration
  const [holidayListing, setHolidayListing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
    pageSize: 10
  });

  // Drawer state
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // API call to fetch holiday entries listing
  const fetchHolidayListing = async (page = 1, pageSize = 10) => {
    if (!sheetId) {
      console.warn('No sheetId provided for holiday listing API call');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/holiday-entries-list/${sheetId}/?page=${page}&page_size=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Handle the specific API response format with better error handling
      const listingData = result.results || result.data || result.holiday_entries || [];
      
      // Validate that we have an array of data
      if (!Array.isArray(listingData)) {
        throw new Error('Invalid response format: expected array of holiday entries');
      }
      
      setHolidayListing(listingData);
      setPagination({
        count: result.count || listingData.length,
        next: result.next,
        previous: result.previous,
        currentPage: page,
        pageSize: pageSize
      });
    } catch (err) {
      console.error('Error fetching holiday listing:', err);
      setError(err.message || 'Failed to fetch holiday entries listing');
      setHolidayListing([]);
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
    fetchHolidayListing(1, 10);
  }, [sheetId]);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    fetchHolidayListing(newPage, pagination.pageSize);
  };

  const handlePageSizeChange = (newPageSize) => {
    fetchHolidayListing(1, newPageSize);
  };

  // Drawer handlers
  const handleDrawerOpen = (holiday) => {
    setSelectedHoliday(holiday);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedHoliday(null);
  };

  // Extract currency from data or use default
  const currency = data?.currency || data?.file_info?.currency || 'SAR';

  // Extract data from the new API structure
  const fileInfo = data?.file_info || {};
  const analysisInfo = data?.analysis_info || {};
  const summary = data?.summary || {};
  const detailedResults = data?.detailed_results || {};
  const visualizations = data?.visualizations || {};
  
  // Map new structure to component expectations
  const summaryStats = {
    holiday_transactions: summary.total_holiday_postings || 0,
    total_transactions: summary.total_transactions || 0,
    total_holiday_amount: summary.total_holiday_amount || 0,
    avg_holiday_amount: summary.total_holiday_amount ? summary.total_holiday_amount / summary.total_holiday_postings : 0,
    unique_holidays: summary.unique_holidays || 0
  };
  
  const riskAssessment = {
    risk_level: summary.risk_level || 'LOW',
    overall_risk_score: summary.overall_risk_score || 0
  };
  
  const chartData = {
    holiday_by_user: visualizations.chart_data?.holiday_by_user || {},
    holiday_summary: visualizations.chart_data?.holiday_summary || {},
    holiday_by_month: visualizations.chart_data?.holiday_by_month || {},
    holiday_by_account: visualizations.chart_data?.holiday_by_account || {},
    holiday_breakdown_chart: visualizations.chart_data?.holiday_breakdown_chart || {},
    holiday_risk_distribution: visualizations.chart_data?.holiday_risk_distribution || {},
    holiday_amount_distribution: visualizations.chart_data?.holiday_amount_distribution || {}
  };
  
  const holidayPostings = detailedResults.holiday_postings || [];
  const recommendations = detailedResults.audit_recommendations || {};
  const detectionMethods = detailedResults.detection_methods || [];
  const confidenceScores = detailedResults.confidence_scores || {};

  // Calculate overall risk score
  const totalHolidayTransactions = summaryStats.holiday_transactions || 0;
  const totalTransactions = summaryStats.total_transactions || 0;
  const overallRiskScore = riskAssessment.overall_risk_score || 0;
  const riskLevel = riskAssessment.risk_level || 'LOW';

  // Group holiday postings by holiday name for summary
  const holidaySummary = holidayPostings.reduce((acc, posting) => {
    const holidayName = posting.holiday_name || 'Unknown Holiday';
    if (!acc[holidayName]) {
      acc[holidayName] = {
        holiday_name: holidayName,
        date: posting.posting_date,
        transaction_count: 0,
        total_amount: 0,
        users: new Set(),
        risk_level: 'HIGH'
      };
    }
    acc[holidayName].transaction_count++;
    acc[holidayName].total_amount += posting.amount || 0;
    acc[holidayName].users.add(posting.user);
    return acc;
  }, {});

  // Convert Set to Array for display
  Object.values(holidaySummary).forEach(holiday => {
    holiday.users = Array.from(holiday.users);
  });

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', p: 3 }}>
      {/* Analysis Status */}
      <Alert 
        severity={totalHolidayTransactions > 0 ? "warning" : "success"} 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={totalHolidayTransactions > 0 ? <WarningIcon /> : <InfoIcon />}
      >
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {totalHolidayTransactions > 0 
            ? `Found ${totalHolidayTransactions} holiday transactions across ${Object.keys(holidaySummary).length} holidays`
            : "No holiday transactions found"
          }
        </Typography>
        {totalHolidayTransactions > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Total amount involved: {formatCurrency(summaryStats.total_holiday_amount || 0)}
          </Typography>
        )}
      </Alert>

      {/* Holiday Analysis Information */}
      <Alert 
        severity="info" 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={<CalendarIcon />}
      >
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
          Holiday Analysis
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          This analysis identifies transactions posted on holidays, which may indicate unusual activity patterns.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item size={{xs: 12, md: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Detection Methods
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  {detectionMethods.join(', ')}
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, md: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Confidence Score
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  {(confidenceScores.holiday_detection_confidence * 100).toFixed(0)}%
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
            backgroundColor: '#925a9b',
            color: 'white',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(146, 90, 155, 0.3)',
            '&:hover': {
              backgroundColor: '#7a4a82',
              boxShadow: '0 4px 12px rgba(146, 90, 155, 0.4)',
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
                color: '#2c3e50', 
                mb: 1,
                fontSize: '1.75rem'
              }}>
                Holiday Analysis
              </Typography>
              <Typography variant="body1" sx={{ color: '#6c757d', mb: 0.5 }}>
                Analysis Date: {new Date(analysisInfo.analysis_date || Date.now()).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                Status: {analysisInfo.status || 'COMPLETED'} • Holidays: {Object.keys(holidaySummary).length}
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
                    {overallRiskScore}%
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
                    <TrendingUpIcon sx={{ 
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
                      {totalHolidayTransactions}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Holiday Transactions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ 
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
                      {formatCurrency(summaryStats.total_holiday_amount || 0)}
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
                    <TrendingUpIcon sx={{ 
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
                      {Object.keys(holidaySummary).length}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Holidays Affected
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ 
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
                      {chartData.holiday_by_user?.labels?.length || 0}
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
                    <TrendingUpIcon sx={{ 
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
                      {chartData.holiday_by_account?.labels?.length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Accounts Affected
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ 
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
                      {summary.high_value_holiday_count || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      High Value
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
              fontWeight: 600, 
              color: '#2c3e50',
              fontSize: '1.25rem'
            }}>
              📊 Holiday Entries Distribution Overview
            </Typography>
            <Grid container spacing={3}>
              <Grid item size={{xs: 12, md: 3}}>
                <Box sx={{ 
                  textAlign: 'center',
                  backgroundColor: 'white',
                  borderRadius: 2,
                  p: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #e9ecef'
                }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold', 
                    color: '#2c3e50',
                    fontSize: '1.75rem'
                  }}>
                    {distributionData.count}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#6c757d',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}>
                    Holiday Entries Found
                  </Typography>
                </Box>
              </Grid>
              <Grid item size={{xs: 12, md: 3}}>
                <Box sx={{ 
                  textAlign: 'center',
                  backgroundColor: 'white',
                  borderRadius: 2,
                  p: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #e9ecef'
                }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold', 
                    color: '#2c3e50',
                    fontSize: '1.75rem'
                  }}>
                    {Object.keys(holidaySummary).length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#6c757d',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}>
                   Holidays Effected
                  </Typography>
                </Box>
              </Grid>
              <Grid item size={{xs: 12, md: 3}}>
                <Box sx={{ 
                  textAlign: 'center',
                  backgroundColor: 'white',
                  borderRadius: 2,
                  p: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #e9ecef'
                }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold', 
                    color: '#2c3e50',
                    fontSize: '1.75rem'
                  }}>
                    {formatCurrency(summaryStats.total_holiday_amount || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#6c757d',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}>
                    Total Amount
                  </Typography>
                </Box>
              </Grid>
              <Grid item size={{xs: 12, md: 3}}>
                <Box sx={{ 
                  textAlign: 'center',
                  backgroundColor: 'white',
                  borderRadius: 2,
                  p: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #e9ecef'
                }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold', 
                    color: '#2c3e50',
                    fontSize: '1.75rem'
                  }}>
                    {anomalySummary ? Object.keys(anomalySummary).filter(key => 
                      key !== 'total_anomalies' && (anomalySummary[key] || 0) > 0
                    ).length : 0}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#6c757d',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}>
                    Anomaly Types
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

     

            {/* Charts and Statistics Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 700, 
          color: '#2c3e50', 
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <TrendingUpIcon sx={{ color: '#8B5CF6' }} />
          Charts and Statistics
        </Typography>

        {/* Charts Dashboard */}
        <Box>
          <Grid container spacing={3}>
              {/* Holiday Breakdown Chart */}
              {data?.visualizations?.chart_data?.holiday_breakdown_chart && (
              <Grid item size={{xs: 12, md: 12}}>
                <HolidayBreakdownChart data={data} currency={currency} />
              </Grid>
            )}

            {/* Holiday by User Chart */}
            {data?.visualizations?.chart_data?.holiday_by_user && (
              <Grid item size={{xs: 12, md: 6}}>
                <HolidayUserChart data={data} currency={currency} />
              </Grid>
            )}

            {/* Holiday by Account Chart */}
            {data?.visualizations?.chart_data?.holiday_by_account && (
              <Grid item size={{xs: 12, md: 6}}>
                <HolidayAccountChart data={data} currency={currency} />
              </Grid>
            )}

          
            {/* Risk Distribution Chart */}
            {data?.visualizations?.chart_data?.holiday_risk_distribution && (
              <Grid item size={{xs: 12, md: 6}}>
                <RiskDistributionChart data={data?.visualizations?.chart_data?.holiday_risk_distribution} />
              </Grid>
            )}

            {/* Monthly Trend Chart */}
            {data?.visualizations?.chart_data?.holiday_by_month && (
              <Grid item size={{xs: 12, md: 6}}>
                <MonthlyTrendChart data={data?.visualizations?.chart_data?.holiday_by_month} />
              </Grid>
            )}

            {/* Amount Distribution Chart */}
            {data?.visualizations?.chart_data?.holiday_amount_distribution && (
              <Grid item size={{xs: 12, md: 12}}>
                <HolidayAmountChart data={data} currency={currency} />
              </Grid>
            )}
          </Grid>
        </Box>

     
      </Box>
               {/* API Data Section - Only Listing */}
        <Card sx={{ 
          mb: 4, 
          background: 'white', 
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e9ecef'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: '#2c3e50', 
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <CalendarIcon sx={{ color: '#925a9b' }} />
              Holiday Entries
            </Typography>

            {/* Loading State */}
            {loading && (
              <Box sx={{ mb: 3 }}>
                <LinearProgress sx={{ 
                  backgroundColor: '#e9ecef',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#925a9b'
                  }
                }} />
                <Typography variant="body2" sx={{ mt: 1, color: '#6c757d', textAlign: 'center' }}>
                  Loading holiday entries...
                </Typography>
              </Box>
            )}

            {/* Error State */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  Error Loading Holiday Entries
                </Typography>
                <Typography variant="body2">
                  {error}
                </Typography>
              </Alert>
            )}

            {/* Data Table */}
            {!loading && !error && holidayListing.length > 0 && (
              <Box>
                <Paper sx={{ 
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #e9ecef',
                  overflow: 'hidden'
                }}>
                  <TableContainer>
            <Table>
              <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Account</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Holiday Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Risk Level</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                      {holidayListing.map((entry, index) => (
                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                                                  <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              color: '#6c757d',
                              fontSize: '0.875rem',
                              fontWeight: 500
                            }}>
                              {entry.user || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip 
                              label={entry.account || 'N/A'}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderColor: '#925a9b',
                                color: '#925a9b',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>

                          <TableCell sx={{ py: 2 }}>
                            <Chip 
                              label={entry.holiday_name || 'Unknown'} 
                              size="small"
                              color="warning"
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 700, 
                              color: '#925a9b',
                              fontSize: '0.875rem'
                            }}>
                              {entry.amount_formatted || formatCurrency(entry.amount || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Chip 
                                label={entry.risk_level?.toUpperCase() || 'N/A'} 
                                size="small"
                                sx={{ 
                                  backgroundColor: entry.risk_color || getRiskColor(entry.risk_level?.toUpperCase()),
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                              <Typography variant="caption" sx={{ 
                                color: '#6c757d',
                                fontSize: '0.7rem',
                                textAlign: 'center'
                              }}>
                                Score: {entry.risk_score || 'N/A'}
                              </Typography>
                            </Box>
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
          {!loading && !error && holidayListing.length === 0 && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                No Holiday Entries Found
              </Typography>
              <Typography variant="body2">
                The API returned no holiday entries for this analysis. This could mean either no holiday entries were found, or the data is still being processed.
              </Typography>
            </Alert>
          )}
          </CardContent>
        </Card>

      <Box>
        <Card sx={{ 
          mb: 4, 
          background: 'white', 
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #e9ecef'
        }}>
          <CardContent sx={{ p: 3 }}>
             {/* Compliance Issues */}
        {summary.compliance_issues && summary.compliance_issues.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Compliance Issues
            </Typography>
            <Grid container spacing={2}>
              {summary.compliance_issues.map((issue, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip 
                          label={issue.severity} 
                          size="small"
                          color={issue.severity === 'HIGH' ? 'error' : issue.severity === 'MEDIUM' ? 'warning' : 'success'}
                        />
                      </Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        {issue.issue_type}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {issue.description}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {issue.recommendation}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* High Priority Recommendations */}
        {summary.high_priority_recommendations && summary.high_priority_recommendations.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#2c3e50', 
              mb: 2 
            }}>
              High Priority Recommendations
            </Typography>
            <Grid container spacing={2}>
              {summary.high_priority_recommendations.map((rec, index) => (
                <Grid item size={{xs: 12, md: 6}} key={index}>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: rec.priority === 'CRITICAL' ? '#fff3e0' : '#e8f5e8',
                    borderRadius: 2,
                    width:"100%"
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip 
                        label={rec.priority} 
                        size="small"
                        color={rec.priority === 'CRITICAL' ? 'error' : 'warning'}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {rec.action}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {rec.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6c757d' }}>
                      Impact: {rec.impact}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Risk Assessment */}
        {detailedResults.risk_assessment && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#2c3e50', 
              mb: 2 
            }}>
              Risk Assessment
            </Typography>
            <Grid container spacing={2}>
              <Grid item size={{xs: 12, md: 4}}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                  <Typography variant="h6" color="#e65100">
                    {detailedResults.risk_assessment.overall_risk_level}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overall Risk Level
                  </Typography>
                </Paper>
              </Grid>
              <Grid item size={{xs: 12, md: 4}}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e8' }}>
                  <Typography variant="h6" color="#2e7d32">
                    {detailedResults.risk_assessment.risk_score}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Risk Score
                  </Typography>
                </Paper>
              </Grid>
              <Grid item size={{xs: 12, md: 4}}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                  <Typography variant="h6" color="#1565c0">
                    {detailedResults.risk_assessment.risk_factors?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Risk Factors
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Holiday Patterns */}
        {detailedResults.holiday_patterns && (
          <Box sx={{ mb: 6 }}>
            {/* Main Section Header */}
            <Box sx={{ 
              mb: 4,
              pb: 2,
              borderBottom: '3px solid #1976d2',
              position: 'relative'
            }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 800, 
                color: '#1a1a1a', 
                mb: 1,
                letterSpacing: '-0.5px'
              }}>
                Holiday Patterns Analysis
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#666666',
                fontStyle: 'italic',
                fontSize: '0.95rem'
              }}>
                Comprehensive analysis of transaction patterns during holiday periods
              </Typography>
            </Box>
            
            {/* Holiday Distribution Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                gap: 2
              }}>
                <Box sx={{ 
                  width: 4, 
                  height: 24, 
                  bgcolor: '#1976d2', 
                  borderRadius: 1 
                }} />
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: '#2c3e50',
                  letterSpacing: '-0.3px'
                }}>
                  Holiday Distribution Summary
                </Typography>
              </Box>
              
              <Box sx={{ 
                bgcolor: '#ffffff', 
                border: '1px solid #e8e8e8',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <Box sx={{ 
                  bgcolor: '#f8f9fa', 
                  px: 3, 
                  py: 2,
                  borderBottom: '1px solid #e8e8e8'
                }}>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 600, 
                    color: '#495057',
                    fontSize: '0.95rem'
                  }}>
                    Transaction Distribution by Holiday
                  </Typography>
                </Box>
                
                <Box>
                  {Object.entries(detailedResults.holiday_patterns.holiday_distribution || {}).map(([holiday, count], index) => (
                    <Box key={holiday} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      px: 3,
                      py: 2.5,
                      borderBottom: index < Object.keys(detailedResults.holiday_patterns.holiday_distribution || {}).length - 1 ? '1px solid #f1f3f4' : 'none',
                      '&:hover': {
                        bgcolor: '#f8f9fa'
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          bgcolor: '#1976d2', 
                          borderRadius: '50%' 
                        }} />
                        <Typography variant="body1" sx={{ 
                          fontWeight: 500, 
                          color: '#2c3e50',
                          fontSize: '1rem'
                        }}>
                          {holiday || 'Unknown Holiday'}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        bgcolor: '#e3f2fd',
                        px: 2.5,
                        py: 1,
                        borderRadius: 2,
                        border: '1px solid #bbdefb'
                      }}>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 700, 
                          color: '#1565c0',
                          fontSize: '0.9rem'
                        }}>
                          {count} transactions
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Amount Analysis Section */}
            <Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                gap: 2
              }}>
                <Box sx={{ 
                  width: 4, 
                  height: 24, 
                  bgcolor: '#1976d2', 
                  borderRadius: 1 
                }} />
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: '#2c3e50',
                  letterSpacing: '-0.3px'
                }}>
                  Financial Metrics Analysis
                </Typography>
              </Box>
              
              <Box sx={{ 
                bgcolor: '#ffffff', 
                border: '1px solid #e8e8e8',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <Box sx={{ 
                  bgcolor: '#f8f9fa', 
                  px: 3, 
                  py: 2,
                  borderBottom: '1px solid #e8e8e8'
                }}>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 600, 
                    color: '#495057',
                    fontSize: '0.95rem'
                  }}>
                    Amount Distribution Statistics
                  </Typography>
                </Box>
                
                                  <Box sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                      gap: 3
                    }}>
                      <Box sx={{ 
                        p: 3, 
                        bgcolor: '#f8f9fa', 
                        borderRadius: 2,
                        border: '1px solid #e9ecef',
                        textAlign: 'center',
                        position: 'relative',
                        height: '140px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          bgcolor: '#28a745',
                          borderRadius: '2px 2px 0 0'
                        }
                      }}>
                        <Typography variant="body2" sx={{ 
                          color: '#6c757d', 
                          mb: 1, 
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: 600
                        }}>
                          Minimum Amount
                        </Typography>
                        <Typography variant="h5" sx={{ 
                          fontWeight: 700, 
                          color: '#2c3e50',
                          fontSize: '1.25rem'
                        }}>
                          {formatCurrency(detailedResults.holiday_patterns.amount_patterns?.min_amount || 0)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        p: 3, 
                        bgcolor: '#f8f9fa', 
                        borderRadius: 2,
                        border: '1px solid #e9ecef',
                        textAlign: 'center',
                        position: 'relative',
                        height: '140px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          bgcolor: '#dc3545',
                          borderRadius: '2px 2px 0 0'
                        }
                      }}>
                        <Typography variant="body2" sx={{ 
                          color: '#6c757d', 
                          mb: 1, 
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: 600
                        }}>
                          Maximum Amount
                        </Typography>
                        <Typography variant="h5" sx={{ 
                          fontWeight: 700, 
                          color: '#2c3e50',
                          fontSize: '1.25rem'
                        }}>
                          {formatCurrency(detailedResults.holiday_patterns.amount_patterns?.max_amount || 0)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        p: 3, 
                        bgcolor: '#f8f9fa', 
                        borderRadius: 2,
                        border: '1px solid #e9ecef',
                        textAlign: 'center',
                        position: 'relative',
                        height: '140px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          bgcolor: '#ffc107',
                          borderRadius: '2px 2px 0 0'
                        }
                      }}>
                        <Typography variant="body2" sx={{ 
                          color: '#6c757d', 
                          mb: 1, 
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: 600
                        }}>
                          Average Amount
                        </Typography>
                        <Typography variant="h5" sx={{ 
                          fontWeight: 700, 
                          color: '#2c3e50',
                          fontSize: '1.25rem'
                        }}>
                          {formatCurrency(detailedResults.holiday_patterns.amount_patterns?.avg_amount || 0)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        p: 3, 
                        bgcolor: '#f8f9fa', 
                        borderRadius: 2,
                        border: '1px solid #e9ecef',
                        textAlign: 'center',
                        position: 'relative',
                        height: '140px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          bgcolor: '#17a2b8',
                          borderRadius: '2px 2px 0 0'
                        }
                      }}>
                        <Typography variant="body2" sx={{ 
                          color: '#6c757d', 
                          mb: 1, 
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontWeight: 600
                        }}>
                          High Value Count
                        </Typography>
                        <Typography variant="h5" sx={{ 
                          fontWeight: 700, 
                          color: '#2c3e50',
                          fontSize: '1.25rem'
                        }}>
                          {detailedResults.holiday_patterns.amount_patterns?.high_value_count || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Audit Recommendations */}
        {detailedResults.audit_recommendations && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#2c3e50', 
              mb: 2 
            }}>
              Audit Recommendations
            </Typography>
            <Grid container spacing={2}>
              {detailedResults.audit_recommendations.immediate_actions && (
                <Grid item size={{xs: 12, md: 4}}>
                  <Paper sx={{ p: 2, bgcolor: '#fff3e0', height:"150px" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#e65100' }}>
                      Immediate Actions
                    </Typography>
                    {detailedResults.audit_recommendations.immediate_actions.map((action, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {action.action}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6c757d' }}>
                          {action.reason}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              )}
              {detailedResults.audit_recommendations.follow_up_actions && (
                <Grid item size={{xs: 12, md: 4}}>
                  <Paper sx={{ p: 2, bgcolor: '#e8f5e8', height:"150px" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#2e7d32' }}>
                      Follow-up Actions
                    </Typography>
                    {detailedResults.audit_recommendations.follow_up_actions.map((action, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {action.action}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6c757d' }}>
                          {action.reason}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              )}
              {detailedResults.audit_recommendations.monitoring_actions && (
                <Grid item size={{xs: 12, md: 4}}>
                  <Paper sx={{ p: 2, bgcolor: '#e3f2fd', height:"150px" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1565c0' }}>
                      Monitoring Actions
                    </Typography>
                    {detailedResults.audit_recommendations.monitoring_actions.map((action, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {action.action}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6c757d' }}>
                          {action.reason}
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
                  )}
          </CardContent>
        </Card>
      </Box>

      {/* Unified Anomaly Drawer */}
      <UnifiedAnomalyDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        anomaly={selectedHoliday}
        type="Holiday Analysis"
      />
    </Box>
  );
} 