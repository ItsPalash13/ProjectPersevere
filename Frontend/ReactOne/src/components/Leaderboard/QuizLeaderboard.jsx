import React, { useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Timer as TimerIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

// Import avatar images
import avatar23 from '../../assets/avatars/image 23.png';
import avatar24 from '../../assets/avatars/image 24.png';
import avatar29 from '../../assets/avatars/image 29.png';
import avatar30 from '../../assets/avatars/image 30.png';
import avatar54 from '../../assets/avatars/image 54.png';
import avatar55 from '../../assets/avatars/image 55.png';
import avatar73 from '../../assets/avatars/image 73.png';
import avatar74 from '../../assets/avatars/image 74.png';
import avatar104 from '../../assets/avatars/image 104.png';
import avatar105 from '../../assets/avatars/image 105.png';

const QuizLeaderboard = ({ 
  leaderboardData = [], 
  currentUserRank = null, 
  attemptType = 'time_rush',
  formatTime,
  userPercentile = null
}) => {
  const scrollContainerRef = useRef(null);

  if (!leaderboardData || leaderboardData.length === 0) {
    return null;
  }

  // Find current user in leaderboard and scroll to their position
  useEffect(() => {
    if (scrollContainerRef.current && currentUserRank && currentUserRank <= 5) {
      // Find the user's position in the leaderboard (0-based index)
      const userIndex = leaderboardData.findIndex(user => user.rank === currentUserRank);
      
      if (userIndex !== -1) {
        // Calculate scroll position (each item is approximately 70px height including gap)
        const itemHeight = 70;
        const scrollPosition = userIndex * itemHeight;
        
        // Scroll to the user's position with smooth animation
        scrollContainerRef.current.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [leaderboardData, currentUserRank]);

  // Avatar mapping
  const avatarMap = {
    'image 23.png': avatar23,
    'image 24.png': avatar24,
    'image 29.png': avatar29,
    'image 30.png': avatar30,
    'image 54.png': avatar54,
    'image 55.png': avatar55,
    'image 73.png': avatar73,
    'image 74.png': avatar74,
    'image 104.png': avatar104,
    'image 105.png': avatar105
  };

  const getAvatarSrc = (avatarPath) => {
    if (!avatarPath) return null;
    
    // Extract filename from path if it's a full path
    const filename = avatarPath.includes('/') ? avatarPath.split('/').pop() : avatarPath;
    return avatarMap[filename] || null;
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <TrophyIcon sx={{ color: '#FFA500', fontSize: 20 }} />; // Orange
      case 2:
        return <TrophyIcon sx={{ color: '#E5E5E5', fontSize: 18 }} />; // Light Gray
      case 3:
        return <TrophyIcon sx={{ color: '#B8860B', fontSize: 16 }} />; // Dark Goldenrod
      default:
        return null; // No icon for ranks 4 and 5
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return { backgroundColor: '#FFA500', color: '#000' }; // Orange
      case 2:
        return { backgroundColor: '#E5E5E5', color: '#000' }; // Light Gray
      case 3:
        return { backgroundColor: '#B8860B', color: '#fff' }; // Dark Goldenrod
      default:
        return { backgroundColor: '#666666', color: '#fff' }; // Dark gray with white text for better visibility
    }
  };

  const getAvatarDisplay = (user) => {
    const avatarSrc = getAvatarSrc(user.avatar);
    
    if (avatarSrc) {
      return (
        <Avatar
          src={avatarSrc}
          sx={{
            width: 36,
            height: 36,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        />
      );
    }

    // Default avatar with background color
    const backgroundColor = user.avatarBgColor || 'rgba(255, 255, 255, 0.2)';
    const initials = user.fullName 
      ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : 'U';

    return (
      <Avatar
        sx={{
          width: 36,
          height: 36,
          backgroundColor,
          color: 'white',
          fontWeight: 'bold',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontSize: '0.875rem'
        }}
      >
        {initials}
      </Avatar>
    );
  };

  const formatTimeDisplay = (time) => {
    if (formatTime && typeof formatTime === 'function') {
      return formatTime(time);
    }
    // Default time formatting
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeLabel = () => {
    return attemptType === 'time_rush' ? 'Time Left' : 'Completion Time';
  };

  const getTimeIcon = () => {
    return attemptType === 'time_rush' ? <TimerIcon /> : <SpeedIcon />;
  };

  return (
    <Card sx={{
      backgroundColor: theme => theme.palette.mode === 'dark' 
        ? 'rgba(0, 0, 0, 0.8)' 
        : 'rgba(255, 255, 255, 0.95)',
      border: theme => `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.1)'}`,
      borderRadius: 3,
      mb: 1
    }}>
      <CardContent sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 1,
          mb: 2
        }}>
          <TrophyIcon sx={{ color: '#FFA500', fontSize: '1.2rem' }} />
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            color: '#FFA500'
          }}>
            Top 5 Leaderboard
          </Typography>
        </Box>

        {/* Leaderboard List */}
        <Box 
          ref={scrollContainerRef}
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1,
            maxHeight: '300px',
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: '4px',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: theme => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.1)' 
                : 'rgba(0,0,0,0.1)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.3)' 
                : 'rgba(0,0,0,0.3)',
              borderRadius: '3px',
              '&:hover': {
                background: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.5)' 
                  : 'rgba(0,0,0,0.5)',
              },
            },
          }}>
          {leaderboardData.map((user, index) => {
            const isCurrentUser = user.rank === currentUserRank;
            
            const rowContent = (
              <Box 
                key={user.userId}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: isCurrentUser 
                    ? 'rgba(255, 165, 0, 0.15)' // Orange glow for current user
                    : theme => theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.05)',
                  border: isCurrentUser 
                    ? '1px solid rgba(255, 165, 0, 0.4)' // Orange border for current user
                    : theme => `1px solid ${theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.1)' 
                      : 'rgba(0, 0, 0, 0.1)'}`,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: isCurrentUser 
                      ? 'rgba(255, 165, 0, 0.2)'
                      : theme => theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
              {/* Rank Icon - Only show for top 3 */}
              {user.rank <= 3 && (
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 24 }}>
                  {getRankIcon(user.rank)}
                </Box>
              )}
              {/* Empty space for ranks 4-5 to maintain alignment */}
              {user.rank > 3 && (
                <Box sx={{ minWidth: 24 }} />
              )}

              {/* Avatar */}
              {getAvatarDisplay(user)}

              {/* User Info */}
              <Box sx={{ flex: 2, minWidth: 0, alignContent: 'left', textAlign: 'left' }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: '500',
                  color: theme => theme.palette.mode === 'dark' ? 'white' : 'black',
                  alignContent: 'left',
                  lineHeight: 1.2
                }}>
                  {user.fullName || `User ${user.userId.slice(-4)}`}
                </Typography>
              </Box>

              {/* Time */}
              <Box sx={{ flex: 0, minWidth: '60px', textAlign: 'right' }}>
                <Typography variant="body2" sx={{ 
                  color: theme => theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.7)' 
                    : 'rgba(0, 0, 0, 0.7)',
                  fontWeight: '500'
                }}>
                  {formatTimeDisplay(user.time)}
                </Typography>
              </Box>

              {/* Rank Badge */}
              <Box sx={{ flex: 0, minWidth: '40px', display: 'flex', justifyContent: 'flex-end' }}>
                <Chip
                  label={user.rank <= 3 ? `#${user.rank}` : `#${user.rank}`}
                  size="small"
                  sx={{
                    ...getRankBadgeColor(user.rank),
                    fontWeight: 'bold',
                    fontSize: '0.7rem',
                    height: 20,
                    minWidth: '32px'
                  }}
                />
              </Box>
            </Box>
            );

            return isCurrentUser && userPercentile !== null ? (
              <Tooltip 
                title={`You are better than ${userPercentile}% of players`}
                arrow
                placement="top"
              >
                {rowContent}
              </Tooltip>
            ) : rowContent;
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuizLeaderboard;