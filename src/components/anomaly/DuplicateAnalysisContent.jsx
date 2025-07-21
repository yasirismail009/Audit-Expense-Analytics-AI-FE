import React, { useState } from 'react';
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
  Chip,
  Collapse,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Warning as WarningIcon,
  Info as InfoIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  List as ListIcon,
  TableChart as TableChartIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { getRiskColor } from '../../utils/colorScheme';

// Import new chart components
import DuplicateTypeChart from '../charts/DuplicateTypeChart';
import DuplicateRiskChart from '../charts/DuplicateRiskChart';
import DuplicateUserChart from '../charts/DuplicateUserChart';
import DuplicateAmountChart from '../charts/DuplicateAmountChart';
import DuplicateAnalysisDashboard from '../charts/DuplicateAnalysisDashboard';
import ColorCodedDuplicateList from './shared/ColorCodedDuplicateList';
import DuplicateSummaryCards from './shared/DuplicateSummaryCards';

export default function DuplicateAnalysisContent({ data, distributionData, anomalySummary }) {
  const [expandedTransactions, setExpandedTransactions] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  const handleTransactionRowToggle = (duplicateIndex) => {
    setExpandedTransactions(prev => ({
      ...prev,
      [duplicateIndex]: !prev[duplicateIndex]
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  return (
    <Box>
      {/* Analysis Status */}
      {data.message && (
        <Alert 
          severity={data.total_duplicates > 0 ? "warning" : "success"} 
          sx={{ mb: 3 }}
          icon={data.total_duplicates > 0 ? <WarningIcon /> : <InfoIcon />}
        >
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {data.message}
          </Typography>
          {data.total_duplicates > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Found {data.total_duplicates} duplicate groups involving {data.total_transactions_involved} transactions 
              with a total amount of ${(data.total_amount_involved || 0).toLocaleString()}.
            </Typography>
          )}
        </Alert>
      )}



      {/* Enhanced Summary Cards */}
      <DuplicateSummaryCards 
        data={data} 
        distributionData={distributionData} 
        anomalySummary={anomalySummary} 
      />

      {/* Tabbed Interface for Charts and Lists */}
      <Paper sx={{ 
        mb: 3,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.3)',
        overflow: 'hidden'
      }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            background: 'linear-gradient(135deg, #925A9B, #36A2EB)',
            '& .MuiTab-root': {
              minHeight: 56,
              textTransform: 'none',
              fontWeight: 'bold',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.875rem',
              '&.Mui-selected': {
                color: 'white',
                background: 'rgba(255,255,255,0.1)',
              },
              '&:hover': {
                color: 'white',
                background: 'rgba(255,255,255,0.05)',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'white',
              height: 3
            }
          }}
        >
          <Tab 
            icon={<DashboardIcon />} 
            label="Dashboard" 
            iconPosition="start"
          />
          <Tab 
            icon={<PieChartIcon />} 
            label="Type Distribution" 
            iconPosition="start"
          />
          <Tab 
            icon={<BarChartIcon />} 
            label="Risk Analysis" 
            iconPosition="start"
          />
          <Tab 
            icon={<BarChartIcon />} 
            label="User Activity" 
            iconPosition="start"
          />
          <Tab 
            icon={<BarChartIcon />} 
            label="Amount Distribution" 
            iconPosition="start"
          />
          <Tab 
            icon={<ListIcon />} 
            label="Color-Coded Lists" 
            iconPosition="start"
          />
          <Tab 
            icon={<TableChartIcon />} 
            label="Detailed Tables" 
            iconPosition="start"
          />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <DuplicateAnalysisDashboard data={data} />
          )}
          
          {activeTab === 1 && (
            <DuplicateTypeChart data={data} />
          )}
          
          {activeTab === 2 && (
            <DuplicateRiskChart data={data} />
          )}
          
          {activeTab === 3 && (
            <DuplicateUserChart data={data} />
          )}
          
          {activeTab === 4 && (
            <DuplicateAmountChart data={data} />
          )}
          
          {activeTab === 5 && (
            <ColorCodedDuplicateList data={data} />
          )}
          
          {activeTab === 6 && (
            <Box>
              {/* Type Breakdown Table */}
              {data.type_breakdown && (
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Duplicate Type</TableCell>
                        <TableCell>Count</TableCell>
                        <TableCell>Total Transactions</TableCell>
                        <TableCell>Total Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(data.type_breakdown).map(([type, details]) => (
                        <TableRow key={type}>
                          <TableCell>{type}</TableCell>
                          <TableCell>{details.count}</TableCell>
                          <TableCell>{details.total_transactions}</TableCell>
                          <TableCell>${details.total_amount?.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Detailed Duplicates Table */}
              {data.duplicates && data.duplicates.length > 0 && (
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Criteria</TableCell>
                        <TableCell>GL Account</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Count</TableCell>
                        <TableCell>Risk Score</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.duplicates.map((duplicate, index) => (
                        <React.Fragment key={index}>
                          <TableRow>
                            <TableCell>{duplicate.type}</TableCell>
                            <TableCell>{duplicate.criteria}</TableCell>
                            <TableCell>{duplicate.gl_account}</TableCell>
                            <TableCell>${duplicate.amount?.toLocaleString()}</TableCell>
                            <TableCell>{duplicate.count}</TableCell>
                            <TableCell>
                              <Chip 
                                label={duplicate.risk_score || 'N/A'} 
                                size="small"
                                sx={{ 
                                  backgroundColor: getRiskColor(getRiskLevel(duplicate.risk_score || 0)),
                                  color: 'white'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleTransactionRowToggle(index)}
                              >
                                {expandedTransactions[index] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                              </IconButton>
                              <Typography variant="body2" color="text.secondary" component="span">
                                ({duplicate.transactions?.length || 0} transactions)
                              </Typography>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                              <Collapse in={expandedTransactions[index]} timeout="auto" unmountOnExit>
                                <Box sx={{ margin: 1 }}>
                                  <Typography variant="h6" gutterBottom component="div">
                                    Transaction Details
                                  </Typography>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>User</TableCell>
                                        <TableCell>Posting Date</TableCell>
                                        <TableCell>Document Date</TableCell>
                                        <TableCell>Document Number</TableCell>
                                        <TableCell>Amount</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {duplicate.transactions?.map((transaction, tIndex) => (
                                        <TableRow key={tIndex}>
                                          <TableCell>{transaction.id}</TableCell>
                                          <TableCell>{transaction.user_name}</TableCell>
                                          <TableCell>{transaction.posting_date}</TableCell>
                                          <TableCell>{transaction.document_date}</TableCell>
                                          <TableCell>{transaction.document_number}</TableCell>
                                          <TableCell>${transaction.amount?.toLocaleString()}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Box>
      </Paper>



      {/* User Breakdown */}
      {data.charts_data?.user_breakdown && (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User Name</TableCell>
                <TableCell>Duplicate Count</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Duplicate Types</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.charts_data.user_breakdown.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>{user.user_name}</TableCell>
                  <TableCell>{user.duplicate_count}</TableCell>
                  <TableCell>${user.total_amount?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {user.duplicate_types?.map((type, typeIndex) => (
                        <Chip 
                          key={typeIndex}
                          label={type} 
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

      {/* Financial Statement Line Breakdown */}
      {data.charts_data?.fs_line_breakdown && (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>GL Account</TableCell>
                <TableCell>Duplicate Count</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Transaction Count</TableCell>
                <TableCell>Duplicate Types</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.charts_data.fs_line_breakdown.map((line, index) => (
                <TableRow key={index}>
                  <TableCell>{line.gl_account}</TableCell>
                  <TableCell>{line.duplicate_count}</TableCell>
                  <TableCell>${line.total_amount?.toLocaleString()}</TableCell>
                  <TableCell>{line.transaction_count}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {line.duplicate_types?.map((type, typeIndex) => (
                        <Chip 
                          key={typeIndex}
                          label={type} 
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

      {/* Model Metrics */}
      {data.training_data?.model_metrics && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Model Analysis
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Total Samples</Typography>
              <Typography variant="h6">{data.training_data.model_metrics.total_samples}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Duplicate Samples</Typography>
              <Typography variant="h6" color="error.main">
                {data.training_data.model_metrics.duplicate_samples}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Non-Duplicate Samples</Typography>
              <Typography variant="h6" color="success.main">
                {data.training_data.model_metrics.non_duplicate_samples}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Duplicate Ratio</Typography>
              <Typography variant="h6">
                {((data.training_data.model_metrics.duplicate_ratio || 0) * 100).toFixed(1)}%
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Feature Importance */}
      {data.training_data?.feature_importance && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Feature Importance
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(data.training_data.feature_importance).map(([feature, importance]) => (
              <Grid item xs={6} md={3} key={feature}>
                <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {feature.replace(/_/g, ' ')}
                </Typography>
                <Typography variant="h6">
                  {(importance * 100).toFixed(1)}%
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Show raw data for debugging if no structured data */}
      {(!data.duplicates || data.duplicates.length === 0) && 
       (!data.type_breakdown) && 
       (!data.charts_data) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No structured duplicate data found. Raw response:
        </Alert>
      )}
    </Box>
  );
} 