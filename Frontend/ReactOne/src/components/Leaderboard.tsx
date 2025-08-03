import React from 'react';
import {
  Box,
  Card,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon
} from '@mui/icons-material';
// @ts-ignore
import { getAvatarSrc, getDefaultAvatar, getDefaultAvatarBgColor } from '../utils/avatarUtils';

interface LeaderboardUser {
  _id: string;
  userId: string;
  username: string;
  fullName?: string;
  displayName: string;
  avatar?: string;
  avatarBgColor?: string;
  currentMonthXp: number;
  totalCoins: number;
}

interface LeaderboardProps {
  data?: LeaderboardUser[];
  month?: string;
  isLoading?: boolean;
  error?: any;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ 
  data = [], 
  month = new Date().toISOString().slice(0, 7).replace('-', '/'),
  isLoading = false,
  error = null
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyIcon sx={{ color: '#FFD700', fontSize: 24 }} />; // Gold
      case 2:
        return <TrophyIcon sx={{ color: '#C0C0C0', fontSize: 20 }} />; // Silver
      case 3:
        return <TrophyIcon sx={{ color: '#CD7F32', fontSize: 18 }} />; // Bronze
      default:
        return <StarIcon sx={{ color: '#666', fontSize: 16 }} />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#666';
    }
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load leaderboard: {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>
          Monthly Leaderboard
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {formatMonth(month)}
        </Typography>
        <Chip
          icon={<TrendingIcon />}
          label={`Top ${data.length} Players`}
          sx={{ 
            mt: 1,
            backgroundColor: theme => theme.palette.mode === 'dark' ? '#444' : '#1F1F1F',
            color: 'white',
            '&:hover': {
              backgroundColor: theme => theme.palette.mode === 'dark' ? '#555' : '#2A2A2A',
            }
          }}
          size="small"
        />
      </Box>

      {/* Leaderboard */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {data.length === 0 ? (
          <Card sx={{ 
            p: 2, 
            textAlign: 'center',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}>
            <Typography variant="body2" color="text.secondary">
              No data available for this month
            </Typography>
          </Card>
        ) : (
          data.map((user, index) => {
            const rank = index + 1;
            const getCurrentAvatarSrc = () => {
              if (user.avatar) {
                return getAvatarSrc(user.avatar);
              }
              return getDefaultAvatar().src;
            };

            const getCurrentBgColor = () => {
              return user.avatarBgColor || getDefaultAvatarBgColor();
            };

            return (
              <Card
                key={user._id}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  boxShadow: rank <= 3 ? 3 : 1,
                  border: rank <= 3 ? `1px solid ${getRankColor(rank)}` : '1px solid',
                  borderColor: rank <= 3 ? getRankColor(rank) : 'divider',
                  background: rank <= 3 
                    ? 'linear-gradient(135deg, rgba(255,215,0,0.05) 10%, rgba(255, 255, 255, 0.39) 100%)' 
                    : 'background.paper',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: 4,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {/* Rank */}
                  <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 40 }}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ color: getRankColor(rank), mr: 0.5 }}
                    >
                      #{rank}
                    </Typography>
                    {getRankIcon(rank)}
                  </Box>

                  {/* Avatar */}
                  <Avatar
                    src={getCurrentAvatarSrc()}
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: 12,
                      border: '1px solid',
                      borderColor: theme => theme.palette.mode === 'dark' ? '#444' : '#1F1F1F',
                      bgcolor: getCurrentBgColor(),
                      boxShadow: 1,
                    }}
                  >
                    {user.displayName.charAt(0).toUpperCase()}
                  </Avatar>

                  {/* User Info */}
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ color: 'text.primary' }}>
                      {user.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      @{user.username}
                    </Typography>
                  </Box>

                  {/* XP Stats */}
                  <Box sx={{ textAlign: 'right', minWidth: 60 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary' }}>
                      {user.currentMonthXp.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                      XP
                    </Typography>
                  </Box>
                </Box>
              </Card>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default Leaderboard;
