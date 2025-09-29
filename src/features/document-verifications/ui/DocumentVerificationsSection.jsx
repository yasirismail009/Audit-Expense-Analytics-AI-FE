import React from 'react';
import { Box, Typography, Grid, Chip, IconButton, Tooltip, Card, CardContent, Button } from '@mui/material';
import { Visibility as VisibilityIcon, Description as DocumentIcon } from '@mui/icons-material';
import { dashboardColors as colors } from '../../../utils/dashboardColors';
import { StatusCard } from '../../../shared/ui/status-card/StatusCard';
import { DataTable } from '../../../shared/ui/data-table/DataTable';
import { Assessment as AssessmentIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';

export const DocumentVerificationsSection = ({ 
  documentVerifications, 
  failedDocumentVerifications,
  onDocumentClick 
}) => {
  // Server-side pagination only - no local state needed

  if (!documentVerifications) {
    return (
      <Box sx={{ mb: 4, textAlign: 'center', py: 4 }}>
        <Typography variant="body2" sx={{ color: colors.textSecondary, fontStyle: 'italic' }}>
          Document verification details are not available for this engagement
        </Typography>
      </Box>
    );
  }

  const summaryCards = [
    {
      title: 'TOTAL DOCUMENTS',
      value: (documentVerifications.summary_statistics?.total_documents || 0).toLocaleString(),
      subtitle: 'Documents Analyzed',
      color: colors.orange,
      icon: AssessmentIcon
    },
    {
      title: 'BALANCED DOCUMENTS',
      value: (documentVerifications.summary_statistics?.balanced_documents || 0).toLocaleString(),
      subtitle: `${documentVerifications.summary_statistics?.balance_rate_percentage?.toFixed(1) || 0}% Success`,
      color: '#10b981',
      icon: CheckCircleIcon
    },
    {
      title: 'UNBALANCED DOCUMENTS',
      value: (failedDocumentVerifications?.results?.length || documentVerifications.summary_statistics?.unbalanced_documents || 0).toLocaleString(),
      subtitle: 'Requires Review',
      color: colors.lightGray,
      icon: ErrorIcon
    },
    {
      title: 'BALANCE RATE',
      value: `${documentVerifications.summary_statistics?.balance_rate_percentage?.toFixed(1) || 0}%`,
      subtitle: 'Document Level',
      color: colors.lightGray,
      icon: TrendingUpIcon
    }
  ];

  const tableColumns = [
    { header: 'Document #', field: 'document_number' },
    { header: 'User', field: 'users', render: (value) => value?.join(', ') || 'N/A' },
    { 
      header: 'Status', 
      field: 'status', 
      render: (value) => (
        <Chip 
          label={value || 'UNKNOWN'}
          size="small"
          sx={{
            bgcolor: value === 'BALANCED' ? '#dcfce7' : '#fee2e2',
            color: value === 'BALANCED' ? '#059669' : '#dc2626',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        />
      )
    },
    { header: 'Debit Total', field: 'debit_total', render: (value) => value?.toLocaleString() || '0' },
    { header: 'Credit Total', field: 'credit_total', render: (value) => value?.toLocaleString() || '0' },
    { header: 'Net Balance', field: 'net_balance', render: (value) => value?.toLocaleString() || '0' },
    { header: 'Accounts', field: 'account_count', render: (value) => value || 0 },
    { header: 'Transactions', field: 'transaction_count', render: (value) => value || 0 },
    { 
      header: 'Actions', 
      field: 'actions', 
      render: (value, row) => (
        <Tooltip title="View Document Details" arrow>
          <IconButton
            size="small"
            onClick={() => onDocumentClick && onDocumentClick(row)}
            sx={{
              color: colors.primary,
              '&:hover': {
                bgcolor: 'rgba(59, 130, 246, 0.1)'
              }
            }}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: colors.text }}>
        Document Verifications Details
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {summaryCards.map((card, index) => (
          <Grid item size={{xs: 12, sm: 6, md: 3}} key={index}>
            <StatusCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Failed Document Verifications Table */}
      {failedDocumentVerifications?.results && failedDocumentVerifications.results.length > 0 && (
        <DataTable
          title="Failed Document Verifications"
          subtitle={`${failedDocumentVerifications.results.length} documents require review`}
          columns={[
            { header: 'Document #', field: 'document_number' },
            { header: 'User', field: 'users', render: (value) => value?.join(', ') || 'N/A' },
            { 
              header: 'Status', 
              field: 'status', 
              render: (value) => (
                <Chip 
                  label={value || 'UNBALANCED'}
                  size="small"
                  sx={{
                    bgcolor: '#fee2e2',
                    color: '#dc2626',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                />
              )
            },
            { header: 'Debit Total', field: 'debit_total', render: (value) => value?.toLocaleString() || '0' },
            { header: 'Credit Total', field: 'credit_total', render: (value) => value?.toLocaleString() || '0' },
            { 
              header: 'Net Balance', 
              field: 'net_balance', 
              render: (value) => (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: (value || 0) === 0 ? '#059669' : '#dc2626',
                    fontWeight: 600
                  }}
                >
                  {value?.toLocaleString() || '0'}
                </Typography>
              )
            },
            { header: 'Accounts', field: 'account_count', render: (value) => value || 0 },
            { header: 'Transactions', field: 'transaction_count', render: (value) => value || 0 },
            { 
              header: 'Actions', 
              field: 'actions', 
              render: (value, row) => (
                <Tooltip title="View Document Details" arrow>
                  <IconButton
                    size="small"
                    onClick={() => onDocumentClick && onDocumentClick(row)}
                    sx={{
                      color: '#925B9B',
                      '&:hover': {
                        bgcolor: 'rgba(146, 91, 155, 0.1)'
                      }
                    }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )
            }
          ]}
          data={failedDocumentVerifications.results}
          currentPage={failedDocumentVerifications.pagination?.current_page || 1}
          itemsPerPage={failedDocumentVerifications.pagination?.page_size || 10}
          totalItems={failedDocumentVerifications.pagination?.total_items || failedDocumentVerifications.results.length}
          totalPages={failedDocumentVerifications.pagination?.total_pages || Math.ceil(failedDocumentVerifications.results.length / 10)}
          onPageChange={(page) => {
            // This should trigger a new API call with the new page
            // The parent component should handle this
            console.log('Failed documents page changed to:', page);
          }}
        />
      )}

      {/* Document Verification Results Table */}
      {documentVerifications?.results && documentVerifications.results.length > 0 && (
        <DataTable
          title="Document Verification Results"
          subtitle="Detailed analysis of document balance verification"
          columns={tableColumns}
          data={documentVerifications.results}
          currentPage={documentVerifications.pagination?.current_page || 1}
          itemsPerPage={documentVerifications.pagination?.page_size || 10}
          totalItems={documentVerifications.pagination?.total_items}
          totalPages={documentVerifications.pagination?.total_pages}
          onPageChange={(page) => {
            // This should trigger a new API call with the new page
            // The parent component should handle this
            console.log('Page changed to:', page);
          }}
        />
      )}
    </Box>
  );
};
