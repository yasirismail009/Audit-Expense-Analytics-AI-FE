import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, InputBase, Box, IconButton, Button, Paper, Avatar, Menu, MenuItem, Divider, Badge } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import UploadModal from './UploadModal';
import { useNavigate } from 'react-router-dom';
import { colorScheme } from '../utils/colorScheme';
import { useAuth } from '../utils/authContext';

export default function TopBar() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleUploadSuccess = (data) => {
    // Refresh the page or update the data
    window.location.reload();
  };

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName} ${lastName}`.trim() || user.username || 'User';
  };

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          color: 'black',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
          p: 0 
        }}
      >
        <Toolbar sx={{ minHeight: 80, px: { xs: 2, md: 4 }, py: 2 }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'space-between' }}>
            {/* Search Bar */}
            <Paper
              component="form"
              sx={{
                p: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                width: { xs: 200, sm: 320 },
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-1px)',
                },
              }}
              elevation={0}
            >
              <IconButton sx={{ p: '8px', color: colorScheme.primary }} aria-label="search">
                <SearchIcon />
              </IconButton>
              <InputBase 
                sx={{ 
                  ml: 1, 
                  flex: 1,
                  fontSize: '0.95rem',
                  '& input': {
                    '&::placeholder': {
                      color: colorScheme.textSecondary,
                      opacity: 0.7,
                    },
                  },
                }} 
                placeholder="Search analytics..." 
                inputProps={{ 'aria-label': 'search' }} 
              />
            </Paper>

            {/* Right side controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Date Range Button */}
              <Button
                startIcon={<CalendarTodayIcon />}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  color: colorScheme.primary,
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  py: 1.5,
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                18 OCT 2024 - 18 NOV 2024
              </Button>

              {/* Upload Button */}
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => setUploadModalOpen(true)}
                sx={{
                  background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
                  borderRadius: 3,
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  py: 1.5,
                  boxShadow: '0 4px 20px rgba(146, 90, 155, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${colorScheme.secondary}, ${colorScheme.primary})`,
                    boxShadow: '0 6px 25px rgba(146, 90, 155, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Upload CSV
              </Button>

              {/* Notifications */}
              <IconButton
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 2,
                  p: 1.5,
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 1)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon sx={{ color: colorScheme.primary }} />
                </Badge>
              </IconButton>
              
              {/* User Menu */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  onClick={handleUserMenuClick}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 3,
                    px: 2.5,
                    py: 1.5,
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                    textTransform: 'none',
                    color: colorScheme.textPrimary,
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 1)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(146, 90, 155, 0.3)',
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                  <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: colorScheme.textPrimary,
                        fontSize: '0.9rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {getUserDisplayName()}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colorScheme.textSecondary,
                        fontSize: '0.75rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {user?.email || ''}
                    </Typography>
                  </Box>
                </Button>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 250,
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      overflow: 'hidden',
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem
                    sx={{
                      py: 2,
                      px: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      bgcolor: 'rgba(146, 90, 155, 0.05)',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})`,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                      }}
                    >
                      {getUserInitials()}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: colorScheme.textPrimary }}>
                        {getUserDisplayName()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colorScheme.textSecondary }}>
                        {user?.email || ''}
                      </Typography>
                    </Box>
                  </MenuItem>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <MenuItem
                    sx={{
                      py: 1.5,
                      px: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(146, 90, 155, 0.08)',
                      },
                    }}
                  >
                    <AccountCircleIcon sx={{ color: colorScheme.textSecondary }} />
                    <Typography variant="body2">Profile</Typography>
                  </MenuItem>
                  
                  <MenuItem
                    sx={{
                      py: 1.5,
                      px: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(146, 90, 155, 0.08)',
                      },
                    }}
                  >
                    <SettingsIcon sx={{ color: colorScheme.textSecondary }} />
                    <Typography variant="body2">Settings</Typography>
                  </MenuItem>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      py: 1.5,
                      px: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      color: colorScheme.error,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(244, 67, 54, 0.08)',
                      },
                    }}
                  >
                    <LogoutIcon />
                    <Typography variant="body2">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      <UploadModal 
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
} 