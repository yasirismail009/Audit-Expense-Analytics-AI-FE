import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert, IconButton } from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { colorScheme, getRiskColor } from '../../utils/colorScheme';
import FlaggedExpenseDrawer from '../FlaggedExpenseDrawer';

export default function FlaggedExpensesChart({ flaggedExpenses, analysisSummary }) {
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleViewDetails = (expense) => {
    setSelectedExpense(expense);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedExpense(null);
  };

  if (!flaggedExpenses || flaggedExpenses.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Flagged Expenses</Typography>
          <Alert severity="success" sx={{ mb: 2 }}>
            No expenses have been flagged for review. All expenses appear to be within normal parameters.
          </Alert>
          <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No flagged expenses to display
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const getAnomalyType = (expense) => {
    const anomalies = [];
    if (expense.anomaly_flags?.amount_anomaly) anomalies.push('Amount');
    if (expense.anomaly_flags?.timing_anomaly) anomalies.push('Timing');
    if (expense.anomaly_flags?.vendor_anomaly) anomalies.push('Vendor');
    if (expense.anomaly_flags?.employee_anomaly) anomalies.push('Employee');
    if (expense.anomaly_flags?.duplicate_suspicion) anomalies.push('Duplicate');
    return anomalies.join(', ') || 'Vendor';
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Flagged Expenses</Typography>
        
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
        >
          {flaggedExpenses.length} expenses have been flagged for review due to potential anomalies.
        </Alert>

        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: colorScheme.background }}>
                  Employee
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: colorScheme.background }}>
                  Amount
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: colorScheme.background }}>
                  Category
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: colorScheme.background }}>
                  Risk Score
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: colorScheme.background }}>
                  Anomalies
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: colorScheme.background }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flaggedExpenses?.map((expense, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {expense.employee || 'Unknown'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                      ${parseFloat(expense.amount).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {expense.category || 'Uncategorized'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`${expense.fraud_score?.toFixed(1)}%`}
                      size="small"
                      sx={{ 
                        backgroundColor: getRiskColor(expense.risk_level || getRiskLevel(expense.fraud_score)),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {getAnomalyType(expense)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewDetails(expense)}
                      sx={{ color: colorScheme.primary }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {flaggedExpenses.length > 10 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Showing first 10 of {flaggedExpenses.length} flagged expenses
            </Typography>
          </Box>
        )}

        {/* Summary Stats */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
            Summary:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              Total Flagged: {flaggedExpenses.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg Risk Score: {(flaggedExpenses.reduce((sum, exp) => sum + (exp.fraud_score || 0), 0) / flaggedExpenses.length).toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Amount: ${flaggedExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* Flagged Expense Drawer */}
      <FlaggedExpenseDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        flaggedExpense={selectedExpense}
      />
    </Card>
  );
} 