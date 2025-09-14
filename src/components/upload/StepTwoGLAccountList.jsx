import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { colorScheme } from '../../utils/colorScheme';
import { dashboardColors as colors } from '../../utils/dashboardColors';


export default function StepTwoGLAccountList({ formData, updateFormData, onNext }) {
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    
    // Check file type
    const fileName = selectedFile.name.toLowerCase();
    const validExtensions = ['.csv', '.xlsx', '.xls', '.xlsb'];
    const isValidType = validExtensions.some(ext => fileName.endsWith(ext));
    console.log(fileName);
    console.log(isValidType);
    if (!isValidType) {
      setError('Please upload a CSV or Microsoft Excel file (.csv, .xlsx, .xls, .xlsb) only.');
      return false;
    }
    
    // Check file size (10MB limit)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return false;
    }
    
    // Check if file is empty
    if (selectedFile.size === 0) {
      setError('The file is empty. Please select a valid file.');
      return false;
    }
    
    return true;
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    setError('');
    
    if (validateFile(selectedFile)) {
      updateFormData({
        files: {
          ...formData.files,
          gl_accounts: selectedFile
        }
      });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    setError('');
    
    const droppedFile = event.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      updateFormData({
        files: {
          ...formData.files,
          gl_accounts: droppedFile
        }
      });
    }
  };

  const removeFile = () => {
    updateFormData({
      files: {
        ...formData.files,
        gl_accounts: null
      }
    });
    setError('');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleNext = () => {
    if (!formData.files.gl_accounts) {
      setError('Please upload the General Ledger CSV or Microsoft Excel file (.csv, .xlsx, .xls, .xlsb)');
      return;
    }
    onNext();
  };

  return (
      <Grid container spacing={3} sx={{ width: '100%' }}>
        <Grid item size={{xs: 12, md: 12}}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, width: '100%' }}>
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
          }}>2</Typography>
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
            General Ledger List
          </Typography>
          <Typography variant="body2" sx={{
            fontFamily: '"Inter", sans-serif',
            color: "#666",
            fontSize: '0.8rem',
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: '-0.01em'
          }}>
            Upload your General Ledger CSV file for audit analysis
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* File Upload Area */}
      <Paper
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        sx={{
          border: '2px dashed',
          borderColor: isDragOver ? colorScheme.primary : colorScheme.border,
          borderRadius: 3,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragOver ? `${colorScheme.primary}10` : colorScheme.background,
          transition: 'all 0.3s ease',
          minHeight: '300px',
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
            bgcolor: isDragOver ? colorScheme.primary : 'transparent',
            transition: 'all 0.3s ease'
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {formData.files.gl_accounts ? (
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
              {formData.files.gl_accounts.name}
            </Typography>
            <Typography variant="body2" sx={{
              fontFamily: '"Inter", sans-serif',
              color: "#666",
              fontSize: '0.75rem',
              fontWeight: 400,
              mb: 3
            }}>
              {(formData.files.gl_accounts.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
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
              bgcolor: isDragOver ? colorScheme.primary : colorScheme.border, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              transition: 'all 0.3s ease',
              boxShadow: isDragOver ? '0 2px 8px rgba(146, 90, 155, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
              <CloudUploadIcon sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Typography variant="subtitle1" sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              color: isDragOver ? colorScheme.primary : "#333",
              fontSize: '0.9rem',
              letterSpacing: '-0.01em',
              mb: 1
            }}>
              {isDragOver ? 'Drop General Ledger file here' : 'Upload General Ledger'}
            </Typography>
            <Typography variant="body2" sx={{
              fontFamily: '"Inter", sans-serif',
              color: "#666",
              fontSize: '0.8rem',
              fontWeight: 400,
              lineHeight: 1.5,
              mb: 2
            }}>
              Upload your General Ledger CSV or Microsoft Excel file (.csv, .xlsx, .xls, .xlsb)
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
      </Grid>
  );
}
