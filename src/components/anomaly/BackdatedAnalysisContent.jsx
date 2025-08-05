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

export default function BackdatedAnalysisContent({ data, distributionData, anomalySummary, sheetId }) {
  const [expandedTransactions, setExpandedTransactions] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedBackdated, setSelectedBackdated] = useState(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  
  // New state for API integration
  const [backdatedListing, setBackdatedListing] = useState([]);
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
  const fileInfo = data?.file_info || {};
  const analysisInfo = data?.analysis_info || {};
  const summaryStats = data?.summary_statistics || {};
  const riskAssessment = data?.risk_assessment || {};
  const chartData = data?.chart_data || {};
  const backdatedEntries = data?.backdated_entries || [];
  const recommendations = data?.recommendations || [];
  const auditImplications = data?.audit_implications || {};
  const criticalAlerts = data?.critical_alerts || [];
  const backdatedPatterns = data?.backdated_patterns || {};

  // Calculate overall risk score and level from new data structure
  const totalBackdated = summaryStats.backdated_transactions || 0;
  const totalTransactions = summaryStats.total_transactions || 0;
  const overallRiskScore = riskAssessment.overall_risk_score || 0;
  const riskLevel = riskAssessment.risk_level || 'LOW';

  // API call to fetch backdated entries listing
  const fetchBackdatedListing = async (page = 1, pageSize = 10) => {
    if (!sheetId) {
      console.warn('No sheetId provided for backdated listing API call');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/backdated-entries-list/${sheetId}/?page=${page}&page_size=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Handle the specific API response format
      const listingData = result.results || result.data || result.backdated_entries || [];
      
      setBackdatedListing(listingData);
      setPagination({
        count: result.count || 0,
        next: result.next,
        previous: result.previous,
        currentPage: page,
        pageSize: pageSize
      });
    } catch (err) {
      console.error('Error fetching backdated listing:', err);
      setError(err.message || 'Failed to fetch backdated entries listing');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchBackdatedListing(1, 10);
  }, [sheetId]);

  // Pagination handlers
  const handlePageChange = (newPage) => {
    fetchBackdatedListing(newPage, pagination.pageSize);
  };

  const handlePageSizeChange = (newPageSize) => {
    fetchBackdatedListing(1, newPageSize);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', p: 3 }}>
      <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#2c3e50', 
                mb: 2,
                fontSize: '1.75rem'
              }}>
                Backdated Analysis Report
              </Typography>
      {/* Backdated Definition */}
      <Alert 
        severity="info" 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={<InfoIcon />}
      >
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
          Backdated Entry Detection
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          This test identifies all the Journal Lines for which the Posting Date is after the Effective Date, i.e backdated entries. Both date fields are required to be present in the GL data for this test.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(230, 81, 0, 0.1)', borderRadius: 2, border: '1px solid rgba(230, 81, 0, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100', mb: 1 }}>
                  Detection Criteria
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Posting Date &gt; Effective Date
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(230, 81, 0, 0.1)', borderRadius: 2, border: '1px solid rgba(230, 81, 0, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100', mb: 1 }}>
                  Required Fields
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Both Posting Date and Effective Date must be present
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(230, 81, 0, 0.1)', borderRadius: 2, border: '1px solid rgba(230, 81, 0, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100', mb: 1 }}>
                  Risk Assessment
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Higher risk for longer date differences
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(230, 81, 0, 0.1)', borderRadius: 2, border: '1px solid rgba(230, 81, 0, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100', mb: 1 }}>
                  Audit Implications
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  May indicate timing manipulation or errors
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Alert>
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
            ? `Found ${totalBackdated} backdated entries (${riskLevel} Risk) involving ${totalBackdated} transactions`
            : "No backdated entries found"
          }
        </Typography>
        {totalBackdated > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Total amount involved: {formatCurrency(summaryStats.total_backdated_amount || 0)} • Risk Level: {riskLevel}
          </Typography>
        )}
      </Alert>

      {/* Backdated Patterns Summary */}
      {backdatedPatterns && Object.keys(backdatedPatterns).length > 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 3, borderRadius: 2 }}
          icon={<InfoIcon />}
        >
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
            Backdated Patterns Analysis
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item size={{xs: 12, sm: 4}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(230, 81, 0, 0.1)', borderRadius: 2, border: '1px solid rgba(230, 81, 0, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100', mb: 1 }}>
                  Total Transactions
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                  {backdatedPatterns.total_transactions || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, sm: 4}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(230, 81, 0, 0.1)', borderRadius: 2, border: '1px solid rgba(230, 81, 0, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100', mb: 1 }}>
                  Backdated Percentage
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                  {(backdatedPatterns.backdated_percentage || 0).toFixed(2)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, sm: 4}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(230, 81, 0, 0.1)', borderRadius: 2, border: '1px solid rgba(230, 81, 0, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100', mb: 1 }}>
                  Backdated Entries Found
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                  {backdatedPatterns.backdated_entries_found || 0}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Alert>
      )}


      {/* Critical Alerts */}
      {criticalAlerts && criticalAlerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {criticalAlerts.map((alert, index) => (
            <Alert 
              key={index}
              severity={alert.severity === 'HIGH' ? 'error' : 'warning'}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {alert.message}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Action Required: {alert.action_required}
              </Typography>
            </Alert>
          ))}
        </Box>
      )}

      {/* High Risk Backdated Transactions */}
      {!loading && !error && backdatedListing.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            mb: 2, 
            color: '#2c3e50',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <ErrorIcon sx={{ color: '#dc3545', fontSize: 20 }} />
            High Risk Backdated Transactions
          </Typography>
          <Grid container spacing={2}>
            {backdatedListing
              .filter(entry => entry.risk_level === 'HIGH' || entry.backdated_severity === 'CRITICAL' || entry.backdated_severity === 'HIGH')
              .slice(0, 6) // Show only first 6 high-risk entries
              .map((entry, index) => (
              <Grid item size={{xs: 12, md: 6}} key={index}>
                <Card sx={{ 
                  background: '#fff5f5', 
                  borderRadius: 2,
                  border: '1px solid #fecaca',
                  boxShadow: '0 2px 8px rgba(220, 53, 69, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(220, 53, 69, 0.2)'
                  }
                }}
                onClick={() => handleDrawerOpen(entry)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 600, 
                        color: '#dc3545',
                        fontSize: '0.9rem'
                      }}>
                        {entry.user}
                      </Typography>
                      <Chip 
                        label={entry.backdated_severity || entry.risk_level} 
                        size="small"
                        sx={{ 
                          backgroundColor: entry.backdated_severity === 'CRITICAL' ? '#dc3545' : '#fd7e14',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem',
                      mb: 1
                    }}>
                      Account: {entry.account} • Amount: {entry.amount_formatted || formatCurrency(entry.amount)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem',
                      mb: 1
                    }}>
                      Posting Date: {new Date(entry.posting_date).toLocaleDateString()} • 
                      Document Date: {new Date(entry.document_date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Days Difference: {entry.days_difference} • Transaction ID: {entry.transaction_id?.substring(0, 8)}...
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* No High Risk Entries Found */}
      {!loading && !error && backdatedListing.length > 0 && 
       backdatedListing.filter(entry => entry.risk_level === 'HIGH' || entry.backdated_severity === 'CRITICAL' || entry.backdated_severity === 'HIGH').length === 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600, 
            mb: 2, 
            color: '#2c3e50',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <InfoIcon sx={{ color: '#28a745', fontSize: 20 }} />
            Risk Assessment Summary
          </Typography>
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              No High-Risk Backdated Entries Found
            </Typography>
            <Typography variant="body2">
              All {backdatedListing.length} backdated entries have been assessed and none are classified as high-risk or critical severity. This indicates a lower risk profile for the analyzed data.
            </Typography>
          </Alert>
        </Box>
      )}

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
                Summary Backdated Analysis
              </Typography>
              <Typography variant="body1" sx={{ color: '#6c757d', mb: 0.5 }}>
                Analysis Date: {new Date(analysisInfo.analysis_date || Date.now()).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                Status: {analysisInfo.status || 'COMPLETED'} • Backdated: {totalBackdated}
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
                    {Math.round(overallRiskScore)}%
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
                      {formatCurrency(summaryStats.total_backdated_amount || 0)}
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
                      {summaryStats.backdated_percentage?.toFixed(2) || 0}%
                </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Backdated %
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
                      {summaryStats.avg_backdated_days || 0}
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
                      {formatCurrency(summaryStats.avg_backdated_amount || 0)}
              </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Average Amount
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
                      {summaryStats.avg_risk_score?.toFixed(1) || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Avg Risk Score
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
                      {summaryStats.max_risk_score || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Max Risk Score
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
                      {summaryStats.max_backdated_days || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Max Days Diff
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
            data={chartData.risk_level_distribution || {
              labels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
              data: [
                riskAssessment.risk_distribution?.low_risk || 0,
                riskAssessment.risk_distribution?.medium_risk || 0,
                riskAssessment.risk_distribution?.high_risk || 0,
                riskAssessment.risk_distribution?.critical_risk || 0
              ]
            }}
            title="Risk Level Distribution"
            subtitle="Distribution of backdated entries by risk level"
          />
        </Grid>
        
        {/* Days Difference Distribution Chart */}
        <Grid item size={{xs: 12, md: 6}}>
          <AnomaliesDistributionChart 
            data={(() => {
              // Calculate distribution from actual backdated entries
              const distribution = {
                '1-7 days': 0,
                '8-30 days': 0,
                '31-90 days': 0,
                '91-365 days': 0,
                '365+ days': 0
              };
              
              if (backdatedEntries && backdatedEntries.length > 0) {
                backdatedEntries.forEach(entry => {
                  const days = Math.abs(entry.days_difference || 0);
                  if (days <= 7) distribution['1-7 days']++;
                  else if (days <= 30) distribution['8-30 days']++;
                  else if (days <= 90) distribution['31-90 days']++;
                  else if (days <= 365) distribution['91-365 days']++;
                  else distribution['365+ days']++;
                });
              }
              
              return {
                labels: Object.keys(distribution),
                data: Object.values(distribution),
                colors: ['#4BC0C0', '#FFCE56', '#FF9F40', '#FF6384', '#36A2EB']
              };
            })()}
            title="Backdated Days Distribution"
            subtitle="Distribution of backdated entries by days difference"
          />
        </Grid>
        
        {/* Backdated Entries by User Chart */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}>
                Backdated Entries by User
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#6c757d', fontSize: '0.875rem' }}>
                Distribution of backdated entries by user
              </Typography>
              {chartData.backdated_activity_by_user && chartData.backdated_activity_by_user.labels.length > 0 ? (
                <Box sx={{ height: 200, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.backdated_activity_by_user.labels.map((user, index) => ({
                      name: user,
                      entries: chartData.backdated_activity_by_user.data[index] || 0
                    }))}>
                      <defs>
                        <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e65100" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#e65100" stopOpacity={0.1}/>
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
                                  Entries: {payload[0]?.value || 0}
                                </Typography>
                              </Box>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="entries" 
                        stroke="#e65100"
                        strokeWidth={2}
                        fill="url(#userGradient)"
                        dot={{ fill: '#e65100', strokeWidth: 1, r: 3 }}
                        activeDot={{ r: 5, stroke: '#e65100', strokeWidth: 2, fill: '#e65100' }}
                        name="Entries"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
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
        
        {/* Amount Distribution Chart */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}>
                Amount Distribution by Range
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#6c757d', fontSize: '0.875rem' }}>
                Distribution of backdated entries by amount range
              </Typography>
              {chartData.backdated_amount_distribution && chartData.backdated_amount_distribution.labels.length > 0 ? (
                <Box sx={{ height: 200, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.backdated_amount_distribution.labels.map((range, index) => ({
                      name: range,
                      transactions: chartData.backdated_amount_distribution.data[index] || 0
                    }))}>
                      <defs>
                        <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e65100" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#e65100" stopOpacity={0.1}/>
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
                                  Transactions: {payload[0]?.value || 0}
                                </Typography>
                              </Box>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="transactions" 
                        stroke="#e65100"
                        strokeWidth={2}
                        fill="url(#amountGradient)"
                        dot={{ fill: '#e65100', strokeWidth: 1, r: 3 }}
                        activeDot={{ r: 5, stroke: '#e65100', strokeWidth: 2, fill: '#e65100' }}
                        name="Transactions"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No amount distribution data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Statement Line Breakdown */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}>
                GL Account Breakdown
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: '#6c757d', fontSize: '0.875rem' }}>
                Distribution of backdated entries by GL account
              </Typography>
              {chartData.financial_statement_line_breakdown && chartData.financial_statement_line_breakdown.labels.length > 0 ? (
                <Box sx={{ height: 200, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.financial_statement_line_breakdown.labels.map((account, index) => ({
                      name: account,
                      entries: chartData.financial_statement_line_breakdown.data[index] || 0
                    }))}>
                      <defs>
                        <linearGradient id="accountGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e65100" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#e65100" stopOpacity={0.1}/>
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
                                  Backdated Entries: {payload[0]?.value || 0}
                                </Typography>
                              </Box>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="entries" 
                        stroke="#e65100"
                        strokeWidth={2}
                        fill="url(#accountGradient)"
                        dot={{ fill: '#e65100', strokeWidth: 1, r: 3 }}
                        activeDot={{ r: 5, stroke: '#e65100', strokeWidth: 2, fill: '#e65100' }}
                        name="Backdated Entries"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No GL account breakdown data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Backdated Trend Chart */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
                Monthly Backdated Trend
              </Typography>
              {chartData.monthly_backdated_trend && chartData.monthly_backdated_trend.labels.length > 0 ? (
                <Box>
                  <Box sx={{ height: 200, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.monthly_backdated_trend.labels.map((month, index) => ({
                        name: month,
                        backdated: chartData.monthly_backdated_trend.data[index] || 0
                      }))}>
                        <defs>
                          <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#e65100" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#e65100" stopOpacity={0.1}/>
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
                                    Backdated Entries: {payload[0]?.value || 0}
                                  </Typography>
                                </Box>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="backdated" 
                          stroke="#e65100"
                          strokeWidth={2}
                          fill="url(#monthlyGradient)"
                          dot={{ fill: '#e65100', strokeWidth: 1, r: 3 }}
                          activeDot={{ r: 5, stroke: '#e65100', strokeWidth: 2, fill: '#e65100' }}
                          name="Backdated Entries"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No monthly trend data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Backdated Summary Cards */}
      {!loading && !error && backdatedListing.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 600, 
            mb: 3, 
            color: '#2c3e50',
            fontSize: '1.25rem'
          }}>
            Backdated Entry Summary (API Data)
          </Typography>
          <Grid container spacing={3}>
            {backdatedListing.slice(0, 6).map((entry, index) => (
              <Grid item size={{xs: 12, sm: 6, md: 4}} key={index}>
                <Card sx={{ 
                  background: 'white', 
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #e9ecef',
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                  }
                }}
                onClick={() => handleDrawerOpen(entry)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ 
                        width: 40, 
                        height: 40, 
                        backgroundColor: '#e65100',
                        fontSize: '1rem',
                        fontWeight: 600,
                        mr: 2
                      }}>
                        {entry.user?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          fontSize: '1rem'
                        }}>
                          {entry.user}
                        </Typography>
                        <Chip 
                          label={entry.backdated_severity?.toUpperCase() || entry.risk_level?.toUpperCase() || 'UNKNOWN'}
                          size="small"
                          sx={{ 
                            backgroundColor: getRiskColor(entry.backdated_severity?.toUpperCase() || entry.risk_level?.toUpperCase()),
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
                            color: '#e65100',
                            fontSize: '1.5rem'
                          }}>
                            {entry.amount_formatted || formatCurrency(entry.amount)}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#6c757d',
                            fontSize: '0.75rem'
                          }}>
                            Amount
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item size={{xs: 6}}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ 
                            fontWeight: 700, 
                            color: '#e65100',
                            fontSize: '1.5rem'
                          }}>
                            {entry.days_difference}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#6c757d',
                            fontSize: '0.75rem'
                          }}>
                            Days Diff
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ 
                        color: '#6c757d',
                        fontSize: '0.875rem',
                        mb: 1
                      }}>
                        <strong>Account:</strong> {entry.account}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#6c757d',
                        fontSize: '0.875rem',
                        mb: 1
                      }}>
                        <strong>Severity:</strong> {entry.backdated_severity || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#6c757d',
                        fontSize: '0.875rem'
                      }}>
                        <strong>Transaction ID:</strong> {entry.transaction_id?.substring(0, 8)}...
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* API Fetched Backdated Listing */}
      <Card sx={{ 
        mb: 4, 
        background: 'white', 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid #e9ecef'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: '#2c3e50',
              fontSize: '1.25rem'
            }}>
              Backdated Entries Listing
            </Typography>
            <Button
              variant="outlined"
              onClick={() => fetchBackdatedListing(pagination.currentPage, pagination.pageSize)}
              disabled={loading}
              sx={{
                borderColor: '#e65100',
                color: '#e65100',
                fontWeight: 600,
                px: 2,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: '#e65100',
                  color: 'white',
                  borderColor: '#e65100'
                }
              }}
            >
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </Button>
          </Box>

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <LinearProgress sx={{ width: '100%', mb: 2 }} />
              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                Fetching backdated entries listing...
              </Typography>
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Error Loading Backdated Listing
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {error}
              </Typography>
              <Button
                variant="contained"
                onClick={() => fetchBackdatedListing(pagination.currentPage, pagination.pageSize)}
                sx={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: '#c82333'
                  }
                }}
              >
                🔄 Retry
              </Button>
            </Alert>
          )}

          {/* Success State - Display Data */}
          {!loading && !error && backdatedListing.length > 0 && (
            <Box>
                             <Typography variant="body1" sx={{ 
                 fontWeight: 600, 
                 mb: 2, 
                 color: '#2c3e50',
                 fontSize: '1rem'
               }}>
                 Found {pagination.count} backdated entries from API (showing page {pagination.currentPage} of {Math.ceil(pagination.count / pagination.pageSize)})
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
                         <TableCell>Transaction ID</TableCell>
                         <TableCell>User</TableCell>
                         <TableCell>Account</TableCell>
                         <TableCell>Posting Date</TableCell>
                         <TableCell>Document Date</TableCell>
                         <TableCell>Days Difference</TableCell>
                         <TableCell align="right">Amount</TableCell>
                         <TableCell>Risk Level</TableCell>
                         <TableCell>Severity</TableCell>
                         <TableCell>Document Number</TableCell>
                         <TableCell align="center">Actions</TableCell>
                       </TableRow>
                     </TableHead>
                    <TableBody>
                      {backdatedListing.map((entry, index) => (
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
                                 {entry.transaction_id?.charAt(0) || 'T'}
                               </Avatar>
                               <Box>
                                 <Typography variant="body2" sx={{ 
                                   fontWeight: 600, 
                                   color: '#2c3e50',
                                   fontSize: '0.875rem'
                                 }}>
                                   {entry.transaction_id || `Entry-${index + 1}`}
                                 </Typography>
                                 <Typography variant="caption" sx={{ 
                                   color: '#6c757d',
                                   fontSize: '0.75rem'
                                 }}>
                                   API Entry #{index + 1}
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
                               {entry.user || 'N/A'}
                             </Typography>
                           </TableCell>
                           <TableCell sx={{ py: 2 }}>
                             <Chip 
                               label={entry.account || 'N/A'}
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
                               {entry.posting_date ? new Date(entry.posting_date).toLocaleDateString() : 'N/A'}
                             </Typography>
                           </TableCell>
                           <TableCell sx={{ py: 2 }}>
                             <Typography variant="body2" sx={{ 
                               color: '#6c757d',
                               fontSize: '0.875rem'
                             }}>
                               {entry.document_date ? new Date(entry.document_date).toLocaleDateString() : 'N/A'}
                             </Typography>
                           </TableCell>
                           <TableCell sx={{ py: 2 }}>
                             <Chip 
                               label={`${entry.days_difference || 0} days`} 
                               size="small"
                               sx={{ 
                                 backgroundColor: Math.abs(entry.days_difference || 0) > 30 ? '#dc3545' : Math.abs(entry.days_difference || 0) > 7 ? '#ffc107' : '#28a745',
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
                               {entry.amount_formatted || formatCurrency(entry.amount || 0)}
                             </Typography>
                           </TableCell>
                           <TableCell align="center" sx={{ py: 2 }}>
                             <Chip 
                               label={entry.risk_level?.toUpperCase() || 'N/A'} 
                               size="small"
                               sx={{ 
                                 backgroundColor: getRiskColor(entry.risk_level?.toUpperCase()),
                                 color: 'white',
                                 fontWeight: 600,
                                 fontSize: '0.75rem'
                               }}
                             />
                           </TableCell>
                           <TableCell align="center" sx={{ py: 2 }}>
                             <Chip 
                               label={entry.backdated_severity?.toUpperCase() || 'N/A'} 
                               size="small"
                               sx={{ 
                                 backgroundColor: entry.backdated_severity === 'CRITICAL' ? '#dc3545' : 
                                                  entry.backdated_severity === 'HIGH' ? '#fd7e14' : 
                                                  entry.backdated_severity === 'MEDIUM' ? '#ffc107' : '#28a745',
                                 color: 'white',
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
                               {entry.document_number || 'N/A'}
                             </Typography>
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
              
              {/* Pagination Controls */}
              {pagination.count > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mt: 3,
                  p: 2,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: '#6c757d' }}>
                      Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.count)} of {pagination.count} entries
                    </Typography>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Page Size</InputLabel>
                      <Select
                        value={pagination.pageSize}
                        label="Page Size"
                        onChange={(e) => handlePageSizeChange(e.target.value)}
                        sx={{ fontSize: '0.875rem' }}
                      >
                        <MenuItem value={5}>5 per page</MenuItem>
                        <MenuItem value={10}>10 per page</MenuItem>
                        <MenuItem value={25}>25 per page</MenuItem>
                        <MenuItem value={50}>50 per page</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <Pagination
                    count={Math.ceil(pagination.count / pagination.pageSize)}
                    page={pagination.currentPage}
                    onChange={(event, newPage) => handlePageChange(newPage)}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* No Data State */}
          {!loading && !error && backdatedListing.length === 0 && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                No Backdated Entries Found
              </Typography>
              <Typography variant="body2">
                The API returned no backdated entries for this analysis. This could mean either no backdated entries were found, or the data is still being processed.
              </Typography>
            </Alert>
          )}

          {/* API Data Summary */}
          {!loading && !error && backdatedListing.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: '#2c3e50',
                fontSize: '1.1rem'
              }}>
                API Data Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item size={{xs: 6, sm: 3}}>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#e65100',
                      fontSize: '1.5rem'
                    }}>
                      {pagination.count}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.875rem'
                    }}>
                      Total Entries
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, sm: 3}}>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#e65100',
                      fontSize: '1.5rem'
                    }}>
                      {formatCurrency(backdatedListing.reduce((sum, entry) => sum + (parseFloat(entry.amount || entry.amount_local_currency || 0)), 0))}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.875rem'
                    }}>
                      Total Amount
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, sm: 3}}>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#e65100',
                      fontSize: '1.5rem'
                    }}>
                      {Math.round(backdatedListing.reduce((sum, entry) => sum + Math.abs(entry.days_difference || 0), 0) / backdatedListing.length)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.875rem'
                    }}>
                      Avg Days Diff
                    </Typography>
                  </Box>
                </Grid>
                <Grid item size={{xs: 6, sm: 3}}>
                  <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#e65100',
                      fontSize: '1.5rem'
                    }}>
                      {new Set(backdatedListing.map(entry => entry.user || entry.user_name)).size}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.875rem'
                    }}>
                      Unique Users
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* All Content in One View */}
      <Grid container spacing={3} sx={{ mt: 3 }}>

        {/* Section 2: Recommendations */}
        {recommendations && recommendations.length > 0 && (
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
                  Recommendations
                </Typography>
                <Grid container spacing={2}>
                  {recommendations.map((rec, index) => (
                    <Grid item size={{xs: 12, md: 6}} key={index}>
                      <Box sx={{ 
                        p: 2, 
                        background: '#f8f9fa', 
                        borderRadius: 2, 
                        border: '1px solid #e9ecef',
                        height: '100%'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: '#2c3e50',
                            fontSize: '1rem'
                          }}>
                            {rec.action}
                          </Typography>
                          <Chip 
                            label={rec.priority} 
                            size="small"
                            sx={{ 
                              backgroundColor: rec.priority === 'HIGH' ? '#dc3545' : rec.priority === 'MEDIUM' ? '#ffc107' : '#28a745',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ 
                          color: '#6c757d',
                          fontSize: '0.875rem'
                        }}>
                          {rec.description}
                        </Typography>
                        {rec.count && (
                          <Typography variant="caption" sx={{ 
                            color: '#e65100',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}>
                            Count: {rec.count}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Section 3: Audit Implications */}
        {auditImplications && Object.keys(auditImplications).length > 0 && (
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
                  Audit Implications
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Immediate Actions */}
                  {auditImplications.immediate_actions && (
                    <Grid item size={{xs: 12, md: 4}}>
                      <Box sx={{ p: 2, background: '#fff3e0', borderRadius: 2, border: '1px solid #ffcc02' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: '#e65100',
                          fontSize: '1.1rem'
                        }}>
                          Immediate Actions
                        </Typography>
                        <List dense>
                          {auditImplications.immediate_actions.map((action, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <WarningIcon sx={{ color: '#e65100', fontSize: 16 }} />
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
                    </Grid>
                  )}

                  {/* Follow-up Actions */}
                  {auditImplications.follow_up_actions && (
                    <Grid item size={{xs: 12, md: 4}}>
                      <Box sx={{ p: 2, background: '#e8f5e8', borderRadius: 2, border: '1px solid #28a745' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: '#28a745',
                          fontSize: '1.1rem'
                        }}>
                          Follow-up Actions
                        </Typography>
                        <List dense>
                          {auditImplications.follow_up_actions.map((action, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <InfoIcon sx={{ color: '#28a745', fontSize: 16 }} />
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
                    </Grid>
                  )}

                  {/* Compliance Considerations */}
                  {auditImplications.compliance_considerations && (
                    <Grid item size={{xs: 12, md: 4}}>
                      <Box sx={{ p: 2, background: '#e3f2fd', borderRadius: 2, border: '1px solid #2196f3' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 600, 
                          mb: 2, 
                          color: '#2196f3',
                          fontSize: '1.1rem'
                        }}>
                          Compliance Considerations
                        </Typography>
                        <List dense>
                          {auditImplications.compliance_considerations.map((consideration, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <InfoIcon sx={{ color: '#2196f3', fontSize: 16 }} />
                              </ListItemIcon>
                              <ListItemText 
                                primary={consideration}
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
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Show raw data for debugging if no structured data */}
      {(!backdatedEntries || backdatedEntries.length === 0) && 
       (!recommendations || recommendations.length === 0) && 
       (!auditImplications || Object.keys(auditImplications).length === 0) && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          No structured backdated data found. Raw response:
        </Alert>
              )}

      <DuplicateDetailDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        duplicate={selectedBackdated}
        type="Backdated Analysis"
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