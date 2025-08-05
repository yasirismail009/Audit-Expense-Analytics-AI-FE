import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { getPurpleShade, formatCurrency } from '../../utils/colorScheme';
import UnusualDaysTrendChart from './UnusualDaysTrendChart';
import UnusualDaysUserPieChart from './UnusualDaysUserPieChart';

// Weekend Activity Chart
const WeekendActivityChart = ({ data }) => {
  console.log('WeekendActivityChart received data:', data);
  if (!data || !data.weekend_postings || !Array.isArray(data.weekend_postings) || data.weekend_postings.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}>
            Weekend Activity
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {!data ? 'No data provided' : 
               !data.weekend_postings ? 'No weekend data available' :
               !Array.isArray(data.weekend_postings) ? 'Invalid data format' :
               'No weekend data available'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Group by user and sum amounts
  const userData = data.weekend_postings.reduce((acc, transaction) => {
    if (!acc[transaction.user_name]) {
      acc[transaction.user_name] = { user: transaction.user_name, amount: 0, count: 0 };
    }
    acc[transaction.user_name].amount += transaction.amount || 0;
    acc[transaction.user_name].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(userData).map((user, index) => ({
    name: user.user,
    amount: user.amount,
    count: user.count,
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
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: {formatCurrency(payload[0].value)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transactions: {payload[1]?.value || 0}
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
          Weekend Activity by User
        </Typography>
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
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
              <Bar 
                dataKey="amount" 
                fill={getPurpleShade(0)}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="count" 
                fill={getPurpleShade(1)}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

// Day of Week Activity Chart
const DayOfWeekActivityChart = ({ data }) => {
  console.log('DayOfWeekActivityChart received data:', data);
  if (!data || !data.day_of_week_activity || !Array.isArray(data.day_of_week_activity) || data.day_of_week_activity.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}>
            Day of Week Activity
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {!data ? 'No data provided' : 
               !data.day_of_week_activity ? 'No day activity data available' :
               !Array.isArray(data.day_of_week_activity) ? 'Invalid data format' :
               'No day activity data available'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.day_of_week_activity.map((day, index) => ({
    name: day.day_name,
    amount: day.total_amount,
    transactions: day.total_transactions,
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
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: {formatCurrency(payload[0].value)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transactions: {payload[1]?.value || 0}
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
          Activity by Day of Week
        </Typography>
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getPurpleShade(0)} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={getPurpleShade(0)} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="transactionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getPurpleShade(1)} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={getPurpleShade(1)} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
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
              />
              <Area 
                type="monotone" 
                dataKey="transactions" 
                stroke={getPurpleShade(1)}
                strokeWidth={3}
                fill="url(#transactionGradient)"
                dot={{ fill: getPurpleShade(1), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: getPurpleShade(1), strokeWidth: 2, fill: getPurpleShade(1) }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

// Unusual Days Distribution Chart
const UnusualDaysDistributionChart = ({ data }) => {
  console.log('UnusualDaysDistributionChart received data:', data);
  if (!data || !data.unusual_days || !Array.isArray(data.unusual_days) || data.unusual_days.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}>
            Unusual Days Distribution
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {!data ? 'No data provided' : 
               !data.unusual_days ? 'No unusual days data available' :
               !Array.isArray(data.unusual_days) ? 'Invalid data format' :
               'No unusual days data available'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.unusual_days.map((day, index) => ({
    name: day.day_name,
    value: day.transaction_count,
    deviation: day.deviation_percentage,
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
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transactions: {payload[0].value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Deviation: {payload[0].payload.deviation?.toFixed(1)}%
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
          Unusual Days Distribution
        </Typography>
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
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
              <Bar 
                dataKey="value" 
                fill={getPurpleShade(0)}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

// Risk Score Distribution Chart
const RiskScoreDistributionChart = ({ data }) => {
  console.log('RiskScoreDistributionChart received data:', data);
  if (!data || !data.weekend_postings || !Array.isArray(data.weekend_postings) || data.weekend_postings.length === 0) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2c3e50' }}>
            Risk Score Distribution
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {!data ? 'No data provided' : 
               !data.weekend_postings ? 'No risk data available' :
               !Array.isArray(data.weekend_postings) ? 'Invalid data format' :
               'No risk data available'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Group by risk score ranges
  const riskRanges = {
    '0-20': { min: 0, max: 20, count: 0, amount: 0 },
    '21-40': { min: 21, max: 40, count: 0, amount: 0 },
    '41-60': { min: 41, max: 60, count: 0, amount: 0 },
    '61-80': { min: 61, max: 80, count: 0, amount: 0 },
    '81-100': { min: 81, max: 100, count: 0, amount: 0 }
  };

  data.weekend_postings.forEach(transaction => {
    const score = transaction.risk_score || 0;
    for (const [range, data] of Object.entries(riskRanges)) {
      if (score >= data.min && score <= data.max) {
        data.count += 1;
        data.amount += transaction.amount || 0;
        break;
      }
    }
  });

  const chartData = Object.entries(riskRanges).map(([range, data], index) => ({
    name: range,
    count: data.count,
    amount: data.amount,
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
            Risk Range: {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Transactions: {payload[0].value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: {formatCurrency(payload[1]?.value || 0)}
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
          Risk Score Distribution
        </Typography>
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
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
              <Bar 
                dataKey="count" 
                fill={getPurpleShade(0)}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="amount" 
                fill={getPurpleShade(1)}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
export default function UnusualDaysDashboard({ data }) {
  console.log('UnusualDaysDashboard received data:', data);
  const unusualDaysAnalysis = data?.unusual_days_analysis || {};

  return (
    <Box sx={{ mb: 4 }}>
     
      <Grid container spacing={3}>
      <Grid item size={{xs: 12, lg: 12}}>
          <DayOfWeekActivityChart data={unusualDaysAnalysis} />
        </Grid>
        <Grid item size={{xs: 12, lg: 12}}>
          <WeekendActivityChart data={unusualDaysAnalysis} />
        </Grid>
       
        <Grid item size={{xs: 12, lg: 6}}>
          <UnusualDaysDistributionChart data={unusualDaysAnalysis} />
        </Grid>
        <Grid item size={{xs: 12, lg: 6}}>
          <RiskScoreDistributionChart data={unusualDaysAnalysis} />
        </Grid>
        <Grid item size={{xs: 12, lg: 6}}>
          <UnusualDaysUserPieChart 
            data={unusualDaysAnalysis} 
            title="User Distribution by Amount"
            subtitle="Distribution of weekend transaction amounts by user"
          />
        </Grid>
        <Grid item size={{xs: 12, lg: 6}}>
          <UnusualDaysTrendChart 
            data={unusualDaysAnalysis} 
            title="Weekend Activity Trend"
            subtitle="Daily trend of weekend transactions, amounts, and risk scores"
          />
        </Grid>
      </Grid>
    </Box>
  );
} 