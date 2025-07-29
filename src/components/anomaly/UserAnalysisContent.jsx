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
  LinearProgress,
  Avatar,
  Badge
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
  Assessment as AssessmentIcon
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

export default function UserAnalysisContent({ data, distributionData, anomalySummary }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Extract currency from data or use default
  const currency = data?.currency || data?.file_info?.currency || 'SAR';



  const handleDrawerOpen = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
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
      case 'high_amount': return <ErrorIcon />;
      case 'unusual_balance': return <WarningIcon />;
      case 'account_concentration': return <InfoIcon />;
      default: return <InfoIcon />;
    }
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

  // Prepare chart data
  const userAmountsData = Object.entries(chartData.user_amounts || {}).map(([user, amount]) => ({
    user,
    amount: parseFloat(amount)
  })).sort((a, b) => b.amount - a.amount);

  const userActivityData = Object.entries(chartData.user_activity || {}).map(([user, activity]) => ({
    user,
    activity: parseInt(activity)
  })).sort((a, b) => b.activity - a.activity);

  const riskDistributionData = Object.entries(chartData.risk_distribution || {}).map(([level, count]) => ({
    level: level.toUpperCase(),
    count: parseInt(count)
  }));

  const anomalyDistributionData = Object.entries(chartData.anomaly_distribution || {}).map(([type, count]) => ({
    type: type.replace('_', ' ').toUpperCase(),
    count: parseInt(count)
  }));

  // Calculate total amounts and risk scores
  const totalAmount = userSummary.reduce((sum, user) => sum + (user.total_amount || 0), 0);
  const totalTransactions = userSummary.reduce((sum, user) => sum + (user.total_transactions || 0), 0);
  const avgRiskScore = userRiskScores.length > 0 ? 
    userRiskScores.reduce((sum, user) => sum + (user.risk_score || 0), 0) / userRiskScores.length : 0;
  const overallRiskLevel = avgRiskScore >= 60 ? 'HIGH' : avgRiskScore >= 40 ? 'MEDIUM' : 'LOW';

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', p: 3 }}>
      {/* Analysis Status */}
      <Alert 
        severity={userAnomalies.length > 0 ? "warning" : "success"} 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={userAnomalies.length > 0 ? <WarningIcon /> : <InfoIcon />}
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
                      {summary.total_users || 0}
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
                      {summary.high_risk_users || 0}
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
                                {userAccount?.total_accounts || 0} accounts
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            {formatCurrency(user.total_amount)}
                          </Typography>
                          <Typography variant="caption" color="#6c757d">
                            Avg: {formatCurrency(user.average_transaction_amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                            {user.total_transactions}
                          </Typography>
                          <Typography variant="caption" color="#6c757d">
                            Debit: {user.transaction_types?.debit_count || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress
                              variant="determinate"
                              value={userRisk?.risk_score || 0}
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
                              {userRisk?.risk_score || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Badge badgeContent={userAnomaly?.anomaly_count || 0} color="error">
                            <Chip 
                              label={userAnomaly?.risk_level || 'N/A'} 
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
                            label={getRiskLevel(userRisk?.risk_score || 0)} 
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
                              account_details: userAccount?.account_details || []
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
    </Box>
  );
} 