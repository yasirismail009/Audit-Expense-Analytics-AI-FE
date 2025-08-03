import React from 'react';
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

// Weekend Activity Chart
const WeekendActivityChart = ({ data }) => {
  if (!data || !data.weekend_postings || data.weekend_postings.length === 0) {
    return (
      <div style={{ 
        height: '100%', 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        backgroundColor: 'white',
        padding: '16px'
      }}>
        <div style={{ 
          marginBottom: '8px', 
          fontWeight: 600, 
          color: '#2c3e50',
          fontSize: '16px'
        }}>
          Weekend Activity
        </div>
        <div style={{ 
          height: 300, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#666'
        }}>
          No weekend data available
        </div>
      </div>
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
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {label}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            Amount: {formatCurrency(payload[0].value)}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            Transactions: {payload[1]?.value || 0}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ 
      height: '100%', 
      borderRadius: '12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      backgroundColor: 'white',
      padding: '16px'
    }}>
      <div style={{ 
        marginBottom: '8px', 
        fontWeight: 600, 
        color: '#2c3e50',
        fontSize: '16px'
      }}>
        Weekend Activity by User
      </div>
      <div style={{ height: 300, width: '100%' }}>
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
      </div>
    </div>
  );
};

// Unusual Days Distribution Chart
const UnusualDaysDistributionChart = ({ data }) => {
  if (!data || !data.unusual_days || data.unusual_days.length === 0) {
    return (
      <div style={{ 
        height: '100%', 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        backgroundColor: 'white',
        padding: '16px'
      }}>
        <div style={{ 
          marginBottom: '8px', 
          fontWeight: 600, 
          color: '#2c3e50',
          fontSize: '16px'
        }}>
          Unusual Days Distribution
        </div>
        <div style={{ 
          height: 300, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#666'
        }}>
          No unusual days data available
        </div>
      </div>
    );
  }

  const chartData = data.unusual_days.map((day, index) => ({
    name: day.day_name,
    count: day.transaction_count,
    type: day.unusual_type,
    color: getPurpleShade(index)
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {label}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            Transactions: {payload[0].value}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            Type: {payload[0].payload.type}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ 
      height: '100%', 
      borderRadius: '12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      backgroundColor: 'white',
      padding: '16px'
    }}>
      <div style={{ 
        marginBottom: '8px', 
        fontWeight: 600, 
        color: '#2c3e50',
        fontSize: '16px'
      }}>
        Unusual Days Distribution
      </div>
      <div style={{ height: 300, width: '100%' }}>
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
              dataKey="count" 
              fill={getPurpleShade(0)}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Risk Score Distribution Chart
const RiskScoreDistributionChart = ({ data }) => {
  if (!data || !data.weekend_postings || data.weekend_postings.length === 0) {
    return (
      <div style={{ 
        height: '100%', 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        backgroundColor: 'white',
        padding: '16px'
      }}>
        <div style={{ 
          marginBottom: '8px', 
          fontWeight: 600, 
          color: '#2c3e50',
          fontSize: '16px'
        }}>
          Risk Score Distribution
        </div>
        <div style={{ 
          height: 300, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#666'
        }}>
          No risk data available
        </div>
      </div>
    );
  }

  // Group by risk level
  const riskData = data.weekend_postings.reduce((acc, transaction) => {
    const riskLevel = transaction.risk_score >= 80 ? 'Critical' : 
                     transaction.risk_score >= 60 ? 'High' : 
                     transaction.risk_score >= 40 ? 'Medium' : 'Low';
    
    if (!acc[riskLevel]) {
      acc[riskLevel] = { name: riskLevel, count: 0, amount: 0 };
    }
    acc[riskLevel].count += 1;
    acc[riskLevel].amount += transaction.amount || 0;
    return acc;
  }, {});

  const chartData = Object.values(riskData).map((risk, index) => ({
    name: risk.name,
    count: risk.count,
    amount: risk.amount,
    color: getPurpleShade(index)
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            Risk Range: {label}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            Transactions: {payload[0].value}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            Amount: {formatCurrency(payload[1]?.value || 0)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ 
      height: '100%', 
      borderRadius: '12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      backgroundColor: 'white',
      padding: '16px'
    }}>
      <div style={{ 
        marginBottom: '8px', 
        fontWeight: 600, 
        color: '#2c3e50',
        fontSize: '16px'
      }}>
        Risk Score Distribution
      </div>
      <div style={{ height: 300, width: '100%' }}>
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
      </div>
    </div>
  );
};

// Main Dashboard Component for PDF
export default function UnusualDaysDashboardChart({ data }) {
  const unusualDaysAnalysis = data?.unusual_days_analysis || {};

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Main Chart - Full Width */}
      <div style={{ marginBottom: '24px' }}>
        <WeekendActivityChart data={unusualDaysAnalysis} />
      </div>
      
      {/* Bottom Charts - 2 columns using CSS Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px',
        marginBottom: '24px'
      }}>
        <UnusualDaysDistributionChart data={unusualDaysAnalysis} />
        <RiskScoreDistributionChart data={unusualDaysAnalysis} />
      </div>
    </div>
  );
} 