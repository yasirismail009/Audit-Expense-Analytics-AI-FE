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
  LinearProgress,
  Avatar,
  Badge
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
  AccountBalance as AccountBalanceIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { colorScheme, getRiskColor, formatCurrency } from '../utils/colorScheme';

export default function UserAnalysisDrawer({ open, onClose, userData, type = 'User Analysis' }) {
  if (!userData) return null;

  // Calculate risk score based on risk levels (since no numeric scores in new API)
  const riskLevelScores = {
    'LOW': 20,
    'MEDIUM': 50,
    'HIGH': 80,
    'CRITICAL': 95
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return colorScheme.error;
      case 'high': return colorScheme.error;
      case 'medium': return colorScheme.warning;
      case 'low': return colorScheme.info;
      default: return colorScheme.textSecondary;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return <ErrorIcon />;
      case 'high': return <ErrorIcon />;
      case 'medium': return <WarningIcon />;
      case 'low': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'HIGH_ACTIVITY': return <TimelineIcon />;
      case 'HIGH_AMOUNT': return <MoneyIcon />;
      case 'UNUSUAL_BALANCE': return <AccountBalanceIcon />;
      case 'ACCOUNT_CONCENTRATION': return <BusinessIcon />;
      default: return <WarningIcon />;
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

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
          backgroundColor: colorScheme.primary, 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {type} Details
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {/* User Information Header */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: getRiskColor(userData.risk_level || 'medium'),
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {userData.user?.charAt(0) || 'U'}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: colorScheme.textPrimary }}>
                  {userData.user || 'Unknown User'}
                </Typography>
                <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
                  User ID: {userData.user_id || 'N/A'} • Analysis Date: {formatDate(new Date())}
                </Typography>
              </Grid>
              <Grid item>
                <Chip 
                  label={getRiskLevel(userData.risk_score || 0)} 
                  sx={{ 
                    backgroundColor: getRiskColor(userData.risk_level || 'medium'),
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Risk Score Alert */}
          <Alert 
            severity={userData.risk_score >= 60 ? 'error' : 
                     userData.risk_score >= 40 ? 'warning' : 'info'}
            sx={{ mb: 3 }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Risk Score: {userData.risk_score || 0}
            </Typography>
            <Typography variant="body2">
              {userData.risk_score >= 60 ? 'High risk user requiring immediate attention' :
               userData.risk_score >= 40 ? 'Medium risk user requiring investigation' :
               'Low risk user with standard monitoring'}
            </Typography>
          </Alert>

          {/* User Summary Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
              User Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                    {formatCurrency(userData.total_amount || 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Transactions
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                    {userData.transaction_count || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Accounts
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                    {userData.unique_accounts || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Avg Amount
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                    {formatCurrency(userData.avg_amount || 0)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Risk Assessment */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
              Risk Assessment
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: colorScheme.background,
                  borderRadius: 2,
                  border: `2px solid ${getRiskColor(userData.risk_level || 'medium')}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Risk Level
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: getRiskColor(userData.risk_level || 'medium')
                  }}>
                    {userData.risk_level || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: colorScheme.background,
                  borderRadius: 2,
                  border: `2px solid ${getRiskColor(userData.risk_level || 'medium')}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Risk Score
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: getRiskColor(userData.risk_level || 'medium')
                  }}>
                    {riskLevelScores[userData.risk_level] || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: colorScheme.background,
                  borderRadius: 2,
                  border: `2px solid ${getRiskColor(userData.risk_level || 'medium')}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Anomalies
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: colorScheme.primary
                  }}>
                    {userData.anomaly_type ? 1 : 0}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Risk Factors */}
            {userData.risk_factors && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: colorScheme.textPrimary }}>
                  Risk Factors Breakdown
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(userData.risk_factors).map(([factor, score]) => (
                    <Grid item xs={12} sm={6} key={factor}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ color: colorScheme.textPrimary }}>
                            {factor.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.textPrimary }}>
                            {score}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={score}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: colorScheme.background,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: colorScheme.primary,
                              borderRadius: 4
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>

          {/* Detected Anomalies */}
          {userData.anomalies && userData.anomalies.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
                Detected Anomalies
              </Typography>
              <List>
                {userData.anomalies.map((anomaly, index) => (
                  <ListItem key={index} sx={{ 
                    mb: 2, 
                    backgroundColor: colorScheme.background, 
                    borderRadius: 2,
                    border: `2px solid ${getSeverityColor(anomaly.severity)}`
                  }}>
                    <ListItemIcon sx={{ color: getSeverityColor(anomaly.severity) }}>
                      {getAnomalyIcon(anomaly.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {anomaly.type.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Chip 
                            label={anomaly.severity} 
                            size="small"
                            sx={{ 
                              backgroundColor: getSeverityColor(anomaly.severity),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {anomaly.description}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                              Anomaly Details:
                            </Typography>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Type: {anomaly.type}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Value: {anomaly.value}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                  Severity: {anomaly.severity}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Account Distribution */}
          {userData.account_details && userData.account_details.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
                Account Distribution
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: colorScheme.background }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Account</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Transactions</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Total Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Debit Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Credit Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userData.account_details.map((account, index) => (
                      <TableRow key={index} sx={{ '&:hover': { backgroundColor: colorScheme.background } }}>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{account.account}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{account.count}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: colorScheme.primary }}>
                          {formatCurrency(account.total_amount)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{formatCurrency(account.debit_amount)}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{formatCurrency(account.credit_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Transaction Summary */}
          {userData.transaction_types && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
                Transaction Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Debit Transactions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {userData.transaction_types.debit_count || 0} transactions
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                      {formatCurrency(userData.debit_amount || 0)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Credit Transactions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {userData.transaction_types.credit_count || 0} transactions
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                      {formatCurrency(userData.credit_amount || 0)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Balance Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        label={`Total Balance: ${formatCurrency(userData.balance || 0)}`}
                        size="small"
                        sx={{ 
                          backgroundColor: colorScheme.primary,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                      <Chip 
                        label={`Debit Ratio: ${((userData.debit_amount / (userData.total_amount || 1)) * 100).toFixed(1)}%`}
                        size="small"
                        sx={{ 
                          backgroundColor: colorScheme.warning,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                      <Chip 
                        label={`Credit Ratio: ${((userData.credit_amount / (userData.total_amount || 1)) * 100).toFixed(1)}%`}
                        size="small"
                        sx={{ 
                          backgroundColor: colorScheme.info,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Recommendations */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
              Recommendations
            </Typography>
            <List>
              {userData.recommendations && userData.recommendations.length > 0 ? (
                userData.recommendations.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ color: colorScheme.primary }}>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={recommendation}
                      primaryTypographyProps={{ 
                        variant: 'body2',
                        color: colorScheme.textPrimary
                      }}
                    />
                  </ListItem>
                ))
              ) : (
                <>
                  {userData.risk_score >= 60 && (
                    <ListItem>
                      <ListItemIcon sx={{ color: colorScheme.error }}>
                        <ErrorIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Immediate Review Required"
                        secondary="This user has a high risk score and should be reviewed immediately by management."
                      />
                    </ListItem>
                  )}
                  {userData.risk_score >= 40 && userData.risk_score < 60 && (
                    <ListItem>
                      <ListItemIcon sx={{ color: colorScheme.warning }}>
                        <WarningIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Detailed Investigation"
                        secondary="This user requires detailed investigation to determine if the activity is legitimate or suspicious."
                      />
                    </ListItem>
                  )}
                  {userData.risk_score < 40 && (
                    <ListItem>
                      <ListItemIcon sx={{ color: colorScheme.info }}>
                        <InfoIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Standard Monitoring"
                        secondary="Continue standard monitoring procedures for this user."
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemIcon sx={{ color: colorScheme.warning }}>
                      <VisibilityIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Transaction Review"
                      secondary="Review all transactions for this user to identify any patterns or anomalies."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ color: colorScheme.info }}>
                      <MoneyIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Amount Verification"
                      secondary="Verify that transaction amounts are reasonable and supported by business documentation."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ color: colorScheme.primary }}>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Access Review"
                      secondary="Review user access permissions and ensure they are appropriate for their role."
                    />
                  </ListItem>
                </>
              )}
            </List>
          </Paper>
        </Box>
      </Box>
    </Drawer>
  );
} 