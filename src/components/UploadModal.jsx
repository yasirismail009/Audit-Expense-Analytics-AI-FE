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
  IconButton
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

    setUploading(true);
    setError('');

    // Validate CSV content before uploading
    const isValidContent = await validateCSVContent(file);
    if (!isValidContent) {
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/expenses/upload/', formData, {
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
      maxWidth="sm"
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
        <Typography variant="h6" fontWeight={700} color="#014D4E">
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

        {!file ? (
          <Paper
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            sx={{
              border: '2px dashed',
              borderColor: isDragOver ? '#00B686' : '#e5e7eb',
              borderRadius: 3,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragOver ? '#f0fdf4' : '#fafafa',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#00B686',
                bgcolor: '#f0fdf4'
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
            <CloudUploadIcon sx={{ fontSize: 48, color: '#64748B', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} color="#014D4E" sx={{ mb: 1 }}>
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
              <CheckCircleIcon sx={{ color: '#00B686', fontSize: 24 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight={600} color="#014D4E">
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
          disabled={!file || uploading}
          variant="contained"
          sx={{
            bgcolor: '#00B686',
            color: 'white',
            fontWeight: 600,
            '&:hover': { bgcolor: '#019e76' },
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