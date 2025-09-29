import React, { useState, useEffect } from 'react';
import { Box, Alert, Button, CircularProgress, Drawer, List, ListItem, ListItemText, IconButton, Typography, Card, CardContent, Grid, Chip, Divider } from '@mui/material';
import { useParams } from 'react-router-dom';
import { Close as CloseIcon, Description as DocumentIcon, AccountBalance as AccountBalanceIcon, TrendingUp, TrendingDown, CheckCircle, Error } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { dashboardColors as colors } from '../../../utils/dashboardColors';
import { completenessApi } from '../../../shared/lib/api/completenessApi';
import { transformApiDataToUIFormat } from '../../../shared/lib/utils/transformApiData';
import { EngagementBanner } from '../../../entities/engagement/ui/EngagementBanner';
import { CompletenessTestTabs } from './CompletenessTestTabs';
import { AccountVerificationsSection } from '../../account-verifications/ui/AccountVerificationsSection';
import { DocumentVerificationsSection } from '../../document-verifications/ui/DocumentVerificationsSection';
import { CompletenessReportWidget } from '../../../widgets/completeness-report/ui/CompletenessReportWidget';
import { AccountAnalysisWidget } from '../../../widgets/account-analysis/ui/AccountAnalysisWidget';
import CompletenessAnalysisDashboard from '../../../components/charts/CompletenessAnalysisDashboard';

