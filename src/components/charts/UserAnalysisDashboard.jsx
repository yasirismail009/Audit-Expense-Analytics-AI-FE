import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { getRiskColor } from '../../utils/colorScheme';

  // Import Recharts for custom charts
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

export default function UserAnalysisDashboard({ data }) {
  // Extract data from the API structure
  const userSummary = data?.user_analysis?.user_transaction_summary || [];
  const userAnomalies = data?.anomaly_detection?.user_anomalies || [];
  const userRiskScores = data?.risk_assessment?.user_risk_scores || [];
  const userAccountDistribution = data?.user_analysis?.user_account_distribution || [];
  const chartData = data?.visualizations?.chart_data || {};
  const summary = data?.summary || {};
  const riskDistribution = summary?.risk_distribution || {};
  const anomalyTypes = data?.anomaly_detection?.anomaly_types || {};

  // Extract currency from data or use default
  const currency = data?.currency || data?.file_info?.currency || 'SAR';

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

  // Prepare chart data
  const userAmountsData = Object.entries(chartData.user_amounts || {}).map(([user, amount]) => ({
    user,
    amount: parseFloat(amount)
  })).sort((a, b) => b.amount - a.amount).slice(0, 10);

  const userActivityData = Object.entries(chartData.user_activity || {}).map(([user, activity]) => ({
    user,
    activity: parseInt(activity)
  })).sort((a, b) => b.activity - a.activity).slice(0, 10);

  const riskDistributionData = Object.entries(chartData.risk_distribution || {}).map(([level, count]) => ({
    level: level.toUpperCase(),
    count: parseInt(count)
  }));

  const anomalyDistributionData = Object.entries(chartData.anomaly_distribution || {}).map(([type, count]) => ({
    type: type.replace('_', ' ').toUpperCase(),
    count: parseInt(count)
  }));

  const userRiskTrendData = userRiskScores.map((user, index) => ({
    user: user.user,
    riskScore: user.risk_score || 0,
    rank: index + 1
  })).sort((a, b) => b.riskScore - a.riskScore).slice(0, 10);

  const userAccountDiversityData = userAccountDistribution.map((user, index) => ({
    user: user.user,
    accounts: user.total_accounts || 0,
    transactions: user.total_transactions || 0,
    avgAmount: user.average_transaction_amount || 0
  })).sort((a, b) => b.accounts - a.accounts).slice(0, 10);

  // Calculate summary statistics
  const totalUsers = userSummary.length;
  const totalAmount = userSummary.reduce((sum, user) => sum + (user.total_amount || 0), 0);
  const totalTransactions = userSummary.reduce((sum, user) => sum + (user.total_transactions || 0), 0);
  const avgRiskScore = userRiskScores.length > 0 ? 
    userRiskScores.reduce((sum, user) => sum + (user.risk_score || 0), 0) / userRiskScores.length : 0;
  const highRiskUsers = userRiskScores.filter(user => (user.risk_score || 0) >= 60).length;

  const COLORS = ['#925a9b', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ 
        fontWeight: 600, 
        mb: 3, 
        color: '#2c3e50',
        fontSize: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <AssessmentIcon sx={{ color: '#925a9b' }} />
        User Analysis Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Chart 1: User Amount Distribution */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ 
            background: 'white', 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e9ecef',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600,
                color: '#2c3e50'
              }}>
                <TrendingUpIcon sx={{ mr: 1, color: '#925a9b' }} />
                User Amount Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userAmountsData}>
                  <defs>
                    <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#925a9b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#925a9b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis 
                    dataKey="user" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelStyle={{ color: '#2c3e50' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#925a9b" 
                    strokeWidth={3}
                    fill="url(#amountGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 2: Risk Distribution */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ 
            background: 'white', 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e9ecef',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600,
                color: '#2c3e50'
              }}>
                <SecurityIcon sx={{ mr: 1, color: '#925a9b' }} />
                Risk Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={riskDistributionData}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e91e63" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#e91e63" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis 
                    dataKey="level" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelStyle={{ color: '#2c3e50' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#e91e63" 
                    strokeWidth={3}
                    fill="url(#riskGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 3: User Activity Patterns */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ 
            background: 'white', 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e9ecef',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600,
                color: '#2c3e50'
              }}>
                <PersonIcon sx={{ mr: 1, color: '#925a9b' }} />
                User Activity Patterns
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userActivityData}>
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2196f3" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis 
                    dataKey="user" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelStyle={{ color: '#2c3e50' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activity" 
                    stroke="#2196f3" 
                    strokeWidth={3}
                    fill="url(#activityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 4: Anomaly Distribution */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ 
            background: 'white', 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e9ecef',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600,
                color: '#2c3e50'
              }}>
                <WarningIcon sx={{ mr: 1, color: '#925a9b' }} />
                Anomaly Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={anomalyDistributionData}>
                  <defs>
                    <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff9800" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis 
                    dataKey="type" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelStyle={{ color: '#2c3e50' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#ff9800" 
                    strokeWidth={3}
                    fill="url(#anomalyGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 5: User Risk Trend */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ 
            background: 'white', 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e9ecef',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600,
                color: '#2c3e50'
              }}>
                <ErrorIcon sx={{ mr: 1, color: '#925a9b' }} />
                User Risk Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userRiskTrendData}>
                  <defs>
                    <linearGradient id="riskTrendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d32f2f" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#d32f2f" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis 
                    dataKey="user" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelStyle={{ color: '#2c3e50' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="riskScore" 
                    stroke="#d32f2f" 
                    strokeWidth={3}
                    fill="url(#riskTrendGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 6: User Account Diversity */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ 
            background: 'white', 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e9ecef',
            height: '100%'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600,
                color: '#2c3e50'
              }}>
                <InfoIcon sx={{ mr: 1, color: '#925a9b' }} />
                User Account Diversity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userAccountDiversityData}>
                  <defs>
                    <linearGradient id="accountsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="transactionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2196f3" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                  <XAxis 
                    dataKey="user" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelStyle={{ color: '#2c3e50' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="accounts" 
                    stroke="#4caf50" 
                    strokeWidth={3}
                    fill="url(#accountsGradient)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#2196f3" 
                    strokeWidth={3}
                    fill="url(#transactionsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Consolidated Statistics Card */}
        <Grid item size={{xs: 12}}>
          <Card sx={{ 
            background: 'white', 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #e9ecef'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600,
                color: '#2c3e50'
              }}>
                <AssessmentIcon sx={{ mr: 1, color: '#925a9b' }} />
                Key Statistics Overview
              </Typography>
              
              {/* Main Statistics */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item size={{xs: 4, sm: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <PersonIcon sx={{ 
                      color: '#925a9b', 
                      fontSize: 32, 
                      mb: 1 
                    }} />
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5
                    }}>
                      {totalUsers}
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
                  <Box sx={{ textAlign: 'center' }}>
                    <ErrorIcon sx={{ 
                      color: '#e91e63', 
                      fontSize: 32, 
                      mb: 1 
                    }} />
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5
                    }}>
                      {highRiskUsers}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.875rem'
                    }}>
                      High Risk Users
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, sm: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ 
                      color: '#2196f3', 
                      fontSize: 32, 
                      mb: 1 
                    }} />
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5
                    }}>
                      {totalTransactions}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.875rem'
                    }}>
                      Total Transactions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, sm: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <AssessmentIcon sx={{ 
                      color: '#4caf50', 
                      fontSize: 32, 
                      mb: 1 
                    }} />
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: '#2c3e50',
                      mb: 0.5
                    }}>
                      {Math.round(avgRiskScore)}%
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.875rem'
                    }}>
                      Average Risk Score
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Risk Level Breakdown */}
              <Typography variant="h6" sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center',
                fontWeight: 600,
                color: '#2c3e50'
              }}>
                <SecurityIcon sx={{ mr: 1, color: '#925a9b' }} />
                Risk Level Breakdown
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(riskDistribution).map(([level, count], index) => (
                  <Grid item size={{xs: 6, sm: 3}} key={level}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      borderRadius: 2,
                      border: `1px solid ${getRiskColor(level.toUpperCase())}40`,
                      backgroundColor: `${getRiskColor(level.toUpperCase())}08`,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: `${getRiskColor(level.toUpperCase())}12`,
                        transform: 'translateY(-1px)'
                      }
                    }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        mb: 0.5,
                        color: getRiskColor(level.toUpperCase())
                      }}>
                        {count}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#2c3e50', 
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        fontSize: '0.75rem'
                      }}>
                        {level} Risk
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 