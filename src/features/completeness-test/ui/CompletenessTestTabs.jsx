import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { 
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Security as SecurityIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { dashboardColors as colors } from '../../../utils/dashboardColors';

export const CompletenessTestTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { 
      label: 'Overview', 
      icon: AssessmentIcon,
      value: 0
    },
    { 
      label: 'Financial Data', 
      icon: TrendingUpIcon,
      value: 1
    },
    { 
      label: 'Account Analysis', 
      icon: AccountBalanceIcon,
      value: 2
    },
    { 
      label: 'Audit & Quality', 
      icon: SecurityIcon,
      value: 3
    },
    { 
      label: 'Document Stats', 
      icon: InfoIcon,
      value: 4
    }
  ];

  return (
    <Box sx={{ 
      borderBottom: 1, 
      borderColor: 'divider',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      borderRadius: '12px 12px 0 0'
    }}>
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => onTabChange(newValue)}
        sx={{ 
          px: 3,
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
          }
        }}
      >
        {tabs.map((tab) => (
          <Tab 
            key={tab.value}
            icon={<tab.icon />} 
            label={tab.label} 
            iconPosition="start"
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600,
              minHeight: 64,
              px: 3,
              py: 2,
              borderRadius: '8px 8px 0 0',
              mx: 0.5,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(102, 126, 234, 0.08)',
                transform: 'translateY(-2px)'
              },
              '&.Mui-selected': {
                bgcolor: 'rgba(102, 126, 234, 0.12)',
                color: colors.primary,
                '& .MuiSvgIcon-root': {
                  color: colors.primary
                }
              }
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};
