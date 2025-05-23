import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const data = [
  { session: 1, accuracy: 85, wrongAnswers: [2, 5] },
  { session: 2, accuracy: 90, wrongAnswers: [3] },
  { session: 3, accuracy: 75, wrongAnswers: [1, 4, 6] },
  { session: 4, accuracy: 95, wrongAnswers: [] },
  { session: 5, accuracy: 88, wrongAnswers: [2, 3] },
  { session: 6, accuracy: 92, wrongAnswers: [1] },
  { session: 7, accuracy: 87, wrongAnswers: [2, 4] },
  { session: 8, accuracy: 94, wrongAnswers: [] },
  { session: 9, accuracy: 89, wrongAnswers: [3] },
  { session: 10, accuracy: 96, wrongAnswers: [] },
];

const AccuracyCard = () => {
  const currentAccuracy = data[data.length - 1].accuracy;
  const previousAccuracy = data[data.length - 2].accuracy;
  const percentageChange = ((currentAccuracy - previousAccuracy) / previousAccuracy * 100).toFixed(1);

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
          Accuracy
        </Typography>

        <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
          {currentAccuracy}%
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
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Accuracy']}
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
                dataKey="accuracy" 
                stroke="#424242" 
                strokeWidth={2.5} 
                dot={{ r: 4, fill: '#424242', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#424242', stroke: '#fff', strokeWidth: 2 }}
              />
              {data.map((entry, index) => (
                entry.wrongAnswers.map((question, qIndex) => (
                  <ReferenceLine
                    key={`${index}-${qIndex}`}
                    x={entry.session}
                    stroke="#c62828"
                    strokeDasharray="3 3"
                    label={{
                      value: `Q${question}`,
                      position: 'top',
                      fill: '#c62828',
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                ))
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AccuracyCard; 