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
  Collapse,
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
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle
} from '@mui/icons-material';
import { getRiskColor, formatCurrency } from '../../utils/colorScheme';
import UnifiedAnomalyDrawer from '../FlaggedExpenseDrawer';

// Import chart components
import RiskDistributionChart from '../charts/RiskDistributionChart';
import AnomaliesDistributionChart from '../charts/AnomaliesDistributionChart';

// Import Recharts for custom gradient charts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Area, AreaChart, BarChart, Bar, PieChart, Pie, Cell, ComposedChart } from 'recharts';

export default function ClosingAnalysisContent({ data, distributionData, anomalySummary, sheetId }) {
  const [expandedTransactions, setExpandedTransactions] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedClosing, setSelectedClosing] = useState(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  
  // New state for API integration
  const [closingListing, setClosingListing] = useState([]);
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

  const handleTransactionRowToggle = (closingIndex) => {
    setExpandedTransactions(prev => ({
      ...prev,
      [closingIndex]: !prev[closingIndex]
    }));
  };

  const handleDrawerOpen = (closing) => {
    setSelectedClosing(closing);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedClosing(null);
  };

  const handleOpenPDF = () => {
    setPdfOpen(true);
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  // Extract data from the new API structure
  const analysisInfo = data?.analysis_info || {};
  const summary = data?.summary || {};
  const detailedAnalysis = data?.detailed_analysis || {};
  const riskAssessment = data?.risk_assessment || {};
  const visualizations = data?.visualizations || {};
  const patterns = data?.patterns || {};
  const closingEntriesAnalysis = data?.closing_entries_analysis || {};

  // Map new structure to component expectations
  const summaryStats = {
    closing_transactions: summary.closing_entries_count || 0,
    total_transactions: summary.total_transactions || 0,
    post_close_entries: summary.post_close_entries_count || 0,
    risk_level: summary.risk_level || 'LOW',
    overall_risk_score: summary.overall_risk_score || 0
  };

  const riskDistribution = detailedAnalysis.risk_distribution || {};
  const userAnalysis = detailedAnalysis.user_analysis || {};
  const accountAnalysis = detailedAnalysis.account_analysis || {};
  const temporalAnalysis = detailedAnalysis.temporal_analysis || {};
  const amountAnalysis = detailedAnalysis.amount_analysis || {};
  const summaryStatsDetailed = detailedAnalysis.summary_stats || {};

  // Calculate totals from new structure
  const totalClosing = summaryStats.closing_transactions;
  const totalTransactions = summaryStats.total_transactions;
  const overallRiskScore = summaryStats.overall_risk_score;
  const riskLevel = summaryStats.risk_level;

  // API call to fetch closing entries listing
  const fetchClosingListing = async (page = 1, pageSize = 10) => {
    if (!sheetId) {
      console.warn('No sheetId provided for closing listing API call');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/closing-entries-list/${sheetId}/?page=${page}&page_size=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Handle the specific API response format
      const listingData = result.results || result.data || result.closing_entries || [];
      
      setClosingListing(listingData);
      setPagination({
        count: result.count || 0,
        next: result.next,
        previous: result.previous,
        currentPage: page,
        pageSize: pageSize
      });
    } catch (err) {
      console.error('Error fetching closing listing:', err);
      setError(err.message || 'Failed to fetch closing entries listing');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchClosingListing(1, 10);
  }, [sheetId]);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    fetchClosingListing(newPage, pagination.pageSize);
  };

  const handlePageSizeChange = (newPageSize) => {
    fetchClosingListing(1, newPageSize);
  };

  // Prepare chart data for risk distribution - pass raw data to let the component handle transformation
  // If no risk distribution data, create a fallback structure
  const riskDistributionChartData = Object.keys(riskDistribution).length > 0 
    ? riskDistribution 
    : { low_risk: 0, medium_risk: 0, high_risk: 0, critical_risk: 0 };

  // Prepare user analysis data for charts
  const userAnalysisChartData = Object.entries(userAnalysis).map(([user, data]) => ({
    name: user,
    entries: data.total_entries,
    amount: data.total_amount,
    riskLevel: Object.keys(data.risk_levels || {}).reduce((a, b) => 
      data.risk_levels[a] > data.risk_levels[b] ? a : b, 'LOW'
    )
  }));

  // Prepare account analysis data for charts
  const accountAnalysisChartData = Object.entries(accountAnalysis).map(([account, data]) => ({
    name: `Account ${account}`,
    entries: data.total_entries,
    amount: data.total_amount,
    users: data.users?.length || 0
  }));

  // Prepare temporal analysis data for charts
  const temporalAnalysisChartData = Object.entries(temporalAnalysis).map(([date, data]) => ({
    name: new Date(date).toLocaleDateString(),
    entries: data.total_entries,
    amount: data.total_amount,
    daysFromMonthEnd: data.days_from_month_end || 0
  })).sort((a, b) => new Date(a.name) - new Date(b.name));

  // Prepare amount analysis data for charts
  const amountAnalysisChartData = [
    { name: 'High Value', value: amountAnalysis.high_value_entries || 0, color: '#ef4444' },
    { name: 'Medium Value', value: amountAnalysis.medium_value_entries || 0, color: '#f59e0b' },
    { name: 'Low Value', value: amountAnalysis.low_value_entries || 0, color: '#10b981' }
  ];

  // Prepare monthly trend data
  const monthlyTrendData = Object.entries(temporalAnalysis)
    .reduce((acc, [date, data]) => {
      const month = new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { name: month, entries: 0, amount: 0 };
      }
      acc[month].entries += data.total_entries;
      acc[month].amount += data.total_amount;
      return acc;
    }, {});

  const monthlyTrendChartData = Object.values(monthlyTrendData);

  return (
    <Box sx={{ minHeight: '100vh', background: 'white', p: 3 }}>
      <Typography variant="h4" sx={{ 
        fontWeight: 700, 
        color: '#2c3e50', 
        mb: 3,
        fontSize: '1.75rem'
      }}>
        Closing Analysis Report
      </Typography>

      {/* Analysis Info */}
      {analysisInfo.analysis_id && (
        <Alert 
          severity="info" 
          sx={{ mb: 3, borderRadius: 2 }}
          icon={<InfoIcon />}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Analysis ID: {analysisInfo.analysis_id}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Analysis Date: {new Date(analysisInfo.analysis_date).toLocaleString()}
          </Typography>
          <Typography variant="body2">
            Processing Duration: {analysisInfo.processing_duration?.toFixed(3)}s | Status: {analysisInfo.status}
          </Typography>
        </Alert>
      )}

      {/* Closing Definition */}
      <Alert 
        severity="info" 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={<InfoIcon />}
      >
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
          Month-End Closing Entry Detection
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          This analysis identifies transactions posted during the month-end closing period, typically the last few days of each month. These entries are analyzed for potential anomalies and risk assessment.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item size={{xs: 12, sm: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Detection Criteria
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  • Transactions posted in last 3-5 days of month<br/>
                  • High-value closing entries<br/>
                  • Unusual posting patterns during closing period
                </Typography>
              </Box>
            </Grid>
                <Grid item size={{xs: 12, sm: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Risk Indicators
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  • Large amounts posted on month-end<br/>
                  • Multiple entries by same user<br/>
                  • Unusual account combinations<br/>
                  • Posting outside business hours
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Alert>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item size={{xs: 12, sm: 6, lg: 3}}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #925a9b 0%, #7a4a82 100%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(146, 90, 155, 0.2)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  mr: 2,
                  width: 40,
                  height: 40
                }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {totalClosing.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                    Closing Entries
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={totalTransactions > 0 ? (totalClosing / totalTransactions) * 100 : 0}
                sx={{ 
                  height: 4, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)'
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item size={{xs: 12, sm: 6, lg: 3}}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #925a9b 0%, #7a4a82 100%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  mr: 2,
                  width: 40,
                  height: 40
                }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {riskLevel}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                    Risk Level
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600, mt: 1 }}>
                Score: {overallRiskScore.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item size={{xs: 12, sm: 6, lg: 3}}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #925a9b 0%, #7a4a82 100%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  mr: 2,
                  width: 40,
                  height: 40
                }}>
                  <ErrorIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {summaryStats.post_close_entries}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                    Post-Close Entries
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item size={{xs: 12, sm: 6, lg: 3}}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #925a9b 0%, #7a4a82 100%)',
            color: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  mr: 2,
                  width: 40,
                  height: 40
                }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {summaryStatsDetailed.unique_users || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                    Unique Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item size={{xs: 12, sm: 6, lg: 3}}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
            height: '100%'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#666' }}>
                Total Amount
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                {formatCurrency(amountAnalysis.total_amount || 0, currency)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item size={{xs: 12, sm: 6, lg: 3}}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
            height: '100%'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#666' }}>
                Average Amount
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                {formatCurrency(amountAnalysis.average_amount || 0, currency)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item size={{xs: 12, sm: 6, lg: 3}}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
            height: '100%'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#666' }}>
                Unique Accounts
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                {summaryStatsDetailed.unique_accounts || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item size={{xs: 12, sm: 6, lg: 3}}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
            height: '100%'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600, color: '#666' }}>
                Avg Days from Month End
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                {summaryStatsDetailed.average_days_from_month_end?.toFixed(1) || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* User Activity Chart */}
          <Grid item size={{xs: 12, lg: 12}}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
            background: 'white'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
                User Activity Analysis
              </Typography>
              <Box sx={{ 
                height: 400,
                background: 'linear-gradient(135deg, rgba(146, 90, 155, 0.02) 0%, rgba(122, 74, 130, 0.02) 100%)',
                borderRadius: 2,
                p: 1
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={userAnalysisChartData}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#925a9b" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#925a9b" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#7a4a82" stopOpacity={0.8}/>
                        <stop offset="50%" stopColor="#925a9b" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#7a4a82" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7a4a82" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7a4a82" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#666" 
                      angle={-45} 
                      textAnchor="end" 
                      height={100}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      stroke="#666" 
                      label={{ value: 'Number of Entries', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      stroke="#7a4a82"
                      label={{ value: 'Total Amount', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <Box sx={{ 
                              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                              border: '1px solid #e0e0e0', 
                              borderRadius: 3, 
                              p: 2.5,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              minWidth: 200
                            }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 'bold', 
                                mb: 1.5,
                                color: '#2c3e50',
                                fontSize: '0.9rem'
                              }}>
                                {label}
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  p: 1,
                                  backgroundColor: 'rgba(146, 90, 155, 0.1)',
                                  borderRadius: 1
                                }}>
                                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                                    Entries:
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#925a9b' }}>
                                    {payload[0]?.value}
                                  </Typography>
                                </Box>
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  p: 1,
                                  backgroundColor: 'rgba(122, 74, 130, 0.1)',
                                  borderRadius: 1
                                }}>
                                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                                    Amount:
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#7a4a82' }}>
                                    {formatCurrency(payload[1]?.value || 0, currency)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="entries" 
                      fill="url(#barGradient)" 
                      name="Entries" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="amount"
                      stroke="url(#lineGradient)"
                      strokeWidth={3}
                      fill="url(#areaGradient)"
                      name="Total Amount"
                      dot={{ fill: '#7a4a82', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#7a4a82', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Risk Distribution Chart */}
        <Grid item size={{xs: 12, lg: 5}}>
          <RiskDistributionChart 
            data={riskDistributionChartData} 
            title="Risk Distribution"
            subtitle="Distribution of closing entries by risk level"
          />
        </Grid>
   {/* Amount Analysis Chart */}
   <Grid item size={{xs: 12, lg: 7}}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
            background: 'white'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
                Amount Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={amountAnalysisChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {amountAnalysisChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      

        {/* Account Analysis Chart */}
        <Grid item size={{xs: 12, lg: 12}}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
            background: 'white'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
                Account Analysis
              </Typography>
              <Box sx={{ 
                height: 400,
                background: 'linear-gradient(135deg, rgba(146, 90, 155, 0.02) 0%, rgba(122, 74, 130, 0.02) 100%)',
                borderRadius: 2,
                p: 1
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={accountAnalysisChartData.slice(0, 8)}>
                    <defs>
                      <linearGradient id="accountBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#925a9b" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#925a9b" stopOpacity={0.3}/>
                      </linearGradient>
                      <linearGradient id="accountAmountGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7a4a82" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#7a4a82" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#666" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      stroke="#666"
                      label={{ value: 'Number of Entries', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      stroke="#7a4a82"
                      label={{ value: 'Total Amount', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <Box sx={{ 
                              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                              border: '1px solid #e0e0e0', 
                              borderRadius: 3, 
                              p: 2.5,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              minWidth: 200
                            }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 'bold', 
                                mb: 1.5,
                                color: '#2c3e50',
                                fontSize: '0.9rem'
                              }}>
                                {label}
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  p: 1,
                                  backgroundColor: 'rgba(146, 90, 155, 0.1)',
                                  borderRadius: 1
                                }}>
                                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                                    Entries:
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#925a9b' }}>
                                    {payload[0]?.value}
                                  </Typography>
                                </Box>
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  p: 1,
                                  backgroundColor: 'rgba(122, 74, 130, 0.1)',
                                  borderRadius: 1
                                }}>
                                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                                    Amount:
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#7a4a82' }}>
                                    {formatCurrency(payload[1]?.value || 0, currency)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar 
                      yAxisId="left"
                      dataKey="entries" 
                      fill="url(#accountBarGradient)" 
                      name="Entries" 
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="amount" 
                      fill="url(#accountAmountGradient)" 
                      name="Amount" 
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

     

        {/* Monthly Trend Chart */}
        <Grid item size={{xs: 12, lg: 12}}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
            background: 'white'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
                Monthly Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="entries" stroke="#925a9b" strokeWidth={2} name="Entries" />
                    <Line type="monotone" dataKey="amount" stroke="#7a4a82" strokeWidth={2} name="Amount" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Temporal Analysis Chart */}
        <Grid item size={{xs: 12, lg: 12}}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            border: '1px solid #f0f0f0',
            background: 'white'
          }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
                Closing Date Analysis
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={temporalAnalysisChartData}>
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#925a9b" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#925a9b" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="entries" stroke="#925a9b" fill="url(#colorGradient)" name="Entries" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Analysis Table */}
      {Object.keys(userAnalysis).length > 0 && (
        <Card sx={{ 
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0',
          background: 'white',
          mb: 3
        }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
              User Analysis
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 1, boxShadow: 'none', border: '1px solid #f0f0f0' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>User</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#2c3e50' }}>Total Entries</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#2c3e50' }}>Total Amount</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#2c3e50' }}>Average Amount</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50' }}>Risk Level</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                                     {Object.entries(userAnalysis).map(([user, data], index) => {
                     const dominantRiskLevel = Object.keys(data.risk_levels || {}).reduce((a, b) => 
                       data.risk_levels[a] > data.risk_levels[b] ? a : b, 'LOW'
                     );
                     const avgAmount = data.total_amount / data.total_entries;
                    
                    return (
                      <TableRow key={index} hover sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {data.total_entries.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(data.total_amount, currency)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatCurrency(avgAmount, currency)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={dominantRiskLevel}
                            size="small"
                            sx={{
                              backgroundColor: getRiskColor(dominantRiskLevel),
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleDrawerOpen({
                              user: user,
                              ...data,
                              avg_amount: avgAmount,
                              risk_level: dominantRiskLevel
                            })}
                            sx={{ color: '#925a9b' }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Closing Entries Table */}
      <Card sx={{ 
        borderRadius: 2, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0',
        background: 'white',
        mb: 3
      }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
              Closing Entries Details
            </Typography>
            <Button
              variant="contained"
              startIcon={<VisibilityIcon />}
              onClick={handleOpenPDF}
              sx={{
                background: 'linear-gradient(135deg, #925a9b 0%, #7a4a82 100%)',
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                px: 2,
                py: 1
              }}
            >
              Generate PDF Report
            </Button>
          </Box>

          {loading && (
            <Box sx={{ width: '100%', mb: 2 }}>
              <LinearProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TableContainer component={Paper} sx={{ borderRadius: 1, boxShadow: 'none', border: '1px solid #f0f0f0' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#fafafa' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Posting Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Document Number</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Account</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>User</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#2c3e50' }}>Amount</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50' }}>Risk Level</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50' }}>Days from Month End</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {closingListing.map((entry, index) => (
                  <React.Fragment key={index}>
                    <TableRow 
                      hover 
                      sx={{ 
                        '&:hover': { backgroundColor: '#f8f9fa' },
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                      onClick={() => handleTransactionRowToggle(index)}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {entry.posting_date || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.document_number || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.account || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.user || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(entry.amount || 0, currency)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getRiskLevel(entry.risk_score || 0)}
                          size="small"
                          sx={{
                            backgroundColor: getRiskColor(getRiskLevel(entry.risk_score || 0)),
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {entry.days_from_month_end || 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDrawerOpen(entry);
                          }}
                          sx={{ color: '#925a9b' }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                        <Collapse in={expandedTransactions[index]} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                              Transaction Details
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2">
                                  <strong>Effective Date:</strong> {entry.effective_date || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Description:</strong> {entry.description || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Source:</strong> {entry.source || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2">
                                  <strong>Risk Score:</strong> {entry.risk_score || 0}%
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Risk Factors:</strong> {entry.risk_factors || 'None identified'}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid #f0f0f0' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Page Size</InputLabel>
              <Select
                value={pagination.pageSize}
                label="Page Size"
                onChange={(e) => handlePageSizeChange(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
            <Pagination
              count={Math.ceil(pagination.count / pagination.pageSize)}
              page={pagination.currentPage}
              onChange={(e, page) => handlePageChange(page)}
              color="primary"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 1
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Drawer for detailed view */}
      <UnifiedAnomalyDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        data={selectedClosing}
        type="closing"
      />
    </Box>
  );
}