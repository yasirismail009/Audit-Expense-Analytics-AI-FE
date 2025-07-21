import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colorScheme, getRiskColor } from '../../utils/colorScheme';

export default function DuplicateRiskChart({ data }) {
  if (!data || !data.duplicates || data.duplicates.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Duplicate Risk Distribution</Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No duplicate risk data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Group duplicates by risk level
  const riskGroups = data.duplicates.reduce((acc, duplicate) => {
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

  const chartData = Object.entries(riskGroups).map(([riskLevel, details]) => ({
    riskLevel,
    count: details.count,
    amount: details.totalAmount,
    transactions: details.totalTransactions,
    color: getRiskColor(riskLevel)
  }));

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
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: data.color }}>
            {data.riskLevel} Risk
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Duplicate Groups: {data.count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Amount: ${data.amount?.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Transactions: {data.transactions}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 3, 
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      background: 'linear-gradient(135deg, #ffffff 0%, #fff8f0 100%)',
      border: '1px solid rgba(255,255,255,0.2)',
      overflow: 'hidden',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #4BC0C0, #FFCE56, #FF9F40, #FF6384)',
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #FF6384, #FF9F40)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>⚠️</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
            Duplicate Risk Distribution
          </Typography>
        </Box>
        <Box sx={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={8} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="riskLevel" 
                tick={{ fontSize: 14, fontWeight: 'bold', fill: '#666' }} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#666' }} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                radius={[8, 8, 0, 0]}
                fill={(entry) => entry.color}
                stroke="#ffffff"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
} 