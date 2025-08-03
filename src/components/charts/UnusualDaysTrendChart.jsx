import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { getPurpleShade, formatCurrency } from '../../utils/colorScheme';

export default function UnusualDaysTrendChart({ data, title = "Unusual Days Trend", subtitle }) {
  if (!data || !data.weekend_postings || data.weekend_postings.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ mb: 2, color: '#6c757d', fontSize: '0.875rem' }}>
              {subtitle}
            </Typography>
          )}
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">No trend data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Group by posting date and calculate daily totals
  const dailyData = data.weekend_postings.reduce((acc, transaction) => {
    const date = transaction.posting_date;
    if (!acc[date]) {
      acc[date] = { 
        date, 
        amount: 0, 
        count: 0, 
        avgRisk: 0,
        riskSum: 0
      };
    }
    acc[date].amount += transaction.amount || 0;
    acc[date].count += 1;
    acc[date].riskSum += transaction.risk_score || 0;
    acc[date].avgRisk = acc[date].riskSum / acc[date].count;
    return acc;
  }, {});

  const chartData = Object.values(dailyData)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((day, index) => ({
      date: day.date,
      amount: day.amount,
      count: day.count,
      avgRisk: day.avgRisk,
      color: getPurpleShade(index)
    }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ 
          backgroundColor: 'white', 
          border: '1px solid #ccc', 
          borderRadius: 2, 
          p: 2,
          boxShadow: 2
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Date: {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: {formatCurrency(payload[0]?.value || 0)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transactions: {payload[1]?.value || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Avg Risk: {payload[2]?.value?.toFixed(1) || 0}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ mb: 2, color: '#6c757d', fontSize: '0.875rem' }}>
            {subtitle}
          </Typography>
        )}
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getPurpleShade(0)} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={getPurpleShade(0)} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getPurpleShade(1)} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={getPurpleShade(1)} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getPurpleShade(2)} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={getPurpleShade(2)} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke={getPurpleShade(0)}
                strokeWidth={3}
                fill="url(#amountGradient)"
                dot={{ fill: getPurpleShade(0), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: getPurpleShade(0), strokeWidth: 2, fill: getPurpleShade(0) }}
                name="Amount"
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke={getPurpleShade(1)}
                strokeWidth={3}
                fill="url(#countGradient)"
                dot={{ fill: getPurpleShade(1), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: getPurpleShade(1), strokeWidth: 2, fill: getPurpleShade(1) }}
                name="Transactions"
              />
              <Area 
                type="monotone" 
                dataKey="avgRisk" 
                stroke={getPurpleShade(2)}
                strokeWidth={3}
                fill="url(#riskGradient)"
                dot={{ fill: getPurpleShade(2), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: getPurpleShade(2), strokeWidth: 2, fill: getPurpleShade(2) }}
                name="Avg Risk"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
} 