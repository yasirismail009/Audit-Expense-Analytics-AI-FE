import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { getRiskColor, getColorByIndex } from '../../../utils/colorScheme';

export default function DuplicateSummaryCards({ data, distributionData, anomalySummary, currency = 'SAR' }) {
  if (!data) {
    return null;
  }

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

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const calculateRiskDistribution = () => {
    if (!data.duplicates) return {};
    
    return data.duplicates.reduce((acc, duplicate) => {
      const riskLevel = getRiskLevel(duplicate.risk_score || 0);
      acc[riskLevel] = (acc[riskLevel] || 0) + 1;
      return acc;
    }, {});
  };

  const riskDistribution = calculateRiskDistribution();
  const totalDuplicates = data.total_duplicates || 0;
  const totalAmount = data.total_amount_involved || 0;
  const totalTransactions = data.total_transactions_involved || 0;

  const summaryCards = [
    {
      title: 'Total Duplicates',
      value: totalDuplicates,
      icon: <TrendingUpIcon />,
              color: '#925A9B',
      bgColor: '#e0f2f1',
      subtitle: 'Duplicate groups found'
    },
    {
      title: 'Total Amount',
      value: formatCurrency(totalAmount),
      icon: <AccountIcon />,
      color: '#1565c0',
      bgColor: '#e3f2fd',
      subtitle: 'Amount involved in duplicates'
    },
    {
      title: 'Transactions',
      value: totalTransactions,
      icon: <PeopleIcon />,
      color: '#2e7d32',
      bgColor: '#e8f5e8',
      subtitle: 'Transactions involved'
    },
    {
      title: 'Risk Level',
      value: Object.keys(riskDistribution).length > 0 ? 
        Object.keys(riskDistribution).sort((a, b) => {
          const order = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          return order[b] - order[a];
        })[0] : 'LOW',
      icon: <WarningIcon />,
      color: getRiskColor(Object.keys(riskDistribution).length > 0 ? 
        Object.keys(riskDistribution).sort((a, b) => {
          const order = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          return order[b] - order[a];
        })[0] : 'LOW'),
      bgColor: '#fff3e0',
      subtitle: 'Highest risk level detected'
    }
  ];

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${card.bgColor} 0%, ${card.bgColor}dd 100%)`,
                border: `2px solid ${card.color}33`,
                borderRadius: 3,
                boxShadow: `0 4px 20px ${card.color}20`,
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 8px 32px ${card.color}30`,
                  transition: 'all 0.3s ease-in-out'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${card.color}, ${card.color}80)`,
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${card.color}, ${card.color}80)`,
                  color: 'white',
                  mb: 2,
                  boxShadow: `0 4px 16px ${card.color}40`
                }}>
                  {card.icon}
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: card.color, mb: 1 }}>
                  {card.value}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Risk Distribution Progress */}
      {Object.keys(riskDistribution).length > 0 && (
        <Card sx={{ 
          mb: 3, 
          p: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
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
              Risk Distribution
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {Object.entries(riskDistribution).map(([riskLevel, count]) => {
              const percentage = totalDuplicates > 0 ? (count / totalDuplicates) * 100 : 0;
              return (
                <Grid item xs={12} key={riskLevel}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip 
                      label={riskLevel}
                      size="small"
                      sx={{ 
                        backgroundColor: getRiskColor(riskLevel),
                        color: 'white',
                        fontWeight: 'bold',
                        mr: 2,
                        minWidth: 80
                      }}
                    />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {count} duplicates ({percentage.toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={percentage}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: `${getRiskColor(riskLevel)}22`,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getRiskColor(riskLevel),
                        borderRadius: 4
                      }
                    }}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Card>
      )}

      {/* Distribution Overview */}
      {distributionData && (
        <Card sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #fff3e0 0%, #fff3e0dd 100%)',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(230,81,0,0.15)',
          border: '1px solid rgba(230,81,0,0.2)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #e65100, #ff9800, #ffcc02)',
          }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #e65100, #ff9800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>📊</Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#e65100' }}>
              Anomaly Distribution Overview
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e65100' }}>
                  {distributionData.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Duplicate Entries Found
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  {distributionData.percentage?.toFixed(1) || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  of Total Anomalies
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                  {anomalySummary?.totalAnomalies || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Anomalies
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#c2185b' }}>
                  {anomalySummary ? Object.keys(anomalySummary).filter(key => 
                    key !== 'totalAnomalies' && (anomalySummary[key] || 0) > 0
                  ).length : 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Anomaly Types
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      )}
    </Box>
  );
} 