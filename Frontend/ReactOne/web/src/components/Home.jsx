import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors , themeColors} from '../theme/colors';

const Home = () => {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: themeColors.background.main,
        color: colors.text.light.primary,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: '4rem',
          fontWeight: 700,
          textAlign: 'center',
          letterSpacing: 2,
          color: themeColors.text.primary,
          mb:15
        }}
      >
        Welcome..!
      </Typography>
    </Box>
  );
};

export default Home; 