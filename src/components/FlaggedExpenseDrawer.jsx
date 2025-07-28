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
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { colorScheme, getRiskColor } from '../utils/colorScheme';

export default function DuplicateDetailDrawer({ open, onClose, duplicate, type }) {
  if (!duplicate) return null;

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

  const getDuplicateIcon = (type) => {
    switch (type) {
      case 'Type 1 Duplicate': return <TrendingUpIcon />;
      case 'Type 2 Duplicate': return <WarningIcon />;
      case 'Type 3 Duplicate': return <ErrorIcon />;
      case 'Type 4 Duplicate': return <InfoIcon />;
      case 'Type 5 Duplicate': return <MoneyIcon />;
      case 'Type 6 Duplicate': return <CategoryIcon />;
      default: return <WarningIcon />;
    }
  };

  const duplicateType = duplicate.type || 'Unknown Duplicate Type';
  const duplicateDescription = duplicate.criteria || 'No specific criteria provided';

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
          {/* Duplicate Type and Risk Level */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: colorScheme.textPrimary }}>
                  {duplicateType}
                </Typography>
              </Grid>
              <Grid item>
                <Chip 
                  label={duplicate.risk_score || 'UNKNOWN'} 
                  sx={{ 
                    backgroundColor: getRiskColor(duplicate.risk_score > 40 ? 'HIGH' : duplicate.risk_score > 25 ? 'MEDIUM' : 'LOW'),
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
            severity={duplicate.risk_score > 40 ? 'error' : 
                     duplicate.risk_score > 25 ? 'warning' : 'info'}
            sx={{ mb: 3 }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Risk Score: {duplicate.risk_score || 0}
            </Typography>
            <Typography variant="body2">
              {duplicateDescription}
            </Typography>
          </Alert>

          {/* Basic Duplicate Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
              Duplicate Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {duplicateDescription}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Amount
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                    {formatCurrency(duplicate.amount)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Count
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                    {duplicate.count}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    GL Account
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {duplicate.gl_account || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Type
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {duplicate.type}
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
                  border: `2px solid ${getSeverityColor(duplicate.risk_score > 40 ? 'HIGH' : duplicate.risk_score > 25 ? 'MEDIUM' : 'LOW')}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Risk Level
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: getSeverityColor(duplicate.risk_score > 40 ? 'HIGH' : duplicate.risk_score > 25 ? 'MEDIUM' : 'LOW')
                  }}>
                    {duplicate.risk_score > 40 ? 'HIGH' : duplicate.risk_score > 25 ? 'MEDIUM' : 'LOW'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: colorScheme.background,
                  borderRadius: 2,
                  border: `2px solid ${getSeverityColor(duplicate.risk_score > 40 ? 'HIGH' : duplicate.risk_score > 25 ? 'MEDIUM' : 'LOW')}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Risk Score
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: getSeverityColor(duplicate.risk_score > 40 ? 'HIGH' : duplicate.risk_score > 25 ? 'MEDIUM' : 'LOW')
                  }}>
                    {duplicate.risk_score || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  backgroundColor: colorScheme.background,
                  borderRadius: 2,
                  border: `2px solid ${getSeverityColor(duplicate.risk_score > 40 ? 'HIGH' : duplicate.risk_score > 25 ? 'MEDIUM' : 'LOW')}`
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: colorScheme.primary
                  }}>
                    {formatCurrency(duplicate.amount)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: colorScheme.primary, borderRadius: 2, color: 'white' }}>
                  <Typography variant="caption" display="block">
                    Duplicate Type
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {duplicateType}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Transaction Details */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
              {type === 'Backdated Analysis' ? 'Backdated Entry Details' : 'Duplicate Details'}
            </Typography>
            <List>
              <ListItem sx={{ 
                mb: 2, 
                backgroundColor: colorScheme.background, 
                borderRadius: 2,
                border: `2px solid ${getSeverityColor(duplicate.risk_score > 40 ? 'HIGH' : duplicate.risk_score > 25 ? 'MEDIUM' : 'LOW')}`
              }}>
                <ListItemIcon sx={{ color: getSeverityColor(duplicate.risk_score > 40 ? 'HIGH' : duplicate.risk_score > 25 ? 'MEDIUM' : 'LOW') }}>
                  {getDuplicateIcon(duplicate.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {duplicate.type}
                      </Typography>
                      <Chip 
                        label={duplicate.risk_score > 40 ? 'HIGH' : duplicate.risk_score > 25 ? 'MEDIUM' : 'LOW'} 
                        size="small"
                        sx={{ 
                          backgroundColor: getSeverityColor(duplicate.risk_score > 40 ? 'HIGH' : duplicate.risk_score > 25 ? 'MEDIUM' : 'LOW'),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {duplicateDescription}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                          Duplicate Criteria:
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Type: {duplicate.type}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              GL Account: {duplicate.gl_account}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Count: {duplicate.count}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Amount: {formatCurrency(duplicate.amount)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            </List>
          </Paper>

          {/* Transaction Details */}
          {(duplicate.transactions && duplicate.transactions.length > 0) || (duplicate.transaction1 && duplicate.transaction2) && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
                Transaction Details
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: colorScheme.background }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        {type === 'Backdated Analysis' ? 'Transaction ID' : 'ID'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Posting Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        {type === 'Backdated Analysis' ? 'Document Date' : 'Document Date'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        {type === 'Backdated Analysis' ? 'Account' : 'Document Number'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Amount</TableCell>
                      {type === 'Backdated Analysis' && (
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Days Diff</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {duplicate.transactions ? (
                      // Old format: transactions array
                      duplicate.transactions.map((transaction, index) => (
                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: colorScheme.background } }}>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{transaction.id}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{transaction.user_name}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{transaction.posting_date}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{transaction.document_date}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{transaction.document_number}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: colorScheme.primary }}>
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          {type === 'Backdated Analysis' && (
                            <TableCell sx={{ fontSize: '0.75rem' }}>{duplicate.days_difference || 'N/A'}</TableCell>
                          )}
                        </TableRow>
                      ))
                    ) : type === 'Backdated Analysis' ? (
                      // Backdated format: single transaction
                      <TableRow sx={{ '&:hover': { backgroundColor: colorScheme.background } }}>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{duplicate.transaction_id}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{duplicate.user}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(duplicate.posting_date)}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{formatDate(duplicate.document_date)}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{duplicate.account}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: colorScheme.primary }}>
                          {formatCurrency(duplicate.amount)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{duplicate.days_difference || 'N/A'}</TableCell>
                      </TableRow>
                    ) : (
                      // New format: transaction1 and transaction2 objects
                      <>
                        <TableRow sx={{ '&:hover': { backgroundColor: colorScheme.background } }}>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{duplicate.transaction1?.id}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{duplicate.transaction1?.user}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{duplicate.transaction1?.date}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{duplicate.transaction1?.effective_date}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{duplicate.transaction1?.document_number || 'N/A'}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: colorScheme.primary }}>
                            {formatCurrency(duplicate.transaction1?.amount || 0)}
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ '&:hover': { backgroundColor: colorScheme.background } }}>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{duplicate.transaction2?.id}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{duplicate.transaction2?.user}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{duplicate.transaction2?.date}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{duplicate.transaction2?.effective_date}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem' }}>{duplicate.transaction2?.document_number || 'N/A'}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, color: colorScheme.primary }}>
                            {formatCurrency(duplicate.transaction2?.amount || 0)}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Backdated Entry Details */}
          {type === 'Backdated Analysis' && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
                Backdated Entry Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Days Difference
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {duplicate.days_difference || 'N/A'} days
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Transaction Type
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {duplicate.transaction_type || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Fiscal Year
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {duplicate.fiscal_year || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Posting Period
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {duplicate.posting_period || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Date Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        label={`Posting Date: ${formatDate(duplicate.posting_date)}`}
                        size="small"
                        sx={{ 
                          backgroundColor: colorScheme.primary,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                      <Chip 
                        label={`Document Date: ${formatDate(duplicate.document_date)}`}
                        size="small"
                        sx={{ 
                          backgroundColor: colorScheme.warning,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                      <Chip 
                        label={`Difference: ${duplicate.days_difference || 0} days`}
                        size="small"
                        sx={{ 
                          backgroundColor: duplicate.days_difference > 30 ? colorScheme.error : 
                                 duplicate.days_difference > 7 ? colorScheme.warning : colorScheme.info,
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

          {/* Duplicate Analysis Details */}
          {duplicate.matching_fields && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
                Duplicate Analysis Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Duplicate Type
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {duplicate.duplicate_type_name || duplicate.duplicate_type || 'Unknown'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Similarity Score
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {duplicate.similarity_score ? `${(duplicate.similarity_score * 100).toFixed(1)}%` : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Matching Fields
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {duplicate.matching_fields && duplicate.matching_fields.map((field, index) => (
                        <Chip 
                          key={index}
                          label={field.replace(/_/g, ' ').toUpperCase()}
                          size="small"
                          sx={{ 
                            backgroundColor: colorScheme.primary,
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Recommendations */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colorScheme.primary }}>
              {type === 'Backdated Analysis' ? 'Backdated Entry Recommendations' : 'Recommendations'}
            </Typography>
            <List>
              {type === 'Backdated Analysis' ? (
                // Backdated-specific recommendations
                <>
                  {duplicate.days_difference > 30 && (
                    <ListItem>
                      <ListItemIcon sx={{ color: colorScheme.error }}>
                        <ErrorIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Critical Backdated Entry"
                        secondary={`This entry is backdated by ${duplicate.days_difference} days, which exceeds the 30-day threshold. Immediate investigation required.`}
                      />
                    </ListItem>
                  )}
                  {duplicate.days_difference > 7 && duplicate.days_difference <= 30 && (
                    <ListItem>
                      <ListItemIcon sx={{ color: colorScheme.warning }}>
                        <WarningIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Moderate Backdated Entry"
                        secondary={`This entry is backdated by ${duplicate.days_difference} days. Review for business justification and proper documentation.`}
                      />
                    </ListItem>
                  )}
                  {duplicate.days_difference <= 7 && (
                    <ListItem>
                      <ListItemIcon sx={{ color: colorScheme.info }}>
                        <InfoIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Minor Backdated Entry"
                        secondary={`This entry is backdated by ${duplicate.days_difference} days. Verify business justification and ensure proper controls.`}
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemIcon sx={{ color: colorScheme.primary }}>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Documentation Review"
                      secondary="Ensure proper documentation exists for the business justification of this backdated entry."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ color: colorScheme.primary }}>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Control Assessment"
                      secondary="Review internal controls to prevent future unauthorized backdated entries."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ color: colorScheme.warning }}>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Date Verification"
                      secondary="Verify the posting date and document date are accurate and supported by business documentation."
                    />
                  </ListItem>
                </>
              ) : (
                // Duplicate-specific recommendations
                <>
                  {duplicate.risk_score > 40 && (
                    <ListItem>
                      <ListItemIcon sx={{ color: colorScheme.error }}>
                        <ErrorIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Immediate Review Required"
                        secondary="This duplicate has a high risk score and should be reviewed immediately by management."
                      />
                    </ListItem>
                  )}
                  {duplicate.risk_score > 25 && duplicate.risk_score <= 40 && (
                    <ListItem>
                      <ListItemIcon sx={{ color: colorScheme.warning }}>
                        <WarningIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Detailed Investigation"
                        secondary="This duplicate requires detailed investigation to determine if it's legitimate or fraudulent."
                      />
                    </ListItem>
                  )}
                  {duplicate.risk_score <= 25 && (
                    <ListItem>
                      <ListItemIcon sx={{ color: colorScheme.info }}>
                        <InfoIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Standard Review"
                        secondary="Perform standard review procedures for this duplicate transaction."
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemIcon sx={{ color: colorScheme.warning }}>
                      <VisibilityIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Duplicate Verification"
                      secondary="Verify this is not a duplicate transaction and check for similar entries in the system."
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ color: colorScheme.info }}>
                      <MoneyIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Amount Verification"
                      secondary="Verify the amount matches the expected value and supporting documentation."
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