import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  InputBase, 
  Box, 
  IconButton, 
  Button, 
  Paper, 
  Avatar, 
  Menu, 
  MenuItem, 
  Divider, 
  Badge,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../assets/full_logo.svg';
import UploadModal from './UploadModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { colorScheme } from '../utils/colorScheme';
import { useAuth } from '../utils/authContext';

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, link: '/' },
];

export default function ModernToolbar() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleUploadSuccess = (data) => {
    window.location.reload();
  };

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuClick = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    navigate('/login');
  };

  const handleNavigation = (link) => {
    navigate(link);
    handleMobileMenuClose();
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

  const isActiveRoute = (link) => {
    return location.pathname === link;
  };

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0} 
        sx={{ 
          bgcolor: colorScheme.cardBackground,
          borderBottom: `1px solid ${colorScheme.border}`,
          color: colorScheme.textPrimary,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          p: 0 
        }}
      >
        <Toolbar sx={{ minHeight: 80, px: { xs: 2, md: 4 }, py: 2 }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'space-between' }}>
            
            {/* Left side - Logo and Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* Logo */}
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
                <img src={logo} alt="logo" style={{ width: 40, height: 40 }} />
              </Box>

              {/* Desktop Navigation */}
              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {navItems.map((item) => (
                    <Button
                      key={item.text}
                      onClick={() => handleNavigation(item.link)}
                      startIcon={item.icon}
                      sx={{
                        bgcolor: isActiveRoute(item.link) ? colorScheme.sidebarBackground : 'transparent',
                        color: isActiveRoute(item.link) ? colorScheme.primary : colorScheme.textSecondary,
                        borderRadius: 3,
                        fontWeight: isActiveRoute(item.link) ? 700 : 500,
                        textTransform: 'none',
                        px: 3,
                        py: 1.5,
                        transition: 'all 0.3s ease',
                        border: isActiveRoute(item.link) ? `1px solid ${colorScheme.primary}` : '1px solid transparent',
                        '&:hover': {
                          bgcolor: colorScheme.sidebarBackground,
                          color: colorScheme.primary,
                        },
                      }}
                    >
                      {item.text}
                    </Button>
                  ))}
                </Box>
              )}

              {/* Mobile Menu Button */}
              {isMobile && (
                <IconButton
                  onClick={handleMobileMenuClick}
                  sx={{
                    bgcolor: colorScheme.cardBackground,
                    borderRadius: 2,
                    p: 1.5,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    border: `1px solid ${colorScheme.border}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: colorScheme.sidebarBackground,
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <MenuIcon sx={{ color: colorScheme.primary }} />
                </IconButton>
              )}
            </Box>

            {/* Center - Search Bar */}
            <Paper
              component="form"
              sx={{
                p: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                width: { xs: 200, sm: 320 },
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                bgcolor: colorScheme.cardBackground,
                border: `1px solid ${colorScheme.border}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                },
                '&:focus-within': {
                  boxShadow: `0 0 0 3px ${colorScheme.primary}20`,
                  border: `1px solid ${colorScheme.primary}`,
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
                  bgcolor: colorScheme.cardBackground,
                  color: colorScheme.primary,
                  borderRadius: 3,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  py: 1.5,
                  border: `1px solid ${colorScheme.border}`,
                  transition: 'all 0.2s ease',
                  display: { xs: 'none', sm: 'flex' },
                  '&:hover': {
                    bgcolor: colorScheme.sidebarBackground,
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
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
                  bgcolor: colorScheme.primary,
                  borderRadius: 3,
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  py: 1.5,
                  boxShadow: '0 2px 6px rgba(30, 64, 175, 0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: colorScheme.primaryDark,
                    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.4)',
                  },
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Upload CSV</Box>
                <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>Upload</Box>
              </Button>

              {/* Notifications */}
              <IconButton
                sx={{
                  bgcolor: colorScheme.cardBackground,
                  borderRadius: 2,
                  p: 1.5,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: `1px solid ${colorScheme.border}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: colorScheme.sidebarBackground,
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
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
                    bgcolor: colorScheme.cardBackground,
                    borderRadius: 3,
                    px: 2.5,
                    py: 1.5,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    textTransform: 'none',
                    color: colorScheme.textPrimary,
                    border: `1px solid ${colorScheme.border}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: colorScheme.sidebarBackground,
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: colorScheme.primary,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      boxShadow: '0 1px 3px rgba(30, 64, 175, 0.3)',
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
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      border: `1px solid ${colorScheme.border}`,
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
                      bgcolor: colorScheme.sidebarBackground,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: colorScheme.primary,
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
                        bgcolor: colorScheme.sidebarBackground,
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
                        bgcolor: colorScheme.sidebarBackground,
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
                        bgcolor: `${colorScheme.error}15`,
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

      {/* Mobile Navigation Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: `1px solid ${colorScheme.border}`,
            overflow: 'hidden',
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {navItems.map((item) => (
          <MenuItem
            key={item.text}
            onClick={() => handleNavigation(item.link)}
            sx={{
              py: 2,
              px: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              bgcolor: isActiveRoute(item.link) ? colorScheme.sidebarBackground : 'transparent',
              color: isActiveRoute(item.link) ? colorScheme.primary : colorScheme.textPrimary,
              fontWeight: isActiveRoute(item.link) ? 600 : 400,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: colorScheme.sidebarBackground,
              },
            }}
          >
            {item.icon}
            <Typography variant="body2">{item.text}</Typography>
            {isActiveRoute(item.link) && (
              <Chip 
                label="Active" 
                size="small" 
                sx={{ 
                  bgcolor: colorScheme.primary, 
                  color: 'white', 
                  fontWeight: 600,
                  ml: 'auto'
                }} 
              />
            )}
          </MenuItem>
        ))}
      </Menu>
      
      <UploadModal 
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
}

