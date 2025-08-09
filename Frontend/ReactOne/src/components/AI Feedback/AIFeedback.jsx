import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton
} from '@mui/material';
import { 
  Close as CloseIcon
} from '@mui/icons-material';
import { avatarImages } from '../../utils/avatarUtils';


const AIFeedback = ({ feedback, onClose, isVisible }) => {
  const [displayedFeedback, setDisplayedFeedback] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return avatarImages[Math.floor(Math.random() * avatarImages.length)].src;
  });

  // Typing animation effect
  useEffect(() => {
    if (feedback && currentIndex < feedback.length) {
      const timer = setTimeout(() => {
        setDisplayedFeedback(feedback.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 20);

      return () => clearTimeout(timer);
    }
  }, [feedback, currentIndex]);

  // Reset typing animation and pick a new avatar when feedback changes
  useEffect(() => {
    if (feedback) {
      setDisplayedFeedback('');
      setCurrentIndex(0);
      const randomAvatar = avatarImages[Math.floor(Math.random() * avatarImages.length)].src;
      setSelectedAvatar(randomAvatar);
    }
  }, [feedback]);

  if (!feedback || !isVisible || !selectedAvatar) {
    return null;
  }

    return (
    <Card sx={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 300,
      maxWidth: '90vw',
      backgroundColor: theme => theme.palette.mode === 'dark' 
        ? 'rgba(0, 0, 0, 0.9)' 
        : 'rgba(255, 255, 255, 0.95)',
      border: theme => `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'rgba(0, 0, 0, 0.2)'}`,
      borderRadius: 3,
      boxShadow: theme => theme.palette.mode === 'dark'
        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
        : '0 8px 32px rgba(0, 0, 0, 0.15)',
      zIndex: 10000,
      backdropFilter: 'blur(10px)',
      animation: 'slideIn 0.3s ease-out',
      '@keyframes slideIn': {
        '0%': {
          transform: 'translateX(100%)',
          opacity: 0
        },
        '100%': {
          transform: 'translateX(0)',
          opacity: 1
        }
      }
    }}>
      <CardContent sx={{ p: 2 }}>
        {/* Close Button */}
        <Box sx={{ 
          position: 'absolute',
          top: 0,
          right: 0
        }}>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: theme => theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.7)' 
                : 'rgba(0, 0, 0, 0.7)',
              '&:hover': {
                color: theme => theme.palette.mode === 'dark' ? 'white' : 'black',
                backgroundColor: theme => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Feedback Content */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: 1,
          minHeight: 'auto'
        }}>
         <Avatar
           src={selectedAvatar}
           sx={{
             width: 32,
             height: 32,
             border: theme => `2px solid ${theme.palette.mode === 'dark' 
               ? 'rgba(255, 255, 255, 0.3)' 
               : 'rgba(0, 0, 0, 0.3)'}`,
             flexShrink: 0,
             mt: 0
           }}
         />
         <Typography variant="body2" sx={{ 
           fontWeight: '500',
           fontStyle: 'italic',
           lineHeight: 1.4,
           color: theme => theme.palette.mode === 'dark' ? 'white' : 'black',
           flex: 1,
           mt: 1,
           wordWrap: 'break-word',
           overflowWrap: 'break-word'
         }}>
           {displayedFeedback}
           {currentIndex < feedback.length && (
             <span className="blink" style={{ marginLeft: '2px' }}>
               |
             </span>
           )}
         </Typography>
       </Box>
     </CardContent>
   </Card>
 );
};

export default AIFeedback; 