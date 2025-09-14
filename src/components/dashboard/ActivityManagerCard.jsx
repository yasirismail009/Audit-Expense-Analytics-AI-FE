import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Box,
  Button
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  FilterList,
  Search,
  Close,
  Business,
  Assessment,
  Timeline,
  Warning
} from '@mui/icons-material';

import { dashboardColors as colors } from '../../utils/dashboardColors';

export default function ActivityManagerCard({ 
  onSearchChange,
  onMoreClick,
  onVisibilityClick,
  onFilterClick,
  onEnableWalletClick,
  searchPlaceholder = "Search in activities...",
  fileData
}) {
  const files = fileData?.files || [];
  const totalSize = fileData?.totalSize || "0 B";
  const engagement = fileData?.engagement;
  
  // Handle both old single engagement and new aggregate data
  const isAggregateData = engagement?.totalEngagements !== undefined;
  const displayText = isAggregateData 
    ? `${files.length} files across ${engagement.totalEngagements} engagement${engagement.totalEngagements > 1 ? 's' : ''}`
    : engagement 
      ? `${files.length} files from ${engagement.company_name}` 
      : 'No engagement data';

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return colors.text;
      case 'PENDING': return colors.accent;
      case 'PROCESSING': return '#3B82F6';
      case 'FAILED': return '#DC2626';
      default: return colors.gray;
    }
  };
  return (
    <Grid item size={{xs:12, md:9}}>
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
              fontWeight: 600, 
              color: colors.text,
              fontSize: '1.1rem'
            }}>
              File Manager
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={onMoreClick}>
                <MoreVert sx={{ color: colors.textSecondary }} />
              </IconButton>
              <IconButton size="small" onClick={onVisibilityClick}>
                <Visibility sx={{ color: colors.textSecondary }} />
              </IconButton>
              <IconButton size="small" onClick={onFilterClick}>
                <FilterList sx={{ color: colors.textSecondary }} />
              </IconButton>
            </Box>
          </Box>

          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: colors.lightGray,
                border: 'none',
                '& fieldset': { border: 'none' }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 16, color: colors.textSecondary }} />
                </InputAdornment>
              )
            }}
          />

          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {['Files', 'Processing', 'Completed'].map((label, index) => (
              <Chip
                key={index}
                label={label}
                size="small"
                onDelete={() => {}}
                deleteIcon={<Close sx={{ fontSize: 14 }} />}
                sx={{
                  bgcolor: colors.lightGray,
                  color: colors.text,
                  fontSize: '0.75rem'
                }}
              />
            ))}
          </Box>

          <Grid container spacing={2}>
            {/* File List */}
            <Grid item size={{xs:12, md:12}}>
              <Card sx={{
                bgcolor: colors.lightGray,
                borderRadius: 3,
                border: 'none'
              }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 600, 
                      color: colors.text
                    }}>
                      Recent files
                    </Typography>
                    <IconButton size="small" sx={{ color: colors.textSecondary }}>
                      <MoreVert />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 120, overflowY: 'auto' }}>
                    {files.slice(0, 3).map((file, index) => (
                      <Box key={file.id || index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: getStatusColor(file.status)
                        }} />
                        <Typography variant="body2" sx={{ 
                          color: colors.textSecondary,
                          fontSize: '0.75rem',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {file.file_name || `File ${index + 1}`}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: getStatusColor(file.status),
                          fontSize: '0.65rem',
                          fontWeight: 600
                        }}>
                          {file.status}
                        </Typography>
                      </Box>
                    ))}
                    {files.length === 0 && (
                      <Typography variant="body2" sx={{ color: colors.textSecondary, fontStyle: 'italic' }}>
                        No files available
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

      
           
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
}
