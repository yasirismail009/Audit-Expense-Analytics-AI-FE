import React, { useState } from 'react';
import { Box, Typography, TextField, Grid, Button, Alert } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { colorScheme } from '../../utils/colorScheme';
import { dashboardColors as colors } from '../../utils/dashboardColors';


export default function StepOneInputFields({ formData, updateFormData, onNext }) {
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    // Handle date formatting for audit dates
    if (field === 'audit_start_date' || field === 'audit_end_date') {
      if (value.includes('/')) {
        const parts = value.split('/');
        if (parts.length === 3) {
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          value = `${year}-${month}-${day}`;
        }
      }
    }
    
    updateFormData({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['engagement_id', 'client_name', 'fiscal_year', 'audit_start_date', 'audit_end_date', 'company_name'];
    
    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (formData.audit_start_date && !dateRegex.test(formData.audit_start_date)) {
      newErrors.audit_start_date = 'Please enter a valid date';
    }
    if (formData.audit_end_date && !dateRegex.test(formData.audit_end_date)) {
      newErrors.audit_end_date = 'Please enter a valid date';
    }
    
    // Validate fiscal year format (YYYY)
    const yearRegex = /^\d{4}$/;
    if (formData.fiscal_year && !yearRegex.test(formData.fiscal_year)) {
      newErrors.fiscal_year = 'Please enter a valid year (YYYY)';
    }
    
    // Check if start date is before end date
    if (formData.audit_start_date && formData.audit_end_date) {
      const startDate = new Date(formData.audit_start_date);
      const endDate = new Date(formData.audit_end_date);
      
      if (startDate >= endDate) {
        newErrors.audit_end_date = 'End date must be after start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // Ensure version and version_notes have default values if not provided
      const updatedFormData = {
        ...formData,
        version: formData.version || '1.0',
        version_notes: formData.version_notes || 'Initial upload'
      };
      updateFormData(updatedFormData);
      onNext();
    }
  };

  return (
    <Box>
      {/* Step Header with Icon */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Box sx={{ 
          width: 48, 
          height: 48, 
          borderRadius: 2, 
          bgcolor: colors.primary, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mr: 3
        }}>
          <PersonIcon sx={{ fontSize: 24, color: 'white' }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600,
            color: "#333",
            fontSize: '1.1rem',
            letterSpacing: '-0.02em',
            mb: 1
          }}>
            Organization Details
          </Typography>
          <Typography variant="body2" sx={{
            fontFamily: '"Inter", sans-serif',
            color: "#666",
            fontSize: '0.8rem',
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: '-0.01em'
          }}>
            Provide the basic information for your audit engagement
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item size={{xs: 12, md: 3}}>
          <Box >
            <Typography variant="body2" sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              color: "#333",
              fontSize: '0.8rem',
              letterSpacing: '-0.01em',
              mb: 1
            }}>
              Engagement ID
            </Typography>
            <TextField
              fullWidth
              placeholder="ENG-008"
              value={formData.engagement_id}
              onChange={(e) => handleInputChange('engagement_id', e.target.value)}
              required
              error={!!errors.engagement_id}
              helperText={errors.engagement_id}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F8F9FA',
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  '& fieldset': { 
                    border: 'none'
                  },
                  '&:hover fieldset': { 
                    border: 'none'
                  },
                  '&.Mui-focused fieldset': { 
                    border: 'none'
                  },
                  '& input': {
                    fontSize: '0.8rem',
                    fontFamily: '"Inter", sans-serif',
                    padding: '8px 12px'
                  }
                }
              }}
            />
          </Box>
        </Grid>
        <Grid item size={{xs: 12, md: 3}}>
        <Box >
            <Typography variant="body2" sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              color: "#333",
              fontSize: '0.8rem',
              letterSpacing: '-0.01em',
              mb: 1
            }}>
              Fiscal Year
            </Typography>
            <TextField
              fullWidth
              placeholder="2025"
              value={formData.fiscal_year}
              onChange={(e) => handleInputChange('fiscal_year', e.target.value)}
              required
              error={!!errors.fiscal_year}
              helperText={errors.fiscal_year}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F8F9FA',
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  '& fieldset': { 
                    border: 'none'
                  },
                  '&:hover fieldset': { 
                    border: 'none'
                  },
                  '&.Mui-focused fieldset': { 
                    border: 'none'
                  },
                  '& input': {
                    fontSize: '0.8rem',
                    fontFamily: '"Inter", sans-serif',
                    padding: '8px 12px'
                  }
                }
              }}
            />
          </Box>
        </Grid>
        <Grid item size={{xs: 12, md: 3}}>
          <Box >
            <Typography variant="body2" sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              color: "#333",
              fontSize: '0.8rem',
              letterSpacing: '-0.01em',
              mb: 1
            }}>
              Company Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Irtiqa International"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              required
              error={!!errors.company_name}
              helperText={errors.company_name}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F8F9FA',
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  '& fieldset': { 
                    border: 'none'
                  },
                  '&:hover fieldset': { 
                    border: 'none'
                  },
                  '&.Mui-focused fieldset': { 
                    border: 'none'
                  },
                  '& input': {
                    fontSize: '0.8rem',
                    fontFamily: '"Inter", sans-serif',
                    padding: '8px 12px'
                  }
                }
              }}
            />
          </Box>
        </Grid>
        <Grid item size={{xs: 12, md: 3}}>
        <Box >
            <Typography variant="body2" sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              color: "#333",
              fontSize: '0.8rem',
              letterSpacing: '-0.01em',
              mb: 1
            }}>
              Client Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Muhammad Yasir"
              value={formData.client_name}
              onChange={(e) => handleInputChange('client_name', e.target.value)}
              required
              error={!!errors.client_name}
              helperText={errors.client_name}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F8F9FA',
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  '& fieldset': { 
                    border: 'none'
                  },
                  '&:hover fieldset': { 
                    border: 'none'
                  },
                  '&.Mui-focused fieldset': { 
                    border: 'none'
                  },
                  '& input': {
                    fontSize: '0.8rem',
                    fontFamily: '"Inter", sans-serif',
                    padding: '8px 12px'
                  }
                }
              }}
            />
          </Box>
        </Grid>
        {/* Right Column */}
        <Grid item size={{xs: 12, md: 6}}>
          
        <Box >
            <Typography variant="body2" sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              color: "#333",
              fontSize: '0.8rem',
              letterSpacing: '-0.01em',
              mb: 1
            }}>
              Audit Start Date
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={formData.audit_start_date}
              onChange={(e) => handleInputChange('audit_start_date', e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              error={!!errors.audit_start_date}
              helperText={errors.audit_start_date || "Select the start date for your audit period"}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F8F9FA',
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  '& fieldset': { 
                    border: 'none'
                  },
                  '&:hover fieldset': { 
                    border: 'none'
                  },
                  '&.Mui-focused fieldset': { 
                    border: 'none'
                  },
                  '& input': {
                    fontSize: '0.8rem',
                    fontFamily: '"Inter", sans-serif',
                    padding: '8px 12px'
                  }
                }
              }}
            />
          </Box>
        </Grid>
        <Grid item size={{xs: 12, md: 6}}>
    

          <Box >
            <Typography variant="body2" sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              color: "#333",
              fontSize: '0.8rem',
              letterSpacing: '-0.01em',
              mb: 1
            }}>
              Audit End Date
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={formData.audit_end_date}
              onChange={(e) => handleInputChange('audit_end_date', e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
              error={!!errors.audit_end_date}
              helperText={errors.audit_end_date || "Select the end date for your audit period"}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F8F9FA',
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  '& fieldset': { 
                    border: 'none'
                  },
                  '&:hover fieldset': { 
                    border: 'none'
                  },
                  '&.Mui-focused fieldset': { 
                    border: 'none'
                  },
                  '& input': {
                    fontSize: '0.8rem',
                    fontFamily: '"Inter", sans-serif',
                    padding: '8px 12px'
                  }
                }
              }}
            />
          </Box>
        </Grid>

        {/* Version Fields */}
        <Grid item size={{xs: 12, md: 6}}>
          <Box>
            <Typography variant="body2" sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              color: "#333",
              fontSize: '0.8rem',
              letterSpacing: '-0.01em',
              mb: 1
            }}>
              Version (Optional)
            </Typography>
            <TextField
              fullWidth
              placeholder="1.0"
              value={formData.version || '1.0'}
              onChange={(e) => handleInputChange('version', e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F8F9FA',
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  '& fieldset': { 
                    border: 'none'
                  },
                  '&:hover fieldset': { 
                    border: 'none'
                  },
                  '&.Mui-focused fieldset': { 
                    border: 'none'
                  },
                  '& input': {
                    fontSize: '0.8rem',
                    fontFamily: '"Inter", sans-serif',
                    padding: '8px 12px'
                  }
                }
              }}
            />
          </Box>
        </Grid>
        <Grid item size={{xs: 12, md: 6}}>
          <Box>
            <Typography variant="body2" sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              color: "#333",
              fontSize: '0.8rem',
              letterSpacing: '-0.01em',
              mb: 1
            }}>
              Version Notes (Optional)
            </Typography>
            <TextField
              fullWidth
              placeholder="Initial upload"
              value={formData.version_notes || 'Initial upload'}
              onChange={(e) => handleInputChange('version_notes', e.target.value)}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F8F9FA',
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  '& fieldset': { 
                    border: 'none'
                  },
                  '&:hover fieldset': { 
                    border: 'none'
                  },
                  '&.Mui-focused fieldset': { 
                    border: 'none'
                  },
                  '& input': {
                    fontSize: '0.8rem',
                    fontFamily: '"Inter", sans-serif',
                    padding: '8px 12px'
                  }
                }
              }}
            />
          </Box>
        </Grid>

        {/* Full Width Description */}
          <Grid item size={{xs: 12}}>
          <Box>
            <Typography variant="body2" sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              color: "#333",
              fontSize: '0.8rem',
              letterSpacing: '-0.01em',
              mb: 1
            }}>
              Description (Optional)
            </Typography>
            <TextField
              fullWidth
              placeholder="Add a description for this audit engagement"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={2}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#F8F9FA',
                  borderRadius: 2,
                  fontSize: '0.8rem',
                  '& fieldset': { 
                    border: 'none'
                  },
                  '&:hover fieldset': { 
                    border: 'none'
                  },
                  '&.Mui-focused fieldset': { 
                    border: 'none'
                  },
                  '& textarea': {
                    fontSize: '0.8rem',
                    fontFamily: '"Inter", sans-serif',
                    padding: '8px 12px'
                  },
                  '& input': {
                    fontSize: '0.8rem',
                    fontFamily: '"Inter", sans-serif',
                    padding: '8px 12px'
                  }
                }
              }}
            />
          </Box>
        </Grid>
      </Grid>

    </Box>
  );
}
