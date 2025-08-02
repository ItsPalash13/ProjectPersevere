import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const data = [
  { value: 100 }, { value: 105 }, { value: 102 }, { value: 108 },
  { value: 107 }, { value: 110 }, { value: 112 }, { value: 118 },
  { value: 115 }, { value: 125 }, { value: 130 }, { value: 135 },
];

const UserStatsCard = () => {
  return (
    <Card sx={{ 
      borderRadius: 3, 
      boxShadow: 2,
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      }
    }}>
      <CardContent sx={{ p: 3,width:250 }}>
        <Typography variant="body2" color="text.secondary" mb={1} sx={{ fontSize: '0.9rem' }}>
          Users
        </Typography>

        <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
          14k
          <Chip
            label="+25%"
            size="small"
            sx={{
              ml: 1,
              backgroundColor: '#e6f4ea',
              color: '#1e8e3e',
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: 1,
              height: '24px',
            }}
          />
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
          Last 30 days
        </Typography>

        <Box mt={3} height={60}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#424242" 
                strokeWidth={2.5} 
                dot={false}
                activeDot={{ r: 4, fill: '#424242', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserStatsCard; 