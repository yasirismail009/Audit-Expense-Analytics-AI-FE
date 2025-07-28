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
  ListItemIcon
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { getRiskColor } from '../../utils/colorScheme';

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

      // Calculate overall risk score and level from new data structure
      const totalBackdated = summaryStats.backdated_transactions || 0;
      const overallRiskScore = riskAssessment.overall_risk_score || 0;
      const riskLevel = riskAssessment.risk_level || 'LOW';

      const content = (
        <Box sx={{ p: 3, maxWidth: '100%', bgcolor: 'white' }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '2px solid #e65100', pb: 2 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              color: '#2c3e50', 
              mb: 1,
              fontSize: '1.8rem'
            }}>
              Backdated Analysis Report
            </Typography>
            <Typography variant="body1" sx={{ color: '#6c757d', mb: 1 }}>
              {fileInfo.client_name} - {fileInfo.company_name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6c757d' }}>
              Analysis Date: {formatDate(analysisInfo.analysis_date)} • File: {fileInfo.file_name}
            </Typography>
          </Box>

          {/* Executive Summary */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              mb: 2, 
              color: '#2c3e50',
              fontSize: '1.3rem'
            }}>
              Executive Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item size={{xs: 6, md: 3}}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#e65100',
                    fontSize: '1.5rem'
                  }}>
                    {totalBackdated}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d' }}>
                    Backdated Entries
                  </Typography>
                </Box>
              </Grid>
              <Grid item size={{xs: 6, md: 3}}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#e65100',
                    fontSize: '1.5rem'
                  }}>
                    {formatCurrency(summaryStats.total_backdated_amount || 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d' }}>
                    Total Amount
                  </Typography>
                </Box>
              </Grid>
              <Grid item size={{xs: 6, md: 3}}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: '#e65100',
                    fontSize: '1.5rem'
                  }}>
                    {Math.round(overallRiskScore)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6c757d' }}>
                    Risk Score
                  </Typography>
                </Box>
              </Grid>
              <Grid item size={{xs: 6, md: 3}}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Chip 
                    label={riskLevel} 
                    sx={{ 
                      backgroundColor: getRiskColor(riskLevel),
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      px: 2,
                      py: 1
                    }}
                  />
                  <Typography variant="body2" sx={{ color: '#6c757d', mt: 1 }}>
                    Risk Level
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Critical Alerts */}
          {criticalAlerts && criticalAlerts.length > 0 && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#fff3e0', border: '1px solid #ffcc02' }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                mb: 2, 
                color: '#e65100',
                fontSize: '1.3rem'
              }}>
                Critical Alerts
              </Typography>
              {criticalAlerts.map((alert, index) => (
                <Alert 
                  key={index}
                  severity={alert.severity === 'HIGH' ? 'error' : 'warning'}
                  sx={{ mb: 2 }}
                  icon={alert.severity === 'HIGH' ? <ErrorIcon /> : <WarningIcon />}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {alert.message}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Action Required: {alert.action_required}
                  </Typography>
                </Alert>
              ))}
            </Paper>
          )}

          {/* Detailed Analysis */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              mb: 3, 
              color: '#2c3e50',
              fontSize: '1.3rem'
            }}>
              Detailed Analysis
            </Typography>

            {/* Summary Statistics */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item size={{xs: 12, md: 6}}>
                <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontSize: '1.1rem', fontWeight: 600 }}>
                    Summary Statistics
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ color: '#6c757d' }}>
                        Total Transactions:
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {summaryStats.total_transactions || 0}
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ color: '#6c757d' }}>
                        Backdated %:
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {summaryStats.backdated_percentage?.toFixed(2) || 0}%
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ color: '#6c757d' }}>
                        Avg Days Difference:
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {summaryStats.avg_backdated_days || 0}
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ color: '#6c757d' }}>
                        Avg Risk Score:
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {summaryStats.avg_risk_score?.toFixed(1) || 0}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid item size={{xs: 12, md: 6}}>
                <Box sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontSize: '1.1rem', fontWeight: 600 }}>
                    Risk Distribution
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ color: '#6c757d' }}>
                        Low Risk:
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {riskAssessment.risk_distribution?.low_risk || 0}
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ color: '#6c757d' }}>
                        Medium Risk:
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {riskAssessment.risk_distribution?.medium_risk || 0}
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ color: '#6c757d' }}>
                        High Risk:
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {riskAssessment.risk_distribution?.high_risk || 0}
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ color: '#6c757d' }}>
                        Critical Risk:
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 6}}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {riskAssessment.risk_distribution?.critical_risk || 0}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>

            {/* Backdated Entries Table */}
            {backdatedEntries && backdatedEntries.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontSize: '1.1rem', fontWeight: 600 }}>
                  Backdated Entries Details
                </Typography>
                <TableContainer sx={{ border: '1px solid #e9ecef' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Transaction ID</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Account</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Posting Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Document Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Days Diff</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }} align="right">Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }} align="center">Risk Level</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }} align="right">Risk Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {backdatedEntries.map((entry, index) => (
                        <TableRow key={index} sx={{ '&:nth-of-type(even)': { backgroundColor: '#fafbfc' } }}>
                          <TableCell sx={{ fontSize: '0.75rem' }}>
                            {entry.transaction_id}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>
                            {entry.user}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>
                            {entry.account}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>
                            {formatDate(entry.posting_date)}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>
                            {formatDate(entry.document_date)}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>
                            {entry.days_difference}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {formatCurrency(entry.amount)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={entry.risk_level?.toUpperCase()} 
                              size="small"
                              sx={{ 
                                backgroundColor: getRiskColor(entry.risk_level?.toUpperCase()),
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }}
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {entry.risk_score}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>

          {/* Charts Section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              mb: 3, 
              color: '#2c3e50',
              fontSize: '1.3rem'
            }}>
              Analysis Charts
            </Typography>
            <Grid container spacing={3}>
              <Grid item size={{xs: 12, md: 6}}>
                <ErrorBoundary fallback={
                  <FallbackChartContent 
                    title="Risk Level Distribution" 
                    data={chartData.risk_level_distribution}
                    currency={currency}
                  />
                }>
                  <PDFChartWrapper 
                    title="Risk Level Distribution"
                    fallbackContent={
                      <FallbackChartContent 
                        title="Risk Level Distribution" 
                        data={chartData.risk_level_distribution}
                        currency={currency}
                      />
                    }
                  >
                    <FallbackChartContent 
                      title="Risk Level Distribution" 
                      data={chartData.risk_level_distribution}
                      currency={currency}
                    />
                  </PDFChartWrapper>
                </ErrorBoundary>
              </Grid>
              <Grid item size={{xs: 12, md: 6}}>
                <ErrorBoundary fallback={
                  <FallbackChartContent 
                    title="Backdated Activity by User" 
                    data={chartData.backdated_activity_by_user}
                    currency={currency}
                  />
                }>
                  <PDFChartWrapper 
                    title="Backdated Activity by User"
                    fallbackContent={
                      <FallbackChartContent 
                        title="Backdated Activity by User" 
                        data={chartData.backdated_activity_by_user}
                        currency={currency}
                      />
                    }
                  >
                    <FallbackChartContent 
                      title="Backdated Activity by User" 
                      data={chartData.backdated_activity_by_user}
                      currency={currency}
                    />
                  </PDFChartWrapper>
                </ErrorBoundary>
              </Grid>
            </Grid>
          </Paper>

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

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Backdated Analysis Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e65100; padding-bottom: 20px; }
              .summary { background-color: #f8f9fa; padding: 20px; margin-bottom: 20px; border: 1px solid #e9ecef; }
              .chart { margin: 20px 0; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f8f9fa; font-weight: bold; }
              .footer { margin-top: 40px; text-align: center; color: #666; border-top: 1px solid #e9ecef; padding-top: 20px; }
            </style>
          </head>
          <body>
            ${pdfContent ? pdfContent.props.children.props.children.map(child => {
              if (child.type === 'div') {
                return child.props.children;
              }
              return child;
            }).join('') : 'Loading...'}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
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