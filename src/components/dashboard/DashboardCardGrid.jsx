import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  IconButton,
  Button,
  Tooltip as MuiTooltip
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import {
  MoreVert,
  Lock,
  TrendingUp
} from '@mui/icons-material';

import { dashboardColors as colors } from '../../utils/dashboardColors';

export default function DashboardCardGrid({ onReceiveClick, onSendClick, cardData, engagementData }) {
  // Use cardData if provided, otherwise use default values
  const mainCard = cardData?.mainCard || {
    title: "VISA",
    amount: "$23,194.80",
    subtitle: "Linked to main account **** 2719",
    fee: "$25.00"
  };
  
  const stats = cardData?.stats || [
    {
      label: "Weekly",
      value: "$8,145.20",
      subtitle: "Total paid income"
    },
    {
      label: "System Lock",
      value: "13 Days",
      subtitle: "109 hours, 23 minutes"
    },
    {
      label: "Growth Rate",
      value: "$16,073.49",
      subtitle: "Main Stocks"
    }
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* Main Card (Previously VISA Card) */}
      <Grid item size={{xs:12, md:6}}>
        <Card sx={{
          height: '100%',
          bgcolor: colors.surface,
          borderRadius: 3,
          border: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" sx={{ 
                fontFamily: '"Inter", sans-serif',
                fontWeight: 700, 
                color: colors.text,
                fontSize: '1.2rem',
                letterSpacing: '0.02em'
              }}>
                {mainCard.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label="Data Files"
                  size="small"
                  sx={{
                    bgcolor: colors.lightGray,
                    color: colors.text,
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 500,
                    fontSize: '0.7rem'
                  }}
                />
                <IconButton size="small">
                  <MoreVert sx={{ color: colors.textSecondary, fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>
            
            <Typography variant="h3" sx={{ 
              fontFamily: '"Inter", sans-serif',
              fontWeight: 700, 
              color: colors.text,
              fontSize: '1.6rem',
              lineHeight: 1.2,
              mb: 1
            }}>
              {mainCard.amount}
            </Typography>
            
            <Typography variant="body2" sx={{ 
              fontFamily: '"Inter", sans-serif',
              color: colors.textSecondary, 
              mb: 3,
              fontSize: '0.8rem',
              fontWeight: 400
            }}>
              {mainCard.subtitle}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                onClick={onReceiveClick}
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  bgcolor: colors.text,
                  color: colors.surface,
                  borderRadius: 2.5,
                  px: 2.5,
                  py: 1,
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  boxShadow: 'none',
                  '&:hover': { 
                    bgcolor: colors.textSecondary,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }
                }}
              >
                View Details
              </Button>
              <Button
                variant="outlined"
                onClick={onSendClick}
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  borderColor: colors.gray,
                  color: colors.text,
                  borderRadius: 2.5,
                  px: 2.5,
                  py: 1,
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  '&:hover': { 
                    borderColor: colors.text,
                    bgcolor: colors.lightGray
                  }
                }}
              >
                Download
              </Button>
            </Box>
            
            <Typography variant="body2" sx={{ 
              fontFamily: '"Inter", sans-serif',
              color: colors.textSecondary, 
              mb: 0.5,
              fontSize: '0.75rem',
              fontWeight: 400
            }}>
              Total file size
            </Typography>
            <Typography variant="h6" sx={{ 
              fontFamily: '"Inter", sans-serif',
              color: colors.orange,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}>
              {mainCard.fee}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Dynamic Stats Cards */}
      {stats.map((stat, index) => (
        <Grid key={index} item size={{xs:12, sm:6, md:2}}>
          <Card sx={{
            height: '100%',
            bgcolor: colors.surface,
            borderRadius: 3,
            border: 'none',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Chip
                label={stat.label}
                size="small"
                sx={{
                  bgcolor: colors.lightGray,
                  color: colors.text,
                  fontSize: '0.7rem',
                  mb: 2
                }}
              />
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: colors.text,
                mb: 1,
                fontSize: '1.4rem'
              }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                {stat.subtitle}
              </Typography>
              
              {/* Chart for Total Records (index 0) */}
              {index === 0 && (
                <Box sx={{ mt: 2 }}>
                  {/* Chart Bars */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 2, px: 0.5 }}>
                    {(() => {
                      // Get real data from engagementData
                      const files = engagementData?.files || [];
                      const totalRecords = engagementData?.total_records || 0;
                      const processedRecords = engagementData?.processed_records || 0;
                      
                      // If we have real files data, use it; otherwise show 3 bars for the files
                      const chartData = files.length > 0 ? files : [
                        { file_name: 'File 1', status: 'COMPLETED', total_records: Math.floor(totalRecords * 0.4), processed_records: Math.floor(totalRecords * 0.4) },
                        { file_name: 'File 2', status: 'PROCESSING', total_records: Math.floor(totalRecords * 0.5), processed_records: Math.floor(processedRecords * 0.6) },
                        { file_name: 'File 3', status: 'COMPLETED', total_records: Math.floor(totalRecords * 0.1), processed_records: Math.floor(totalRecords * 0.1) }
                      ];
                      
                      const maxHeight = 40;
                      const baseHeight = 6;
                      const maxRecords = Math.max(...chartData.map(f => f.total_records));
                      
                      return chartData.map((file, i) => {
                        // Calculate height based on record count
                        const heightRatio = maxRecords > 0 ? file.total_records / maxRecords : 0.5;
                        const height = baseHeight + (heightRatio * maxHeight);
                        
                        // Determine status and colors
                        const isCompleted = file.status === 'COMPLETED';
                        const isProcessing = file.status === 'PROCESSING';
                        const isPending = file.status === 'PENDING';
                        
                        let barColor = colors.lightGray;
                        let status = 'Pending';
                        
                        if (isCompleted) {
                          barColor = colors.primary;
                          status = 'Completed';
                        } else if (isProcessing) {
                          barColor = colors.orange;
                          status = 'Processing';
                        }
                        
                        // Calculate processing percentage
                        const processingPercentage = file.total_records > 0 ? 
                          ((file.processed_records / file.total_records) * 100).toFixed(1) : '0.0';
                        
                        const tooltipContent = (
                          <Box sx={{ p: 1, minWidth: 200 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: 'white' }}>
                              {file.file_name || `File ${i + 1}`}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.9)' }}>
                              Total Records: {file.total_records?.toLocaleString() || '0'}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.9)' }}>
                              Processed: {file.processed_records?.toLocaleString() || '0'}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.9)' }}>
                              Status: {status}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.9)' }}>
                              Progress: {processingPercentage}%
                            </Typography>
                            {file.file_size && (
                              <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.9)' }}>
                                Size: {(file.file_size / (1024 * 1024)).toFixed(1)} MB
                              </Typography>
                            )}
                          </Box>
                        );

                    return (
                          <MuiTooltip
                            key={file.id || i}
                            title={tooltipContent}
                            placement="top"
                            arrow
                            sx={{
                              '& .MuiTooltip-tooltip': {
                                bgcolor: 'rgba(0, 0, 0, 0.9)',
                                borderRadius: 2,
                                fontSize: '0.75rem'
                              },
                              '& .MuiTooltip-arrow': {
                                color: 'rgba(0, 0, 0, 0.9)'
                              }
                            }}
                          >
                            <Box
                        sx={{
                                width: 8, // Wider bars for file data
                                height: height,
                                bgcolor: barColor,
                                borderRadius: 1.5,
                                transition: 'all 0.3s ease',
                                opacity: isCompleted ? 1 : isProcessing ? 0.8 : 0.6,
                                cursor: 'pointer',
                                '&:hover': {
                                  opacity: 1,
                                  transform: 'scaleY(1.1)',
                                  boxShadow: `0 2px 8px ${barColor}40`
                                }
                              }}
                            />
                          </MuiTooltip>
                        );
                      });
                    })()}
                  </Box>
                  
                  {/* Legends */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1.5, mb: 1, px: 0.5 }}>
                    {(() => {
                      const files = engagementData?.files || [];
                      const statusCounts = {
                        PROCESSING: files.filter(f => f.status === 'PROCESSING').length,
                        COMPLETED: files.filter(f => f.status === 'COMPLETED').length,
                        PENDING: files.filter(f => f.status === 'PENDING').length
                      };

                      const legends = [];
                      
                      // First: Processing (if any)
                      if (statusCounts.PROCESSING > 0) {
                        legends.push(
                          <Box key="processing" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{
                              width: 8,
                              height: 8,
                              bgcolor: colors.orange,
                              borderRadius: 1
                            }} />
                            <Typography variant="caption" sx={{ 
                              color: colors.textSecondary, 
                              fontSize: '0.6rem',
                              fontWeight: 500
                            }}>
                              Processing ({statusCounts.PROCESSING})
                            </Typography>
                          </Box>
                        );
                      }
                      
                      // Second: Completed (if any)
                      if (statusCounts.COMPLETED > 0) {
                        legends.push(
                          <Box key="completed" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{
                              width: 8,
                              height: 8,
                              bgcolor: colors.primary,
                              borderRadius: 1
                            }} />
                            <Typography variant="caption" sx={{ 
                              color: colors.textSecondary, 
                              fontSize: '0.6rem',
                              fontWeight: 500
                            }}>
                              Completed ({statusCounts.COMPLETED})
                            </Typography>
                          </Box>
                        );
                      }
                      
                      // Third: Pending (if any)
                      if (statusCounts.PENDING > 0) {
                        legends.push(
                          <Box key="pending" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{
                              width: 8,
                              height: 8,
                              bgcolor: colors.lightGray,
                              borderRadius: 1
                            }} />
                            <Typography variant="caption" sx={{ 
                              color: colors.textSecondary, 
                              fontSize: '0.6rem',
                              fontWeight: 500
                            }}>
                              Pending ({statusCounts.PENDING})
                            </Typography>
                          </Box>
                        );
                      }
                      
                      return legends;
                    })()}
                  </Box>
                  
                  <Typography variant="caption" sx={{ 
                    color: colors.textSecondary, 
                    fontSize: '0.65rem',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    display: 'block'
                  }}>
                    Record trends
                  </Typography>
                </Box>
              )}
              
              {/* Recharts Line Chart for Processing Progress (index 1) */}
              {index === 1 && (
                <Box sx={{ mt: 2 }}>
                  {/* Recharts Line Chart */}
                  <Box sx={{ height: 60, mb: 1 }}>
                    {(() => {
                      const currentProgress = parseInt(stat.value.replace('%', '')) || 0;
                      
                      // Use real file processing data to create progress timeline
                      const files = engagementData?.files || [];
                      const totalRecords = engagementData?.total_records || 0;
                      
                      // Create progress data based on actual file completion
                      const chartData = [];
                      let cumulativeProgress = 0;
                      
                      // Add starting point
                      chartData.push({ 
                        name: 'Start', 
                        progress: 0,
                        step: 0
                      });
                      
                      // Add progress points based on completed files
                      let stepCounter = 1;
                      files.forEach((file) => {
                        if (file.status === 'COMPLETED') {
                          const fileProgress = totalRecords > 0 ? (file.processed_records / totalRecords) * 100 : 0;
                          cumulativeProgress += fileProgress;
                          chartData.push({
                            name: file.file_name?.substring(0, 8) + '...' || `Step ${stepCounter}`,
                            progress: Math.min(cumulativeProgress, 100),
                            step: stepCounter
                          });
                          stepCounter++;
                        }
                      });
                      
                      // Add current progress point
                      chartData.push({
                        name: 'Current',
                        progress: currentProgress,
                        step: stepCounter
                      });

                      // Custom tooltip component
                      const CustomTooltip = ({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <Box sx={{
                              bgcolor: 'rgba(0, 0, 0, 0.9)',
                              color: 'white',
                              p: 1.5,
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              minWidth: 120
                            }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                mb: 0.5, 
                                color: 'white',
                                fontSize: '0.75rem'
                              }}>
                                {label}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                color: 'rgba(255,255,255,0.9)',
                                fontSize: '0.65rem'
                              }}>
                                Progress: {data.value.toFixed(1)}%
                              </Typography>
                              {data.payload.step > 0 && (
                                <Typography variant="caption" sx={{ 
                                  display: 'block',
                                  color: 'rgba(255,255,255,0.9)',
                                  fontSize: '0.65rem'
                                }}>
                                  Step: {data.payload.step}
                                </Typography>
                              )}
                            </Box>
                          );
                        }
                        return null;
                      };

                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                          >
                            <XAxis 
                              dataKey="name" 
                              hide 
                            />
                            <YAxis 
                              domain={[0, Math.max(currentProgress + 10, 10)]}
                              hide 
                            />
                            <Tooltip 
                              content={<CustomTooltip />}
                              cursor={{ stroke: colors.primary, strokeWidth: 1, strokeDasharray: '3 3' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="progress"
                              stroke={colors.primary}
                              strokeWidth={3}
                              dot={{ fill: colors.primary, strokeWidth: 0, r: 3 }}
                              activeDot={{ 
                                r: 5, 
                                fill: colors.primary,
                                stroke: 'white',
                                strokeWidth: 2
                              }}
                              connectNulls
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </Box>
                  
                  {/* Mini legend */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
                    <Typography variant="caption" sx={{ 
                      color: colors.textSecondary, 
                      fontSize: '0.6rem'
                    }}>
                      Start
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: colors.textSecondary, 
                      fontSize: '0.6rem'
                    }}>
                      Current
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {/* Donut Chart for File Status (index 2) */}
              {index === 2 && (
                <Box sx={{ mt: 2 }}>
                  {/* Donut Chart */}
                  <Box sx={{ height: 80, mb: 1, position: 'relative' }}>
                    {(() => {
                      // Get real file status data
                      const files = engagementData?.files || [];
                      const statusCounts = {
                        COMPLETED: files.filter(f => f.status === 'COMPLETED').length,
                        PROCESSING: files.filter(f => f.status === 'PROCESSING').length,
                        PENDING: files.filter(f => f.status === 'PENDING').length,
                        FAILED: files.filter(f => f.status === 'FAILED').length
                      };

                      // Create donut chart data
                      const donutData = [];
                      if (statusCounts.COMPLETED > 0) {
                        donutData.push({ name: 'Completed', value: statusCounts.COMPLETED, color: colors.primary });
                      }
                      if (statusCounts.PROCESSING > 0) {
                        donutData.push({ name: 'Processing', value: statusCounts.PROCESSING, color: colors.orange });
                      }
                      if (statusCounts.PENDING > 0) {
                        donutData.push({ name: 'Pending', value: statusCounts.PENDING, color: colors.lightGray });
                      }
                      if (statusCounts.FAILED > 0) {
                        donutData.push({ name: 'Failed', value: statusCounts.FAILED, color: '#ef4444' });
                      }

                      const totalFiles = files.length;

                      // Custom tooltip for donut chart
                      const DonutTooltip = ({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <Box sx={{
                              bgcolor: 'rgba(0, 0, 0, 0.9)',
                              color: 'white',
                              p: 1.5,
                              borderRadius: 2,
                              fontSize: '0.75rem',
                              minWidth: 100
                            }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                mb: 0.5, 
                                color: 'white',
                                fontSize: '0.75rem'
                              }}>
                                {data.name}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                color: 'rgba(255,255,255,0.9)',
                                fontSize: '0.65rem'
                              }}>
                                Count: {data.value}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                display: 'block',
                                color: 'rgba(255,255,255,0.9)',
                                fontSize: '0.65rem'
                              }}>
                                {totalFiles > 0 ? ((data.value / totalFiles) * 100).toFixed(1) : 0}% of total
                              </Typography>
                            </Box>
                          );
                        }
                        return null;
                      };

                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={donutData}
                              cx="50%"
                              cy="50%"
                              innerRadius={20}
                              outerRadius={35}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {donutData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<DonutTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      );
                    })()}
                    
                    {/* Center text showing total */}
                    <Box sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      pointerEvents: 'none'
                    }}>
                      <Typography variant="caption" sx={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: colors.textPrimary
                      }}>
                        {engagementData?.files?.length || 0}
                      </Typography>
                      <Typography variant="caption" sx={{
                        fontSize: '0.5rem',
                        color: colors.textSecondary,
                        display: 'block'
                      }}>
                        files
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Mini status indicators */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {(() => {
                      const files = engagementData?.files || [];
                      const statusCounts = {
                        COMPLETED: files.filter(f => f.status === 'COMPLETED').length,
                        PROCESSING: files.filter(f => f.status === 'PROCESSING').length,
                        PENDING: files.filter(f => f.status === 'PENDING').length,
                        FAILED: files.filter(f => f.status === 'FAILED').length
                      };

                      const indicators = [];
                      if (statusCounts.COMPLETED > 0) {
                        indicators.push(
                          <Box key="completed" sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <Box sx={{ width: 6, height: 6, bgcolor: colors.primary, borderRadius: '50%' }} />
                            <Typography variant="caption" sx={{ fontSize: '0.55rem', color: colors.textSecondary }}>
                              {statusCounts.COMPLETED}
                            </Typography>
                          </Box>
                        );
                      }
                      if (statusCounts.PROCESSING > 0) {
                        indicators.push(
                          <Box key="processing" sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <Box sx={{ width: 6, height: 6, bgcolor: colors.orange, borderRadius: '50%' }} />
                            <Typography variant="caption" sx={{ fontSize: '0.55rem', color: colors.textSecondary }}>
                              {statusCounts.PROCESSING}
                            </Typography>
                          </Box>
                        );
                      }
                      if (statusCounts.PENDING > 0) {
                        indicators.push(
                          <Box key="pending" sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <Box sx={{ width: 6, height: 6, bgcolor: colors.lightGray, borderRadius: '50%' }} />
                            <Typography variant="caption" sx={{ fontSize: '0.55rem', color: colors.textSecondary }}>
                              {statusCounts.PENDING}
                            </Typography>
                          </Box>
                        );
                      }
                      return indicators;
                    })()}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
