/** @format */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Card,
  CardContent
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { getRiskColor } from '../../utils/colorScheme';
import logoFull from "../../assets/full_logo.svg";

// Import chart components
import RiskDistributionChart from '../charts/RiskDistributionChart';
import AnomaliesDistributionChart from '../charts/AnomaliesDistributionChart';

// Import Recharts for custom gradient charts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Area, AreaChart } from 'recharts';

// Error boundary for chart components
const PDFChartWrapper = ({ title, children, fallbackContent }) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, bgcolor: '#f9f9f9' }}>
        <Typography variant="h6" sx={{ mb: 1, fontSize: '0.9rem', fontWeight: 600 }}>
          {title}
        </Typography>
        {fallbackContent}
      </Box>
    );
  }

  return (
    <Box onError={handleError}>
      {children}
    </Box>
  );
};

// Error boundary class component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PDF Chart Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Chart unavailable</div>;
    }

    return this.props.children;
  }
}

const FallbackChartContent = ({ title, data, currency = 'SAR' }) => {
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

  const renderSimpleChart = () => {
    if (!data || !data.labels || data.labels.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: 'center', color: '#666' }}>
          <Typography variant="body2">No data available</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 1 }}>
        {data.labels.map((label, index) => (
          <Box key={index} sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1,
            p: 1,
            bgcolor: '#f5f5f5',
            borderRadius: 1
          }}>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
              {label}
            </Typography>
            <Typography variant="body2" sx={{ 
              fontWeight: 600, 
              fontSize: '0.8rem',
              color: '#e65100'
            }}>
              {data.data[index] || 0}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, bgcolor: '#f9f9f9' }}>
      <Typography variant="h6" sx={{ mb: 2, fontSize: '1rem', fontWeight: 600, color: '#333' }}>
        {title}
      </Typography>
      {renderSimpleChart()}
    </Box>
  );
};

