import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  LinearProgress,
  Avatar,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  Warning, 
  CheckCircle, 
  Error,
  AccountBalance,
  People,
  AttachMoney,
  Assessment,
  Timeline,
  PieChart,
  BarChart,
  Security,
  Analytics,
  Business,
  Receipt
} from '@mui/icons-material';
import { colorScheme, getRiskColor } from '../utils/colorScheme';

// Import chart widgets
import RiskDistributionChart from './charts/RiskDistributionChart';
import AnomaliesDistributionChart from './charts/AnomaliesDistributionChart';
import EmployeeExpensesChart from './charts/EmployeeExpensesChart';
import MonthlyTrendChart from './charts/MonthlyTrendChart';
import AmountDistributionChart from './charts/AmountDistributionChart';
import CategoryExpensesChart from './charts/CategoryExpensesChart';
import DepartmentExpensesChart from './charts/DepartmentExpensesChart';

// Import analysis components
import AnomalyAnalysisAccordion from './AnomalyAnalysisAccordion';

export default function ExpenseAnalysisDashboard({ sheetData }) {
  if (!sheetData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          No data available
        </Typography>
      </Box>
    );
  }

  // Map the data structure to match the actual data format
  const fileInfo = sheetData.fileInfo;
  const statistics = sheetData.statistics;
  const glSummary = sheetData.glSummary;
  const anomaliesStats = sheetData.anomaliesStats;
  const anomaliesAccordion = sheetData.anomaliesAccordion;
  const riskDistribution = sheetData.anomaliesStats?.riskDistribution;
  const chartsData = sheetData.chartsData;
  const glChartsData = sheetData.glChartsData;
  const analysisSessionsSummary = sheetData.analysisSessionsSummary;

  // Additional data mappings for backward compatibility
  const chartData = sheetData.chart_data;
  const analysisSummary = sheetData.analysis_summary;
  const flaggedExpenses = sheetData.flagged_expenses;
  const anomaliesData = sheetData.anomalies_data;
  const advancedMetrics = sheetData.advanced_metrics;

  // Helper function to format currency
  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    
    if (num >= 1000000000000) {
      return `${(num / 1000000000000).toFixed(1)}T SAR`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M SAR`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K SAR`;
    } else {
      return `${num.toFixed(0)} SAR`;
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Calculate overall risk score
  const overallRiskScore = Math.round(statistics?.flagRate || 0);
  const riskLevel = (statistics?.flagRate || 0) >= 80 ? 'CRITICAL' : 
                   (statistics?.flagRate || 0) >= 60 ? 'HIGH' : 
                   (statistics?.flagRate || 0) >= 40 ? 'MEDIUM' : 'LOW';

  return (
    <Box sx={{ minHeight: '100vh', background: colorScheme.background, p: 3 }}>
      {/* Top Summary Banner */}
      <Card sx={{ 
        mb: 4, 
        background: colorScheme.cardBackground, 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'visible'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4} alignItems="center">
            {/* Left Section - File Information */}
            <Grid item size={{xs: 12, md: 6}}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: colorScheme.textPrimary, 
                mb: 1,
                fontSize: '1.75rem'
              }}>
                {fileInfo?.fileName || 'Data Analysis'}
              </Typography>
              <Typography variant="body1" sx={{ color: colorScheme.textSecondary, mb: 0.5 }}>
                Uploaded: {formatDate(fileInfo?.uploadedAt)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#888' }}>
                Status: {fileInfo?.status || 'COMPLETED'} • Records: {fileInfo?.totalRecords || 0}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', width:'fit-content', marginTop: '10px', gap: '10px'   }}>
                  <Box sx={{ 
                    width: 120,
                     
                    height: 120, 
                    borderRadius: '50%', 
                    background: `linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.primary}dd 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    position: 'relative',
                    boxShadow: `0 8px 32px ${colorScheme.primary}4d`
                  }}>
                    <Typography variant="h2" sx={{ 
                      fontWeight: 800, 
                      color: 'white',
                      fontSize: '2.2rem'
                    }}>
                      {overallRiskScore}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width:'fit-content', marginTop: '10px'   }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 1, 
                    color: colorScheme.textPrimary,
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
                    <Grid item size={{xs: 3, md: 3}}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Timeline sx={{ 
                          color: colorScheme.primary, 
                          fontSize: 24, 
                          mb: 0.5 
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: colorScheme.textPrimary,
                          mb: 0.5,
                          fontSize: '1.1rem'
                        }}>
                          {statistics?.totalTransactions || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.8rem'
                        }}>
                          Transactions
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item size={{xs: 3, md: 3}}>
                      <Box sx={{ textAlign: 'center' }}>
                        <AttachMoney sx={{ 
                          color: colorScheme.primary, 
                          fontSize: 24, 
                          mb: 0.5 
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: colorScheme.textPrimary,
                          mb: 0.5,
                          fontSize: '1.1rem'
                        }}>
                          {formatCurrency(statistics?.totalAmount)}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.8rem'
                        }}>
                          Total Amount
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item size={{xs: 3, md: 3}}>
                      <Box sx={{ textAlign: 'center' }}>
                        <People sx={{ 
                          color: colorScheme.primary, 
                          fontSize: 24, 
                          mb: 0.5 
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: colorScheme.textPrimary,
                          mb: 0.5,
                          fontSize: '1.1rem'
                        }}>
                          {statistics?.uniqueUsers || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.8rem'
                        }}>
                          Users
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item size={{xs: 3, md: 3}}>
                      <Box sx={{ textAlign: 'center' }}>
                        <AccountBalance sx={{ 
                          color: colorScheme.primary, 
                          fontSize: 24, 
                          mb: 0.5 
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: colorScheme.textPrimary,
                          mb: 0.5,
                          fontSize: '1.1rem'
                        }}>
                          {statistics?.uniqueAccounts || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.8rem'
                        }}>
                          Unique Accounts
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item size={{xs: 3, md: 3}}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Security sx={{ 
                          color: colorScheme.primary, 
                          fontSize: 24, 
                          mb: 0.5 
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: colorScheme.textPrimary,
                          mb: 0.5,
                          fontSize: '1.1rem'
                        }}>
                          {statistics?.flaggedTransactions || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.8rem'
                        }}>
                          Flagged Transactions
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item size={{xs: 3, md: 3}}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Business sx={{ 
                          color: colorScheme.primary, 
                          fontSize: 24, 
                          mb: 0.5 
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: colorScheme.textPrimary,
                          mb: 0.5,
                          fontSize: '1.1rem'
                        }}>
                          {statistics?.uniqueProfitCenters || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.8rem'
                        }}>
                          Profit Centers
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item size={{xs: 3, md: 3}}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Receipt sx={{ 
                          color: colorScheme.primary, 
                          fontSize: 24, 
                          mb: 0.5 
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: colorScheme.textPrimary,
                          mb: 0.5,
                          fontSize: '1.1rem'
                        }}>
                          {formatCurrency(statistics?.avgAmount || 0)}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
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

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Risk Distribution */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            background: colorScheme.cardBackground,
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: colorScheme.textPrimary,
                fontSize: '1.1rem'
              }}>
                Risk Distribution
              </Typography>
              <Box sx={{ mb: 3 }}>
                {(riskDistribution || []).map((risk, index) => (
                  <Box key={index} sx={{ mb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Warning sx={{ 
                        color: "#925A9B", 
                        fontSize: 20,
                        mr: 1.5 
                      }} />
                      <Typography variant="body1" sx={{ 
                        flex: 1, 
                        fontWeight: 600,
                        color: colorScheme.textPrimary,
                        fontSize: '0.9rem'
                      }}>
                        {risk.risk_level}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 600, 
                        color: "#925A9B",
                        fontSize: '0.9rem'
                      }}>
                        {risk.count} ({risk.percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={risk.percentage} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: "#b18db7",
                          borderRadius: 3
                        }
                      }} 
                    />
                  </Box>
                ))}
              </Box>
              <Box sx={{ 
                width: '100%',
                background: '#f8f9fa', 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginTop: '20px' 
              }}>
                <RiskDistributionChart data={chartsData?.riskDistribution || chartData?.risk_distribution} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Anomaly Summary */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            background: colorScheme.cardBackground,
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: colorScheme.textPrimary,
                fontSize: '1.1rem'
              }}>
                Anomaly Summary
              </Typography>
              <Box sx={{ mb: 3 }}>
                {[
                  { 
                    label: 'Duplicate Entries', 
                    value: anomaliesAccordion?.duplicateEntries || anomaliesData?.anomaly_summary?.duplicate_entries || 0, 
                    icon: <Error sx={{ color: colorScheme.primary }} />,
                    color: colorScheme.primary
                  },
                  { 
                    label: 'User Anomalies', 
                    value: anomaliesAccordion?.userAnomalies || anomaliesData?.anomaly_summary?.user_anomalies || 0, 
                    icon: <People sx={{ color: colorScheme.primary }} />,
                    color: colorScheme.primary
                  },
                  { 
                    label: 'Backdated Entries', 
                    value: anomaliesAccordion?.backdatedEntries || anomaliesData?.anomaly_summary?.backdated_entries || 0, 
                    icon: <Timeline sx={{ color: colorScheme.primary }} />,
                    color: colorScheme.primary
                  },
                  { 
                    label: 'Closing Entries', 
                    value: anomaliesAccordion?.closingEntries || anomaliesData?.anomaly_summary?.closing_entries || 0, 
                    icon: <CheckCircle sx={{ color: colorScheme.primary }} />,
                    color: colorScheme.primary
                  },
                  { 
                    label: 'Unusual Days', 
                    value: anomaliesAccordion?.unusualDays || anomaliesData?.anomaly_summary?.unusual_days || 0, 
                    icon: <Warning sx={{ color: colorScheme.primary }} />,
                    color: colorScheme.primary
                  },
                  { 
                    label: 'Holiday Entries', 
                    value: anomaliesAccordion?.holidayEntries || anomaliesData?.anomaly_summary?.holiday_entries || 0, 
                    icon: <Assessment sx={{ color: colorScheme.primary }} />,
                    color: colorScheme.primary
                  }
                ].map((item, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ mr: 1.5 }}>
                        {item.icon}
                      </Box>
                      <Typography variant="body1" sx={{ 
                        flex: 1, 
                        fontWeight: 600,
                        color: colorScheme.textPrimary,
                        fontSize: '0.9rem'
                      }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 600, 
                        color: item.color,
                        fontSize: '0.9rem'
                      }}>
                        {item.value}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((item.value / (anomaliesAccordion?.totalAnomalies || anomaliesData?.anomaly_summary?.total_anomalies || 1)) * 100, 100)} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: "#b18db7",
                          borderRadius: 3
                        }
                      }} 
                    />
                  </Box>
                ))}
              </Box>
              <Box sx={{ 
                 width: '100%',
                background: '#f8f9fa', 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <AnomaliesDistributionChart data={chartsData?.anomalyBreakdown || chartData?.anomaly_breakdown} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Users by Amount */}
        <Grid item size={{xs: 12, md: 12}}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            background: colorScheme.cardBackground,
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: colorScheme.textPrimary,
                fontSize: '1.1rem'
              }}>
                Top Users by Amount
              </Typography>
              <TableContainer component={Paper} sx={{ 
                boxShadow: 'none', 
                mb: 3,
                background: 'transparent'
              }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }}>
                        User
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }} align="right">
                        Amount
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }} align="right">
                        Transactions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(chartsData?.topUsersByAmount || chartData?.employee_expenses?.data || []).slice(0, 5).map((user, index) => (
                      <TableRow key={index} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ border: 'none', py: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              mr: 2, 
                              backgroundColor: colorScheme.primary,
                              fontSize: '0.875rem',
                              fontWeight: 600
                            }}>
                              {user.userName?.charAt(0) || user.user_name?.charAt(0) || user?.charAt(0) || 'U'}
                            </Avatar>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: colorScheme.textPrimary,
                              fontSize: '0.875rem'
                            }}>
                              {user.userName || user.user_name || user || 'Unknown User'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ border: 'none', py: 1 }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600, 
                            color: colorScheme.primary,
                            fontSize: '0.875rem'
                          }}>
                            {formatCurrency(user.totalAmount || user)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ border: 'none', py: 1 }}>
                          <Typography variant="body2" sx={{ 
                            color: colorScheme.textSecondary,
                            fontSize: '0.875rem'
                          }}>
                            {user.transactionCount || 1}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ 
                width: '100%',
                background: '#f8f9fa', 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <EmployeeExpensesChart data={chartsData?.employeeExpenses || chartData?.employee_expenses} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top GL Accounts */}
        <Grid item size={{xs: 12, md: 12}}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            background: colorScheme.cardBackground
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: colorScheme.textPrimary,
                fontSize: '1.1rem'
              }}>
                  Top GL Accounts
                </Typography>
                
                {/* GL Account Summary */}
                {glSummary?.summaryStatistics && (
                <Box sx={{ 
                  mb: 3, 
                  p: 3, 
                  background: '#f8f9fa', 
                  borderRadius: 3,
                  border: `1px solid ${colorScheme.border}`
                }}>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 600, 
                    mb: 2, 
                    color: colorScheme.textPrimary,
                    fontSize: '1rem'
                  }}>
                      GL Account Summary Statistics
                    </Typography>
                  <Grid container spacing={3}>
                      <Grid item size={{xs: 12, md: 6}}>
                      <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1, fontSize: '0.875rem' }}>
                          <strong>Total Accounts:</strong> {glSummary.summaryStatistics.totalAccounts}
                        </Typography>
                      <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1, fontSize: '0.875rem' }}>
                          <strong>Total Trial Balance:</strong> {formatCurrency(glSummary.summaryStatistics.totalTrialBalance)}
                        </Typography>
                      <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1, fontSize: '0.875rem' }}>
                          <strong>Total Trading Equity:</strong> {formatCurrency(glSummary.summaryStatistics.totalTradingEquity)}
                        </Typography>
                      </Grid>
                      <Grid item size={{xs: 12, md: 6}}>
                      <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1, fontSize: '0.875rem' }}>
                          <strong>Total Debits:</strong> {formatCurrency(glSummary.summaryStatistics.totalDebits)}
                        </Typography>
                      <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1, fontSize: '0.875rem' }}>
                          <strong>Total Credits:</strong> {formatCurrency(glSummary.summaryStatistics.totalCredits)}
                        </Typography>
                      <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1, fontSize: '0.875rem' }}>
                          <strong>Currency:</strong> {glSummary.summaryStatistics.currency}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                
              <TableContainer component={Paper} sx={{ 
                boxShadow: 'none', 
                mb: 3,
                background: 'transparent'
              }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }}>
                        Account
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }} align="right">
                        Amount
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }} align="right">
                        Transactions
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }} align="right">
                        Trial Balance
                      </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(glChartsData?.topAccountsByAmount || []).map((account, index) => (
                      <TableRow key={index} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ border: 'none', py: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ 
                                width: 32, 
                                height: 32, 
                                mr: 2, 
                              backgroundColor: colorScheme.primary,
                              fontSize: '0.75rem',
                              fontWeight: 600
                              }}>
                                {account.accountId?.slice(-2) || 'AC'}
                              </Avatar>
                              <Box>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: colorScheme.textPrimary,
                                fontSize: '0.875rem'
                              }}>
                                  Account {account.accountId}
                                </Typography>
                              <Typography variant="caption" sx={{ 
                                color: colorScheme.textSecondary,
                                fontSize: '0.75rem'
                              }}>
                                  {account.accountType || 'Unknown Type'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        <TableCell align="right" sx={{ border: 'none', py: 1 }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600, 
                            color: colorScheme.primary,
                            fontSize: '0.875rem'
                          }}>
                              {formatCurrency(account.totalAmount)}
                            </Typography>
                          </TableCell>
                        <TableCell align="right" sx={{ border: 'none', py: 1 }}>
                          <Typography variant="body2" sx={{ 
                            color: colorScheme.textSecondary,
                            fontSize: '0.875rem'
                          }}>
                              {account.transactionCount}
                            </Typography>
                          </TableCell>
                        <TableCell align="right" sx={{ border: 'none', py: 1 }}>
                          <Typography variant="body2" sx={{ 
                            color: colorScheme.primary, 
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>
                              {formatCurrency(account.trialBalance)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
              {/* Chart component */}
              <Box sx={{ 
                width: '100%', 
                background: '#f8f9fa', 
                borderRadius: 3, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: `1px solid ${colorScheme.border}`
              }}>
                <CategoryExpensesChart data={chartsData?.categoryExpenses || chartData?.category_expenses} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart Cards */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            background: colorScheme.cardBackground
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: colorScheme.textPrimary,
                fontSize: '1.1rem'
              }}>
                Monthly Trend Analysis
                    </Typography>
              <Box sx={{ height: 300 }}>
                <MonthlyTrendChart data={chartsData?.monthlyTrend || chartData?.monthly_trend} />
                  </Box>
              </CardContent>
            </Card>
          </Grid>

        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            background: colorScheme.cardBackground
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: colorScheme.textPrimary,
                fontSize: '1.1rem'
              }}>
                Amount Distribution
                </Typography>
              <Box sx={{ height: 300 }}>
                <AmountDistributionChart data={chartsData?.amountDistribution || chartData?.amount_distribution} />
              </Box>
            </CardContent>
          </Card>
                  </Grid>

        <Grid item size={{xs: 12, md: 12}}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            background: colorScheme.cardBackground
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: colorScheme.textPrimary,
                fontSize: '1.1rem'
              }}>
                Department Expenses
              </Typography>
              <Box sx={{width: '100%' }}>
                <DepartmentExpensesChart data={chartsData?.departmentExpenses || chartData?.department_expenses} />
              </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Anomaly Analysis Accordion */}
        <Grid item size={{xs: 12, md: 12}}>
            <AnomalyAnalysisAccordion sheetData={sheetData} />
          </Grid>
        </Grid>
    </Box>
  );
} 