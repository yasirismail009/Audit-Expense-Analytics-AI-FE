import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/colorScheme';

export default function HolidayDistributionLineChart({ data }) {
  // Transform the distribution data into chart format
  const transformData = () => {
    if (!data) return [];
    
    // Create data points for the line chart
    const chartData = [
      { name: 'Holiday Entries', value: data.count || 0, amount: data.total_amount || 0 },
      { name: 'Holidays Affected', value: data.unique_holidays || 0, amount: data.total_amount || 0 },
      { name: 'Total Amount', value: data.count || 0, amount: data.total_amount || 0 },
      { name: 'Anomaly Types', value: data.anomaly_types || 0, amount: data.total_amount || 0 }
    ];
    
    return chartData;
  };

  const areaChartData = transformData();

  if (!areaChartData || areaChartData.length === 0) {
    return (
      <Card sx={{ 
        height: 300, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        <Typography variant="body2" color="text.secondary">
          No distribution data available
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      bgcolor: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    }}>
      <CardContent>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          color: '#2c3e50',
          mb: 2
        }}>
          📊 Holiday Distribution Overview
        </Typography>
        
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                stroke="#6c757d"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6c757d"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                formatter={(value, name) => [
                  name === 'value' ? value : formatCurrency(value),
                  name === 'value' ? 'Count' : 'Amount'
                ]}
                labelStyle={{ color: '#2c3e50', fontWeight: 600 }}
              />
              
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                fill="url(#colorValue)"
                name="Count"
              />
              
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#A855F7" 
                strokeWidth={3}
                fill="url(#colorAmount)"
                name="Amount"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#8B5CF6', borderRadius: '50%' }} />
            <Typography variant="body2" color="#6c757d">Count</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: '#A855F7', borderRadius: '50%' }} />
            <Typography variant="body2" color="#6c757d">Amount</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
} 