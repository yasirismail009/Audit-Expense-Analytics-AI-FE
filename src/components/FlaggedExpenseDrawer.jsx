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
  Paper
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
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { colorScheme, getRiskColor } from '../utils/colorScheme';

export default function FlaggedExpenseDrawer({ open, onClose, flaggedExpense }) {
  if (!flaggedExpense) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
    switch (severity?.toUpperCase()) {
      case 'HIGH': return colorScheme.error;
      case 'MEDIUM': return colorScheme.warning;
      case 'LOW': return colorScheme.info;
      default: return colorScheme.textSecondary;
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'HIGH': return <ErrorIcon />;
      case 'MEDIUM': return <WarningIcon />;
      case 'LOW': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'Duplicate': return <TrendingUpIcon />;
      case 'Backdated': return <CalendarIcon />;
      case 'Timing': return <CalendarIcon />;
      case 'High Value': return <MoneyIcon />;
      default: return <WarningIcon />;
    }
  };

  const anomalyType = flaggedExpense.anomaly_type || (flaggedExpense.is_high_value ? 'High Value' : 'Standard');
  const anomalyDescription = flaggedExpense.description || 'No specific anomaly detected';

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
            Flagged Expense Details
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {/* Expense ID and Risk Level */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: colorScheme.textPrimary }}>
                  Transaction #{flaggedExpense.document_number}
                </Typography>
              </Grid>
              <Grid item>
                <Chip 
                  label={flaggedExpense.risk_level || 'UNKNOWN'} 
                  sx={{ 
                    backgroundColor: getRiskColor(flaggedExpense.risk_level),
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
            severity={flaggedExpense.risk_score > 40 ? 'error' : 
                     flaggedExpense.risk_score > 25 ? 'warning' : 'info'}
            sx={{ mb: 3 }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Risk Score: {flaggedExpense.risk_score || 0}
            </Typography>
            <Typography variant="body2">
              {anomalyDescription}
            </Typography>
          </Alert>

          {/* Basic Expense Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
              Expense Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {flaggedExpense.description}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Amount
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                    {formatCurrency(flaggedExpense.amount)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Employee
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {flaggedExpense.employee}
                  </Typography>
                </Box>
              </Grid>
                                <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Profit Center
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {flaggedExpense.profit_center || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {formatDate(flaggedExpense.date)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Risk Score Breakdown */}
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
                  border: `2px solid ${getSeverityColor(flaggedExpense.risk_level)}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Risk Level
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: getSeverityColor(flaggedExpense.risk_level)
                  }}>
                    {flaggedExpense.risk_level}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: colorScheme.background,
                  borderRadius: 2,
                  border: `2px solid ${getSeverityColor(flaggedExpense.risk_level)}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Risk Score
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: getSeverityColor(flaggedExpense.risk_level)
                  }}>
                    {flaggedExpense.risk_score || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: colorScheme.background,
                  borderRadius: 2,
                  border: `2px solid ${getSeverityColor(flaggedExpense.risk_level)}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    High Value
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: flaggedExpense.is_high_value ? colorScheme.error : colorScheme.success
                  }}>
                    {flaggedExpense.is_high_value ? 'Yes' : 'No'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.primary, borderRadius: 2, color: 'white' }}>
                  <Typography variant="caption" display="block">
                    Anomaly Type
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {anomalyType}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Anomaly Details */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
              Anomaly Details
            </Typography>
            {flaggedExpense.anomaly_type ? (
              <List>
                <ListItem sx={{ 
                  mb: 2, 
                  backgroundColor: colorScheme.background, 
                  borderRadius: 2,
                  border: `2px solid ${getSeverityColor(flaggedExpense.risk_level)}`
                }}>
                  <ListItemIcon sx={{ color: getSeverityColor(flaggedExpense.risk_level) }}>
                    {getAnomalyIcon(flaggedExpense.anomaly_type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {flaggedExpense.anomaly_subtype || flaggedExpense.anomaly_type}
                        </Typography>
                        <Chip 
                          label={flaggedExpense.risk_level} 
                          size="small"
                          sx={{ 
                            backgroundColor: getSeverityColor(flaggedExpense.risk_level),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {anomalyDescription}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                            Transaction Details:
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Document Number: {flaggedExpense.document_number}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Transaction Type: {flaggedExpense.transaction_type}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Currency: {flaggedExpense.currency}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Status: {flaggedExpense.status}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No specific anomalies detected.
              </Typography>
            )}
          </Paper>

          {/* Account and Category Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
              Account & Category Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    GL Account
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                    {flaggedExpense.category}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    General Ledger Account Number
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Profit Center
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                    {flaggedExpense.profit_center || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Profit Center Code
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Recommendations */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
              Recommendations
            </Typography>
            <List>
              {flaggedExpense.risk_score > 40 && (
                <ListItem>
                  <ListItemIcon sx={{ color: colorScheme.error }}>
                    <ErrorIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Immediate Review Required"
                    secondary="This transaction has a high risk score and should be reviewed immediately by management."
                  />
                </ListItem>
              )}
              {flaggedExpense.anomaly_type === 'Duplicate' && (
                <ListItem>
                  <ListItemIcon sx={{ color: colorScheme.warning }}>
                    <WarningIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Duplicate Verification"
                    secondary="Verify this is not a duplicate transaction and check for similar entries in the system."
                  />
                </ListItem>
              )}
              {flaggedExpense.anomaly_type === 'Backdated' && (
                <ListItem>
                  <ListItemIcon sx={{ color: colorScheme.info }}>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Timing Review"
                    secondary="Review the posting date and verify it aligns with the actual transaction date."
                  />
                </ListItem>
              )}
              {flaggedExpense.anomaly_type === 'Timing' && (
                <ListItem>
                  <ListItemIcon sx={{ color: colorScheme.info }}>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Month-End Review"
                    secondary="Verify this closing entry is legitimate and properly authorized."
                  />
                </ListItem>
              )}
              {flaggedExpense.is_high_value && (
                <ListItem>
                  <ListItemIcon sx={{ color: colorScheme.warning }}>
                    <MoneyIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="High Value Verification"
                    secondary="Obtain additional documentation and approval for this high-value transaction."
                  />
                </ListItem>
              )}
              {!flaggedExpense.anomaly_type && !flaggedExpense.is_high_value && (
                <ListItem>
                  <ListItemIcon sx={{ color: colorScheme.info }}>
                    <InfoIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Standard Review"
                    secondary="Perform standard review procedures for this transaction."
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Box>
      </Box>
    </Drawer>
  );
} 