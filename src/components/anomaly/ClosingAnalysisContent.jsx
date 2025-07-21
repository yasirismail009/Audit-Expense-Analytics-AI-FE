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

export default function ClosingAnalysisContent({ data, distributionData, anomalySummary }) {
  return (
    <Box>
      {/* Distribution Overview */}
      {distributionData && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#e8f5e8', borderRadius: 2, border: '1px solid #4caf50' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#2e7d32' }}>
            📊 Closing Entries Distribution Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  {distributionData.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Closing Entries Found
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                  {distributionData.percentage?.toFixed(1) || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  of Total Anomalies
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e65100' }}>
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
          Closing Entries Analysis
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Analysis of transactions posted on month-end closing dates.
        </Typography>
      </Alert>

      {/* Summary Metrics */}
      {data.summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="h6" color="#e65100">
                {data.summary.total_closing_entries || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Closing Entries
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
                {data.summary.closing_dates?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Closing Dates
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Closing Entries Table */}
      {data.closing_entries && data.closing_entries.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Posting Date</TableCell>
                <TableCell>Document Date</TableCell>
                <TableCell>GL Account</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Risk Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.closing_entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.transaction_id}</TableCell>
                  <TableCell>{entry.user_name}</TableCell>
                  <TableCell>{entry.posting_date}</TableCell>
                  <TableCell>{entry.document_date}</TableCell>
                  <TableCell>{entry.gl_account}</TableCell>
                  <TableCell>${entry.amount?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={entry.risk_score || 'N/A'} 
                      size="small"
                      color={entry.risk_score > 70 ? 'error' : entry.risk_score > 40 ? 'warning' : 'success'}
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