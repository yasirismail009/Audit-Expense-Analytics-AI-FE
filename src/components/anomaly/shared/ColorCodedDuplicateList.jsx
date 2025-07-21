import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
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
import { getRiskColor, getColorByIndex } from '../../../utils/colorScheme';

export default function ColorCodedDuplicateList({ data }) {
  const [groupBy, setGroupBy] = useState('type');

  if (!data || !data.duplicates || data.duplicates.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No duplicate data available
        </Typography>
      </Paper>
    );
  }

  const handleGroupChange = (event, newGroup) => {
    if (newGroup !== null) {
      setGroupBy(newGroup);
    }
  };

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

  const groupDuplicates = () => {
    const groups = {};

    data.duplicates.forEach((duplicate, index) => {
      let groupKey = '';
      let groupColor = getColorByIndex(index);

      switch (groupBy) {
        case 'type':
          groupKey = duplicate.type || 'Unknown';
          break;
        case 'risk':
          const riskLevel = getRiskLevel(duplicate.risk_score || 0);
          groupKey = riskLevel;
          groupColor = getRiskColor(riskLevel);
          break;
        case 'amount':
          const amount = duplicate.amount || 0;
          if (amount >= 50000) groupKey = 'High Amount ($50K+)';
          else if (amount >= 10000) groupKey = 'Medium Amount ($10K-50K)';
          else if (amount >= 1000) groupKey = 'Low Amount ($1K-10K)';
          else groupKey = 'Very Low Amount (<$1K)';
          break;
        case 'gl_account':
          groupKey = duplicate.gl_account || 'Unknown Account';
          break;
        default:
          groupKey = 'Other';
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

  const groupedData = groupDuplicates();

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f8ff 100%)',
      borderRadius: 3,
      p: 3,
      border: '1px solid rgba(255,255,255,0.3)'
    }}>
      {/* Grouping Controls */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          p: 2,
          background: 'linear-gradient(135deg, #925A9B, #36A2EB)',
          borderRadius: 2,
          color: 'white'
        }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>🎯</Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Group Duplicates By:
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={groupBy}
          exclusive
          onChange={handleGroupChange}
          size="large"
          sx={{
            '& .MuiToggleButton-root': {
              background: 'linear-gradient(135deg, #ffffff, #f8f9ff)',
              border: '1px solid #e0e0e0',
              color: '#666',
              fontWeight: 'bold',
              textTransform: 'none',
              px: 3,
              py: 1,
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, #925A9B, #36A2EB)',
                color: 'white',
                borderColor: '#925A9B',
                '&:hover': {
                  background: 'linear-gradient(135deg, #925A9B, #36A2EB)',
                }
              },
              '&:hover': {
                background: 'linear-gradient(135deg, #f0f8ff, #e0f2f1)',
              }
            }
          }}
        >
          <ToggleButton value="type">📊 Type</ToggleButton>
          <ToggleButton value="risk">⚠️ Risk Level</ToggleButton>
          <ToggleButton value="amount">💰 Amount Range</ToggleButton>
          <ToggleButton value="gl_account">🏦 GL Account</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Grouped Lists */}
      <Grid container spacing={3}>
        {Object.entries(groupedData).map(([groupName, groupData]) => (
          <Grid item xs={12} md={6} key={groupName}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, #ffffff 0%, ${groupData.color}08 100%)`,
                border: `2px solid ${groupData.color}30`,
                borderRadius: 3,
                boxShadow: `0 4px 20px ${groupData.color}20`,
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                  boxShadow: `0 8px 32px ${groupData.color}30`,
                  transform: 'translateY(-8px)',
                  transition: 'all 0.3s ease-in-out'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${groupData.color}, ${groupData.color}80)`,
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: '50%', 
                    background: `linear-gradient(135deg, ${groupData.color}, ${groupData.color}80)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2
                  }}>
                    {getGroupIcon(groupName)}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: groupData.color, flexGrow: 1 }}>
                    {groupName}
                  </Typography>
                  <Chip 
                    label={groupData.items.length} 
                    size="small" 
                    sx={{ 
                      backgroundColor: groupData.color, 
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      px: 1.5
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount: ${groupData.totalAmount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions: {groupData.totalCount}
                  </Typography>
                </Box>

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
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {duplicate.criteria || duplicate.type}
                            </Typography>
                            <Chip 
                              label={`${duplicate.count} transactions`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Amount: ${(duplicate.amount || 0).toLocaleString()}
                            </Typography>
                            {duplicate.risk_score && (
                              <Chip 
                                label={`Risk: ${duplicate.risk_score}`}
                                size="small"
                                sx={{ 
                                  ml: 1,
                                  backgroundColor: getRiskColor(getRiskLevel(duplicate.risk_score)),
                                  color: 'white'
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
        ))}
      </Grid>
    </Box>
  );
} 