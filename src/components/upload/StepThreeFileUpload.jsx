import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Chip
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { colorScheme } from '../../utils/colorScheme';
import { dashboardColors as colors } from '../../utils/dashboardColors';

import { useAuth } from '../../utils/authContext';
import axios from 'axios';

export default function StepThreeFileUpload({ formData, updateFormData, onComplete }) {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState({ trial_balance: false, chart_of_accounts: false });
  
  const trialBalanceInputRef = useRef(null);
  const chartOfAccountsInputRef = useRef(null);

  const fileTypes = {
    trial_balance: {
      label: 'Trial Balance',
      description: 'Upload your trial balance CSV or Microsoft Excel file (.csv, .xlsx, .xls, .xlsb)',
      accept: '.csv,.xlsx,.xls,.xlsb',
      icon: <DescriptionIcon />
    },
    chart_of_accounts: {
      label: 'Chart of Accounts',
      description: 'Upload your chart of accounts CSV or Microsoft Excel file (.csv, .xlsx, .xls, .xlsb)',
      accept: '.csv,.xlsx,.xls,.xlsb',
      icon: <DescriptionIcon />
    }
  };

  const validateFile = (file, fileType) => {
    if (!file) return false;
    
    // Check file type
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.csv', '.xlsx', '.xls', '.xlsb'];
    const isValidType = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
      setError('Please upload CSV or Microsoft Excel files (.csv, .xlsx, .xls, .xlsb) only.');
      return false;
    }
    
    // Check file size (10MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return false;
    }
    
    // Check if file is empty
    if (file.size === 0) {
      setError('The file is empty. Please select a valid file.');
      return false;
    }
    
    return true;
  };

  const handleFileSelect = (event, fileType) => {
    const selectedFile = event.target.files[0];
    setError('');
    setSuccess(false);
    
    if (validateFile(selectedFile, fileType)) {
      updateFormData({
        files: {
          ...formData.files,
          [fileType]: selectedFile
        }
      });
    }
  };

  const handleDragOver = (event, fileType) => {
    event.preventDefault();
    setIsDragOver(prev => ({ ...prev, [fileType]: true }));
  };

  const handleDragLeave = (event, fileType) => {
    event.preventDefault();
    setIsDragOver(prev => ({ ...prev, [fileType]: false }));
  };

  const handleDrop = (event, fileType) => {
    event.preventDefault();
    setIsDragOver(prev => ({ ...prev, [fileType]: false }));
    setError('');
    setSuccess(false);
    
    const droppedFile = event.dataTransfer.files[0];
    if (validateFile(droppedFile, fileType)) {
      updateFormData({
        files: {
          ...formData.files,
          [fileType]: droppedFile
        }
      });
    }
  };

  const removeFile = (fileType) => {
    updateFormData({
      files: {
        ...formData.files,
        [fileType]: null
      }
    });
    setError('');
    setSuccess(false);
  };

  const triggerFileInput = (fileType) => {
    if (fileType === 'trial_balance') {
      trialBalanceInputRef.current?.click();
    } else {
      chartOfAccountsInputRef.current?.click();
    }
  };

  const handleSubmit = async () => {
    if (!formData.files.trial_balance || !formData.files.chart_of_accounts || !formData.files.gl_accounts) {
      setError('Please upload all required files: Trial Balance, Chart of Accounts, and General Ledger.');
      return;
    }

    setUploading(true);
    setError('');

    const uploadFormData = new FormData();
    
    // Add files
    uploadFormData.append('trial_balance', formData.files.trial_balance);
    uploadFormData.append('chart_of_accounts', formData.files.chart_of_accounts);
    uploadFormData.append('gl_accounts', formData.files.gl_accounts);
    
    // Add form fields
    Object.keys(formData).forEach(key => {
      if (key !== 'files') {
        uploadFormData.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post('http://localhost:8000/api/upload/', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const renderFileUploadArea = (fileType) => {
    const file = formData.files[fileType];
    const config = fileTypes[fileType];
    const isDragOverThis = isDragOver[fileType];

    return (
      <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Paper
          onDragOver={(e) => handleDragOver(e, fileType)}
          onDragLeave={(e) => handleDragLeave(e, fileType)}
          onDrop={(e) => handleDrop(e, fileType)}
          onClick={() => triggerFileInput(fileType)}
          sx={{
            border: '2px dashed',
            borderColor: isDragOverThis ? colorScheme.primary : colorScheme.border,
            borderRadius: 3,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: isDragOverThis ? `${colorScheme.primary}10` : colorScheme.background,
            transition: 'all 0.3s ease',
            minHeight: '250px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              borderColor: colorScheme.primary,
              bgcolor: `${colorScheme.primary}10`,
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(146, 90, 155, 0.15)'
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              bgcolor: isDragOverThis ? colorScheme.primary : 'transparent',
              transition: 'all 0.3s ease'
            }
          }}
        >
          <input
            ref={fileType === 'trial_balance' ? trialBalanceInputRef : chartOfAccountsInputRef}
            type="file"
            accept={config.accept}
            onChange={(e) => handleFileSelect(e, fileType)}
            style={{ display: 'none' }}
          />
          
          {file ? (
            <Box>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                bgcolor: colorScheme.success, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
              }}>
                <CheckCircleIcon sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Typography variant="subtitle1" sx={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 600,
                color: "#333",
                fontSize: '0.9rem',
                letterSpacing: '-0.01em',
                mb: 1
              }}>
                {file.name}
              </Typography>
              <Typography variant="body2" sx={{
                fontFamily: '"Inter", sans-serif',
                color: "#666",
                fontSize: '0.75rem',
                fontWeight: 400,
                mb: 3
              }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(fileType);
                }}
                variant="outlined"
                size="small"
                startIcon={<DeleteIcon />}
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '0.75rem',
                  borderColor: colorScheme.error,
                  color: colorScheme.error,
                  '&:hover': {
                    borderColor: colorScheme.error,
                    bgcolor: `${colorScheme.error}10`
                  }
                }}
              >
                Remove
              </Button>
            </Box>
          ) : (
            <Box>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                bgcolor: isDragOverThis ? colorScheme.primary : colorScheme.border, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                transition: 'all 0.3s ease',
                boxShadow: isDragOverThis ? '0 2px 8px rgba(146, 90, 155, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <CloudUploadIcon sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Typography variant="subtitle1" sx={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 600,
                color: isDragOverThis ? colorScheme.primary : "#333",
                fontSize: '0.9rem',
                letterSpacing: '-0.01em',
                mb: 1
              }}>
                {isDragOverThis ? `Drop ${config.label} here` : `Upload ${config.label}`}
              </Typography>
              <Typography variant="body2" sx={{
                fontFamily: '"Inter", sans-serif',
                color: "#666",
                fontSize: '0.8rem',
                fontWeight: 400,
                lineHeight: 1.5,
                mb: 2
              }}>
                {config.description}
              </Typography>
              <Typography variant="caption" sx={{
                fontFamily: '"Inter", sans-serif',
                color: "#666",
                fontSize: '0.7rem',
                fontWeight: 400
              }}>
                Click to browse or drag & drop
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    );
  };

  return (
    <Grid container spacing={3} sx={{ width: '100%' }}>
        <Grid item size={{xs: 12, md: 12}}>
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
          <Typography sx={{ 
            fontSize: '1.2rem', 
            fontWeight: 600, 
            color: 'white',
            fontFamily: '"Inter", sans-serif'
          }}>3</Typography>
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
            TB and Chart of Accounts
          </Typography>
          <Typography variant="body2" sx={{
            fontFamily: '"Inter", sans-serif',
            color: "#666",
            fontSize: '0.8rem',
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: '-0.01em'
          }}>
            Upload Trial Balance and Chart of Accounts CSV or Microsoft Excel files (.csv, .xlsx, .xls, .xlsb)
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Files uploaded successfully! Redirecting to dashboard...
        </Alert>
      )}

      {/* File Upload Areas */}
      <Grid container spacing={3} sx={{ mb: 4, width: '100%' }}>
        <Grid item size={{xs: 12, md: 6}}>
        {renderFileUploadArea('trial_balance')}
        </Grid>
        <Grid item size={{xs: 12, md: 6}}>
        {renderFileUploadArea('chart_of_accounts')}
        </Grid>
      </Grid>

    </Grid>
    </Grid>
  );
}
