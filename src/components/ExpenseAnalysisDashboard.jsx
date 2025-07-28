import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  LinearProgress,
  Avatar,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  Warning, 
  CheckCircle, 
  Error,
  AccountBalance,
  People,
  AttachMoney,
  Assessment,
  Timeline,
  PieChart,
  BarChart,
  Security,
  Analytics,
  Business,
  Receipt
} from '@mui/icons-material';
import { colorScheme, getRiskColor } from '../utils/colorScheme';


// Import chart widgets
import RiskDistributionChart from './charts/RiskDistributionChart';
import AnomaliesDistributionChart from './charts/AnomaliesDistributionChart';
import EmployeeExpensesChart from './charts/EmployeeExpensesChart';
import CategoryExpensesChart from './charts/CategoryExpensesChart';
import DepartmentExpensesChart from './charts/DepartmentExpensesChart';

// Import analysis components
import AnomalyAnalysisAccordion from './AnomalyAnalysisAccordion';
import DetailedRiskAnalysis from './DetailedRiskAnalysis';

export default function ExpenseAnalysisDashboard({ sheetData }) {
  console.log("Dashboard - sheetData:", sheetData)
  if (!sheetData) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          No data available
        </Typography>
      </Box>
    );
  }

  // Map the data structure to match the actual data format
  const fileInfo = sheetData.fileInfo;
  const statistics = sheetData.statistics;
  const glSummary = sheetData.glSummary;
  const anomaliesStats = sheetData.anomaliesStats;
  const anomaliesAccordion = sheetData.anomaliesAccordion;
  const chartsData = sheetData.chartsData;
  const glChartsData = sheetData.glChartsData;
  const analysisSessionsSummary = sheetData.analysisSessionsSummary;

  // Additional data mappings for backward compatibility
  const chartData = sheetData.chart_data;
  const analysisSummary = sheetData.analysis_summary;
  const flaggedExpenses = sheetData.flagged_expenses;
  const anomaliesData = sheetData.anomalies_data;
  const advancedMetrics = sheetData.advanced_metrics;

  console.log("Dashboard - sheetData:", sheetData)
  console.log("Dashboard - statistics:", statistics)
  console.log("Dashboard - fileInfo:", fileInfo)
  console.log("Dashboard - analysisSummary:", analysisSummary)
  console.log("Dashboard - anomaliesAccordion:", anomaliesAccordion)
  console.log("Dashboard - chartsData:", chartsData)
  console.log("Dashboard - chartsData?.topUsersByAmount:", chartsData?.topUsersByAmount)

  // Helper function to format currency
  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    
    if (num >= 1000000000000) {
      return `${(num / 1000000000000).toFixed(1)}T SAR`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M SAR`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K SAR`;
    } else {
      return `${num.toFixed(0)} SAR`;
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Calculate overall risk score from the actual data structure
  const overallRiskScore = Math.round(analysisSummary?.overall_fraud_score || 0);
  
  // Get risk level from chart_data.overall_risk_gauge as primary source, then risk_distribution_chart
  const getRiskLevelFromDistribution = () => {
    // First try to get from overall_risk_gauge which has the most accurate risk level
    const overallRiskGauge = sheetData?.chart_data?.overall_risk_gauge;
    if (overallRiskGauge?.risk_level) {
      return overallRiskGauge.risk_level;
    }
    
    // Fallback to risk_distribution_chart
    const riskDistribution = sheetData?.chart_data?.risk_distribution_chart;
    if (riskDistribution && riskDistribution.labels && riskDistribution.data) {
      // Find the risk level with the highest count
      let maxCount = 0;
      let dominantRiskLevel = 'LOW';
      
      riskDistribution.labels.forEach((label, index) => {
        const count = riskDistribution.data[index] || 0;
        if (count > maxCount) {
          maxCount = count;
          // Map the label to the expected risk level format
          const normalizedLabel = label.toUpperCase().replace(/\s+/g, '');
          if (normalizedLabel.includes('CRITICAL RISK')) {
            dominantRiskLevel = 'CRITICAL RISK';
          } else if (normalizedLabel.includes('HIGH RISK')) {
            dominantRiskLevel = 'HIGH RISK';
          } else if (normalizedLabel.includes('MEDIUM RISK')) {
            dominantRiskLevel = 'MEDIUM RISK';
          } else if (normalizedLabel.includes('LOW RISK')) {
            dominantRiskLevel = 'LOW RISK';
          }
        }
      });
      
      return dominantRiskLevel;
    }
    
    // Fallback to analysis summary or calculated risk level
    return analysisSummary?.risk_level || 
           (overallRiskScore >= 80 ? 'CRITICAL' : 
           overallRiskScore >= 60 ? 'HIGH' : 
           overallRiskScore >= 40 ? 'MEDIUM' : 'LOW');
  };
  
  const riskLevel = getRiskLevelFromDistribution();
  
  // Debug risk level calculation
  console.log("Risk level calculation debug:", {
    chartDataRiskDistribution: sheetData?.chart_data?.risk_distribution_chart,
    overallRiskGauge: sheetData?.chart_data?.overall_risk_gauge,
    analysisSummaryRiskLevel: analysisSummary?.risk_level,
    overallRiskScore,
    calculatedRiskLevel: riskLevel
  });

  // Extract anomaly data from the actual structure
  const anomalyData = {
    duplicateEntries: anomaliesAccordion?.duplicateEntries || 0,
    userAnomalies: anomaliesAccordion?.userAnomalies || 0,
    backdatedEntries: anomaliesAccordion?.backdatedEntries || 0,
    closingEntries: anomaliesAccordion?.closingEntries || 0,
    unusualDays: anomaliesAccordion?.unusualDays || 0,
    holidayEntries: anomaliesAccordion?.holidayEntries || 0,
    totalAnomalies: anomaliesAccordion?.totalAnomalies || 
                   (anomaliesAccordion?.duplicateEntries || 0) + 
                   (anomaliesAccordion?.userAnomalies || 0) + 
                   (anomaliesAccordion?.backdatedEntries || 0) + 
                   (anomaliesAccordion?.closingEntries || 0) + 
                   (anomaliesAccordion?.unusualDays || 0) + 
                   (anomaliesAccordion?.holidayEntries || 0)
  };

  // Debug the values being displayed
  console.log("Display values:", {
    totalTransactions: statistics?.totalTransactions,
    totalAmount: statistics?.totalAmount,
    uniqueUsers: statistics?.uniqueUsers,
    uniqueAccounts: statistics?.uniqueAccounts,
    flaggedTransactions: statistics?.flaggedTransactions,
    overallRiskScore,
    riskLevel,
    anomalyData
  });

  // Comprehensive statistics object for display
  const comprehensiveStats = {
    // Basic Transaction Stats
    totalTransactions: statistics?.totalTransactions || 0,
    totalAmount: statistics?.totalAmount || 0,
    avgAmount: statistics?.avgAmount || 0,
    minAmount: statistics?.minAmount || 0,
    maxAmount: statistics?.maxAmount || 0,
    currency: statistics?.currency || '',
    
    // User & Account Stats
    uniqueUsers: statistics?.uniqueUsers || 0,
    uniqueAccounts: statistics?.uniqueAccounts || 0,
    uniqueProfitCenters: statistics?.uniqueProfitCenters || 0,
    
    // Risk & Anomaly Stats
    riskScore: statistics?.riskScore || overallRiskScore,
    riskLevel: statistics?.riskLevel || riskLevel,
    anomaliesDetected: statistics?.anomaliesDetected || anomalyData.totalAnomalies,
    duplicatesFound: statistics?.duplicatesFound || anomalyData.duplicateEntries,
    flaggedTransactions: statistics?.flaggedTransactions || analysisSummary?.total_flagged_expenses || 0,
    flagRate: statistics?.flagRate || 0,
    highValueTransactions: statistics?.highValueTransactions || 0,
    
    // Financial Stats
    totalDebits: statistics?.totalDebits || 0,
    totalCredits: statistics?.totalCredits || 0,
    trialBalance: statistics?.trialBalance || 0,
    
    // Date Range
    dateRange: statistics?.dateRange || { startDate: '', endDate: '' }
  };

console.log("sheetData:", sheetData)
  return (
    <Box sx={{ minHeight: '100vh', background: colorScheme.background, p: 3 }}>
      {/* Top Summary Banner */}
      <Card sx={{ 
        mb: 4, 
        background: colorScheme.cardBackground, 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'visible'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4} alignItems="center">
            {/* Left Section - File Information */}
            <Grid item size={{xs: 12, md: 6}}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: colorScheme.textPrimary, 
                mb: 1,
                fontSize: '1.75rem'
              }}>
                {fileInfo?.fileName || 'Data Analysis'}
              </Typography>
              <Typography variant="body1" sx={{ color: colorScheme.textSecondary, mb: 0.5 }}>
                Uploaded: {formatDate(fileInfo?.uploadedAt)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#888' }}>
                Status: {fileInfo?.status || 'COMPLETED'} • Records: {fileInfo?.totalRecords || 0}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', width:'fit-content', marginTop: '10px', gap: '10px'   }}>
                  <Box sx={{ 
                    width: 120,
                     
                    height: 120, 
                    borderRadius: '50%', 
                    background: `linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.primary}dd 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    position: 'relative',
                    boxShadow: `0 8px 32px ${colorScheme.primary}4d`
                  }}>
                    <Typography variant="h2" sx={{ 
                      fontWeight: 800, 
                      color: 'white',
                      fontSize: '2.2rem'
                    }}>
                      {overallRiskScore}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width:'fit-content', marginTop: '10px'   }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 1, 
                    color: colorScheme.textPrimary,
                    fontSize: '1rem'
                  }}>
                    Final Result
                  </Typography>
                  <Chip 
                    label={riskLevel} 
                    size="medium"
                    sx={{ 
                      backgroundColor: getRiskColor(riskLevel),
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      px: 2,
                      py: 0.5
                    }}
                  />
                  </Box>
                </Box>
            </Grid>

            {/* Right Section - Analysis Results & Statistics */}
            <Grid item size={{xs: 12, md: 6}}>
            <Grid container spacing={2}>
                    <Grid item size={{xs: 3, md: 3}}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Timeline sx={{ 
                          color: colorScheme.primary, 
                          fontSize: 24, 
                          mb: 0.5 
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: colorScheme.textPrimary,
                          mb: 0.5,
                          fontSize: '1.1rem'
                        }}>
                          {comprehensiveStats.totalTransactions}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.8rem'
                        }}>
                          Transactions
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item size={{xs: 3, md: 3}}>
                      <Box sx={{ textAlign: 'center' }}>
                        <AttachMoney sx={{ 
                          color: colorScheme.primary, 
                          fontSize: 24, 
                          mb: 0.5 
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: colorScheme.textPrimary,
                          mb: 0.5,
                          fontSize: '1.1rem'
                        }}>
                          {formatCurrency(comprehensiveStats.totalAmount)}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.8rem'
                        }}>
                          Total Amount
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item size={{xs: 3, md: 3}}>
                      <Box sx={{ textAlign: 'center' }}>
                        <People sx={{ 
                          color: colorScheme.primary, 
                          fontSize: 24, 
                          mb: 0.5 
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: colorScheme.textPrimary,
                          mb: 0.5,
                          fontSize: '1.1rem'
                        }}>
                          {comprehensiveStats.uniqueUsers}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.8rem'
                        }}>
                          Users
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item size={{xs: 3, md: 3}}>
                      <Box sx={{ textAlign: 'center' }}>
                        <AccountBalance sx={{ 
                          color: colorScheme.primary, 
                          fontSize: 24, 
                          mb: 0.5 
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: colorScheme.textPrimary,
                          mb: 0.5,
                          fontSize: '1.1rem'
                        }}>
                          {comprehensiveStats.uniqueAccounts}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.8rem'
                        }}>
                          Unique Accounts
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item size={{xs: 3, md: 3}}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Security sx={{ 
                          color: colorScheme.primary, 
                          fontSize: 24, 
                          mb: 0.5 
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: colorScheme.textPrimary,
                          mb: 0.5,
                          fontSize: '1.1rem'
                        }}>
                          {comprehensiveStats.flaggedTransactions}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.8rem'
                        }}>
                          Flagged Transactions
                        </Typography>
                      </Box>
                    </Grid>
                 
                    <Grid item size={{xs: 3, md: 3}}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Receipt sx={{ 
                          color: colorScheme.primary, 
                          fontSize: 24, 
                          mb: 0.5 
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: colorScheme.textPrimary,
                          mb: 0.5,
                          fontSize: '1.1rem'
                        }}>
                          {formatCurrency(comprehensiveStats.avgAmount)}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.8rem'
                        }}>
                          Average Amount
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item size={{xs: 3, md: 3}}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Warning sx={{ 
                          color: colorScheme.primary, 
                          fontSize: 24, 
                          mb: 0.5 
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: colorScheme.textPrimary,
                          mb: 0.5,
                          fontSize: '1.1rem'
                        }}>
                          {comprehensiveStats.anomaliesDetected}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.8rem'
                        }}>
                          Anomalies
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item size={{xs: 3, md: 3}}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Error sx={{ 
                          color: colorScheme.primary, 
                          fontSize: 24, 
                          mb: 0.5 
                        }} />
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          color: colorScheme.textPrimary,
                          mb: 0.5,
                          fontSize: '1.1rem'
                        }}>
                          {comprehensiveStats.duplicatesFound}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: colorScheme.textSecondary,
                          fontSize: '0.8rem'
                        }}>
                          Duplicates
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Comprehensive Statistics Section */}
      <Card sx={{ 
        mb: 4, 
        background: colorScheme.cardBackground, 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'visible'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Analytics sx={{ 
              color: colorScheme.primary, 
              fontSize: 32, 
              mr: 2 
            }} />
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: colorScheme.textPrimary, 
              fontSize: '1.5rem'
            }}>
              Comprehensive Statistics
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {/* Basic Transaction Stats */}
            <Grid item size={{xs: 12, md: 6}}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #925A9B 0%, #7B4B8A 100%)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(146, 90, 155, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                height: 320
              }}>
                <Box sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  right: -20, 
                  width: 100, 
                  height: 100, 
                  background: 'rgba(255,255,255,0.1)', 
                  borderRadius: '50%' 
                }} />
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Timeline sx={{ color: 'white', fontSize: 24, mr: 1.5 }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: 'white',
                      fontSize: '1.1rem'
                    }}>
                      Transaction Statistics
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gap: 1.5, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Total Transactions
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        {comprehensiveStats.totalTransactions}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Total Amount
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        {formatCurrency(comprehensiveStats.totalAmount)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Average Amount
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        {formatCurrency(comprehensiveStats.avgAmount)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Currency
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        {comprehensiveStats.currency || 'SAR'}
                      </Typography>
                    </Box>
                  </Box>

                </CardContent>
              </Card>
            </Grid>

            {/* User & Account Stats */}
            <Grid item size={{xs: 12, md: 6}}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #925A9B 0%, #7B4B8A 100%)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(146, 90, 155, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                height: 320
              }}>
                <Box sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  right: -20, 
                  width: 100, 
                  height: 100, 
                  background: 'rgba(255,255,255,0.1)', 
                  borderRadius: '50%' 
                }} />
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <People sx={{ color: 'white', fontSize: 24, mr: 1.5 }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: 'white',
                      fontSize: '1.1rem'
                    }}>
                      User & Account Statistics
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gap: 1.5, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Unique Users
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        {comprehensiveStats.uniqueUsers}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Unique Accounts
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        {comprehensiveStats.uniqueAccounts}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Profit Centers
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        {comprehensiveStats.uniqueProfitCenters}
                      </Typography>
                    </Box>
                  </Box>
                  
                </CardContent>
              </Card>
            </Grid>

            {/* Risk & Anomaly Stats */}
            <Grid item size={{xs: 12, md: 6}}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #925A9B 0%, #7B4B8A 100%)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(146, 90, 155, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                height: 320
              }}>
                <Box sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  right: -20, 
                  width: 100, 
                  height: 100, 
                  background: 'rgba(255,255,255,0.1)', 
                  borderRadius: '50%' 
                }} />
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Security sx={{ color: 'white', fontSize: 24, mr: 1.5 }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: 'white',
                      fontSize: '1.1rem'
                    }}>
                      Risk & Anomaly Statistics
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gap: 1.5, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Risk Score
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        {comprehensiveStats.riskScore}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Risk Level
                      </Typography>
                      <Chip 
                        label={comprehensiveStats.riskLevel} 
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          px: 1,
                          py: 0.2,
                          border: '1px solid rgba(255,255,255,0.3)'
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Anomalies Detected
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        {comprehensiveStats.anomaliesDetected}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Duplicates Found
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        {comprehensiveStats.duplicatesFound}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Flagged Transactions
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        {comprehensiveStats.flaggedTransactions}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Flag Rate
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        {comprehensiveStats.flagRate}%
                      </Typography>
                    </Box>
                  </Box>
                  
                </CardContent>
              </Card>
            </Grid>

            {/* Financial Stats */}
            <Grid item size={{xs: 12, md: 6}}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #925A9B 0%, #7B4B8A 100%)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(146, 90, 155, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                height: 320
              }}>
                <Box sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  right: -20, 
                  width: 100, 
                  height: 100, 
                  background: 'rgba(255,255,255,0.1)', 
                  borderRadius: '50%' 
                }} />
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalance sx={{ color: 'white', fontSize: 24, mr: 1.5 }} />
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: 'white',
                      fontSize: '1.1rem'
                    }}>
                      Financial Statistics
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gap: 1.5, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Total Debits
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        {formatCurrency(comprehensiveStats.totalDebits)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Total Credits
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        {formatCurrency(comprehensiveStats.totalCredits)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                        Trial Balance
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                        {formatCurrency(comprehensiveStats.trialBalance)}
                      </Typography>
                    </Box>
                    {comprehensiveStats.dateRange?.startDate && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                          Date Range
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                          {formatDate(comprehensiveStats.dateRange.startDate)} - {formatDate(comprehensiveStats.dateRange.endDate)}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Risk Distribution */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            background: colorScheme.cardBackground,
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: colorScheme.textPrimary,
                fontSize: '1.1rem'
              }}>
                Risk Distribution
              </Typography>
              <Box sx={{ mb: 3 }}>
                {/* Generate risk distribution based on actual chart data */}
                {(() => {
                  const riskDistributionData = sheetData?.chartsData?.riskDistribution;
                  const labels = riskDistributionData?.labels || ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'];
                  const data = riskDistributionData?.data || [0, 0, 0, 0];
                  const percentages = riskDistributionData?.percentages || [0, 0, 0, 0];
                  
                  // Debug risk distribution data
                  console.log("Risk Distribution Card Data:", {
                    riskDistributionData,
                    labels,
                    data,
                    percentages,
                    currentRiskLevel: riskLevel
                  });
                  
                  return labels.map((label, index) => {
                    const count = data[index] || 0;
                    const percentage = percentages[index] || 0;
                    const hasData = count > 0; // Highlight any risk level that has data
                    const isCurrentLevel = label.toUpperCase().includes(riskLevel);
                    
                    return (
                      <Box key={index} sx={{ mb: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Warning sx={{ 
                            color: hasData ? "#925A9B" : "#ccc", 
                            fontSize: 20,
                            mr: 1.5 
                          }} />
                          <Typography variant="body1" sx={{ 
                            flex: 1, 
                            fontWeight: 600,
                            color: hasData ? colorScheme.textPrimary : colorScheme.textSecondary,
                            fontSize: '0.9rem'
                          }}>
                            {label}
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600, 
                            color: hasData ? "#925A9B" : colorScheme.textSecondary,
                            fontSize: '0.9rem'
                          }}>
                            {count} ({percentage.toFixed(1)}%)
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 3,
                            backgroundColor: '#f0f0f0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: hasData ? "#b18db7" : "#e0e0e0",
                              borderRadius: 3
                            }
                          }} 
                        />
                      </Box>
                    );
                  });
                })()}
              </Box>
              <Box sx={{ 
                width: '100%',
                background: '#f8f9fa', 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginTop: '20px' 
              }}>
                <RiskDistributionChart data={{
                  labels: sheetData?.chartsData?.riskDistribution?.labels || ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                  data: sheetData?.chartsData?.riskDistribution?.data || [0, 0, 0, 0],
                  percentages: sheetData?.chartsData?.riskDistribution?.percentages || [0, 0, 0, 0]
                }} />
                {/* Debug chart data */}
                {console.log("Risk Distribution Chart Data:", {
                  chartLabels: sheetData?.chartsData?.riskDistribution?.labels,
                  chartData: sheetData?.chartsData?.riskDistribution?.data,
                  chartPercentages: sheetData?.chartsData?.riskDistribution?.percentages
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Anomaly Summary */}
        <Grid item size={{xs: 12, md: 6}}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            background: colorScheme.cardBackground,
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: colorScheme.textPrimary,
                fontSize: '1.1rem'
              }}>
                Anomaly Summary
              </Typography>
              <Box sx={{ mb: 3 }}>
                {[
                  { 
                    label: 'Duplicate Entries', 
                    value: anomalyData.duplicateEntries, 
                    icon: <Error sx={{ color: colorScheme.primary }} />,
                    color: colorScheme.primary
                  },
                  { 
                    label: 'User Anomalies', 
                    value: anomalyData.userAnomalies, 
                    icon: <People sx={{ color: colorScheme.primary }} />,
                    color: colorScheme.primary
                  },
                  { 
                    label: 'Backdated Entries', 
                    value: anomalyData.backdatedEntries, 
                    icon: <Timeline sx={{ color: colorScheme.primary }} />,
                    color: colorScheme.primary
                  },
                  { 
                    label: 'Closing Entries', 
                    value: anomalyData.closingEntries, 
                    icon: <CheckCircle sx={{ color: colorScheme.primary }} />,
                    color: colorScheme.primary
                  },
                  { 
                    label: 'Unusual Days', 
                    value: anomalyData.unusualDays, 
                    icon: <Warning sx={{ color: colorScheme.primary }} />,
                    color: colorScheme.primary
                  },
                  { 
                    label: 'Holiday Entries', 
                    value: anomalyData.holidayEntries, 
                    icon: <Assessment sx={{ color: colorScheme.primary }} />,
                    color: colorScheme.primary
                  }
                ].map((item, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ mr: 1.5 }}>
                        {item.icon}
                      </Box>
                      <Typography variant="body1" sx={{ 
                        flex: 1, 
                        fontWeight: 600,
                        color: colorScheme.textPrimary,
                        fontSize: '0.9rem'
                      }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 600, 
                        color: item.color,
                        fontSize: '0.9rem'
                      }}>
                        {item.value}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((item.value / (anomalyData.totalAnomalies || 1)) * 100, 100)} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: '#f0f0f0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: "#b18db7",
                          borderRadius: 3
                        }
                      }} 
                    />
                  </Box>
                ))}
              </Box>
              <Box sx={{ 
                 width: '100%',
                background: '#f8f9fa', 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <AnomaliesDistributionChart data={{
                  labels: sheetData?.chartsData?.anomalyBreakdown?.labels || ['Duplicate Entries', 'User Anomalies', 'Backdated Entries', 'Closing Entries', 'Unusual Days', 'Holiday Entries'],
                  data: sheetData?.chartsData?.anomalyBreakdown?.data || [
                    anomalyData.duplicateEntries,
                    anomalyData.userAnomalies,
                    anomalyData.backdatedEntries,
                    anomalyData.closingEntries,
                    anomalyData.unusualDays,
                    anomalyData.holidayEntries
                  ]
                }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Users by Amount */}
        {(chartsData?.topUsersByAmount && chartsData.topUsersByAmount.length > 0) && (
          <Grid item size={{xs: 12, md: 12}}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
              background: colorScheme.cardBackground,
              height: '100%'
            }}>
              <CardContent sx={{ p: 3 }}>
                              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                color: colorScheme.textPrimary,
                fontSize: '1.1rem'
              }}>
                Top Users by Amount
              </Typography>
              
              {/* User Summary Statistics */}
              {chartsData?.topUsersByAmount && chartsData.topUsersByAmount.length > 0 && (
                <Box sx={{ 
                  mb: 3, 
                  p: 3, 
                  background: '#f8f9fa', 
                  borderRadius: 3,
                  border: `1px solid ${colorScheme.border}`
                }}>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 600, 
                    mb: 2, 
                    color: colorScheme.textPrimary,
                    fontSize: '1rem'
                  }}>
                    User Activity Summary
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item size={{xs: 12, md: 3}}>
                      <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1, fontSize: '0.875rem' }}>
                        <strong>Total Users:</strong> {chartsData.topUsersByAmount.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1, fontSize: '0.875rem' }}>
                        <strong>Total Amount:</strong> {formatCurrency(chartsData.topUsersByAmount.reduce((sum, user) => sum + (user.totalAmount || 0), 0))}
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 12, md: 3}}>
                      <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1, fontSize: '0.875rem' }}>
                        <strong>Total Transactions:</strong> {chartsData.topUsersByAmount.reduce((sum, user) => sum + (user.transactionCount || 0), 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1, fontSize: '0.875rem' }}>
                        <strong>Avg Amount per User:</strong> {formatCurrency(chartsData.topUsersByAmount.reduce((sum, user) => sum + (user.totalAmount || 0), 0) / chartsData.topUsersByAmount.length)}
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 12, md: 3}}>
                      <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1, fontSize: '0.875rem' }}>
                        <strong>Most Active User:</strong> {chartsData.topUsersByAmount[0]?.userName || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1, fontSize: '0.875rem' }}>
                        <strong>Highest Spender:</strong> {chartsData.topUsersByAmount.reduce((max, user) => (user.totalAmount || 0) > (max.totalAmount || 0) ? user : max, { totalAmount: 0 })?.userName || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item size={{xs: 12, md: 3}}>
                      <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1, fontSize: '0.875rem' }}>
                        <strong>Total Accounts Used:</strong> {chartsData.topUsersByAmount.reduce((sum, user) => sum + (user.accountsCount || 0), 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colorScheme.textSecondary, mb: 1, fontSize: '0.875rem' }}>
                        <strong>Avg Accounts per User:</strong> {(chartsData.topUsersByAmount.reduce((sum, user) => sum + (user.accountsCount || 0), 0) / chartsData.topUsersByAmount.length).toFixed(1)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
              <TableContainer component={Paper} sx={{ 
                boxShadow: 'none', 
                mb: 3,
                background: 'transparent'
              }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }}>
                        User
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }} align="right">
                        Total Amount
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }} align="right">
                        Transactions
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }} align="right">
                        Avg Amount
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }} align="right">
                        Accounts
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(chartsData?.topUsersByAmount || []).slice(0, 5).map((user, index) => (
                      <TableRow key={index} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ border: 'none', py: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              mr: 2, 
                              backgroundColor: colorScheme.primary,
                              fontSize: '0.875rem',
                              fontWeight: 600
                            }}>
                              {(user.userName || user.user_name || user || '')?.toString()?.charAt(0) || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: colorScheme.textPrimary,
                                fontSize: '0.875rem'
                              }}>
                                {user.userName || user.user_name || (typeof user === 'string' ? user : 'Unknown User')}
                              </Typography>
                              {user.dateRange && (
                                <Typography variant="caption" sx={{ 
                                  color: colorScheme.textSecondary,
                                  fontSize: '0.75rem'
                                }}>
                                  {user.dateRange.min && user.dateRange.max ? 
                                    `${new Date(user.dateRange.min).toLocaleDateString()} - ${new Date(user.dateRange.max).toLocaleDateString()}` : 
                                    'Date range unavailable'
                                  }
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ border: 'none', py: 1 }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600, 
                            color: colorScheme.primary,
                            fontSize: '0.875rem'
                          }}>
                            {formatCurrency(user.totalAmount || (typeof user === 'number' ? user : 0))}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ border: 'none', py: 1 }}>
                          <Typography variant="body2" sx={{ 
                            color: colorScheme.textSecondary,
                            fontSize: '0.875rem'
                          }}>
                            {user.transactionCount || 1}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ border: 'none', py: 1 }}>
                          <Typography variant="body2" sx={{ 
                            color: colorScheme.textSecondary,
                            fontSize: '0.875rem'
                          }}>
                            {formatCurrency(user.avgAmount || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ border: 'none', py: 1 }}>
                          <Typography variant="body2" sx={{ 
                            color: colorScheme.textSecondary,
                            fontSize: '0.875rem'
                          }}>
                            {user.accountsCount || 0}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ 
                width: '100%',
                background: '#f8f9fa', 
                borderRadius: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                {(() => {
                  const chartLabels = (chartsData?.topUsersByAmount || []).slice(0, 5).map(user => user.userName || user.user_name || (typeof user === 'string' ? user : 'Unknown User'));
                  const chartData = (chartsData?.topUsersByAmount || []).slice(0, 5).map(user => user.totalAmount || 0);
                  console.log('Chart - chartLabels:', chartLabels);
                  console.log('Chart - chartData:', chartData);
                  console.log('Chart - chartsData?.topUsersByAmount:', chartsData?.topUsersByAmount);
                  
                  return (
                    <EmployeeExpensesChart data={{
                      labels: chartLabels,
                      data: chartData
                    }} />
                  );
                })()}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        )}

        {/* Top GL Accounts */}
        {(() => {
          console.log("GL Accounts Data Debug:", {
            glChartsData: glChartsData,
            topAccountsByAmount: glChartsData?.topAccountsByAmount,
            accountCount: glChartsData?.topAccountsByAmount?.length || 0
          });
          return (glChartsData?.topAccountsByAmount && glChartsData.topAccountsByAmount.length > 0);
        })() && (
          <Grid item size={{xs: 12, md: 12}}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
              background: colorScheme.cardBackground
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 3, 
                  color: colorScheme.textPrimary,
                  fontSize: '1.1rem'
                }}>
                  GL Accounts
                </Typography>
                
                {/* GL Account Summary */}
                {(() => {
                  console.log("GL Summary Statistics Debug:", {
                    glSummary: glSummary,
                    summaryStatistics: glSummary?.summaryStatistics,
                    totalAccounts: glSummary?.summaryStatistics?.totalAccounts,
                    totalTrialBalance: glSummary?.summaryStatistics?.totalTrialBalance
                  });
                  return glSummary?.summaryStatistics;
                })() && (
                <Box sx={{ 
                  mb: 4, 
                  p: 4, 
                  background: 'linear-gradient(135deg, #925A9B 0%, #7B4B8A 100%)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(146, 90, 155, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Decorative background element */}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: -20, 
                    right: -20, 
                    width: 100, 
                    height: 100, 
                    background: 'rgba(255,255,255,0.1)', 
                    borderRadius: '50%' 
                  }} />
                  
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 3, 
                    color: 'white',
                    fontSize: '1.2rem',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    GL Account Summary Statistics
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
                    {/* Basic Account Stats */}
                    <Grid item size={{xs: 12, md: 3}}>
                      <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                        <AccountBalance sx={{ color: 'white', fontSize: 28, mb: 1 }} />
                        <Typography variant="h5" sx={{ 
                          fontWeight: 700, 
                          color: 'white',
                          mb: 0.5,
                          fontSize: '1.5rem'
                        }}>
                          {glSummary.summaryStatistics.totalAccounts}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.875rem'
                        }}>
                          Total Accounts
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {/* Financial Stats */}
                    <Grid item size={{xs: 12, md: 3}}>
                      <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                        <AttachMoney sx={{ color: 'white', fontSize: 28, mb: 1 }} />
                        <Typography variant="h5" sx={{ 
                          fontWeight: 700, 
                          color: 'white',
                          mb: 0.5,
                          fontSize: '1.5rem'
                        }}>
                          {formatCurrency(glSummary.summaryStatistics.totalTrialBalance)}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.875rem'
                        }}>
                          Total Trial Balance
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {/* Risk Stats */}
                    <Grid item size={{xs: 12, md: 3}}>
                      <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                        <Security sx={{ color: 'white', fontSize: 28, mb: 1 }} />
                        <Typography variant="h5" sx={{ 
                          fontWeight: 700, 
                          color: 'white',
                          mb: 0.5,
                          fontSize: '1.5rem'
                        }}>
                          {glSummary.summaryStatistics.avgRiskScore?.toFixed(1) || '0.0'}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.875rem'
                        }}>
                          Avg Risk Score
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {/* Anomaly Stats */}
                    <Grid item size={{xs: 12, md: 3}}>
                      <Box sx={{ textAlign: 'center', p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                        <Warning sx={{ color: 'white', fontSize: 28, mb: 1 }} />
                        <Typography variant="h5" sx={{ 
                          fontWeight: 700, 
                          color: 'white',
                          mb: 0.5,
                          fontSize: '1.5rem'
                        }}>
                          {glSummary.summaryStatistics.accountsWithAnomalies || 0}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: '0.875rem'
                        }}>
                          Accounts with Anomalies
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {/* Detailed Stats Grid */}
                  <Grid container spacing={2} sx={{ mt: 3, position: 'relative', zIndex: 1 }}>
                    <Grid item size={{xs: 12, md: 6}}>
                      <Box sx={{ 
                        p: 2, 
                        background: 'rgba(255,255,255,0.05)', 
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <Typography variant="subtitle2" sx={{ 
                          color: 'rgba(255,255,255,0.9)', 
                          mb: 1.5,
                          fontWeight: 600,
                          fontSize: '0.9rem'
                        }}>
                          Financial Overview
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                              Total Debits
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>
                              {formatCurrency(glSummary.summaryStatistics.totalDebits)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                              Total Credits
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>
                              {formatCurrency(glSummary.summaryStatistics.totalCredits)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                              Trading Equity
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>
                              {formatCurrency(glSummary.summaryStatistics.totalTradingEquity)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                              Currency
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>
                              {glSummary.summaryStatistics.currency}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item size={{xs: 12, md: 6}}>
                      <Box sx={{ 
                        p: 2, 
                        background: 'rgba(255,255,255,0.05)', 
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <Typography variant="subtitle2" sx={{ 
                          color: 'rgba(255,255,255,0.9)', 
                          mb: 1.5,
                          fontWeight: 600,
                          fontSize: '0.9rem'
                        }}>
                          Risk & Security Metrics
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                              High Risk Accounts
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>
                              {glSummary.summaryStatistics.highRiskAccounts || 0}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                              Total Transactions
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>
                              {glSummary.summaryStatistics.totalTransactions || 0}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                              Anomaly Rate
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>
                              {glSummary.summaryStatistics.totalAccounts ? 
                                ((glSummary.summaryStatistics.accountsWithAnomalies / glSummary.summaryStatistics.totalAccounts) * 100).toFixed(1) : 0}%
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                              Avg Amount per Account
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>
                              {glSummary.summaryStatistics.totalAccounts ? 
                                formatCurrency(glSummary.summaryStatistics.totalTrialBalance / glSummary.summaryStatistics.totalAccounts) : 
                                formatCurrency(0)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                )}
                
                              <TableContainer component={Paper} sx={{ 
                boxShadow: 'none', 
                mb: 3,
                background: 'transparent'
              }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }}>
                        Account
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }} align="right">
                        Amount
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }} align="right">
                        Transactions
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }} align="right">
                        Risk Level
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }} align="right">
                        Anomalies
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        color: colorScheme.textPrimary,
                        border: 'none',
                        pb: 1
                      }} align="right">
                        Trial Balance
                      </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(glChartsData?.topAccountsByAmount || []).map((account, index) => (
                      <TableRow key={index} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ border: 'none', py: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ 
                                width: 32, 
                                height: 32, 
                                mr: 2, 
                              backgroundColor: colorScheme.primary,
                              fontSize: '0.75rem',
                              fontWeight: 600
                              }}>
                                {account.accountId?.slice(-2) || 'AC'}
                              </Avatar>
                              <Box>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                color: colorScheme.textPrimary,
                                fontSize: '0.875rem'
                              }}>
                                  Account {account.accountId}
                                </Typography>
                              <Typography variant="caption" sx={{ 
                                color: colorScheme.textSecondary,
                                fontSize: '0.75rem'
                              }}>
                                  {account.accountType || 'Unknown Type'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                        <TableCell align="right" sx={{ border: 'none', py: 1 }}>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600, 
                            color: colorScheme.primary,
                            fontSize: '0.875rem'
                          }}>
                              {formatCurrency(account.totalAmount)}
                            </Typography>
                          </TableCell>
                        <TableCell align="right" sx={{ border: 'none', py: 1 }}>
                          <Typography variant="body2" sx={{ 
                            color: colorScheme.textSecondary,
                            fontSize: '0.875rem'
                          }}>
                              {account.transactionCount}
                            </Typography>
                          </TableCell>
                        <TableCell align="right" sx={{ border: 'none', py: 1 }}>
                          <Chip 
                            label={account.riskLevel || 'LOW'} 
                            size="small"
                            sx={{ 
                              backgroundColor: account.riskColor || '#4BC0C0',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              px: 1,
                              py: 0.2,
                              border: '1px solid rgba(255,255,255,0.3)'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ border: 'none', py: 1 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Typography variant="body2" sx={{ 
                              color: colorScheme.textSecondary,
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              {account.anomalyCounts?.total_anomalies || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: colorScheme.textSecondary,
                              fontSize: '0.65rem'
                            }}>
                              D: {account.anomalyCounts?.duplicate || 0} | B: {account.anomalyCounts?.backdated || 0} | H: {account.anomalyCounts?.high_value || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ border: 'none', py: 1 }}>
                          <Typography variant="body2" sx={{ 
                            color: colorScheme.primary, 
                            fontWeight: 600,
                            fontSize: '0.875rem'
                          }}>
                              {formatCurrency(account.trialBalance)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
              {/* Chart component */}
              <Box sx={{ 
                width: '100%', 
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                borderRadius: 3, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: `1px solid ${colorScheme.border}`,
                p: 2
              }}>
                <Box sx={{width: '100%' }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 2, 
                    color: colorScheme.textPrimary,
                    fontSize: '1rem',
                    textAlign: 'center'
                  }}>
                    Account Distribution by Amount
                  </Typography>
                  <DepartmentExpensesChart data={{
                    labels: (glChartsData?.topAccountsByAmount || []).map(account => `Account ${account.accountId}`),
                    data: (glChartsData?.topAccountsByAmount || []).map(account => account.totalAmount || 0)
                  }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        )}

          {/* Detailed Risk Analysis */}
          {sheetData?.detailed_risk_analysis && (
            <Grid item size={{xs: 12, md: 12}}>
              <DetailedRiskAnalysis riskAnalysis={sheetData.detailed_risk_analysis} />
            </Grid>
          )}

          {/* Anomaly Analysis Accordion */}
        <Grid item size={{xs: 12, md: 12}}>
            <AnomalyAnalysisAccordion sheetId={sheetData?.sheet_id} anomalySummary={sheetData?.anomalies_data?.anomaly_summary} />
          </Grid>
        </Grid>
    </Box>
  );
} 