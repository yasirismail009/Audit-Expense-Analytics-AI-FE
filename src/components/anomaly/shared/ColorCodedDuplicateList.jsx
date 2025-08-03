import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  AccountBalance as AccountIcon
} from '@mui/icons-material';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart } from 'recharts';
import { getRiskColor, getColorByIndex } from '../../../utils/colorScheme';

export default function ColorCodedDuplicateList({ data, currency = 'SAR' }) {
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

  if (!data || !data.duplicates || data.duplicates.length === 0) {
    return null;
  }

  const getRiskLevel = (score) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const getGroupIcon = (group) => {
    switch (group) {
      case 'CRITICAL':
        return <ErrorIcon sx={{ color: getRiskColor('CRITICAL') }} />;
      case 'HIGH':
        return <WarningIcon sx={{ color: getRiskColor('HIGH') }} />;
      case 'MEDIUM':
        return <InfoIcon sx={{ color: getRiskColor('MEDIUM') }} />;
      case 'LOW':
        return <InfoIcon sx={{ color: getRiskColor('LOW') }} />;
      default:
        return <TrendingUpIcon />;
    }
  };

  // Generate chart data for a group
  const generateChartData = (items, groupColor) => {
    if (!items || items.length === 0) return [];
    
    // Create data points for ALL items in this specific group
    const dataPoints = [];
    
    // Sort items by amount for better visualization
    const sortedItems = [...items].sort((a, b) => (a.amount || 0) - (b.amount || 0));
    
    // Find max amount for scaling
    const maxAmount = Math.max(...sortedItems.map(item => item.amount || 0));
    
    sortedItems.forEach((item, index) => {
      dataPoints.push({
        name: `Item ${index + 1}`,
        amount: item.amount || 0,
        // Scale amount to be visible in chart (max 100 for chart display)
        amountScaled: maxAmount > 0 ? ((item.amount || 0) / maxAmount) * 100 : 0,
        count: item.count || 0,
        risk: item.risk_score || 0,
        criteria: item.criteria || item.type || 'Unknown',
        glAccount: item.gl_account || 'Unknown'
      });
    });
    
    return dataPoints;
  };

  const groupDuplicatesByType = () => {
    const groups = {};

    data.duplicates.forEach((duplicate, index) => {
      const groupKey = duplicate.type || 'Unknown';
      let groupColor = getColorByIndex(index);
      
      // Fallback colors if getColorByIndex fails
      if (!groupColor) {
        const fallbackColors = ['#925a9b', '#36A2EB', '#FF6384', '#4BC0C0', '#FF9F40', '#9966FF', '#FF99CC', '#FFCD56'];
        groupColor = fallbackColors[index % fallbackColors.length];
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          items: [],
          color: groupColor,
          totalAmount: 0,
          totalCount: 0
        };
      }

      groups[groupKey].items.push(duplicate);
      groups[groupKey].totalAmount += duplicate.amount || 0;
      groups[groupKey].totalCount += duplicate.count || 0;
    });

    return groups;
  };

  const groupDuplicatesByRisk = () => {
    const groups = {};

    data.duplicates.forEach((duplicate) => {
      const riskLevel = getRiskLevel(duplicate.risk_score || 0);
      let groupColor = getRiskColor(riskLevel);
      
      // Fallback colors for risk levels
      if (!groupColor) {
        const riskColors = {
          'CRITICAL': '#ff4444',
          'HIGH': '#ff8800',
          'MEDIUM': '#ffaa00',
          'LOW': '#00aa00'
        };
        groupColor = riskColors[riskLevel] || '#925a9b';
      }

      if (!groups[riskLevel]) {
        groups[riskLevel] = {
          items: [],
          color: groupColor,
          totalAmount: 0,
          totalCount: 0
        };
      }

      groups[riskLevel].items.push(duplicate);
      groups[riskLevel].totalAmount += duplicate.amount || 0;
      groups[riskLevel].totalCount += duplicate.count || 0;
    });

    return groups;
  };

  const groupDuplicatesByAmount = () => {
    const groups = {};

    data.duplicates.forEach((duplicate, index) => {
      const amount = duplicate.amount || 0;
      let groupKey = '';
      let groupColor = getColorByIndex(index);
      
      // Fallback colors if getColorByIndex fails
      if (!groupColor) {
        const fallbackColors = ['#925a9b', '#36A2EB', '#FF6384', '#4BC0C0'];
        groupColor = fallbackColors[index % fallbackColors.length];
      }

      if (amount >= 50000) {
        groupKey = `High Amount (${currency} 50K+)`;
      } else if (amount >= 10000) {
        groupKey = `Medium Amount (${currency} 10K-50K)`;
      } else if (amount >= 1000) {
        groupKey = `Low Amount (${currency} 1K-10K)`;
      } else {
        groupKey = `Very Low Amount (<${currency} 1K)`;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          items: [],
          color: groupColor,
          totalAmount: 0,
          totalCount: 0
        };
      }

      groups[groupKey].items.push(duplicate);
      groups[groupKey].totalAmount += duplicate.amount || 0;
      groups[groupKey].totalCount += duplicate.count || 0;
    });

    return groups;
  };

  const groupDuplicatesByGLAccount = () => {
    const groups = {};

    data.duplicates.forEach((duplicate, index) => {
      const groupKey = duplicate.gl_account || 'Unknown Account';
      let groupColor = getColorByIndex(index);
      
      // Fallback colors if getColorByIndex fails
      if (!groupColor) {
        const fallbackColors = ['#925a9b', '#36A2EB', '#FF6384', '#4BC0C0', '#FF9F40', '#9966FF', '#FF99CC', '#FFCD56'];
        groupColor = fallbackColors[index % fallbackColors.length];
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          items: [],
          color: groupColor,
          totalAmount: 0,
          totalCount: 0
        };
      }

      groups[groupKey].items.push(duplicate);
      groups[groupKey].totalAmount += duplicate.amount || 0;
      groups[groupKey].totalCount += duplicate.count || 0;
    });

    return groups;
  };

  const typeGroups = groupDuplicatesByType();
  const riskGroups = groupDuplicatesByRisk();
  const amountGroups = groupDuplicatesByAmount();
  const glAccountGroups = groupDuplicatesByGLAccount();

  const renderGroupedCards = (groupedData, title) => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ 
        fontWeight: 600, 
        mb: 3, 
        color: '#2c3e50',
        fontSize: '1.1rem'
      }}>
        {title}
      </Typography>
      <Grid container spacing={3}>
        {Object.entries(groupedData).map(([groupName, groupData]) => {
          const chartData = generateChartData(groupData.items, groupData.color);
          

          
          return (
            <Grid item size={{xs: 12, md: 6}} key={groupName}>
              <Card 
                sx={{ 
                  width: '100%',
                  borderRadius: 3,
                  boxShadow: 2
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {/* <Box sx={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: '50%', 
                      background: '#ede7f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}>
                      {getGroupIcon(groupName)}
                    </Box> */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: groupData.color || '#925a9b', flexGrow: 1 }}>
                      {groupName}
                    </Typography>
                    <Chip 
                      label={groupData.items.length} 
                      size="small" 
                      sx={{ 
                        backgroundColor: groupData.color || '#925a9b', 
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        px: 1.5
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Amount: {formatCurrency(groupData.totalAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Transactions: {groupData.totalCount}
                    </Typography>
                  </Box>

                  {/* Composed Chart - Bars for Amount, Line for Risk */}
                  {chartData.length > 0 && (
                    <Box sx={{ mb: 6, height: 120 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                          <XAxis 
                            dataKey="name" 
                            hide={true}
                          />
                          <YAxis 
                            hide={false}
                            tick={{ fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #ccc',
                              borderRadius: 4,
                              fontSize: '12px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                            formatter={(value, name, props) => {
                              const data = props.payload;
                              if (name === 'amountScaled') {
                                return [formatCurrency(data.amount), 'Amount'];
                              } else if (name === 'risk') {
                                return [value, 'Risk Score'];
                              }
                              return [value, name];
                            }}
                            labelFormatter={(label) => `Item ${label}`}
                          />
                          {/* Amount Bars with Direct Color */}
                          <Bar 
                            dataKey="amountScaled" 
                            fill={groupData.color || '#925a9b'}
                            radius={[4, 4, 0, 0]}
                            name="amountScaled"
                          />
                          {/* Risk Line */}
                          <Line 
                            type="monotone" 
                            dataKey="risk" 
                            stroke="#ff6b6b" 
                            strokeWidth={3}
                            dot={{ fill: '#ff6b6b', strokeWidth: 2, r: 4 }}
                            name="risk"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                        <Box sx={{ width: 12, height: 12, background: groupData.color || '#925a9b', borderRadius: 1 }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Amount</Typography>
                        <Box sx={{ width: 12, height: 12, backgroundColor: '#ff6b6b', borderRadius: 1 }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Risk</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block', mt: 0.5 }}>
                        {chartData.length} items in this group
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ my: 1 }} />

                  <List dense>
                    {groupData.items.map((duplicate, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              backgroundColor: groupData.color 
                            }} 
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                {duplicate.criteria || duplicate.type}
                              </Typography>
                              <Chip 
                                label={`${duplicate.count} transactions`}
                                size="small"
                                variant="outlined"
                                sx={{ borderColor: '#925a9b', color: '#925a9b', fontWeight: 500 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Amount: {formatCurrency(duplicate.amount || 0)}
                              </Typography>
                              {duplicate.risk_score && (
                                <Chip 
                                  label={`Risk: ${duplicate.risk_score}`}
                                  size="small"
                                  sx={{ 
                                    ml: 1,
                                    backgroundColor: getRiskColor(getRiskLevel(duplicate.risk_score)),
                                    color: 'white',
                                    fontWeight: 500
                                  }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ 
      background: 'white',
      borderRadius: 3,
      p: 3,
      boxShadow: 2
    }}>
      {/* All Grouping Views */}
      {renderGroupedCards(typeGroups, 'Grouped by Type')}
      {renderGroupedCards(riskGroups, 'Grouped by Risk Level')}
      {renderGroupedCards(amountGroups, 'Grouped by Amount Range')}
      {renderGroupedCards(glAccountGroups, 'Grouped by GL Account')}
    </Box>
  );
} 