import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  TextField
} from '@mui/material';
import {
  Menu,
  Search,
  Add,
  EventNote
} from '@mui/icons-material';
import { dashboardColors as colors } from '../../utils/dashboardColors';
import logo from '../../assets/full_logo.svg';

export default function AppHeader({ 
  onMenuClick,
  onSearchChange,
  onAddClick,
  onCalendarClick,
  onUserClick,
  userName = "Muhammad Yasir",
  userRole = "Software Engineer",
  userInitials = "MY",
  searchPlaceholder = "Start searching here...",
  showSearch = true,
  showAddButton = true,
  showCalendar = true
}) {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      px: 3,
      py: 2,
      bgcolor: colors.headerBg
    }}>
      {/* Left - Menu and Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 5, px: 3.5, }}>
        
         
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Box sx={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.surface,
            fontWeight: 700,
            fontSize: '0.9rem'
          }}>
           <img src={logo} alt="logo" style={{ width: 80, height: 40 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ 
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600, 
              color: colors.text,
              fontSize: '0.9rem',
              lineHeight: 1.2,
              letterSpacing: '-0.01em'
            }}>
              Analytics
            </Typography>
            <Typography variant="body2" sx={{ 
              fontFamily: '"Inter", sans-serif',
              color: colors.textSecondary,
              fontSize: '0.75rem',
              lineHeight: 1.1,
              mt: -0.1,
              fontWeight: 400
            }}>
              Dashboard
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right - User Profile and Search */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        {showAddButton && (
          <IconButton 
            onClick={onAddClick}
            sx={{ 
              bgcolor: 'transparent',
              color: colors.text,
              width: 32,
              height: 32,
              border: `1px solid ${colors.gray}`,
              borderRadius: '50%',
              '&:hover': {
                bgcolor: colors.lightGray
              }
            }}
          >
            <Add sx={{ fontSize: 18 }} />
          </IconButton>
        )}
        
        <Avatar 
          onClick={onUserClick}
          sx={{ 
            width: 32,
            height: 32,
            bgcolor: '#925A9B',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {userInitials}
        </Avatar>
        
        <Box>
          <Typography variant="body2" sx={{ 
            fontFamily: '"Inter", sans-serif',
            fontWeight: 500, 
            color: colors.text,
            fontSize: '0.8rem',
            lineHeight: 1.3
          }}>
            {userName}
          </Typography>
          <Typography variant="caption" sx={{ 
            fontFamily: '"Inter", sans-serif',
            color: colors.textSecondary,
            fontSize: '0.7rem',
            lineHeight: 1.2,
            fontWeight: 400
          }}>
            {userRole}
          </Typography>
        </Box>
        
        {/* Search */}
        {showSearch && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <Search sx={{ color: colors.textSecondary, fontSize: 18 }} />
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              sx={{
                width: 220,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'transparent',
                  border: 'none',
                  '& fieldset': { border: 'none' },
                  '&:hover fieldset': { border: 'none' },
                  '&.Mui-focused fieldset': { border: 'none' }
                },
                '& .MuiInputBase-input': {
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '0.8rem',
                  py: 1,
                  px: 1,
                  color: colors.textSecondary,
                  fontWeight: 400,
                  '&::placeholder': {
                    color: colors.textSecondary,
                    opacity: 0.6,
                    fontFamily: '"Inter", sans-serif'
                  }
                }
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
