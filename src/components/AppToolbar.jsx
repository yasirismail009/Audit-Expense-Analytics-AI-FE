import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  Badge
} from '@mui/material';
import {
  Menu,
  CloudUpload,
  Notifications,
  CalendarToday
} from '@mui/icons-material';

// Color scheme for consistency
const colors = {
  primary: '#925A9B',
  primaryDark: '#7A4A82',
  primaryLight: '#A67BB0',
  secondary: '#925A9B',
  secondaryLight: '#A67BB0',
  black: '#000000',
  blackLight: '#1F2937',
  blackLighter: '#374151',
  gray: '#6B7280',
  grayLight: '#9CA3AF',
  grayLighter: '#E5E7EB',
  white: '#FFFFFF',
  success: '#10B981',
  warning: '#925A9B',
  error: '#EF4444',
  info: '#3B82F6',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F3F4F6'
};

export default function AppToolbar({ 
  onUploadClick, 
  onDashboardClick, 
  onNotificationsClick,
  onUserClick,
  notificationCount = 3,
  userName = "User",
  userInitial = "U",
  dateRange = "18 OCT 2024 - 18 NOV 2024"
}) {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      p: 2,
      bgcolor: '#F8FAFC' ,
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      {/* Left Side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 700, 
          color: colors.primary,
          fontSize: '1.1rem'
        }}>
          LYCA
        </Typography>
        <Button
          variant="contained"
          startIcon={<Menu />}
          onClick={onDashboardClick}
          sx={{
            bgcolor: colors.primary,
            color: colors.white,
            borderRadius: 2,
            px: 2,
            py: 0.5,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.8rem',
            '&:hover': {
              bgcolor: colors.primaryDark
            }
          }}
        >
          Dashboard
        </Button>
      </Box>

      {/* Right Side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday sx={{ color: colors.gray, fontSize: 18 }} />
          <Typography variant="body2" sx={{ 
            color: colors.black,
            fontSize: '0.8rem',
            fontWeight: 500
          }}>
            {dateRange}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={onUploadClick}
          sx={{
            bgcolor: colors.primary,
            color: colors.white,
            borderRadius: 2,
            px: 2,
            py: 0.5,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.8rem',
            '&:hover': {
              bgcolor: colors.primaryDark
            }
          }}
        >
          Upload Files
        </Button>
        <IconButton 
          sx={{ position: 'relative' }}
          onClick={onNotificationsClick}
        >
          <Notifications sx={{ color: colors.gray }} />
          <Badge
            badgeContent={notificationCount}
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: colors.error,
                color: colors.white,
                fontSize: '0.6rem',
                minWidth: 16,
                height: 16
              }
            }}
          />
        </IconButton>
        <Box 
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          onClick={onUserClick}
        >
          <Avatar sx={{ 
            bgcolor: colors.black,
            width: 32,
            height: 32,
            fontSize: '0.8rem',
            color: colors.white
          }}>
            {userInitial}
          </Avatar>
          <Typography variant="body2" sx={{ 
            color: colors.black,
            fontSize: '0.8rem',
            fontWeight: 500
          }}>
            {userName}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
