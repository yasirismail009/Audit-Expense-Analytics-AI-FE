import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, InputBase, Box, IconButton, Button, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UploadModal from './UploadModal';

export default function TopBar() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const handleUploadSuccess = (data) => {
    // Refresh the page or update the data
    window.location.reload();
  };

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', color: 'black', boxShadow: 'none', p: 0 }}>
        <Toolbar sx={{ minHeight: 80, px: { xs: 1, md: 3 }, py: 2, bgcolor: 'transparent' }}>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
            <Paper
              component="form"
              sx={{
                p: '2px 8px',
                display: 'flex',
                alignItems: 'center',
                width: 320,
                borderRadius: 2,
                boxShadow: '0 2px 8px 0 rgba(1,77,78,0.06)',
                bgcolor: 'white',
                mr: 2,
              }}
              elevation={0}
            >
              <IconButton sx={{ p: '8px', color: '#64748B' }} aria-label="search">
                <SearchIcon />
              </IconButton>
              <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search" inputProps={{ 'aria-label': 'search' }} />
            </Paper>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              startIcon={<CalendarTodayIcon />}
              sx={{
                bgcolor: 'white',
                color: '#014D4E',
                borderRadius: 2,
                boxShadow: '0 2px 8px 0 rgba(1,77,78,0.06)',
                fontWeight: 600,
                textTransform: 'none',
                px: 2,
                mr: 2,
                border: '1px solid #E5E7EB',
              }}
            >
              18 OCT 2024 - 18 NOV 2024
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => setUploadModalOpen(true)}
              sx={{
                color: '#00B686',
                borderColor: '#00B686',
                bgcolor: 'white',
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                px: 2,
                mr: 2,
                boxShadow: '0 2px 8px 0 rgba(1,77,78,0.06)',
                '&:hover': { 
                  borderColor: '#019e76', 
                  color: '#019e76',
                  bgcolor: '#f0fdf4'
                },
              }}
            >
              Upload CSV
            </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      <UploadModal 
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </>
  );
} 