export const CompletenessTestReport = () => {
  const { engagementId } = useParams();
  const [data, setData] = useState(null);
  const [accountVerifications, setAccountVerifications] = useState(null);
  const [failedAccountVerifications, setFailedAccountVerifications] = useState(null);
  const [documentVerifications, setDocumentVerifications] = useState(null);
  const [failedDocumentVerifications, setFailedDocumentVerifications] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentDrawerOpen, setDocumentDrawerOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [profitCenterData, setProfitCenterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const fetchCompletenessData = async () => {
    if (!engagementId) {
      setError('No engagement ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Fetch completeness test data first
      const completenessResponse = await completenessApi.fetchCompletenessData(engagementId);
      const transformedData = transformApiDataToUIFormat(completenessResponse);
      
      if (transformedData) {
        setData(transformedData);
      } else {
        throw new Error('Invalid or empty API response');
      }

      // Try to fetch account verifications data (optional - don't fail if unavailable)
      try {
        const [accountVerificationsResponse, failedAccountVerificationsResponse] = await Promise.all([
          completenessApi.fetchAccountVerifications(engagementId),
          completenessApi.fetchAccountVerifications(engagementId, true)
        ]);

        if (accountVerificationsResponse) {
          setAccountVerifications(accountVerificationsResponse);
          console.log('Account verifications loaded:', accountVerificationsResponse);
        }

        if (failedAccountVerificationsResponse) {
          setFailedAccountVerifications(failedAccountVerificationsResponse);
          console.log('Failed account verifications loaded:', failedAccountVerificationsResponse);
        }
      } catch (accountError) {
        console.log('Account verifications not available for this engagement:', accountError.message);
      }

      // Try to fetch document verifications data (optional - don't fail if unavailable)
      try {
        const [documentVerificationsResponse, failedDocumentVerificationsResponse] = await Promise.all([
          completenessApi.fetchDocumentVerifications(engagementId),
          completenessApi.fetchDocumentVerifications(engagementId, true)
        ]);

        if (documentVerificationsResponse) {
          setDocumentVerifications(documentVerificationsResponse);
          console.log('Document verifications loaded:', documentVerificationsResponse);
        }

        if (failedDocumentVerificationsResponse) {
          setFailedDocumentVerifications(failedDocumentVerificationsResponse);
          console.log('Failed document verifications loaded:', failedDocumentVerificationsResponse);
        }
      } catch (documentError) {
        console.log('Document verifications not available for this engagement:', documentError.message);
      }

    
    
    } catch (err) {
      console.error('Error fetching completeness data:', err);
      let errorMessage = 'Failed to load completeness test data';
      if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Backend server is not running. Please start the backend server.';
      } else if (err.code === 'ENOTFOUND') {
        errorMessage = 'Cannot connect to backend server. Please check if the server is running on localhost:8000.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Completeness test data not found for this engagement.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Backend server error. Please try again later.';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else {
        errorMessage = `Failed to load data: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletenessData();
  }, [engagementId]);

  const handleRefresh = () => fetchCompletenessData();
  const handleDownload = () => console.log('Download PDF');
  const handlePrint = () => console.log('Print report');

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ 
        bgcolor: '#fafafa', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} sx={{ color: colors.accent }} />
        <Typography variant="body1" sx={{ color: colors.textSecondary }}>
          Loading completeness test data...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh', p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
          sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!data || !data.overall || typeof data.overall.score === 'undefined') {
    return (
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh', p: 3 }}>
        <Alert 
          severity="info" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
          sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}
        >
          {error && error.includes('No completeness test results found') 
            ? 'No completeness test results found for this engagement. Tests may still be processing or not yet initiated.'
            : 'Data is incomplete or malformed. Please try refreshing the report.'}
        </Alert>
      </Box>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Overview
        return <AccountAnalysisWidget data={data} />;
      case 1: // Financial Data
        return <AccountAnalysisWidget data={data} />;
      case 2: // Account Analysis
        return <AccountAnalysisWidget data={data} />;
      case 3: // Audit & Quality
        return <AccountAnalysisWidget data={data} />;
      case 4: // Document Stats
        return <AccountAnalysisWidget data={data} />;
      default:
        return <AccountAnalysisWidget data={data} />;
    }
  };

  return (
    <Box sx={{ bgcolor: colors.background, minHeight: '100vh', p: 3 }}>
      {/* Modern Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} color={colors.text} sx={{ fontSize: '1.5rem', mb: 0.5 }}>
            Welcome, Analytics Team 👋
          </Typography>
          <Typography variant="body2" color={colors.textSecondary}>
            Let's analyze the completeness report today!
          </Typography>
        </Box>
        <Box sx={{ 
          minWidth: 120,
          height: 40,
          borderRadius: 2,
          bgcolor: colors.lightGray,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: colors.text,
          px: 2,
          border: `1px solid ${colors.orange}`
        }}>
          {engagementId ? engagementId : 'ENG-2024-001'}
        </Box>
      </Box>

      {/* Engagement Banner */}
      <EngagementBanner
        engagementName={data?.engagementName}
        testTimestamp={data?.testTimestamp}
        overallStatus={data?.overallStatus}
        totalGlRecords={data?.totalGlRecords}
        completenessScore={data?.completenessScore}
        testsPassed={data?.testsPassed}
        totalTests={data?.totalTests}
        criticalIssuesCount={data?.criticalIssuesCount}
        processingDuration={data?.processingDuration}
        comprehensiveStatistics={data?.comprehensiveStatistics}
        onDownload={handleDownload}
        onExportPdf={handlePrint}
      />

      {/* Tabbed Dashboard */}
      <Box sx={{ 
        bgcolor: colors.surface, 
        borderRadius: 3, 
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        mb: 4
      }}>
        <CompletenessTestTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <Box sx={{ p: 3 }}>
          {renderTabContent()}
        </Box>
      </Box>

      {/* Charts Dashboard */}
      <CompletenessAnalysisDashboard data={data} />

      {/* Test Results Widget */}
      <CompletenessReportWidget data={data} />

      {/* Account Verifications Section */}
      <AccountVerificationsSection
        accountVerifications={accountVerifications}
        failedAccountVerifications={failedAccountVerifications}
        onAccountClick={async (account) => {
          setSelectedAccount(account);
          setAccountDrawerOpen(true);
          
           // Fetch profit center data for the account
           try {
             const profitCenterResponse = await completenessApi.fetchProfitCenterData(account.account_code);
             setProfitCenterData(profitCenterResponse);
           } catch (error) {
             console.error('Error fetching profit center data:', error);
             setProfitCenterData(null);
           }
        }}
      />

      {/* Document Verifications Section */}
      <DocumentVerificationsSection
        documentVerifications={documentVerifications}
        failedDocumentVerifications={failedDocumentVerifications}
        onDocumentClick={(document) => {
          setSelectedDocument(document);
          setDocumentDrawerOpen(true);
        }}
      />

       {/* Document Details Drawer */}
       <Drawer
         anchor="right"
         open={documentDrawerOpen}
         onClose={() => setDocumentDrawerOpen(false)}
         sx={{
           '& .MuiDrawer-paper': {
             width: 800,
             bgcolor: colors.surface,
             borderLeft: `1px solid ${colors.borderLight}`
           }
         }}
       >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: colors.text }}>
              Document Details
            </Typography>
            <IconButton
              onClick={() => setDocumentDrawerOpen(false)}
              sx={{ color: colors.textSecondary }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {selectedDocument && (
            <Box>
              {/* Document Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <DocumentIcon sx={{ color: colors.primary, fontSize: 28 }} />
                <Box>
                  <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
                    Document {selectedDocument.document_number}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    {selectedDocument.is_balanced ? '✅ BALANCED' : '❌ UNBALANCED'} - Document Verification Details
                  </Typography>
                </Box>
              </Box>

              {/* Document Status and Balance Information */}
              <Box sx={{ mb: 3, p: 2, bgcolor: selectedDocument.is_balanced ? '#dcfce7' : '#fee2e2', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ color: colors.text, mb: 1 }}>
                  Document Status
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                  <strong>Status:</strong> {selectedDocument.status}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                  <strong>Balance Status:</strong> {selectedDocument.is_balanced ? 'Balanced' : 'Unbalanced'}
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text }}>
                  <strong>Variance:</strong> {selectedDocument.variance_formatted || '0.00'}
                </Typography>
              </Box>

              {/* Key Metrics Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: colors.background, border: 'none', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TrendingUp sx={{ fontSize: 16, color: colors.primary }} />
                        <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                          DEBIT TOTAL
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: colors.text }}>
                        {selectedDocument.debit_total?.toLocaleString() || '0'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: colors.background, border: 'none', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TrendingDown sx={{ fontSize: 16, color: colors.primary }} />
                        <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                          CREDIT TOTAL
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: colors.text }}>
                        {selectedDocument.credit_total?.toLocaleString() || '0'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Net Balance Card */}
              <Card sx={{ mb: 3, bgcolor: selectedDocument.is_balanced ? '#dcfce7' : '#fee2e2', border: 'none' }}>
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                    NET BALANCE
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ 
                    color: selectedDocument.is_balanced ? '#059669' : '#dc2626',
                    textShadow: `0 0 8px ${selectedDocument.is_balanced ? 'rgba(5, 150, 105, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`
                  }}>
                    {selectedDocument.net_balance?.toLocaleString() || '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    {selectedDocument.is_balanced ? 'Document is balanced' : 'Document is unbalanced'}
                  </Typography>
                </CardContent>
              </Card>

              {/* Activity Metrics */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Card sx={{ bgcolor: colors.background, border: 'none', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={700} sx={{ color: '#925B9B' }}>
                        {selectedDocument.transaction_count || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                        TRANSACTIONS
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card sx={{ bgcolor: colors.background, border: 'none', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={700} sx={{ color: '#925B9B' }}>
                        {selectedDocument.account_count || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                        ACCOUNTS
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card sx={{ bgcolor: colors.background, border: 'none', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={700} sx={{ color: '#925B9B' }}>
                        {selectedDocument.user_count || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                        USERS
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Users Section */}
              {selectedDocument.users && selectedDocument.users.length > 0 && (
                <Card sx={{ mb: 3, bgcolor: 'rgba(146, 91, 155, 0.05)', border: '1px solid rgba(146, 91, 155, 0.2)' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#925B9B', mb: 2 }}>
                      Associated Users
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedDocument.users.map((user, index) => (
                        <Chip
                          key={index}
                          label={user}
                          sx={{
                            bgcolor: 'rgba(146, 91, 155, 0.1)',
                            color: '#925B9B',
                            fontWeight: 600,
                            border: '1px solid rgba(146, 91, 155, 0.2)'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Accounts Section */}
              {selectedDocument.accounts && selectedDocument.accounts.length > 0 && (
                <Card sx={{ mb: 3, bgcolor: 'rgba(146, 91, 155, 0.05)', border: '1px solid rgba(146, 91, 155, 0.2)' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#925B9B', mb: 2 }}>
                      Associated Accounts ({selectedDocument.accounts.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedDocument.accounts.map((account, index) => (
                        <Chip
                          key={index}
                          label={account}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(146, 91, 155, 0.1)',
                            color: '#925B9B',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            border: '1px solid rgba(146, 91, 155, 0.2)'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Document Types Section */}
              {selectedDocument.document_types && selectedDocument.document_types.length > 0 && (
                <Card sx={{ mb: 3, bgcolor: 'rgba(146, 91, 155, 0.05)', border: '1px solid rgba(146, 91, 155, 0.2)' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#925B9B', mb: 2 }}>
                      Document Types
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedDocument.document_types.map((type, index) => (
                        <Chip
                          key={index}
                          label={type}
                          sx={{
                            bgcolor: 'rgba(146, 91, 155, 0.1)',
                            color: '#925B9B',
                            fontWeight: 600,
                            border: '1px solid rgba(146, 91, 155, 0.2)'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Profit Centers Section */}
              {selectedDocument.profit_centers && selectedDocument.profit_centers.length > 0 && (
                <Card sx={{ mb: 3, bgcolor: 'rgba(146, 91, 155, 0.05)', border: '1px solid rgba(146, 91, 155, 0.2)' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#925B9B', mb: 2 }}>
                      Profit Centers ({selectedDocument.profit_center_count || selectedDocument.profit_centers.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedDocument.profit_centers.map((center, index) => (
                        <Chip
                          key={index}
                          label={center}
                          sx={{
                            bgcolor: 'rgba(146, 91, 155, 0.1)',
                            color: '#925B9B',
                            fontWeight: 600,
                            border: '1px solid rgba(146, 91, 155, 0.2)'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Posting Dates Section */}
              {selectedDocument.posting_dates && selectedDocument.posting_dates.length > 0 && (
                <Card sx={{ mb: 3, bgcolor: 'rgba(146, 91, 155, 0.05)', border: '1px solid rgba(146, 91, 155, 0.2)' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#925B9B', mb: 2 }}>
                      Posting Dates
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedDocument.posting_dates.map((date, index) => (
                        <Chip
                          key={index}
                          label={date}
                          sx={{
                            bgcolor: 'rgba(146, 91, 155, 0.1)',
                            color: '#925B9B',
                            fontWeight: 600,
                            border: '1px solid rgba(146, 91, 155, 0.2)'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Account Links Information */}
              {selectedDocument.account_links && (
                <Card sx={{ mb: 3, bgcolor: 'rgba(146, 91, 155, 0.05)', border: '1px solid rgba(146, 91, 155, 0.2)' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#925B9B', mb: 2 }}>
                      Account Links Analysis
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                          TOTAL ACCOUNTS
                        </Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ color: colors.text }}>
                          {selectedDocument.account_links.total_accounts || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                          ACCOUNT DIVERSITY
                        </Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ color: colors.text }}>
                          {((selectedDocument.account_links.account_diversity || 0) * 100).toFixed(2)}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </Box>
      </Drawer>

       {/* Account Details Drawer */}
       <Drawer
         anchor="right"
         open={accountDrawerOpen}
         onClose={() => setAccountDrawerOpen(false)}
         sx={{
           '& .MuiDrawer-paper': {
             width: 800,
             bgcolor: colors.surface,
             borderLeft: `1px solid ${colors.borderLight}`
           }
         }}
       >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: colors.text }}>
              Account Details
            </Typography>
            <IconButton
              onClick={() => setAccountDrawerOpen(false)}
              sx={{ color: colors.textSecondary }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

           {selectedAccount && (
             <Box>
               {/* Account Header */}
               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                   <AccountBalanceIcon sx={{ color: colors.primary, fontSize: 28 }} />
                   <Box>
                     <Typography variant="h5" fontWeight={700} sx={{ color: colors.text }}>
                       Account {selectedAccount.account_code}
                     </Typography>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                       <Chip 
                         label={selectedAccount.status}
                         size="small"
                         icon={selectedAccount.account_passed ? <CheckCircle /> : <Error />}
                         sx={{
                           bgcolor: selectedAccount.account_passed ? '#dcfce7' : '#fee2e2',
                           color: selectedAccount.account_passed ? '#059669' : '#dc2626',
                           fontWeight: 600
                         }}
                       />
                       {selectedAccount.failure_reasons && selectedAccount.failure_reasons.length > 0 && (
                         <Chip 
                           label={`${selectedAccount.failure_reasons.length} Issues`}
                           size="small"
                           sx={{ bgcolor: colors.primary, color: 'white' }}
                         />
                       )}
                     </Box>
                   </Box>
                 </Box>
               </Box>

               {/* Key Metrics Cards */}
               <Grid container spacing={2} sx={{ mb: 3 }}>
                 <Grid item xs={6}>
                   <Card sx={{ bgcolor: colors.background, border: 'none', boxShadow: 'none' }}>
                     <CardContent sx={{ p: 2 }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                         <TrendingUp sx={{ fontSize: 16, color: colors.primary }} />
                         <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                           OPENING BALANCE
                         </Typography>
                       </Box>
                       <Typography variant="h6" fontWeight={700} sx={{ color: colors.text }}>
                         {selectedAccount.opening_balance_formatted || selectedAccount.opening_balance?.toLocaleString() || '0'}
                       </Typography>
                     </CardContent>
                   </Card>
                 </Grid>
                 <Grid item xs={6}>
                   <Card sx={{ bgcolor: colors.background, border: 'none', boxShadow: 'none' }}>
                     <CardContent sx={{ p: 2 }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                         <TrendingDown sx={{ fontSize: 16, color: colors.primary }} />
                         <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                           CLOSING BALANCE
                         </Typography>
                       </Box>
                       <Typography variant="h6" fontWeight={700} sx={{ color: colors.text }}>
                         {selectedAccount.closing_balance_formatted || selectedAccount.closing_balance?.toLocaleString() || '0'}
                       </Typography>
                     </CardContent>
                   </Card>
                 </Grid>
               </Grid>

               {/* Variance Chart */}
               <Card sx={{ mb: 3, bgcolor: colors.surface }}>
                 <CardContent>
                   <Typography variant="h6" fontWeight={600} sx={{ color: colors.text, mb: 2 }}>
                     Variance Analysis
                   </Typography>
                   
                   {/* Debug Info - Remove this after testing */}
                   <Box sx={{ mb: 2, p: 1, bgcolor: colors.background, borderRadius: 1, fontSize: '0.75rem' }}>
                     <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                       Raw: Audit: {selectedAccount.audit_variance} | Parsed: {parseFloat(selectedAccount.audit_variance) || 0} | 
                       Debit: {selectedAccount.gl_vs_tb_debit_variance} | Parsed: {parseFloat(selectedAccount.gl_vs_tb_debit_variance) || 0}
                     </Typography>
                   </Box>
                   <Box sx={{ height: 200 }}>
                     <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={[
                         { 
                           name: 'Audit Variance', 
                           value: Math.abs(parseFloat(selectedAccount.audit_variance) || 0),
                           formatted: selectedAccount.audit_variance_formatted || selectedAccount.audit_variance || '0',
                           color: '#8b5cf6',
                           originalValue: parseFloat(selectedAccount.audit_variance) || 0
                         },
                         { 
                           name: 'Debit Variance', 
                           value: Math.abs(parseFloat(selectedAccount.gl_vs_tb_debit_variance) || 0),
                           formatted: selectedAccount.gl_vs_tb_debit_variance?.toString() || '0',
                           color: '#8b5cf6',
                           originalValue: parseFloat(selectedAccount.gl_vs_tb_debit_variance) || 0
                         },
                         { 
                           name: 'Credit Variance', 
                           value: Math.abs(parseFloat(selectedAccount.gl_vs_tb_credit_variance) || 0),
                           formatted: selectedAccount.gl_vs_tb_credit_variance?.toString() || '0',
                           color: '#8b5cf6',
                           originalValue: parseFloat(selectedAccount.gl_vs_tb_credit_variance) || 0
                         },
                         { 
                           name: 'Movement Variance', 
                           value: Math.abs(parseFloat(selectedAccount.movement_variance_total) || 0),
                           formatted: selectedAccount.movement_variance_total?.toString() || '0',
                           color: '#8b5cf6',
                           originalValue: parseFloat(selectedAccount.movement_variance_total) || 0
                         }
                       ]}>
                         <defs>
                           <linearGradient id="varianceGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#925B9B" stopOpacity={0.8}/>
                             <stop offset="95%" stopColor="#925B9B" stopOpacity={0.1}/>
                           </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} />
                         <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                         <YAxis tick={{ fontSize: 12 }} />
                         <Tooltip 
                           formatter={(value, name, props) => [props.payload.formatted, name]}
                           labelStyle={{ color: colors.text }}
                           contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.borderLight}` }}
                         />
                         <Area 
                           type="monotone" 
                           dataKey="value" 
                           stroke="#925B9B" 
                           strokeWidth={2}
                           fill="url(#varianceGradient)" 
                         />
                       </AreaChart>
                     </ResponsiveContainer>
                   </Box>
                 </CardContent>
               </Card>

               {/* GL vs TB Comparison Chart */}
               <Card sx={{ mb: 3, bgcolor: colors.surface }}>
                 <CardContent>
                   <Typography variant="h6" fontWeight={600} sx={{ color: colors.text, mb: 2 }}>
                     GL vs TB Comparison
                   </Typography>
                   <Box sx={{ height: 200 }}>
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={[
                         { 
                           name: 'GL Debit', 
                           value: selectedAccount.gl_debit_total || 0,
                           formatted: selectedAccount.gl_debit_formatted || '0',
                           color: '#3b82f6'
                         },
                         { 
                           name: 'GL Credit', 
                           value: selectedAccount.gl_credit_total || 0,
                           formatted: selectedAccount.gl_credit_formatted || '0',
                           color: '#10b981'
                         },
                         { 
                           name: 'TB Debit', 
                           value: selectedAccount.tb_debit || 0,
                           formatted: selectedAccount.tb_debit_formatted || '0',
                           color: '#f59e0b'
                         },
                         { 
                           name: 'TB Credit', 
                           value: selectedAccount.tb_credit || 0,
                           formatted: selectedAccount.tb_credit_formatted || '0',
                           color: '#ef4444'
                         }
                       ]}>
                         <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} />
                         <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                         <YAxis tick={{ fontSize: 12 }} />
                         <Tooltip 
                           formatter={(value, name, props) => [props.payload.formatted, name]}
                           labelStyle={{ color: colors.text }}
                           contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.borderLight}` }}
                         />
                         <Bar dataKey="value" fill={colors.primary} radius={[4, 4, 0, 0]} />
                       </BarChart>
                     </ResponsiveContainer>
                   </Box>
                 </CardContent>
               </Card>

               {/* Validation Status */}
               <Grid container spacing={2} sx={{ mb: 3 }}>
                 <Grid item xs={6}>
                   <Card sx={{ 
                     bgcolor: selectedAccount.gl_tb_movements_match ? '#dcfce7' : '#fee2e2',
                     border: 'none',
                     boxShadow: 'none'
                   }}>
                     <CardContent sx={{ p: 2, textAlign: 'center' }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                         {selectedAccount.gl_tb_movements_match ? 
                           <CheckCircle sx={{ color: '#059669', fontSize: 20 }} /> : 
                           <Error sx={{ color: '#dc2626', fontSize: 20 }} />
                         }
                         <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                           MOVEMENTS MATCH
                         </Typography>
                       </Box>
                       <Typography variant="body2" fontWeight={600} sx={{ 
                         color: selectedAccount.gl_tb_movements_match ? '#059669' : '#dc2626' 
                       }}>
                         {selectedAccount.gl_tb_movements_match ? 'Yes' : 'No'}
                       </Typography>
                     </CardContent>
                   </Card>
                 </Grid>
                 <Grid item xs={6}>
                   <Card sx={{ 
                     bgcolor: selectedAccount.balance_equation_correct ? '#dcfce7' : '#fee2e2',
                     border: 'none',
                     boxShadow: 'none'
                   }}>
                     <CardContent sx={{ p: 2, textAlign: 'center' }}>
                       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                         {selectedAccount.balance_equation_correct ? 
                           <CheckCircle sx={{ color: '#059669', fontSize: 20 }} /> : 
                           <Error sx={{ color: '#dc2626', fontSize: 20 }} />
                         }
                         <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                           BALANCE EQUATION
                         </Typography>
                       </Box>
                       <Typography variant="body2" fontWeight={600} sx={{ 
                         color: selectedAccount.balance_equation_correct ? '#059669' : '#dc2626' 
                       }}>
                         {selectedAccount.balance_equation_correct ? 'Correct' : 'Incorrect'}
                       </Typography>
                     </CardContent>
                   </Card>
                 </Grid>
               </Grid>

               {/* Failure Reasons */}
               {selectedAccount.failure_reasons && selectedAccount.failure_reasons.length > 0 && (
                 <Card sx={{ mb: 3, bgcolor: '#fee2e2', border: 'none' }}>
                   <CardContent>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                       <Error sx={{ color: '#dc2626', fontSize: 20 }} />
                       <Typography variant="h6" fontWeight={600} sx={{ color: '#dc2626' }}>
                         Failure Reasons
                       </Typography>
                     </Box>
                     {selectedAccount.failure_reasons.map((reason, index) => (
                       <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                         <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#dc2626' }} />
                         <Typography variant="body2" sx={{ color: colors.text }}>
                           {reason}
                         </Typography>
                       </Box>
                     ))}
                   </CardContent>
                 </Card>
               )}

               {/* Variance Note */}
               {selectedAccount.variance_note && (
                 <Card sx={{ mb: 3, bgcolor: colors.background }}>
                   <CardContent>
                     <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, mb: 1, display: 'block' }}>
                       VARIANCE CALCULATION
                     </Typography>
                     <Typography variant="body2" sx={{ color: colors.text }}>
                       {selectedAccount.variance_note}
                     </Typography>
                   </CardContent>
                 </Card>
               )}

               {/* Profit Center Data Section */}
               {profitCenterData && (
                 <Box sx={{ 
                   mt: 3, 
                   pt: 3, 
                   borderTop: `2px solid #925B9B`,
                   background: 'linear-gradient(135deg, rgba(146, 91, 155, 0.05) 0%, rgba(146, 91, 155, 0.02) 100%)',
                   borderRadius: 3,
                   p: 2
                 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                     <Box sx={{
                       width: 40,
                       height: 40,
                       borderRadius: '50%',
                       background: 'linear-gradient(135deg, #925B9B 0%, #7A4A7A 100%)',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       boxShadow: '0 4px 12px rgba(146, 91, 155, 0.3)'
                     }}>
                       <AccountBalanceIcon sx={{ color: 'white', fontSize: 20 }} />
                     </Box>
                     <Box>
                       <Typography variant="h5" fontWeight={700} sx={{ color: '#925B9B', mb: 0.5 }}>
                         Profit Center Analysis
                       </Typography>
                       <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                         Advanced Financial Intelligence Dashboard
                       </Typography>
                     </Box>
                   </Box>
                   
                   {/* Account Summary */}
                   {profitCenterData.results && (
                     <Box sx={{ 
                       mb: 3, 
                       p: 3, 
                       bgcolor: 'rgba(146, 91, 155, 0.08)', 
                       borderRadius: 3,
                       border: '1px solid rgba(146, 91, 155, 0.2)',
                       position: 'relative',
                       overflow: 'hidden'
                     }}>
                       <Box sx={{
                         position: 'absolute',
                         top: 0,
                         right: 0,
                         width: 100,
                         height: 100,
                         background: 'linear-gradient(135deg, rgba(146, 91, 155, 0.1) 0%, transparent 100%)',
                         borderRadius: '0 0 0 100px'
                       }} />
                       <Typography variant="h6" fontWeight={700} sx={{ color: '#925B9B', mb: 2 }}>
                         Account Intelligence
                       </Typography>
                       <Grid container spacing={2}>
                         <Grid item size={{xs: 6, md: 6}}>
                           <Box sx={{ mb: 1 }}>
                             <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                               ACCOUNT ID
                             </Typography>
                             <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>
                               {profitCenterData.results.account_id}
                             </Typography>
                           </Box>
                         </Grid>
                         <Grid item size={{xs: 6, md: 6}}>
                           <Box sx={{ mb: 1 }}>
                             <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                               CURRENCY
                             </Typography>
                             <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>
                               {profitCenterData.results.gl_account_info?.currency}
                             </Typography>
                           </Box>
                         </Grid>
                         <Grid item size={{xs: 12, md: 12}}>
                           <Box sx={{ mb: 1 }}>
                             <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                               ACCOUNT NAME
                             </Typography>
                             <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>
                               {profitCenterData.results.gl_account_info?.account_name}
                             </Typography>
                           </Box>
                         </Grid>
                         <Grid item size={{xs: 6, md: 6}}>
                           <Box sx={{ mb: 1 }}>
                             <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                               ACCOUNT TYPE
                             </Typography>
                             <Typography variant="body2" fontWeight={600} sx={{ color: colors.text }}>
                               {profitCenterData.results.gl_account_info?.account_type}
                             </Typography>
                           </Box>
                         </Grid>
                         <Grid item size={{xs: 6, md: 6}}>
                           <Box sx={{ mb: 1 }}>
                             <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                               TOTAL CENTERS
                             </Typography>
                             <Typography variant="body2" fontWeight={600} sx={{ color: '#925B9B' }}>
                               {profitCenterData.results.total_profit_centers}
                             </Typography>
                           </Box>
                         </Grid>
                       </Grid>
                     </Box>
                   )}
                   
                   {/* Profit Centers List */}
                   {profitCenterData.results?.results && profitCenterData.results.results.length > 0 ? (
                     <Box>
                       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                         <Box sx={{
                           width: 8,
                           height: 8,
                           borderRadius: '50%',
                           bgcolor: '#925B9B',
                           boxShadow: '0 0 8px rgba(146, 91, 155, 0.5)'
                         }} />
                         <Typography variant="h6" fontWeight={700} sx={{ color: '#925B9B' }}>
                           Profit Centers ({profitCenterData.results.results.length})
                         </Typography>
                       </Box>
                       <Grid container spacing={2} sx={{ mb: 3 }}>
                         {profitCenterData.results.results.map((center, index) => (
                           <Grid item size={{xs: 12, md: 12}} key={center.id || index}>
                             <Card sx={{ 
                               mb: 2, 
                               p: 3, 
                               bgcolor: 'rgba(146, 91, 155, 0.03)', 
                               borderRadius: 3,
                               border: '1px solid rgba(146, 91, 155, 0.15)',
                               position: 'relative',
                               overflow: 'hidden',
                               transition: 'all 0.3s ease',
                               '&:hover': {
                                 transform: 'translateY(-2px)',
                                 boxShadow: '0 8px 25px rgba(146, 91, 155, 0.15)',
                                 border: '1px solid rgba(146, 91, 155, 0.3)'
                               }
                             }}>
                               {/* Futuristic Header */}
                               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                   <Box sx={{
                                     width: 12,
                                     height: 12,
                                     borderRadius: '50%',
                                     bgcolor: center.net_amount >= 0 ? '#059669' : '#dc2626',
                                     boxShadow: `0 0 8px ${center.net_amount >= 0 ? 'rgba(5, 150, 105, 0.5)' : 'rgba(220, 38, 38, 0.5)'}`
                                   }} />
                                   <Box>
                                     <Typography variant="h6" fontWeight={700} sx={{ color: colors.text }}>
                                       {center.profit_center_name}
                                     </Typography>
                                     <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                                       {center.profit_center_code} • {center.profit_center_status}
                                     </Typography>
                                   </Box>
                                 </Box>
                                 <Box sx={{ textAlign: 'right' }}>
                                   <Typography variant="h6" fontWeight={700} sx={{ 
                                     color: center.net_amount >= 0 ? '#059669' : '#dc2626',
                                     textShadow: `0 0 8px ${center.net_amount >= 0 ? 'rgba(5, 150, 105, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`
                                   }}>
                                     {center.net_amount?.toLocaleString() || '0'} SAR
                                   </Typography>
                                   <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600 }}>
                                     NET AMOUNT
                                   </Typography>
                                 </Box>
                               </Box>

                               {/* Financial Grid */}
                               <Grid container spacing={2} sx={{ mb: 3 }}>
                                 <Grid item size={{xs: 6, md: 6}}>
                                   <Box sx={{ 
                                     p: 2, 
                                     bgcolor: 'rgba(146, 91, 155, 0.08)', 
                                     borderRadius: 2,
                                     border: '1px solid rgba(146, 91, 155, 0.2)'
                                   }}>
                                     <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                                       DEBIT TOTAL
                                     </Typography>
                                     <Typography variant="body1" fontWeight={700} sx={{ color: colors.text }}>
                                       {center.debit_total?.toLocaleString() || '0'} SAR
                                     </Typography>
                                   </Box>
                                 </Grid>
                                 <Grid item size={{xs: 6, md: 6}}>
                                   <Box sx={{ 
                                     p: 2, 
                                     bgcolor: 'rgba(146, 91, 155, 0.08)', 
                                     borderRadius: 2,
                                     border: '1px solid rgba(146, 91, 155, 0.2)'
                                   }}>
                                     <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                                       CREDIT TOTAL
                                     </Typography>
                                     <Typography variant="body1" fontWeight={700} sx={{ color: colors.text }}>
                                       {center.credit_total?.toLocaleString() || '0'} SAR
                                     </Typography>
                                   </Box>
                                 </Grid>
                               </Grid>

                               {/* Activity Metrics */}
                               <Grid container spacing={1} sx={{ mb: 2 }}>
                                 <Grid item size={{xs: 4, md: 4}}>
                                   <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(146, 91, 155, 0.05)', borderRadius: 2 }}>
                                     <Typography variant="h6" fontWeight={700} sx={{ color: '#925B9B' }}>
                                       {center.transaction_count || 0}
                                     </Typography>
                                     <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                                       TRANSACTIONS
                                     </Typography>
                                   </Box>
                                 </Grid>
                                 <Grid item size={{xs: 4, md: 4}}>
                                   <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(146, 91, 155, 0.05)', borderRadius: 2 }}>
                                     <Typography variant="h6" fontWeight={700} sx={{ color: '#925B9B' }}>
                                       {center.document_count || 0}
                                     </Typography>
                                     <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                                       DOCUMENTS
                                     </Typography>
                                   </Box>
                                 </Grid>
                                 <Grid item size={{xs: 4, md: 4}}>
                                   <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(146, 91, 155, 0.05)', borderRadius: 2 }}>
                                     <Typography variant="h6" fontWeight={700} sx={{ color: '#925B9B' }}>
                                       {center.user_count || 0}
                                     </Typography>
                                     <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem' }}>
                                       USERS
                                     </Typography>
                                   </Box>
                                 </Grid>
                               </Grid>

                               {/* Users List */}
                               {center.users && center.users.length > 0 && (
                                 <Box sx={{ 
                                   p: 2, 
                                   bgcolor: 'rgba(146, 91, 155, 0.05)', 
                                   borderRadius: 2,
                                   border: '1px solid rgba(146, 91, 155, 0.15)'
                                 }}>
                                   <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.7rem', mb: 1, display: 'block' }}>
                                     ACTIVE USERS
                                   </Typography>
                                   <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                     {center.users.map((user, userIndex) => (
                                       <Chip
                                         key={userIndex}
                                         label={user}
                                         size="small"
                                         sx={{
                                           bgcolor: 'rgba(146, 91, 155, 0.1)',
                                           color: '#925B9B',
                                           fontWeight: 600,
                                           fontSize: '0.7rem',
                                           border: '1px solid rgba(146, 91, 155, 0.2)'
                                         }}
                                       />
                                     ))}
                                   </Box>
                                 </Box>
                               )}
                             </Card>
                           </Grid>
                         ))}
                       </Grid>
                     </Box>
                   ) : (
                     <Box sx={{ textAlign: 'center', py: 4 }}>
                       <Box sx={{
                         width: 60,
                         height: 60,
                         borderRadius: '50%',
                         bgcolor: 'rgba(146, 91, 155, 0.1)',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         mx: 'auto',
                         mb: 2
                       }}>
                         <AccountBalanceIcon sx={{ color: '#925B9B', fontSize: 30 }} />
                       </Box>
                       <Typography variant="body1" sx={{ color: colors.textSecondary, fontStyle: 'italic' }}>
                         No profit center data available for this account
                       </Typography>
                     </Box>
                   )}
                 </Box>
               )}

              {/* Loading state for profit center data */}
              {!profitCenterData && (
                <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${colors.borderLight}`, textAlign: 'center' }}>
                  <CircularProgress size={20} sx={{ color: colors.primary }} />
                  <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 1 }}>
                    Loading profit center data...
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        {data.overall.status === 'NO_RESULTS' ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
            <Typography variant="body2" sx={{ 
              color: colors.textSecondary,
              fontSize: '0.875rem',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              {data.noResultsMessage || 'No completeness test results found for this engagement'}
            </Typography>
          </Box>
        ) : data.overall.status === 'EXCELLENT' || data.overall.score >= 95 || (data.fieldAnalysis && data.fieldAnalysis.every(test => test.status === 'PASSED')) ? (
          <>
            <Button
              variant="outlined"
              onClick={handleRefresh}
              sx={{ 
                borderColor: colors.orange,
                color: colors.textSecondary,
                '&:hover': { 
                  borderColor: colors.textSecondary,
                  bgcolor: colors.lightGray
                }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              onClick={handleDownload}
              sx={{ 
                bgcolor: colors.primary,
                '&:hover': { 
                  bgcolor: colors.primaryDark
                }
              }}
            >
              Export PDF
            </Button>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
            <Typography variant="body2" sx={{ 
              color: colors.textSecondary,
              fontSize: '0.875rem',
              fontStyle: 'italic',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <CircularProgress size={16} sx={{ color: colors.textSecondary }} />
              Tests are still processing...
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};
