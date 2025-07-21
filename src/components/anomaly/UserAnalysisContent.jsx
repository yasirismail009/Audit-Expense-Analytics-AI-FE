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

export default function UserAnalysisContent({ data, distributionData, anomalySummary }) {
  return (
    <Box>
      {/* Distribution Overview */}
      {distributionData && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 2, border: '1px solid #2196f3' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1565c0' }}>
            📊 User Anomaly Distribution Overview
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                  {distributionData.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  User Anomalies Found
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
          User Analysis
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          User behavior and transaction patterns analysis will be displayed here when available.
        </Typography>
      </Alert>

      {/* Summary Metrics */}
      {data.summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
              <Typography variant="h6" color="#1565c0">
                {data.summary.total_users || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="h6" color="#e65100">
                {data.summary.suspicious_users || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suspicious Users
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
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fce4ec' }}>
              <Typography variant="h6" color="#c2185b">
                ${(data.summary.total_amount || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* User Activity Table */}
      {data.user_activity && data.user_activity.length > 0 && (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User Name</TableCell>
                <TableCell>Transaction Count</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Average Amount</TableCell>
                <TableCell>Risk Score</TableCell>
                <TableCell>Patterns</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.user_activity.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.user_name}</TableCell>
                  <TableCell>{user.transaction_count}</TableCell>
                  <TableCell>${user.total_amount?.toLocaleString()}</TableCell>
                  <TableCell>${user.average_amount?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.risk_score || 'N/A'} 
                      size="small"
                      color={user.risk_score > 70 ? 'error' : user.risk_score > 40 ? 'warning' : 'success'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {user.patterns?.map((pattern, patternIndex) => (
                        <Chip 
                          key={patternIndex}
                          label={pattern} 
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
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