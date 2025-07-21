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

export default function UnusualDaysAnalysisContent({ data, distributionData, anomalySummary }) {
  return (
    <Box>
      {/* Distribution Overview */}
      {distributionData && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f3e5f5', borderRadius: 2, border: '1px solid #9c27b0' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#7b1fa2' }}>
            📊 Unusual Days Distribution Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                  {distributionData.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unusual Days Found
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
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e65100' }}>
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
          Unusual Days Analysis
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Analysis of transactions on unusual business days (weekends, holidays, etc.).
        </Typography>
      </Alert>

      {/* Summary Metrics */}
      {data.summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="h6" color="#e65100">
                {data.summary.total_unusual_days || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unusual Days
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
                {data.summary.weekend_transactions || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Weekend Transactions
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Unusual Days Table */}
      {data.unusual_days && data.unusual_days.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Day Type</TableCell>
                <TableCell>Transaction Count</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Users</TableCell>
                <TableCell>Risk Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.unusual_days.map((day, index) => (
                <TableRow key={index}>
                  <TableCell>{day.date}</TableCell>
                  <TableCell>
                    <Chip 
                      label={day.day_type} 
                      size="small"
                      color={day.day_type === 'Weekend' ? 'error' : day.day_type === 'Holiday' ? 'warning' : 'info'}
                    />
                  </TableCell>
                  <TableCell>{day.transaction_count}</TableCell>
                  <TableCell>${day.total_amount?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {day.users?.map((user, userIndex) => (
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
                      label={day.risk_score || 'N/A'} 
                      size="small"
                      color={day.risk_score > 70 ? 'error' : day.risk_score > 40 ? 'warning' : 'success'}
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