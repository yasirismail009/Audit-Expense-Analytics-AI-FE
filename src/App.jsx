import React, { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CssBaseline, CircularProgress, Fab } from '@mui/material';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import ExpenseSheetDetails from './ExpenseSheetDetails';
import UploadModal from './components/UploadModal';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { colorScheme } from './utils/colorScheme';

function TableListing() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8000/api/files-listing/')
      .then(res => {
        // Handle new payload structure with files array
        const files = res.data.files || res.data;
        setRows(Array.isArray(files) ? files : []);
        // Store summary if available
        setSummary(res.data.summary || null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching file list:', error);
        setRows([]);
        setSummary(null);
        setLoading(false);
      });
  }, []);

  const handleUploadSuccess = (data) => {
    // Refresh the data
    axios.get('http://localhost:8000/api/files-listing/')
      .then(res => {
        const files = res.data.files || res.data;
        setRows(Array.isArray(files) ? files : []);
        setSummary(res.data.summary || null);
      })
      .catch((error) => {
        console.error('Error refreshing file list:', error);
      });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6fa' }}>
      <CssBaseline />
      <Sidebar />
      <Box sx={{ flexGrow: 1, width: 'calc(100% - 240px)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: colorScheme.textPrimary }}>File Listing</Typography>
          
          {/* Summary Statistics */}
          {summary && (
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Paper sx={{ p: 2, minWidth: 150, textAlign: 'center', bgcolor: '#f3e8f7' }}>
                <Typography variant="h6" color={colorScheme.textPrimary}  fontWeight={700}>{summary.total_files}</Typography>
                <Typography variant="body2" color="#64748B">Total Files</Typography>
              </Paper>
              <Paper sx={{ p: 2, minWidth: 150, textAlign: 'center', bgcolor: '#f3e8f7' }}>
                <Typography variant="h6" color={colorScheme.textPrimary}  fontWeight={700}>{summary.total_records}</Typography>
                <Typography variant="body2" color="#64748B">Total Records</Typography>
              </Paper>
              <Paper sx={{ p: 2, minWidth: 150, textAlign: 'center', bgcolor: '#f3e8f7' }}>
                <Typography variant="h6" color={colorScheme.textPrimary}  fontWeight={700}>{summary.success_rate}%</Typography>
                <Typography variant="body2" color="#64748B">Success Rate</Typography>
              </Paper>
            </Box>
          )}

          {loading ? (
            <CircularProgress />
          ) : rows.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'white' }}>
              <Typography variant="h6" color="#64748B">No files found</Typography>
              <Typography variant="body2" color="#64748B" sx={{ mt: 1 }}>
                Upload your first file to get started
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ width: '100%', borderRadius: 3, boxShadow: '0 4px 24px 0 rgba(154,95,163,0.10)', mx: 'auto', bgcolor: 'white' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f3e8f7' }}>
                    <TableCell sx={{ fontWeight: 700, color: colorScheme.textPrimary }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colorScheme.textPrimary }}>File Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colorScheme.textPrimary }}>Client Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colorScheme.textPrimary }}>Fiscal Year</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colorScheme.textPrimary }}>Total Records</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colorScheme.textPrimary }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: colorScheme.textPrimary }}>Uploaded At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#f3e8f7' }
                      }}
                      onClick={() => navigate(`/expense-sheet-details/${row.id}`)}
                    >
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.file_name}</TableCell>
                      <TableCell>{row.client_name}</TableCell>
                      <TableCell>{row.fiscal_year}</TableCell>
                      <TableCell>{row.total_records}</TableCell>
                      <TableCell>
                        <span
                          style={{
                            color: row.status === 'COMPLETED' ? '#9A5FA3' : 
                                   row.status === 'PROCESSING' ? '#9A5FA3' : '#9A5FA3',
                            fontWeight: 700
                          }}
                        >
                          {row.status}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(row.uploaded_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
        
        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="upload"
          onClick={() => setUploadModalOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            bgcolor: '#00B686',
            '&:hover': { bgcolor: '#019e76' },
            boxShadow: '0 4px 12px 0 rgba(0,182,134,0.3)'
          }}
        >
          <CloudUploadIcon />
        </Fab>
        
        {/* Upload Modal */}
        <UploadModal 
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      </Box>
    </Box>
  );
}

function ExpenseSheetDetailsWrapper() {
  return <ExpenseSheetDetails />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TableListing />} />
        <Route path="/expense-sheet-details/:sheetId" element={<ExpenseSheetDetailsWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
