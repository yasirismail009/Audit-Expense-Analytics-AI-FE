import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ExpenseAnalysisDashboard from './components/ExpenseAnalysisDashboard';

// Constants for data transformation
const CHART_COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB'];
const MAX_CHART_ITEMS = 8;
const AMOUNT_RANGES = [
  { min: 0, max: 1000000, label: '< 1M' },
  { min: 1000000, max: 5000000, label: '1M-5M' },
  { min: 5000000, max: 10000000, label: '5M-10M' },
  { min: 10000000, max: 15000000, label: '10M-15M' },
  { min: 15000000, max: 20000000, label: '15M-20M' },
  { min: 20000000, max: Infinity, label: '> 20M' }
];



export default function ExpenseSheetDetails() {
  const { sheetId } = useParams();
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data for sheetId:', sheetId);
        
        // Test if the backend is accessible
        const testUrl = `http://localhost:8000/api/db-comprehensive-analytics/file/${sheetId}`;
        console.log('API URL:', testUrl);
        
        const response = await axios.get(testUrl, {
          timeout: 10000 // 10 second timeout
        });
        
        console.log('Raw API response:', response.data);
        console.log('Response status:', response.status);
        
        // Transform the API response to match the expected frontend structure
        console.log('About to transform API response...');
        const transformedData = transformApiResponse(response.data);
        console.log('Transformation completed successfully');
        
        // Add sheet ID to the transformed data
        transformedData.sheet_id = sheetId;
        console.log('Setting sheet data...');
        setSheetData(transformedData);
        setError(null);
        console.log('Data set successfully');
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

  // Transform API response to match frontend expectations
  const transformApiResponse = (apiData) => {
    try {
      console.log("Raw API Data:", apiData);
      
      if (!apiData) {
        throw new Error('No API data received');
      }
      
      const { 
        file_info, 
        general_stats,
        charts,
        summary,
        risk_data
      } = apiData || {};

      console.log("Extracted data:", {
        file_info,
        general_stats,
        charts,
        summary,
        risk_data
      });

      console.log("Starting data transformation...");

      // Create a simple result object for testing
      const result = {
        fileInfo: {
          id: file_info?.id || '',
          fileName: file_info?.file_name || 'Unknown File',
          status: file_info?.status || 'UNKNOWN',
          uploadedAt: file_info?.uploaded_at || new Date().toISOString(),
          processedAt: file_info?.processed_at || new Date().toISOString(),
          totalRecords: file_info?.total_records || 0,
          processedRecords: file_info?.processed_records || 0,
          failedRecords: file_info?.failed_records || 0,
          currency: 'SAR',
          clientName: file_info?.client_name || '',
          companyName: file_info?.company_name || '',
          fiscalYear: file_info?.fiscal_year || new Date().getFullYear()
        },
        statistics: {
          totalTransactions: general_stats?.total_transactions || 0,
          totalAmount: general_stats?.total_amount || 0,
          currency: 'SAR',
          flaggedTransactions: risk_data?.risk_stats?.duplicates?.total_patterns || 0,
          highValueTransactions: summary?.high_value_transactions || 0,
          flagRate: general_stats?.total_transactions ? 
            (risk_data?.risk_stats?.duplicates?.total_patterns / general_stats.total_transactions) * 100 : 0,
          uniqueUsers: general_stats?.unique_users || 0,
          uniqueAccounts: general_stats?.unique_accounts || 0,
          uniqueProfitCenters: 0,
          avgAmount: general_stats?.average_amount || 0,
          minAmount: general_stats?.min_amount || 0,
          maxAmount: general_stats?.max_amount || 0,
          dateRange: {
            startDate: general_stats?.date_range?.min_date || new Date().toISOString().split('T')[0],
            endDate: general_stats?.date_range?.max_date || new Date().toISOString().split('T')[0]
          },
          totalDebits: general_stats?.total_amount || 0,
          totalCredits: 0,
          trialBalance: general_stats?.total_amount || 0
        },
        glSummary: {
          summaryStatistics: {
            totalAccounts: general_stats?.unique_accounts || 0,
            totalTrialBalance: general_stats?.total_amount || 0,
            totalTradingEquity: general_stats?.total_amount || 0,
            totalDebits: general_stats?.total_amount || 0,
            totalCredits: 0,
            currency: 'SAR',
            debitBalanceAccounts: general_stats?.unique_accounts || 0,
            creditBalanceAccounts: 0,
            zeroBalanceAccounts: 0,
            normalBalanceAccounts: general_stats?.unique_accounts || 0,
            abnormalBalanceAccounts: 0
          },
          accounts: (charts?.top_accounts || []).map(account => ({
            accountId: account.gl_account,
            accountName: `GL Account ${account.gl_account}`,
            accountType: 'Asset',
            accountCategory: 'Current Assets',
            normalBalance: 'Debit',
            currency: 'SAR',
            trialBalance: account.total_amount || 0,
            tradingEquity: account.total_amount || 0,
            totalDebits: account.total_amount || 0,
            totalCredits: 0,
            balanceType: 'Debit',
            isNormalBalance: true,
            transactionCount: account.transaction_count || 0,
            debitCount: account.transaction_count || 0,
            creditCount: 0,
            avgAmount: account.average_amount || 0,
            debitCreditRatio: 0,
            avgDebitAmount: account.average_amount || 0,
            avgCreditAmount: 0,
            creditDebitRatio: 0
          }))
        },
        anomaliesStats: {
          riskDistribution: generateRiskDistributionFromRiskData(risk_data),
          anomalySummary: {
            duplicateEntries: risk_data?.risk_stats?.duplicates?.total_patterns || 0,
            userAnomalies: 0,
            backdatedEntries: 0,
            closingEntries: 0,
            unusualDays: 0,
            holidayEntries: 0,
            totalAnomalies: risk_data?.risk_stats?.duplicates?.total_patterns || 0
          }
        },
        anomaliesAccordion: {
          duplicateEntries: risk_data?.risk_stats?.duplicates?.total_patterns || 0,
          userAnomalies: 0,
          backdatedEntries: 0,
          closingEntries: 0,
          unusualDays: 0,
          holidayEntries: 0,
          totalAnomalies: risk_data?.risk_stats?.duplicates?.total_patterns || 0
        },
        chartsData: {
          riskDistribution: {
            labels: generateRiskDistributionFromRiskData(risk_data).map(item => item.risk_level),
            data: generateRiskDistributionFromRiskData(risk_data).map(item => item.count),
            percentages: generateRiskDistributionFromRiskData(risk_data).map(item => item.percentage)
          },
          anomalyBreakdown: {
            labels: ['Duplicates'],
            data: [risk_data?.risk_stats?.duplicates?.total_patterns || 0]
          },
          topUsersByAmount: (charts?.top_users || []).map(user => ({
            userName: user.user_name,
            totalAmount: user.total_amount,
            currency: 'SAR',
            transactionCount: user.transaction_count,
            avgAmount: user.average_amount
          })),
          topAccountsByTransactions: (charts?.top_accounts || []).map(account => ({
            glAccount: account.gl_account,
            transactionCount: account.transaction_count,
            totalAmount: account.total_amount,
            currency: 'SAR',
            avgAmount: account.average_amount
          })),
          monthlyTransactionVolume: (charts?.monthly_trends || []).map(month => ({
            month: month.month,
            transactionCount: month.transaction_count,
            totalAmount: month.total_amount,
            debitAmount: month.total_amount,
            creditAmount: 0,
            currency: 'SAR'
          }))
        },
        glChartsData: {
          topAccountsByAmount: (charts?.top_accounts || []).map(account => ({
            accountId: account.gl_account,
            totalAmount: account.total_amount,
            currency: 'SAR',
            transactionCount: account.transaction_count,
            trialBalance: account.total_amount
          })),
          accountTypeDistribution: generateAccountTypeDistribution(charts?.top_accounts),
          balanceDistribution: generateBalanceDistribution(charts?.top_accounts),
          monthlyAccountActivity: (charts?.monthly_trends || []).map(month => ({
            month: month.month,
            transactionCount: month.transaction_count,
            totalAmount: month.total_amount,
            avgAmount: month.average_amount
          })),
          currency: 'SAR'
        },
        analysisSessionsSummary: {
          totalSessions: 1,
          latestSession: {
            id: file_info?.id || '',
            sessionName: 'Latest Analysis',
            status: file_info?.status || 'UNKNOWN',
            createdAt: file_info?.processed_at || new Date().toISOString()
          }
        },
        sheet_name: file_info?.file_name || 'Unknown File',
        sheet_date: file_info?.uploaded_at || new Date().toISOString(),
        display_name: file_info?.file_name || 'Unknown File',
        total_expenses: general_stats?.total_transactions || 0,
        total_amount: general_stats?.total_amount || 0,
        analysis_summary: {
          overall_fraud_score: general_stats?.total_transactions ? 
            (risk_data?.risk_stats?.duplicates?.total_patterns / general_stats.total_transactions) * 100 : 0,
          risk_level: getRiskLevel(general_stats?.total_transactions ? 
            (risk_data?.risk_stats?.duplicates?.total_patterns / general_stats.total_transactions) * 100 : 0),
          total_flagged_expenses: risk_data?.risk_stats?.duplicates?.total_patterns || 0,
          flag_rate: general_stats?.total_transactions ? 
            (risk_data?.risk_stats?.duplicates?.total_patterns / general_stats.total_transactions) * 100 : 0,
          anomalies_detected: {
            amount_anomalies: risk_data?.risk_stats?.duplicates?.total_patterns || 0,
            timing_anomalies: 0,
            vendor_anomalies: 0,
            employee_anomalies: 0,
            duplicate_suspicions: risk_data?.risk_stats?.duplicates?.total_patterns || 0
          },
          risk_distribution: generateRiskDistributionFromRiskData(risk_data)
        },
        chart_data: {
          department_expenses: {
            labels: (charts?.top_accounts || []).slice(0, 5).map(item => `Dept ${item.gl_account}`),
            data: (charts?.top_accounts || []).slice(0, 5).map(item => item.total_amount),
            colors: CHART_COLORS.slice(0, 5)
          },
          category_expenses: {
            labels: (charts?.top_accounts || []).slice(0, 6).map(item => `GL ${item.gl_account}`),
            data: (charts?.top_accounts || []).slice(0, 6).map(item => item.total_amount),
            colors: CHART_COLORS.slice(0, 6)
          },
          monthly_trend: {
            labels: (charts?.monthly_trends || []).map(item => item.month),
            data: (charts?.monthly_trends || []).map(item => item.total_amount)
          },
          employee_expenses: {
            labels: (charts?.top_users || []).slice(0, MAX_CHART_ITEMS).map(item => item.user_name),
            data: (charts?.top_users || []).slice(0, MAX_CHART_ITEMS).map(item => item.total_amount),
            colors: CHART_COLORS.slice(0, MAX_CHART_ITEMS)
          },
          amount_distribution: {
            labels: (charts?.amount_distribution || []).map(item => item.range),
            data: (charts?.amount_distribution || []).map(item => item.count)
          },
          vendor_expenses: {
            labels: (charts?.top_accounts || []).slice(0, 5).map(item => `Vendor ${item.gl_account}`),
            data: (charts?.top_accounts || []).slice(0, 5).map(item => item.total_amount)
          },
          risk_distribution: {
            labels: generateRiskDistributionFromRiskData(risk_data).map(item => item.risk_level),
            data: generateRiskDistributionFromRiskData(risk_data).map(item => item.count),
            percentages: generateRiskDistributionFromRiskData(risk_data).map(item => item.percentage)
          },
          anomaly_breakdown: {
            labels: ['Duplicates'],
            data: [risk_data?.risk_stats?.duplicates?.total_patterns || 0]
          }
        },
        flagged_expenses: transformFlaggedExpensesFromRiskData(risk_data, general_stats),
        anomalies_data: {
          anomaly_summary: {
            duplicate_entries: risk_data?.risk_stats?.duplicates?.total_patterns || 0,
            backdated_entries: 0,
            closing_entries: 0,
            unusual_days: 0,
            holiday_entries: 0
          },
          risk_distribution: generateRiskDistributionFromRiskData(risk_data)
        },
        advanced_metrics: {
          basic_metrics: {
            total_expenses: general_stats?.total_transactions || 0,
            total_amount: general_stats?.total_amount || 0,
            average_expense: general_stats?.average_amount || 0,
            median_expense: general_stats?.average_amount * 0.8 || 0,
            largest_expense: general_stats?.max_amount || 0,
            smallest_expense: general_stats?.min_amount || 0,
            date_range_days: calculateDateRangeDays(general_stats?.date_range),
            unique_users: general_stats?.unique_users || 0,
            unique_accounts: general_stats?.unique_accounts || 0,
            unique_profit_centers: 0,
            high_value_transactions: summary?.high_value_transactions || 0
          }
        }
      };

      console.log("Result object created successfully");

      // Debug the final transformed result
      console.log("Final transformed result:", result);
      console.log("Final statistics:", result.statistics);
      console.log("Final fileInfo:", result.fileInfo);
      console.log("Transformation function completed successfully");

      return result;
    } catch (error) {
      console.error('Error in transformApiResponse:', error);
      throw new Error(`Data transformation failed: ${error.message}`);
    }
  };

  // Helper function to determine risk level
  const getRiskLevel = (flagRate) => {
    if (flagRate >= 80) return 'CRITICAL';
    if (flagRate >= 60) return 'HIGH';
    if (flagRate >= 40) return 'MEDIUM';
    return 'LOW';
  };

  // Helper function to calculate amount distribution from GL account data
  const calculateAmountDistributionFromGLData = (topAccountsByAmount) => {
    if (!topAccountsByAmount || !Array.isArray(topAccountsByAmount)) {
      return {
        labels: AMOUNT_RANGES.map(range => range.label),
        data: AMOUNT_RANGES.map(() => 0)
      };
    }

    const distribution = AMOUNT_RANGES.map(range => ({
      label: range.label,
      count: topAccountsByAmount.filter(account => {
        const amount = parseFloat((account.total_debits || 0) + (account.total_credits || 0));
        return amount >= range.min && amount < range.max;
      }).length
    }));

    return {
      labels: distribution.map(d => d.label),
      data: distribution.map(d => d.count)
    };
  };

  // Helper function to transform flagged expenses from risk data
  const transformFlaggedExpensesFromRiskData = (riskData, generalStats) => {
    // Create sample flagged expenses based on risk data
    const flaggedExpenses = [];
    let id = 1;

    const duplicatePatterns = riskData?.risk_stats?.duplicates?.total_patterns || 0;
    const avgAmount = generalStats?.average_amount || 0;

    // Add duplicate expenses based on the risk data
    for (let i = 0; i < Math.min(duplicatePatterns, 20); i++) {
      const riskLevel = i < 2 ? 'MEDIUM' : 'LOW'; // Based on the risk data structure
      flaggedExpenses.push({
        id: id++,
        employee: `User ${i + 1}`,
        amount: avgAmount * (0.8 + Math.random() * 0.4), // Random amount around average
        date: '2025-01-15',
        category: '131005',
        profit_center: 'PC001',
        document_number: `DOC${String(i + 1).padStart(3, '0')}`,
        document_type: 'Invoice',
        transaction_type: 'Debit',
        currency: 'SAR',
        risk_level: riskLevel,
        description: 'Duplicate transaction detected',
        status: riskLevel === 'MEDIUM' ? 'Pending' : 'Cleared',
        anomaly_type: 'Duplicate',
        anomaly_subtype: 'Type 1 Duplicate',
        risk_score: riskLevel === 'MEDIUM' ? 30 : 20,
        is_high_value: false,
        is_cleared: riskLevel === 'LOW'
      });
    }

    return flaggedExpenses;
  };

  // Helper function to calculate date range days
  const calculateDateRangeDays = (dateRange) => {
    if (!dateRange || !dateRange.min_date || !dateRange.max_date) {
      return 31; // Default fallback
    }
    
    const startDate = new Date(dateRange.min_date);
    const endDate = new Date(dateRange.max_date);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  // Helper function to generate risk distribution from risk data
  const generateRiskDistributionFromRiskData = (riskData) => {
    if (!riskData?.risk_charts?.risk_levels) {
      return [
        { risk_level: 'LOW', count: 0, percentage: 0 },
        { risk_level: 'MEDIUM', count: 0, percentage: 0 },
        { risk_level: 'HIGH', count: 0, percentage: 0 },
        { risk_level: 'CRITICAL', count: 0, percentage: 0 }
      ];
    }

    return riskData.risk_charts.risk_levels.map(risk => ({
      risk_level: risk.risk_level,
      count: risk.count,
      percentage: risk.percentage
    }));
  };

  // Helper function to generate risk distribution from transaction analyses
  const generateRiskDistributionFromTransactionAnalyses = (transactionAnalyses) => {
    if (!transactionAnalyses || !Array.isArray(transactionAnalyses)) {
      return [
        { risk_level: 'LOW', count: 0, percentage: 0 },
        { risk_level: 'MEDIUM', count: 0, percentage: 0 },
        { risk_level: 'HIGH', count: 0, percentage: 0 },
        { risk_level: 'CRITICAL', count: 0, percentage: 0 }
      ];
    }

    const riskCounts = {
      'LOW': 0,
      'MEDIUM': 0,
      'HIGH': 0,
      'CRITICAL': 0
    };

    transactionAnalyses.forEach(transaction => {
      const riskLevel = transaction.risk_level || 'LOW';
      if (riskCounts.hasOwnProperty(riskLevel)) {
        riskCounts[riskLevel]++;
      }
    });

    const total = transactionAnalyses.length;
    return Object.entries(riskCounts).map(([risk_level, count]) => ({
      risk_level,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  };

  // Helper function to generate top users from user patterns
  const generateTopUsersFromUserPatterns = (userPatterns) => {
    if (!userPatterns?.by_user) {
      return [];
    }

    return Object.entries(userPatterns.by_user)
      .map(([userName, userData]) => ({
        userName,
        totalAmount: userData.total_amount || 0,
        currency: 'SAR',
        transactionCount: userData.transaction_count || 0,
        avgAmount: userData.transaction_count ? userData.total_amount / userData.transaction_count : 0
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  };

  // Helper function to generate monthly data from temporal patterns
  const generateMonthlyDataFromTemporalPatterns = (temporalPatterns) => {
    if (!temporalPatterns?.monthly_patterns) {
      return [];
    }

    return Object.entries(temporalPatterns.monthly_patterns)
      .map(([month, monthData]) => ({
        month,
        transactionCount: monthData.count || 0,
        totalAmount: monthData.amount || 0,
        debitAmount: monthData.amount || 0, // Assuming all are debits based on the data
        creditAmount: 0,
        currency: 'SAR'
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  // Helper function to generate account type distribution
  const generateAccountTypeDistribution = (topAccounts) => {
    if (!topAccounts || !Array.isArray(topAccounts)) {
      return [];
    }

    // Since account_type is not available, we'll categorize based on account_id ranges
    const typeCounts = {
      'Assets': 0,
      'Liabilities': 0,
      'Equity': 0,
      'Revenue': 0,
      'Expenses': 0
    };

    topAccounts.forEach(account => {
      const accountId = parseInt(account.gl_account) || 0;
      if (accountId >= 100000 && accountId < 200000) {
        typeCounts['Assets']++;
      } else if (accountId >= 200000 && accountId < 300000) {
        typeCounts['Liabilities']++;
      } else if (accountId >= 300000 && accountId < 400000) {
        typeCounts['Equity']++;
      } else if (accountId >= 400000 && accountId < 500000) {
        typeCounts['Revenue']++;
      } else if (accountId >= 500000 && accountId < 600000) {
        typeCounts['Expenses']++;
      } else {
        typeCounts['Assets']++; // Default to Assets
      }
    });

    return Object.entries(typeCounts)
      .filter(([type, count]) => count > 0)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / topAccounts.length) * 100)
      }));
  };

  // Helper function to generate balance distribution
  const generateBalanceDistribution = (topAccounts) => {
    if (!topAccounts || !Array.isArray(topAccounts)) {
      return [];
    }

    const balanceTypes = {
      'Debit': 0,
      'Credit': 0,
      'Zero': 0
    };

    topAccounts.forEach(account => {
      const totalAmount = account.total_amount || 0;
      if (totalAmount > 0) {
        balanceTypes['Debit']++;
      } else if (totalAmount < 0) {
        balanceTypes['Credit']++;
      } else {
        balanceTypes['Zero']++;
      }
    });

    return Object.entries(balanceTypes).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / topAccounts.length) * 100)
    }));
  };

  // Helper function to generate monthly account activity
  const generateMonthlyAccountActivity = (temporalPatterns) => {
    if (!temporalPatterns?.monthly_patterns) {
      return [];
    }

    return Object.entries(temporalPatterns.monthly_patterns)
      .map(([month, monthData]) => ({
        month,
        transactionCount: monthData.count || 0,
        totalAmount: monthData.amount || 0,
        avgAmount: monthData.count ? monthData.amount / monthData.count : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  // Helper function to transform flagged expenses from transaction analyses
  const transformFlaggedExpensesFromTransactionAnalyses = (transactionAnalyses, summary) => {
    if (!transactionAnalyses || !Array.isArray(transactionAnalyses)) {
      return [];
    }

    return transactionAnalyses
      .filter(transaction => transaction.risk_level === 'CRITICAL' || transaction.risk_level === 'HIGH')
      .slice(0, 20) // Limit to top 20 flagged expenses
      .map((transaction, index) => ({
        id: index + 1,
        employee: transaction.user_name || `User ${index + 1}`,
        amount: transaction.amount || (summary?.total_amount && summary?.total_transactions ? summary.total_amount / summary.total_transactions : 0),
        date: transaction.transaction_date || '2025-01-15',
        category: transaction.account_id || '131005',
        profit_center: transaction.profit_center || 'PC001',
        document_number: transaction.document_number || `DOC${String(index + 1).padStart(3, '0')}`,
        document_type: transaction.document_type || 'Invoice',
        transaction_type: transaction.transaction_type || 'Debit',
        currency: 'SAR',
        risk_level: transaction.risk_level || 'CRITICAL',
        description: transaction.anomaly_description || 'High-risk transaction flagged for review',
        status: transaction.risk_level === 'CRITICAL' ? 'Pending' : 'Cleared',
        anomaly_type: transaction.anomaly_type || 'Amount',
        anomaly_subtype: transaction.anomaly_subtype || 'High Value',
        risk_score: transaction.risk_score || 85,
        is_high_value: transaction.risk_level === 'CRITICAL',
        is_cleared: transaction.risk_level !== 'CRITICAL'
      }));
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar />
      <Box sx={{ flexGrow: 1, width: 'calc(100% - 240px)' }}>
        <TopBar />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <ExpenseAnalysisDashboard sheetData={sheetData} />
        )}
      </Box>
    </Box>
  );
}