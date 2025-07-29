import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DuplicateRiskChart({ data, currency = 'SAR' }) {
  // Helper function to get risk level from score
  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    
    if (num >= 1000000000000) {
      return `${(num / 1000000000000).toFixed(1)}T ${currency}`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M ${currency}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K ${currency}`;
    } else {
      return `${num.toFixed(0)} ${currency}`;
    }
  };

  // Check for new API response structure first, then fallback to old structure
  const chartData = data?.summary?.risk_distribution || 
                   data?.chart_data?.risk_level_distribution || 
                   data?.duplicates;
  


  if (!data || !chartData || (Array.isArray(chartData) && chartData.length === 0) || (typeof chartData === 'object' && !Array.isArray(chartData) && Object.keys(chartData).length === 0)) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Risk Level Distribution</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No risk level data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Transform data based on structure
  let transformedData;
  if (chartData.labels && chartData.data) {
    // New structure: chart_data.risk_level_distribution has labels and data arrays
    transformedData = chartData.labels.map((label, index) => ({
      riskLevel: label,
      count: chartData.data[index] || 0,
      amount: 0, // Will be calculated from duplicate entries
      transactions: (chartData.data[index] || 0) * 2
    }));
    
    // Calculate amounts from duplicate entries if available
    const duplicateEntries = data?.detailed_results?.duplicate_entries || data?.duplicate_entries;
    if (duplicateEntries) {
      transformedData.forEach(item => {
        const matchingEntries = duplicateEntries.filter(entry => {
          const entryRiskLevel = getRiskLevel(entry.risk_score);
          return entryRiskLevel === item.riskLevel;
        });
        item.amount = matchingEntries.reduce((sum, entry) => 
          sum + entry.transaction1.amount + entry.transaction2.amount, 0
        );
      });
    }
  } else if (Array.isArray(chartData) && chartData.length > 0 && chartData[0].risk_level) {
    // Fallback: chart_data.risk_level_chart is an array with risk_level property
    transformedData = chartData
      .filter(item => item.duplicate_groups > 0) // Only show risk levels with data
      .map((item, index) => ({
        riskLevel: item.risk_level,
        count: item.duplicate_groups,
        amount: item.total_amount,
        transactions: item.transactions
      }));
  } else if (typeof chartData === 'object' && !Array.isArray(chartData)) {
    // New API structure: risk_distribution is an object like {"Critical": 1, "High": 1}
    transformedData = Object.entries(chartData)
      .filter(([riskLevel, count]) => count > 0) // Only show risk levels with data
      .map(([riskLevel, count]) => ({
        riskLevel: riskLevel.toUpperCase(),
        count: count,
        amount: 0, // Will be calculated from duplicate entries
        transactions: count * 2
      }));
    
    // Calculate amounts from duplicate entries if available
    const duplicateEntries = data?.detailed_results?.duplicate_entries || data?.duplicate_entries;
    if (duplicateEntries) {
      transformedData.forEach(item => {
        const matchingEntries = duplicateEntries.filter(entry => {
          const entryRiskLevel = getRiskLevel(entry.risk_score);
          return entryRiskLevel === item.riskLevel;
        });
        item.amount = matchingEntries.reduce((sum, entry) => 
          sum + entry.transaction1.amount + entry.transaction2.amount, 0
        );
      });
    }
  } else if (Array.isArray(chartData)) {
    // Old structure: duplicates array - group by risk level
    const riskGroups = chartData.reduce((acc, duplicate) => {
      const riskScore = duplicate.risk_score || 0;
      let riskLevel = 'LOW';
      if (riskScore >= 80) riskLevel = 'CRITICAL';
      else if (riskScore >= 60) riskLevel = 'HIGH';
      else if (riskScore >= 40) riskLevel = 'MEDIUM';

      if (!acc[riskLevel]) {
        acc[riskLevel] = {
          count: 0,
          totalAmount: 0,
          totalTransactions: 0,
          duplicates: []
        };
      }
      
      acc[riskLevel].count += 1;
      acc[riskLevel].totalAmount += duplicate.amount || 0;
      acc[riskLevel].totalTransactions += duplicate.count || 0;
      acc[riskLevel].duplicates.push(duplicate);
      
      return acc;
    }, {});

    transformedData = Object.entries(riskGroups).map(([riskLevel, details]) => ({
      riskLevel,
      count: details.count,
      amount: details.totalAmount,
      transactions: details.totalTransactions
    }));
  } else {
    // Fallback: empty array if no valid data structure found
    transformedData = [];
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box sx={{ 
          backgroundColor: 'white', 
          border: '1px solid #ccc', 
          borderRadius: 2, 
          p: 2,
          boxShadow: 2
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Count: {data.count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: {formatCurrency(data.amount)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transactions: {data.transactions}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Risk Level Distribution</Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transformedData} barGap={8} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="riskLevel" 
                tick={{ fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                radius={[8, 8, 0, 0]}
                fill="url(#barGradient)"
                stroke="#ffffff"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#925a9b" />
                  <stop offset="100%" stopColor="#e0bdc8" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
} 