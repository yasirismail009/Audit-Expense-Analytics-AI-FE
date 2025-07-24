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
  Button
} from '@mui/material';
import BackdatedAnalysisPDF from './BackdatedAnalysisPDF';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { getRiskColor } from '../../utils/colorScheme';
import DuplicateDetailDrawer from '../FlaggedExpenseDrawer';

// Import chart components
import RiskDistributionChart from '../charts/RiskDistributionChart';
import AnomaliesDistributionChart from '../charts/AnomaliesDistributionChart';

// Import Recharts for custom gradient charts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Area, AreaChart } from 'recharts';

export default function BackdatedAnalysisContent({ data, distributionData, anomalySummary }) {
  const [expandedTransactions, setExpandedTransactions] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBackdated, setSelectedBackdated] = useState(null);
  const [pdfOpen, setPdfOpen] = useState(false);

  // Extract currency from data or use default
  const currency = data?.currency || data?.file_info?.currency || 'SAR';

  const handleTransactionRowToggle = (backdatedIndex) => {
    setExpandedTransactions(prev => ({
      ...prev,
      [backdatedIndex]: !prev[backdatedIndex]
    }));
  };

  const handleDrawerOpen = (backdated) => {
    setSelectedBackdated(backdated);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedBackdated(null);
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

  // Extract data from the new API structure
  const analysisInfo = data?.analysis_info || {};
  const backdatedList = data?.backdated_list || [];
  const chartData = data?.chart_data || {};
  const breakdowns = data?.breakdowns || {};
  const detailedInsights = data?.detailed_insights || {};
  const fileInfo = data?.file_info || {};

  // Calculate overall risk score based on new data structure
  const totalBackdated = analysisInfo.total_backdated_entries || 0;
  const totalTransactions = analysisInfo.total_transactions || 0;
  
  // Calculate risk based on actual risk scores from the data
  let overallRiskScore = 0;
  let riskLevel = 'LOW';
  
  if (backdatedList.length > 0) {
    // Calculate average risk score from all backdated entries
    const totalRiskScore = backdatedList.reduce((sum, entry) => sum + (entry.risk_score || 0), 0);
    overallRiskScore = Math.round(totalRiskScore / backdatedList.length);
    riskLevel = getRiskLevel(overallRiskScore);
  } else if (totalBackdated > 0) {
    // Fallback: calculate based on percentage if no detailed risk scores
    overallRiskScore = totalTransactions > 0 ? Math.round((totalBackdated / totalTransactions) * 100) : 0;
    riskLevel = getRiskLevel(overallRiskScore);
  }
  
  // Override with high risk if there are high-risk entries
  const highRiskEntries = analysisInfo.high_risk_entries || 0;
  const criticalRiskEntries = backdatedList.filter(entry => entry.risk_level === 'CRITICAL').length;
  
  if (criticalRiskEntries > 0 || highRiskEntries > 0) {
    riskLevel = criticalRiskEntries > 0 ? 'CRITICAL' : 'HIGH';
    overallRiskScore = Math.max(overallRiskScore, criticalRiskEntries > 0 ? 95 : 85);
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', p: 3 }}>
      {/* Analysis Status */}
      <Alert 
        severity={
          totalBackdated === 0 ? "success" : 
          riskLevel === 'CRITICAL' ? "error" :
          riskLevel === 'HIGH' ? "warning" : 
          "info"
        } 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={
          totalBackdated === 0 ? <InfoIcon /> :
          riskLevel === 'CRITICAL' ? <ErrorIcon /> :
          riskLevel === 'HIGH' ? <WarningIcon /> :
          <InfoIcon />
        }
      >
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {totalBackdated > 0 
            ? `Found ${totalBackdated} backdated entries (${riskLevel} Risk) involving ${totalBackdated || 0} transactions`
            : "No backdated entries found"
          }
        </Typography>
        {totalBackdated > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Total amount involved: {formatCurrency(analysisInfo.total_amount || 0)} • Risk Level: {riskLevel}
          </Typography>
        )}
      </Alert>

      {/* Open Report Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleOpenPDF}
          sx={{
            backgroundColor: '#e65100',
            color: 'white',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(230, 81, 0, 0.3)',
            '&:hover': {
              backgroundColor: '#d84315',
              boxShadow: '0 4px 12px rgba(230, 81, 0, 0.4)',
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
                Backdated Analysis
              </Typography>
              <Typography variant="body1" sx={{ color: '#6c757d', mb: 0.5 }}>
                Analysis Date: {new Date(analysisInfo.analysis_date || Date.now()).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                Status: {fileInfo.status || 'COMPLETED'} • Backdated: {totalBackdated}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', width:'fit-content', marginTop: '10px', gap: '10px' }}>
                <Box sx={{ 
                  width: 120,
                  height: 120, 
                  borderRadius: '50%', 
                  background: '#e65100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  position: 'relative',
                  boxShadow: '0 4px 16px rgba(230, 81, 0, 0.3)'
                }}>
                  <Typography variant="h2" sx={{ 
                    fontWeight: 800, 
                    color: 'white',
                    fontSize: '2.2rem'
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
                      color: '#e65100', 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {totalBackdated}
                </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Total Backdated
                </Typography>
              </Box>
            </Grid>
                <Grid item size={{xs: 6, md: 3}}>
              <Box sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ 
                      color: '#e65100', 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {formatCurrency(analysisInfo.total_amount || 0)}
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
                      color: '#e65100', 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {analysisInfo.unique_users || 0}
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
                      color: '#e65100', 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {analysisInfo.unique_documents || 0}
        </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Documents
        </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ 
                      color: '#e65100', 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {analysisInfo.unique_accounts || 0}
              </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      GL Accounts
              </Typography>
                  </Box>
          </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ 
                      color: '#e65100', 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {analysisInfo.avg_days_difference || 0}
              </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Avg Days Diff
              </Typography>
                  </Box>
          </Grid>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ 
                      color: '#e65100', 
                      fontSize: 24, 
                      mb: 0.5 
                    }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5,
                      fontSize: '1.1rem'
                    }}>
                      {formatCurrency((analysisInfo.total_amount || 0) / (totalBackdated || 1))}
              </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Average Amount
              </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Charts Dashboard */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Risk Distribution Chart */}
        <Grid item size={{xs: 12, md: 6}}>
          <RiskDistributionChart 
            data={chartData.risk_distribution || {
              labels: ['High Risk', 'Medium Risk', 'Low Risk'],
              data: [
                analysisInfo.high_risk_entries || 0,
                analysisInfo.medium_risk_entries || 0,
                analysisInfo.low_risk_entries || 0
              ]
            }}
          />
        </Grid>
        
        {/* Days Difference Distribution Chart */}
        <Grid item size={{xs: 12, md: 6}}>
          <AnomaliesDistributionChart 
            data={chartData.days_difference_distribution || {
              labels: ['1-7 days', '8-30 days', '31-90 days', '90+ days'],
              data: [0, 0, 0, 0] // This would need to be calculated from actual data
            }}
          />
        </Grid>
        
        {/* Backdated Entries by User Chart */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
                Backdated Entries by User
              </Typography>
              {breakdowns.by_user && breakdowns.by_user.length > 0 ? (
                <Box>
                  {breakdowns.by_user.map((user, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {user.user_name}
                        </Typography>
                        <Chip 
                          label={user.risk_score} 
                          size="small"
                          sx={{ 
                            backgroundColor: getRiskColor(getRiskLevel(user.risk_score)),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {user.transaction_count} entries
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#e65100' }}>
                          {formatCurrency(user.total_amount)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No user breakdown data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Amount Distribution Chart with Gradient */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
                Amount Distribution Trend
              </Typography>
              {backdatedList && backdatedList.length > 0 ? (
                <Box>
                  <Box sx={{ mb: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 2, border: '1px solid #ffcc02' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#e65100' }}>
                      Total Amount: {formatCurrency(analysisInfo.total_amount || 0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Average per entry: {formatCurrency((analysisInfo.total_amount || 0) / (totalBackdated || 1))}
                    </Typography>
                  </Box>
                  
                  {/* Gradient Line Chart */}
                  <Box sx={{ height: 200, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={backdatedList.slice(0, 10).map((entry, index) => ({
                        name: `Entry ${index + 1}`,
                        amount: entry.amount || 0,
                        risk: entry.risk_score || 0
                      }))}>
                        <defs>
                          <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#e65100" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#e65100" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#925A9B" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#925A9B" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <Box sx={{ 
                                  backgroundColor: 'white', 
                                  border: '1px solid #ccc', 
                                  borderRadius: 2, 
                                  p: 2,
                                  boxShadow: 2
                                }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {label}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Amount: {formatCurrency(payload[0]?.value || 0)}
                                  </Typography>
                                  {payload[1] && (
                                    <Typography variant="body2" color="text.secondary">
                                      Risk: {payload[1]?.value || 0}
                                    </Typography>
                                  )}
                                </Box>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Area 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#e65100"
                          strokeWidth={2}
                          fill="url(#amountGradient)"
                          dot={{ fill: '#e65100', strokeWidth: 1, r: 3 }}
                          activeDot={{ r: 5, stroke: '#e65100', strokeWidth: 2, fill: '#e65100' }}
                          name="Amount"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="risk" 
                          stroke="#925A9B"
                          strokeWidth={2}
                          fill="url(#riskGradient)"
                          dot={{ fill: '#925A9B', strokeWidth: 1, r: 3 }}
                          activeDot={{ r: 5, stroke: '#925A9B', strokeWidth: 2, fill: '#925A9B' }}
                          name="Risk Score"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No amount data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* All Content in One View */}
      <Grid container spacing={3} sx={{ mt: 3 }}>

        {/* Section 1: Detailed Tables */}
        <Grid item size={{xs: 12, md: 12}}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              mb: 3, 
              color: '#2c3e50',
              fontSize: '1.25rem'
            }}>
              Detailed Analysis Tables
              </Typography>

            {/* Detailed Backdated Entries Table */}
            {backdatedList && backdatedList.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: '#2c3e50',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <WarningIcon sx={{ color: '#e65100', fontSize: 20 }} />
                  Detailed Backdated Entries Analysis
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
                          <TableCell>Document Number</TableCell>
                <TableCell>User</TableCell>
                          <TableCell>Account</TableCell>
                <TableCell>Posting Date</TableCell>
                <TableCell>Document Date</TableCell>
                <TableCell>Days Difference</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell align="center">Risk Level</TableCell>
                          <TableCell align="right">Risk Score</TableCell>
                          <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                        {backdatedList.map((entry, index) => (
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
                                  backgroundColor: '#e65100',
                                  fontSize: '0.875rem',
                                  fontWeight: 600
                                }}>
                                  {entry.document_number?.charAt(0) || 'B'}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 600, 
                                    color: '#2c3e50',
                                    fontSize: '0.875rem'
                                  }}>
                                    {entry.document_number}
                                  </Typography>
                                  <Typography variant="caption" sx={{ 
                                    color: '#6c757d',
                                    fontSize: '0.75rem'
                                  }}>
                                    Entry #{index + 1}
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
                                {entry.user_name}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip 
                                label={`${entry.gl_account} - ${entry.account_name}`}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  borderColor: '#e65100',
                                  color: '#e65100',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                color: '#6c757d',
                                fontSize: '0.875rem'
                              }}>
                                {new Date(entry.posting_date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                color: '#6c757d',
                                fontSize: '0.875rem'
                              }}>
                                {new Date(entry.document_date).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                    <Chip 
                      label={`${entry.days_difference} days`} 
                      size="small"
                                sx={{ 
                                  backgroundColor: Math.abs(entry.days_difference) > 30 ? '#dc3545' : Math.abs(entry.days_difference) > 7 ? '#ffc107' : '#28a745',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 700, 
                                color: '#e65100',
                                fontSize: '0.875rem'
                              }}>
                                {formatCurrency(entry.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Chip 
                                label={entry.risk_level} 
                                size="small"
                                sx={{ 
                                  backgroundColor: getRiskColor(entry.risk_level),
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                    />
                  </TableCell>
                            <TableCell align="right" sx={{ py: 2 }}>
                    <Chip 
                      label={entry.risk_score || 'N/A'} 
                      size="small"
                                sx={{ 
                                  backgroundColor: entry.risk_score > 70 ? '#dc3545' : entry.risk_score > 40 ? '#ffc107' : '#28a745',
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
                                    color: '#e65100',
                                    '&:hover': {
                                      backgroundColor: '#e65100',
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
              </Box>
            )}
          </Box>
        </Grid>

              {/* Section 2: User Analysis */}
        {breakdowns.by_user && (
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
                  color: '#2c3e50',
                  fontSize: '1.25rem'
                }}>
                  User Breakdown Analysis
                </Typography>
                <TableContainer sx={{ 
                  boxShadow: 'none', 
                  background: 'transparent',
                  border: '1px solid #e9ecef',
                  borderRadius: 2
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }}>
                          User Name
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }} align="right">
                          Backdated Entries
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }} align="right">
                          Total Amount
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }} align="right">
                          Risk Score
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {breakdowns.by_user.map((user, index) => (
                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ 
                                width: 32, 
                                height: 32, 
                                mr: 2, 
                                backgroundColor: '#e65100',
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}>
                                {user.user_name?.charAt(0) || 'U'}
                              </Avatar>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: '#2c3e50',
                                fontSize: '0.875rem'
                              }}>
                                {user.user_name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#e65100',
                              fontSize: '0.875rem'
                            }}>
                              {user.transaction_count}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#e65100',
                              fontSize: '0.875rem'
                            }}>
                              {formatCurrency(user.total_amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Chip 
                              label={user.risk_score} 
                              size="small"
                              sx={{ 
                                backgroundColor: getRiskColor(getRiskLevel(user.risk_score)),
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
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Section 3: Account Analysis */}
        {breakdowns.by_account && (
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
                  color: '#2c3e50',
                  fontSize: '1.25rem'
                }}>
                  Account Breakdown Analysis
                </Typography>
                <TableContainer sx={{ 
                  boxShadow: 'none', 
                  background: 'transparent',
                  border: '1px solid #e9ecef',
                  borderRadius: 2
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }}>
                          GL Account
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }} align="right">
                          Backdated Entries
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }} align="right">
                          Total Amount
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }} align="right">
                          Risk Score
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {breakdowns.by_account.map((account, index) => (
                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#2c3e50',
                              fontSize: '0.875rem'
                            }}>
                              {account.account} - {account.account_name}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#e65100',
                              fontSize: '0.875rem'
                            }}>
                              {account.transaction_count}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#e65100',
                              fontSize: '0.875rem'
                            }}>
                              {formatCurrency(account.total_amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Chip 
                              label={account.risk_score} 
                              size="small"
                              sx={{ 
                                backgroundColor: getRiskColor(getRiskLevel(account.risk_score)),
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
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Section 4: Document Analysis */}
        {breakdowns.by_document && (
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
                  color: '#2c3e50',
                  fontSize: '1.25rem'
                }}>
                  Document Breakdown Analysis
                </Typography>
                <TableContainer sx={{ 
                  boxShadow: 'none', 
                  background: 'transparent',
                  border: '1px solid #e9ecef',
                  borderRadius: 2
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }}>
                          Document Number
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }} align="right">
                          Backdated Entries
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }} align="right">
                          Total Amount
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }} align="right">
                          Risk Score
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {breakdowns.by_document.map((doc, index) => (
                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#2c3e50',
                              fontSize: '0.875rem'
                            }}>
                              {doc.document_number}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#e65100',
                              fontSize: '0.875rem'
                            }}>
                              {doc.transaction_count}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#e65100',
                              fontSize: '0.875rem'
                            }}>
                              {formatCurrency(doc.total_amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Chip 
                              label={doc.risk_score} 
                              size="small"
                              sx={{ 
                                backgroundColor: getRiskColor(getRiskLevel(doc.risk_score)),
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
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Section 5: Detailed Insights */}
        {detailedInsights && Object.keys(detailedInsights).length > 0 && (
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
                  color: '#2c3e50',
                  fontSize: '1.25rem'
                }}>
                  Detailed Insights & Recommendations
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Risk Assessment */}
                  {detailedInsights.risk_analysis && (
                    <Grid item size={{xs: 12, md: 6}}>
                      <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: '#2c3e50',
                          fontSize: '1.1rem'
                        }}>
                          Risk Analysis
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Overall Risk Level:</strong> {detailedInsights.risk_analysis?.overall_risk_level}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>High Risk Entries:</strong> {detailedInsights.risk_analysis?.high_risk_entries}
        </Typography>
                        {detailedInsights.risk_analysis?.risk_factors && (
                          <List dense>
                            {detailedInsights.risk_analysis.risk_factors.map((factor, index) => (
                              <ListItem key={index} sx={{ py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                  <WarningIcon sx={{ color: '#e65100', fontSize: 16 }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={factor}
                                  sx={{ 
                                    '& .MuiListItemText-primary': {
                                      fontSize: '0.875rem',
                                      color: '#6c757d'
                                    }
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        )}
                      </Box>
                    </Grid>
                  )}

                  {/* Audit Recommendations */}
                  {detailedInsights.audit_implications && (
                    <Grid item size={{xs: 12, md: 6}}>
                      <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: '#2c3e50',
                          fontSize: '1.1rem'
                        }}>
                          Audit Implications
        </Typography>
                        <List dense>
                          {detailedInsights.audit_implications.map((implication, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <InfoIcon sx={{ color: '#e65100', fontSize: 16 }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={implication.implication}
                                secondary={implication.description}
                                sx={{ 
                                  '& .MuiListItemText-primary': {
                                    fontSize: '0.875rem',
                                    color: '#6c757d'
                                  },
                                  '& .MuiListItemText-secondary': {
                                    fontSize: '0.75rem',
                                    color: '#6c757d'
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
      </Grid>

      {/* Show raw data for debugging if no structured data */}
      {(!backdatedList || backdatedList.length === 0) && 
       (!breakdowns.by_user) && 
       (!breakdowns.by_account) && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          No structured backdated data found. Raw response:
        </Alert>
              )}

      <DuplicateDetailDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        duplicate={selectedBackdated}
      />

      {/* PDF Report Modal */}
      <BackdatedAnalysisPDF
        open={pdfOpen}
        setOpen={setPdfOpen}
        data={data}
        currency={currency}
      />
    </Box>
  );
} 