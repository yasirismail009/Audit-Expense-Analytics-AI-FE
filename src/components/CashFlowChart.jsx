import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '18 Oct', income: 3000, expense: -1500 },
  { name: '19 Oct', income: 2000, expense: -1000 },
  { name: '20 Oct', income: 4000, expense: -2000 },
  { name: '21 Oct', income: 3500, expense: -1200 },
  { name: '22 Oct', income: 5000, expense: -2500 },
  { name: '23 Oct', income: 2500, expense: -900 },
  { name: '24 Oct', income: 3000, expense: -1100 },
];

export default function CashFlowChart() {
  const [mode, setMode] = useState('weekly');

  const handleMode = (event, newMode) => {
    if (newMode) setMode(newMode);
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="subtitle2">Cash Flow</Typography>
          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleMode}
            size="small"
            sx={{ background: '#f4f6fa', borderRadius: 2 }}
          >
            <ToggleButton value="weekly">Weekly</ToggleButton>
            <ToggleButton value="daily">Daily</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="income" fill="#0e766e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="#14b8a6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
} 