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
import { useNavigate, useLocation } from 'react-router-dom';
import { colorScheme } from '../utils/colorScheme';
import { useAuth } from '../utils/authContext';

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, link: '/' },
];

export default function ModernToolbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
        position="sticky" 
        elevation={0} 
        sx={{ 
          bgcolor: colorScheme.cardBackground,
          color: colorScheme.textPrimary,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          p: 0,
          top: 0,
          zIndex: 1000
        }}
      >
        <Toolbar sx={{ minHeight: 70, px: { xs: 2, md: 4 }, py: 1.5 }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'space-between' }}>
            
            {/* Left side - Logo and Navigation */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* Logo */}
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
                <img src={logo} alt="logo" style={{ width: 100, height: 40 }} />
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
                        px: 2.5,
                        py: 1,
                        fontSize: '0.9rem',
                        transition: 'all 0.3s ease',
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
                    bgcolor: 'transparent',
                    borderRadius: 2,
                    p: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: colorScheme.sidebarBackground,
                    },
                  }}
                >
                  <MenuIcon sx={{ color: colorScheme.primary }} />
                </IconButton>
              )}
            </Box>

            {/* Right side controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Date Range Button */}
              <Button
                startIcon={<CalendarTodayIcon />}
                sx={{
                  bgcolor: 'transparent',
                  color: colorScheme.primary,
                  borderRadius: 3,
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 2.5,
                  py: 1,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  display: { xs: 'none', sm: 'flex' },
                  '&:hover': {
                    bgcolor: colorScheme.sidebarBackground,
                  },
                }}
              >
                18 OCT 2024 - 18 NOV 2024
              </Button>

              {/* Upload Button */}
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => navigate('/upload')}
                sx={{
                  bgcolor: colorScheme.primary,
                  borderRadius: 3,
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 2.5,
                  py: 1,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: colorScheme.primaryDark,
                  },
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Upload Files</Box>
                <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>Upload</Box>
              </Button>

              {/* Notifications */}
              <IconButton
                sx={{
                  bgcolor: 'transparent',
                  borderRadius: 2,
                  p: 1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: colorScheme.sidebarBackground,
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
                    bgcolor: 'transparent',
                    borderRadius: 3,
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    color: colorScheme.textPrimary,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: colorScheme.sidebarBackground,
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: colorScheme.primary,
                      fontSize: '0.8rem',
                      fontWeight: 600,
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
    </>
  );
}

