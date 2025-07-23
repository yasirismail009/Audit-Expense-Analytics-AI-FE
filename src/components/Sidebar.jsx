import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Typography, Box, Switch, Avatar, Chip } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PaymentIcon from '@mui/icons-material/Payment';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import EuroIcon from '@mui/icons-material/Euro';
import logo from '../assets/full_logo.svg';

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, active: true , link: '/'},
  // { text: 'Payment', icon: <PaymentIcon /> },
  // { text: 'Transaction', icon: <TrendingUpIcon /> },
  // { text: 'Cards', icon: <CreditCardIcon /> },
];

const supportItems = [
  // { text: 'Capital', icon: <AccountBalanceWalletIcon /> },
  // { text: 'Vaults', icon: <BarChartIcon /> },
  // { text: 'Reports', icon: <BarChartIcon /> },
  // { text: 'Earn', icon: <EuroIcon />, badge: true },
];

export default function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: 'border-box',
          background: '#f8fafc',
          borderRight: '1px solid #e5e7eb',
          pt: 2,
        },
      }}
    >
      <Box sx={{ px: 3, pb: 2, display: 'flex', alignItems: 'center' }}>
        <img src={logo} alt="logo" style={{ width: 100, height: 100 }} />
      </Box>
      <Divider sx={{ mb: 1 }} />
      <List sx={{ px: 1 }}>
        {navItems.map((item) => (
          <ListItem
            key={item.text}
            sx={{
              mb: 0.5,
              borderRadius: 2,
              bgcolor: item.active ? '#fae2ff' : 'transparent',
              color: item.active ? '#9A5FA3' : '#334155',
              fontWeight: item.active ? 700 : 500,
              '&:hover': { bgcolor: '#fae2ff', color: '#9A5FA3' },
              px: 2,
              py: 1.2,
              cursor: 'pointer',
            }}
          >
            <ListItemIcon sx={{ color: item.active ? '#925A9B' : '#94a3b8', minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: item.active ? 700 : 500, fontSize: 15 }} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      {/* <Typography variant="caption" sx={{ pl: 4, color: '#64748B', fontWeight: 700, letterSpacing: 1 }}>SUPPORT</Typography> */}
      <List sx={{ px: 1, mt: 0.5 }}>
        {supportItems.map((item) => (
          <ListItem
            key={item.text}
            sx={{
              mb: 0.5,
              borderRadius: 2,
              px: 2,
              py: 1.2,
              color: '#334155',
              '&:hover': { bgcolor: '#e6faf5', color: '#9A5FA3' },
              cursor: 'pointer',
            }}
          >
            <ListItemIcon sx={{ color: '#94a3b8', minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500, fontSize: 15 }} />
            {item.badge && <Chip label="E 150" size="small" sx={{ bgcolor: '#e6faf5', color: '#00B686', fontWeight: 700, ml: 1 }} />} 
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ mt: 2 }} />
      <Box sx={{ p: 3 }}>
        {/* <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="body2" fontWeight={600} color="#64748B">Pro Mode</Typography>
          <Switch size="small" />
        </Box> */}
        <Box display="flex" alignItems="center" mt={2}>
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#f6c9ff', color: '#925A9B', fontWeight: 700 }}>M</Avatar>
          <Box>
            <Typography variant="body2" fontWeight={700} color="#925A9B">M Yasir Ismail</Typography>
            <Typography variant="caption" color="#64748B">yasirismail321@gmail.com</Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
} 