const BackdatedAnalysisPDF = ({
  open,
  setOpen,
  data,
  currency = 'SAR'
}) => {
  const [pdfContent, setPdfContent] = useState(null);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const getRiskLevelNumber = (score) => {
    if (score >= 80) return 4;
    if (score >= 60) return 3;
    if (score >= 40) return 2;
    return 1;
  };

  useEffect(() => {
    if (open && data) {
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

      const content = (
        <Box sx={{ p: 3, maxWidth: '100%', bgcolor: 'white' }}>
          {/* Header Section - Similar to DuplicateAnalysisPDF */}
          <Box sx={{ 
            borderBottom: '4px solid #e65100', 
            pb: 3, 
            mb: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            {/* Left Section */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: '#2c3e50', 
                mb: 1,
                fontSize: '2rem'
              }}>
                Backdated Analysis
              </Typography>
              <Typography variant="body1" sx={{ color: '#6c757d', mb: 0.5 }}>
                <strong>Analysis ID:</strong> {fileInfo.file_id || "N/A"}
              </Typography>
              <Typography variant="body1" sx={{ color: '#6c757d', mb: 0.5 }}>
                <strong>Status:</strong> {fileInfo.status || "COMPLETED"}
              </Typography>
              <Typography variant="body1" sx={{ color: '#6c757d' }}>
                <strong>Currency:</strong> {currency}
              </Typography>
            </Box>

            {/* Center Section - Logo */}
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center'
            }}>
              <img 
                src={logoFull} 
                alt="Company Logo" 
                style={{ 
                  width: 200, 
                  height: 'auto',
                  maxHeight: 60
                }} 
              />
            </Box>

            {/* Right Section */}
            <Box sx={{ flex: 1, textAlign: 'right' }}>
              <Typography variant="body1" sx={{ color: '#6c757d', mb: 0.5 }}>
                Generated on {new Date().toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ color: '#6c757d', mb: 0.5 }}>
                Analysis Date: {formatDate(analysisInfo.analysis_date)}
              </Typography>
              <Typography variant="body1" sx={{ color: '#6c757d', mb: 0.5 }}>
                <strong>Risk Level:</strong> {riskLevel}
              </Typography>
              <Typography variant="body1" sx={{ color: '#6c757d' }}>
                <strong>Total Backdated:</strong> {totalBackdated}
              </Typography>
            </Box>
          </Box>

          {/* Analysis Overview Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              mb: 3, 
              color: '#2c3e50',
              fontSize: '1.25rem'
            }}>
              Backdated Analysis Overview
            </Typography>
            <Box sx={{ 
              p: 3, 
              backgroundColor: '#f8f9fa', 
              border: '1px solid #e9ecef', 
              borderRadius: 2,
              mb: 3
            }}>
              <Typography variant="body1" sx={{ 
                mb: 2, 
                fontSize: '1rem', 
                lineHeight: 1.6,
                color: '#333'
              }}>
                <strong>Test Description:</strong> This test identifies all the Journal Lines for which the Posting Date is after the Effective Date, i.e backdated entries. Both date fields are required to be present in the GL data for this test.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: 'white', 
                    border: '1px solid #dee2e6', 
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100', mb: 1 }}>
                      Detection Criteria
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                      Posting Date &gt; Effective Date
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: 'white', 
                    border: '1px solid #dee2e6', 
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100', mb: 1 }}>
                      Required Fields
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                      Both Posting Date and Effective Date must be present
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: 'white', 
                    border: '1px solid #dee2e6', 
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e65100', mb: 1 }}>
                      Risk Assessment
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#6c757d' }}>
                      Higher risk for longer date differences
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ 
                    p: 2, 
                    backgroundColor: 'white', 
                    border: '1px solid #dee2e6', 
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
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
          </Box>

          {/* Analysis Summary Table */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              mb: 3, 
              color: '#2c3e50',
              fontSize: '1.25rem'
            }}>
              Analysis Summary
            </Typography>
            <Grid container spacing={3}>
              {/* Overall Risk Assessment */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                  p: 2, 
                  border: '1px solid #e9ecef',
                  height: '100%'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 2, 
                    color: '#2c3e50',
                    fontSize: '1rem'
                  }}>
                    Overall Risk Assessment
                  </Typography>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ 
                      fontWeight: 700, 
                      color: '#e65100',
                      mb: 1
                    }}>
                      {Math.round(overallRiskScore)}%
                    </Typography>
                    <Chip 
                      label={riskLevel} 
                      sx={{ 
                        backgroundColor: getRiskColor(riskLevel),
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Backdated Statistics */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                  p: 2, 
                  border: '1px solid #e9ecef',
                  height: '100%'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 2, 
                    color: '#2c3e50',
                    fontSize: '1rem'
                  }}>
                    Backdated Statistics
                  </Typography>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Total Backdated:</strong> {totalBackdated}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Total Transactions:</strong> {totalTransactions}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Total Amount:</strong> {formatCurrency(summaryStats.total_backdated_amount || 0)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Backdated %:</strong> {summaryStats.backdated_percentage?.toFixed(2) || 0}%
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* File Information */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                  p: 2, 
                  border: '1px solid #e9ecef',
                  height: '100%'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 2, 
                    color: '#2c3e50',
                    fontSize: '1rem'
                  }}>
                    File Information
                  </Typography>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>File ID:</strong> {fileInfo.file_id || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Status:</strong> {fileInfo.status || "COMPLETED"}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Currency:</strong> {currency}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Analysis Date:</strong> {formatDate(analysisInfo.analysis_date)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {/* Analysis Details */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                  p: 2, 
                  border: '1px solid #e9ecef',
                  height: '100%'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 2, 
                    color: '#2c3e50',
                    fontSize: '1rem'
                  }}>
                    Analysis Details
                  </Typography>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Avg Days Diff:</strong> {summaryStats.avg_backdated_days || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Avg Amount:</strong> {formatCurrency(summaryStats.avg_backdated_amount || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Max Risk Score:</strong> {summaryStats.max_risk_score || 0}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Max Days Diff:</strong> {summaryStats.max_backdated_days || 0}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Critical Alerts */}
          {criticalAlerts && criticalAlerts.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: '#2c3e50',
                fontSize: '1.25rem'
              }}>
                Critical Alerts
              </Typography>
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
          {riskAssessment.high_risk_backdated && riskAssessment.high_risk_backdated.length > 0 && (
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
                <ErrorIcon sx={{ color: '#dc3545', fontSize: 24 }} />
                High Risk Backdated Transactions
              </Typography>
              <Grid container spacing={2}>
                {riskAssessment.high_risk_backdated.map((transaction, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card sx={{ 
                      background: '#fff5f5', 
                      borderRadius: 2,
                      border: '1px solid #fecaca',
                      boxShadow: '0 2px 8px rgba(220, 53, 69, 0.1)'
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600, 
                            color: '#dc3545',
                            fontSize: '0.9rem'
                          }}>
                            {transaction.user_name}
                          </Typography>
                          <Chip 
                            label={`${transaction.overall_risk_score}%`} 
                            size="small"
                            sx={{ 
                              backgroundColor: '#dc3545',
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
                          Account: {transaction.gl_account} • Amount: {formatCurrency(transaction.amount_local_currency)}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#6c757d',
                          fontSize: '0.8rem'
                        }}>
                          Posting Date: {new Date(transaction.posting_date).toLocaleDateString()} • 
                          Backdated Days: {transaction.backdated_days}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
                    )}

          {/* Charts Dashboard */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Risk Distribution Chart */}
            <Grid item size={{xs: 12, md: 6}}>
            
                  <ErrorBoundary fallback={
                    <FallbackChartContent 
                      title="Risk Level Distribution" 
                      data={chartData.risk_level_distribution || {
                        labels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                        data: [
                          riskAssessment.risk_distribution?.low_risk || 0,
                          riskAssessment.risk_distribution?.medium_risk || 0,
                          riskAssessment.risk_distribution?.high_risk || 0,
                          riskAssessment.risk_distribution?.critical_risk || 0
                        ]
                      }}
                      currency={currency}
                    />
                  }>
                    <PDFChartWrapper 
                      title="Risk Level Distribution"
                      fallbackContent={
                        <FallbackChartContent 
                          title="Risk Level Distribution" 
                          data={chartData.risk_level_distribution || {
                            labels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                            data: [
                              riskAssessment.risk_distribution?.low_risk || 0,
                              riskAssessment.risk_distribution?.medium_risk || 0,
                              riskAssessment.risk_distribution?.high_risk || 0,
                              riskAssessment.risk_distribution?.critical_risk || 0
                            ]
                          }}
                          currency={currency}
                        />
                      }
                    >
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
                    </PDFChartWrapper>
                  </ErrorBoundary>

            </Grid>
            
            {/* Days Difference Distribution Chart */}
            <Grid item size={{xs: 12, md: 6}}>
           
                  <ErrorBoundary fallback={
                    <FallbackChartContent 
                      title="Backdated Days Distribution" 
                      data={(() => {
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
                      currency={currency}
                    />
                  }>
                    <PDFChartWrapper 
                      title="Backdated Days Distribution"
                      fallbackContent={
                        <FallbackChartContent 
                          title="Backdated Days Distribution" 
                          data={(() => {
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
                          currency={currency}
                        />
                      }
                    >
                      <AnomaliesDistributionChart 
                        data={(() => {
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
                    </PDFChartWrapper>
                  </ErrorBoundary>

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
          {backdatedEntries && backdatedEntries.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: '#2c3e50',
                fontSize: '1.25rem'
              }}>
                Backdated Entry Summary
              </Typography>
              <Grid container spacing={3}>
                {backdatedEntries.map((entry, index) => (
                  <Grid item size={{xs: 12, sm: 6, md: 4}} key={index}>
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
                              label={entry.risk_level?.toUpperCase() || 'UNKNOWN'}
                              size="small"
                              sx={{ 
                                backgroundColor: getRiskColor(entry.risk_level?.toUpperCase()),
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
                                {formatCurrency(entry.amount)}
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
                            <strong>Risk Score:</strong> {entry.risk_score || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#6c757d',
                            fontSize: '0.875rem'
                          }}>
                            <strong>Type:</strong> {entry.transaction_type || 'N/A'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: '#2c3e50',
                fontSize: '1.3rem'
              }}>
                Recommendations
              </Typography>
              <Grid container spacing={2}>
                {recommendations.map((rec, index) => (
                  <Grid item size={{xs: 12, md: 6}} key={index}>
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: '#f8f9fa', 
                      borderRadius: 1, 
                      border: '1px solid #e9ecef'
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
            </Paper>
          )}

          {/* Audit Implications */}
          {auditImplications && Object.keys(auditImplications).length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: '#2c3e50',
                fontSize: '1.3rem'
              }}>
                Audit Implications
              </Typography>
              
              <Grid container spacing={3}>
                {/* Immediate Actions */}
                {auditImplications.immediate_actions && (
                  <Grid item size={{xs: 12, md: 4}}>
                    <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ffcc02' }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        mb: 2, 
                        color: '#e65100',
                        fontSize: '1rem'
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
                    <Box sx={{ p: 2, bgcolor: '#e8f5e8', borderRadius: 1, border: '1px solid #28a745' }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        mb: 2, 
                        color: '#28a745',
                        fontSize: '1rem'
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
                    <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #2196f3' }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        mb: 2, 
                        color: '#2196f3',
                        fontSize: '1rem'
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
            </Paper>
          )}

          {/* Detailed Analysis Tables */}
          {backdatedEntries && backdatedEntries.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: '#2c3e50',
                fontSize: '1.25rem'
              }}>
                Detailed Analysis Tables
              </Typography>

              {/* Detailed Backdated Entries Table */}
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
                  <WarningIcon sx={{ color: '#e65100', fontSize: 20 }} />
                  Detailed Backdated Entries Analysis
                </Typography>
                <TableContainer sx={{ border: '1px solid #e9ecef' }}>
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
                        <TableCell align="center">Risk Level</TableCell>
                        <TableCell align="right">Risk Score</TableCell>
                        <TableCell>Transaction Type</TableCell>
                        <TableCell>Document Number</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {backdatedEntries.map((entry, index) => (
                        <TableRow 
                          key={index}
                          sx={{ 
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
                                {(entry.transaction_id || entry.id || entry.gl_account || 'T')?.charAt(0) || 'T'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 600, 
                                  color: '#2c3e50',
                                  fontSize: '0.875rem'
                                }}>
                                  {entry.transaction_id || entry.id || entry.gl_account || `Entry-${index + 1}`}
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  color: '#6c757d',
                                  fontSize: '0.75rem'
                                }}>
                                  Entry #{index + 1}
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
                              {entry.user || entry.user_name || entry.created_by || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip 
                              label={entry.account || entry.gl_account || entry.account_code || 'N/A'}
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
                              {entry.document_date || entry.effective_date ? new Date(entry.document_date || entry.effective_date).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip 
                              label={`${entry.days_difference || entry.date_difference || 0} days`} 
                              size="small"
                              sx={{ 
                                backgroundColor: Math.abs(entry.days_difference || entry.date_difference || 0) > 30 ? '#dc3545' : Math.abs(entry.days_difference || entry.date_difference || 0) > 7 ? '#ffc107' : '#28a745',
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
                              {formatCurrency(entry.amount || entry.amount_local_currency || entry.debit_amount || entry.credit_amount || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ py: 2 }}>
                            <Chip 
                              label={(entry.risk_level || entry.risk_category || 'UNKNOWN')?.toUpperCase()} 
                              size="small"
                              sx={{ 
                                backgroundColor: getRiskColor((entry.risk_level || entry.risk_category || 'UNKNOWN')?.toUpperCase()),
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ py: 2 }}>
                            <Chip 
                              label={entry.risk_score || entry.overall_risk_score || 'N/A'} 
                              size="small"
                              sx={{ 
                                backgroundColor: (entry.risk_score || entry.overall_risk_score || 0) > 70 ? '#dc3545' : (entry.risk_score || entry.overall_risk_score || 0) > 40 ? '#ffc107' : '#28a745',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip 
                              label={entry.transaction_type || entry.type || entry.dc_indicator || 'N/A'} 
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderColor: (entry.transaction_type || entry.type || entry.dc_indicator) === 'DEBIT' || (entry.transaction_type || entry.type || entry.dc_indicator) === 'D' ? '#dc3545' : '#28a745',
                                color: (entry.transaction_type || entry.type || entry.dc_indicator) === 'DEBIT' || (entry.transaction_type || entry.type || entry.dc_indicator) === 'D' ? '#dc3545' : '#28a745',
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
                              {entry.document_number || entry.doc_number || entry.reference || 'N/A'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          )}

          {/* Footer */}
          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #e9ecef', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#6c757d' }}>
              Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6c757d' }}>
              Analysis Version: {analysisInfo.analysis_version || '1.0.0'}
            </Typography>
          </Box>
        </Box>
      );

      setPdfContent(content);
    }
  }, [open, data, currency]);

  const handlePrint = () => {
    // Generate simple HTML content for printing
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Backdated Analysis Report</title>
          <style>
            @media print {
              body { margin: 0; padding: 15px; }
              .page-break { page-break-before: always; }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 15px; 
              line-height: 1.4;
              color: #333;
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #e65100; 
              padding-bottom: 15px; 
            }
            .section { 
              margin-bottom: 20px; 
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 10px 0; 
              font-size: 11px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px; 
              text-align: left; 
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold; 
            }
            .footer { 
              margin-top: 30px; 
              text-align: center; 
              color: #666; 
              border-top: 1px solid #ddd; 
              padding-top: 15px; 
            }
            .risk-badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 10px;
              font-weight: bold;
              color: white;
            }
            .risk-critical { background-color: #dc3545; }
            .risk-high { background-color: #fd7e14; }
            .risk-medium { background-color: #ffc107; color: #333; }
            .risk-low { background-color: #28a745; }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin: 15px 0;
            }
            .stat-card {
              border: 1px solid #ddd;
              padding: 10px;
              border-radius: 4px;
              background-color: #f9f9f9;
            }
            h1 { color: #2c3e50; margin: 0 0 10px 0; font-size: 18px; }
            h2 { color: #2c3e50; margin: 0 0 10px 0; font-size: 16px; }
            h3 { color: #e65100; margin: 0 0 8px 0; font-size: 14px; }
            .alert {
              padding: 8px;
              border-radius: 4px;
              margin: 8px 0;
              border-left: 3px solid;
            }
            .alert-error {
              background-color: #f8d7da;
              border-color: #dc3545;
              color: #721c24;
            }
            .alert-warning {
              background-color: #fff3cd;
              border-color: #ffc107;
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Backdated Analysis Report</h1>
            <p><strong>Analysis ID:</strong> ${data?.file_info?.file_id || "N/A"}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Risk Level:</strong> ${data?.risk_assessment?.risk_level || 'LOW'}</p>
          </div>
          
          <div class="section">
            <h2>Summary Statistics</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <h3>Risk Score</h3>
                <p style="font-size: 24px; font-weight: bold; color: #e65100; margin: 5px 0;">
                  ${Math.round(data?.risk_assessment?.overall_risk_score || 0)}%
                </p>
                <span class="risk-badge risk-${(data?.risk_assessment?.risk_level || 'low').toLowerCase()}">
                  ${data?.risk_assessment?.risk_level || 'LOW'}
                </span>
              </div>
              <div class="stat-card">
                <h3>Backdated Entries</h3>
                <p><strong>Total:</strong> ${data?.summary_statistics?.backdated_transactions || 0}</p>
                <p><strong>Percentage:</strong> ${(data?.summary_statistics?.backdated_percentage || 0).toFixed(2)}%</p>
                <p><strong>Amount:</strong> ${formatCurrency(data?.summary_statistics?.total_backdated_amount || 0)}</p>
              </div>
              <div class="stat-card">
                <h3>File Details</h3>
                <p><strong>File ID:</strong> ${data?.file_info?.file_id || "N/A"}</p>
                <p><strong>Status:</strong> ${data?.file_info?.status || "COMPLETED"}</p>
                <p><strong>Currency:</strong> ${currency}</p>
              </div>
              <div class="stat-card">
                <h3>Analysis Details</h3>
                <p><strong>Avg Days:</strong> ${data?.summary_statistics?.avg_backdated_days || 0}</p>
                <p><strong>Avg Amount:</strong> ${formatCurrency(data?.summary_statistics?.avg_backdated_amount || 0)}</p>
                <p><strong>Max Days:</strong> ${data?.summary_statistics?.max_backdated_days || 0}</p>
              </div>
            </div>
          </div>
          
          ${data?.critical_alerts && data.critical_alerts.length > 0 ? `
            <div class="section">
              <h2>Critical Alerts</h2>
              ${data.critical_alerts.map(alert => `
                <div class="alert alert-${alert.severity === 'HIGH' ? 'error' : 'warning'}">
                  <strong>${alert.message}</strong><br>
                  Action: ${alert.action_required}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${data?.backdated_entries && data.backdated_entries.length > 0 ? `
            <div class="page-break"></div>
            <div class="section">
              <h2>Backdated Entries (${data.backdated_entries.length})</h2>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Account</th>
                    <th>Posting Date</th>
                    <th>Doc Date</th>
                    <th>Days</th>
                    <th>Amount</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                                     ${data.backdated_entries.map(entry => `
                     <tr>
                       <td>${entry.transaction_id || entry.id || entry.gl_account || 'N/A'}</td>
                       <td>${entry.user || entry.user_name || entry.created_by || 'N/A'}</td>
                       <td>${entry.account || entry.gl_account || entry.account_code || 'N/A'}</td>
                       <td>${entry.posting_date ? new Date(entry.posting_date).toLocaleDateString() : 'N/A'}</td>
                       <td>${entry.document_date || entry.effective_date ? new Date(entry.document_date || entry.effective_date).toLocaleDateString() : 'N/A'}</td>
                       <td>${entry.days_difference || entry.date_difference || 0}</td>
                       <td>${formatCurrency(entry.amount || entry.amount_local_currency || entry.debit_amount || entry.credit_amount || 0)}</td>
                       <td><span class="risk-badge risk-${(entry.risk_level || entry.risk_category || 'low').toLowerCase()}">${(entry.risk_level || entry.risk_category || 'UNKNOWN')?.toUpperCase()}</span></td>
                     </tr>
                   `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}
          
          ${data?.recommendations && data.recommendations.length > 0 ? `
            <div class="section">
              <h2>Recommendations</h2>
              ${data.recommendations.map((rec, index) => `
                <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                  <h3>${index + 1}. ${rec.action}</h3>
                  <p>${rec.description}</p>
                  ${rec.count ? `<p><strong>Count:</strong> ${rec.count}</p>` : ''}
                  <span class="risk-badge risk-${rec.priority.toLowerCase()}">${rec.priority}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Analysis Version: ${data?.analysis_info?.analysis_version || '1.0.0'}</p>
          </div>
        </body>
      </html>
    `;

    // Create print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
      
      // Fallback if onload doesn't fire
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ 
          height: '100%', 
          overflow: 'auto',
          bgcolor: '#f8f9fa'
        }}>
          {pdfContent}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
        <Button onClick={() => setOpen(false)}>
          Close
        </Button>
        <Button 
          onClick={handlePrint}
          variant="contained"
          startIcon={<PrintIcon />}
          sx={{
            backgroundColor: '#e65100',
            color: 'white',
            '&:hover': {
              backgroundColor: '#d84315'
            }
          }}
        >
          Print Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BackdatedAnalysisPDF; 