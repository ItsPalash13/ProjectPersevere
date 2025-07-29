import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  IconButton,
  Avatar,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// Predefined color options
const colorOptions = [
  { name: 'Blue', value: '#2196F3', hex: '#2196F3' },
  { name: 'Green', value: '#4CAF50', hex: '#4CAF50' },
  { name: 'Purple', value: '#9C27B0', hex: '#9C27B0' },
  { name: 'Orange', value: '#FF9800', hex: '#FF9800' },
  { name: 'Red', value: '#F44336', hex: '#F44336' },
  { name: 'Teal', value: '#009688', hex: '#009688' },
  { name: 'Pink', value: '#E91E63', hex: '#E91E63' },
  { name: 'Indigo', value: '#3F51B5', hex: '#3F51B5' },
  { name: 'Cyan', value: '#00BCD4', hex: '#00BCD4' },
  { name: 'Lime', value: '#CDDC39', hex: '#CDDC39' },
  { name: 'Amber', value: '#FFC107', hex: '#FFC107' },
  { name: 'Deep Purple', value: '#673AB7', hex: '#673AB7' },
  { name: 'Light Blue', value: '#03A9F4', hex: '#03A9F4' },
  { name: 'Light Green', value: '#8BC34A', hex: '#8BC34A' },
  { name: 'Deep Orange', value: '#FF5722', hex: '#FF5722' },
  { name: 'Brown', value: '#795548', hex: '#795548' },
];

const AvatarColorPicker = ({ open, onClose, onSelect, currentColor, currentAvatar }) => {
  const [selectedColor, setSelectedColor] = useState(currentColor || '#2196F3');

  const handleColorClick = (color) => {
    setSelectedColor(color);
  };

  const handleConfirm = () => {
    onSelect(selectedColor);
    onClose();
  };

  const handleCancel = () => {
    setSelectedColor(currentColor || '#2196F3');
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
          Select Avatar Background Color
        </Typography>
        <IconButton onClick={handleCancel} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose a background color for your avatar:
        </Typography>
        
        {/* Preview */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Avatar
            src={currentAvatar}
            sx={{
              width: 80,
              height: 80,
              fontSize: 32,
              bgcolor: selectedColor,
              border: '3px solid',
              borderColor: 'primary.main',
            }}
          >
            U
          </Avatar>
        </Box>
        
        <Grid container spacing={2}>
          {colorOptions.map((color) => (
            <Grid item xs={6} sm={4} md={3} key={color.value}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 2,
                  border: selectedColor === color.value ? '2px solid' : '2px solid transparent',
                  borderColor: 'primary.main',
                  bgcolor: selectedColor === color.value ? 'primary.light' : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
                onClick={() => handleColorClick(color.value)}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    bgcolor: color.value,
                    mb: 1,
                    border: '2px solid',
                    borderColor: selectedColor === color.value ? 'primary.main' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                  }}
                >
                  {selectedColor === color.value ? '✓' : ''}
                </Box>
                <Typography variant="caption" textAlign="center">
                  {color.name}
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
          disabled={!selectedColor}
        >
          Confirm Selection
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AvatarColorPicker; 