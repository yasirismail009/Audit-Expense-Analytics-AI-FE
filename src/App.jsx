import React from 'react';
import { Box, CssBaseline, CircularProgress } from '@mui/material';
import ModernToolbar from './components/ModernToolbar';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ExpenseSheetDetails from './ExpenseSheetDetails';
import FilesListingDashboard from './components/FilesListingDashboard';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import { useAuth } from './utils/authContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'loading:', loading);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute - redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('ProtectedRoute - rendering children');
  return children;
};

function TableListing() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f4f6fa' }}>
      <CssBaseline />
      <ModernToolbar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)' }}>
        <FilesListingDashboard />
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
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <TableListing />
          </ProtectedRoute>
        } />
        <Route path="/expense-sheet-details/:sheetId" element={
          <ProtectedRoute>
            <ExpenseSheetDetailsWrapper />
          </ProtectedRoute>
        } />
        
        {/* Redirect to login for any unmatched routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
