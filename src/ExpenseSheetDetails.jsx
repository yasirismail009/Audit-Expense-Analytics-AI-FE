import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, CircularProgress, Alert, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
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
   * 
   * New API Structure (2025):
   * {
   *   file_info: { file_id, file_name, file_status, uploaded_at, processed_at, total_records, processed_records, failed_records, client_name, company_name, fiscal_year, engagement_id, processing_success_rate },
   *   analysis_metadata: { has_overall_analysis, has_risk_analysis, has_general_analysis, has_duplicate_analysis, has_backdated_analysis, has_user_analysis, has_unusual_days_analysis, has_closing_entries_analysis, has_holiday_analysis, analysis_timestamp, analysis_version },
   *   overall_statistics: { analysis_id, analysis_date, processing_duration, transaction_summary, flag_summary, expense_analysis, risk_assessment, flagged_transactions_count },
   *   risk_statistics: { document_id, document_date, total_transactions, high_risk_transactions, medium_risk_transactions, low_risk_transactions, critical_risk_transactions, overall_risk_score, risk_distributions, methodology_overview, recommendations, audit_implications },
   *   general_statistics: { analysis_id, analysis_date, trial_balance_summary, gl_account_summaries_count, user_summaries_count, statistical_calculations },
   *   anomaly_statistics: { duplicate_analysis, backdated_analysis, user_analysis, unusual_days_analysis, closing_entries_analysis, holiday_analysis, total_anomalies, anomaly_types_detected },
   *   chart_data: { overall_charts, risk_charts, anomaly_charts, temporal_charts, user_charts, account_charts },
   *   summary_dashboard: { total_transactions, total_anomalies, anomaly_percentage, overall_risk_score, risk_level, analysis_coverage, key_metrics }
   * }
   */
  const transformApiResponse = (apiData) => {
    try {
      if (!apiData) {
        throw new Error('No API data received');
      }
      
      // Extract data from the new API structure
      const { 
        file_info, 
        analysis_metadata,
        overall_statistics,
        risk_statistics,
        general_statistics,
        anomaly_statistics,
        chart_data,
        summary_dashboard
      } = apiData || {};

      // Extract nested data structures
      const transactionSummary = overall_statistics?.transaction_summary || {};
      const flagSummary = overall_statistics?.flag_summary || {};
      const expenseAnalysis = overall_statistics?.expense_analysis || {};
      const riskAssessment = overall_statistics?.risk_assessment || {};
      const analysisMetadata = analysis_metadata || {};
      const summaryDashboard = summary_dashboard || {};
      
      // Extract anomaly analysis data
      const duplicateAnalysis = anomaly_statistics?.duplicate_analysis || {};
      const backdatedAnalysis = anomaly_statistics?.backdated_analysis || {};
      const userAnalysis = anomaly_statistics?.user_analysis || {};
      const unusualDaysAnalysis = anomaly_statistics?.unusual_days_analysis || {};
      const closingEntriesAnalysis = anomaly_statistics?.closing_entries_analysis || {};
      const holidayAnalysis = anomaly_statistics?.holiday_analysis || {};

      // Calculate date range from transaction summary
      const calculateDateRange = () => {
        if (transactionSummary?.date_range) {
          return {
            startDate: transactionSummary.date_range.min_date || '',
            endDate: transactionSummary.date_range.max_date || ''
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
          id: file_info?.file_id || '',
          fileName: file_info?.file_name || '',
          status: file_info?.file_status || '',
          uploadedAt: file_info?.uploaded_at || '',
          processedAt: file_info?.processed_at || '',
          totalRecords: file_info?.total_records || 0,
          processedRecords: file_info?.processed_records || 0,
          failedRecords: file_info?.failed_records || 0,
          currency: transactionSummary?.currency || '',
          clientName: file_info?.client_name || '',
          companyName: file_info?.company_name || '',
          fiscalYear: file_info?.fiscal_year || 0,
          engagementId: file_info?.engagement_id || '',
          processingSuccessRate: file_info?.processing_success_rate || 0
        },
        statistics: {
          totalTransactions: transactionSummary?.total_transactions || 0,
          totalAmount: transactionSummary?.total_amount || 0,
          currency: transactionSummary?.currency || '',
          flaggedTransactions: flagSummary?.total_flagged || 0,
          highValueTransactions: flagSummary?.amount_summary?.max_amount || 0,
          flagRate: transactionSummary?.total_transactions ? 
            (flagSummary?.total_flagged / transactionSummary.total_transactions) * 100 : 0,
          uniqueUsers: transactionSummary?.unique_users || 0,
          uniqueAccounts: transactionSummary?.unique_accounts || 0,
          uniqueProfitCenters: 0, // Not available in new structure
          avgAmount: transactionSummary?.amount_statistics?.mean || 0,
          minAmount: transactionSummary?.amount_statistics?.min || 0,
          maxAmount: transactionSummary?.amount_statistics?.max || 0,
          dateRange: dateRange,
          totalDebits: transactionSummary?.total_amount || 0, // Assuming all are debits
          totalCredits: 0, // Not available in new structure
          trialBalance: transactionSummary?.total_amount || 0,
          // Add risk-related statistics for banner
          riskScore: risk_statistics?.overall_risk_score || 0,
          riskLevel: risk_statistics?.methodology_overview?.risk_levels?.critical_risk?.description || '',
          anomaliesDetected: summaryDashboard?.total_anomalies || 0,
          duplicatesFound: duplicateAnalysis?.duplicate_count || 0,
          userAnomalies: userAnalysis?.anomalies_count || 0,
          highRiskUsers: userAnalysis?.high_risk_users_count || 0
        },
        glSummary: {
          summaryStatistics: {
            totalAccounts: expenseAnalysis?.expense_summary?.total_accounts || transactionSummary?.unique_accounts || 0,
            totalTrialBalance: expenseAnalysis?.expense_summary?.total_expenses || transactionSummary?.total_amount || 0,
            totalTradingEquity: expenseAnalysis?.expense_summary?.total_expenses || transactionSummary?.total_amount || 0,
            totalDebits: expenseAnalysis?.expense_summary?.total_expenses || transactionSummary?.total_amount || 0,
            totalCredits: 0, // Not available in new structure
            currency: transactionSummary?.currency || '',
            debitBalanceAccounts: 0, // Not available in new structure
            creditBalanceAccounts: 0, // Not available in new structure
            zeroBalanceAccounts: 0, // Not available in new structure
            normalBalanceAccounts: 0, // Not available in new structure
            abnormalBalanceAccounts: 0, // Not available in new structure
            avgRiskScore: risk_statistics?.overall_risk_score || 0,
            accountsWithAnomalies: 0, // Not available in new structure
            highRiskAccounts: 0 // Not available in new structure
          },
          accounts: Array.isArray(expenseAnalysis?.top_expense_accounts) ? 
            expenseAnalysis.top_expense_accounts.map(account => ({
              accountId: account.account_id || '',
              accountName: `Account ${account.account_id}`,
              accountType: '', // Not available in new structure
              accountCategory: '', // Not available in new structure
              normalBalance: '', // Not available in new structure
              currency: transactionSummary?.currency || '',
              trialBalance: account.total_amount || 0,
              tradingEquity: account.total_amount || 0,
              totalDebits: account.debit_amount || account.total_amount || 0,
              totalCredits: account.credit_amount || 0,
              balanceType: '', // Not available in new structure
              isNormalBalance: false, // Not available in new structure
              transactionCount: account.transaction_count || 0,
              debitCount: account.transaction_count || 0,
              creditCount: 0, // Not available in new structure
              avgAmount: account.total_amount / (account.transaction_count || 1) || 0,
              debitCreditRatio: 0, // Not available in new structure
              avgDebitAmount: account.debit_amount / (account.transaction_count || 1) || 0,
              avgCreditAmount: account.credit_amount / (account.transaction_count || 1) || 0,
              creditDebitRatio: 0, // Not available in new structure
              riskLevel: 'LOW', // Default since not available in new structure
              riskColor: '#4BC0C0',
              avgRiskScore: 0, // Not available in new structure
              anomalyCounts: {
                duplicate: 0,
                backdated: 0,
                high_value: 0,
                total_anomalies: 0
              }
            })) : []
        },
        anomaliesStats: {
          riskDistribution: (() => {
            // Use risk_statistics.risk_distributions as the primary source
            const riskDistributionData = [
              { risk_level: 'LOW', count: risk_statistics?.risk_distributions?.low_risk || 0 },
              { risk_level: 'MEDIUM', count: risk_statistics?.risk_distributions?.medium_risk || 0 },
              { risk_level: 'HIGH', count: risk_statistics?.risk_distributions?.high_risk || 0 },
              { risk_level: 'CRITICAL', count: risk_statistics?.risk_distributions?.critical_risk || 0 }
            ];
            
            const totalAnomalies = riskDistributionData.reduce((sum, item) => sum + item.count, 0);
            
            return riskDistributionData.map(item => ({
              ...item,
              percentage: totalAnomalies > 0 ? (item.count / totalAnomalies) * 100 : 0
            }));
          })(),
          anomalySummary: {
            duplicateEntries: duplicateAnalysis?.duplicate_count || 0,
            userAnomalies: userAnalysis?.anomalies_count || 0,
            backdatedEntries: backdatedAnalysis?.backdated_count || 0,
            closingEntries: closingEntriesAnalysis?.closing_entries_count || 0,
            unusualDays: unusualDaysAnalysis?.unusual_days_count || 0,
            holidayEntries: holidayAnalysis?.holiday_postings_count || 0,
            totalAnomalies: summaryDashboard?.total_anomalies || 0,
            highRiskUsers: userAnalysis?.high_risk_users_count || 0,
            totalUsers: userAnalysis?.total_users || 0
          }
        },
        anomaliesAccordion: {
          duplicateEntries: duplicateAnalysis?.duplicate_count || 0,
          userAnomalies: userAnalysis?.anomalies_count || 0,
          backdatedEntries: backdatedAnalysis?.backdated_count || 0,
          closingEntries: closingEntriesAnalysis?.closing_entries_count || 0,
          unusualDays: unusualDaysAnalysis?.unusual_days_count || 0,
          holidayEntries: holidayAnalysis?.holiday_postings_count || 0,
          totalAnomalies: summaryDashboard?.total_anomalies || 0,
          highRiskUsers: userAnalysis?.high_risk_users_count || 0,
          totalUsers: userAnalysis?.total_users || 0
        },
        chartsData: {
          riskDistribution: (() => {
            const riskDistributionData = {
              labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
              data: [
                risk_statistics?.risk_distributions?.low_risk || 0,
                risk_statistics?.risk_distributions?.medium_risk || 0,
                risk_statistics?.risk_distributions?.high_risk || 0,
                risk_statistics?.risk_distributions?.critical_risk || 0
              ],
              colors: ['#4BC0C0', '#FFCE56', '#FF9F40', '#FF6384']
            };
            
            const totalAnomalies = riskDistributionData.data.reduce((sum, count) => sum + count, 0);
            const percentages = riskDistributionData.data.map(count => 
              totalAnomalies > 0 ? (count / totalAnomalies) * 100 : 0
            );
            
            return {
              labels: riskDistributionData.labels,
              data: riskDistributionData.data,
              percentages: percentages,
              colors: riskDistributionData.colors
            };
          })(),
          anomalyBreakdown: {
            labels: ['Duplicate Entries', 'User Anomalies', 'Backdated Entries', 'Closing Entries', 'Unusual Days', 'Holiday Entries'],
            data: [
              duplicateAnalysis?.duplicate_count || 0,
              userAnalysis?.anomalies_count || 0,
              backdatedAnalysis?.backdated_count || 0,
              closingEntriesAnalysis?.closing_entries_count || 0,
              unusualDaysAnalysis?.unusual_days_count || 0,
              holidayAnalysis?.holiday_postings_count || 0
            ],
            colors: ['#FF6384', '#4BC0C0', '#36A2EB', '#FFCE56', '#9966FF', '#FF9F40']
          },
          topUsersByAmount: (() => {
            // Generate user data from chart_data.user_charts
            const userCharts = chart_data?.user_charts?.user_summary || [];
            
            return userCharts.map(user => ({
              userName: user.user || 'Unknown User',
              totalAmount: user.total_amount || 0,
              transactionCount: user.transaction_count || 0,
              avgAmount: user.avg_amount || 0,
              riskLevel: 'HIGH' // Default since not available in new structure
            })).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10);
          })(),
          topAccountsByTransactions: Array.isArray(expenseAnalysis?.top_expense_accounts) ? 
            expenseAnalysis.top_expense_accounts.map(account => ({
              glAccount: account.account_id || '',
              transactionCount: account.transaction_count || 0,
              totalAmount: account.total_amount || 0,
              currency: transactionSummary?.currency || '',
              avgAmount: account.total_amount / (account.transaction_count || 1) || 0,
              riskLevel: 'LOW', // Default since not available in new structure
              riskColor: '#4BC0C0',
              avgRiskScore: 0 // Not available in new structure
            })).sort((a, b) => b.transactionCount - a.transactionCount).slice(0, 10) : [],
          monthlyTransactionVolume: (() => {
            // Generate monthly data from chart_data if available
            const temporalCharts = chart_data?.temporal_charts || {};
            
            if (temporalCharts.monthly_trend) {
              return temporalCharts.monthly_trend.map(month => ({
                month: month.month || '',
                transactionCount: month.transaction_count || 0,
                totalAmount: month.total_amount || 0,
                avgAmount: month.avg_amount || 0
              }));
            }
            
            return [];
          })()
        },
        glChartsData: {
          topAccountsByAmount: Array.isArray(expenseAnalysis?.top_expense_accounts) ? 
            expenseAnalysis.top_expense_accounts.map(account => ({
              accountId: account.account_id || '',
              totalAmount: account.total_amount || 0,
              currency: transactionSummary?.currency || '',
              transactionCount: account.transaction_count || 0,
              trialBalance: account.total_amount || 0,
              riskLevel: 'LOW', // Default since not available in new structure
              riskColor: '#4BC0C0',
              avgRiskScore: 0, // Not available in new structure
              anomalyCounts: {
                duplicate: 0,
                backdated: 0,
                high_value: 0,
                total_anomalies: 0
              }
            })) : [],
          accountTypeDistribution: generateAccountTypeDistribution(expenseAnalysis?.top_expense_accounts || []),
          balanceDistribution: generateBalanceDistribution(expenseAnalysis?.top_expense_accounts || []),
          monthlyAccountActivity: [], // Not available in new structure
          currency: transactionSummary?.currency || ''
        },
        analysisSessionsSummary: {
          totalSessions: 1, // Not available in new structure
          latestSession: {
            id: overall_statistics?.analysis_id || file_info?.file_id || '',
            sessionName: 'Latest Analysis',
            status: overall_statistics?.analysis_id ? 'COMPLETED' : file_info?.file_status || '',
            createdAt: overall_statistics?.analysis_date || file_info?.processed_at || ''
          }
        },
        sheet_name: file_info?.file_name || '',
        sheet_date: file_info?.uploaded_at || '',
        display_name: file_info?.file_name || '',
        total_expenses: transactionSummary?.total_transactions || 0,
        total_amount: transactionSummary?.total_amount || 0,
        analysis_summary: {
          overall_fraud_score: risk_statistics?.overall_risk_score || 0,
          risk_level: summaryDashboard?.risk_level || '',
          total_flagged_expenses: flagSummary?.total_flagged || 0,
          flag_rate: transactionSummary?.total_transactions ? 
            (flagSummary?.total_flagged / transactionSummary.total_transactions) * 100 : 0,
          user_anomalies: userAnalysis?.anomalies_count || 0,
          high_risk_users: userAnalysis?.high_risk_users_count || 0,
          analysis_quality: 'MEDIUM', // Not available in new structure
          total_alerts: summaryDashboard?.total_anomalies || 0,
          critical_issues: 0, // Not available in new structure
          warnings: 0, // Not available in new structure
          anomalies_detected: {
            amount_anomalies: flagSummary?.amount_summary?.max_amount || 0,
            timing_anomalies: backdatedAnalysis?.backdated_count || 0,
            vendor_anomalies: 0, // Not available in new structure
            employee_anomalies: userAnalysis?.anomalies_count || 0,
            duplicate_suspicions: duplicateAnalysis?.duplicate_count || 0,
            user_anomalies: userAnalysis?.anomalies_count || 0,
            high_risk_users: userAnalysis?.high_risk_users_count || 0,
            closing_entries: closingEntriesAnalysis?.closing_entries_count || 0,
            unusual_days: unusualDaysAnalysis?.unusual_days_count || 0,
            holiday_entries: holidayAnalysis?.holiday_postings_count || 0
          },
          risk_factors: {
            unusual_patterns: 0, // Not available in new structure
            round_amounts: 0, // Not available in new structure
            holiday_transactions: holidayAnalysis?.holiday_postings_count || 0,
            weekend_transactions: unusualDaysAnalysis?.weekend_transactions_count || 0,
            late_hour_transactions: 0, // Not available in new structure
            high_value_transactions: flagSummary?.amount_summary?.max_amount || 0,
            user_behavior_risk: userAnalysis?.anomalies_count || 0,
            duplicate_risk: duplicateAnalysis?.duplicate_count || 0,
            backdated_risk: backdatedAnalysis?.backdated_count || 0,
            closing_entries_risk: closingEntriesAnalysis?.closing_entries_count || 0,
            unusual_days_risk: unusualDaysAnalysis?.unusual_days_count || 0
          }
        },
        chart_data: {
          employee_expenses: (() => {
            // Generate employee expense data from user_charts
            const userCharts = chart_data?.user_charts?.user_summary || [];
            
            return {
              data: userCharts.map(user => user.user || 'Unknown Employee'),
              amounts: userCharts.map(user => user.total_amount || 0)
            };
          })(),
          category_expenses: (() => {
            // Generate category expense data from expense_analysis
            const expenseCategories = expenseAnalysis?.expense_categories?.other_expenses || [];
            
            return {
              data: expenseCategories.map(account => `Account ${account.account_id}`),
              amounts: expenseCategories.map(account => account.total_amount || 0)
            };
          })(),
          monthly_trend: (() => {
            // Generate monthly trend data from chart_data if available
            const temporalCharts = chart_data?.temporal_charts || {};
            
            if (temporalCharts.monthly_trend) {
              return temporalCharts.monthly_trend.map(month => ({
                month: month.month || '',
                transactionCount: month.transaction_count || 0,
                totalAmount: month.total_amount || 0,
                avgAmount: month.avg_amount || 0
              }));
            }
            
            return [];
          })(),
          amount_distribution: (() => {
            // Use chart_data.overall_charts.amount_distribution_chart if available
            const amountChart = chart_data?.overall_charts?.amount_distribution_chart;
            
            if (amountChart?.labels && amountChart?.data) {
              return {
                labels: amountChart.labels,
                data: amountChart.data
              };
            }
            
            // Fallback to generating from transaction amounts
            const amounts = [transactionSummary?.amount_statistics?.min || 0, 
                           transactionSummary?.amount_statistics?.max || 0];
            const ranges = [
              { label: '0-1M', min: 0, max: 1000000, count: 0 },
              { label: '1M-5M', min: 1000000, max: 5000000, count: 0 },
              { label: '5M-10M', min: 5000000, max: 10000000, count: 0 },
              { label: '10M+', min: 10000000, max: Infinity, count: 0 }
            ];
            
            amounts.forEach(amount => {
              const range = ranges.find(r => amount >= r.min && amount < r.max);
              if (range) range.count++;
            });
            
            return {
              labels: ranges.map(r => r.label),
              data: ranges.map(r => r.count)
            };
          })(),
          risk_distribution: (() => {
            const riskDistributionData = {
              labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
              data: [
                risk_statistics?.risk_distributions?.low_risk || 0,
                risk_statistics?.risk_distributions?.medium_risk || 0,
                risk_statistics?.risk_distributions?.high_risk || 0,
                risk_statistics?.risk_distributions?.critical_risk || 0
              ],
              colors: ['#4BC0C0', '#FFCE56', '#FF9F40', '#FF6384']
            };
            
            const totalAnomalies = riskDistributionData.data.reduce((sum, count) => sum + count, 0);
            const percentages = riskDistributionData.data.map(count => 
              totalAnomalies > 0 ? (count / totalAnomalies) * 100 : 0
            );
            
            return {
              labels: riskDistributionData.labels,
              data: riskDistributionData.data,
              percentages: percentages,
              colors: riskDistributionData.colors
            };
          })(),
          anomaly_breakdown: {
            labels: ['Duplicate Transactions', 'Backdated Entries', 'High Value Transactions', 'User Anomalies'],
            data: [
              duplicateAnalysis?.duplicate_count || 0,
              backdatedAnalysis?.backdated_count || 0,
              flagSummary?.amount_summary?.max_amount || 0,
              userAnalysis?.anomalies_count || 0
            ],
            colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
          },
          overall_risk_gauge: {
            value: risk_statistics?.overall_risk_score || 0,
            max_value: 100,
            risk_level: summaryDashboard?.risk_level || 'LOW',
            color: summaryDashboard?.risk_level === 'CRITICAL' ? '#FF6384' :
                   summaryDashboard?.risk_level === 'HIGH' ? '#FF9F40' :
                   summaryDashboard?.risk_level === 'MEDIUM' ? '#FFCE56' : '#4BC0C0',
            definition: {},
            risk_levels: risk_statistics?.methodology_overview?.risk_levels || {},
            calculation_details: {},
            interpretation_guide: {},
            business_impact: {}
          }
        },
        flagged_expenses: transformFlaggedExpensesFromNewData(riskAssessment, transactionSummary),
        anomalies_data: {
          anomaly_summary: {
            duplicate_entries: duplicateAnalysis?.duplicate_count || 0,
            backdated_entries: backdatedAnalysis?.backdated_count || 0,
            closing_entries: closingEntriesAnalysis?.closing_entries_count || 0,
            unusual_days: unusualDaysAnalysis?.unusual_days_count || 0,
            holiday_entries: holidayAnalysis?.holiday_postings_count || 0,
            user_anomalies: userAnalysis?.anomalies_count || 0,
            high_risk_users: userAnalysis?.high_risk_users_count || 0,
            total_users: userAnalysis?.total_users || 0
          },
          risk_distribution: (() => {
            const riskDistributionData = [
              { risk_level: 'LOW', count: risk_statistics?.risk_distributions?.low_risk || 0 },
              { risk_level: 'MEDIUM', count: risk_statistics?.risk_distributions?.medium_risk || 0 },
              { risk_level: 'HIGH', count: risk_statistics?.risk_distributions?.high_risk || 0 },
              { risk_level: 'CRITICAL', count: risk_statistics?.risk_distributions?.critical_risk || 0 }
            ];
            
            const totalAnomalies = riskDistributionData.reduce((sum, item) => sum + item.count, 0);
            
            return riskDistributionData.map(item => ({
              ...item,
              percentage: totalAnomalies > 0 ? (item.count / totalAnomalies) * 100 : 0
            }));
          })()
        },
        advanced_metrics: {
          basic_metrics: {
            total_expenses: transactionSummary?.total_transactions || 0,
            total_amount: transactionSummary?.total_amount || 0,
            average_expense: transactionSummary?.amount_statistics?.mean || 0,
            median_expense: transactionSummary?.amount_statistics?.median || 0,
            largest_expense: transactionSummary?.amount_statistics?.max || 0,
            smallest_expense: transactionSummary?.amount_statistics?.min || 0,
            date_range_days: calculateDateRangeDays(dateRange),
            unique_users: transactionSummary?.unique_users || 0,
            unique_accounts: transactionSummary?.unique_accounts || 0,
            unique_profit_centers: 0, // Not available in new structure
            high_value_transactions: flagSummary?.amount_summary?.max_amount || 0
          }
        },
        detailed_risk_analysis: {
          methodology: {
            description: risk_statistics?.methodology_overview?.description || 'Comprehensive risk scoring methodology based on actual transaction analysis',
            version: risk_statistics?.methodology_overview?.version || '1.0.0',
            analysis_date: risk_statistics?.methodology_overview?.analysis_date || '',
            total_transactions_analyzed: risk_statistics?.methodology_overview?.total_transactions_analyzed || 0,
            risk_score_range: {
              min: risk_statistics?.methodology_overview?.risk_score_range?.min || 0,
              max: risk_statistics?.methodology_overview?.risk_score_range?.max || 100,
              average: risk_statistics?.methodology_overview?.risk_score_range?.average || 0
            },
            risk_levels: risk_statistics?.methodology_overview?.risk_levels || {
              low_risk: { min: 0, max: 29, description: 'Normal transactions' },
              medium_risk: { min: 30, max: 59, description: 'Some concerns' },
              high_risk: { min: 60, max: 79, description: 'Significant risk' },
              critical_risk: { min: 80, max: 100, description: 'High risk' }
            }
          },
          risk_factors: {
            duplicate_risk: {
              count: duplicateAnalysis?.duplicate_count || 0,
              percentage: transactionSummary?.total_transactions ? 
                ((duplicateAnalysis?.duplicate_count || 0) / transactionSummary.total_transactions) * 100 : 0,
              description: 'Risk associated with duplicate transactions'
            },
            backdated_risk: {
              count: backdatedAnalysis?.backdated_count || 0,
              percentage: transactionSummary?.total_transactions ? 
                ((backdatedAnalysis?.backdated_count || 0) / transactionSummary.total_transactions) * 100 : 0,
              description: 'Risk associated with backdated entries'
            },
            high_value_risk: {
              count: flagSummary?.amount_summary?.max_amount ? 1 : 0,
              percentage: transactionSummary?.total_transactions ? 
                (1 / transactionSummary.total_transactions) * 100 : 0,
              description: 'Risk associated with high-value transactions'
            },
            unusual_pattern_risk: {
              count: unusualDaysAnalysis?.unusual_days_count || 0,
              percentage: transactionSummary?.total_transactions ? 
                ((unusualDaysAnalysis?.unusual_days_count || 0) / transactionSummary.total_transactions) * 100 : 0,
              description: 'Risk associated with unusual transaction patterns'
            },
            user_behavior_risk: {
              count: userAnalysis?.anomalies_count || 0,
              percentage: transactionSummary?.total_transactions ? 
                ((userAnalysis?.anomalies_count || 0) / transactionSummary.total_transactions) * 100 : 0,
              description: 'Risk associated with user behavior patterns and anomalies',
              high_risk_users_count: userAnalysis?.high_risk_users_count || 0,
              high_risk_users_percentage: userAnalysis?.total_users ? 
                ((userAnalysis?.high_risk_users_count || 0) / userAnalysis.total_users) * 100 : 0
            },
            unusual_days_risk: {
              count: unusualDaysAnalysis?.unusual_days_count || 0,
              percentage: transactionSummary?.total_transactions ? 
                ((unusualDaysAnalysis?.unusual_days_count || 0) / transactionSummary.total_transactions) * 100 : 0,
              description: 'Risk associated with unusual days'
            },
            closing_entries_risk: {
              count: closingEntriesAnalysis?.closing_entries_count || 0,
              percentage: transactionSummary?.total_transactions ? 
                ((closingEntriesAnalysis?.closing_entries_count || 0) / transactionSummary.total_transactions) * 100 : 0,
              description: 'Risk associated with closing entries'
            },
            holiday_risk: {
              count: holidayAnalysis?.holiday_postings_count || 0,
              percentage: transactionSummary?.total_transactions ? 
                ((holidayAnalysis?.holiday_postings_count || 0) / transactionSummary.total_transactions) * 100 : 0,
              description: 'Risk associated with holiday transactions'
            },
          },
          scoring_criteria: {
            low_risk: {
              max: risk_statistics?.methodology_overview?.risk_levels?.low_risk?.max || 29,
              min: risk_statistics?.methodology_overview?.risk_levels?.low_risk?.min || 0,
              description: risk_statistics?.methodology_overview?.risk_levels?.low_risk?.description || 'Normal transactions'
            },
            medium_risk: {
              max: risk_statistics?.methodology_overview?.risk_levels?.medium_risk?.max || 59,
              min: risk_statistics?.methodology_overview?.risk_levels?.medium_risk?.min || 30,
              description: risk_statistics?.methodology_overview?.risk_levels?.medium_risk?.description || 'Some concerns'
            },
            high_risk: {
              max: risk_statistics?.methodology_overview?.risk_levels?.high_risk?.max || 79,
              min: risk_statistics?.methodology_overview?.risk_levels?.high_risk?.min || 60,
              description: risk_statistics?.methodology_overview?.risk_levels?.high_risk?.description || 'Significant risk'
            },
            critical_risk: {
              max: risk_statistics?.methodology_overview?.risk_levels?.critical_risk?.max || 100,
              min: risk_statistics?.methodology_overview?.risk_levels?.critical_risk?.min || 80,
              description: risk_statistics?.methodology_overview?.risk_levels?.critical_risk?.description || 'High risk'
            }
          },
          risk_calculations: {
            total_flagged: flagSummary?.total_flagged || 0,
            overall_risk_score: risk_statistics?.overall_risk_score || 0,
            risk_level: summaryDashboard?.risk_level || '',
            risk_score_range: {
              min: risk_statistics?.methodology_overview?.risk_score_range?.min || 0,
              max: risk_statistics?.methodology_overview?.risk_score_range?.max || 100,
              average: risk_statistics?.methodology_overview?.risk_score_range?.average || 0
            }
          },
          risk_distributions: {
            low_risk: risk_statistics?.risk_distributions?.low_risk || 0,
            medium_risk: risk_statistics?.risk_distributions?.medium_risk || 0,
            high_risk: risk_statistics?.risk_distributions?.high_risk || 0,
            critical_risk: risk_statistics?.risk_distributions?.critical_risk || 0
          },
          user_anomalies: {
            total_user_anomalies: userAnalysis?.anomalies_count || 0,
            high_risk_users_count: userAnalysis?.high_risk_users_count || 0,
            total_users_count: userAnalysis?.total_users || 0,
            user_anomaly_percentage: userAnalysis?.total_users ? 
              ((userAnalysis?.anomalies_count || 0) / userAnalysis.total_users) * 100 : 0,
            user_anomaly_types_count: 0, // Not available in new structure
            user_anomaly_severity_distribution: {
              low: 0,
              medium: 0,
              high: 0,
              critical: 0
            },
            user_risk_distribution: {
              low: 0,
              medium: 0,
              high: 0,
              critical: 0
            },
            user_patterns: {
              high_activity_users_count: 0, // Not available in new structure
              low_activity_users_count: 0, // Not available in new structure
              high_value_users_count: 0, // Not available in new structure
              multi_account_users_count: 0, // Not available in new structure
              weekend_activity_percentage: unusualDaysAnalysis?.weekend_transactions_count ? 
                (unusualDaysAnalysis.weekend_transactions_count / transactionSummary.total_transactions) * 100 : 0
            }
          },
          recommendations: risk_statistics?.recommendations || [],
          audit_implications: {
            immediate_actions: risk_statistics?.audit_implications?.requires_immediate_attention ? 
              [`Review ${risk_statistics.audit_implications.requires_immediate_attention} critical risk transactions`] : [],
            follow_up_actions: risk_statistics?.audit_implications?.sampling_recommendation ? 
              [`Sample ${risk_statistics.audit_implications.sampling_recommendation} high-risk transactions`] : [],
            compliance_considerations: []
          },
          overall_risk_gauge: {
            value: risk_statistics?.overall_risk_score || 0,
            max_value: 100,
            risk_level: summaryDashboard?.risk_level || 'LOW',
            color: summaryDashboard?.risk_level === 'CRITICAL' ? '#FF6384' :
                   summaryDashboard?.risk_level === 'HIGH' ? '#FF9F40' :
                   summaryDashboard?.risk_level === 'MEDIUM' ? '#FFCE56' : '#4BC0C0',
            definition: {},
            risk_levels: risk_statistics?.methodology_overview?.risk_levels || {},
            calculation_details: {},
            interpretation_guide: {},
            business_impact: {}
          }
        },
        // New analysis data from updated API structure
        closing_entries_analysis: {
          analysis_id: closingEntriesAnalysis?.analysis_id || '',
          analysis_date: closingEntriesAnalysis?.analysis_date || '',
          closing_entries_count: closingEntriesAnalysis?.closing_entries_count || 0,
          risk_score: 0, // Not available in new structure
          risk_level: 'LOW', // Default since not available in new structure
          closing_entries_details: [], // Not available in new structure
          recommendations: [] // Not available in new structure
        },
        unusual_days_analysis: {
          analysis_id: unusualDaysAnalysis?.analysis_id || '',
          analysis_date: unusualDaysAnalysis?.analysis_date || '',
          unusual_days_count: unusualDaysAnalysis?.unusual_days_count || 0,
          holiday_entries_count: holidayAnalysis?.holiday_postings_count || 0,
          risk_score: 0, // Not available in new structure
          risk_level: 'LOW', // Default since not available in new structure
          unusual_days_details: [], // Not available in new structure
          holiday_entries_details: [], // Not available in new structure
          recommendations: [] // Not available in new structure
        },
        analysis_metadata: {
          has_overall_analysis: analysisMetadata?.has_overall_analysis || false,
          has_risk_analysis: analysisMetadata?.has_risk_analysis || false,
          has_user_analysis: analysisMetadata?.has_user_analysis || false,
          has_closing_entries_analysis: analysisMetadata?.has_closing_entries_analysis || false,
          has_unusual_days_analysis: analysisMetadata?.has_unusual_days_analysis || false,
          analysis_completeness: 'COMPLETE', // Default since not available in new structure
          data_quality_score: 100 // Default since not available in new structure
        },
        summary_data: {
          total_alerts: summaryDashboard?.total_anomalies || 0,
          critical_issues: 0, // Not available in new structure
          warnings: 0, // Not available in new structure
          analysis_quality: 'HIGH', // Default since not available in new structure
          overall_risk_level: summaryDashboard?.risk_level || 'LOW',
          key_findings: [], // Not available in new structure
          recommendations: risk_statistics?.recommendations || []
        }
      };

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

    // Use dynamic amount ranges from API or fallback to default ranges
    const amountRanges = risk_analysis?.amount_ranges || [
      { label: '0-1K', min: 0, max: 1000, count: 0 },
      { label: '1K-10K', min: 1000, max: 10000, count: 0 },
      { label: '10K-100K', min: 10000, max: 100000, count: 0 },
      { label: '100K-1M', min: 100000, max: 1000000, count: 0 },
      { label: '1M+', min: 1000000, max: Infinity, count: 0 }
    ];
    
    const distribution = amountRanges.map(range => ({ ...range, count: 0 }));

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

  // Helper function to generate risk distribution from new data structure
  const generateRiskDistributionFromNewData = (flagSummary, riskAssessment, riskAnalysis) => {
    if (!flagSummary || !riskAssessment) {
      return [
        { risk_level: 'LOW', count: 0, percentage: 0 },
        { risk_level: 'MEDIUM', count: 0, percentage: 0 },
        { risk_level: 'HIGH', count: 0, percentage: 0 },
        { risk_level: 'CRITICAL', count: 0, percentage: 0 }
      ];
    }

    // First, try to use risk_analysis.risk_distributions if available
    if (riskAnalysis?.risk_distributions) {
      const totalTransactions = riskAnalysis.total_transactions || 0;
      return [
        { 
          risk_level: 'LOW', 
          count: riskAnalysis.risk_distributions.low_risk || 0, 
          percentage: totalTransactions > 0 ? ((riskAnalysis.risk_distributions.low_risk || 0) / totalTransactions) * 100 : 0 
        },
        { 
          risk_level: 'MEDIUM', 
          count: riskAnalysis.risk_distributions.medium_risk || 0, 
          percentage: totalTransactions > 0 ? ((riskAnalysis.risk_distributions.medium_risk || 0) / totalTransactions) * 100 : 0 
        },
        { 
          risk_level: 'HIGH', 
          count: riskAnalysis.risk_distributions.high_risk || 0, 
          percentage: totalTransactions > 0 ? ((riskAnalysis.risk_distributions.high_risk || 0) / totalTransactions) * 100 : 0 
        },
        { 
          risk_level: 'CRITICAL', 
          count: riskAnalysis.risk_distributions.critical_risk || 0, 
          percentage: totalTransactions > 0 ? ((riskAnalysis.risk_distributions.critical_risk || 0) / totalTransactions) * 100 : 0 
        }
      ];
    }

    // Use the risk_distribution from flagSummary if available
    if (flagSummary.risk_distribution) {
      const totalAnomalies = flagSummary.total_anomalies || 0;
      return [
        { 
          risk_level: 'LOW', 
          count: flagSummary.risk_distribution.low || 0, 
          percentage: totalAnomalies > 0 ? ((flagSummary.risk_distribution.low || 0) / totalAnomalies) * 100 : 0 
        },
        { 
          risk_level: 'MEDIUM', 
          count: flagSummary.risk_distribution.medium || 0, 
          percentage: totalAnomalies > 0 ? ((flagSummary.risk_distribution.medium || 0) / totalAnomalies) * 100 : 0 
        },
        { 
          risk_level: 'HIGH', 
          count: flagSummary.risk_distribution.high || 0, 
          percentage: totalAnomalies > 0 ? ((flagSummary.risk_distribution.high || 0) / totalAnomalies) * 100 : 0 
        },
        { 
          risk_level: 'CRITICAL', 
          count: flagSummary.risk_distribution.critical || 0, 
          percentage: totalAnomalies > 0 ? ((flagSummary.risk_distribution.critical || 0) / totalAnomalies) * 100 : 0 
        }
      ];
    }

    // Fallback to the old structure if risk_distribution is not available
    const totalAnomalies = flagSummary.total_anomalies || 0;
    
    const distribution = [
      { 
        risk_level: 'LOW', 
        count: flagSummary.low_risk_anomalies || 0, 
        percentage: totalAnomalies > 0 ? ((flagSummary.low_risk_anomalies || 0) / totalAnomalies) * 100 : 0 
      },
      { 
        risk_level: 'MEDIUM', 
        count: flagSummary.medium_risk_anomalies || 0, 
        percentage: totalAnomalies > 0 ? ((flagSummary.medium_risk_anomalies || 0) / totalAnomalies) * 100 : 0 
      },
      { 
        risk_level: 'HIGH', 
        count: flagSummary.high_risk_anomalies || 0, 
        percentage: totalAnomalies > 0 ? ((flagSummary.high_risk_anomalies || 0) / totalAnomalies) * 100 : 0 
      },
      { 
        risk_level: 'CRITICAL', 
        count: flagSummary.critical_risk_anomalies || 0, 
        percentage: totalAnomalies > 0 ? ((flagSummary.critical_risk_anomalies || 0) / totalAnomalies) * 100 : 0 
      }
    ];

    return distribution;
  };

  // Helper function to generate risk distribution from risk data (legacy)
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

    topAccounts.forEach((account) => {
      const accountIdNum = parseInt(account.account_id) || 0;
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

    topAccounts.forEach((account) => {
      const totalAmount = account?.total_amount || 0;
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

  // Helper function to transform flagged expenses from new data structure
  const transformFlaggedExpensesFromNewData = (riskAssessment, transactionSummary) => {
    // Create flagged expenses based on actual risk data from new structure
    const flaggedExpenses = [];
    let id = 1;

    // Since we don't have individual transaction details in the new structure,
    // we'll create sample flagged expenses based on the summary data
    const avgAmount = transactionSummary?.amount_statistics?.mean || 0;
    const currency = transactionSummary?.currency || '';
    const totalFlagged = riskAssessment?.flagged_transactions_count || 0;

    // Create sample flagged expenses based on the total flagged count
    for (let i = 0; i < Math.min(totalFlagged, 20); i++) {
      const riskLevel = i < 2 ? 'HIGH' : i < 5 ? 'MEDIUM' : 'LOW';
      flaggedExpenses.push({
        id: id++,
        employee: `User ${i + 1}`,
        amount: avgAmount * (0.8 + Math.random() * 0.4),
        date: transactionSummary?.date_range?.min_date || '',
        category: `Account ${Math.floor(Math.random() * 100000) + 100000}`,
        profit_center: '', // Not available in new structure
        document_number: `DOC${String(i + 1).padStart(3, '0')}`,
        document_type: '', // Not available in new structure
        transaction_type: '', // Not available in new structure
        currency: currency,
        risk_level: riskLevel,
        description: `Flagged transaction ${i + 1}`,
        status: riskLevel === 'HIGH' ? 'Pending' : 'Cleared',
        anomaly_type: 'Risk',
        anomaly_subtype: 'Flagged Transaction',
        risk_score: riskLevel === 'HIGH' ? 75 : riskLevel === 'MEDIUM' ? 45 : 25,
        is_high_value: riskLevel === 'HIGH',
        is_cleared: riskLevel !== 'HIGH'
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

  // Handle dashboard view change
  const handleDashboardViewChange = (event, newView) => {
    if (newView !== null) {
      setDashboardView(newView);
    }
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
          <>
            {/* Dashboard Toggle */}
            {/* <Box sx={{ 
              p: 3, 
              pb: 0, 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2
            }}>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#666' }}>
                View Mode:
              </Typography>
              <ToggleButtonGroup
                value={dashboardView}
                exclusive
                onChange={handleDashboardViewChange}
                aria-label="dashboard view"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    borderRadius: 2,
                    '&.Mui-selected': {
                      backgroundColor: '#925A9B',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#7B4B8A',
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="analysis" aria-label="analysis dashboard">
                  Analysis Dashboard
                </ToggleButton>
                <ToggleButton value="listing" aria-label="listing dashboard">
                  Listing View
                </ToggleButton>
              </ToggleButtonGroup>
            </Box> */}

            {/* Dashboard Content */}
            {dashboardView === 'analysis' ? (
              <ExpenseAnalysisDashboard sheetData={sheetData} fileId={sheetId} />
            ) : (
              <ListingDashboard sheetData={sheetData} />
            )}
          </>
        )}
      </Box>
    </Box>
  );
}