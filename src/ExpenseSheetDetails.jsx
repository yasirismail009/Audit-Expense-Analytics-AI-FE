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
   *   overall_analysis: { analysis_id, analysis_date, transaction_summary, flag_summary, expense_analysis, risk_assessment, critical_alerts },
   *   risk_analysis: { document_id, document_date, methodology_overview, risk_factors, scoring_criteria, risk_calculations, risk_distributions, user_anomalies, recommendations, audit_implications },
   *   user_analysis: { analysis_id, analysis_date, user_summary, user_anomalies, user_risk_assessment, user_patterns },
   *   chart_data: { risk_distribution_chart, flag_type_chart, amount_distribution_chart, overall_risk_gauge, ... },
   *   analysis_metadata: { has_overall_analysis, has_risk_analysis, has_user_analysis, has_closing_entries_analysis, has_unusual_days_analysis, analysis_completeness, data_quality_score },
   *   summary: { total_alerts, critical_issues, warnings, analysis_quality, overall_risk_level, key_findings, recommendations },
   *   closing_entries_analysis: { analysis_id, analysis_date, closing_entries_count, risk_score, risk_level, closing_entries_details, recommendations },
   *   unusual_days_analysis: { analysis_id, analysis_date, unusual_days_count, holiday_entries_count, risk_score, risk_level, unusual_days_details, holiday_entries_details, recommendations },
   *   all_gl_accounts: { summary, accounts }
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
        overall_analysis,
        risk_analysis,
        user_analysis,
        chart_data,
        analysis_metadata,
        summary,
        all_gl_accounts,
        closing_entries_analysis,
        unusual_days_analysis,
        anomalySummary
      } = apiData || {};

      // Extract nested data structures
      const transactionSummary = overall_analysis?.transaction_summary || {};
      const flagSummary = overall_analysis?.flag_summary || {};
      const expenseAnalysis = overall_analysis?.expense_analysis || {};
      const riskAssessment = overall_analysis?.risk_assessment || {};
      const criticalAlerts = overall_analysis?.critical_alerts || [];
      const allGlAccounts = all_gl_accounts || [];
      
      // Extract additional analysis data
      const closingEntriesData = closing_entries_analysis || {};
      const unusualDaysData = unusual_days_analysis || {};
      const analysisMetadata = analysis_metadata || {};
      const summaryData = summary || {};
      
      // Debug the actual structure to see where anomaly data might be



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
          highValueTransactions: flagSummary?.high_value_anomalies || 0,
          flagRate: transactionSummary?.total_transactions ? 
            (flagSummary?.total_flagged / transactionSummary.total_transactions) * 100 : 0,
          uniqueUsers: transactionSummary?.unique_users || 0,
          uniqueAccounts: transactionSummary?.unique_accounts || 0,
          uniqueProfitCenters: 0, // Not available in new structure
          avgAmount: transactionSummary?.average_transaction_amount || 0,
          minAmount: transactionSummary?.amount_statistics?.min || 0,
          maxAmount: transactionSummary?.amount_statistics?.max || 0,
          dateRange: dateRange,
          totalDebits: transactionSummary?.total_amount || 0, // Assuming all are debits
          totalCredits: 0, // Not available in new structure
          trialBalance: transactionSummary?.total_amount || 0,
          // Add risk-related statistics for banner
          riskScore: riskAssessment?.overall_risk_score || 0,
          riskLevel: riskAssessment?.risk_level || '',
          anomaliesDetected: anomalySummary?.totalAnomalies || 
                             (anomalySummary?.duplicateEntries || 0) + 
                             (anomalySummary?.userAnomalies || 0) + 
                             (anomalySummary?.backdatedEntries || 0) + 
                             (anomalySummary?.closingEntries || 0) + 
                             (anomalySummary?.unusualDays || 0) + 
                             (anomalySummary?.holidayEntries || 0) || 
                             flagSummary?.total_anomalies || 0,
          duplicatesFound: flagSummary?.duplicate_anomalies || 0,
          userAnomalies: user_analysis?.user_anomalies?.total_anomalies || 0,
          highRiskUsers: user_analysis?.user_risk_assessment?.high_risk_users_count || 0
        },
        glSummary: {
          summaryStatistics: {
            totalAccounts: allGlAccounts?.summary?.total_accounts || transactionSummary?.unique_accounts || 0,
            totalTrialBalance: allGlAccounts?.summary?.total_amount || transactionSummary?.total_amount || 0,
            totalTradingEquity: allGlAccounts?.summary?.total_amount || transactionSummary?.total_amount || 0,
            totalDebits: allGlAccounts?.summary?.total_amount || transactionSummary?.total_amount || 0,
            totalCredits: 0, // Not available in new structure
            currency: transactionSummary?.currency || '',
            debitBalanceAccounts: 0, // Not available in new structure
            creditBalanceAccounts: 0, // Not available in new structure
            zeroBalanceAccounts: 0, // Not available in new structure
            normalBalanceAccounts: 0, // Not available in new structure
            abnormalBalanceAccounts: 0, // Not available in new structure
            avgRiskScore: allGlAccounts?.summary?.avg_risk_score || 0,
            accountsWithAnomalies: allGlAccounts?.summary?.accounts_with_anomalies || 0,
            highRiskAccounts: allGlAccounts?.summary?.high_risk_accounts || 0
          },
          accounts: Array.isArray(allGlAccounts?.accounts) ? 
            allGlAccounts.accounts.map(account => ({
              accountId: account.gl_account || '',
              accountName: `Account ${account.gl_account}`,
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
              riskLevel: account.risk_level || 'LOW',
              riskColor: account.risk_color || '#4BC0C0',
              avgRiskScore: account.avg_risk_score || 0,
              anomalyCounts: account.anomaly_counts || {
                duplicate: 0,
                backdated: 0,
                high_value: 0,
                total_anomalies: 0
              }
            })) : []
        },
        anomaliesStats: {
          riskDistribution: (() => {
            // Use chart_data.risk_distribution_chart as the primary source
            const chartRiskData = chart_data?.risk_distribution_chart;
            
            if (chartRiskData?.labels && chartRiskData?.data) {
              const totalAnomalies = chartRiskData.data.reduce((sum, count) => sum + count, 0);
              return chartRiskData.labels.map((label, index) => ({
                risk_level: label,
                count: chartRiskData.data[index] || 0,
                percentage: totalAnomalies > 0 ? ((chartRiskData.data[index] || 0) / totalAnomalies) * 100 : 0
              }));
            }
            
            // Fallback to risk_analysis.risk_distributions
            const riskDistributionData = [
              { risk_level: 'LOW', count: risk_analysis?.risk_distributions?.low_risk || 0 },
              { risk_level: 'MEDIUM', count: risk_analysis?.risk_distributions?.medium_risk || 0 },
              { risk_level: 'HIGH', count: risk_analysis?.risk_distributions?.high_risk || 0 },
              { risk_level: 'CRITICAL', count: risk_analysis?.risk_distributions?.critical_risk || 0 }
            ];
            
            const totalAnomalies = riskDistributionData.reduce((sum, item) => sum + item.count, 0);
            
            return riskDistributionData.map(item => ({
              ...item,
              percentage: totalAnomalies > 0 ? (item.count / totalAnomalies) * 100 : 0
            }));
          })(),
          anomalySummary: {
            duplicateEntries: flagSummary?.duplicate_anomalies || 0,
            userAnomalies: user_analysis?.user_anomalies?.total_anomalies || 0,
            backdatedEntries: flagSummary?.backdated_anomalies || 0,
            closingEntries: closingEntriesData?.closing_entries_count || 0,
            unusualDays: unusualDaysData?.unusual_days_count || 0,
            holidayEntries: unusualDaysData?.holiday_entries_count || 0,
            totalAnomalies: flagSummary?.total_anomalies || 0,
            highRiskUsers: user_analysis?.user_risk_assessment?.high_risk_users_count || 0,
            totalUsers: user_analysis?.user_summary?.total_users || 0
          }
        },
        anomaliesAccordion: {
          duplicateEntries: anomalySummary?.duplicateEntries || 
                           flagSummary?.duplicate_anomalies || 
                           risk_analysis?.risk_factors?.duplicate_risk?.count || 
                           summaryData?.duplicate_anomalies || 0,
          userAnomalies: anomalySummary?.userAnomalies || 
                        user_analysis?.user_anomalies?.total_anomalies || 
                        risk_analysis?.risk_factors?.user_behavior_risk?.count || 
                        summaryData?.user_anomalies || 0,
          backdatedEntries: anomalySummary?.backdatedEntries || 
                           flagSummary?.backdated_anomalies || 
                           risk_analysis?.risk_factors?.backdated_risk?.count || 
                           summaryData?.backdated_anomalies || 0,
          closingEntries: anomalySummary?.closingEntries || 
                         closingEntriesData?.closing_entries_count || 
                         summaryData?.closing_entries || 0,
          unusualDays: anomalySummary?.unusualDays || 
                      unusualDaysData?.unusual_days_count || 
                      summaryData?.unusual_days || 0,
          holidayEntries: anomalySummary?.holidayEntries || 
                         unusualDaysData?.holiday_entries_count || 
                         summaryData?.holiday_entries || 0,
          totalAnomalies: anomalySummary?.totalAnomalies || 
                         flagSummary?.total_anomalies || 
                         summaryData?.total_anomalies ||
                         (anomalySummary?.duplicateEntries || 0) + 
                         (anomalySummary?.userAnomalies || 0) + 
                         (anomalySummary?.backdatedEntries || 0) + 
                         (anomalySummary?.closingEntries || 0) + 
                         (anomalySummary?.unusualDays || 0) + 
                         (anomalySummary?.holidayEntries || 0),
          highRiskUsers: anomalySummary?.highRiskUsers || 
                        user_analysis?.user_risk_assessment?.high_risk_users_count || 
                        summaryData?.high_risk_users || 0,
          totalUsers: anomalySummary?.totalUsers || 
                    user_analysis?.user_summary?.total_users || 
                    summaryData?.total_users || 0
        },
        chartsData: {
          riskDistribution: (() => {
            // Use chart_data.risk_distribution_chart as the primary source
            const chartRiskData = chart_data?.risk_distribution_chart;
            
            if (chartRiskData?.labels && chartRiskData?.data) {
              const totalAnomalies = chartRiskData.data.reduce((sum, count) => sum + count, 0);
              const percentages = chartRiskData.data.map(count => 
              totalAnomalies > 0 ? (count / totalAnomalies) * 100 : 0
            );
            

            
            return {
                labels: chartRiskData.labels,
                data: chartRiskData.data,
                percentages: percentages,
                colors: chartRiskData.colors || ['#4BC0C0', '#FFCE56', '#FF9F40', '#FF6384']
              };
            }
            
            // Fallback to risk_analysis.risk_distributions
            const fallbackData = {
              labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
              data: [
                risk_analysis?.risk_distributions?.low_risk || 0,
                risk_analysis?.risk_distributions?.medium_risk || 0,
                risk_analysis?.risk_distributions?.high_risk || 0,
                risk_analysis?.risk_distributions?.critical_risk || 0
              ],
              colors: ['#4BC0C0', '#FFCE56', '#FF9F40', '#FF6384']
            };
            
            const totalAnomalies = fallbackData.data.reduce((sum, count) => sum + count, 0);
            const percentages = fallbackData.data.map(count => 
              totalAnomalies > 0 ? (count / totalAnomalies) * 100 : 0
            );
            
            return {
              labels: fallbackData.labels,
              data: fallbackData.data,
              percentages: percentages,
              colors: fallbackData.colors
            };
          })(),
          anomalyBreakdown: {
            labels: ['Duplicate Entries', 'User Anomalies', 'Backdated Entries', 'Closing Entries', 'Unusual Days', 'Holiday Entries'],
            data: [
              anomalySummary?.duplicateEntries || flagSummary?.duplicate_anomalies || 0,
              anomalySummary?.userAnomalies || user_analysis?.user_anomalies?.total_anomalies || 0,
              anomalySummary?.backdatedEntries || flagSummary?.backdated_anomalies || 0,
              anomalySummary?.closingEntries || closingEntriesData?.closing_entries_count || 0,
              anomalySummary?.unusualDays || unusualDaysData?.unusual_days_count || 0,
              anomalySummary?.holidayEntries || unusualDaysData?.holiday_entries_count || 0
            ],
            colors: ['#FF6384', '#4BC0C0', '#36A2EB', '#FFCE56', '#9966FF', '#FF9F40']
          },
          topUsersByAmount: (() => {
            // Generate user data from high risk transactions
            const userMap = new Map();
            
            // Add users from high risk transactions
            riskAssessment?.high_risk_transactions?.forEach(transaction => {
              const userName = transaction.user_name || 'Unknown User';
              if (userMap.has(userName)) {
                userMap.get(userName).totalAmount += transaction.amount_local_currency || 0;
                userMap.get(userName).transactionCount += 1;
              } else {
                userMap.set(userName, {
                  userName: userName,
                  totalAmount: transaction.amount_local_currency || 0,
                  transactionCount: 1,
                  avgAmount: transaction.amount_local_currency || 0,
                  riskLevel: transaction.overall_risk_score >= 80 ? 'CRITICAL' : 
                           transaction.overall_risk_score >= 60 ? 'HIGH' : 
                           transaction.overall_risk_score >= 30 ? 'MEDIUM' : 'LOW'
                });
              }
            });
            
            // Convert to array and sort by total amount
            return Array.from(userMap.values())
              .map(user => ({
                ...user,
                avgAmount: user.totalAmount / user.transactionCount
              }))
              .sort((a, b) => b.totalAmount - a.totalAmount)
              .slice(0, 10);
          })(),
          topAccountsByTransactions: Array.isArray(allGlAccounts?.accounts) ? 
            allGlAccounts.accounts.map(account => ({
              glAccount: account.gl_account || '',
              transactionCount: account.transaction_count || 0,
              totalAmount: account.total_amount || 0,
              currency: transactionSummary?.currency || '',
              avgAmount: account.total_amount / (account.transaction_count || 1) || 0,
              riskLevel: account.risk_level || 'LOW',
              riskColor: account.risk_color || '#4BC0C0',
              avgRiskScore: account.avg_risk_score || 0
            })).sort((a, b) => b.transactionCount - a.transactionCount).slice(0, 10) : [],
          monthlyTransactionVolume: (() => {
            // Generate monthly data from transaction dates
            const monthlyData = {};
            
            riskAssessment?.high_risk_transactions?.forEach(transaction => {
              const date = new Date(transaction.posting_date);
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              
              if (monthlyData[monthKey]) {
                monthlyData[monthKey].transactionCount += 1;
                monthlyData[monthKey].totalAmount += transaction.amount_local_currency || 0;
              } else {
                monthlyData[monthKey] = {
                  month: monthKey,
                  transactionCount: 1,
                  totalAmount: transaction.amount_local_currency || 0,
                  avgAmount: transaction.amount_local_currency || 0
                };
              }
            });
            
            return Object.values(monthlyData)
              .map(month => ({
                ...month,
                avgAmount: month.totalAmount / month.transactionCount
              }))
              .sort((a, b) => a.month.localeCompare(b.month));
          })()
        },
        glChartsData: {
          topAccountsByAmount: Array.isArray(allGlAccounts?.accounts) ? 
            allGlAccounts.accounts.map(account => ({
              accountId: account.gl_account || '',
              totalAmount: account.total_amount || 0,
              currency: transactionSummary?.currency || '',
              transactionCount: account.transaction_count || 0,
              trialBalance: account.total_amount || 0,
              riskLevel: account.risk_level || 'LOW',
              riskColor: account.risk_color || '#4BC0C0',
              avgRiskScore: account.avg_risk_score || 0,
              anomalyCounts: account.anomaly_counts || {
                duplicate: 0,
                backdated: 0,
                high_value: 0,
                total_anomalies: 0
              }
            })) : [],
          accountTypeDistribution: generateAccountTypeDistribution(allGlAccounts?.accounts || []),
          balanceDistribution: generateBalanceDistribution(allGlAccounts?.accounts || []),
          monthlyAccountActivity: [], // Not available in new structure
          currency: transactionSummary?.currency || ''
        },
        analysisSessionsSummary: {
          totalSessions: 1, // Not available in new structure
          latestSession: {
            id: overall_analysis?.analysis_id || file_info?.file_id || '',
            sessionName: 'Latest Analysis',
            status: overall_analysis?.status || file_info?.file_status || '',
            createdAt: overall_analysis?.analysis_date || file_info?.processed_at || ''
          }
        },
        sheet_name: file_info?.file_name || '',
        sheet_date: file_info?.uploaded_at || '',
        display_name: file_info?.file_name || '',
        total_expenses: transactionSummary?.total_transactions || 0,
        total_amount: transactionSummary?.total_amount || 0,
        analysis_summary: {
          overall_fraud_score: riskAssessment?.overall_risk_score || 0,
          risk_level: riskAssessment?.risk_level || '',
          total_flagged_expenses: flagSummary?.total_flagged || 0,
          flag_rate: transactionSummary?.total_transactions ? 
            (flagSummary?.total_flagged / transactionSummary.total_transactions) * 100 : 0,
          user_anomalies: user_analysis?.user_anomalies?.total_anomalies || 0,
          high_risk_users: user_analysis?.user_risk_assessment?.high_risk_users_count || 0,
          analysis_quality: summaryData?.analysis_quality || 'MEDIUM',
          total_alerts: summaryData?.total_alerts || 0,
          critical_issues: summaryData?.critical_issues || 0,
          warnings: summaryData?.warnings || 0,
          anomalies_detected: {
            amount_anomalies: flagSummary?.high_value_anomalies || 0,
            timing_anomalies: flagSummary?.backdated_anomalies || 0,
            vendor_anomalies: 0, // Not available in new structure
            employee_anomalies: user_analysis?.user_anomalies?.total_anomalies || 0,
            duplicate_suspicions: flagSummary?.duplicate_anomalies || 0,
            user_anomalies: user_analysis?.user_anomalies?.total_anomalies || 0,
            high_risk_users: user_analysis?.user_risk_assessment?.high_risk_users_count || 0,
            closing_entries: closingEntriesData?.closing_entries_count || 0,
            unusual_days: unusualDaysData?.unusual_days_count || 0,
            holiday_entries: unusualDaysData?.holiday_entries_count || 0
          },
          risk_factors: {
            unusual_patterns: risk_analysis?.risk_factors?.unusual_pattern_risk?.count || 0,
            round_amounts: 0, // Not available in new structure
            holiday_transactions: unusualDaysData?.holiday_entries_count || 0,
            weekend_transactions: user_analysis?.user_patterns?.weekend_activity_percentage || 0,
            late_hour_transactions: 0, // Not available in new structure
            high_value_transactions: flagSummary?.high_value_anomalies || 0,
            user_behavior_risk: risk_analysis?.risk_factors?.user_behavior_risk?.count || 0,
            duplicate_risk: risk_analysis?.risk_factors?.duplicate_risk?.count || 0,
            backdated_risk: risk_analysis?.risk_factors?.backdated_risk?.count || 0,
            closing_entries_risk: closingEntriesData?.risk_score || 0,
            unusual_days_risk: unusualDaysData?.risk_score || 0
          }
        },
        chart_data: {
          employee_expenses: (() => {
            // Generate employee expense data from high risk transactions
            const employeeMap = new Map();
            
            riskAssessment?.high_risk_transactions?.forEach(transaction => {
              const employeeName = transaction.user_name || 'Unknown Employee';
              if (employeeMap.has(employeeName)) {
                employeeMap.get(employeeName).totalAmount += transaction.amount_local_currency || 0;
                employeeMap.get(employeeName).transactionCount += 1;
              } else {
                employeeMap.set(employeeName, {
                  employee: employeeName,
                  totalAmount: transaction.amount_local_currency || 0,
                  transactionCount: 1,
                  avgAmount: transaction.amount_local_currency || 0,
                  riskLevel: transaction.overall_risk_score >= 80 ? 'CRITICAL' : 
                           transaction.overall_risk_score >= 60 ? 'HIGH' : 
                           transaction.overall_risk_score >= 30 ? 'MEDIUM' : 'LOW'
                });
              }
            });
            
            const employees = Array.from(employeeMap.values())
              .map(emp => ({
                ...emp,
                avgAmount: emp.totalAmount / emp.transactionCount
              }))
              .sort((a, b) => b.totalAmount - a.totalAmount);
            
            return {
              data: employees.map(emp => emp.employee),
              amounts: employees.map(emp => emp.totalAmount)
            };
          })(),
          category_expenses: (() => {
            // Generate category expense data from GL accounts
            const categoryMap = new Map();
            
            allGlAccounts?.accounts?.forEach(account => {
              const categoryName = `Account ${account.gl_account}`;
              if (categoryMap.has(categoryName)) {
                categoryMap.get(categoryName).totalAmount += account.total_amount || 0;
                categoryMap.get(categoryName).transactionCount += account.transaction_count || 0;
              } else {
                categoryMap.set(categoryName, {
                  category: categoryName,
                  totalAmount: account.total_amount || 0,
                  transactionCount: account.transaction_count || 0,
                  avgAmount: account.total_amount / (account.transaction_count || 1) || 0
                });
              }
            });
            
            const categories = Array.from(categoryMap.values())
              .map(cat => ({
                ...cat,
                avgAmount: cat.totalAmount / cat.transactionCount
              }))
              .sort((a, b) => b.totalAmount - a.totalAmount);
            
            return {
              data: categories.map(cat => cat.category),
              amounts: categories.map(cat => cat.totalAmount)
            };
          })(),
          monthly_trend: (() => {
            // Generate monthly trend data from transaction dates
            const monthlyData = {};
            
            riskAssessment?.high_risk_transactions?.forEach(transaction => {
              const date = new Date(transaction.posting_date);
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              
              if (monthlyData[monthKey]) {
                monthlyData[monthKey].transactionCount += 1;
                monthlyData[monthKey].totalAmount += transaction.amount_local_currency || 0;
              } else {
                monthlyData[monthKey] = {
                  month: monthKey,
                  transactionCount: 1,
                  totalAmount: transaction.amount_local_currency || 0,
                  avgAmount: transaction.amount_local_currency || 0
                };
              }
            });
            
            return Object.values(monthlyData)
              .map(month => ({
                ...month,
                avgAmount: month.totalAmount / month.transactionCount
              }))
              .sort((a, b) => a.month.localeCompare(b.month));
          })(),
          amount_distribution: (() => {
            // Generate amount distribution from transaction amounts
            const amounts = riskAssessment?.high_risk_transactions?.map(t => t.amount_local_currency || 0) || [];
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
            // Use chart_data.risk_distribution_chart as the primary source
            const chartRiskData = chart_data?.risk_distribution_chart;
            
            if (chartRiskData?.labels && chartRiskData?.data) {
              const totalAnomalies = chartRiskData.data.reduce((sum, count) => sum + count, 0);
              const percentages = chartRiskData.data.map(count => 
                totalAnomalies > 0 ? (count / totalAnomalies) * 100 : 0
              );
              
              return {
                labels: chartRiskData.labels,
                data: chartRiskData.data,
                percentages: percentages,
                colors: chartRiskData.colors || ['#4BC0C0', '#FFCE56', '#FF9F40', '#FF6384']
              };
            }
            
            // Fallback to risk_analysis.risk_distributions
            const fallbackData = {
              labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
              data: [
                risk_analysis?.risk_distributions?.low_risk || 0,
                risk_analysis?.risk_distributions?.medium_risk || 0,
                risk_analysis?.risk_distributions?.high_risk || 0,
                risk_analysis?.risk_distributions?.critical_risk || 0
              ],
              colors: ['#4BC0C0', '#FFCE56', '#FF9F40', '#FF6384']
            };
            
            const totalAnomalies = fallbackData.data.reduce((sum, count) => sum + count, 0);
            const percentages = fallbackData.data.map(count => 
              totalAnomalies > 0 ? (count / totalAnomalies) * 100 : 0
            );
            
            return {
              labels: fallbackData.labels,
              data: fallbackData.data,
              percentages: percentages,
              colors: fallbackData.colors
            };
          })(),
          anomaly_breakdown: {
            labels: ['Duplicate Transactions', 'Backdated Entries', 'High Value Transactions', 'User Anomalies'],
            data: [
              flagSummary?.duplicate_anomalies || 0,
              flagSummary?.backdated_anomalies || 0,
              flagSummary?.high_value_anomalies || 0,
              user_analysis?.user_anomalies?.total_anomalies || 0
            ],
            colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
          },
          overall_risk_gauge: {
            value: riskAssessment?.overall_risk_score || chart_data?.overall_risk_gauge?.value || 0,
            max_value: chart_data?.overall_risk_gauge?.max_value || 100,
            risk_level: riskAssessment?.risk_level || chart_data?.overall_risk_gauge?.risk_level || 'LOW',
            color: riskAssessment?.risk_level === 'CRITICAL' ? '#FF6384' :
                   riskAssessment?.risk_level === 'HIGH' ? '#FF9F40' :
                   riskAssessment?.risk_level === 'MEDIUM' ? '#FFCE56' : '#4BC0C0',
            definition: chart_data?.overall_risk_gauge?.definition || {},
            risk_levels: chart_data?.overall_risk_gauge?.risk_levels || {},
            calculation_details: chart_data?.overall_risk_gauge?.calculation_details || {},
            interpretation_guide: chart_data?.overall_risk_gauge?.interpretation_guide || {},
            business_impact: chart_data?.overall_risk_gauge?.business_impact || {}
          }
        },
        flagged_expenses: transformFlaggedExpensesFromNewData(riskAssessment, transactionSummary),
        anomalies_data: {
          anomaly_summary: {
            duplicate_entries: anomalySummary?.duplicateEntries || 
                              flagSummary?.duplicate_anomalies || 
                              risk_analysis?.risk_factors?.duplicate_risk?.count || 0,
            backdated_entries: anomalySummary?.backdatedEntries || 
                              flagSummary?.backdated_anomalies || 
                              risk_analysis?.risk_factors?.backdated_risk?.count || 0,
            closing_entries: anomalySummary?.closingEntries || 
                           closingEntriesData?.closing_entries_count || 0,
            unusual_days: anomalySummary?.unusualDays || 
                         unusualDaysData?.unusual_days_count || 0,
            holiday_entries: anomalySummary?.holidayEntries || 
                           unusualDaysData?.holiday_entries_count || 0,
            user_anomalies: anomalySummary?.userAnomalies || 
                           user_analysis?.user_anomalies?.total_anomalies || 
                           risk_analysis?.risk_factors?.user_behavior_risk?.count || 0,
            high_risk_users: anomalySummary?.highRiskUsers || 
                           user_analysis?.user_risk_assessment?.high_risk_users_count || 0,
            total_users: anomalySummary?.totalUsers || 
                        user_analysis?.user_summary?.total_users || 0
          },
          risk_distribution: (() => {
            // Use chart_data.risk_distribution_chart as the primary source (corrected from risk_distribution)
            const chartRiskData = chart_data?.risk_distribution_chart;
            
            if (chartRiskData?.labels && chartRiskData?.data) {
              const totalAnomalies = chartRiskData.data.reduce((sum, count) => sum + count, 0);
              return chartRiskData.labels.map((label, index) => ({
                risk_level: label,
                count: chartRiskData.data[index] || 0,
                percentage: totalAnomalies > 0 ? ((chartRiskData.data[index] || 0) / totalAnomalies) * 100 : 0
              }));
            }
            
            // Fallback to risk_analysis.risk_distributions first, then flagSummary data
            const riskDistributionData = [
              { risk_level: 'LOW', count: risk_analysis?.risk_distributions?.low_risk || flagSummary?.risk_distribution?.low || 0 },
              { risk_level: 'MEDIUM', count: risk_analysis?.risk_distributions?.medium_risk || flagSummary?.risk_distribution?.medium || 0 },
              { risk_level: 'HIGH', count: risk_analysis?.risk_distributions?.high_risk || flagSummary?.risk_distribution?.high || 0 },
              { risk_level: 'CRITICAL', count: risk_analysis?.risk_distributions?.critical_risk || flagSummary?.risk_distribution?.critical || 0 }
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
            average_expense: transactionSummary?.average_transaction_amount || 0,
            median_expense: transactionSummary?.amount_statistics?.median || 0,
            largest_expense: transactionSummary?.amount_statistics?.max || 0,
            smallest_expense: transactionSummary?.amount_statistics?.min || 0,
            date_range_days: calculateDateRangeDays(dateRange),
            unique_users: transactionSummary?.unique_users || 0,
            unique_accounts: transactionSummary?.unique_accounts || 0,
            unique_profit_centers: 0, // Not available in new structure
            high_value_transactions: flagSummary?.high_value_anomalies || 0
          }
        },
        detailed_risk_analysis: {
          methodology: {
            description: risk_analysis?.methodology_overview?.description || 'Comprehensive risk scoring methodology based on actual transaction analysis',
            version: risk_analysis?.methodology_overview?.version || '1.0.0',
            analysis_date: risk_analysis?.methodology_overview?.analysis_date || '',
            total_transactions_analyzed: risk_analysis?.methodology_overview?.total_transactions_analyzed || 0,
            risk_score_range: {
              min: risk_analysis?.methodology_overview?.risk_score_range?.min || 0,
              max: risk_analysis?.methodology_overview?.risk_score_range?.max || 100,
              average: risk_analysis?.methodology_overview?.risk_score_range?.average || 0
            },
            risk_levels: {
              low_risk: {
                min: risk_analysis?.methodology_overview?.risk_levels?.low_risk?.min || 0,
                max: risk_analysis?.methodology_overview?.risk_levels?.low_risk?.max || 29,
                description: risk_analysis?.methodology_overview?.risk_levels?.low_risk?.description || 'Normal transactions'
              },
              medium_risk: {
                min: risk_analysis?.methodology_overview?.risk_levels?.medium_risk?.min || 30,
                max: risk_analysis?.methodology_overview?.risk_levels?.medium_risk?.max || 59,
                description: risk_analysis?.methodology_overview?.risk_levels?.medium_risk?.description || 'Some concerns'
              },
              high_risk: {
                min: risk_analysis?.methodology_overview?.risk_levels?.high_risk?.min || 60,
                max: risk_analysis?.methodology_overview?.risk_levels?.high_risk?.max || 79,
                description: risk_analysis?.methodology_overview?.risk_levels?.high_risk?.description || 'Significant risk'
              },
              critical_risk: {
                min: risk_analysis?.methodology_overview?.risk_levels?.critical_risk?.min || 80,
                max: risk_analysis?.methodology_overview?.risk_levels?.critical_risk?.max || 100,
                description: risk_analysis?.methodology_overview?.risk_levels?.critical_risk?.description || 'High risk'
              }
            }
          },
          risk_factors: {
            duplicate_risk: {
              count: risk_analysis?.risk_factors?.duplicate_risk?.count || 0,
              percentage: risk_analysis?.risk_factors?.duplicate_risk?.percentage || 0,
              description: risk_analysis?.risk_factors?.duplicate_risk?.description || 'Risk associated with duplicate transactions'
            },
            backdated_risk: {
              count: risk_analysis?.risk_factors?.backdated_risk?.count || 0,
              percentage: risk_analysis?.risk_factors?.backdated_risk?.percentage || 0,
              description: risk_analysis?.risk_factors?.backdated_risk?.description || 'Risk associated with backdated entries'
            },
            high_value_risk: {
              count: risk_analysis?.risk_factors?.high_value_risk?.count || 0,
              percentage: risk_analysis?.risk_factors?.high_value_risk?.percentage || 0,
              description: risk_analysis?.risk_factors?.high_value_risk?.description || 'Risk associated with high-value transactions'
            },
            unusual_pattern_risk: {
              count: risk_analysis?.risk_factors?.unusual_pattern_risk?.count || 0,
              percentage: risk_analysis?.risk_factors?.unusual_pattern_risk?.percentage || 0,
              description: risk_analysis?.risk_factors?.unusual_pattern_risk?.description || 'Risk associated with unusual transaction patterns'
            },
            user_behavior_risk: {
              count: risk_analysis?.risk_factors?.user_behavior_risk?.count || 0,
              percentage: risk_analysis?.risk_factors?.user_behavior_risk?.percentage || 0,
              description: risk_analysis?.risk_factors?.user_behavior_risk?.description || 'Risk associated with user behavior patterns and anomalies',
              high_risk_users_count: risk_analysis?.risk_factors?.user_behavior_risk?.high_risk_users_count || 0,
              high_risk_users_percentage: risk_analysis?.risk_factors?.user_behavior_risk?.high_risk_users_percentage || 0
            },
            unusual_days_risk: {
              count: risk_analysis?.risk_factors?.unusual_days_risk?.count || 0,
              percentage: risk_analysis?.risk_factors?.unusual_days_risk?.percentage || 0,
              description: risk_analysis?.risk_factors?.unusual_days_risk?.description || 'Risk associated with unusual days'
            },
            closing_entries_risk: {
              count: risk_analysis?.risk_factors?.closing_entries_risk?.count || 0,
              percentage: risk_analysis?.risk_factors?.closing_entries_risk?.percentage || 0,
              description: risk_analysis?.risk_factors?.closing_entries_risk?.description || 'Risk associated with closing entries'
            },
          },
          scoring_criteria: {
            low_risk: {
              max: risk_analysis?.scoring_criteria?.low_risk?.max || 29,
              min: risk_analysis?.scoring_criteria?.low_risk?.min || 0,
              description: risk_analysis?.scoring_criteria?.low_risk?.description || 'Normal transactions'
            },
            medium_risk: {
              max: risk_analysis?.scoring_criteria?.medium_risk?.max || 59,
              min: risk_analysis?.scoring_criteria?.medium_risk?.min || 30,
              description: risk_analysis?.scoring_criteria?.medium_risk?.description || 'Some concerns'
            },
            high_risk: {
              max: risk_analysis?.scoring_criteria?.high_risk?.max || 79,
              min: risk_analysis?.scoring_criteria?.high_risk?.min || 60,
              description: risk_analysis?.scoring_criteria?.high_risk?.description || 'Significant risk'
            },
            critical_risk: {
              max: risk_analysis?.scoring_criteria?.critical_risk?.max || 100,
              min: risk_analysis?.scoring_criteria?.critical_risk?.min || 80,
              description: risk_analysis?.scoring_criteria?.critical_risk?.description || 'High risk'
            }
          },
          risk_calculations: {
            total_flagged: risk_analysis?.risk_calculations?.total_flagged || 0,
            overall_risk_score: risk_analysis?.risk_calculations?.overall_risk_score || 0,
            risk_level: risk_analysis?.risk_calculations?.risk_level || '',
            risk_score_range: {
              min: risk_analysis?.risk_calculations?.risk_score_range?.min || 0,
              max: risk_analysis?.risk_calculations?.risk_score_range?.max || 100,
              average: risk_analysis?.risk_calculations?.risk_score_range?.average || 0
            }
          },
          risk_distributions: {
            low_risk: risk_analysis?.risk_distributions?.low_risk || 0,
            medium_risk: risk_analysis?.risk_distributions?.medium_risk || 0,
            high_risk: risk_analysis?.risk_distributions?.high_risk || 0,
            critical_risk: risk_analysis?.risk_distributions?.critical_risk || 0
          },
          user_anomalies: {
            total_user_anomalies: user_analysis?.user_anomalies?.total_anomalies || 0,
            high_risk_users_count: user_analysis?.user_risk_assessment?.high_risk_users_count || 0,
            total_users_count: user_analysis?.user_summary?.total_users || 0,
            user_anomaly_percentage: user_analysis?.user_anomalies?.user_anomaly_percentage || 0,
            user_anomaly_types_count: user_analysis?.user_anomalies?.anomaly_types_count || 0,
            user_anomaly_severity_distribution: user_analysis?.user_anomalies?.anomaly_severity_distribution || {
              low: 0,
              medium: 0,
              high: 0,
              critical: 0
            },
            user_risk_distribution: user_analysis?.user_risk_assessment?.risk_distribution || {
              low: 0,
              medium: 0,
              high: 0,
              critical: 0
            },
            user_patterns: {
              high_activity_users_count: user_analysis?.user_patterns?.high_activity_users_count || 0,
              low_activity_users_count: user_analysis?.user_patterns?.low_activity_users_count || 0,
              high_value_users_count: user_analysis?.user_patterns?.high_value_users_count || 0,
              multi_account_users_count: user_analysis?.user_patterns?.multi_account_users_count || 0,
              weekend_activity_percentage: user_analysis?.user_patterns?.weekend_activity_percentage || 0
            }
          },
          recommendations: risk_analysis?.recommendations || [],
          audit_implications: {
            immediate_actions: risk_analysis?.audit_implications?.immediate_actions || [],
            follow_up_actions: risk_analysis?.audit_implications?.follow_up_actions || [],
            compliance_considerations: risk_analysis?.audit_implications?.compliance_considerations || []
          },
          overall_risk_gauge: {
            value: riskAssessment?.overall_risk_score || chart_data?.overall_risk_gauge?.value || 0,
            max_value: chart_data?.overall_risk_gauge?.max_value || 100,
            risk_level: riskAssessment?.risk_level || chart_data?.overall_risk_gauge?.risk_level || '',
            color: riskAssessment?.risk_level === 'CRITICAL' ? '#FF6384' :
                   riskAssessment?.risk_level === 'HIGH' ? '#FF9F40' :
                   riskAssessment?.risk_level === 'MEDIUM' ? '#FFCE56' : '#4BC0C0',
            definition: chart_data?.overall_risk_gauge?.definition || {},
            risk_levels: chart_data?.overall_risk_gauge?.risk_levels || {},
            calculation_details: chart_data?.overall_risk_gauge?.calculation_details || {},
            interpretation_guide: chart_data?.overall_risk_gauge?.interpretation_guide || {},
            business_impact: chart_data?.overall_risk_gauge?.business_impact || {}
          }
        },
        // New analysis data from updated API structure
        closing_entries_analysis: {
          analysis_id: closingEntriesData?.analysis_id || '',
          analysis_date: closingEntriesData?.analysis_date || '',
          closing_entries_count: closingEntriesData?.closing_entries_count || 0,
          risk_score: closingEntriesData?.risk_score || 0,
          risk_level: closingEntriesData?.risk_level || 'LOW',
          closing_entries_details: closingEntriesData?.closing_entries_details || [],
          recommendations: closingEntriesData?.recommendations || []
        },
        unusual_days_analysis: {
          analysis_id: unusualDaysData?.analysis_id || '',
          analysis_date: unusualDaysData?.analysis_date || '',
          unusual_days_count: unusualDaysData?.unusual_days_count || 0,
          holiday_entries_count: unusualDaysData?.holiday_entries_count || 0,
          risk_score: unusualDaysData?.risk_score || 0,
          risk_level: unusualDaysData?.risk_level || 'LOW',
          unusual_days_details: unusualDaysData?.unusual_days_details || [],
          holiday_entries_details: unusualDaysData?.holiday_entries_details || [],
          recommendations: unusualDaysData?.recommendations || []
        },
        analysis_metadata: {
          has_overall_analysis: analysisMetadata?.has_overall_analysis || false,
          has_risk_analysis: analysisMetadata?.has_risk_analysis || false,
          has_user_analysis: analysisMetadata?.has_user_analysis || false,
          has_closing_entries_analysis: analysisMetadata?.has_closing_entries_analysis || false,
          has_unusual_days_analysis: analysisMetadata?.has_unusual_days_analysis || false,
          analysis_completeness: analysisMetadata?.analysis_completeness || 'PARTIAL',
          data_quality_score: analysisMetadata?.data_quality_score || 0
        },
        summary_data: {
          total_alerts: summaryData?.total_alerts || 0,
          critical_issues: summaryData?.critical_issues || 0,
          warnings: summaryData?.warnings || 0,
          analysis_quality: summaryData?.analysis_quality || 'MEDIUM',
          overall_risk_level: summaryData?.overall_risk_level || 'LOW',
          key_findings: summaryData?.key_findings || [],
          recommendations: summaryData?.recommendations || []
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
      const accountIdNum = parseInt(account.gl_account) || 0;
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

    const highRiskTransactions = riskAssessment?.high_risk_transactions || [];
    const avgAmount = transactionSummary?.average_transaction_amount || 0;
    const currency = transactionSummary?.currency || '';

    // Add high-risk transactions from the risk assessment
    highRiskTransactions.forEach((transaction, index) => {
      flaggedExpenses.push({
        id: id++,
        employee: transaction.user_name || `User ${index + 1}`,
        amount: transaction.amount_local_currency || avgAmount,
        date: transaction.posting_date || '',
        category: transaction.gl_account || '',
        profit_center: '', // Not available in new structure
        document_number: transaction.document_number || `DOC${String(index + 1).padStart(3, '0')}`,
        document_type: '', // Not available in new structure
        transaction_type: '', // Not available in new structure
        currency: currency,
        risk_level: transaction.overall_risk_score >= 80 ? 'CRITICAL' : 
                   transaction.overall_risk_score >= 60 ? 'HIGH' : 
                   transaction.overall_risk_score >= 30 ? 'MEDIUM' : 'LOW',
        description: `High-risk transaction with score ${transaction.overall_risk_score}`,
        status: transaction.overall_risk_score >= 60 ? 'Pending' : 'Cleared',
        anomaly_type: 'Risk',
        anomaly_subtype: 'High Risk Transaction',
        risk_score: transaction.overall_risk_score || 0,
        is_high_value: transaction.overall_risk_score >= 60,
        is_cleared: transaction.overall_risk_score < 60
      });
    });

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
              <ExpenseAnalysisDashboard sheetData={sheetData} />
            ) : (
              <ListingDashboard sheetData={sheetData} />
            )}
          </>
        )}
      </Box>
    </Box>
  );
}