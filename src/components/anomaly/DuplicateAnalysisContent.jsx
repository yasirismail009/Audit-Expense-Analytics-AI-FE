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
import DuplicateAnalysisPDF from './DuplicateAnalysisPDF';
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
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  // Extract currency from data or use default
  const currency = data?.currency || data?.file_info?.currency || 'SAR';

  const handleTransactionRowToggle = (duplicateIndex) => {
    setExpandedTransactions(prev => ({
      ...prev,
      [duplicateIndex]: !prev[duplicateIndex]
    }));
  };

  const handleDrawerOpen = (duplicate) => {
    // Transform the duplicate data to match the expected drawer format
    const transformedDuplicate = {
      type: duplicate.duplicate_type || 'Unknown Type',
      criteria: duplicate.duplicate_type_name || 'No criteria provided',
      risk_score: duplicate.risk_score || 0,
      amount: duplicate.transaction1.amount + duplicate.transaction2.amount,
      count: 2, // Always 2 transactions per duplicate
      gl_account: duplicate.transaction1.account,
      user_name: duplicate.transaction1.user,
      posting_date: duplicate.transaction1.date,
      // Add transaction details for the drawer
      transaction1: duplicate.transaction1,
      transaction2: duplicate.transaction2,
      duplicate_type: duplicate.duplicate_type,
      duplicate_type_name: duplicate.duplicate_type_name,
      matching_fields: duplicate.matching_fields,
      similarity_score: duplicate.similarity_score
    };
    setSelectedDuplicate(transformedDuplicate);
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

  // Helper function to get duplicate type description
  const getDuplicateTypeDescription = (type) => {
    const typeDescriptions = {
      'type_1': 'Account Number + Amount',
      'type_2': 'Account Number + Source + Amount',
      'type_3': 'Account Number + User + Amount',
      'type_4': 'Account Number + Posted Date + Amount',
      'type_5': 'Account Number + Effective Date + Amount',
      'type_6': 'Account Number + Effective Date + Posted Date + User + Source + Amount'
    };
    return typeDescriptions[type] || 'Unknown Type';
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
  const fileInfo = data?.file_info || {};
  const analysisInfo = data?.analysis_info || {};
  const summary = data?.summary || {};
  const detailedResults = data?.detailed_results || {};
  const visualizations = data?.visualizations || {};
  const exportData = data?.export_data || {};
  
  // Map new structure to component expectations
  const summaryStats = {
    duplicate_transactions: summary.total_duplicates || 0,
    total_transactions: summary.total_duplicates * 2 || 0, // Each duplicate has 2 transactions
    total_duplicate_amount: summary.total_amount || 0,
    avg_duplicate_amount: summary.total_amount ? summary.total_amount / summary.total_duplicates : 0,
    avg_risk_score: 0 // Calculate from detailed results
  };
  
  const riskAssessment = {
    risk_level: Object.keys(summary.risk_distribution || {}).length > 0 ? 
      Object.keys(summary.risk_distribution).find(level => summary.risk_distribution[level] > 0)?.toUpperCase() || 'LOW' : 'LOW',
    risk_distribution: summary.risk_distribution || {}
  };
  
  const chartData = {
    duplicate_types_distribution: {
      labels: Object.keys(visualizations.chart_data?.duplicate_distribution || {}).filter(type => 
        visualizations.chart_data.duplicate_distribution[type] > 0
      ),
      data: Object.keys(visualizations.chart_data?.duplicate_distribution || {}).filter(type => 
        visualizations.chart_data.duplicate_distribution[type] > 0
      ).map(type => visualizations.chart_data.duplicate_distribution[type]),
      colors: ['#925a9b', '#e74c3c', '#f39c12', '#27ae60', '#3498db', '#9b59b6']
    },
    duplicate_activity_by_user: {
      labels: visualizations.slicer_filters?.users || [],
      data: visualizations.slicer_filters?.users?.map(user => {
        const userDuplicates = detailedResults.duplicate_entries?.filter(entry => 
          entry.transaction1.user === user || entry.transaction2.user === user
        ) || [];
        return userDuplicates.length;
      }) || []
    },
    financial_statement_line_breakdown: {
      labels: visualizations.slicer_filters?.accounts || [],
      data: visualizations.slicer_filters?.accounts?.map(account => {
        const accountDuplicates = detailedResults.duplicate_entries?.filter(entry => 
          entry.transaction1.account === account || entry.transaction2.account === account
        ) || [];
        return accountDuplicates.length;
      }) || []
    }
  };
  
  const duplicateEntries = detailedResults.duplicate_entries || [];
  const duplicatePatterns = detailedResults.duplicate_patterns || {};
  const recommendations = summary.high_priority_recommendations || [];
  const auditImplications = {
    immediate_actions: summary.compliance_issues?.map(issue => issue.description) || []
  };
  const criticalAlerts = summary.compliance_issues?.filter(issue => issue.severity === 'HIGH') || [];

  // Calculate overall risk score based on new data structure
  const totalDuplicates = summaryStats.duplicate_transactions || 0;
  const totalTransactions = summaryStats.total_transactions || 0;
  
  // Calculate average risk score from duplicate entries
  const overallRiskScore = duplicateEntries.length > 0 ? 
    duplicateEntries.reduce((sum, entry) => sum + (entry.risk_score || 0), 0) / duplicateEntries.length : 0;
  
  const riskLevel = riskAssessment.risk_level || 'LOW';
console.log("duplicate data",   data);
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
            ? `Found ${duplicateEntries.length} duplicate groups involving ${totalDuplicates} transactions`
            : "No duplicate transactions found"
          }
        </Typography>
        {totalDuplicates > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Total amount involved: {formatCurrency(summaryStats.total_duplicate_amount || 0)}
          </Typography>
        )}
      </Alert>

      {/* Duplicate Type Definitions */}
      <Alert 
        severity="info" 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={<InfoIcon />}
      >
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
          Duplicate Classification Types
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          This test identifies Journal Lines which have identical characteristics. The classification for Duplicates are categorized as below:
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Type 1 Duplicate
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Account Number + Amount
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Type 2 Duplicate
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Account Number + Source + Amount
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Type 3 Duplicate
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Account Number + User + Amount
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Type 4 Duplicate
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Account Number + Posted Date + Amount
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Type 5 Duplicate
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Account Number + Effective Date + Amount
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Type 6 Duplicate
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Account Number + Effective Date + Posted Date + User + Source + Amount
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
                Duplicate Analysis
              </Typography>
              <Typography variant="body1" sx={{ color: '#6c757d', mb: 0.5 }}>
                Analysis Date: {new Date(analysisInfo.analysis_date || Date.now()).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                Status: {analysisInfo.status || 'COMPLETED'} • Duplicates: {duplicateEntries.length}
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
                      {duplicateEntries.length}
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
                      {formatCurrency(summaryStats.total_duplicate_amount || 0)}
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
                      {totalDuplicates}
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
                      {chartData.duplicate_types_distribution?.labels?.length || 0}
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
                      {chartData.duplicate_activity_by_user?.labels?.length || 0}
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
                      {chartData.financial_statement_line_breakdown?.labels?.length || 0}
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
                      {formatCurrency(summaryStats.avg_duplicate_amount || 0)}
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

      {/* Duplicate Flags Summary Cards */}
      {chartData.duplicate_types_distribution && chartData.duplicate_types_distribution.labels.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 600, 
            mb: 3, 
            color: '#2c3e50',
            fontSize: '1.25rem'
          }}>
            Duplicate Type Summary
          </Typography>
          <Grid container spacing={3}>
            {chartData.duplicate_types_distribution.labels.map((type, index) => {
              const count = chartData.duplicate_types_distribution.data[index] || 0;
              const color = chartData.duplicate_types_distribution.colors[index] || '#925a9b';
              const duplicateEntry = duplicateEntries.find(entry => entry.duplicate_type === type);
              const amount = duplicateEntry ? 
                (duplicateEntry.transaction1.amount + duplicateEntry.transaction2.amount) : 0;
              const transactions = duplicateEntry ? 2 : 0;
              
              return (
              <Grid item size={{xs: 12, sm: 6, md: 4}} key={type}>
                <Card sx={{ 
                  background: 'white', 
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #e9ecef',
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ 
                        width: 40, 
                        height: 40, 
                        backgroundColor: '#925a9b',
                        fontSize: '1rem',
                        fontWeight: 600,
                        mr: 2
                      }}>
                        {type.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          fontSize: '1rem'
                        }}>
                          {type}
                        </Typography>
                        <Chip 
                          label={amount > 10000000 ? 'HIGH' : amount > 5000000 ? 'MEDIUM' : 'LOW'}
                          size="small"
                          sx={{ 
                            backgroundColor: getRiskColor(amount > 10000000 ? 'HIGH' : amount > 5000000 ? 'MEDIUM' : 'LOW'),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            mt: 0.5
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item size={{xs: 6}}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ 
                            fontWeight: 700, 
                            color: '#925a9b',
                            fontSize: '1.5rem'
                          }}>
                            {count}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#6c757d',
                            fontSize: '0.75rem'
                          }}>
                            Groups
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item size={{xs: 6}}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ 
                            fontWeight: 700, 
                            color: '#925a9b',
                            fontSize: '1.5rem'
                          }}>
                            {transactions}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#6c757d',
                            fontSize: '0.75rem'
                          }}>
                            Transactions
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        color: '#2c3e50',
                        fontSize: '1.25rem'
                      }}>
                        {formatCurrency(amount)}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#6c757d',
                        fontSize: '0.75rem'
                      }}>
                        Total Amount
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          color: '#28a745',
                          fontSize: '0.875rem'
                        }}>
                          {formatCurrency(amount / 2)}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: '#6c757d',
                          fontSize: '0.7rem'
                        }}>
                          Debit
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          color: '#dc3545',
                          fontSize: '0.875rem'
                        }}>
                          {formatCurrency(amount / 2)}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: '#6c757d',
                          fontSize: '0.7rem'
                        }}>
                          Credit
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )})}
          </Grid>
        </Box>
      )}

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
              {duplicateEntries.length > 0 && <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: '#2c3e50',
                  fontSize: '1.1rem'
                }}>
                  Color-Coded Duplicate Lists
                </Typography>
                <ColorCodedDuplicateList 
                  data={{
                    ...data,
                    duplicates: duplicateEntries.map((entry, index) => ({
                      type: entry.duplicate_type,
                      amount: entry.transaction1.amount + entry.transaction2.amount,
                      count: 2,
                      risk_score: entry.risk_score,
                      criteria: entry.duplicate_type_name,
                      gl_account: entry.transaction1.account,
                      duplicate_type: entry.duplicate_type,
                      transactions: 2,
                      debit_amount: entry.transaction1.amount,
                      credit_amount: entry.transaction2.amount
                    }))
                  }} 
                  currency={currency} 
                />
              </Box>}

              {/* Type Breakdown Table */}
              {chartData.duplicate_types_distribution && chartData.duplicate_types_distribution.labels.length > 0 && (
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
                            <TableCell align="right">Groups</TableCell>
                            <TableCell align="right">Transactions</TableCell>
                            <TableCell align="right">Total Amount</TableCell>
                            <TableCell align="right">Debit Amount</TableCell>
                            <TableCell align="right">Credit Amount</TableCell>
                            <TableCell align="center">Risk Level</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {chartData.duplicate_types_distribution.labels.map((type, index) => {
                            const count = chartData.duplicate_types_distribution.data[index] || 0;
                            const duplicateEntry = duplicateEntries.find(entry => entry.duplicate_type === type);
                            const amount = duplicateEntry ? 
                              (duplicateEntry.transaction1.amount + duplicateEntry.transaction2.amount) : 0;
                            const transactions = duplicateEntry ? 2 : 0;
                            
                            return (
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
                                  label={count}
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
                                  {transactions}
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 700, 
                                  color: '#925a9b',
                                  fontSize: '0.875rem'
                                }}>
                                  {formatCurrency(amount)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ 
                                  color: '#6c757d',
                                  fontSize: '0.875rem',
                                  fontWeight: 500
                                }}>
                                  {formatCurrency(amount / 2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ 
                                  color: '#6c757d',
                                  fontSize: '0.875rem',
                                  fontWeight: 500
                                }}>
                                  {formatCurrency(amount / 2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ py: 2 }}>
                                <Chip 
                                  label={amount > 10000000 ? 'HIGH' : amount > 5000000 ? 'MEDIUM' : 'LOW'}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: getRiskColor(amount > 10000000 ? 'HIGH' : amount > 5000000 ? 'MEDIUM' : 'LOW'),
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          )})}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Box>
              )}

              {/* Detailed Duplicates Table */}
              {duplicateEntries && duplicateEntries.length > 0 && (
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
                          {duplicateEntries.map((duplicate, index) => (
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
                                  label={duplicate.transaction1.account}
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
                                  {duplicate.transaction1.user}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ 
                                  color: '#6c757d',
                                  fontSize: '0.875rem'
                                }}>
                                  {new Date(duplicate.transaction1.date).toLocaleDateString()}
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 700, 
                                  color: '#925a9b',
                                  fontSize: '0.875rem'
                                }}>
                                  {formatCurrency(duplicate.transaction1.amount + duplicate.transaction2.amount)}
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
        {chartData.duplicate_activity_by_user && chartData.duplicate_activity_by_user.labels.length > 0 && (
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
                      {chartData.duplicate_activity_by_user.labels.map((userName, index) => {
                        const userData = {
                          duplicate_groups: chartData.duplicate_activity_by_user.data[index] || 0,
                          transactions: chartData.duplicate_activity_by_user.data[index] * 2 || 0,
                          amount: 0, // Calculate from duplicate entries
                          unique_accounts: 1
                        };
                        
                        // Calculate amount from duplicate entries
                        const userDuplicates = duplicateEntries.filter(entry => 
                          entry.transaction1.user === userName || entry.transaction2.user === userName
                        );
                        userData.amount = userDuplicates.reduce((sum, entry) => 
                          sum + entry.transaction1.amount + entry.transaction2.amount, 0
                        );
                        
                        return (
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
                      )})}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Section 3: GL Account Analysis */}
        {chartData.financial_statement_line_breakdown && chartData.financial_statement_line_breakdown.labels.length > 0 && (
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
                      {chartData.financial_statement_line_breakdown.labels.map((account, index) => {
                        const accountData = {
                          duplicate_groups: chartData.financial_statement_line_breakdown.data[index] || 0,
                          transactions: chartData.financial_statement_line_breakdown.data[index] * 2 || 0,
                          amount: 0,
                          debit_amount: 0,
                          credit_amount: 0
                        };
                        
                        // Calculate amounts from duplicate entries
                        const accountDuplicates = duplicateEntries.filter(entry => 
                          entry.transaction1.account === account || entry.transaction2.account === account
                        );
                        accountData.amount = accountDuplicates.reduce((sum, entry) => 
                          sum + entry.transaction1.amount + entry.transaction2.amount, 0
                        );
                        accountData.debit_amount = accountDuplicates.reduce((sum, entry) => 
                          sum + entry.transaction1.amount, 0
                        );
                        accountData.credit_amount = accountDuplicates.reduce((sum, entry) => 
                          sum + entry.transaction2.amount, 0
                        );
                        
                        return (
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
                      )})}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Section 4: Risk Analysis */}
        {riskAssessment.risk_distribution && Object.keys(riskAssessment.risk_distribution).length > 0 && (
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
                      {Object.entries(riskAssessment.risk_distribution).map(([riskLevel, count], index) => {
                        const riskData = {
                          groups: count,
                          transactions: count * 2,
                          amount: 0
                        };
                        
                        // Calculate amount from duplicate entries based on risk level
                        const riskLevelDuplicates = duplicateEntries.filter(entry => {
                          const entryRiskLevel = getRiskLevel(entry.risk_score);
                          // Convert risk level from API format (e.g., "low_risk") to standard format (e.g., "LOW")
                          const apiRiskLevel = riskLevel.replace('_risk', '').toUpperCase();
                          return entryRiskLevel === apiRiskLevel;
                        });
                        riskData.amount = riskLevelDuplicates.reduce((sum, entry) => 
                          sum + entry.transaction1.amount + entry.transaction2.amount, 0
                        );
                        
                        return (
                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          <TableCell sx={{ borderBottom: '1px solid #e9ecef', py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Chip 
                                label={riskLevel.replace('_risk', '').toUpperCase()}
                                size="small"
                                sx={{ 
                                  backgroundColor: getRiskColor(riskLevel.replace('_risk', '').toUpperCase()),
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
                      )})}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Section 5: Detailed Insights */}
        {(recommendations.length > 0 || (auditImplications.immediate_actions && auditImplications.immediate_actions.length > 0)) && (
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
                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <Grid item size={{xs: 12, md: 6}}>
                      <Box sx={{ p: 2, background: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: '#2c3e50',
                          fontSize: '1.1rem'
                        }}>
                          Recommendations
                        </Typography>
                        <List dense>
                          {recommendations.map((recommendation, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <InfoIcon sx={{ color: '#925a9b', fontSize: 16 }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={recommendation.action}
                                secondary={recommendation.recommendation || recommendation.description}
                                sx={{ 
                                  '& .MuiListItemText-primary': {
                                    fontSize: '0.875rem',
                                    color: '#2c3e50',
                                    fontWeight: 600
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

                  {/* Audit Implications */}
                  {auditImplications.immediate_actions && (
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
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ 
                            fontWeight: 600, 
                            color: '#925a9b',
                            mb: 1
                          }}>
                            Immediate Actions:
                          </Typography>
                          <List dense>
                            {auditImplications.immediate_actions.map((action, index) => (
                              <ListItem key={index} sx={{ py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                  <WarningIcon sx={{ color: '#925a9b', fontSize: 16 }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={action}
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
                      </Box>
                    </Grid>
                  )}

                  {/* Critical Alerts */}
                  {criticalAlerts.length > 0 && (
                    <Grid item size={{xs: 12}}>
                      <Box sx={{ p: 2, background: '#fff3cd', borderRadius: 2, border: '1px solid #ffeaa7' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: '#856404',
                          fontSize: '1.1rem'
                        }}>
                          Critical Alerts
                        </Typography>
                        <List dense>
                          {criticalAlerts.map((alert, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <ErrorIcon sx={{ color: '#dc3545', fontSize: 16 }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={alert.description}
                                secondary={`Severity: ${alert.severity} • Count: ${alert.count} • Amount: ${formatCurrency(alert.total_amount)}`}
                                sx={{ 
                                  '& .MuiListItemText-primary': {
                                    fontSize: '0.875rem',
                                    color: '#856404',
                                    fontWeight: 600
                                  },
                                  '& .MuiListItemText-secondary': {
                                    fontSize: '0.75rem',
                                    color: '#856404'
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
      {(!duplicateEntries || duplicateEntries.length === 0) && 
       (!chartData.duplicate_types_distribution || chartData.duplicate_types_distribution.labels.length === 0) && 
       (!chartData.duplicate_activity_by_user || chartData.duplicate_activity_by_user.labels.length === 0) && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          No structured duplicate data found. Raw response:
        </Alert>
      )}

      <DuplicateDetailDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        duplicate={selectedDuplicate}
        type="Duplicate Analysis"
      />

      <DuplicateAnalysisPDF
        open={pdfModalOpen}
        setOpen={setPdfModalOpen}
        data={data}
        currency={currency}
      />
    </Box>
  );
} 