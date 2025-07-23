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
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import DuplicateAnalysisDashboard from '../charts/DuplicateAnalysisDashboard';
import ColorCodedDuplicateList from './shared/ColorCodedDuplicateList';
import DuplicateDetailDrawer from '../FlaggedExpenseDrawer';
import { getRiskColor } from '../../utils/colorScheme';

// Import chart components
import DuplicateTypeChart from '../charts/DuplicateTypeChart';
import DuplicateRiskChart from '../charts/DuplicateRiskChart';
import DuplicateUserChart from '../charts/DuplicateUserChart';
import DuplicateAmountChart from '../charts/DuplicateAmountChart';

export default function DuplicateAnalysisContent({ data, distributionData, anomalySummary }) {
  const [expandedTransactions, setExpandedTransactions] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDuplicate, setSelectedDuplicate] = useState(null);

  // Extract currency from data or use default
  const currency = data?.currency || data?.file_info?.currency || 'SAR';

  const handleTransactionRowToggle = (duplicateIndex) => {
    setExpandedTransactions(prev => ({
      ...prev,
      [duplicateIndex]: !prev[duplicateIndex]
    }));
  };

  const handleDrawerOpen = (duplicate) => {
    setSelectedDuplicate(duplicate);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedDuplicate(null);
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
  const duplicateList = data?.duplicate_list || [];
  const chartData = data?.chart_data || {};
  const breakdowns = data?.breakdowns || {};
  const detailedInsights = data?.detailed_insights || {};
  const fileInfo = data?.file_info || {};

  // Calculate overall risk score based on new data structure
  const totalDuplicates = analysisInfo.total_duplicate_groups || 0;
  const totalTransactions = analysisInfo.total_transactions || 0;
  const overallRiskScore = totalTransactions > 0 ? Math.round((totalDuplicates / totalTransactions) * 100) : 0;
  const riskLevel = getRiskLevel(overallRiskScore);

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', p: 3 }}>
      {/* Analysis Status */}
      <Alert 
        severity={totalDuplicates > 0 ? "warning" : "success"} 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={totalDuplicates > 0 ? <WarningIcon /> : <InfoIcon />}
      >
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {totalDuplicates > 0 
            ? `Found ${totalDuplicates} duplicate groups involving ${analysisInfo.total_duplicate_transactions || 0} transactions`
            : "No duplicate transactions found"
          }
        </Typography>
        {totalDuplicates > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Total amount involved: {formatCurrency(analysisInfo.total_amount_involved || 0)}
          </Typography>
        )}
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
            {/* Left Section - File Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#2c3e50', 
                mb: 1,
                fontSize: '1.75rem'
              }}>
                Duplicate Analysis
              </Typography>
              <Typography variant="body1" sx={{ color: '#6c757d', mb: 0.5 }}>
                Analysis Date: {new Date(analysisInfo.analysis_date || Date.now()).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                Status: {fileInfo.status || 'COMPLETED'} • Duplicates: {totalDuplicates}
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
                      {totalDuplicates}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Total Duplicates
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
                      {formatCurrency(analysisInfo.total_amount_involved || 0)}
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
                      {analysisInfo.total_duplicate_transactions || 0}
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
                      {Object.keys(breakdowns.duplicate_flags || {}).length}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Duplicate Types
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
                      {Object.keys(breakdowns.user_breakdown || {}).length}
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
                      {Object.keys(breakdowns.fs_line_breakdown || {}).length}
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
                      {formatCurrency((analysisInfo.total_amount_involved || 0) / (analysisInfo.total_duplicate_transactions || 1))}
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
      <DuplicateAnalysisDashboard data={data} />

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

              {/* Color-Coded Lists */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: '#2c3e50',
                  fontSize: '1.1rem'
                }}>
                  Color-Coded Duplicate Lists
                </Typography>
                <ColorCodedDuplicateList data={data} currency={currency} />
              </Box>

              {/* Type Breakdown Table */}
              {breakdowns.duplicate_flags && (
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
                    <TrendingUpIcon sx={{ color: '#925a9b', fontSize: 20 }} />
                    Type Breakdown Analysis
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
                            <TableCell>Duplicate Type</TableCell>
                            <TableCell align="right">Count</TableCell>
                            <TableCell align="right">Total Transactions</TableCell>
                            <TableCell align="right">Total Amount</TableCell>
                            <TableCell align="center">Risk Level</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(breakdowns.duplicate_flags).map(([type, details], index) => (
                            <TableRow 
                              key={type} 
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
                                    backgroundColor: '#925a9b',
                                    fontSize: '0.875rem',
                                    fontWeight: 600
                                  }}>
                                    {type.charAt(0)}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 600, 
                                      color: '#2c3e50',
                                      fontSize: '0.875rem'
                                    }}>
                                      {type}
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      color: '#6c757d',
                                      fontSize: '0.75rem'
                                    }}>
                                      Duplicate Type {index + 1}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell align="right" sx={{ py: 2 }}>
                                <Chip 
                                  label={details.count}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: '#925a9b',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ 
                                  color: '#6c757d',
                                  fontSize: '0.875rem',
                                  fontWeight: 500
                                }}>
                                  {details.transactions}
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 700, 
                                  color: '#925a9b',
                                  fontSize: '0.875rem'
                                }}>
                                  {formatCurrency(details.amount)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ py: 2 }}>
                                <Chip 
                                  label="MEDIUM"
                                  size="small"
                                  sx={{ 
                                    backgroundColor: getRiskColor('MEDIUM'),
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

              {/* Detailed Duplicates Table */}
              {duplicateList && duplicateList.length > 0 && (
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
                    <WarningIcon sx={{ color: '#925a9b', fontSize: 20 }} />
                    Detailed Duplicates Analysis
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
                            <TableCell>Type</TableCell>
                            <TableCell>GL Account</TableCell>
                            <TableCell>User</TableCell>
                            <TableCell>Posting Date</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="right">Risk Score</TableCell>
                            <TableCell align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {duplicateList.map((duplicate, index) => (
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
                                    backgroundColor: '#925a9b',
                                    fontSize: '0.875rem',
                                    fontWeight: 600
                                  }}>
                                    {duplicate.duplicate_type?.charAt(0) || 'D'}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 600, 
                                      color: '#2c3e50',
                                      fontSize: '0.875rem'
                                    }}>
                                      {duplicate.duplicate_type}
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      color: '#6c757d',
                                      fontSize: '0.75rem'
                                    }}>
                                      Duplicate #{index + 1}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Chip 
                                  label={duplicate.gl_account}
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
                                <Typography variant="body2" sx={{ 
                                  color: '#6c757d',
                                  fontSize: '0.875rem',
                                  fontWeight: 500
                                }}>
                                  {duplicate.user_name}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ 
                                  color: '#6c757d',
                                  fontSize: '0.875rem'
                                }}>
                                  {new Date(duplicate.posting_date).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 700, 
                                  color: '#925a9b',
                                  fontSize: '0.875rem'
                                }}>
                                  {formatCurrency(duplicate.amount)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ py: 2 }}>
                                <Chip 
                                  label={duplicate.risk_score || 'N/A'} 
                                  size="small"
                                  sx={{ 
                                    backgroundColor: getRiskColor(getRiskLevel(duplicate.risk_score || 0)),
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
                                    onClick={() => handleDrawerOpen(duplicate)}
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
                </Box>
              )}
           
            
          </Box>
        </Grid>

        {/* Section 2: User Analysis */}
        {breakdowns.user_breakdown && (
          <Grid item xs={12}>
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
                          Duplicate Groups
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }} align="right">
                          Transactions
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
                          Unique Accounts
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(breakdowns.user_breakdown).map(([userName, userData], index) => (
                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ 
                                width: 32, 
                                height: 32, 
                                mr: 2, 
                                backgroundColor: '#925a9b',
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}>
                                {userName?.charAt(0) || 'U'}
                              </Avatar>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: '#2c3e50',
                                fontSize: '0.875rem'
                              }}>
                                {userName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#925a9b',
                              fontSize: '0.875rem'
                            }}>
                              {userData.duplicate_groups}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#925a9b',
                              fontSize: '0.875rem'
                            }}>
                              {userData.transactions}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#925a9b',
                              fontSize: '0.875rem'
                            }}>
                              {formatCurrency(userData.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              color: '#6c757d',
                              fontSize: '0.875rem'
                            }}>
                              {userData.unique_accounts}
                            </Typography>
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

        {/* Section 3: GL Account Analysis */}
        {breakdowns.fs_line_breakdown && (
          <Grid item xs={12}>
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
                  Financial Statement Line Breakdown
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
                          Duplicate Groups
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }} align="right">
                          Transactions
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
                          Debit Amount
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }} align="right">
                          Credit Amount
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(breakdowns.fs_line_breakdown).map(([account, accountData], index) => (
                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#2c3e50',
                              fontSize: '0.875rem'
                            }}>
                              {account}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#925a9b',
                              fontSize: '0.875rem'
                            }}>
                              {accountData.duplicate_groups}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#925a9b',
                              fontSize: '0.875rem'
                            }}>
                              {accountData.transactions}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#925a9b',
                              fontSize: '0.875rem'
                            }}>
                              {formatCurrency(accountData.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              color: '#6c757d',
                              fontSize: '0.875rem'
                            }}>
                              {formatCurrency(accountData.debit_amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              color: '#6c757d',
                              fontSize: '0.875rem'
                            }}>
                              {formatCurrency(accountData.credit_amount)}
                            </Typography>
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

        {/* Section 4: Risk Analysis */}
        {breakdowns.risk_breakdown && (
          <Grid item xs={12}>
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
                  Risk Level Breakdown
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
                          Risk Level
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }} align="right">
                          Groups
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }} align="right">
                          Transactions
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }} align="right">
                          Total Amount
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(breakdowns.risk_breakdown).map(([riskLevel, riskData], index) => (
                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Chip 
                                label={riskLevel}
                                size="small"
                                sx={{ 
                                  backgroundColor: getRiskColor(riskLevel),
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#925a9b',
                              fontSize: '0.875rem'
                            }}>
                              {riskData.groups}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#925a9b',
                              fontSize: '0.875rem'
                            }}>
                              {riskData.transactions}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#925a9b',
                              fontSize: '0.875rem'
                            }}>
                              {formatCurrency(riskData.amount)}
                            </Typography>
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
          <Grid item xs={12}>
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
                  {detailedInsights.risk_assessment && (
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: '#2c3e50',
                          fontSize: '1.1rem'
                        }}>
                          Risk Assessment
                        </Typography>
                        {detailedInsights.risk_assessment.mitigation_suggestions && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              color: '#925a9b',
                              mb: 1
                            }}>
                              Mitigation Suggestions:
                            </Typography>
                            <List dense>
                              {detailedInsights.risk_assessment.mitigation_suggestions.map((suggestion, index) => (
                                <ListItem key={index} sx={{ py: 0.5 }}>
                                  <ListItemIcon sx={{ minWidth: 24 }}>
                                    <InfoIcon sx={{ color: '#925a9b', fontSize: 16 }} />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={suggestion}
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
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  )}

                  {/* Audit Recommendations */}
                  {detailedInsights.audit_recommendations && (
                    <Grid item xs={12} md={6}>
                      <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: '#2c3e50',
                          fontSize: '1.1rem'
                        }}>
                          Audit Recommendations
                        </Typography>
                        {detailedInsights.audit_recommendations.monitoring_suggestions && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" sx={{ 
                              fontWeight: 600, 
                              color: '#925a9b',
                              mb: 1
                            }}>
                              Monitoring Suggestions:
                            </Typography>
                            <List dense>
                              {detailedInsights.audit_recommendations.monitoring_suggestions.map((suggestion, index) => (
                                <ListItem key={index} sx={{ py: 0.5 }}>
                                  <ListItemIcon sx={{ minWidth: 24 }}>
                                    <WarningIcon sx={{ color: '#925a9b', fontSize: 16 }} />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={suggestion}
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
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  )}

                  {/* Comparative Analysis */}
                  {detailedInsights.comparative_analysis && (
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: '#2c3e50',
                          fontSize: '1.1rem'
                        }}>
                          Comparative Analysis
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ textAlign: 'center', p: 2, background: 'white', borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ 
                                fontWeight: 700, 
                                color: '#925a9b',
                                mb: 1
                              }}>
                                {detailedInsights.comparative_analysis.duplicate_percentage?.transaction_count?.toFixed(1) || 0}%
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                Duplicate Transaction Rate
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ textAlign: 'center', p: 2, background: 'white', borderRadius: 2 }}>
                              <Typography variant="h4" sx={{ 
                                fontWeight: 700, 
                                color: '#925a9b',
                                mb: 1
                              }}>
                                {detailedInsights.comparative_analysis.benchmark_comparison?.current_duplicate_rate?.toFixed(1) || 0}%
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                                Current Duplicate Rate
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Box sx={{ textAlign: 'center', p: 2, background: 'white', borderRadius: 2 }}>
                              <Chip 
                                label={detailedInsights.comparative_analysis.benchmark_comparison?.status || 'Unknown'}
                                size="medium"
                                sx={{ 
                                  backgroundColor: detailedInsights.comparative_analysis.benchmark_comparison?.status === 'Above Average' ? '#dc3545' : '#28a745',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  px: 2,
                                  py: 1
                                }}
                              />
                              <Typography variant="body2" sx={{ color: '#6c757d', mt: 1 }}>
                                vs Industry Average
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
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
      {(!duplicateList || duplicateList.length === 0) && 
       (!breakdowns.duplicate_flags) && 
       (!breakdowns.user_breakdown) && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          No structured duplicate data found. Raw response:
        </Alert>
      )}

      <DuplicateDetailDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        duplicate={selectedDuplicate}
      />
    </Box>
  );
} 