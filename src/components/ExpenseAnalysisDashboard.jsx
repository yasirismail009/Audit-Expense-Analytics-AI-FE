import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, Alert } from '@mui/material';
import DepartmentExpensesChart from './charts/DepartmentExpensesChart';
import CategoryExpensesChart from './charts/CategoryExpensesChart';
import MonthlyTrendChart from './charts/MonthlyTrendChart';
import EmployeeExpensesChart from './charts/EmployeeExpensesChart';
import RiskDistributionChart from './charts/RiskDistributionChart';
import AmountDistributionChart from './charts/AmountDistributionChart';
import PaymentMethodsChart from './charts/PaymentMethodsChart';
import VendorExpensesChart from './charts/VendorExpensesChart';
import ExpenseBreakdownChart from './charts/ExpenseBreakdownChart';
import FraudInsightsChart from './charts/FraudInsightsChart';
import FlaggedExpensesChart from './charts/FlaggedExpensesChart';
import SummaryInsightsChart from './charts/SummaryInsightsChart';
import AdvancedMetricsChart from './charts/AdvancedMetricsChart';
import ExpenseComplexityChart from './charts/ExpenseComplexityChart';
import TimingAnomalyChart from './charts/TimingAnomalyChart';
import BasicMetricsWidget from './charts/BasicMetricsWidget';
import { colorScheme, getRiskColor, getColorByIndex } from '../utils/colorScheme';

