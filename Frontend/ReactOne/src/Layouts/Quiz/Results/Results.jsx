import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Star as StarIcon, EmojiEvents as TrophyIcon, TrendingUp as TrendingIcon, AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import { quizStyles } from '../../../theme/quizTheme';

const Results = ({ quizResults, earnedBadges, formatTime, onNextLevel }) => {
  const [displayedFeedback, setDisplayedFeedback] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!quizResults) return null;

  const isTimeRush = quizResults.attemptType === 'time_rush';
  const data = isTimeRush ? quizResults.timeRush : quizResults.precisionPath;
  const progressPercent = Math.min((data.currentXp / data.requiredXp) * 100, 100);
  const isLevelCompleted = data.currentXp >= data.requiredXp;
  const hasNextLevel = quizResults.hasNextLevel && quizResults.nextLevelId;
  const aiFeedback = quizResults.aiFeedback;

  // Typing animation effect
  useEffect(() => {
    if (aiFeedback && currentIndex < aiFeedback.length) {
      const timer = setTimeout(() => {
        setDisplayedFeedback(aiFeedback.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      },20); // Adjust speed here (50ms = fast, 100ms = medium, 150ms = slow)

      return () => clearTimeout(timer);
    }
  }, [aiFeedback, currentIndex]);

  // Reset typing animation when aiFeedback changes
  useEffect(() => {
    if (aiFeedback) {
      setDisplayedFeedback('');
      setCurrentIndex(0);
    }
  }, [aiFeedback]);

  return (
    <Box sx={{ 
      maxHeight: '100vh', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      p: 0,
      '& .blink': {
        animation: 'blink 1s infinite',
      },
      '@keyframes blink': {
        '0%, 50%': { opacity: 1 },
        '51%, 100%': { opacity: 0 },
      }
    }}>
      {/* Header Section - XP and Percentile */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 1
      }}>
        {/* XP Display */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
          color: 'white',
          boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)',
          flex: 1,
          maxWidth: '45%'
        }}>
          <StarIcon sx={{ fontSize: '1.2rem' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
              {data.currentXp}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              XP EARNED
            </Typography>
          </Box>
        </Box>

        {/* Percentile Display */}
        {data.percentile !== undefined && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)',
            color: 'white',
            boxShadow: '0 4px 16px rgba(46, 125, 50, 0.3)',
            flex: 1,
            maxWidth: '45%'
          }}>
            <TrendingIcon sx={{ fontSize: '1.2rem' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                {String(data.percentile)}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                PERCENTILE
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* AI Feedback Section */}
      {aiFeedback && (
        <Card sx={{ 
          mb: 1,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent sx={{ p: 2, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <AutoAwesomeIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
              <Typography variant="body1" sx={{ 
                fontWeight: 'bold',
                fontStyle: 'italic',
                lineHeight: 1.4,
                color: 'text.primary',
                minHeight: '1.4em',
                position: 'relative'
              }}>
                {displayedFeedback}
                {currentIndex < aiFeedback.length && (
                  <span className="blink" style={{ marginLeft: '2px' }}>
                    |
                  </span>
                )}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Progress Section - Full Width */}
      <Card sx={{ 
        mb: 1,
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            <LinearProgress 
              variant="determinate" 
              value={progressPercent}
              sx={{ 
                flex: 1,
                height: 8, 
                borderRadius: 4,
                backgroundColor: theme => theme.palette.mode === 'dark' ? '#3a3a5c' : '#e5e7eb',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: isLevelCompleted ? '#4caf50' : '#f59e0b',
                }
              }}
            />
            <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 'fit-content' }}>
              {progressPercent.toFixed(1)}%
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Badges Section - Full Width */}
      {earnedBadges && earnedBadges.length > 0 && (
        <Card sx={{
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 1,
              mb: 1
            }}>
              <TrophyIcon sx={{ color: '#f57c00', fontSize: '1rem' }} />
              <Typography variant="body2" sx={{ 
                fontWeight: 'bold', 
                color: '#f57c00'
              }}>
                New Badges Earned!
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1, 
              justifyContent: 'center'
            }}>
              {earnedBadges.map((badge, index) => (
                <Box key={index} sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.25,
                  backgroundColor: 'rgba(255, 193, 7, 0.1)',
                  borderRadius: 1,
                  padding: '8px 12px',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  minWidth: 80,
                  maxWidth: 100
                }}>
                  {badge.badgeImage && (
                    <img 
                      src={badge.badgeImage} 
                      alt={badge.badgeName} 
                      style={{ 
                        width: 32, 
                        height: 32, 
                        objectFit: 'contain'
                      }} 
                    />
                  )}
                  <Typography variant="caption" sx={{ 
                    fontWeight: 'bold', 
                    color: '#f57c00',
                    textAlign: 'center',
                    lineHeight: 1.1,
                    fontSize: '0.7rem'
                  }}>
                    {badge.badgeName}
                  </Typography>
                  <Box sx={{ 
                    backgroundColor: '#f57c00', 
                    color: 'white', 
                    borderRadius: '50%', 
                    width: 16, 
                    height: 16, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    fontWeight: 'bold'
                  }}>
                    {badge.level + 1}
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Results; 