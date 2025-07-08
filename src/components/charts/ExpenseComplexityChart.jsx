import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Collapse } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { colorScheme, getRiskColor } from '../../utils/colorScheme';

export default function ExpenseComplexityChart({ expenseComplexityScores }) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const handleToggleRow = (expenseId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(expenseId)) {
      newExpandedRows.delete(expenseId);
    } else {
      newExpandedRows.add(expenseId);
    }
    setExpandedRows(newExpandedRows);
  };

  if (!expenseComplexityScores || expenseComplexityScores.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Expense Complexity Analysis</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No complexity data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const getComplexityLevel = (score) => {
    if (score >= 5) return 'CRITICAL';
    if (score >= 4) return 'HIGH';
    if (score >= 3) return 'MEDIUM';
    if (score >= 2) return 'LOW';
    return 'MINIMAL';
  };

  const getComplexityColor = (score) => {
    if (score >= 5) return '#FF6384';
    if (score >= 4) return '#FF9F40';
    if (score >= 3) return '#FFCE56';
    if (score >= 2) return '#4BC0C0';
    return '#36A2EB';
  };

  // Sort by complexity score (highest first)
  const sortedExpenses = [...expenseComplexityScores].sort((a, b) => b.score - a.score);

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Expense Complexity Analysis</Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {sortedExpenses.length} expenses analyzed for complexity factors
          </Typography>
        </Box>

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
                  Complexity
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: colorScheme.background }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedExpenses.slice(0, 10).map((expense, index) => (
                <React.Fragment key={expense.expense_id || index}>
                  <TableRow hover>
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
                      <Chip 
                        label={`Level ${expense.score}`}
                        size="small"
                        sx={{ 
                          backgroundColor: getComplexityColor(expense.score),
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleToggleRow(expense.expense_id || index)}
                        sx={{ color: colorScheme.primary }}
                      >
                        {expandedRows.has(expense.expense_id || index) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                      <Collapse in={expandedRows.has(expense.expense_id || index)} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, p: 2, backgroundColor: colorScheme.background, borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                            Description: {expense.description}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                            Vendor: {expense.vendor}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                            Category: {expense.category}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                            Date: {new Date(expense.date).toLocaleDateString()}
                          </Typography>
                          {expense.issues && expense.issues.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                                Issues Detected:
                              </Typography>
                              {expense.issues.map((issue, issueIndex) => (
                                <Typography key={issueIndex} variant="caption" sx={{ display: 'block', color: 'error.main' }}>
                                  • {issue}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {sortedExpenses.length > 10 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Showing first 10 of {sortedExpenses.length} complex expenses
            </Typography>
          </Box>
        )}

        {/* Summary Stats */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: colorScheme.background, borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
            Complexity Summary:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              Avg Complexity: {(sortedExpenses.reduce((sum, exp) => sum + exp.score, 0) / sortedExpenses.length).toFixed(1)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              High Risk: {sortedExpenses.filter(exp => exp.score >= 4).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Amount: ${sortedExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 