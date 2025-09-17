import React from 'react';
import { Box, CssBaseline, CircularProgress, createTheme, ThemeProvider } from '@mui/material';
import ModernToolbar from './components/ModernToolbar';
import AppToolbar from './components/AppToolbar';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ExpenseSheetDetails from './ExpenseSheetDetails';
import FilesListingDashboard from './components/FilesListingDashboard';
import UploadPage from './components/UploadPage';
import CompletenessTestReport from './components/CompletenessTestReport';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import { useAuth } from './utils/authContext';
import { dashboardColors as colors } from './utils/dashboardColors';
import AppHeader from './components/common/AppHeader';


// Create global theme with Inter font
const theme = createTheme({
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
    },
    h2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
    },
    button: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
      textTransform: 'none',
    },
    caption: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
    },
    overline: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Inter", sans-serif',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontFamily: '"Inter", sans-serif',
          },
          '& .MuiInputBase-input::placeholder': {
            fontFamily: '"Inter", sans-serif',
          },
        },
      },
    },
  },
});

// Layout Component with AppHeader
const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define header behavior based on current route
  const getHeaderProps = () => {
    const defaultProps = {
      userName: "Muhammad Yasir",
      userRole: "Software Engineer", 
      userInitials: "MY",
      onMenuClick: () => console.log('Menu clicked'),
      onSearchChange: (value) => console.log('Search:', value),
      onAddClick: () => navigate('/upload'),
      onCalendarClick: () => console.log('Calendar clicked'),
      onUserClick: () => console.log('User clicked'),
    };

    switch (location.pathname) {
      case '/':
        return {
          ...defaultProps,
          searchPlaceholder: "Search data files..."
        };
      case '/upload':
        return {
          ...defaultProps,
          searchPlaceholder: "Search uploads..."
        };
      default:
        if (location.pathname.includes('/expense-sheet-details')) {
          return {
            ...defaultProps,
            searchPlaceholder: "Search expense data..."
          };
        }
        if (location.pathname.includes('/completeness-test-report')) {
          return {
            ...defaultProps,
            searchPlaceholder: "Search reports..."
          };
        }
        return defaultProps;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: colors.background }}>
      <AppHeader {...getHeaderProps()} />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  );
};

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
  return <Layout>{children}</Layout>;
};

function TableListing() {
  return <FilesListingDashboard />;
}

function ExpenseSheetDetailsWrapper() {
  return <ExpenseSheetDetails />;
}

function UploadPageWrapper() {
  return <UploadPage />;
}

function CompletenessTestReportWrapper() {
  return <CompletenessTestReport />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
        <Route path="/upload" element={
          <ProtectedRoute>
            <UploadPageWrapper />
          </ProtectedRoute>
        } />
        <Route path="/completeness-test-report/:engagementId" element={
          <ProtectedRoute>
            <CompletenessTestReportWrapper />
          </ProtectedRoute>
        } />
        
        {/* Redirect to login for any unmatched routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
