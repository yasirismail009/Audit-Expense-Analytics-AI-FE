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
      currency: 'USD',
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
      case 'amount_anomaly': return <MoneyIcon />;
      case 'timing_anomaly': return <CalendarIcon />;
      case 'vendor_anomaly': return <BusinessIcon />;
      case 'employee_anomaly': return <PersonIcon />;
      case 'duplicate_suspicion': return <TrendingUpIcon />;
      default: return <WarningIcon />;
    }
  };

  const fraudScoreBreakdown = flaggedExpense.fraud_score_breakdown || {};
  const anomalyReasons = flaggedExpense.anomaly_reasons || [];
  const anomalyFlags = flaggedExpense.anomaly_flags || {};

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
                  Expense #{flaggedExpense.expense_id}
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

          {/* Fraud Score Alert */}
          <Alert 
            severity={flaggedExpense.fraud_score > 60 ? 'error' : 
                     flaggedExpense.fraud_score > 40 ? 'warning' : 'info'}
            sx={{ mb: 3 }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Fraud Score: {flaggedExpense.fraud_score?.toFixed(1)}%
            </Typography>
            <Typography variant="body2">
              This expense has been flagged due to {anomalyReasons.length} detected anomaly{anomalyReasons.length !== 1 ? 'ies' : ''}.
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
                    Department
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {flaggedExpense.department}
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

          {/* Fraud Score Breakdown */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
              Fraud Score Breakdown
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(fraudScoreBreakdown).map(([key, value]) => {
                if (key === 'total_score') return null;
                return (
                  <Grid item xs={6} sm={4} key={key}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      backgroundColor: value > 0 ? colorScheme.background : 'transparent',
                      borderRadius: 2,
                      border: value > 0 ? `2px solid ${getSeverityColor(value > 20 ? 'HIGH' : value > 10 ? 'MEDIUM' : 'LOW')}` : 'none'
                    }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold', 
                        color: value > 0 ? getSeverityColor(value > 20 ? 'HIGH' : value > 10 ? 'MEDIUM' : 'LOW') : colorScheme.textSecondary
                      }}>
                        {value}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.primary, borderRadius: 2, color: 'white' }}>
                  <Typography variant="caption" display="block">
                    Total Fraud Score
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {fraudScoreBreakdown.total_score || flaggedExpense.fraud_score?.toFixed(1)}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Anomaly Details */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
              Detected Anomalies
            </Typography>
            {anomalyReasons.length > 0 ? (
              <List>
                {anomalyReasons.map((anomaly, index) => (
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
                            {anomaly.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                            {anomaly.reason}
                          </Typography>
                          {anomaly.details && (
                            <Accordion sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                  View Details
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <TableContainer>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Metric</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {Object.entries(anomaly.details).map(([key, value]) => (
                                        <TableRow key={key}>
                                          <TableCell>
                                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </Typography>
                                          </TableCell>
                                          <TableCell>
                                            <Typography variant="caption">
                                              {typeof value === 'number' && value > 1000 
                                                ? formatCurrency(value) 
                                                : typeof value === 'number' 
                                                  ? value.toFixed(2) 
                                                  : value}
                                            </Typography>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </AccordionDetails>
                            </Accordion>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No specific anomalies detected.
              </Typography>
            )}
          </Paper>

          {/* Vendor and Category Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
              Vendor & Category Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Vendor Information
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                    {flaggedExpense.vendor}
                  </Typography>
                  {anomalyFlags.vendor_anomaly && (
                    <Chip 
                      label="Vendor Anomaly Detected" 
                      size="small"
                      sx={{ 
                        mt: 1,
                        backgroundColor: colorScheme.warning,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Category Information
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                    {flaggedExpense.category}
                  </Typography>
                  {anomalyFlags.employee_anomaly && (
                    <Chip 
                      label="Category Anomaly Detected" 
                      size="small"
                      sx={{ 
                        mt: 1,
                        backgroundColor: colorScheme.warning,
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  )}
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
              {flaggedExpense.fraud_score > 60 && (
                <ListItem>
                  <ListItemIcon sx={{ color: colorScheme.error }}>
                    <ErrorIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Immediate Review Required"
                    secondary="This expense has a high fraud score and should be reviewed immediately by management."
                  />
                </ListItem>
              )}
              {anomalyFlags.amount_anomaly && (
                <ListItem>
                  <ListItemIcon sx={{ color: colorScheme.warning }}>
                    <WarningIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Amount Verification"
                    secondary="Verify the expense amount and obtain additional documentation if necessary."
                  />
                </ListItem>
              )}
              {anomalyFlags.vendor_anomaly && (
                <ListItem>
                  <ListItemIcon sx={{ color: colorScheme.info }}>
                    <InfoIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Vendor Verification"
                    secondary="Verify vendor legitimacy and check if this vendor is approved for company expenses."
                  />
                </ListItem>
              )}
              {anomalyFlags.timing_anomaly && (
                <ListItem>
                  <ListItemIcon sx={{ color: colorScheme.info }}>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Timing Review"
                    secondary="Review the timing of this expense and verify it aligns with business activities."
                  />
                </ListItem>
              )}
              {anomalyFlags.duplicate_suspicion && (
                <ListItem>
                  <ListItemIcon sx={{ color: colorScheme.warning }}>
                    <TrendingUpIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Duplicate Check"
                    secondary="Check for potential duplicate expenses and verify this is not a duplicate submission."
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