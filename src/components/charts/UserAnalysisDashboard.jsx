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
import { colorScheme, getRiskColor, formatCurrency } from '../../utils/colorScheme';

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

  // Calculate average risk score based on risk levels (since no numeric scores in new API)
  const riskLevelScores = {
    'LOW': 20,
    'MEDIUM': 50,
    'HIGH': 80,
    'CRITICAL': 95
  };

  const userRiskTrendData = userRiskScores.map((user, index) => ({
    user: user.user,
    riskScore: riskLevelScores[user.risk_level] || 0,
    rank: index + 1
  })).sort((a, b) => b.riskScore - a.riskScore).slice(0, 10);

  // Create user account diversity data from user summary
  const userAccountDiversityData = userSummary
    .map(user => ({
      user: user.user,
      accounts: user.accounts ? user.accounts.length : 0
    }))
    .sort((a, b) => b.accounts - a.accounts)
    .slice(0, 10);

  // Check which charts have meaningful data
  const hasUserAmountsData = userAmountsData.length > 0 && userAmountsData.some(item => item.amount > 0);
  const hasUserActivityData = userActivityData.length > 0 && userActivityData.some(item => item.activity > 0);
  const hasRiskDistributionData = riskDistributionData.length > 0 && riskDistributionData.some(item => item.count > 0);
  const hasAnomalyDistributionData = anomalyDistributionData.length > 0 && anomalyDistributionData.some(item => item.count > 0);
  const hasUserRiskTrendData = userRiskTrendData.length > 0 && userRiskTrendData.some(item => item.riskScore > 0);
  const hasUserAccountData = userAccountDiversityData.length > 0 && userAccountDiversityData.some(item => item.accounts > 0);

  // Calculate summary statistics
  const totalUsers = userSummary.length;
  const totalAmount = userSummary.reduce((sum, user) => sum + (user.total_amount || 0), 0);
  const totalTransactions = userSummary.reduce((sum, user) => sum + (user.transaction_count || 0), 0);
  
  const avgRiskScore = userRiskScores.length > 0 ? 
    userRiskScores.reduce((sum, user) => sum + (riskLevelScores[user.risk_level] || 0), 0) / userRiskScores.length : 0;
  const highRiskUsers = userRiskScores.filter(user => user.risk_level === 'HIGH' || user.risk_level === 'CRITICAL').length;

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
        {/* Show message if no charts have data */}
        {!hasUserAmountsData && !hasUserActivityData && !hasRiskDistributionData && 
         !hasAnomalyDistributionData && !hasUserRiskTrendData && !hasUserAccountData && (
          <Grid item size={{xs: 12}}>
            <Card sx={{ 
              background: 'white', 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e9ecef'
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <InfoIcon sx={{ fontSize: 48, color: '#6c757d', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6c757d', mb: 1 }}>
                  No Chart Data Available
                </Typography>
                <Typography variant="body2" sx={{ color: '#6c757d' }}>
                  There is no sufficient data to display charts at this time.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Chart 1: User Amount Distribution */}
        {hasUserAmountsData && (
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
        )}

        {/* Chart 2: Risk Distribution */}
        {hasRiskDistributionData && (
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
                      <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#925a9b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#925a9b" stopOpacity={0.1}/>
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
                      stroke="#925a9b" 
                      strokeWidth={3}
                      fill="url(#amountGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Chart 3: User Activity Patterns */}
        {hasUserActivityData && (
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
                      labelStyle={{ color: '#2c3e50' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="activity" 
                      stroke="#925a9b" 
                      strokeWidth={3}
                      fill="url(#amountGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Chart 4: Anomaly Distribution */}
        {hasAnomalyDistributionData && (
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
                      <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#925a9b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#925a9b" stopOpacity={0.1}/>
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
                      stroke="#925a9b" 
                      strokeWidth={3}
                      fill="url(#amountGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Chart 5: User Risk Trend */}
        {hasUserRiskTrendData && (
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
                      labelStyle={{ color: '#2c3e50' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="riskScore" 
                      stroke="#925a9b" 
                      strokeWidth={3}
                      fill="url(#amountGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Chart 6: User Account Count */}
        {hasUserAccountData && (
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
                  User Account Count
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userAccountDiversityData}>
                    <defs>
                      <linearGradient id="accountsGradient" x1="0" y1="0" x2="0" y2="1">
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
                      labelStyle={{ color: '#2c3e50' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="accounts" 
                      stroke="#925a9b" 
                      strokeWidth={3}
                      fill="url(#accountsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

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