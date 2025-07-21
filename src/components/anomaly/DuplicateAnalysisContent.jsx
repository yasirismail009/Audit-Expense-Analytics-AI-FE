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
      return `${(num / 1000000000000).toFixed(1)}T SAR`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M SAR`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K SAR`;
    } else {
      return `${num.toFixed(0)} SAR`;
    }
  };

  // Calculate overall risk score
  const overallRiskScore = Math.round((data.total_duplicates / (data.total_transactions_involved || 1)) * 100);
  const riskLevel = getRiskLevel(overallRiskScore);

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', p: 3 }}>
      {/* Analysis Status */}
      {data.message && (
        <Alert 
          severity={data.total_duplicates > 0 ? "warning" : "success"} 
          sx={{ mb: 3, borderRadius: 2 }}
          icon={data.total_duplicates > 0 ? <WarningIcon /> : <InfoIcon />}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {data.message}
          </Typography>
          {data.total_duplicates > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Found {data.total_duplicates} duplicate groups involving {data.total_transactions_involved} transactions 
              with a total amount of {formatCurrency(data.total_amount_involved || 0)}.
            </Typography>
          )}
        </Alert>
      )}

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
                Analysis Date: {new Date().toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                Status: COMPLETED • Duplicates: {data.total_duplicates || 0}
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
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
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
                      {data.total_duplicates || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Total Duplicates
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
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
                      {formatCurrency(data.total_amount_involved || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Total Amount
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
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
                      {data.total_transactions_involved || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Transactions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
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
                      {data.type_breakdown ? Object.keys(data.type_breakdown).length : 0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Duplicate Types
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
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
                      {data.charts_data?.user_breakdown?.length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Users Involved
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
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
                      {data.charts_data?.fs_line_breakdown?.length || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      GL Accounts
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
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
                      {formatCurrency((data.total_amount_involved || 0) / (data.total_transactions_involved || 1))}
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
                <ColorCodedDuplicateList data={data} />
              </Box>

              {/* Type Breakdown Table */}
              {data.type_breakdown && (
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
                          {Object.entries(data.type_breakdown).map(([type, details], index) => (
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
                                  {details.total_transactions}
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 700, 
                                  color: '#925a9b',
                                  fontSize: '0.875rem'
                                }}>
                                  {formatCurrency(details.total_amount)}
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
              {data.duplicates && data.duplicates.length > 0 && (
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
                            <TableCell>Criteria</TableCell>
                            <TableCell>GL Account</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="right">Count</TableCell>
                            <TableCell align="right">Risk Score</TableCell>
                            <TableCell align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.duplicates.map((duplicate, index) => (
                            <React.Fragment key={index}>
                              <TableRow sx={{ 
                                '&:hover': { 
                                  backgroundColor: '#f8f9fa',
                                  transform: 'scale(1.01)',
                                  transition: 'all 0.2s ease-in-out'
                                },
                                '&:nth-of-type(even)': {
                                  backgroundColor: '#fafbfc'
                                }
                              }}>
                                <TableCell sx={{ py: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ 
                                      width: 32, 
                                      height: 32, 
                                      backgroundColor: '#925a9b',
                                      fontSize: '0.875rem',
                                      fontWeight: 600
                                    }}>
                                      {duplicate.type?.charAt(0) || 'D'}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" sx={{ 
                                        fontWeight: 600, 
                                        color: '#2c3e50',
                                        fontSize: '0.875rem'
                                      }}>
                                        {duplicate.type}
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
                                  <Typography variant="body2" sx={{ 
                                    color: '#6c757d',
                                    fontSize: '0.875rem',
                                    maxWidth: 200,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {duplicate.criteria}
                                  </Typography>
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
                                    label={duplicate.count}
                                    size="small"
                                    sx={{ 
                                      backgroundColor: '#6c757d',
                                      color: 'white',
                                      fontWeight: 600,
                                      fontSize: '0.75rem'
                                    }}
                                  />
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
                                      onClick={() => handleTransactionRowToggle(index)}
                                      sx={{ 
                                        color: '#925a9b',
                                        '&:hover': {
                                          backgroundColor: '#925a9b',
                                          color: 'white'
                                        }
                                      }}
                                    >
                                      {expandedTransactions[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                    </IconButton>
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
                                    <Typography variant="body2" color="text.secondary" component="span" sx={{ fontSize: '0.75rem' }}>
                                      ({duplicate.transactions?.length || 0})
                                    </Typography>
                                  </Box>
                                </TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                  <Collapse in={expandedTransactions[index]} timeout="auto" unmountOnExit>
                                    <Box sx={{ margin: 1, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                                      <Typography variant="subtitle2" gutterBottom component="div" sx={{ 
                                        fontWeight: 600, 
                                        color: '#2c3e50',
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                      }}>
                                        <InfoIcon sx={{ color: '#925a9b', fontSize: 16 }} />
                                        Transaction Details
                                      </Typography>
                                      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                        <Table size="small">
                                          <TableHead>
                                            <TableRow sx={{ backgroundColor: '#e9ecef' }}>
                                              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>ID</TableCell>
                                              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>User</TableCell>
                                              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Posting Date</TableCell>
                                              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Document Date</TableCell>
                                              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Document Number</TableCell>
                                              <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Amount</TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {duplicate.transactions?.map((transaction, tIndex) => (
                                              <TableRow key={tIndex} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                                                <TableCell sx={{ fontSize: '0.75rem' }}>{transaction.id}</TableCell>
                                                <TableCell sx={{ fontSize: '0.75rem' }}>{transaction.user_name}</TableCell>
                                                <TableCell sx={{ fontSize: '0.75rem' }}>{transaction.posting_date}</TableCell>
                                                <TableCell sx={{ fontSize: '0.75rem' }}>{transaction.document_date}</TableCell>
                                                <TableCell sx={{ fontSize: '0.75rem' }}>{transaction.document_number}</TableCell>
                                                <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#925a9b' }}>
                                                  {formatCurrency(transaction.amount)}
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </Paper>
                                    </Box>
                                  </Collapse>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
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
        {data.charts_data?.user_breakdown && (
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
                          Duplicate Count
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
                        }}>
                          Duplicate Types
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.charts_data.user_breakdown.map((user, index) => (
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
                              color: '#925a9b',
                              fontSize: '0.875rem'
                            }}>
                              {user.duplicate_count}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#925a9b',
                              fontSize: '0.875rem'
                            }}>
                              {formatCurrency(user.total_amount)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {user.duplicate_types?.map((type, typeIndex) => (
                                <Chip 
                                  key={typeIndex}
                                  label={type} 
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    fontSize: '0.75rem',
                                    borderColor: '#925a9b',
                                    color: '#925a9b'
                                  }}
                                />
                              ))}
                            </Box>
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
        {data.charts_data?.fs_line_breakdown && (
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
                          Duplicate Count
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
                          Transaction Count
                        </TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          borderBottom: '1px solid #e9ecef'
                        }}>
                          Duplicate Types
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.charts_data.fs_line_breakdown.map((line, index) => (
                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#2c3e50',
                              fontSize: '0.875rem'
                            }}>
                              {line.gl_account}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#925a9b',
                              fontSize: '0.875rem'
                            }}>
                              {line.duplicate_count}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              color: '#925a9b',
                              fontSize: '0.875rem'
                            }}>
                              {formatCurrency(line.total_amount)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Typography variant="body2" sx={{ 
                              color: '#6c757d',
                              fontSize: '0.875rem'
                            }}>
                              {line.transaction_count}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {line.duplicate_types?.map((type, typeIndex) => (
                                <Chip 
                                  key={typeIndex}
                                  label={type} 
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    fontSize: '0.75rem',
                                    borderColor: '#925a9b',
                                    color: '#925a9b'
                                  }}
                                />
                              ))}
                            </Box>
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

        {/* Section 4: Model Analysis */}
        {(data.training_data?.model_metrics || data.training_data?.feature_importance) && (
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
                  Model Analysis
                </Typography>
                <Grid container spacing={3}>
                  {/* Model Metrics */}
                  {data.training_data?.model_metrics && (
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 3, 
                          color: '#2c3e50',
                          fontSize: '1.1rem'
                        }}>
                          Model Metrics
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                          {[
                            { 
                              label: 'Total Samples', 
                              value: data.training_data.model_metrics.total_samples, 
                              icon: <TrendingUpIcon sx={{ color: '#925a9b' }} />,
                              color: '#925a9b'
                            },
                            { 
                              label: 'Duplicate Samples', 
                              value: data.training_data.model_metrics.duplicate_samples, 
                              icon: <ErrorIcon sx={{ color: '#925a9b' }} />,
                              color: '#925a9b'
                            },
                            { 
                              label: 'Non-Duplicate Samples', 
                              value: data.training_data.model_metrics.non_duplicate_samples, 
                              icon: <InfoIcon sx={{ color: '#925a9b' }} />,
                              color: '#925a9b'
                            },
                            { 
                              label: 'Duplicate Ratio', 
                              value: `${((data.training_data.model_metrics.duplicate_ratio || 0) * 100).toFixed(1)}%`, 
                              icon: <TrendingUpIcon sx={{ color: '#925a9b' }} />,
                              color: '#925a9b'
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
                                  color: '#2c3e50',
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
                                value={index === 3 ? parseFloat(item.value) : Math.min((item.value / (data.training_data.model_metrics.total_samples || 1)) * 100, 100)} 
                                sx={{ 
                                  height: 6, 
                                  borderRadius: 3,
                                  backgroundColor: '#e9ecef',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: "#925a9b",
                                    borderRadius: 3
                                  }
                                }} 
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Grid>
                  )}

                  {/* Feature Importance */}
                  {data.training_data?.feature_importance && (
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 3, 
                          color: '#2c3e50',
                          fontSize: '1.1rem'
                        }}>
                          Feature Importance
                        </Typography>
                        <Grid container spacing={2}>
                          {Object.entries(data.training_data.feature_importance).map(([feature, importance]) => (
                            <Grid item xs={6} key={feature}>
                              <Box sx={{ 
                                p: 2, 
                                background: '#f8f9fa', 
                                borderRadius: 2,
                                border: '1px solid #e9ecef'
                              }}>
                                <Typography variant="body2" sx={{ 
                                  color: '#6c757d', 
                                  mb: 1, 
                                  fontSize: '0.875rem',
                                  textTransform: 'capitalize'
                                }}>
                                  {feature.replace(/_/g, ' ')}
                                </Typography>
                                <Typography variant="h6" sx={{ 
                                  fontWeight: 600,
                                  color: '#925a9b',
                                  fontSize: '1rem'
                                }}>
                                  {(importance * 100).toFixed(1)}%
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
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
      {(!data.duplicates || data.duplicates.length === 0) && 
       (!data.type_breakdown) && 
       (!data.charts_data) && (
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