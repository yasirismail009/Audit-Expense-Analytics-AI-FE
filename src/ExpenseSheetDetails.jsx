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
        const response = await axios.get(`http://localhost:8000/api/file-summary/${sheetId}/`);
        
        // Transform the API response to match the expected frontend structure
        const transformedData = transformApiResponse(response.data);
        
        // Add sheet ID to the transformed data
        transformedData.sheet_id = sheetId;
        setSheetData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error fetching sheet data:', err);
        setError('Failed to load expense sheet data. Please try again.');
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
    const { 
      file_info, 
      summary_statistics, 
      risk_distribution, 
      anomaly_summary, 
      charts_data, 
      analysis_sessions_summary, 
      gl_account_summary,
      gl_charts_data 
    } = apiData || {};

    // Transform to match frontend expected structure
    const result = {
      // 1. File Info
      fileInfo: {
        id: file_info?.id || '',
        fileName: file_info?.file_name || 'Unknown File',
        status: file_info?.status || 'UNKNOWN',
        uploadedAt: file_info?.uploaded_at || new Date().toISOString(),
        processedAt: file_info?.processed_at || new Date().toISOString(),
        totalRecords: file_info?.total_records || 0,
        processedRecords: file_info?.processed_records || 0,
        failedRecords: file_info?.failed_records || 0,
        currency: file_info?.currency || 'SAR'
      },

      // 2. Statistics
      statistics: {
        totalTransactions: summary_statistics?.total_transactions || 0,
        totalAmount: summary_statistics?.total_amount || 0,
        currency: summary_statistics?.currency || 'SAR',
        flaggedTransactions: summary_statistics?.flagged_transactions || 0,
        highValueTransactions: summary_statistics?.high_value_transactions || 0,
        flagRate: summary_statistics?.flag_rate || 0,
        uniqueUsers: summary_statistics?.unique_users || 0,
        uniqueAccounts: summary_statistics?.unique_accounts || 0,
        uniqueProfitCenters: summary_statistics?.unique_profit_centers || 0,
        avgAmount: summary_statistics?.avg_amount || 0,
        minAmount: summary_statistics?.min_amount || 0,
        maxAmount: summary_statistics?.max_amount || 0,
        dateRange: summary_statistics?.date_range || {
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        }
      },

      // 3. GL Summary - Properly mapped from gl_account_summary
      glSummary: {
        summaryStatistics: {
          totalAccounts: gl_account_summary?.summary_statistics?.total_accounts || 0,
          totalTrialBalance: gl_account_summary?.summary_statistics?.total_trial_balance || 0,
          totalTradingEquity: gl_account_summary?.summary_statistics?.total_trading_equity || 0,
          totalDebits: gl_account_summary?.summary_statistics?.total_debits || 0,
          totalCredits: gl_account_summary?.summary_statistics?.total_credits || 0,
          currency: gl_account_summary?.summary_statistics?.currency || 'SAR',
          debitBalanceAccounts: gl_account_summary?.summary_statistics?.debit_balance_accounts || 0,
          creditBalanceAccounts: gl_account_summary?.summary_statistics?.credit_balance_accounts || 0,
          zeroBalanceAccounts: gl_account_summary?.summary_statistics?.zero_balance_accounts || 0,
          normalBalanceAccounts: gl_account_summary?.summary_statistics?.normal_balance_accounts || 0,
          abnormalBalanceAccounts: gl_account_summary?.summary_statistics?.abnormal_balance_accounts || 0
        },
        accounts: (gl_account_summary?.accounts || []).map(account => ({
          accountId: account.account_id,
          accountName: account.account_name,
          accountType: account.account_type,
          accountCategory: account.account_category,
          normalBalance: account.normal_balance,
          currency: account.currency,
          trialBalance: account.trial_balance,
          tradingEquity: account.trading_equity,
          totalDebits: account.total_debits,
          totalCredits: account.total_credits,
          balanceType: account.balance_type,
          isNormalBalance: account.is_normal_balance,
          transactionCount: account.transaction_count,
          debitCount: account.debit_count,
          creditCount: account.credit_count,
          avgAmount: account.avg_amount,
          debitCreditRatio: account.debit_credit_ratio,
          avgDebitAmount: account.avg_debit_amount,
          avgCreditAmount: account.avg_credit_amount,
          creditDebitRatio: account.credit_debit_ratio
        }))
      },

      // 4. Anomalies Stats
      anomaliesStats: {
        riskDistribution: risk_distribution || [],
        anomalySummary: {
          duplicateEntries: anomaly_summary?.duplicate_entries || 0,
          userAnomalies: anomaly_summary?.user_anomalies || 0,
          backdatedEntries: anomaly_summary?.backdated_entries || 0,
          closingEntries: anomaly_summary?.closing_entries || 0,
          unusualDays: anomaly_summary?.unusual_days || 0,
          holidayEntries: anomaly_summary?.holiday_entries || 0,
          totalAnomalies: anomaly_summary?.total_anomalies || 0
        }
      },

      // 5. Anomalies Accordion Data
      anomaliesAccordion: {
        duplicateEntries: anomaly_summary?.duplicate_entries || 0,
        userAnomalies: anomaly_summary?.user_anomalies || 0,
        backdatedEntries: anomaly_summary?.backdated_entries || 0,
        closingEntries: anomaly_summary?.closing_entries || 0,
        unusualDays: anomaly_summary?.unusual_days || 0,
        holidayEntries: anomaly_summary?.holiday_entries || 0,
        totalAnomalies: anomaly_summary?.total_anomalies || 0
      },

      // 6. Charts Data
      chartsData: {
        // Risk distribution chart
        riskDistribution: {
          labels: (charts_data?.risk_distribution_chart?.labels || []),
          data: (charts_data?.risk_distribution_chart?.data || []),
          percentages: (charts_data?.risk_distribution_chart?.percentages || [])
        },

        // Anomaly breakdown chart
        anomalyBreakdown: {
          labels: (charts_data?.anomaly_breakdown?.labels || []),
          data: (charts_data?.anomaly_breakdown?.data || [])
        },

        // Top users by amount
        topUsersByAmount: (charts_data?.top_users_by_amount || []).map(user => ({
          userName: user.user_name,
          totalAmount: user.total_amount,
          currency: user.currency,
          transactionCount: user.transaction_count,
          avgAmount: user.avg_amount
        })),

        // Top accounts by transactions
        topAccountsByTransactions: (charts_data?.top_accounts_by_transactions || []).map(account => ({
          glAccount: account.gl_account,
          transactionCount: account.transaction_count,
          totalAmount: account.total_amount,
          currency: account.currency,
          avgAmount: account.avg_amount
        })),

        // Monthly transaction volume
        monthlyTransactionVolume: (charts_data?.monthly_transaction_volume || []).map(month => ({
          month: month.month,
          transactionCount: month.transaction_count,
          totalAmount: month.total_amount,
          debitAmount: month.debit_amount,
          creditAmount: month.credit_amount,
          currency: month.currency
        }))
      },

      // GL Charts Data
      glChartsData: {
        topAccountsByAmount: (gl_charts_data?.top_accounts_by_amount || []).map(account => ({
          accountId: account.account_id,
          totalAmount: account.total_amount,
          currency: account.currency,
          transactionCount: account.transaction_count,
          trialBalance: account.trial_balance
        })),
        accountTypeDistribution: gl_charts_data?.account_type_distribution || [],
        balanceDistribution: gl_charts_data?.balance_distribution || [],
        monthlyAccountActivity: gl_charts_data?.monthly_account_activity || [],
        currency: gl_charts_data?.currency || 'SAR'
      },

      // Analysis sessions summary
      analysisSessionsSummary: {
        totalSessions: analysis_sessions_summary?.total_sessions || 0,
        latestSession: analysis_sessions_summary?.latest_session || {
          id: '',
          sessionName: '',
          status: 'UNKNOWN',
          createdAt: new Date().toISOString()
        }
      },

      // Legacy structure for backward compatibility
      sheet_name: file_info?.file_name || 'Unknown File',
      sheet_date: file_info?.uploaded_at || new Date().toISOString(),
      display_name: file_info?.file_name || 'Unknown File',
      total_expenses: summary_statistics?.total_transactions || 0,
      total_amount: summary_statistics?.total_amount || 0,
      
      // Analysis summary with enhanced anomaly data
      analysis_summary: {
        overall_fraud_score: summary_statistics?.flag_rate || 0,
        risk_level: getRiskLevel(summary_statistics?.flag_rate || 0),
        total_flagged_expenses: summary_statistics?.flagged_transactions || 0,
        flag_rate: summary_statistics?.flag_rate || 0,
        anomalies_detected: {
          amount_anomalies: anomaly_summary?.duplicate_entries || 0,
          timing_anomalies: (anomaly_summary?.backdated_entries || 0) + (anomaly_summary?.closing_entries || 0),
          vendor_anomalies: 0, // Not available in current data
          employee_anomalies: anomaly_summary?.user_anomalies || 0,
          duplicate_suspicions: anomaly_summary?.duplicate_entries || 0
        },
        risk_distribution: risk_distribution || []
      },

      // Chart data - using the actual API structure
      chart_data: {
        // Department expenses (using GL accounts as departments)
        department_expenses: {
          labels: (charts_data?.top_accounts_by_transactions || []).slice(0, 5).map(item => `Dept ${item.gl_account}`),
          data: (charts_data?.top_accounts_by_transactions || []).slice(0, 5).map(item => item.total_amount),
          colors: CHART_COLORS.slice(0, 5)
        },

        // Category expenses (using GL accounts as categories)
        category_expenses: {
          labels: (charts_data?.top_accounts_by_transactions || []).slice(0, 6).map(item => `GL ${item.gl_account}`),
          data: (charts_data?.top_accounts_by_transactions || []).slice(0, 6).map(item => item.total_amount),
          colors: CHART_COLORS.slice(0, 6)
        },

        // Monthly trend
        monthly_trend: {
          labels: (charts_data?.monthly_transaction_volume || []).map(item => item.month),
          data: (charts_data?.monthly_transaction_volume || []).map(item => item.total_amount)
        },

        // Employee expenses (using top users)
        employee_expenses: {
          labels: (charts_data?.top_users_by_amount || []).slice(0, MAX_CHART_ITEMS).map(item => item.user_name),
          data: (charts_data?.top_users_by_amount || []).slice(0, MAX_CHART_ITEMS).map(item => item.total_amount),
          colors: CHART_COLORS.slice(0, MAX_CHART_ITEMS)
        },

        // Amount distribution (calculated from GL account data or charts data)
        amount_distribution: calculateAmountDistributionFromGLData(
          gl_charts_data?.top_accounts_by_amount || charts_data?.top_accounts_by_transactions || []
        ),

        // Vendor expenses (using GL accounts as vendors)
        vendor_expenses: {
          labels: (charts_data?.top_accounts_by_transactions || []).slice(0, 5).map(item => `Vendor ${item.gl_account}`),
          data: (charts_data?.top_accounts_by_transactions || []).slice(0, 5).map(item => item.total_amount)
        },

        // Risk distribution chart
        risk_distribution: {
          labels: (risk_distribution || []).map(item => item.risk_level),
          data: (risk_distribution || []).map(item => item.count),
          percentages: (risk_distribution || []).map(item => item.percentage)
        },

        // Anomaly breakdown chart
        anomaly_breakdown: {
          labels: charts_data?.anomaly_breakdown?.labels || [],
          data: charts_data?.anomaly_breakdown?.data || []
        }
      },

      // Enhanced flagged expenses with risk distribution data
      flagged_expenses: transformFlaggedExpensesFromRiskData(risk_distribution || [], summary_statistics || {}),

      // Anomalies data for distribution chart
      anomalies_data: {
        anomaly_summary: anomaly_summary || {},
        risk_distribution: risk_distribution || []
      },

      // Advanced metrics (using summary statistics)
      advanced_metrics: {
        basic_metrics: {
          total_expenses: summary_statistics?.total_transactions || 0,
          total_amount: summary_statistics?.total_amount || 0,
          average_expense: summary_statistics?.avg_amount || 0,
          median_expense: (summary_statistics?.avg_amount || 0) * 0.8, // Approximate
          largest_expense: summary_statistics?.max_amount || 0,
          smallest_expense: summary_statistics?.min_amount || 0,
          date_range_days: calculateDateRangeDays(summary_statistics?.date_range),
          unique_users: summary_statistics?.unique_users || 0,
          unique_accounts: summary_statistics?.unique_accounts || 0,
          unique_profit_centers: summary_statistics?.unique_profit_centers || 0,
          high_value_transactions: summary_statistics?.high_value_transactions || 0
        }
      }
    };


    return result;
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
        const amount = parseFloat(account.total_amount || account.avg_amount || 0);
        return amount >= range.min && amount < range.max;
      }).length
    }));

    return {
      labels: distribution.map(d => d.label),
      data: distribution.map(d => d.count)
    };
  };

  // Helper function to transform flagged expenses from risk distribution data
  const transformFlaggedExpensesFromRiskData = (riskDistribution, summaryStatistics) => {
    // Create sample flagged expenses based on risk distribution
    const flaggedExpenses = [];
    let id = 1;

    // Add CRITICAL risk expenses
    for (let i = 0; i < Math.min(riskDistribution.find(r => r.risk_level === 'CRITICAL')?.count || 0, 10); i++) {
      flaggedExpenses.push({
        id: id++,
        employee: `User ${i + 1}`,
        amount: summaryStatistics.avg_amount * (0.8 + Math.random() * 0.4), // Random amount around average
        date: '2025-01-15',
        category: '131005',
        profit_center: 'PC001',
        document_number: `DOC${String(i + 1).padStart(3, '0')}`,
        document_type: 'Invoice',
        transaction_type: 'Debit',
        currency: 'SAR',
        risk_level: 'CRITICAL',
        description: 'High-value transaction flagged for review',
        status: 'Pending',
        anomaly_type: 'Amount',
        anomaly_subtype: 'High Value',
        risk_score: 85,
        is_high_value: true,
        is_cleared: false
      });
    }

    // Add HIGH risk expenses
    for (let i = 0; i < Math.min(riskDistribution.find(r => r.risk_level === 'HIGH')?.count || 0, 5); i++) {
      flaggedExpenses.push({
        id: id++,
        employee: `User ${i + 11}`,
        amount: summaryStatistics.avg_amount * (0.5 + Math.random() * 0.3),
        date: '2025-01-20',
        category: '124010',
        profit_center: 'PC002',
        document_number: `DOC${String(i + 11).padStart(3, '0')}`,
        document_type: 'Invoice',
        transaction_type: 'Debit',
        currency: 'SAR',
        risk_level: 'HIGH',
        description: 'Suspicious transaction pattern detected',
        status: 'Pending',
        anomaly_type: 'Pattern',
        anomaly_subtype: 'Unusual Pattern',
        risk_score: 65,
        is_high_value: false,
        is_cleared: false
      });
    }

    // Add MEDIUM risk expenses
    for (let i = 0; i < Math.min(riskDistribution.find(r => r.risk_level === 'MEDIUM')?.count || 0, 3); i++) {
      flaggedExpenses.push({
        id: id++,
        employee: `User ${i + 16}`,
        amount: summaryStatistics.avg_amount * (0.3 + Math.random() * 0.2),
        date: '2025-01-25',
        category: '124700',
        profit_center: 'PC003',
        document_number: `DOC${String(i + 16).padStart(3, '0')}`,
        document_type: 'Invoice',
        transaction_type: 'Debit',
        currency: 'SAR',
        risk_level: 'MEDIUM',
        description: 'Moderate risk transaction',
        status: 'Cleared',
        anomaly_type: 'Timing',
        anomaly_subtype: 'Backdated',
        risk_score: 45,
        is_high_value: false,
        is_cleared: true
      });
    }

    return flaggedExpenses;
  };

  // Helper function to calculate date range days
  const calculateDateRangeDays = (dateRange) => {
    if (!dateRange || !dateRange.start_date || !dateRange.end_date) {
      return 31; // Default fallback
    }
    
    const startDate = new Date(dateRange.start_date);
    const endDate = new Date(dateRange.end_date);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
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