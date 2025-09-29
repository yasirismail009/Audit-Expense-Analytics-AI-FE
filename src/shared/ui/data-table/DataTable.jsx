import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  Tooltip,
  Box,
  Typography,
  Pagination
} from '@mui/material';
import { dashboardColors as colors } from '../../../utils/dashboardColors';
import { formatCurrency } from '../../../utils/colorScheme';

export const DataTable = ({ 
  columns, 
  data, 
  title, 
  subtitle,
  pagination,
  onPageChange,
  currentPage = 1,
  itemsPerPage = 10,
  totalItems,
  totalPages,
  showPagination = true
}) => {
  // Use server-side pagination if totalItems and totalPages are provided
  const isServerSidePagination = totalItems !== undefined && totalPages !== undefined;
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = isServerSidePagination ? data : data.slice(startIndex, endIndex);
  const calculatedTotalPages = isServerSidePagination ? totalPages : Math.ceil(data.length / itemsPerPage);
  const displayTotalItems = isServerSidePagination ? totalItems : data.length;

  return (
    <Paper sx={{ 
      bgcolor: 'white',
      borderRadius: 3,
      border: `1px solid ${colors.lightGray}`,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <Box sx={{ p: 3, borderBottom: `1px solid ${colors.lightGray}` }}>
        <Typography variant="h6" fontWeight={600} sx={{ color: colors.text, mb: 0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: colors.lightGray }}>
              {columns.map((column, index) => (
                <TableCell 
                  key={index}
                  sx={{ fontWeight: 600, color: colors.textSecondary, fontSize: '0.875rem' }}
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, rowIndex) => (
              <TableRow key={rowIndex} sx={{ '&:hover': { bgcolor: colors.background } }}>
                {columns.map((column, colIndex) => {
                  const value = row[column.field];
                  const cellContent = column.render ? column.render(value, row) : value;
                  
                  return (
                    <TableCell key={colIndex} sx={{ fontSize: '0.875rem' }}>
                      {column.tooltip ? (
                        <Tooltip title={column.tooltip(value, row)} arrow>
                          <span style={{ cursor: 'help' }}>{cellContent}</span>
                        </Tooltip>
                      ) : (
                        cellContent
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && calculatedTotalPages > 1 && (
        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${colors.lightGray}`, 
          bgcolor: colors.lightGray,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            {isServerSidePagination 
              ? `Showing ${startIndex + 1} to ${Math.min(endIndex, displayTotalItems)} of ${displayTotalItems} entries`
              : `Showing ${startIndex + 1} to ${Math.min(endIndex, data.length)} of ${data.length} entries`
            }
          </Typography>
          <Pagination
            count={calculatedTotalPages}
            page={currentPage}
            onChange={(event, page) => onPageChange && onPageChange(page)}
            size="small"
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: '0.75rem',
                minWidth: '32px',
                height: '32px'
              }
            }}
          />
        </Box>
      )}
    </Paper>
  );
};
