import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Divider,
  LinearProgress
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
  Receipt,
  List as ListIcon
} from '@mui/icons-material';
import { colorScheme, getRiskColor } from '../utils/colorScheme';
import DetailedRiskAnalysis from './DetailedRiskAnalysis';

export default function ListingDashboard({ sheetData }) {
  
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
  const flaggedExpenses = sheetData.flagged_expenses;
  const glChartsData = sheetData.glChartsData;

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
  const overallRiskScore = Math.round(sheetData?.analysis_summary?.overall_fraud_score || 0);
  const riskLevel = sheetData?.analysis_summary?.risk_level || 
                   (overallRiskScore >= 80 ? 'CRITICAL' : 
                   overallRiskScore >= 60 ? 'HIGH' : 
                   overallRiskScore >= 40 ? 'MEDIUM' : 'LOW');

  return (
    <Box sx={{ minHeight: '100vh', background: colorScheme.background, p: 3 }}>
      {/* Header */}
      <Card sx={{ 
        mb: 4, 
        background: colorScheme.cardBackground, 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ListIcon sx={{ 
              color: colorScheme.primary, 
              fontSize: 32, 
              mr: 2 
            }} />
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              color: colorScheme.textPrimary,
              fontSize: '1.75rem'
            }}>
              {fileInfo?.fileName || 'Data Listing'}
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colorScheme.textPrimary }}>
                  {statistics?.totalTransactions || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
                  Total Transactions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colorScheme.textPrimary }}>
                  {formatCurrency(statistics?.totalAmount || 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
                  Total Amount
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colorScheme.textPrimary }}>
                  {statistics?.flaggedTransactions || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
                  Flagged Transactions
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip 
                  label={riskLevel} 
                  sx={{ 
                    backgroundColor: getRiskColor(riskLevel),
                    color: 'white',
                    fontWeight: 600
                  }} 
                />
                <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mt: 1 }}>
                  Risk Level
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* GL Accounts Table */}
      <Card sx={{ 
        mb: 4, 
        background: colorScheme.cardBackground, 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AccountBalance sx={{ 
              color: colorScheme.primary, 
              fontSize: 24, 
              mr: 2 
            }} />
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: colorScheme.textPrimary,
              fontSize: '1.3rem'
            }}>
              General Ledger Accounts
            </Typography>
          </Box>
          
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: colorScheme.primary + '10' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Account ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Transaction Count</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Average Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Risk Level</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Risk Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(glChartsData?.topAccountsByAmount || []).map((account, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{account.accountId}</TableCell>
                    <TableCell>{account.transactionCount}</TableCell>
                    <TableCell>{formatCurrency(account.totalAmount)}</TableCell>
                    <TableCell>{formatCurrency(account.totalAmount / (account.transactionCount || 1))}</TableCell>
                    <TableCell>
                      <Chip 
                        label={account.riskLevel} 
                        size="small"
                        sx={{ 
                          backgroundColor: getRiskColor(account.riskLevel),
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={account.avgRiskScore} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              backgroundColor: '#f0f0f0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getRiskColor(account.riskLevel),
                                borderRadius: 3
                              }
                            }} 
                          />
                        </Box>
                        <Typography variant="body2" sx={{ minWidth: 35 }}>
                          {Math.round(account.avgRiskScore)}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Flagged Expenses Table */}
      <Card sx={{ 
        mb: 4, 
        background: colorScheme.cardBackground, 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Warning sx={{ 
              color: colorScheme.primary, 
              fontSize: 24, 
              mr: 2 
            }} />
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: colorScheme.textPrimary,
              fontSize: '1.3rem'
            }}>
              Flagged Expenses
            </Typography>
          </Box>
          
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: colorScheme.primary + '10' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Document</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Risk Level</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(flaggedExpenses || []).slice(0, 20).map((expense, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: colorScheme.primary }}>
                          {expense.employee?.charAt(0) || 'U'}
                        </Avatar>
                        {expense.employee}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.document_number}</TableCell>
                    <TableCell>
                      <Chip 
                        label={expense.risk_level} 
                        size="small"
                        sx={{ 
                          backgroundColor: getRiskColor(expense.risk_level),
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={expense.status} 
                        size="small"
                        sx={{ 
                          backgroundColor: expense.status === 'Pending' ? '#ff9800' : '#4caf50',
                          color: 'white',
                          fontWeight: 600
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

      {/* Risk Distribution Summary */}
      <Card sx={{ 
        mb: 4, 
        background: colorScheme.cardBackground, 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Security sx={{ 
              color: colorScheme.primary, 
              fontSize: 24, 
              mr: 2 
            }} />
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: colorScheme.textPrimary,
              fontSize: '1.3rem'
            }}>
              Risk Distribution Summary
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {(anomaliesStats?.riskDistribution || []).map((risk, index) => (
              <Grid item xs={12} md={3} key={index}>
                <Card sx={{ 
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderRadius: 2,
                  border: `1px solid ${colorScheme.border}`
                }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Chip 
                      label={risk.risk_level} 
                      sx={{ 
                        backgroundColor: getRiskColor(risk.risk_level),
                        color: 'white',
                        fontWeight: 600,
                        mb: 2
                      }} 
                    />
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: colorScheme.textPrimary,
                      mb: 1
                    }}>
                      {risk.count}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
                      {risk.percentage.toFixed(1)}% of total
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Detailed Risk Analysis */}
      {sheetData?.detailed_risk_analysis && (
        <DetailedRiskAnalysis riskAnalysis={sheetData.detailed_risk_analysis} />
      )}

      {/* File Information */}
      <Card sx={{ 
        background: colorScheme.cardBackground, 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Receipt sx={{ 
              color: colorScheme.primary, 
              fontSize: 24, 
              mr: 2 
            }} />
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: colorScheme.textPrimary,
              fontSize: '1.3rem'
            }}>
              File Information
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
                  File Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {fileInfo?.fileName || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
                  Upload Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatDate(fileInfo?.uploadedAt)}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
                  Status
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {fileInfo?.status || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
                  Total Records
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {fileInfo?.totalRecords || 0}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
                  Processed Records
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {fileInfo?.processedRecords || 0}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
                  Currency
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {statistics?.currency || 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
} 