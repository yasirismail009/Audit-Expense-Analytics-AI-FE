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
  Badge,
  Button,
  Paper
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  Weekend as WeekendIcon,
  Assessment as AssessmentIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Security as SecurityIcon,
  Timeline as TimelineIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { getRiskColor } from '../../utils/colorScheme';

// Import chart dashboard
import UnusualDaysDashboard from '../charts/UnusualDaysDashboard';

// Import PDF component
import UnusualDaysAnalysisPDF from './UnusualDaysAnalysisPDF';

export default function UnusualDaysAnalysisContent({ data, distributionData, anomalySummary }) {
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const handlePdfOpen = () => {
    setPdfModalOpen(true);
  };

  const handlePdfClose = () => {
    setPdfModalOpen(false);
  };

  // Extract currency from data or use default
  const currency = data?.currency || data?.file_info?.currency || 'SAR';

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

  // Extract data from the API structure
  const summary = data?.summary || {};
  const unusualDaysAnalysis = data?.unusual_days_analysis || {};
  const weekendPostings = unusualDaysAnalysis.weekend_postings || [];
  const unusualDays = unusualDaysAnalysis.unusual_days || [];
  const dayOfWeekActivity = unusualDaysAnalysis.day_of_week_activity || {};
  const userDayPatterns = unusualDaysAnalysis.user_day_patterns || [];
  const fsLineDayPatterns = unusualDaysAnalysis.fs_line_day_patterns || [];
  const riskAssessment = data?.risk_assessment || {};
  const analysisInfo = data?.analysis_info || {};

  // Calculate totals
  const totalWeekendTransactions = weekendPostings.length;
  const totalWeekendAmount = weekendPostings.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
  const totalUnusualDays = unusualDays.length;
  const avgRiskScore = weekendPostings.length > 0 ? 
    weekendPostings.reduce((sum, transaction) => sum + (transaction.risk_score || 0), 0) / weekendPostings.length : 0;
  const overallRiskLevel = getRiskLevel(avgRiskScore);

  // Get unique users from weekend postings
  const uniqueUsers = [...new Set(weekendPostings.map(t => t.user_name))];

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa', p: 3 }}>
      {/* Analysis Status */}
      <Alert 
        severity={weekendPostings.length > 0 ? "warning" : "success"} 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={weekendPostings.length > 0 ? <WarningIcon /> : <InfoIcon />}
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<PictureAsPdfIcon />}
            onClick={handlePdfOpen}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
            }}
          >
            Download PDF
          </Button>
        }
      >
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {weekendPostings.length > 0 
            ? `Found ${weekendPostings.length} weekend transactions involving ${uniqueUsers.length} users`
            : "No unusual days anomalies found"
          }
        </Typography>
        {weekendPostings.length > 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Total amount involved: {formatCurrency(totalWeekendAmount)}
          </Typography>
        )}
      </Alert>

      {/* Unusual Days Analysis Definitions */}
      <Alert 
        severity="info" 
        sx={{ mb: 3, borderRadius: 2 }}
        icon={<InfoIcon />}
      >
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
          Unusual Days Analysis Classification
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          This analysis identifies transactions on unusual business days (weekends, holidays, etc.) and patterns that deviate from normal business operations.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item size={{xs: 12, sm: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Weekend Postings
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Transactions posted on weekends (Friday/Saturday)
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, sm: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  High Activity Days
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Days with unusually high transaction volumes
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, sm: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Low Activity Days
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Days with unusually low transaction volumes
                </Typography>
              </Box>
            </Grid>
            <Grid item size={{xs: 12, sm: 6}}>
              <Box sx={{ p: 2, backgroundColor: 'rgba(146, 90, 155, 0.1)', borderRadius: 2, border: '1px solid rgba(146, 90, 155, 0.3)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#925a9b', mb: 1 }}>
                  Holiday Patterns
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                  Transactions on holidays or non-business days
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
                Unusual Days Analysis
              </Typography>
              <Typography variant="body1" sx={{ color: '#6c757d', mb: 0.5 }}>
                Analysis Date: {new Date(analysisInfo.analysis_date || Date.now()).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d' }}>
                Status: {analysisInfo.status || 'COMPLETED'} • Unusual Days: {totalUnusualDays}
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
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handlePdfOpen}
                  sx={{
                    backgroundColor: '#925a9b',
                    '&:hover': { backgroundColor: '#7a4a82' },
                    borderRadius: 2,
                    px: 3,
                    py: 1
                  }}
                >
                  Download PDF Report
                </Button>
              </Box>
              <Grid container spacing={2}>
                <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <WeekendIcon sx={{ 
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
                      {totalWeekendTransactions}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Weekend Transactions
                    </Typography>
                  </Box>
                </Grid>
                    <Grid item size={{xs: 6, md: 3}}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CalendarIcon sx={{ 
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
                      {totalUnusualDays}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Unusual Days
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
                      {formatCurrency(totalWeekendAmount)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Weekend Amount
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
                      {uniqueUsers.length}
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
                      {summary.total_transactions || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Total Transactions
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
                      {summary.overall_risk_score?.toFixed(1) || 0}%
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#6c757d',
                      fontSize: '0.8rem'
                    }}>
                      Risk Score
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Distribution Overview */}
      {distributionData && (
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
              <TrendingUpIcon sx={{ mr: 1, color: '#925a9b' }} />
              Unusual Days Distribution Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item size={{xs: 12, md: 3}}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                    {distributionData.count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unusual Days Found
                  </Typography>
                </Box>
              </Grid>
              <Grid item size={{xs: 12, md: 3}}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    {distributionData.percentage?.toFixed(1) || 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    of Total Anomalies
                  </Typography>
                </Box>
              </Grid>
              <Grid item size={{xs: 12, md: 3}}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                    {anomalySummary?.total_anomalies || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Anomalies
                  </Typography>
                </Box>
              </Grid>
              <Grid item size={{xs: 12, md: 3}}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                    {anomalySummary ? Object.keys(anomalySummary).filter(key => 
                      key !== 'total_anomalies' && (anomalySummary[key] || 0) > 0
                    ).length : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Anomaly Types
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Summary Metrics */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item size={{xs: 12, md: 3}}>
            <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0', border: '1px solid #ffcc02' }}>
              <Typography variant="h6" color="#e65100">
                {summary.unusual_days_detected || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unusual Days
              </Typography>
            </Card>
          </Grid>
          <Grid item size={{xs: 12, md: 3}}>
            <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
              <Typography variant="h6" color="#2e7d32">
                {summary.total_transactions || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Transactions
              </Typography>
            </Card>
          </Grid>
          <Grid item size={{xs: 12, md: 3}}>
            <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd', border: '1px solid #2196f3' }}>
              <Typography variant="h6" color="#1565c0">
                {formatCurrency(totalWeekendAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Weekend Amount
              </Typography>
            </Card>
          </Grid>
          <Grid item size={{xs: 12, md: 3}}>
            <Card sx={{ p: 2, textAlign: 'center', bgcolor: '#fce4ec', border: '1px solid #e91e63' }}>
              <Typography variant="h6" color="#c2185b">
                {summary.weekend_postings || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Weekend Transactions
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}
      {/* Charts Dashboard */}
      <UnusualDaysDashboard data={data} />


      {/* Weekend Postings Table */}
      {weekendPostings.length > 0 && (
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
              <WeekendIcon sx={{ mr: 1, color: '#925a9b' }} />
              Weekend Postings Analysis
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>GL Account</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Day</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Risk Score</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Risk Level</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {weekendPostings.map((transaction, index) => (
                    <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {transaction.posting_date}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ 
                            mr: 2, 
                            bgcolor: getRiskColor(getRiskLevel(transaction.risk_score)),
                            width: 32,
                            height: 32
                          }}>
                            {transaction.user_name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            {transaction.user_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                          {transaction.gl_account}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.day_name} 
                          size="small"
                          color={transaction.day_name === 'Friday' ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={transaction.risk_score || 0}
                            sx={{ 
                              width: 60, 
                              mr: 1,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: '#e9ecef',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: getRiskColor(getRiskLevel(transaction.risk_score)),
                                borderRadius: 3
                              }
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                            {transaction.risk_score || 0}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getRiskLevel(transaction.risk_score || 0)} 
                          size="small"
                          sx={{
                            backgroundColor: getRiskColor(getRiskLevel(transaction.risk_score || 0)),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.7rem'
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
      )}

      {/* Unusual Days Table */}
      {unusualDays.length > 0 && (
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
              <CalendarIcon sx={{ mr: 1, color: '#925a9b' }} />
              Unusual Days Patterns
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Day</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Transaction Count</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Average Expected</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Deviation %</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Risk Level</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unusualDays.map((day, index) => (
                    <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {day.day_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={day.unusual_type.replace('_', ' ').toUpperCase()} 
                          size="small"
                          color={day.unusual_type === 'high_activity' ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                          {day.transaction_count}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                          {day.average_transactions}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                          {day.deviation_percentage?.toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={day.unusual_type === 'high_activity' ? 'HIGH' : 'MEDIUM'} 
                          size="small"
                          sx={{
                            backgroundColor: getRiskColor(day.unusual_type === 'high_activity' ? 'HIGH' : 'MEDIUM'),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.7rem'
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
      )}

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
            <Grid item xs={12} md={4}>
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
                  {riskAssessment.weekend_risk_score?.toFixed(1) || 0}%
                </Typography>
                <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                  Weekend Risk Score
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
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
                  {riskAssessment.unusual_pattern_risk_score?.toFixed(1) || 0}%
                </Typography>
                <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                  Pattern Risk Score
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
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
                  {riskAssessment.overall_risk_score?.toFixed(1) || 0}%
                </Typography>
                <Typography variant="body1" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                  Overall Risk Score
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Risk Recommendations */}
          {riskAssessment.risk_assessment?.recommendations && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50', fontWeight: 600 }}>
                Recommendations
              </Typography>
              <Grid container spacing={2}>
                {riskAssessment.risk_assessment.recommendations.map((recommendation, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: '#f8f9fa', 
                      borderRadius: 2, 
                      border: '1px solid #e9ecef',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <InfoIcon sx={{ mr: 1, color: '#925a9b' }} />
                      <Typography variant="body2" sx={{ color: '#2c3e50' }}>
                        {recommendation}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Raw Data Display */}
      <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Raw Analysis Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          {JSON.stringify(data, null, 2)}
        </Typography>
      </Paper>

      {/* PDF Modal */}
      <UnusualDaysAnalysisPDF
        open={pdfModalOpen}
        setOpen={setPdfModalOpen}
        data={data}
        currency={currency}
      />
    </Box>
  );
} 