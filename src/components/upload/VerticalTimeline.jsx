import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip,
  Avatar
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { colorScheme } from '../../utils/colorScheme';

export default function VerticalTimeline({ steps, activeStep, onStepClick }) {
  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 3,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${colorScheme.border}`,
      bgcolor: colorScheme.cardBackground,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Typography variant="subtitle1" fontWeight={600} color={colorScheme.textPrimary} mb={3}>
        Upload Progress
      </Typography>
      
      <Box sx={{ position: 'relative', flexGrow: 1 }}>
        {/* Timeline Line */}
        <Box
          sx={{
            position: 'absolute',
            left: 24,
            top: 0,
            bottom: 0,
            width: '2px',
            bgcolor: colorScheme.border,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${(activeStep / (steps.length - 1)) * 100}%`,
              bgcolor: colorScheme.primary,
              transition: 'height 0.3s ease'
            }
          }}
        />

        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const isClickable = index <= activeStep;

          return (
            <Box key={index} sx={{ position: 'relative', mb: 4 }}>
              {/* Step Circle */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: 8,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: isCompleted ? colorScheme.success : isActive ? colorScheme.primary : colorScheme.border,
                  border: `3px solid ${colorScheme.cardBackground}`,
                  zIndex: 2,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isCompleted ? (
                  <CheckCircleIcon sx={{ fontSize: 12, color: 'white' }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 8, color: 'white' }} />
                )}
              </Box>

              {/* Step Content */}
              <Box
                sx={{
                  ml: 6,
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  '&:hover': isClickable ? {
                    transform: 'translateX(4px)'
                  } : {}
                }}
                onClick={() => isClickable && onStepClick(index)}
              >
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `2px solid ${isActive ? colorScheme.primary : isCompleted ? colorScheme.success : colorScheme.border}`,
                    bgcolor: isActive ? `${colorScheme.primary}10` : isCompleted ? `${colorScheme.success}10` : colorScheme.background,
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(146, 90, 155, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    '&:hover': isClickable ? {
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                      borderColor: isActive ? colorScheme.primary : colorScheme.primary
                    } : {}
                  }}
                >
                  {/* Step Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: isActive ? colorScheme.primary : isCompleted ? colorScheme.success : colorScheme.border,
                        mr: 2,
                        fontSize: '1rem'
                      }}
                    >
                      {step.icon}
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={600} 
                        color={isActive ? colorScheme.primary : isCompleted ? colorScheme.success : colorScheme.textPrimary}
                        sx={{ mb: 0.5 }}
                      >
                        {step.title}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color={colorScheme.textSecondary}
                      >
                        {step.description}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Step Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={isCompleted ? 'Completed' : isActive ? 'Current' : 'Pending'}
                      size="small"
                      sx={{
                        bgcolor: isCompleted ? colorScheme.success : isActive ? colorScheme.primary : colorScheme.border,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                    {isActive && (
                      <Chip
                        label={`Step ${index + 1} of ${steps.length}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: colorScheme.primary,
                          color: colorScheme.primary,
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                    )}
                  </Box>
                </Paper>
              </Box>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 20,
                    top: 40,
                    zIndex: 1
                  }}
                >
                  <ArrowDownwardIcon 
                    sx={{ 
                      fontSize: 16, 
                      color: index < activeStep ? colorScheme.primary : colorScheme.border,
                      transition: 'color 0.3s ease'
                    }} 
                  />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Progress Summary */}
      <Box sx={{ 
        mt: 3, 
        p: 2, 
        borderRadius: 2, 
        bgcolor: colorScheme.sidebarBackground,
        border: `1px solid ${colorScheme.border}`
      }}>
        <Typography variant="body2" color={colorScheme.textSecondary} mb={1}>
          Overall Progress
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flexGrow: 1, height: 8, bgcolor: colorScheme.border, borderRadius: 4, overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${(activeStep / (steps.length - 1)) * 100}%`,
                bgcolor: colorScheme.primary,
                transition: 'width 0.3s ease'
              }}
            />
          </Box>
          <Typography variant="body2" fontWeight={600} color={colorScheme.textPrimary}>
            {Math.round((activeStep / (steps.length - 1)) * 100)}%
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
