import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
  FormLabel
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function UploadModal({ open, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  
  // Form fields state
  const [formData, setFormData] = useState({
    engagement_id: '',
    client_name: '',
    fiscal_year: '',
    audit_start_date: '',
    audit_end_date: '',
    company_name: '',
    description: 'Test',
    run_anomalies: true,
    anomalies: ['duplicate', 'backdated', 'closing', 'unusual_days', 'holiday', 'user_anomalies']
  });

  // Available anomaly options with keys and descriptions
  const anomalyOptions = [
    { key: 'duplicate', label: 'Duplicate Entries', description: 'Detect duplicate entries' },
    { key: 'backdated', label: 'Backdated Entries', description: 'Detect backdated entries' },
    { key: 'closing', label: 'Closing Entries', description: 'Detect closing entries' },
    { key: 'unusual_days', label: 'Unusual Days', description: 'Detect unusual days (weekends, holidays)' },
    { key: 'holiday', label: 'Holiday Entries', description: 'Detect holiday entries' },
    { key: 'user_anomalies', label: 'User Behavior Anomalies', description: 'Detect user behavior anomalies' }
  ];

  const handleFormChange = (field, value) => {
    // Handle date formatting for audit dates
    if (field === 'audit_start_date' || field === 'audit_end_date') {
      // If user enters date in MM/DD/YYYY format, convert to YYYY-MM-DD
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
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnomalyToggle = (anomalyKey) => {
    setFormData(prev => ({
      ...prev,
      anomalies: prev.anomalies.includes(anomalyKey)
        ? prev.anomalies.filter(item => item !== anomalyKey)
        : [...prev.anomalies, anomalyKey]
    }));
  };

  const validateForm = () => {
    const requiredFields = ['engagement_id', 'client_name', 'fiscal_year', 'audit_start_date', 'audit_end_date', 'company_name'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.audit_start_date) || !dateRegex.test(formData.audit_end_date)) {
      setError('Please enter valid dates in MM/DD/YYYY format (e.g., 12/31/2025) or use the date picker');
      return false;
    }
    
    // Additional date validation - check if dates are valid
    const startDate = new Date(formData.audit_start_date);
    const endDate = new Date(formData.audit_end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setError('Please enter valid dates');
      return false;
    }
    
    if (startDate >= endDate) {
      setError('Audit start date must be before audit end date');
      return false;
    }
    
    // Validate fiscal year format (YYYY)
    const yearRegex = /^\d{4}$/;
    if (!yearRegex.test(formData.fiscal_year)) {
      setError('Please enter a valid fiscal year (YYYY)');
      return false;
    }
    
    return true;
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    
    // Check file type
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file only.');
      return false;
    }
    
    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return false;
    }
    
    // Check if file is empty
    if (selectedFile.size === 0) {
      setError('The file is empty. Please select a valid CSV file.');
      return false;
    }
    
    return true;
  };

  const validateCSVContent = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        // Check if content contains commas (basic CSV indicator)
        if (!content.includes(',')) {
          setError('The file does not appear to be a valid CSV file.');
          setFile(null);
          resolve(false);
          return;
        }
        // Check if content has at least one newline (multiple rows)
        if (!content.includes('\n') && !content.includes('\r')) {
          setError('The CSV file should contain multiple rows.');
          setFile(null);
          resolve(false);
          return;
        }
        resolve(true);
      };
      reader.readAsText(file);
    });
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    setError('');
    setSuccess(false);
    
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
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
    setSuccess(false);
    
    const droppedFile = event.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    if (!validateForm()) {
      return;
    }

    setUploading(true);
    setError('');

    // Validate CSV content before uploading
    const isValidContent = await validateCSVContent(file);
    if (!isValidContent) {
      setUploading(false);
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    
    // Add form fields to the request
    Object.keys(formData).forEach(key => {
      if (key === 'anomalies') {
        // Handle anomalies array properly
        formData[key].forEach(anomaly => {
          uploadFormData.append('anomalies', anomaly);
        });
      } else {
        uploadFormData.append(key, formData[key]);
      }
    });

    try {
      const response = await axios.post('http://localhost:8000/api/targeted-anomaly-upload/', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setTimeout(() => {
        onUploadSuccess?.(response.data);
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError('');
    setSuccess(false);
    setUploading(false);
    setIsDragOver(false);
    setFormData({
      engagement_id: '',
      client_name: '',
      fiscal_year: '',
      audit_start_date: '',
      audit_end_date: '',
      company_name: '',
      description: '',
      run_anomalies: true,
      anomalies: ['duplicate', 'backdated']
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px 0 rgba(1,77,78,0.15)'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        bgcolor: '#f8fafc',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <Typography variant="h6" fontWeight={700} color="#9A5FA3" component="span">
          Upload Expense Sheet
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            File uploaded successfully! Redirecting...
          </Alert>
        )}

     
        {/* Form Fields Section */}
        <Box sx={{ my: 3 }}>
          <Grid container spacing={2}>
            <Grid item size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="Engagement ID"
                value={formData.engagement_id}
                onChange={(e) => handleFormChange('engagement_id', e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#e5e7eb' },
                    '&:hover fieldset': { borderColor: '#9A5FA3' },
                    '&.Mui-focused fieldset': { borderColor: '#9A5FA3' }
                  }
                }}
              />
            </Grid>
            <Grid item size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="Client Name"
                value={formData.client_name}
                onChange={(e) => handleFormChange('client_name', e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#e5e7eb' },
                    '&:hover fieldset': { borderColor: '#9A5FA3' },
                    '&.Mui-focused fieldset': { borderColor: '#9A5FA3' }
                  }
                }}
              />
            </Grid>
            <Grid item size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="Fiscal Year"
                value={formData.fiscal_year}
                onChange={(e) => handleFormChange('fiscal_year', e.target.value)}
                required
                placeholder="YYYY"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#e5e7eb' },
                    '&:hover fieldset': { borderColor: '#9A5FA3' },
                    '&.Mui-focused fieldset': { borderColor: '#9A5FA3' }
                  }
                }}
              />
            </Grid>
            <Grid item size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="Company Name"
                value={formData.company_name}
                onChange={(e) => handleFormChange('company_name', e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#e5e7eb' },
                    '&:hover fieldset': { borderColor: '#9A5FA3' },
                    '&.Mui-focused fieldset': { borderColor: '#9A5FA3' }
                  }
                }}
              />
            </Grid>
            <Grid item size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="Audit Start Date"
                type="date"
                value={formData.audit_start_date}
                onChange={(e) => handleFormChange('audit_start_date', e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                helperText="Format: MM/DD/YYYY or use date picker"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#e5e7eb' },
                    '&:hover fieldset': { borderColor: '#9A5FA3' },
                    '&.Mui-focused fieldset': { borderColor: '#9A5FA3' }
                  }
                }}
              />
            </Grid>
            <Grid item size={{xs: 12, sm: 6}}>
              <TextField
                fullWidth
                label="Audit End Date"
                type="date"
                value={formData.audit_end_date}
                onChange={(e) => handleFormChange('audit_end_date', e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                helperText="Format: MM/DD/YYYY or use date picker"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#e5e7eb' },
                    '&:hover fieldset': { borderColor: '#9A5FA3' },
                    '&.Mui-focused fieldset': { borderColor: '#9A5FA3' }
                  }
                }}
              />
            </Grid>
             <Grid item size={{xs: 12, sm: 12}}>
               <TextField
                 fullWidth
                 label="Description"
                 value={formData.description}
                 onChange={(e) => handleFormChange('description', e.target.value)}
                 multiline
                 rows={3}
                 sx={{
                   '& .MuiOutlinedInput-root': {
                     '& fieldset': { borderColor: '#e5e7eb' },
                     '&:hover fieldset': { borderColor: '#9A5FA3' },
                     '&.Mui-focused fieldset': { borderColor: '#9A5FA3' }
                   }
                 }}
               />
             </Grid>
           </Grid>
         </Box>
        {!file ? (
          <Paper
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            sx={{
              border: '2px dashed',
              borderColor: isDragOver ? '#9A5FA3' : '#e5e7eb',
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragOver ? '#f3e8f7' : '#fafafa',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#9A5FA3',
                bgcolor: '#f3e8f7'
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <CloudUploadIcon sx={{ fontSize: 48, color: '#9A5FA3', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} color="#9A5FA3" sx={{ mb: 1 }}>
              {isDragOver ? 'Drop the CSV file here' : 'Drag & drop a CSV file here'}
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mb: 2 }}>
              or click to browse files
            </Typography>
            <Typography variant="caption" color="#94a3b8">
              Only CSV files are accepted (max 10MB)
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 3, bgcolor: '#f8fafc' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ color: '#9A5FA3', fontSize: 24 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight={600} color="#9A5FA3">
                  {file.name}
                </Typography>
                <Typography variant="body2" color="#64748B">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
              <IconButton onClick={removeFile} size="small" sx={{ color: '#64748B' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        )}

      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleClose} 
          sx={{ 
            color: '#64748B',
            '&:hover': { bgcolor: '#f1f5f9' }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={!file || uploading || !['engagement_id', 'client_name', 'fiscal_year', 'audit_start_date', 'audit_end_date', 'company_name'].every(field => formData[field].trim())}
          variant="contained"
          sx={{
            bgcolor: '#9A5FA3',
            color: 'white',
            fontWeight: 600,
            '&:hover': { bgcolor: '#9A5FA3' },
            '&:disabled': { bgcolor: '#e5e7eb', color: '#94a3b8' }
          }}
        >
          {uploading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} sx={{ color: 'white' }} />
              Uploading...
            </Box>
          ) : (
            'Upload File'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 