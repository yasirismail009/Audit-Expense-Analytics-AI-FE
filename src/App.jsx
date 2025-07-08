import React, { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CssBaseline, CircularProgress, Fab } from '@mui/material';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import ExpenseSheetDetails from './ExpenseSheetDetails';
import UploadModal from './components/UploadModal';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

function TableListing() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8000/api/expenses/')
      .then(res => {
        setRows(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUploadSuccess = (data) => {
    // Refresh the data
    axios.get('http://localhost:8000/api/expenses/')
      .then(res => {
        setRows(res.data);
      })
      .catch(console.error);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6fa' }}>
      <CssBaseline />
      <Sidebar />
      <Box sx={{ flexGrow: 1, width: 'calc(100% - 240px)', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Expense Sheet Listing</Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <TableContainer component={Paper} sx={{ width: '100%', borderRadius: 3, boxShadow: '0 4px 24px 0 rgba(1,77,78,0.10)', mx: 'auto', bgcolor: 'white' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#e6faf5' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#014D4E' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#014D4E' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#014D4E' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#014D4E' }}>Total Expenses</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#014D4E' }}>Total Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#014D4E' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#e6faf5' }
                      }}
                      onClick={() => navigate(`/expense-sheet-details/${row.id}`)}
                    >
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.display_name}</TableCell>
                      <TableCell>{row.sheet_date}</TableCell>
                      <TableCell>{row.total_expenses}</TableCell>
                      <TableCell>€ {row.total_amount}</TableCell>
                      <TableCell>
                        {row.analysis ? (
                          <span
                            style={{
                              color: row.analysis.risk_level === 'LOW' ? '#00B686' : '#F43F5E',
                              fontWeight: 700
                            }}
                          >
                            {row.analysis.risk_level}
                          </span>
                        ) : (
                          <span style={{ color: '#64748B', fontWeight: 500 }}>N/A</span>
                        )}
                      </TableCell>
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
