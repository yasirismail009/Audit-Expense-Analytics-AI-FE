import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, CircularProgress, Alert, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ModernToolbar from './components/ModernToolbar';
import ExpenseAnalysisDashboard from './components/ExpenseAnalysisDashboard';
import ListingDashboard from './components/ListingDashboard';

// Constants for data transformation
const CHART_COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB'];
const MAX_CHART_ITEMS = 8;

export default function ExpenseSheetDetails() {
  const { sheetId } = useParams();
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardView, setDashboardView] = useState('analysis'); // 'analysis' or 'listing'

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        setLoading(true);
        
        // Test if the backend is accessible
        const testUrl = `http://localhost:8000/api/file-analysis-statistics/${sheetId}`;
        
        const response = await axios.get(testUrl, {
          timeout: 10000 // 10 second timeout
        });
        
        // Transform the API response to match the expected frontend structure
        const transformedData = transformApiResponse(response.data);
        
        // Add sheet ID to the transformed data
        transformedData.sheet_id = sheetId;
        setSheetData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching sheet data:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data
        });
        
        // Provide more specific error messages
        let errorMessage = 'Failed to load expense sheet data';
        if (err.code === 'ECONNREFUSED') {
          errorMessage = 'Backend server is not running. Please start the backend server.';
        } else if (err.code === 'ENOTFOUND') {
          errorMessage = 'Cannot connect to backend server. Please check if the server is running on localhost:8000.';
        } else if (err.response?.status === 404) {
          errorMessage = 'File not found. Please check if the file ID is correct.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Backend server error. Please try again later.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else {
          errorMessage = `Failed to load expense sheet data: ${err.message}`;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (sheetId) {
      fetchSheetData();
    } else {
      setError('No sheet ID provided');
      setLoading(false);
    }
  }, [sheetId]);

  /**
   * Transform API response to match frontend expectations
   * Optimized version that extracts only essential statistics
   */
  const transformApiResponse = (apiData) => {
    try {
      if (!apiData) {
        throw new Error('No API data received');
      }
      
      // Extract essential data from the new API structure
      const { 
        file_info, 
        transaction_statistics,
        analysis_results,
        summary_metrics,
        risk_assessment_summary,
        compliance_summary,
        audit_recommendations,
        financial_impact_summary,
        processing_efficiency_metrics
      } = apiData || {};

      // Create consistent variable names
      const summaryMetrics = summary_metrics || {};
      const riskAssessmentSummary = risk_assessment_summary || {};
      const complianceSummary = compliance_summary || {};
      const auditRecommendations = audit_recommendations || {};
      const financialImpactSummary = financial_impact_summary || {};
      const processingEfficiency = processing_efficiency_metrics || {};

      // Extract key analysis results
      const overallResults = analysis_results?.overall || {};
      const riskResults = analysis_results?.risk || {};
      const generalResults = analysis_results?.general || {};
      const duplicateResults = analysis_results?.duplicate || {};
      const backdatedResults = analysis_results?.backdated || {};
      const userResults = analysis_results?.user || {};
      const unusualDaysResults = analysis_results?.unusual_days || {};
      const closingEntriesResults = analysis_results?.closing_entries || {};
      const holidayResults = analysis_results?.holiday || {};
      
      // Extract core transaction and flag data - prioritize transaction_statistics for accuracy
      const transactionSummary = transaction_statistics || overallResults?.transaction_summary || {};
      const flagSummary = overallResults?.flag_summary || {};
      const summaryDashboard = summary_metrics || {};

      // Calculate date range from transaction summary
      const dateRange = {
        startDate: transactionSummary?.date_range?.min_date || '',
        endDate: transactionSummary?.date_range?.max_date || ''
      };

      // Create optimized result object with essential data only
      const result = {
        fileInfo: {
          id: file_info?.file_id || '',
          fileName: file_info?.file_name || '',
          status: file_info?.file_status || '',
          clientName: file_info?.client_name || '',
          companyName: file_info?.company_name || '',
          fiscalYear: file_info?.fiscal_year || 0,
          currency: transactionSummary?.currency || '',
          totalRecords: file_info?.total_records || 0,
          processedRecords: file_info?.processed_records || 0
        },
        statistics: {
          // Core transaction metrics
          totalTransactions: transactionSummary?.total_transactions || 0,
          totalAmount: transactionSummary?.total_amount || 0,
          currency: transactionSummary?.currency || '',
          uniqueUsers: transactionSummary?.unique_users || 0,
          uniqueAccounts: transactionSummary?.unique_accounts || 0,
          dateRange: dateRange,
          
          // Amount statistics - calculate from available data
          avgAmount: transactionSummary?.total_transactions && transactionSummary?.total_amount ? 
            transactionSummary.total_amount / transactionSummary.total_transactions : 0,
          minAmount: transactionSummary?.amount_range?.min_amount || 0,
          maxAmount: transactionSummary?.amount_range?.max_amount || 0,
          
          // Risk and anomaly metrics
          riskScore: summaryMetrics?.overall_risk_score || riskResults?.overall_risk_score || 0,
          riskLevel: summaryMetrics?.risk_level || summaryDashboard?.risk_level || 'LOW',
          flaggedTransactions: flagSummary?.total_flagged || 0,
          flagRate: transactionSummary?.total_transactions ? 
            (flagSummary?.total_flagged / transactionSummary.total_transactions) * 100 : 0,
          
          // Anomaly counts - use transaction_statistics.anomaly_flags for accuracy
          duplicatesFound: transaction_statistics?.anomaly_flags?.duplicates || 0,
          backdatedEntries: transaction_statistics?.anomaly_flags?.backdated || 0,
          userAnomalies: transaction_statistics?.anomaly_flags?.user_anomalies || 0,
          closingEntries: transaction_statistics?.anomaly_flags?.closing_entries || 0,
          unusualDays: transaction_statistics?.anomaly_flags?.unusual_days || 0,
          holidayEntries: transaction_statistics?.anomaly_flags?.holiday_postings || 0,
          totalAnomalies: summaryMetrics?.total_anomalies || 0,
          anomalyPercentage: summaryMetrics?.anomaly_percentage || 0
        },
        glSummary: {
          summaryStatistics: {
            totalAccounts: transactionSummary?.unique_accounts || 0,
            totalTrialBalance: transactionSummary?.total_amount || 0,
            currency: transactionSummary?.currency || '',
            avgRiskScore: riskResults?.overall_risk_score || 0
          },
          accounts: Array.isArray(generalResults?.gl_account_summaries) ? 
            generalResults.gl_account_summaries.slice(0, 10).map(account => ({
              accountId: account.account || '',
              accountName: `Account ${account.account}`,
              currency: transactionSummary?.currency || '',
              trialBalance: account.total_amount || 0,
              transactionCount: account.transaction_count || 0,
              avgAmount: account.total_amount / (account.transaction_count || 1) || 0,
              riskLevel: 'LOW',
              riskColor: '#4BC0C0'
            })) : []
        },
        anomaliesStats: {
          riskDistribution: (() => {
            const riskData = flagSummary?.risk_distribution || {};
            const riskDistributionData = [
              { risk_level: 'LOW', count: riskData.low || 0 },
              { risk_level: 'MEDIUM', count: riskData.medium || 0 },
              { risk_level: 'HIGH', count: riskData.high || 0 },
              { risk_level: 'CRITICAL', count: riskData.critical || 0 }
            ];
            
            const totalAnomalies = riskDistributionData.reduce((sum, item) => sum + item.count, 0);
            
            return riskDistributionData.map(item => ({
              ...item,
              percentage: totalAnomalies > 0 ? (item.count / totalAnomalies) * 100 : 0
            }));
          })(),
                  anomalySummary: {
          duplicateEntries: transaction_statistics?.anomaly_flags?.duplicates || 0,
          backdatedEntries: transaction_statistics?.anomaly_flags?.backdated || 0,
          userAnomalies: transaction_statistics?.anomaly_flags?.user_anomalies || 0,
          closingEntries: transaction_statistics?.anomaly_flags?.closing_entries || 0,
          unusualDays: transaction_statistics?.anomaly_flags?.unusual_days || 0,
          holidayEntries: transaction_statistics?.anomaly_flags?.holiday_postings || 0,
          totalAnomalies: summaryMetrics?.total_anomalies || 0
        }
        },
        anomaliesAccordion: {
          duplicateEntries: transaction_statistics?.anomaly_flags?.duplicates || 0,
          backdatedEntries: transaction_statistics?.anomaly_flags?.backdated || 0,
          userAnomalies: transaction_statistics?.anomaly_flags?.user_anomalies || 0,
          closingEntries: transaction_statistics?.anomaly_flags?.closing_entries || 0,
          unusualDays: transaction_statistics?.anomaly_flags?.unusual_days || 0,
          holidayEntries: transaction_statistics?.anomaly_flags?.holiday_postings || 0,
          totalAnomalies: summaryMetrics?.total_anomalies || 0
        },
        chartsData: {
          riskDistribution: {
            labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
            data: [
              summaryMetrics?.risk_distribution?.low_risk || flagSummary?.risk_distribution?.low || 0,
              summaryMetrics?.risk_distribution?.medium_risk || flagSummary?.risk_distribution?.medium || 0,
              summaryMetrics?.risk_distribution?.high_risk || flagSummary?.risk_distribution?.high || 0,
              summaryMetrics?.risk_distribution?.critical_risk || flagSummary?.risk_distribution?.critical || 0
            ],
            colors: ['#4BC0C0', '#FFCE56', '#FF9F40', '#FF6384']
          },
                  anomalyBreakdown: {
          labels: ['Duplicate Entries', 'Backdated Entries', 'User Anomalies', 'Closing Entries', 'Unusual Days', 'Holiday Entries'],
          data: [
            transaction_statistics?.anomaly_flags?.duplicates || 0,
            transaction_statistics?.anomaly_flags?.backdated || 0,
            transaction_statistics?.anomaly_flags?.user_anomalies || 0,
            transaction_statistics?.anomaly_flags?.closing_entries || 0,
            transaction_statistics?.anomaly_flags?.unusual_days || 0,
            transaction_statistics?.anomaly_flags?.holiday_postings || 0
          ],
          colors: ['#FF6384', '#36A2EB', '#4BC0C0', '#FFCE56', '#9966FF', '#FF9F40']
        },
          topUsersByAmount: Array.isArray(generalResults?.user_summaries) ? 
            generalResults.user_summaries.slice(0, 10).map(user => ({
              userName: user.user || 'Unknown User',
              totalAmount: user.total_amount || 0,
              transactionCount: user.transaction_count || 0,
              avgAmount: user.total_amount / (user.transaction_count || 1) || 0
            })) : [],
          topAccountsByTransactions: Array.isArray(generalResults?.gl_account_summaries) ? 
            generalResults.gl_account_summaries.slice(0, 10).map(account => ({
              glAccount: account.account || '',
              transactionCount: account.transaction_count || 0,
              totalAmount: account.total_amount || 0,
              avgAmount: account.total_amount / (account.transaction_count || 1) || 0
            })) : []
        },
        analysisSessionsSummary: {
          totalSessions: 1,
          latestSession: {
            id: overallResults?.analysis_id || file_info?.file_id || '',
            sessionName: 'Latest Analysis',
            status: 'COMPLETED',
            createdAt: overallResults?.analysis_date || file_info?.processed_at || ''
          }
        },
        sheet_name: file_info?.file_name || '',
        sheet_date: file_info?.uploaded_at || '',
        display_name: file_info?.file_name || '',
        total_expenses: transactionSummary?.total_transactions || 0,
        total_amount: transactionSummary?.total_amount || 0,
        analysis_summary: {
          overall_fraud_score: summaryMetrics?.overall_risk_score || riskResults?.overall_risk_score || 0,
          risk_level: summaryMetrics?.risk_level || summaryDashboard?.risk_level || 'LOW',
          total_flagged_expenses: flagSummary?.total_flagged || 0,
          flag_rate: transactionSummary?.total_transactions ? 
            (flagSummary?.total_flagged / transactionSummary.total_transactions) * 100 : 0,
          user_anomalies: transaction_statistics?.anomaly_flags?.user_anomalies || 0,
          total_alerts: summaryMetrics?.total_anomalies || 0,
          anomaly_percentage: summaryMetrics?.anomaly_percentage || 0
        }
      };

      return result;
    } catch (error) {
      console.error('Error in transformApiResponse:', error);
      throw new Error(`Data transformation failed: ${error.message}`);
    }
  };

  // Helper function to transform flagged expenses from new data structure
  const transformFlaggedExpensesFromNewData = (riskAssessment, transactionSummary) => {
    // Create flagged expenses based on actual risk data from new structure
    const flaggedExpenses = [];
    let id = 1;

    // Since we don't have individual transaction details in the new structure,
    // we'll create sample flagged expenses based on the summary data
    const avgAmount = transactionSummary?.total_transactions && transactionSummary?.total_amount ? 
      transactionSummary.total_amount / transactionSummary.total_transactions : 0;
    const currency = transactionSummary?.currency || '';
    const totalFlagged = riskAssessment?.flagged_transactions_count || 0;

    // Create sample flagged expenses based on the summary data
    for (let i = 0; i < Math.min(totalFlagged, 10); i++) {
      flaggedExpenses.push({
        id: id++,
        amount: avgAmount * (0.5 + Math.random() * 1.5), // Random amount around average
        currency: currency,
        description: `Flagged Transaction ${i + 1}`,
        date: new Date().toISOString().split('T')[0],
        category: 'Other',
        riskLevel: 'HIGH',
        riskScore: Math.floor(Math.random() * 100),
        flagReason: 'Anomaly detected',
        user: 'Unknown User',
        account: 'Unknown Account'
      });
    }

    return flaggedExpenses;
  };

  // Helper function to transform flagged expenses from risk data (legacy)
  const transformFlaggedExpensesFromRiskData = (riskData, generalStats) => {
    // Create flagged expenses based on actual risk data
    const flaggedExpenses = [];
    let id = 1;

    const duplicatePatterns = riskData?.risk_stats?.duplicates_found || 0;
    const anomaliesDetected = riskData?.risk_stats?.anomalies_detected || 0;
    const avgAmount = generalStats?.average_amount || 0;
    const riskFactors = riskData?.risk_factors || {};

    // Add duplicate expenses based on the risk data
    for (let i = 0; i < Math.min(duplicatePatterns, 5); i++) {
      flaggedExpenses.push({
        id: id++,
        amount: avgAmount * (0.8 + Math.random() * 0.4),
        currency: 'SAR',
        description: `Duplicate Transaction ${i + 1}`,
        date: new Date().toISOString().split('T')[0],
        category: 'Duplicate',
        riskLevel: 'HIGH',
        riskScore: 85 + Math.floor(Math.random() * 15),
        flagReason: 'Duplicate transaction detected',
        user: 'Unknown User',
        account: 'Unknown Account'
      });
    }

    // Add anomaly expenses based on the risk data
    for (let i = 0; i < Math.min(anomaliesDetected, 5); i++) {
      flaggedExpenses.push({
        id: id++,
        amount: avgAmount * (1.2 + Math.random() * 0.8),
        currency: 'SAR',
        description: `Anomaly Transaction ${i + 1}`,
        date: new Date().toISOString().split('T')[0],
        category: 'Anomaly',
        riskLevel: 'MEDIUM',
        riskScore: 60 + Math.floor(Math.random() * 25),
        flagReason: 'Unusual pattern detected',
        user: 'Unknown User',
        account: 'Unknown Account'
      });
    }

    return flaggedExpenses;
  };

  // Helper function to generate account type distribution
  const generateAccountTypeDistribution = (accounts) => {
    const distribution = {};
    
    accounts.forEach(account => {
      const accountId = account.account || '';
      const type = accountId.startsWith('1') ? 'Assets' :
                   accountId.startsWith('2') ? 'Liabilities' :
                   accountId.startsWith('3') ? 'Equity' :
                   accountId.startsWith('4') ? 'Revenue' :
                   accountId.startsWith('5') ? 'Expenses' : 'Other';
      
      if (!distribution[type]) {
        distribution[type] = { count: 0, totalAmount: 0 };
      }
      
      distribution[type].count++;
      distribution[type].totalAmount += account.total_amount || 0;
    });
    
    return Object.entries(distribution).map(([type, data]) => ({
      type,
      count: data.count,
      totalAmount: data.totalAmount
    }));
  };

  // Helper function to generate balance distribution
  const generateBalanceDistribution = (accounts) => {
    const ranges = [
      { label: '0-1M', min: 0, max: 1000000, count: 0 },
      { label: '1M-10M', min: 1000000, max: 10000000, count: 0 },
      { label: '10M-50M', min: 10000000, max: 50000000, count: 0 },
      { label: '50M+', min: 50000000, max: Infinity, count: 0 }
    ];
    
    accounts.forEach(account => {
      const amount = account.total_amount || 0;
      const range = ranges.find(r => amount >= r.min && amount < r.max);
      if (range) range.count++;
    });
    
    return ranges.map(range => ({
      label: range.label,
      count: range.count
    }));
  };

  // Helper function to calculate date range days
  const calculateDateRangeDays = (dateRange) => {
    if (!dateRange?.startDate || !dateRange?.endDate) return 0;
    
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper function to generate monthly trend data
  const generateMonthlyTrendData = (dateRange) => {
    if (!dateRange?.startDate || !dateRange?.endDate) return [];
    
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const months = [];
    
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    
    while (current <= end) {
      months.push({
        month: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        transactionCount: Math.floor(Math.random() * 100) + 50,
        totalAmount: Math.floor(Math.random() * 1000000) + 500000,
        avgAmount: Math.floor(Math.random() * 10000) + 5000
      });
      
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading expense sheet data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Data
          </Typography>
          <Typography variant="body1">
            {error}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!sheetData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="warning" sx={{ maxWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            No Data Available
          </Typography>
          <Typography variant="body1">
            No expense sheet data was found for the specified ID.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <ModernToolbar />
      
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5' }}>
          {/* Dashboard View Toggle */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              value={dashboardView}
              exclusive
              onChange={(event, newView) => {
                if (newView !== null) {
                  setDashboardView(newView);
                }
              }}
              aria-label="dashboard view"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: '#1976d2',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#1565c0',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="analysis" aria-label="analysis view">
                Analysis Dashboard
              </ToggleButton>
              <ToggleButton value="listing" aria-label="listing view">
                Data Listing
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Dashboard Content */}
          {dashboardView === 'analysis' ? (
            <ExpenseAnalysisDashboard 
              sheetData={sheetData}
              sheetId={sheetId}
            />
          ) : (
            <ListingDashboard 
              sheetData={sheetData}
              sheetId={sheetId}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}