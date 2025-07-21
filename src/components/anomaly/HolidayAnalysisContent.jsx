import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

export default function HolidayAnalysisContent({ data, distributionData, anomalySummary }) {
  return (
    <Box>
      {/* Distribution Overview */}
      {distributionData && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#fff3e0', borderRadius: 2, border: '1px solid #ff9800' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#e65100' }}>
            📊 Holiday Entries Distribution Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                  {distributionData.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Holiday Entries Found
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  {distributionData.percentage?.toFixed(1) || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  of Total Anomalies
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                  {anomalySummary?.total_anomalies || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Anomalies
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#c2185b' }}>
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
        </Box>
      )}

      <Alert severity="info" sx={{ mb: 2 }} icon={<InfoIcon />}>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          Holiday Analysis
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Analysis of transactions posted on holidays.
        </Typography>
      </Alert>

      {/* Summary Metrics */}
      {data.summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="h6" color="#e65100">
                {data.summary.total_holiday_transactions || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Holiday Transactions
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e8' }}>
              <Typography variant="h6" color="#2e7d32">
                {data.summary.total_transactions || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Transactions
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
              <Typography variant="h6" color="#1565c0">
                ${(data.summary.total_amount || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fce4ec' }}>
              <Typography variant="h6" color="#c2185b">
                {data.summary.holidays_affected?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Holidays Affected
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Holiday Transactions Table */}
      {data.holiday_transactions && data.holiday_transactions.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Holiday Date</TableCell>
                <TableCell>Holiday Name</TableCell>
                <TableCell>GL Account</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Risk Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.holiday_transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>{transaction.transaction_id}</TableCell>
                  <TableCell>{transaction.user_name}</TableCell>
                  <TableCell>{transaction.holiday_date}</TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.holiday_name} 
                      size="small"
                      color="warning"
                    />
                  </TableCell>
                  <TableCell>{transaction.gl_account}</TableCell>
                  <TableCell>${transaction.amount?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.risk_score || 'N/A'} 
                      size="small"
                      color={transaction.risk_score > 70 ? 'error' : transaction.risk_score > 40 ? 'warning' : 'success'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Holiday Summary Table */}
      {data.holiday_summary && data.holiday_summary.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Holiday</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Transaction Count</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Users</TableCell>
                <TableCell>Risk Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.holiday_summary.map((holiday, index) => (
                <TableRow key={index}>
                  <TableCell>{holiday.holiday_name}</TableCell>
                  <TableCell>{holiday.date}</TableCell>
                  <TableCell>{holiday.transaction_count}</TableCell>
                  <TableCell>${holiday.total_amount?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {holiday.users?.map((user, userIndex) => (
                        <Chip 
                          key={userIndex}
                          label={user} 
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={holiday.risk_level || 'N/A'} 
                      size="small"
                      color={holiday.risk_level === 'High' ? 'error' : holiday.risk_level === 'Medium' ? 'warning' : 'success'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Raw Data Display */}
      <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Raw Analysis Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
          {JSON.stringify(data, null, 2)}
        </Typography>
      </Paper>
    </Box>
  );
} 