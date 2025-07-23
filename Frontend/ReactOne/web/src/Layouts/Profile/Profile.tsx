// @ts-nocheck
import React from 'react';
import { useSelector } from 'react-redux';
import { Avatar, Box, Card, CardContent, Typography, CircularProgress, Alert, Button } from '@mui/material';
// @ts-ignore
import { selectCurrentUser } from '../../features/auth/authSlice';
// @ts-ignore
import { useGetUserInfoQuery } from '../../features/api/userAPI';

interface UserInfo {
  _id?: string;
  name?: string;
  email?: string;
  totalXp?: number;
  health?: number;
  badges?: Array<{ badgeId: string; level: number }>;
  [key: string]: any;
}

const Profile: React.FC = () => {
  // Get current user from Redux
  const user: UserInfo = useSelector(selectCurrentUser) || {};
  console.log(user?.id);
  const userId = user?.id;

  // Fetch user info from API
  const { data, isLoading, error, refetch } = useGetUserInfoQuery(userId, { skip: !userId });
  const userInfo: UserInfo = data?.data || user;
  const badges = userInfo?.badges || [];

  if (!userId) {
    return <Alert severity="error">User not found. Please log in again.</Alert>;
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default', p: 4, boxSizing: 'border-box' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 36 }}>
          {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {userInfo?.name || 'User'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {userInfo?.email || 'No email'}
        </Typography>
        {isLoading && <CircularProgress size={24} sx={{ mt: 2 }} />}
        {error && <Alert severity="error" sx={{ mt: 2 }}>Failed to load profile. <Button onClick={() => refetch()} size="small">Retry</Button></Alert>}
        <Box sx={{ mt: 3, width: '100%', maxWidth: 500 }}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>Profile Info</Typography>
          <Typography variant="body2" color="text.secondary">XP: {userInfo?.totalXp ?? 0}</Typography>
          <Typography variant="body2" color="text.secondary">Health: {userInfo?.health ?? 0}</Typography>
        </Box>
      </Box>
      {/* Badges Section */}
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>Badges</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-start', alignItems: 'center', width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
          {badges.length === 0 && (
            <Typography color="text.secondary">No badges earned yet.</Typography>
          )}
          {badges.map((badge, idx) => {
            const badgeDef = badge.badgeId;
            if (!badgeDef) return null;
            const level = badge.level ?? 0;
            const badgeLevel = badgeDef.badgelevel?.[level] || {};
            return (
              <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120, maxWidth: 180 }}>
                <img
                  src={badgeLevel.badgeImage || ''}
                  alt={badgeDef.badgeName}
                  style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 12, marginBottom: 8, background: '#f5f5f5' }}
                />
                <Typography variant="subtitle1" fontWeight={500} align="center">
                  {badgeDef.badgeName}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {badgeDef.badgeDescription}
                </Typography>
                <Typography variant="caption" color="primary" align="center" sx={{ mt: 0.5 }}>
                  Level: {level + 1}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;
