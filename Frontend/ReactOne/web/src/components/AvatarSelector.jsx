import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Avatar,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { avatarImages } from '../utils/avatarUtils';

const AvatarSelector = ({ open, onClose, onSelect, currentAvatar }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || '');

  const handleAvatarClick = (avatarId) => {
    setSelectedAvatar(avatarId);
  };

  const handleConfirm = () => {
    onSelect(selectedAvatar);
    onClose();
  };

  const handleCancel = () => {
    setSelectedAvatar(currentAvatar || '');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" fontWeight={600}>
          Select Avatar
        </Typography>
        <IconButton onClick={handleCancel} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose your profile picture from the available avatars:
        </Typography>
        
        <Grid container spacing={2}>
          {avatarImages.map((avatar) => (
            <Grid item xs={6} sm={4} md={3} key={avatar.id}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 2,
                  border: selectedAvatar === avatar.id ? '2px solid' : '2px solid transparent',
                  borderColor: 'primary.main',
                  bgcolor: selectedAvatar === avatar.id ? 'primary.light' : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
                onClick={() => handleAvatarClick(avatar.id)}
              >
                <Avatar
                  src={avatar.src}
                  alt={avatar.name}
                  sx={{
                    width: 60,
                    height: 60,
                    mb: 1,
                    border: '2px solid',
                    borderColor: selectedAvatar === avatar.id ? 'primary.main' : 'transparent',
                  }}
                />
                <Typography variant="caption" textAlign="center">
                  {avatar.name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          disabled={!selectedAvatar}
        >
          Confirm Selection
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvatarSelector; 