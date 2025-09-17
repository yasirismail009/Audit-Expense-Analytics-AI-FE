import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Button,
  Tooltip
} from '@mui/material';
import {
  MoreVert,
  Close,
  Business,
  Person,
  CalendarToday,
  Visibility,
  Assessment,
  FilePresent,
  Security
} from '@mui/icons-material';

import { dashboardColors as colors } from '../../utils/dashboardColors';

export default function BusinessRatingCard({ 
  onMoreClick,
  onCloseClick,
  onEngagementClick,
  onViewReport,
  onCompletenessReport,
  engagements = [],
  title = "Engagement Listings"
}) {
  // Get status color
  const getStatusColor = (completedFiles, totalFiles) => {
    if (totalFiles === 0) return colors.gray;
    const percentage = (completedFiles / totalFiles) * 100;
    if (percentage === 100) return colors.text;
    if (percentage >= 50) return colors.orange;
    if (percentage > 0) return '#3B82F6';
    return colors.gray;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Calculate total file size for engagement
  const getTotalFileSize = (files) => {
    if (!files || !Array.isArray(files)) return 0;
    return files.reduce((total, file) => total + (file.file_size || 0), 0);
  };

  // Handle view report click
  const handleViewReport = (engagement, event) => {
    event.stopPropagation(); // Prevent row click
    if (onViewReport) {
      onViewReport(engagement);
    } else if (onEngagementClick) {
      onEngagementClick(engagement);
    }
  };

  // Handle completeness report click
  const handleCompletenessReport = (engagement, event) => {
    event.stopPropagation(); // Prevent row click
    if (onCompletenessReport) {
      onCompletenessReport(engagement);
    }
  };

  return (
    <Grid item size={{xs:12, md:12}}>
      <Card sx={{
        height: '100%',
        bgcolor: colors.surface,
        borderRadius: 3,
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ 
              color: colors.text,
              fontSize: '1.1rem',
              fontWeight: 600
            }}>
              {title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: colors.textSecondary }} onClick={onMoreClick}>
                <MoreVert />
              </IconButton>
              <IconButton size="small" sx={{ color: colors.textSecondary }} onClick={onCloseClick}>
                <Close />
              </IconButton>
            </Box>
          </Box>

          <TableContainer sx={{ maxHeight: 400, overflowY: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ 
                    bgcolor: colors.lightGray, 
                    fontWeight: 600, 
                    fontSize: '0.75rem',
                    color: colors.text
                  }}>
                    Engagement Details
                  </TableCell>
                  <TableCell sx={{ 
                    bgcolor: colors.lightGray, 
                    fontWeight: 600, 
                    fontSize: '0.75rem',
                    color: colors.text
                  }}>
                    Files & Records
                  </TableCell>
                  <TableCell sx={{ 
                    bgcolor: colors.lightGray, 
                    fontWeight: 600, 
                    fontSize: '0.75rem',
                    color: colors.text
                  }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ 
                    bgcolor: colors.lightGray, 
                    fontWeight: 600, 
                    fontSize: '0.75rem',
                    color: colors.text
                  }}>
                    Progress
                  </TableCell>
                  <TableCell sx={{ 
                    bgcolor: colors.lightGray, 
                    fontWeight: 600, 
                    fontSize: '0.75rem',
                    color: colors.text,
                    textAlign: 'center'
                  }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {engagements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" sx={{ color: colors.textSecondary, fontStyle: 'italic' }}>
                        No engagements available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  engagements.map((engagement, index) => {
                    const completedFiles = engagement.status_summary?.COMPLETED || 0;
                    const totalFiles = engagement.total_files || 0;
                    const progressPercentage = totalFiles > 0 ? Math.round((completedFiles / totalFiles) * 100) : 0;
                    const totalFileSize = getTotalFileSize(engagement.files);
                    
                    return (
                      <TableRow 
                        key={engagement.engagement_id || index}
                        hover
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: colors.lightGray }
                        }}
                        onClick={() => onEngagementClick && onEngagementClick(engagement)}
                      >
                        {/* Engagement Details */}
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ 
                              width: 36, 
                              height: 36, 
                              bgcolor: colors.orange, 
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}>
                              {engagement.client_name ? engagement.client_name.charAt(0).toUpperCase() : 'E'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600, 
                                fontSize: '0.8rem',
                                color: colors.text,
                                mb: 0.2
                              }}>
                                {engagement.engagement_id || 'Unknown'}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                color: colors.textSecondary,
                                fontSize: '0.7rem',
                                display: 'block'
                              }}>
                                <Person sx={{ fontSize: 10, mr: 0.5 }} />
                                {engagement.client_name || 'No client'}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                color: colors.textSecondary,
                                fontSize: '0.7rem',
                                display: 'block'
                              }}>
                                <Business sx={{ fontSize: 10, mr: 0.5 }} />
                                {engagement.company_name || 'No company'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Files & Records */}
                        <TableCell sx={{ py: 2 }}>
                          <Box>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600, 
                              fontSize: '0.75rem',
                              color: colors.text,
                              mb: 0.2
                            }}>
                              <FilePresent sx={{ fontSize: 12, mr: 0.5 }} />
                              {totalFiles} Files
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: colors.textSecondary,
                              fontSize: '0.65rem',
                              display: 'block'
                            }}>
                              {(engagement.total_records || 0).toLocaleString()} records
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: colors.textSecondary,
                              fontSize: '0.65rem',
                              display: 'block'
                            }}>
                              {formatFileSize(totalFileSize)}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Status */}
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            size="small"
                            label={progressPercentage === 100 ? 'Complete' : progressPercentage > 0 ? 'In Progress' : 'Pending'}
                            sx={{
                              bgcolor: getStatusColor(completedFiles, totalFiles),
                              color: colors.surface,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              height: 22
                            }}
                          />
                        </TableCell>

                        {/* Progress */}
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ 
                              color: colors.text,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              minWidth: 30
                            }}>
                              {progressPercentage}%
                            </Typography>
                            <Box sx={{ 
                              flex: 1, 
                              height: 6, 
                              bgcolor: colors.lightGray, 
                              borderRadius: 3,
                              overflow: 'hidden',
                              minWidth: 60
                            }}>
                              <Box sx={{ 
                                width: `${progressPercentage}%`,
                                height: '100%',
                                bgcolor: getStatusColor(completedFiles, totalFiles),
                                transition: 'width 0.3s ease'
                              }} />
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Actions */}
                        <TableCell sx={{ py: 2, textAlign: 'center' }}>
                          {progressPercentage === 100 ? (
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="View Report" arrow>
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={<Assessment />}
                                  onClick={(event) => handleViewReport(engagement, event)}
                                  sx={{
                                    bgcolor: colors.text,
                                    color: colors.surface,
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1.5,
                                    minWidth: 'auto',
                                    '&:hover': {
                                      bgcolor: colors.primaryDark,
                                      transform: 'translateY(-1px)',
                                      boxShadow: '0 2px 8px rgba(146, 90, 155, 0.3)'
                                    },
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  View
                                </Button>
                              </Tooltip>
                              {onCompletenessReport && (
                                <Tooltip title="Completeness Test" arrow>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Security />}
                                    onClick={(event) => handleCompletenessReport(engagement, event)}
                                    sx={{
                                      borderColor: colors.orange,
                                      color: colors.orange,
                                      fontSize: '0.65rem',
                                      fontWeight: 600,
                                      textTransform: 'none',
                                      px: 1,
                                      py: 0.5,
                                      borderRadius: 1.5,
                                      minWidth: 'auto',
                                      '&:hover': {
                                        bgcolor: `${colors.orange}10`,
                                        borderColor: colors.orange,
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 2px 8px rgba(146, 90, 155, 0.15)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    Test
                                  </Button>
                                </Tooltip>
                              )}
                            </Box>
                          ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <Typography variant="caption" sx={{ 
                                color: colors.textSecondary,
                                fontSize: '0.65rem',
                                fontStyle: 'italic'
                              }}>
                                Processing...
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Grid>
  );
}
