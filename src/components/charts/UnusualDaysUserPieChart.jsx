import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer, 
  Tooltip, 
  Legend
} from 'recharts';
import { getPurpleShade, formatCurrency } from '../../utils/colorScheme';

export default function UnusualDaysUserPieChart({ data, title = "User Distribution", subtitle }) {
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
            <Typography variant="body2" color="text.secondary">No user data available</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Group by user and calculate totals
  const userData = data.weekend_postings.reduce((acc, transaction) => {
    const userName = transaction.user_name;
    if (!acc[userName]) {
      acc[userName] = { 
        name: userName, 
        amount: 0, 
        count: 0,
        avgRisk: 0,
        riskSum: 0
      };
    }
    acc[userName].amount += transaction.amount || 0;
    acc[userName].count += 1;
    acc[userName].riskSum += transaction.risk_score || 0;
    acc[userName].avgRisk = acc[userName].riskSum / acc[userName].count;
    return acc;
  }, {});

  const chartData = Object.values(userData)
    .sort((a, b) => b.amount - a.amount)
    .map((user, index) => ({
      name: user.name,
      value: user.amount,
      count: user.count,
      avgRisk: user.avgRisk,
      color: getPurpleShade(index)
    }));

  const CustomTooltip = ({ active, payload }) => {
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
            {data.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: {formatCurrency(data.value)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transactions: {data.count}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Avg Risk: {data.avgRisk?.toFixed(1)}%
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
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
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value, entry) => (
                  <span style={{ color: '#2c3e50' }}>
                    {value} ({formatCurrency(chartData.find(d => d.name === value)?.value || 0)})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
} 