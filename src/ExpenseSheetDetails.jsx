import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ExpenseAnalysisDashboard from './components/ExpenseAnalysisDashboard';

export default function ExpenseSheetDetails() {
  const { sheetId } = useParams();
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`http://localhost:8000/api/sheets/${sheetId}/analyze/`);
        setSheetData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching sheet data:', err);
        setError('Failed to load expense sheet data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (sheetId) {
      fetchSheetData();
    } else {
      setError('No sheet ID provided');
      setLoading(false);
    }
  }, [sheetId]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar />
      <Box sx={{ flexGrow: 1, width: 'calc(100% - 240px)' }}>
        <TopBar />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 4 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <ExpenseAnalysisDashboard sheetData={sheetData} />
        )}
      </Box>
    </Box>
  );
} 