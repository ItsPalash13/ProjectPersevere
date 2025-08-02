import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { session: 1, rating: 25 },
  { session: 2, rating: 28 },
  { session: 3, rating: 27 },
  { session: 4, rating: 30 },
  { session: 5, rating: 32 },
  { session: 6, rating: 35 },
  { session: 7, rating: 38 },
  { session: 8, rating: 40 },
  { session: 9, rating: 42 },
  { session: 10, rating: 45 },
];

const SkillProgressionCard = () => {
  const currentRating = data[data.length - 1].rating;
  const previousRating = data[data.length - 2].rating;
  const percentageChange = ((currentRating - previousRating) / previousRating * 100).toFixed(1);

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
          Skill Rating
        </Typography>

        <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
          {currentRating}
          <Chip
            label={`${percentageChange > 0 ? '+' : ''}${percentageChange}%`}
            size="small"
            sx={{
              ml: 1,
              backgroundColor: percentageChange >= 0 ? '#e6f4ea' : '#fce8e6',
              color: percentageChange >= 0 ? '#1e8e3e' : '#d93025',
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: 1,
              height: '24px',
            }}
          />
        </Typography>

        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
          Last 10 sessions
        </Typography>

        <Box mt={3} height={150}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis 
                dataKey="session" 
                tick={{ fontSize: 12, fill: '#757575' }}
                tickFormatter={(value) => `S${value}`}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#757575' }}
                domain={['dataMin - 5', 'dataMax + 5']}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip 
                formatter={(value) => [`Rating: ${value}`, 'Skill Rating']}
                labelFormatter={(label) => `Session ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="rating" 
                stroke="#424242" 
                strokeWidth={2.5} 
                dot={{ r: 4, fill: '#424242', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#424242', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SkillProgressionCard; 