export default function ExpenseAnalysisDashboard({ sheetData }) {
  if (!sheetData) return null;

  const { 
    sheet_name, 
    sheet_date, 
    display_name, 
    total_expenses, 
    total_amount, 
    analysis_summary,
    chart_data,
    flagged_expenses,
    advanced_metrics
  } = sheetData;

  // Calculate risk distribution from flagged expenses
  const calculateRiskDistribution = () => {
    if (!flagged_expenses || flagged_expenses.length === 0) {
      return {
        labels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        data: [0, 0, 0, 0],
        colors: ['#4BC0C0', '#FFCE56', '#FF9F40', '#FF6384']
      };
    }

    const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    
    flagged_expenses.forEach(expense => {
      const riskLevel = expense.risk_level || 'LOW';
      riskCounts[riskLevel] = (riskCounts[riskLevel] || 0) + 1;
    });

    return {
      labels: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      data: [riskCounts.LOW, riskCounts.MEDIUM, riskCounts.HIGH, riskCounts.CRITICAL],
      colors: ['#4BC0C0', '#FFCE56', '#FF9F40', '#FF6384']
    };
  };

  // Calculate employee expenses from flagged expenses if chart data is not available
  const calculateEmployeeExpenses = () => {
    // First priority: use chart_data.employee_expenses if available
    if (chart_data?.employee_expenses?.labels && chart_data?.employee_expenses?.data) {
      return chart_data.employee_expenses;
    }

    // Second priority: calculate from expense complexity scores
    if (advanced_metrics?.expense_complexity_scores && advanced_metrics.expense_complexity_scores.length > 0) {
      const employeeMap = new Map();
      
      advanced_metrics.expense_complexity_scores.forEach(expense => {
        const employee = expense.employee || 'Unknown';
        const amount = parseFloat(expense.amount) || 0;
        
        if (employeeMap.has(employee)) {
          employeeMap.set(employee, employeeMap.get(employee) + amount);
        } else {
          employeeMap.set(employee, amount);
        }
      });

      const sortedEmployees = Array.from(employeeMap.entries())
        .sort((a, b) => b[1] - a[1]);

      return {
        labels: sortedEmployees.map(([employee]) => employee),
        data: sortedEmployees.map(([, amount]) => amount),
        colors: sortedEmployees.map((_, index) => getColorByIndex(index))
      };
    }

    // Third priority: calculate from flagged expenses
    if (flagged_expenses && flagged_expenses.length > 0) {
      const employeeMap = new Map();
      
      flagged_expenses.forEach(expense => {
        const employee = expense.employee || 'Unknown';
        const amount = parseFloat(expense.amount) || 0;
        
        if (employeeMap.has(employee)) {
          employeeMap.set(employee, employeeMap.get(employee) + amount);
        } else {
          employeeMap.set(employee, amount);
        }
      });

      const sortedEmployees = Array.from(employeeMap.entries())
        .sort((a, b) => b[1] - a[1]);

      return {
        labels: sortedEmployees.map(([employee]) => employee),
        data: sortedEmployees.map(([, amount]) => amount),
        colors: sortedEmployees.map((_, index) => getColorByIndex(index))
      };
    }

    // Fourth priority: use vendor loyalty index from advanced metrics
    if (advanced_metrics?.vendor_loyalty_index && advanced_metrics.vendor_loyalty_index.length > 0) {
      const employees = advanced_metrics.vendor_loyalty_index.map(item => item.employee);
      // Since we don't have amounts, we'll use the VLI score as a proxy
      const data = advanced_metrics.vendor_loyalty_index.map(item => item.vli_score * 1000); // Scale for visualization
      
      return {
        labels: employees,
        data: data,
        colors: employees.map((_, index) => getColorByIndex(index))
      };
    }

    return null;
  };

  // Enhanced chart data with proper mapping
  const enhancedChartData = {
    ...chart_data,
    risk_distribution: calculateRiskDistribution(),
    employee_expenses: calculateEmployeeExpenses() || chart_data?.employee_expenses
  };

  // Debug logging to check employee expenses data
  console.log('Chart data from API:', chart_data);
  console.log('Enhanced chart data:', enhancedChartData);
  console.log('Employee expenses data:', enhancedChartData?.employee_expenses);

  return (
    <Box
      sx={{
        px: { xs: 1, sm: 2, md: 4 },
        py: 4,
        background: colorScheme.background,
        minHeight: '100vh',
        width: '100%',
        maxWidth: '1600px',
        mx: 'auto',
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: colorScheme.textPrimary }}>
          {display_name}
        </Typography>
        <Typography variant="body1" sx={{ color: colorScheme.textSecondary, mb: 2 }}>
          Sheet Date: {new Date(sheet_date).toLocaleDateString()}
        </Typography>
        
        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item size={{xs:12, sm:6, md:3}}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: colorScheme.textSecondary, mb: 1 }}>
                  Total Expenses
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                  {total_expenses}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item size={{xs:12, sm:6, md:3}}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: colorScheme.textSecondary, mb: 1 }}>
                  Total Amount
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                  ${parseFloat(total_amount).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item size={{xs:12, sm:6, md:3}}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: colorScheme.textSecondary, mb: 1 }}>
                  Fraud Score
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: colorScheme.primary }}>
                  {analysis_summary?.overall_fraud_score?.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item size={{xs:12, sm:6, md:3}}>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: colorScheme.textSecondary, mb: 1 }}>
                  Risk Level
                </Typography>
                <Chip 
                  label={analysis_summary?.risk_level || 'LOW'} 
                  sx={{ 
                    backgroundColor: getRiskColor(analysis_summary?.risk_level),
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    height: '32px'
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Risk Alert */}
        {flagged_expenses && flagged_expenses.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {flagged_expenses.length} expenses have been flagged for review due to potential anomalies.
          </Alert>
        )}
      </Box>

      {/* Basic Metrics Widget */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item size={{xs:12}}>
          <BasicMetricsWidget basicMetrics={advanced_metrics?.basic_metrics} />
        </Grid>
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Department Expenses */}
        <Grid item size={{xs:12, lg:6}}>
          <DepartmentExpensesChart data={enhancedChartData?.department_expenses} />
        </Grid>

        {/* Category Expenses */}
        <Grid item size={{xs:12, lg:6}}>
          <CategoryExpensesChart data={enhancedChartData?.category_expenses} />
        </Grid>

        {/* Monthly Trend */}
        <Grid item size={{xs:12, lg:8}}>
          <MonthlyTrendChart data={enhancedChartData?.monthly_trend} />
        </Grid>

        {/* Risk Distribution */}
        <Grid item size={{xs:12, lg:4}}>
          <RiskDistributionChart data={enhancedChartData?.risk_distribution} />
        </Grid>

        {/* Fraud Insights */}
        <Grid item size={{xs:12, lg:6}}>
          <FraudInsightsChart data={enhancedChartData} analysisSummary={analysis_summary} />
        </Grid>
         {/* Summary Insights */}
         <Grid item size={{xs:12, lg:6}}>
          <SummaryInsightsChart sheetData={sheetData} analysisSummary={analysis_summary} />
        </Grid>


        {/* Flagged Expenses */}
        <Grid item size={{xs:12, lg:12}}>
          <FlaggedExpensesChart flaggedExpenses={flagged_expenses} analysisSummary={analysis_summary} />
        </Grid>

        {/* Employee Expenses */}
        <Grid item size={{xs:12, lg:12}}>
          <EmployeeExpensesChart data={enhancedChartData?.employee_expenses} />
        </Grid>

        {/* Amount Distribution */}
        <Grid item size={{xs:12, lg:6}}>
          <AmountDistributionChart data={enhancedChartData?.amount_distribution} />
        </Grid>

        {/* Payment Methods */}
        <Grid item size={{xs:12, lg:6}}>
          <PaymentMethodsChart data={enhancedChartData?.payment_methods} />
        </Grid>

        {/* Vendor Expenses */}
        <Grid item size={{xs:12, lg:6}}>
          <VendorExpensesChart data={enhancedChartData?.vendor_expenses} />
        </Grid>

       
        {/* Expense Breakdown */}
        <Grid item size={{xs:12, lg:6}}>
          <ExpenseBreakdownChart data={enhancedChartData?.category_expenses} />
        </Grid>

        {/* Advanced Metrics */}
        <Grid item size={{xs:12}}>
          <AdvancedMetricsChart advancedMetrics={advanced_metrics} />
        </Grid>

        {/* Expense Complexity Chart */}
        <Grid item size={{xs:12, lg:6}}>
          <ExpenseComplexityChart expenseComplexityScores={advanced_metrics?.expense_complexity_scores} />
        </Grid>

        {/* Timing Anomaly Chart */}
        <Grid item size={{xs:12, lg:6}}>
          <TimingAnomalyChart timingAnomalyData={advanced_metrics?.expense_timing_anomaly_score} />
        </Grid>
      </Grid>
    </Box>
  );
} 