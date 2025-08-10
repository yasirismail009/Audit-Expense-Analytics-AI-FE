import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Badge,
  Button,
  Card,
  CardContent
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  AccountBalance as AccountBalanceIcon,
  Event as EventIcon,
  HolidayVillage as HolidayIcon
} from '@mui/icons-material';
import { colorScheme, getRiskColor, formatCurrency } from '../utils/colorScheme';

export default function UnifiedAnomalyDrawer({ open, onClose, anomaly, type }) {
  if (!anomaly) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return '#dc3545';
      case 'HIGH': return '#dc3545';
      case 'MEDIUM': return '#ffc107';
      case 'LOW': return '#28a745';
      default: return colorScheme.textSecondary;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return <ErrorIcon />;
      case 'HIGH': return <ErrorIcon />;
      case 'MEDIUM': return <WarningIcon />;
      case 'LOW': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'Duplicate Analysis': return <TrendingUpIcon />;
      case 'Backdated Analysis': return <CalendarIcon />;
      case 'User Analysis': return <PersonIcon />;
      case 'Closing Analysis': return <EventIcon />;
      case 'Unusual Days Analysis': return <TimelineIcon />;
      case 'Holiday Analysis': return <HolidayIcon />;
      default: return <WarningIcon />;
    }
  };

  const getAnomalyColor = (type) => {
    switch (type) {
      case 'Duplicate Analysis': return '#925a9b';
      case 'Backdated Analysis': return '#e65100';
      case 'User Analysis': return '#36A2EB';
      case 'Closing Analysis': return '#4BC0C0';
      case 'Unusual Days Analysis': return '#9966FF';
      case 'Holiday Analysis': return '#FF9F40';
      default: return '#6c757d';
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const anomalyColor = getAnomalyColor(type);
  // Use the risk_level from the anomaly data, fallback to calculated risk level
  const riskLevel = anomaly.risk_level || getRiskLevel(anomaly.risk_score || 0);

  // Extract key information based on anomaly type
  const getKeyInfo = () => {
    switch (type) {
      case 'Duplicate Analysis':
        return {
          title: 'Duplicate Entry Details',
          subtitle: `Type: ${anomaly.duplicate_type || 'Unknown'}`,
          primaryInfo: [
            { label: 'Transaction ID', value: anomaly.transaction_id || 'N/A' },
            { label: 'User', value: anomaly.user || 'N/A' },
            { label: 'Account', value: anomaly.account || 'N/A' },
            { label: 'Amount', value: formatCurrency(anomaly.amount || 0) },
            { label: 'Similarity Score', value: anomaly.similarity_score ? `${(anomaly.similarity_score * 100).toFixed(1)}%` : 'N/A' },
            { label: 'Risk Level', value: anomaly.risk_level || 'N/A' },
            { label: 'Risk Score', value: anomaly.risk_score || 0 },
            { label: 'Duplicate Type', value: anomaly.duplicate_type || 'N/A' },
            { label: 'Group ID', value: anomaly.duplicate_group_id || 'N/A' },
            { label: 'Matching Fields', value: anomaly.matching_fields?.join(', ') || 'N/A' },
            { label: 'Posting Date', value: formatDate(anomaly.posting_date) },
            { label: 'Document Number', value: anomaly.document_number || 'N/A' },
            { label: 'High Value', value: anomaly.is_high_value ? 'Yes' : 'No' },
            { label: 'Amount Formatted', value: formatCurrency(anomaly.amount || 0) },
            { label: 'Severity', value: anomaly.duplicate_severity || 'N/A' },
            { label: 'Amount Category', value: anomaly.amount_category || 'N/A' }
          ],
          secondaryInfo: []
        };
      
      case 'Backdated Analysis':
        return {
          title: 'Backdated Entry Details',
          subtitle: `Days Difference: ${anomaly.days_difference || 0} days`,
          primaryInfo: [
            { label: 'Transaction ID', value: anomaly.transaction_id || 'N/A' },
            { label: 'User', value: anomaly.user || 'N/A' },
            { label: 'Account', value: anomaly.account || 'N/A' },
            { label: 'Amount', value: formatCurrency(anomaly.amount || 0) },
            { label: 'Days Difference', value: `${anomaly.days_difference || 0} days` },
            { label: 'Risk Level', value: anomaly.risk_level || 'N/A' },
            { label: 'Risk Score', value: anomaly.risk_score || 0 },
            { label: 'Posting Date', value: formatDate(anomaly.posting_date) },
            { label: 'Document Date', value: formatDate(anomaly.document_date) },
            { label: 'Document Number', value: anomaly.document_number || 'N/A' },
            { label: 'High Value', value: anomaly.is_high_value ? 'Yes' : 'No' },
            { label: 'Amount Formatted', value: formatCurrency(anomaly.amount || 0) },
            { label: 'Severity', value: anomaly.backdated_severity || 'N/A' },
            { label: 'Amount Category', value: anomaly.amount_category || 'N/A' }
          ],
          secondaryInfo: []
        };
      
      case 'User Analysis':
        return {
          title: 'User Analysis Details',
          subtitle: `Activity Level: ${anomaly.activity_category || 'NORMAL'}`,
          primaryInfo: [
            { label: 'User', value: anomaly.user || 'N/A' },
            { label: 'Transaction Count', value: anomaly.transaction_count || 0 },
            { label: 'Total Amount', value: formatCurrency(anomaly.total_amount || 0) },
            { label: 'Average Amount', value: formatCurrency(anomaly.avg_amount || 0) },
            { label: 'Anomaly Count', value: anomaly.anomaly_count || 0 },
            { label: 'Risk Level', value: anomaly.risk_level || 'N/A' },
            { label: 'Risk Score', value: anomaly.risk_score || 0 },
            { label: 'Accounts', value: anomaly.accounts?.join(', ') || 'N/A' },
            { label: 'High Activity', value: anomaly.is_high_activity ? 'Yes' : 'No' },
            { label: 'Amount Formatted', value: formatCurrency(anomaly.amount || 0) },
            { label: 'Avg Amount Formatted', value: formatCurrency(anomaly.avg_amount || 0) },
            { label: 'Severity', value: anomaly.user_severity || 'N/A' },
            { label: 'Activity Category', value: anomaly.activity_category || 'N/A' },
            { label: 'Accounts Count', value: anomaly.accounts_count || 0 }
          ],
          secondaryInfo: []
        };
      
      case 'Closing Analysis':
        return {
          title: 'Closing Entry Details',
          subtitle: `Days from Month End: ${anomaly.days_from_month_end || 0}`,
          primaryInfo: [
            { label: 'Transaction ID', value: anomaly.transaction_id || 'N/A' },
            { label: 'User', value: anomaly.user || 'N/A' },
            { label: 'Account', value: anomaly.account || 'N/A' },
            { label: 'Amount', value: formatCurrency(anomaly.amount || 0) },
            { label: 'Risk Level', value: anomaly.risk_level || 'N/A' },
            { label: 'Risk Score', value: anomaly.risk_score || 0 },
            { label: 'Posting Date', value: formatDate(anomaly.posting_date) },
            { label: 'Document Number', value: anomaly.document_number || 'N/A' },
            { label: 'Days from Month End', value: `${anomaly.days_from_month_end || 0} days` },
            { label: 'Month End Indicator', value: anomaly.month_end_indicator ? 'Yes' : 'No' },
            { label: 'High Value', value: anomaly.is_high_value ? 'Yes' : 'No' },
            { label: 'Amount Formatted', value: formatCurrency(anomaly.amount || 0) },
            { label: 'Amount Category', value: anomaly.amount_category || 'N/A' }
          ],
          secondaryInfo: []
        };
      
      case 'Unusual Days Analysis':
        return {
          title: 'Unusual Days Entry Details',
          subtitle: `Day of Week: ${anomaly.day_of_week || 'Unknown'}`,
          primaryInfo: [
            { label: 'Transaction ID', value: anomaly.transaction_id || 'N/A' },
            { label: 'User', value: anomaly.user || 'N/A' },
            { label: 'Account', value: anomaly.account || 'N/A' },
            { label: 'Amount', value: formatCurrency(anomaly.amount || 0) },
            { label: 'Risk Level', value: anomaly.risk_level || 'N/A' },
            { label: 'Risk Score', value: anomaly.risk_score || 0 },
            { label: 'Posting Date', value: formatDate(anomaly.posting_date) },
            { label: 'Document Number', value: anomaly.document_number || 'N/A' },
            { label: 'Day of Week', value: anomaly.day_of_week || 'N/A' },
            { label: 'High Value', value: anomaly.is_high_value ? 'Yes' : 'No' },
            { label: 'Amount Formatted', value: formatCurrency(anomaly.amount || 0) },
            { label: 'Day Type', value: anomaly.day_type || 'N/A' },
            { label: 'Amount Category', value: anomaly.amount_category || 'N/A' }
          ],
          secondaryInfo: []
        };
      
      case 'Holiday Analysis':
        return {
          title: 'Holiday Entry Details',
          subtitle: `Holiday: ${anomaly.holiday_name || 'Unknown'}`,
          primaryInfo: [
            { label: 'Transaction ID', value: anomaly.transaction_id || 'N/A' },
            { label: 'User', value: anomaly.user || 'N/A' },
            { label: 'Account', value: anomaly.account || 'N/A' },
            { label: 'Amount', value: formatCurrency(anomaly.amount || 0) },
            { label: 'Holiday Name', value: anomaly.holiday_name || 'N/A' },
            { label: 'Risk Level', value: anomaly.risk_level || 'N/A' },
            { label: 'Risk Score', value: anomaly.risk_score || 0 },
            { label: 'Posting Date', value: formatDate(anomaly.posting_date) },
            { label: 'Document Number', value: anomaly.document_number || 'N/A' },
            { label: 'High Value', value: anomaly.is_high_value ? 'Yes' : 'No' },
            { label: 'Amount Formatted', value: formatCurrency(anomaly.amount || 0) },
            { label: 'Severity', value: anomaly.holiday_severity || 'N/A' },
            { label: 'Amount Category', value: anomaly.amount_category || 'N/A' }
          ],
          secondaryInfo: []
        };
      
      default:
        return {
          title: 'Anomaly Details',
          subtitle: 'General anomaly information',
          primaryInfo: [
            { label: 'Type', value: type || 'N/A' },
            { label: 'Risk Level', value: riskLevel },
            { label: 'Risk Score', value: anomaly.risk_score || 0 },
            { label: 'Amount', value: formatCurrency(anomaly.amount || 0) }
          ],
          secondaryInfo: []
        };
    }
  };

  const keyInfo = getKeyInfo();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 600, md: 700 },
          backgroundColor: colorScheme.cardBackground
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          backgroundColor: anomalyColor, 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getAnomalyIcon(type)}
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {type} Details
          </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {/* Risk Assessment Alert */}
          <Alert 
            severity={riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? 'error' : 
                     riskLevel === 'MEDIUM' ? 'warning' : 'info'}
            sx={{ mb: 3 }}
            icon={getSeverityIcon(riskLevel)}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Risk Assessment: {riskLevel}
            </Typography>
            <Typography variant="body2">
              Risk Score: {anomaly.risk_score || 0} • {keyInfo.subtitle}
            </Typography>
          </Alert>

          {/* Primary Information Card */}
          <Card sx={{ mb: 3, border: `2px solid ${anomalyColor}20` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                fontWeight: 'bold', 
                color: anomalyColor,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                {getAnomalyIcon(type)}
                {keyInfo.title}
            </Typography>
              
            <Grid container spacing={2}>
                {keyInfo.primaryInfo.map((info, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: `${anomalyColor}10`, 
                      borderRadius: 2,
                      border: `1px solid ${anomalyColor}30`
                    }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                        {info.label}
                  </Typography>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 'bold', 
                        color: anomalyColor,
                        mt: 0.5
                      }}>
                        {info.value}
                  </Typography>
                </Box>
              </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Secondary Information */}
          {keyInfo.secondaryInfo.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
                  Additional Details
                  </Typography>
                <Grid container spacing={2}>
                  {keyInfo.secondaryInfo.map((info, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                          {info.label}
                  </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                          {info.value}
                  </Typography>
                </Box>
              </Grid>
                  ))}
            </Grid>
              </CardContent>
            </Card>
          )}

          {/* Risk Analysis */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
                Risk Analysis
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: colorScheme.background,
                  borderRadius: 2,
                    border: `2px solid ${getSeverityColor(riskLevel)}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Risk Level
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                      color: getSeverityColor(riskLevel)
                  }}>
                      {riskLevel}
                  </Typography>
                </Box>
              </Grid>
                <Grid item xs={6} sm={3}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: colorScheme.background,
                  borderRadius: 2,
                    border: `2px solid ${getSeverityColor(riskLevel)}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Risk Score
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                      color: getSeverityColor(riskLevel)
                  }}>
                      {anomaly.risk_score || 0}
                  </Typography>
                </Box>
              </Grid>
                <Grid item xs={6} sm={3}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: colorScheme.background,
                  borderRadius: 2,
                    border: `2px solid ${anomalyColor}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                      Amount
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                      color: anomalyColor
                    }}>
                      {formatCurrency(anomaly.amount || 0)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 2, 
                    backgroundColor: colorScheme.background,
                    borderRadius: 2,
                    border: `2px solid ${anomalyColor}`
                  }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Type
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: anomalyColor
                    }}>
                      {type.split(' ')[0]}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
                Recommendations
            </Typography>
            <List>
                {riskLevel === 'CRITICAL' && (
                    <ListItem>
                      <ListItemIcon sx={{ color: colorScheme.error }}>
                        <ErrorIcon />
                      </ListItemIcon>
                      <ListItemText 
                      primary="Immediate Action Required"
                      secondary="This anomaly requires immediate investigation and resolution due to critical risk level."
                      />
                    </ListItem>
                  )}
                {riskLevel === 'HIGH' && (
                    <ListItem>
                      <ListItemIcon sx={{ color: colorScheme.warning }}>
                        <WarningIcon />
                      </ListItemIcon>
                      <ListItemText 
                      primary="Detailed Investigation Required"
                      secondary="This anomaly requires detailed investigation to determine if it's legitimate or fraudulent."
                      />
                    </ListItem>
                  )}
                {riskLevel === 'MEDIUM' && (
                  <ListItem>
                    <ListItemIcon sx={{ color: colorScheme.info }}>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Standard Review"
                      secondary="Perform standard review procedures for this anomaly."
                    />
                  </ListItem>
                )}
                {riskLevel === 'LOW' && (
                  <ListItem>
                    <ListItemIcon sx={{ color: colorScheme.success }}>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Routine Monitoring"
                      secondary="This anomaly can be monitored as part of routine procedures."
                      />
                    </ListItem>
                  )}
                  <ListItem>
                  <ListItemIcon sx={{ color: anomalyColor }}>
                      <VisibilityIcon />
                    </ListItemIcon>
                    <ListItemText 
                    primary="Verification Required"
                    secondary="Verify this anomaly against supporting documentation and business justification."
                    />
                  </ListItem>
                  <ListItem>
                  <ListItemIcon sx={{ color: anomalyColor }}>
                    <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText 
                    primary="Control Assessment"
                    secondary="Review internal controls to prevent future similar anomalies."
                    />
                  </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Transaction Details (if available) */}
          {(anomaly.transaction1 || anomaly.transaction2 || anomaly.transactions) && (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
                  Transaction Details
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: colorScheme.background }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Document</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {anomaly.transactions ? (
                        // Array format
                        anomaly.transactions.map((transaction, index) => (
                          <TableRow key={index} sx={{ '&:hover': { backgroundColor: colorScheme.background } }}>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{transaction.id}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{transaction.user_name}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{transaction.posting_date}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{transaction.document_number}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: colorScheme.primary }}>
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : anomaly.transaction1 && anomaly.transaction2 ? (
                        // Dual transaction format
                        <>
                          <TableRow sx={{ '&:hover': { backgroundColor: colorScheme.background } }}>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{anomaly.transaction1.id}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{anomaly.transaction1.user}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{anomaly.transaction1.date}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{anomaly.transaction1.document_number || 'N/A'}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: colorScheme.primary }}>
                              {formatCurrency(anomaly.transaction1.amount || 0)}
                            </TableCell>
                          </TableRow>
                          <TableRow sx={{ '&:hover': { backgroundColor: colorScheme.background } }}>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{anomaly.transaction2.id}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{anomaly.transaction2.user}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{anomaly.transaction2.date}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem' }}>{anomaly.transaction2.document_number || 'N/A'}</TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: colorScheme.primary }}>
                              {formatCurrency(anomaly.transaction2.amount || 0)}
                            </TableCell>
                          </TableRow>
                        </>
                      ) : (
                        // Single transaction format
                        <TableRow sx={{ '&:hover': { backgroundColor: colorScheme.background } }}>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{anomaly.transaction_id}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{anomaly.user}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(anomaly.posting_date)}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{anomaly.document_number || 'N/A'}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: colorScheme.primary }}>
                            {formatCurrency(anomaly.amount || 0)}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Drawer>
  );
} 