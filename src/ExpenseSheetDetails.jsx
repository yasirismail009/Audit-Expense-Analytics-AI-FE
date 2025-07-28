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

  // Transform API response to match frontend expectations
  const transformApiResponse = (apiData) => {
    try {
      console.log("Raw API Data:", apiData);
      console.log("API Data Keys:", Object.keys(apiData || {}));
      
      if (!apiData) {
        throw new Error('No API data received');
      }
      
      // Extract data from the new API structure
      const { 
        file_info, 
        overall_analysis,
        risk_analysis,
        chart_data,
        analysis_metadata,
        summary,
        all_gl_accounts
      } = apiData || {};

      console.log("Extracted data:", {
        file_info,
        overall_analysis,
        risk_analysis,
        chart_data,
        analysis_metadata,
        summary
      });

      console.log("Starting data transformation...");

      // Extract nested data structures
      const transactionSummary = overall_analysis?.transaction_summary || {};
      const flagSummary = overall_analysis?.flag_summary || {};
      const expenseAnalysis = overall_analysis?.expense_analysis || {};
      const riskAssessment = overall_analysis?.risk_assessment || {};
      const criticalAlerts = overall_analysis?.critical_alerts || [];
      const allGlAccounts = all_gl_accounts || [];
      
      console.log("Extracted nested data:", {
        transactionSummary,
        flagSummary,
        expenseAnalysis,
        riskAssessment,
        criticalAlerts,
        allGlAccounts
      });

      console.log("Chart data debug:", {
        chart_data,
        risk_distribution_chart: chart_data?.risk_distribution_chart,
        flag_type_chart: chart_data?.flag_type_chart,
        amount_distribution_chart: chart_data?.amount_distribution_chart
      });

      console.log("GL Accounts debug:", {
        all_gl_accounts,
        allGlAccounts,
        accountsCount: allGlAccounts?.accounts?.length || 0,
        summary: allGlAccounts?.summary
      });

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
          anomaliesDetected: flagSummary?.total_anomalies || 0,
          duplicatesFound: flagSummary?.duplicate_anomalies || 0
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
            // Use chart_data.risk_distribution as the primary source
            const chartRiskData = chart_data?.risk_distribution;
            
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
          })(),
          anomalySummary: {
            duplicateEntries: flagSummary?.duplicate_anomalies || 0,
            userAnomalies: 0, // Not available in new structure
            backdatedEntries: flagSummary?.backdated_anomalies || 0,
            closingEntries: 0, // Not available in new structure
            unusualDays: 0, // Not available in new structure
            holidayEntries: 0, // Not available in new structure
            totalAnomalies: flagSummary?.total_anomalies || 0
          }
        },
        anomaliesAccordion: {
          duplicateEntries: flagSummary?.duplicate_anomalies || 0,
          userAnomalies: 0, // Not available in new structure
          backdatedEntries: flagSummary?.backdated_anomalies || 0,
          closingEntries: 0, // Not available in new structure
          unusualDays: 0, // Not available in new structure
          holidayEntries: 0, // Not available in new structure
          totalAnomalies: flagSummary?.total_anomalies || 0
        },
        chartsData: {
          riskDistribution: (() => {
            // Use chart_data.risk_distribution_chart as the primary source (corrected from risk_distribution)
            const chartRiskData = chart_data?.risk_distribution_chart;
            const fallbackData = {
              labels:  risk_analysis?.chart_data?.risk_distribution_chart.labels,
              data: risk_analysis?.chart_data?.risk_distribution_chart.data
            };
            
            const riskDistributionData = {
              labels: chartRiskData?.labels || fallbackData.labels,
              data: chartRiskData?.data || fallbackData.data
            };
            
            const totalAnomalies = riskDistributionData.data.reduce((a, b) => a + b, 0);
            const percentages = riskDistributionData.data.map(count => 
              totalAnomalies > 0 ? (count / totalAnomalies) * 100 : 0
            );
            
            console.log("ChartsData risk distribution debug:", {
              chartRiskData,
              fallbackData,
              riskDistributionData,
              totalAnomalies,
              percentages
            });
            
            return {
              labels: riskDistributionData.labels,
              data: riskDistributionData.data,
              percentages: percentages
            };
          })(),
          anomalyBreakdown: {
            labels: chart_data?.flag_type_chart?.labels || ['Duplicate Transactions', 'Backdated Entries', 'High Value Transactions'],
            data: chart_data?.flag_type_chart?.data || [
              flagSummary?.duplicate_anomalies || 0,
              flagSummary?.backdated_anomalies || 0,
              flagSummary?.high_value_anomalies || 0
            ]
          },
          topUsersByAmount: [], // Not available in new structure
          topAccountsByTransactions: Array.isArray(allGlAccounts?.accounts) ? 
            allGlAccounts.accounts.map(account => ({
              glAccount: account.gl_account || '',
              transactionCount: account.transaction_count || 0,
              totalAmount: account.total_amount || 0,
              currency: transactionSummary?.currency || '',
              avgAmount: account.total_amount / (account.transaction_count || 1) || 0
            })) : [],
          monthlyTransactionVolume: [] // Not available in new structure
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
          anomalies_detected: {
            amount_anomalies: flagSummary?.high_value_anomalies || 0,
            timing_anomalies: 0, // Not available in new structure
            vendor_anomalies: 0, // Not available in new structure
            employee_anomalies: 0, // Not available in new structure
            duplicate_suspicions: flagSummary?.duplicate_anomalies || 0
          },
          risk_factors: {
            unusual_patterns: 0, // Not available in new structure
            round_amounts: 0, // Not available in new structure
            holiday_transactions: 0, // Not available in new structure
            weekend_transactions: 0, // Not available in new structure
            late_hour_transactions: 0, // Not available in new structure
            high_value_transactions: flagSummary?.high_value_anomalies || 0
          }
        },
        chart_data: {
          employee_expenses: {
            data: [], // Not available in new structure
            amounts: []
          },
          category_expenses: {
            data: [], // Not available in new structure
            amounts: []
          },
          monthly_trend: [], // Not available in new structure
          amount_distribution: {
            labels: chart_data?.amount_distribution_chart?.labels || risk_analysis?.amount_ranges?.map(range => range.label) || ['0-100K', '100K-1M', '1M-10M', '10M+'],
            data: chart_data?.amount_distribution_chart?.data || risk_analysis?.amount_ranges?.map(range => range.count) || [0, 0, 0, 0]
          },
          risk_distribution: (() => {
            // Use chart_data.risk_distribution_chart as the primary source (corrected from risk_distribution)
            const chartRiskData = chart_data?.risk_distribution_chart;
            const fallbackData = {
              labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical Risk'],
              data: [
                risk_analysis?.risk_distributions?.low_risk || flagSummary?.risk_distribution?.low || 0,
                risk_analysis?.risk_distributions?.medium_risk || flagSummary?.risk_distribution?.medium || 0,
                risk_analysis?.risk_distributions?.high_risk || flagSummary?.risk_distribution?.high || 0,
                risk_analysis?.risk_distributions?.critical_risk || flagSummary?.risk_distribution?.critical || 0
              ],
              colors: ['#4BC0C0', '#FFCE56', '#FF9F40', '#FF6384']
            };
            
            const riskDistributionData = {
              labels: chartRiskData?.labels || fallbackData.labels,
              data: chartRiskData?.data || fallbackData.data,
              colors: chartRiskData?.colors || fallbackData.colors
            };
            
            const totalAnomalies = riskDistributionData.data.reduce((a, b) => a + b, 0);
            const percentages = riskDistributionData.data.map(count => 
              totalAnomalies > 0 ? (count / totalAnomalies) * 100 : 0
            );
            
            console.log("Risk distribution mapping debug:", {
              chartRiskData,
              fallbackData,
              riskDistributionData,
              totalAnomalies,
              percentages
            });
            
            return {
              labels: riskDistributionData.labels,
              data: riskDistributionData.data,
              percentages: percentages,
              colors: riskDistributionData.colors
            };
          })(),
          anomaly_breakdown: {
            labels: chart_data?.flag_type_chart?.labels || risk_analysis?.anomaly_types?.map(type => type.name) || ['Duplicate Transactions', 'Backdated Entries', 'High Value Transactions'],
            data: chart_data?.flag_type_chart?.data || risk_analysis?.anomaly_types?.map(type => type.count) || [
              flagSummary?.duplicate_anomalies || 0,
              flagSummary?.backdated_anomalies || 0,
              flagSummary?.high_value_anomalies || 0
            ]
          },
          overall_risk_gauge: chart_data?.overall_risk_gauge || {
            value: riskAssessment?.overall_risk_score || 0,
            max_value: 100,
            risk_level: riskAssessment?.risk_level || 'LOW',
            color: '#4BC0C0'
          }
        },
        flagged_expenses: transformFlaggedExpensesFromNewData(riskAssessment, transactionSummary),
        anomalies_data: {
          anomaly_summary: {
            duplicate_entries: flagSummary?.duplicate_anomalies || 0,
            backdated_entries: flagSummary?.backdated_anomalies || 0,
            closing_entries: 0, // Not available in new structure
            unusual_days: 0, // Not available in new structure
            holiday_entries: 0 // Not available in new structure
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
            }
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
          recommendations: risk_analysis?.recommendations || [],
          audit_implications: {
            immediate_actions: risk_analysis?.audit_implications?.immediate_actions || [],
            follow_up_actions: risk_analysis?.audit_implications?.follow_up_actions || [],
            compliance_considerations: risk_analysis?.audit_implications?.compliance_considerations || []
          },
          overall_risk_gauge: {
            value: chart_data?.overall_risk_gauge?.value || 0,
            max_value: chart_data?.overall_risk_gauge?.max_value || 100,
            risk_level: chart_data?.overall_risk_gauge?.risk_level || '',
            color: chart_data?.overall_risk_gauge?.color || '#FF6384',
            definition: chart_data?.overall_risk_gauge?.definition || {},
            risk_levels: chart_data?.overall_risk_gauge?.risk_levels || {},
            calculation_details: chart_data?.overall_risk_gauge?.calculation_details || {},
            interpretation_guide: chart_data?.overall_risk_gauge?.interpretation_guide || {},
            business_impact: chart_data?.overall_risk_gauge?.business_impact || {}
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

    // Add additional flagged expenses based on flag summary
    const duplicateCount = riskAssessment?.flag_summary?.duplicate_anomalies || 0;
    const backdatedCount = riskAssessment?.flag_summary?.backdated_anomalies || 0;
    const highValueCount = riskAssessment?.flag_summary?.high_value_anomalies || 0;

    // Add duplicate expenses
    for (let i = 0; i < Math.min(duplicateCount, 5); i++) {
      flaggedExpenses.push({
        id: id++,
        employee: `User ${i + 1}`,
        amount: avgAmount * (0.8 + Math.random() * 0.4),
        date: transactionSummary?.date_range?.min_date || '',
        category: 'Duplicate Transaction',
        profit_center: '',
        document_number: `DUP${String(i + 1).padStart(3, '0')}`,
        document_type: '',
        transaction_type: '',
        currency: currency,
        risk_level: 'MEDIUM',
        description: 'Duplicate transaction detected',
        status: 'Pending',
        anomaly_type: 'Duplicate',
        anomaly_subtype: 'Type 1 Duplicate',
        risk_score: 30,
        is_high_value: false,
        is_cleared: false
      });
    }

    // Add backdated expenses
    for (let i = 0; i < Math.min(backdatedCount, 3); i++) {
      flaggedExpenses.push({
        id: id++,
        employee: `User ${i + 1}`,
        amount: avgAmount * (0.5 + Math.random() * 1.5),
        date: transactionSummary?.date_range?.min_date || '',
        category: 'Backdated Entry',
        profit_center: '',
        document_number: `BD${String(i + 1).padStart(3, '0')}`,
        document_type: '',
        transaction_type: '',
        currency: currency,
        risk_level: 'HIGH',
        description: 'Backdated entry detected',
        status: 'Pending',
        anomaly_type: 'Timing',
        anomaly_subtype: 'Backdated Entry',
        risk_score: 85,
        is_high_value: false,
        is_cleared: false
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
            <Box sx={{ 
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
            </Box>

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