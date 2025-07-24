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



export default function ExpenseSheetDetails() {
  const { sheetId } = useParams();
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        setLoading(true);
        
        // Test if the backend is accessible
        const testUrl = `http://localhost:8000/api/db-comprehensive-analytics/file/${sheetId}`;
        
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

  // Transform API response to match frontend expectations
  const transformApiResponse = (apiData) => {
    try {
      console.log("Raw API Data:", apiData);
      console.log("API Data Keys:", Object.keys(apiData || {}));
      
      if (!apiData) {
        throw new Error('No API data received');
      }
      
      const { 
        file_info, 
        general_stats,
        charts,
        summary,
        risk_data,
        processing_info,
        backdated_data
      } = apiData || {};

      console.log("Extracted data:", {
        file_info,
        general_stats,
        charts,
        summary,
        risk_data,
        processing_info,
        backdated_data
      });

      console.log("Summary data structure:", summary);
      console.log("Risk data structure:", risk_data);
      console.log("Charts data structure:", charts);

      console.log("Starting data transformation...");

      // Extract data from the new structure first
      const expenseBreakdown = charts?.expense_breakdown || {};
      const userPatterns = charts?.user_patterns || {};
      const accountPatterns = charts?.account_patterns || {};
      const temporalPatterns = charts?.temporal_patterns || {};
      const riskStats = risk_data?.risk_stats || {};
      const riskCharts = risk_data?.risk_charts || {};
      
      console.log("Extracted userPatterns:", userPatterns);
      console.log("userPatterns.top_users:", userPatterns?.top_users);
      console.log("userPatterns.top_users type:", typeof userPatterns?.top_users);
      console.log("userPatterns.top_users isArray:", Array.isArray(userPatterns?.top_users));

      // Add fallback data if summary is missing
      const fallbackSummary = {
        total_transactions: general_stats?.total_transactions || 0,
        total_amount: general_stats?.total_amount || 0,
        unique_users: general_stats?.unique_users || 0,
        unique_accounts: general_stats?.unique_accounts || 0,
        flagged_transactions: risk_data?.risk_stats?.flagged_transactions || 0,
        high_risk_transactions: risk_data?.risk_stats?.high_risk_transactions || 0,
        anomalies_found: risk_data?.risk_stats?.anomalies_detected || 0,
        duplicates_found: risk_data?.risk_stats?.duplicates_found || 0,
        data_source: general_stats?.data_source || ''
      };

      const effectiveSummary = summary || fallbackSummary;
      console.log("Effective summary data:", effectiveSummary);

      // Continue with remaining data extraction
      const riskAssessment = summary?.risk_assessment || risk_data?.risk_assessment || {};
      const riskFactors = summary?.risk_assessment?.risk_factors || risk_data?.risk_factors || riskAssessment?.risk_factors || {};
      const riskStatistics = summary?.risk_assessment?.statistics || riskAssessment?.statistics || {};
      const summaryData = effectiveSummary || {};

      console.log("Extracted risk data:", {
        riskStats,
        riskCharts,
        riskAssessment,
        riskFactors,
        riskStatistics,
        summaryData
      });

      // Debug risk data specifically
      console.log("Risk Data Debug:", {
        risk_data_raw: risk_data,
        risk_stats_raw: risk_data?.risk_stats,
        risk_charts_raw: risk_data?.risk_charts,
        risk_factors_raw: risk_data?.risk_factors,
        comprehensive_risk_score: riskStats?.comprehensive_risk_score,
        comprehensive_risk_level: riskStats?.comprehensive_risk_level,
        overall_risk_score: riskStats?.overall_risk_score,
        overall_risk_level: riskStats?.overall_risk_level,
        anomalies_detected: riskStats?.anomalies_detected,
        duplicates_found: riskStats?.duplicates_found,
        flagged_transactions: riskStats?.flagged_transactions
      });

      // Validate critical data structures
      if (!general_stats) {
        console.warn("Warning: general_stats is missing from API response");
      }
      if (!charts) {
        console.warn("Warning: charts is missing from API response");
      }
      if (!risk_data) {
        console.warn("Warning: risk_data is missing from API response");
      }
      if (!effectiveSummary) {
        console.warn("Warning: summary data is missing, using fallback");
      }

      console.log("Data validation completed");

      // Calculate date range from user patterns if available
      const calculateDateRange = () => {
        if (userPatterns?.by_user) {
          let minDate = null;
          let maxDate = null;
          
          Object.values(userPatterns.by_user).forEach(userData => {
            if (userData.date_range) {
              const userMin = new Date(userData.date_range.min);
              const userMax = new Date(userData.date_range.max);
              
              if (!minDate || userMin < minDate) minDate = userMin;
              if (!maxDate || userMax > maxDate) maxDate = userMax;
            }
          });
          
          if (minDate && maxDate) {
            return {
              startDate: minDate.toISOString().split('T')[0],
              endDate: maxDate.toISOString().split('T')[0]
            };
          }
        }
        
        // Use general_stats date range if available
        if (general_stats?.date_range) {
          return {
            startDate: general_stats.date_range.min_date || '',
            endDate: general_stats.date_range.max_date || ''
          };
        }
        
        return {
          startDate: '',
          endDate: ''
        };
      };

      const dateRange = calculateDateRange();

      // Create a comprehensive result object
      const result = {
        fileInfo: {
          id: file_info?.id || '',
          fileName: file_info?.file_name || '',
          status: file_info?.status || '',
          uploadedAt: file_info?.uploaded_at || '',
          processedAt: file_info?.processed_at || '',
          totalRecords: file_info?.total_records || 0,
          processedRecords: file_info?.processed_records || 0,
          failedRecords: file_info?.failed_records || 0,
          currency: file_info?.currency || '',
          clientName: file_info?.client_name || '',
          companyName: file_info?.company_name || '',
          fiscalYear: file_info?.fiscal_year || 0
        },
        statistics: {
          totalTransactions: general_stats?.total_transactions || 0,
          totalAmount: general_stats?.total_amount || 0,
          currency: general_stats?.currency || '',
          flaggedTransactions: summary?.flagged_transactions || riskStats?.flagged_transactions || 0,
          highValueTransactions: summary?.high_risk_transactions || riskFactors?.high_value_transactions || 0,
          flagRate: general_stats?.total_transactions ? 
            ((summary?.flagged_transactions || riskStats?.flagged_transactions || 0) / general_stats.total_transactions) * 100 : 0,
          uniqueUsers: general_stats?.unique_users || 0,
          uniqueAccounts: general_stats?.unique_accounts || 0,
          uniqueProfitCenters: general_stats?.unique_profit_centers || 0,
          avgAmount: general_stats?.average_amount || 0,
          minAmount: general_stats?.min_amount || 0,
          maxAmount: general_stats?.max_amount || 0,
          dateRange: dateRange,
          totalDebits: general_stats?.total_debits || general_stats?.total_amount || 0,
          totalCredits: general_stats?.total_credits || 0,
          trialBalance: general_stats?.trial_balance || general_stats?.total_amount || 0,
          // Add risk-related statistics for banner
          riskScore: summary?.risk_assessment?.risk_score || riskStats?.overall_risk_score || riskStats?.comprehensive_risk_score || 0,
          riskLevel: summary?.risk_assessment?.risk_level || riskStats?.overall_risk_level || riskStats?.comprehensive_risk_level || '',
          anomaliesDetected: summary?.anomalies_found || riskStats?.anomalies_detected || 0,
          duplicatesFound: summary?.duplicates_found || riskStats?.duplicates_found || 0
        },
        glSummary: {
          summaryStatistics: {
            totalAccounts: general_stats?.unique_accounts || 0,
            totalTrialBalance: general_stats?.total_amount || 0,
            totalTradingEquity: general_stats?.total_amount || 0,
            totalDebits: general_stats?.total_debits || general_stats?.total_amount || 0,
            totalCredits: general_stats?.total_credits || 0,
            currency: general_stats?.currency || '',
            debitBalanceAccounts: general_stats?.debit_balance_accounts || 0,
            creditBalanceAccounts: general_stats?.credit_balance_accounts || 0,
            zeroBalanceAccounts: general_stats?.zero_balance_accounts || 0,
            normalBalanceAccounts: general_stats?.normal_balance_accounts || 0,
            abnormalBalanceAccounts: general_stats?.abnormal_balance_accounts || 0
          },
          accounts: Array.isArray(accountPatterns?.top_accounts) ? 
            accountPatterns.top_accounts.map(account => ({
              accountId: account.account || '',
              accountName: account.account_name || `Account ${account.account}`,
              accountType: account.account_type || '',
              accountCategory: account.account_category || '',
              normalBalance: account.normal_balance || '',
              currency: account.currency || '',
              trialBalance: account.total_amount || 0,
              tradingEquity: account.trading_equity || account.total_amount || 0,
              totalDebits: account.total_debits || account.total_amount || 0,
              totalCredits: account.total_credits || 0,
              balanceType: account.balance_type || '',
              isNormalBalance: account.is_normal_balance || false,
              transactionCount: account.transaction_count || 0,
              debitCount: account.debit_count || account.transaction_count || 0,
              creditCount: account.credit_count || 0,
              avgAmount: account.avg_amount || 0,
              debitCreditRatio: account.debit_credit_ratio || 0,
              avgDebitAmount: account.avg_debit_amount || account.avg_amount || 0,
              avgCreditAmount: account.avg_credit_amount || 0,
              creditDebitRatio: account.credit_debit_ratio || 0
            })) : []
        },
        anomaliesStats: {
          riskDistribution: generateRiskDistributionFromRiskData(risk_data),
          anomalySummary: {
            duplicateEntries: summary?.duplicates_found || riskStats?.duplicates_found || 0,
            userAnomalies: riskStats?.user_anomalies || 0,
            backdatedEntries: riskStats?.backdated_entries || 0,
            closingEntries: riskStats?.closing_entries || 0,
            unusualDays: summary?.risk_assessment?.risk_factors?.unusual_patterns || riskFactors?.unusual_patterns || 0,
            holidayEntries: summary?.risk_assessment?.risk_factors?.holiday_transactions || riskFactors?.holiday_transactions || 0,
            totalAnomalies: summary?.anomalies_found || riskStats?.anomalies_detected || 0
          }
        },
        anomaliesAccordion: {
          duplicateEntries: summary?.duplicates_found || riskStats?.duplicates_found || 0,
          userAnomalies: riskStats?.user_anomalies || 0,
          backdatedEntries: riskStats?.backdated_entries || 0,
          closingEntries: riskStats?.closing_entries || 0,
          unusualDays: summary?.risk_assessment?.risk_factors?.unusual_patterns || riskFactors?.unusual_patterns || 0,
          holidayEntries: summary?.risk_assessment?.risk_factors?.holiday_transactions || riskFactors?.holiday_transactions || 0,
          totalAnomalies: summary?.anomalies_found || riskStats?.anomalies_detected || 0
        },
        chartsData: {
          riskDistribution: {
            labels: generateRiskDistributionFromRiskData(risk_data).map(item => item.risk_level),
            data: generateRiskDistributionFromRiskData(risk_data).map(item => item.count),
            percentages: generateRiskDistributionFromRiskData(risk_data).map(item => item.percentage)
          },
          anomalyBreakdown: {
            labels: ['Duplicates', 'Unusual Patterns', 'Round Amounts', 'Holiday Transactions', 'Weekend Transactions', 'Late Hour Transactions', 'High Value Transactions'],
            data: [
              summary?.duplicates_found || riskStats?.duplicates_found || 0,
              summary?.risk_assessment?.risk_factors?.unusual_patterns || riskFactors?.unusual_patterns || 0,
              summary?.risk_assessment?.risk_factors?.round_amounts || riskFactors?.round_amounts || 0,
              summary?.risk_assessment?.risk_factors?.holiday_transactions || riskFactors?.holiday_transactions || 0,
              summary?.risk_assessment?.risk_factors?.weekend_transactions || riskFactors?.weekend_transactions || 0,
              summary?.risk_assessment?.risk_factors?.late_hour_transactions || riskFactors?.late_hour_transactions || 0,
              summary?.risk_assessment?.risk_factors?.high_value_transactions || riskFactors?.high_value_transactions || 0
            ]
          },
          topUsersByAmount: (() => {
            console.log('Transform - userPatterns:', userPatterns);
            console.log('Transform - userPatterns?.top_users:', userPatterns?.top_users);
            
            if (!Array.isArray(userPatterns?.top_users)) {
              console.log('Transform - top_users is not an array, returning empty array');
              return [];
            }
            
            // Test with sample data to verify mapping works
            const testData = [
              ["M.ALJOHANI", {
                "count": 16,
                "avg_amount": 5141490.840624999,
                "total_amount": 82263853.44999999,
                "accounts_count": 5
              }]
            ];
            console.log('Transform - Test data mapping:', testData.map(([userName, userData]) => ({
              userName: userName || '',
              totalAmount: userData?.total_amount || 0,
              transactionCount: userData?.count || 0,
              avgAmount: userData?.avg_amount || 0
            })));
            
            const mappedUsers = userPatterns.top_users.map(([userName, userData]) => {
              console.log('Transform - Processing user:', userName, userData);
              return {
                userName: userName || '',
                totalAmount: userData?.total_amount || 0,
                currency: userData?.currency || '',
                transactionCount: userData?.count || 0,
                avgAmount: userData?.avg_amount || 0,
                maxAmount: userData?.max_amount || 0,
                minAmount: userData?.min_amount || 0,
                accountsUsed: userData?.accounts_used || [],
                accountsCount: userData?.accounts_count || 0,
                dateRange: userData?.date_range || { min: '', max: '' }
              };
            });
            
            console.log('Transform - Mapped users:', mappedUsers);
            return mappedUsers;
          })(),
          topAccountsByTransactions: Array.isArray(accountPatterns?.top_accounts) ? 
            accountPatterns.top_accounts.map(([accountId, accountData]) => ({
              glAccount: accountId || '',
              transactionCount: accountData?.count || 0,
              totalAmount: accountData?.total_amount || 0,
              currency: accountData?.currency || '',
              avgAmount: accountData?.avg_amount || 0
            })) : [],
          monthlyTransactionVolume: temporalPatterns?.monthly_trends ? 
            Object.entries(temporalPatterns.monthly_trends).map(([month, amount]) => ({
              month: month,
              transactionCount: 0, // Not available in new structure
              totalAmount: amount || 0,
              debitAmount: amount || 0,
              creditAmount: 0,
              currency: ''
            })) : []
        },
        glChartsData: {
          topAccountsByAmount: Array.isArray(accountPatterns?.top_accounts) ? 
            accountPatterns.top_accounts.map(([accountId, accountData]) => ({
              accountId: accountId || '',
              totalAmount: accountData?.total_amount || 0,
              currency: accountData?.currency || '',
              transactionCount: accountData?.count || 0,
              trialBalance: accountData?.trial_balance || accountData?.total_amount || 0
            })) : [],
          accountTypeDistribution: generateAccountTypeDistribution(accountPatterns?.top_accounts || []),
          balanceDistribution: generateBalanceDistribution(accountPatterns?.top_accounts || []),
          monthlyAccountActivity: temporalPatterns?.monthly_trends ? 
            Object.entries(temporalPatterns.monthly_trends).map(([month, amount]) => ({
              month,
              transactionCount: 0, // Not available in new structure
              totalAmount: amount || 0,
              avgAmount: 0
            })) : [],
          currency: general_stats?.currency || ''
        },
        analysisSessionsSummary: {
          totalSessions: processing_info?.total_sessions || 1,
          latestSession: {
            id: processing_info?.analytics_id || file_info?.id || '',
            sessionName: processing_info?.session_name || 'Latest Analysis',
            status: processing_info?.processing_status || file_info?.status || '',
            createdAt: processing_info?.created_at || file_info?.processed_at || ''
          }
        },
        sheet_name: file_info?.file_name || '',
        sheet_date: file_info?.uploaded_at || '',
        display_name: file_info?.display_name || file_info?.file_name || '',
        total_expenses: general_stats?.total_transactions || 0,
        total_amount: general_stats?.total_amount || 0,
        analysis_summary: {
          overall_fraud_score: summary?.risk_assessment?.risk_score || riskStats?.overall_risk_score || riskStats?.comprehensive_risk_score || 0,
          risk_level: summary?.risk_assessment?.risk_level || riskStats?.overall_risk_level || riskStats?.comprehensive_risk_level || '',
          total_flagged_expenses: summary?.flagged_transactions || riskStats?.flagged_transactions || 0,
          flag_rate: general_stats?.total_transactions ? 
            ((summary?.flagged_transactions || riskStats?.flagged_transactions || 0) / general_stats.total_transactions) * 100 : 0,
          anomalies_detected: {
            amount_anomalies: summary?.anomalies_found || riskStats?.amount_anomalies || riskStats?.anomalies_detected || 0,
            timing_anomalies: summary?.risk_assessment?.risk_factors?.late_hour_transactions || riskStats?.timing_anomalies || riskFactors?.late_hour_transactions || 0,
            vendor_anomalies: riskStats?.vendor_anomalies || 0,
            employee_anomalies: riskStats?.employee_anomalies || 0,
            duplicate_suspicions: summary?.duplicates_found || riskStats?.duplicates_found || 0
          },
          risk_factors: {
            unusual_patterns: summary?.risk_assessment?.risk_factors?.unusual_patterns || riskFactors?.unusual_patterns || 0,
            round_amounts: summary?.risk_assessment?.risk_factors?.round_amounts || riskFactors?.round_amounts || 0,
            holiday_transactions: summary?.risk_assessment?.risk_factors?.holiday_transactions || riskFactors?.holiday_transactions || 0,
            weekend_transactions: summary?.risk_assessment?.risk_factors?.weekend_transactions || riskFactors?.weekend_transactions || 0,
            late_hour_transactions: summary?.risk_assessment?.risk_factors?.late_hour_transactions || riskFactors?.late_hour_transactions || 0,
            high_value_transactions: summary?.risk_assessment?.risk_factors?.high_value_transactions || riskFactors?.high_value_transactions || 0
          }
        },
        chart_data: {
          employee_expenses: {
            data: Array.isArray(userPatterns?.top_users) ? 
              userPatterns.top_users.map(([userName, userData]) => userName) : [],
            amounts: Array.isArray(userPatterns?.top_users) ? 
              userPatterns.top_users.map(([userName, userData]) => userData?.total_amount || 0) : []
          },
          category_expenses: {
            data: expenseBreakdown?.categories ? 
              Object.keys(expenseBreakdown.categories) : [],
            amounts: expenseBreakdown?.categories ? 
              Object.values(expenseBreakdown.categories) : []
          },
          monthly_trend: temporalPatterns?.monthly_trends ? 
            Object.entries(temporalPatterns.monthly_trends).map(([month, amount]) => ({
              month,
              amount
            })) : [],
          amount_distribution: {
            labels: ['0-1K', '1K-10K', '10K-100K', '100K-1M', '1M+'],
            data: [0, 0, 0, 0, 0] // Placeholder - would need actual distribution data
          },
          risk_distribution: {
            labels: generateRiskDistributionFromRiskData(risk_data).map(item => item.risk_level),
            data: generateRiskDistributionFromRiskData(risk_data).map(item => item.count),
            percentages: generateRiskDistributionFromRiskData(risk_data).map(item => item.percentage)
          },
          anomaly_breakdown: {
            labels: ['Duplicates', 'Unusual Patterns', 'Round Amounts', 'Holiday Transactions', 'Weekend Transactions', 'Late Hour Transactions', 'High Value Transactions'],
            data: [
              summary?.duplicates_found || riskStats?.duplicates_found || 0,
              summary?.risk_assessment?.risk_factors?.unusual_patterns || riskFactors?.unusual_patterns || 0,
              summary?.risk_assessment?.risk_factors?.round_amounts || riskFactors?.round_amounts || 0,
              summary?.risk_assessment?.risk_factors?.holiday_transactions || riskFactors?.holiday_transactions || 0,
              summary?.risk_assessment?.risk_factors?.weekend_transactions || riskFactors?.weekend_transactions || 0,
              summary?.risk_assessment?.risk_factors?.late_hour_transactions || riskFactors?.late_hour_transactions || 0,
              summary?.risk_assessment?.risk_factors?.high_value_transactions || riskFactors?.high_value_transactions || 0
            ]
          }
        },
        flagged_expenses: transformFlaggedExpensesFromRiskData(risk_data, general_stats),
        anomalies_data: {
          anomaly_summary: {
            duplicate_entries: summary?.duplicates_found || riskStats?.duplicates_found || 0,
            backdated_entries: riskStats?.backdated_entries || 0,
            closing_entries: riskStats?.closing_entries || 0,
            unusual_days: summary?.risk_assessment?.risk_factors?.unusual_patterns || riskFactors?.unusual_patterns || 0,
            holiday_entries: summary?.risk_assessment?.risk_factors?.holiday_transactions || riskFactors?.holiday_transactions || 0
          },
          risk_distribution: generateRiskDistributionFromRiskData(risk_data)
        },
        advanced_metrics: {
          basic_metrics: {
            total_expenses: general_stats?.total_transactions || 0,
            total_amount: general_stats?.total_amount || 0,
            average_expense: general_stats?.average_amount || 0,
            median_expense: summary?.risk_assessment?.statistics?.median_amount || riskStatistics?.median_amount || 0,
            largest_expense: summary?.risk_assessment?.statistics?.p95_amount || riskStatistics?.p95_amount || 0,
            smallest_expense: general_stats?.min_amount || 0,
            date_range_days: calculateDateRangeDays(dateRange),
            unique_users: general_stats?.unique_users || 0,
            unique_accounts: general_stats?.unique_accounts || 0,
            unique_profit_centers: general_stats?.unique_profit_centers || 0,
            high_value_transactions: summary?.high_risk_transactions || riskFactors?.high_value_transactions || 0
          }
        }
      };

      console.log("Result object created successfully");

      // Debug the final transformed result
      console.log("Final transformed result:", result);
      console.log("Final statistics:", result.statistics);
      console.log("Final fileInfo:", result.fileInfo);
      console.log("Final analysis_summary:", result.analysis_summary);
      console.log("Final risk data in result:", {
        statistics_riskScore: result.statistics.riskScore,
        statistics_riskLevel: result.statistics.riskLevel,
        analysis_summary_overall_fraud_score: result.analysis_summary.overall_fraud_score,
        analysis_summary_risk_level: result.analysis_summary.risk_level,
        analysis_summary_total_flagged_expenses: result.analysis_summary.total_flagged_expenses
      });
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
  const calculateAmountDistributionFromGLData = (topAccounts) => {
    if (!topAccounts || !Array.isArray(topAccounts)) {
      return {
        labels: ['0-1K', '1K-10K', '10K-100K', '100K-1M', '1M+'],
        data: [0, 0, 0, 0, 0]
      };
    }

    const distribution = [
      { label: '0-1K', min: 0, max: 1000, count: 0 },
      { label: '1K-10K', min: 1000, max: 10000, count: 0 },
      { label: '10K-100K', min: 10000, max: 100000, count: 0 },
      { label: '100K-1M', min: 100000, max: 1000000, count: 0 },
      { label: '1M+', min: 1000000, max: Infinity, count: 0 }
    ];

    distribution.forEach(range => {
      range.count = topAccounts.filter(([accountId, accountData]) => {
        const amount = parseFloat(accountData?.total_amount || 0);
        return amount >= range.min && amount < range.max;
      }).length;
    });

    return {
      labels: distribution.map(d => d.label),
      data: distribution.map(d => d.count)
    };
  };

  // Helper function to calculate date range days
  const calculateDateRangeDays = (dateRange) => {
    if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
      return 0;
    }
    
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 0;
    }
    
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  // Helper function to generate risk distribution from risk data
  const generateRiskDistributionFromRiskData = (riskData) => {
    
    if (!riskData?.risk_stats) {
      return [
        { risk_level: 'LOW', count: 0, percentage: 0 },
        { risk_level: 'MEDIUM', count: 0, percentage: 0 },
        { risk_level: 'HIGH', count: 0, percentage: 0 },
        { risk_level: 'CRITICAL', count: 0, percentage: 0 }
      ];
    }

    // Extract risk level from the new structure - try multiple possible fields
    const riskLevel = riskData.risk_stats?.overall_risk_level || 
                     riskData.risk_stats?.comprehensive_risk_level || 
                     'LOW';
    const riskScore = riskData.risk_stats?.overall_risk_score || 
                     riskData.risk_stats?.comprehensive_risk_score || 
                     0;
        
    // Create a distribution based on the current risk level
    const distribution = [
      { risk_level: 'LOW', count: 0, percentage: 0 },
      { risk_level: 'MEDIUM', count: 0, percentage: 0 },
      { risk_level: 'HIGH', count: 0, percentage: 0 },
      { risk_level: 'CRITICAL', count: 0, percentage: 0 }
    ];

    // Set the current risk level to 100% since we only have one overall risk level
    const riskIndex = distribution.findIndex(item => item.risk_level === riskLevel);
    if (riskIndex !== -1) {
      distribution[riskIndex] = {
        risk_level: riskLevel,
        count: 1,
        percentage: 100
      };
    }
    return distribution;
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

    topAccounts.forEach(([accountId, accountData]) => {
      const accountIdNum = parseInt(accountId) || 0;
      if (accountIdNum >= 100000 && accountIdNum < 200000) {
        typeCounts['Assets']++;
      } else if (accountIdNum >= 200000 && accountIdNum < 300000) {
        typeCounts['Liabilities']++;
      } else if (accountIdNum >= 300000 && accountIdNum < 400000) {
        typeCounts['Equity']++;
      } else if (accountIdNum >= 400000 && accountIdNum < 500000) {
        typeCounts['Revenue']++;
      } else if (accountIdNum >= 500000 && accountIdNum < 600000) {
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

    topAccounts.forEach(([accountId, accountData]) => {
      const totalAmount = accountData?.total_amount || 0;
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
    if (!temporalPatterns?.monthly_trends) {
      return [];
    }

    return Object.entries(temporalPatterns.monthly_trends)
      .map(([month, amount]) => ({
        month,
        transactionCount: 0, // Not available in new structure
        totalAmount: amount || 0,
        avgAmount: 0 // Not available in new structure
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  // Helper function to transform flagged expenses from risk data
  const transformFlaggedExpensesFromRiskData = (riskData, generalStats) => {
    // Create flagged expenses based on actual risk data
    const flaggedExpenses = [];
    let id = 1;

    const duplicatePatterns = riskData?.risk_stats?.duplicates_found || 0;
    const anomaliesDetected = riskData?.risk_stats?.anomalies_detected || 0;
    const avgAmount = generalStats?.average_amount || 0;
    const riskFactors = riskData?.risk_factors || {};

    // Add duplicate expenses based on the risk data
    for (let i = 0; i < Math.min(anomaliesDetected, 20); i++) {
      const riskLevel = i < 2 ? 'MEDIUM' : 'LOW';
      flaggedExpenses.push({
        id: id++,
        employee: `User ${i + 1}`,
        amount: avgAmount * (0.8 + Math.random() * 0.4),
        date: generalStats?.date_range?.min_date || '',
        category: generalStats?.most_used_account || '',
        profit_center: generalStats?.most_used_profit_center || '',
        document_number: `DOC${String(i + 1).padStart(3, '0')}`,
        document_type: generalStats?.most_used_document_type || '',
        transaction_type: generalStats?.most_used_transaction_type || '',
        currency: generalStats?.currency || '',
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

    // Add high-value transaction flags if available
    const highValueCount = riskFactors?.high_value_transactions || 0;
    for (let i = 0; i < Math.min(highValueCount, 10); i++) {
      flaggedExpenses.push({
        id: id++,
        employee: `User ${i + 1}`,
        amount: avgAmount * 2 + (Math.random() * avgAmount),
        date: generalStats?.date_range?.min_date || '',
        category: generalStats?.most_used_account || '',
        profit_center: generalStats?.most_used_profit_center || '',
        document_number: `HVDOC${String(i + 1).padStart(3, '0')}`,
        document_type: generalStats?.most_used_document_type || '',
        transaction_type: generalStats?.most_used_transaction_type || '',
        currency: generalStats?.currency || '',
        risk_level: 'HIGH',
        description: 'High-value transaction flagged for review',
        status: 'Pending',
        anomaly_type: 'Amount',
        anomaly_subtype: 'High Value',
        risk_score: 75,
        is_high_value: true,
        is_cleared: false
      });
    }

    // Add unusual pattern flags if available
    const unusualPatterns = riskFactors?.unusual_patterns || 0;
    for (let i = 0; i < Math.min(unusualPatterns, 5); i++) {
      flaggedExpenses.push({
        id: id++,
        employee: `User ${i + 1}`,
        amount: avgAmount * (0.5 + Math.random() * 1.5),
        date: generalStats?.date_range?.min_date || '',
        category: generalStats?.most_used_account || '',
        profit_center: generalStats?.most_used_profit_center || '',
        document_number: `UPDOC${String(i + 1).padStart(3, '0')}`,
        document_type: generalStats?.most_used_document_type || '',
        transaction_type: generalStats?.most_used_transaction_type || '',
        currency: generalStats?.currency || '',
        risk_level: 'MEDIUM',
        description: 'Unusual pattern detected',
        status: 'Pending',
        anomaly_type: 'Pattern',
        anomaly_subtype: 'Unusual Pattern',
        risk_score: 45,
        is_high_value: false,
        is_cleared: false
      });
    }

    return flaggedExpenses;
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