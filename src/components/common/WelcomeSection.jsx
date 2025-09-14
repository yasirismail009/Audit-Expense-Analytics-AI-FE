import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton
} from '@mui/material';
import {
  CalendarToday,
  ArrowForward,
  KeyboardVoice,
  EventNote,
  Assessment
} from '@mui/icons-material';
import { dashboardColors as colors } from '../../utils/dashboardColors';

export default function WelcomeSection({ 
  currentDate = "19",
  dayOfWeek = "Tuesday,",
  month = "December",
  year = "2025",
  onTasksClick,
  onCalendarClick,
  onVoiceClick,
  onCompletenessReportClick,
  welcomeMessage = "Hey, Need help? 👋",
  subMessage = "Just ask me anything!"
}) {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mb: 4,
      py: 2
    }}>
      {/* Left - Date and Tasks */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Date Section */}
        <Box sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: colors.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.surface,
          fontWeight: 700,
          fontSize: '1.5rem'
        }}>
          {currentDate}
        </Box>
        <Box sx={{ mx: 0.5 }}>
          <Typography variant="h6" sx={{ 
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600, 
            color: colors.text,
            fontSize: '0.9rem',
            lineHeight: 1.1,
            letterSpacing: '-0.01em'
          }}>
            {dayOfWeek}
          </Typography>
          <Typography variant="body2" sx={{ 
            fontFamily: '"Inter", sans-serif',
            color: colors.textSecondary,
            fontSize: '0.8rem',
            fontWeight: 400,
            lineHeight: 1.1
          }}>
            {month}
          </Typography>
          <Typography variant="body2" sx={{ 
            fontFamily: '"Inter", sans-serif',
            color: colors.textSecondary,
            fontSize: '0.8rem',
            fontWeight: 400,
            lineHeight: 1.1
          }}>
            {year}
          </Typography>
        </Box>
        
        {/* Show Tasks Button */}
        <Button
          variant="contained"
          endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
          onClick={onTasksClick}
          sx={{
            fontFamily: '"Inter", sans-serif',
            bgcolor: colors.orange,
            color: colors.surface,
            borderRadius: 3,
            px: 2,
            py: 0.8,
            fontWeight: 500,
            textTransform: 'none',
            fontSize: '0.75rem',
            ml: 1,
            boxShadow: 'none',
            '&:hover': { 
              bgcolor: '#75487c',
              boxShadow: '0 2px 8px rgba(151, 68, 239, 0.3)'
            }
          }}
        >
          Create Analytics
        </Button>
        
        {/* Completeness Report Button */}
        <Button
          variant="outlined"
          startIcon={<Assessment sx={{ fontSize: 14 }} />}
          onClick={onCompletenessReportClick}
          sx={{
            fontFamily: '"Inter", sans-serif',
            borderColor: colors.orange,
            color: colors.orange,
            borderRadius: 3,
            px: 2,
            py: 0.8,
            fontWeight: 500,
            textTransform: 'none',
            fontSize: '0.75rem',
            ml: 1,
            boxShadow: 'none',
            '&:hover': { 
              bgcolor: `${colors.orange}10`,
              borderColor: colors.orange,
              boxShadow: '0 2px 8px rgba(151, 68, 239, 0.15)'
            }
          }}
        >
          Completeness Test
        </Button>
        
        {/* Calendar Icon */}
        <IconButton 
          onClick={onCalendarClick}
          sx={{ 
            ml: 0.5,
            color: colors.text,
            p: 0.8
          }}
        >
          <EventNote sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Center - Greeting and Mic */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h2" sx={{ 
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600, 
            color: colors.text,
            fontSize: '1.9rem',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            mb: 0.5
          }}>
            {welcomeMessage}
          </Typography>
          <Typography variant="h5" sx={{ 
            fontFamily: '"Inter", sans-serif',
            color: colors.textSecondary,
            fontSize: '1.1rem',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            lineHeight: 1.3
          }}>
            {subMessage}
          </Typography>
        </Box>

        {/* Mic Button */}
        {/* <IconButton 
          onClick={onVoiceClick}
          sx={{
            bgcolor: colors.text,
            color: colors.surface,
            width: 52,
            height: 52,
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            '&:hover': { 
              bgcolor: colors.textSecondary,
              transform: 'scale(1.05)'
            }
          }}
        >
          <KeyboardVoice sx={{ fontSize: 24 }} />
        </IconButton> */}
      </Box>
    </Box>
  );
}
