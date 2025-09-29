// Transform API response to UI format
export const transformApiDataToUIFormat = (apiData) => {
  if (!apiData || !apiData.test_result) {
      return {
        overall: {
          score: 0,
          status: 'NO_RESULTS',
        engagementId: apiData?.engagement_id || 'Unknown',
          completeFields: 0,
          totalFields: 0,
          criticalIssues: 0,
          totalRecords: 0
        },
        fieldAnalysis: [],
        timeSeriesData: [],
        categoryBreakdown: [],
        recommendations: [],
        testDetails: {
          glRecords: 0,
          tbRecords: 0,
          processingTime: 'N/A',
          lastUpdated: new Date().toISOString()
        },
        chartData: {},
        monthlyTrends: [],
        userAnalysis: [],
        summaryStatistics: {},
        documentStatistics: {},
        creditDebitBySubtype: [],
      noResultsMessage: 'No test results available'
      };
  }

  const testResult = apiData.test_result;
  const summary = apiData.summary || testResult.test_summary || {};
  const comprehensiveStats = testResult.comprehensive_statistics || {};

  // Transform field analysis from test steps - updated for new API format
  const fieldAnalysis = [
    {
      field: 'GL Completeness',
      completeness: testResult.step1_summary?.passed ? 100 : 0,
      records: testResult.total_gl_records || 0,
      missing: testResult.step1_summary?.passed ? 0 : 1,
      status: testResult.step1_summary?.passed ? 'PASSED' : 'FAILED',
      description: testResult.step1_summary?.description || 'GL completeness verification: Credit - Debit should equal 0 and sufficient data volume',
      explanation: testResult.step1_summary?.explanation || 'No details available'
    },
    {
      field: 'Account-wise Balance Verification',
      completeness: testResult.step2_summary?.passed ? Math.round((testResult.step2_summary?.pass_rate || 0) * 100) : 0,
      records: testResult.step2_summary?.accounts_verified || 0,
      missing: testResult.step2_summary?.accounts_failed || 0,
      status: testResult.step2_summary?.passed ? 'PASSED' : 'FAILED',
      description: testResult.step2_summary?.description || 'Account-wise balance verification: Opening + Debits - Credits = Closing for each GL account',
      explanation: testResult.step2_summary?.explanation || 'No details available'
    }
  ];

  // Transform time series data from comprehensive_statistics
  const monthlyTrendsData = comprehensiveStats?.chart_data?.monthly_trends;
  // Create time series data from actual monthly trends
  const timeSeriesData = monthlyTrendsData?.labels?.map((label, index) => ({
    date: label,
    completeness: testResult.completeness_score || summary.completeness_score || 0,
    totalAmount: monthlyTrendsData?.amounts?.[index] || 0,
    totalTransactions: monthlyTrendsData?.transaction_counts?.[index] || 0,
    debitTotal: comprehensiveStats?.document_statistics?.gl_debit_total || 0,
    creditTotal: comprehensiveStats?.document_statistics?.gl_credit_total || 0,
    totalVolume: monthlyTrendsData?.amounts?.[index] || 0,
    netAmount: comprehensiveStats?.document_statistics?.gl_net_balance || 0
  })) || [{
      date: '2025-01',
      completeness: testResult.completeness_score || summary.completeness_score || 0,
      totalAmount: monthlyTrendsData?.total_amount || 0,
      totalTransactions: monthlyTrendsData?.total_transactions || 0,
      debitTotal: comprehensiveStats?.document_statistics?.gl_debit_total || 0,
      creditTotal: comprehensiveStats?.document_statistics?.gl_credit_total || 0,
      totalVolume: monthlyTrendsData?.total_amount || 0,
      netAmount: comprehensiveStats?.document_statistics?.gl_net_balance || 0
  }];

  // Transform category breakdown using comprehensive_statistics
  const topAccounts = comprehensiveStats?.chart_data?.top_accounts;
  const categoryBreakdown = [
    { name: 'GL Completeness', value: testResult.step1_summary?.passed ? 100 : 0, color: '#3b82f6' },
    { name: 'Account Verification', value: testResult.step2_summary?.passed ? Math.round((testResult.step2_summary?.pass_rate || 0) * 100) : 0, color: '#10b981' },
    { name: 'Overall Score', value: testResult.completeness_score || 0, color: '#f59e0b' }
  ];

  // Generate recommendations based on failed tests
  const recommendations = [];
  if (!testResult.step1_summary?.passed) {
    recommendations.push({
      field: 'GL Completeness',
      issue: 'GL file completeness verification failed',
      recommendation: 'Review GL file data quality and ensure sufficient transaction volume',
      severity: 'Critical'
    });
  }
  if (!testResult.step2_summary?.passed) {
    recommendations.push({
      field: 'Account-wise Balance Verification',
      issue: `Account verification failed for ${testResult.step2_summary?.accounts_failed || 0} accounts`,
      recommendation: 'Review failed account reconciliations and verify opening/closing balances',
      severity: 'High'
    });
  }

  const passedTests = fieldAnalysis.filter(test => test.status === 'PASSED').length;
  const totalTests = fieldAnalysis.length;
  const overallScore = testResult.completeness_score || summary.completeness_score || (totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0);

  // Debug logging to verify transformation
  console.log('=== TRANSFORMATION DEBUG ===');
  console.log('API Data monthly_trends:', monthlyTrendsData);
  console.log('Transformed monthlyTrends:', monthlyTrendsData?.labels?.map((label, index) => ({
    month: label,
    total_volume: monthlyTrendsData?.amounts?.[index] || 0,
    transaction_count: monthlyTrendsData?.transaction_counts?.[index] || 0
  })));
  console.log('Top Accounts:', topAccounts);
  console.log('Enhanced Data:', comprehensiveStats?.enhanced_statistics?.chart_data_enhanced);
  console.log('Overall Score:', overallScore);
  console.log('===========================');

  return {
    overall: {
      score: overallScore,
      status: testResult.overall_status === 'COMPLETE' ? 'EXCELLENT' : overallScore >= 80 ? 'EXCELLENT' : overallScore >= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      engagementId: testResult.engagement_id || summary.engagement_id || 'Unknown',
      completeFields: passedTests,
      totalFields: totalTests,
      criticalIssues: testResult.critical_issues_count || recommendations.filter(r => r.severity === 'Critical').length,
      totalRecords: (testResult.total_gl_records || 0) + (testResult.total_tb_records || 0)
    },
    fieldAnalysis,
    timeSeriesData,
    categoryBreakdown,
    recommendations,
    testDetails: {
      glRecords: testResult.total_gl_records || 0,
      tbRecords: testResult.total_tb_records || 0,
      processingTime: testResult.processing_duration || 'Unknown',
      lastUpdated: testResult.created_at || new Date().toISOString()
    },
    chartData: {
      topAccounts: topAccounts || {},
      monthlyTrends: monthlyTrendsData || {},
      metadata: comprehensiveStats?.chart_data?.chart_metadata || {},
      enhanced: comprehensiveStats?.enhanced_statistics?.chart_data_enhanced || {}
    },
    monthlyTrends: monthlyTrendsData?.labels?.map((label, index) => ({
      month: label,
      debit_total: comprehensiveStats?.document_statistics?.gl_debit_total || 0,
      credit_total: comprehensiveStats?.document_statistics?.gl_credit_total || 0,
      total_volume: monthlyTrendsData?.amounts?.[index] || 0,
      net_amount: comprehensiveStats?.document_statistics?.gl_net_balance || 0,
      transaction_count: monthlyTrendsData?.transaction_counts?.[index] || 0,
      total_transactions: monthlyTrendsData?.transaction_counts?.[index] || 0
    })) || [{
      month: '2025-01',
      debit_total: comprehensiveStats?.document_statistics?.gl_debit_total || 0,
      credit_total: comprehensiveStats?.document_statistics?.gl_credit_total || 0,
      total_volume: monthlyTrendsData?.total_amount || 0,
      net_amount: comprehensiveStats?.document_statistics?.gl_net_balance || 0,
      transaction_count: monthlyTrendsData?.total_transactions || 0,
      total_transactions: monthlyTrendsData?.total_transactions || 0
    }],
    userAnalysis: [{
      user_name: 'Top Account',
      account_name: 'Top Account',
      debit_total: topAccounts?.total_debit_amount || 0,
      credit_total: topAccounts?.total_credit_amount || 0,
      total_volume: (topAccounts?.total_debit_amount || 0) + (topAccounts?.total_credit_amount || 0),
      net_movement: topAccounts?.net_balance || 0
    }],
    summaryStatistics: {
      total_users: comprehensiveStats?.enhanced_statistics?.basic_totals?.total_users || 0,
      most_active_user: 'N/A', // Not available in new structure
      peak_month: monthlyTrendsData?.labels?.[0] || 'N/A',
      months_covered: comprehensiveStats?.chart_data?.chart_metadata?.total_months || monthlyTrendsData?.labels?.length || 0,
      total_amount: comprehensiveStats?.enhanced_statistics?.amount_statistics?.total_debit_amount || 0,
      total_transactions: comprehensiveStats?.enhanced_statistics?.basic_totals?.total_transactions || 0,
      average_transaction_amount: comprehensiveStats?.enhanced_statistics?.amount_statistics?.mean_amount || 0,
      processing_time: testResult.processing_duration || 'Unknown'
    },
    documentStatistics: {
      total_documents: comprehensiveStats?.document_statistics?.total_documents || 0,
      unique_documents: comprehensiveStats?.document_statistics?.unique_documents || 0,
      duplicate_document_ratio: comprehensiveStats?.document_statistics?.duplicate_document_ratio || 0,
      document_types: comprehensiveStats?.document_statistics?.document_types || ['GL', 'TB'],
      largest_document_size: comprehensiveStats?.document_statistics?.largest_document_size || 'N/A',
      gl_debit_total: comprehensiveStats?.document_statistics?.gl_debit_total || 0,
      gl_credit_total: comprehensiveStats?.document_statistics?.gl_credit_total || 0,
      gl_net_balance: comprehensiveStats?.document_statistics?.gl_net_balance || 0,
      unique_accounts: comprehensiveStats?.document_statistics?.unique_accounts || 0,
      total_gl_records: comprehensiveStats?.document_statistics?.total_gl_records || 0,
      total_tb_records: comprehensiveStats?.document_statistics?.total_tb_records || 0
    },
    creditDebitBySubtype: topAccounts ? topAccounts.labels?.map((label, index) => ({
      account: label,
      debit: topAccounts.debit_amounts?.[index] || 0,
      credit: topAccounts.credit_amounts?.[index] || 0,
      net: topAccounts.net_movements?.[index] || 0
    })) || [] : [],
    // New comprehensive statistics
    comprehensiveStatistics: comprehensiveStats,
    basicTotals: comprehensiveStats?.enhanced_statistics?.basic_totals || {},
    amountStatistics: comprehensiveStats?.enhanced_statistics?.amount_statistics || {},
    dataQualityMetrics: comprehensiveStats?.enhanced_statistics?.data_quality_metrics || {},
    perAccountStatistics: comprehensiveStats?.enhanced_statistics?.per_account_statistics || {},
    auditCalculationStatistics: comprehensiveStats?.enhanced_statistics?.audit_calculation_statistics || {},
    // Additional mappings for the new API structure
    step1Summary: testResult.step1_summary || {},
    step2Summary: testResult.step2_summary || {},
    // Additional fields for banner
    engagementName: testResult.engagement_name,
    clientName: testResult.client_name,
    testTimestamp: testResult.test_timestamp,
    overallStatus: testResult.overall_status,
    totalGlRecords: testResult.total_gl_records,
    completenessScore: testResult.completeness_score,
    testsPassed: testResult.tests_passed,
    totalTests: testResult.total_tests,
    criticalIssuesCount: testResult.critical_issues_count,
    processingDuration: testResult.processing_duration
  };
};
