import React from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Chip } from '@mui/material';

const activity = [
  { name: 'Theo Lawrence', amount: '€ 5.000,0', status: 'Success', method: 'Credit Card', avatar: 'T', date: 'Oct 18, 2024' },
  { name: 'Amy March', amount: '€ -2.500,0', status: 'Pending', method: 'Bank Transfer', avatar: 'A', date: 'Mar 24, 2024' },
];

export default function RecentActivityTable() {
  return (
    <Card sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 4px 24px 0 rgba(1,77,78,0.10)', p: 1 }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>Recent Activity</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Method</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activity.map((row, idx) => (
                <TableRow key={row.name}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: 14 }}>{row.avatar}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{row.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.date}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{row.amount}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        bgcolor: row.status === 'Success' ? '#E6FAF5' : '#F3F4F6',
                        color: row.status === 'Success' ? '#00B686' : '#64748B',
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">{row.method}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
} 