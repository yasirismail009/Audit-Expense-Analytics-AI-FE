import React, { useState, useEffect } from 'react';
import { Box, Grid, CircularProgress, Alert, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WelcomeSection from './common/WelcomeSection';
import DashboardCardGrid from './dashboard/DashboardCardGrid';
import AnnualProfitsCard from './dashboard/AnnualProfitsCard';
import ActivityManagerCard from './dashboard/ActivityManagerCard';
import BusinessRatingCard from './dashboard/BusinessRatingCard';
import { dashboardColors as colors } from '../utils/dashboardColors';
import axios from 'axios';

export default function FilesListingDashboard() {
  const navigate = useNavigate();
  // State management
  const [dataFiles, setDataFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API call to fetch data files
  const fetchDataFiles = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:8000/api/data-files/', {
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Data files response:', response.data);
      setDataFiles(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error fetching data files:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
      
      // Provide specific error messages
      let errorMessage = 'Failed to load data files';
      if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Backend server is not running. Please start the backend server.';
      } else if (err.code === 'ENOTFOUND') {
        errorMessage = 'Cannot connect to backend server. Please check if the server is running on localhost:8000.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Data files endpoint not found. Please check the API configuration.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Backend server error. Please try again later.';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else {
        errorMessage = `Failed to load data files: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDataFiles();
  }, []);

  // Extract data from API response - handle multiple engagements
  const engagements = dataFiles || [];
  const totalEngagements = engagements.length;
  
  // Aggregate statistics across all engagements
  const aggregateStats = engagements.reduce((acc, engagement) => {
    return {
      totalFiles: acc.totalFiles + (engagement.total_files || 0),
      totalRecords: acc.totalRecords + (engagement.total_records || 0),
      processedRecords: acc.processedRecords + (engagement.processed_records || 0),
      failedRecords: acc.failedRecords + (engagement.failed_records || 0),
      files: [...acc.files, ...(engagement.files || [])],
      clients: [...acc.clients, engagement.client_name].filter(Boolean),
      companies: [...acc.companies, engagement.company_name].filter(Boolean)
    };
  }, {
    totalFiles: 0,
    totalRecords: 0,
    processedRecords: 0,
    failedRecords: 0,
    files: [],
    clients: [],
    companies: []
  });

  // Calculate aggregate status summary
  const aggregateStatusSummary = aggregateStats.files.reduce((acc, file) => {
    const status = file.status || 'UNKNOWN';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Calculate processing progress
  const processingProgress = aggregateStats.totalRecords > 0 
    ? Math.round((aggregateStats.processedRecords / aggregateStats.totalRecords) * 100) 
    : 0;

  // Calculate total file size across all engagements
  const totalFileSize = aggregateStats.files.reduce((sum, file) => sum + (file.file_size || 0), 0);
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Get unique clients and companies
  const uniqueClients = [...new Set(aggregateStats.clients)];
  const uniqueCompanies = [...new Set(aggregateStats.companies)];

  // Filter files based on search term (across all engagements)
  const filteredFiles = aggregateStats.files.filter(file => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      file.file_name?.toLowerCase().includes(searchLower) ||
      file.status?.toLowerCase().includes(searchLower) ||
      uniqueClients.some(client => client?.toLowerCase().includes(searchLower)) ||
      uniqueCompanies.some(company => company?.toLowerCase().includes(searchLower))
    );
  });

  // For displaying individual engagement data (use first engagement as fallback for specific fields)
  const primaryEngagement = engagements.length > 0 ? engagements[0] : null;

  // Event handlers
  const handleMenuClick = () => console.log('Menu clicked');
  const handleSearchChange = (value) => {
    console.log('Search:', value);
    setSearchTerm(value);
  };
  const handleAddClick = () => console.log('Add clicked');
  const handleCalendarClick = () => console.log('Calendar clicked');
  const handleUserClick = () => console.log('User clicked');
  const handleTasksClick = () => navigate('/upload');
  const handleVoiceClick = () => console.log('Voice clicked');
  const handleReceiveClick = () => console.log('Receive clicked');
  const handleSendClick = () => console.log('Send clicked');
  const handleCompletenessReportClick = () => {
    // Get the first engagement ID if available
    const firstEngagement = engagements.length > 0 ? engagements[0] : null;
    if (firstEngagement && firstEngagement.engagement_id) {
      navigate(`/completeness-test-report/${firstEngagement.engagement_id}`);
    } else {
      // Fallback to a default engagement ID or show error
      alert('No engagement available for completeness testing. Please upload data first.');
    }
  };
  const handleEnableWalletClick = () => console.log('Enable wallet clicked');
  const handleRatingClick = (rating) => console.log('Rating:', rating);
  const handleRefreshFiles = () => fetchDataFiles();

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 100px)',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} sx={{ color: colors.accent }} />
        <Typography variant="body1" sx={{ color: colors.textSecondary }}>
          Loading data files...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ px: 3, pt: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography 
                variant="body2" 
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={handleRefreshFiles}
              >
                Retry
              </Typography>
            </Box>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      bgcolor: colors.background, 
      minHeight: '100vh'
    }}>
      {/* Main Content Container */}
      <Box sx={{ bgcolor: colors.background, px: 3, pt: 3, pb: 3 }}>
        {/* Welcome Section with Dynamic Data */}
        <WelcomeSection
          currentDate="10"
          dayOfWeek="Tuesday,"
          month="September"
          year="2025"
          onTasksClick={handleTasksClick}
          onCalendarClick={handleCalendarClick}
          onVoiceClick={handleVoiceClick}
          onCompletenessReportClick={handleCompletenessReportClick}
          welcomeMessage={totalEngagements > 0 ? `Welcome!  Muhammad 👋` : 'Welcome User! 👋'}
          subMessage={totalEngagements > 0 ? `You have data of ${uniqueCompanies.length} ${uniqueCompanies.length === 1 ? 'company' : 'companies'} and ${uniqueClients.length} ${uniqueClients.length === 1 ? 'client' : 'clients'}` : 'No engagements available'}
        />

        {/* Data Files Overview Cards */}
        <DashboardCardGrid
          // Map aggregate data to the existing card props
          cardData={{
            mainCard: {
              title: totalEngagements > 0 ? `${totalEngagements} Engagement${totalEngagements > 1 ? 's' : ''}` : "No Engagements",
              amount: `${aggregateStats.totalFiles} Files`,
              subtitle: totalEngagements > 0 ? `${uniqueCompanies.join(', ')} ${primaryEngagement ? `- FY ${primaryEngagement.fiscal_year}` : ''}` : 'No data available',
              fee: formatFileSize(totalFileSize)
            },
            stats: [
              {
                label: "Total Records",
                value: aggregateStats.totalRecords.toLocaleString(),
                subtitle: "Data entries across all engagements"
              },
              {
                label: "Processing Progress",
                value: `${processingProgress}%`,
                subtitle: `${aggregateStats.processedRecords}/${aggregateStats.totalRecords} processed`
              },
              {
                label: "File Status",
                value: `${aggregateStatusSummary.COMPLETED || 0}/${aggregateStats.totalFiles}`,
                subtitle: "Files completed"
              }
            ]
          }}
          engagementData={primaryEngagement}
          onReceiveClick={handleReceiveClick}
          onSendClick={handleSendClick}
        />

        {/* File Status Analysis */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <AnnualProfitsCard
            year={primaryEngagement?.fiscal_year?.toString() || "2025"}
            profits={[
              `${aggregateStatusSummary.COMPLETED || 0} Completed`,
              `${aggregateStatusSummary.PENDING || 0} Pending`, 
              `${aggregateStatusSummary.PROCESSING || 0} Processing`,
              `${aggregateStatusSummary.FAILED || 0} Failed`
            ]}
          />
          <ActivityManagerCard
            onSearchChange={handleSearchChange}
            onMoreClick={() => console.log('More clicked')}
            onVisibilityClick={() => console.log('Visibility clicked')}
            onFilterClick={() => console.log('Filter clicked')}
            onEnableWalletClick={handleRefreshFiles}
            searchPlaceholder="Search files..."
            fileData={{
              files: filteredFiles,
              totalSize: formatFileSize(totalFileSize),
              engagement: {
                totalEngagements,
                uniqueCompanies,
                uniqueClients,
                aggregateStats
              }
            }}
          />
        </Grid>

        {/* Engagement Listing */}
        <Grid container spacing={3}>
          <BusinessRatingCard
            onMoreClick={() => console.log('More clicked')}
            onCloseClick={() => console.log('Close clicked')}
            onEngagementClick={(engagement) => console.log('Engagement clicked:', engagement)}
            onViewReport={(engagement) => {
              console.log('View report for engagement:', engagement.engagement_id);
              navigate(`/expense-sheet-details/${engagement.engagement_id}`);

              // Here you can navigate to a report page or open a modal
              alert(`Viewing report for ${engagement.engagement_id} - ${engagement.client_name}`);
            }}
            onCompletenessReport={(engagement) => {
              console.log('View completeness report for engagement:', engagement.engagement_id);
              navigate(`/completeness-test-report/${engagement.engagement_id}`);
            }}
            title="Engagement Listings"
            engagements={engagements}
          />
        </Grid>
      </Box>
    </Box>
  );
}