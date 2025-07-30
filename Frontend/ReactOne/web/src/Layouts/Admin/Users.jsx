import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import {
  // User Profile hooks
  useGetUserProfilesQuery,
  useCreateUserProfileMutation,
  useUpdateUserProfileMutation,
  useDeleteUserProfileMutation,
  // User Chapter Unit hooks
  useGetUserChapterUnitsQuery,
  useCreateUserChapterUnitMutation,
  useUpdateUserChapterUnitMutation,
  useDeleteUserChapterUnitMutation,
  // User Chapter Level hooks
  useGetUserChapterLevelsQuery,
  useCreateUserChapterLevelMutation,
  useUpdateUserChapterLevelMutation,
  useDeleteUserChapterLevelMutation,
  // User Level Session hooks (read-only)
  useGetUserLevelSessionsQuery,
  useGetUserLevelSessionByIdQuery,
  // Other hooks
  useGetChaptersQuery,
  useGetAllUnitsQuery,
  useGetLevelsQuery,
  useGetLevelsByChapterQuery,
} from '../../features/api/adminAPI';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`users-tabpanel-${index}`}
      aria-labelledby={`users-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function UsersAdmin() {
  const [tab, setTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const handleChange = (_e, newValue) => setTab(newValue);

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Users Management</Typography>
      <Tabs value={tab} onChange={handleChange} aria-label="users tabs">
        <Tab label="User Profiles" id="users-tab-0" aria-controls="users-tabpanel-0" />
        <Tab label="User Chapter Units" id="users-tab-1" aria-controls="users-tabpanel-1" />
        <Tab label="User Chapter Levels" id="users-tab-2" aria-controls="users-tabpanel-2" />
        <Tab label="User Level Sessions" id="users-tab-3" aria-controls="users-tabpanel-3" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <UserProfilesTab />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <UserChapterUnitsTab />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <UserChapterLevelsTab />
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <UserLevelSessionsTab />
      </TabPanel>
    </Box>
  );
}

// ==================== USER PROFILES TAB ====================
function UserProfilesTab() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: profilesData, isLoading } = useGetUserProfilesQuery({ search: searchQuery });
  const [createProfile] = useCreateUserProfileMutation();
  const [updateProfile] = useUpdateUserProfileMutation();
  const [deleteProfile] = useDeleteUserProfileMutation();

  const [formData, setFormData] = useState({
    userId: '',
    username: '',
    email: '',
    fullName: '',
    bio: '',
    dob: '',
    health: 6,
    totalCoins: 0,
    dailyAttemptsStreak: 0,
    lastAttemptDate: '',
    uniqueCorrectQuestions: [],
    uniqueTopics: [],
  });

  const handleOpenDialog = (profile = null) => {
    if (profile) {
      setEditingProfile(profile);
      setFormData({
        userId: profile.userId || '',
        username: profile.username || '',
        email: profile.email || '',
        fullName: profile.fullName || '',
        bio: profile.bio || '',
        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
        health: profile.health || 6,
        totalCoins: profile.totalCoins || 0,
        dailyAttemptsStreak: profile.dailyAttemptsStreak || 0,
        lastAttemptDate: profile.lastAttemptDate ? new Date(profile.lastAttemptDate).toISOString().split('T')[0] : '',
        uniqueCorrectQuestions: profile.uniqueCorrectQuestions || [],
        uniqueTopics: profile.uniqueTopics || [],
      });
    } else {
      setEditingProfile(null);
      setFormData({
        userId: '',
        username: '',
        email: '',
        fullName: '',
        bio: '',
        dob: '',
        health: 6,
        totalCoins: 0,
        dailyAttemptsStreak: 0,
        lastAttemptDate: '',
        uniqueCorrectQuestions: [],
        uniqueTopics: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProfile(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        health: parseInt(formData.health),
        totalCoins: parseInt(formData.totalCoins),
        dob: formData.dob ? new Date(formData.dob) : undefined,
        lastAttemptDate: formData.lastAttemptDate ? new Date(formData.lastAttemptDate) : null,
        uniqueCorrectQuestions: Array.isArray(formData.uniqueCorrectQuestions)
          ? formData.uniqueCorrectQuestions
          : (typeof formData.uniqueCorrectQuestions === 'string' && formData.uniqueCorrectQuestions.length > 0
              ? formData.uniqueCorrectQuestions.split(',').map(s => s.trim()).filter(Boolean)
              : []),
        uniqueTopics: Array.isArray(formData.uniqueTopics)
          ? formData.uniqueTopics
          : (typeof formData.uniqueTopics === 'string' && formData.uniqueTopics.length > 0
              ? formData.uniqueTopics.split(',').map(s => s.trim()).filter(Boolean)
              : []),
      };

      if (editingProfile) {
        await updateProfile({ id: editingProfile._id, ...submitData }).unwrap();
      } else {
        await createProfile(submitData).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user profile?')) {
      try {
        await deleteProfile(id).unwrap();
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  const columns = [
    { field: 'userId', headerName: 'User ID', width: 200 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'fullName', headerName: 'Full Name', width: 150 },
    { field: 'health', headerName: 'Health', width: 100 },
    { field: 'totalCoins', headerName: 'Total Coins', width: 120 },
    {
      field: 'dob',
      headerName: 'Date of Birth',
      width: 150,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleOpenDialog(params.row)} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(params.row._id)} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Search users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User Profile
        </Button>
      </Box>

      <DataGrid
        rows={profilesData?.data || []}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row._id}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        getRowHeight={() => 'auto'}
        sx={{ height: 500 }}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProfile ? 'Edit User Profile' : 'Add New User Profile'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="User ID"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                disabled={!!editingProfile}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                multiline
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Health"
                type="number"
                value={formData.health}
                onChange={(e) => setFormData({ ...formData, health: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Coins"
                type="number"
                value={formData.totalCoins}
                onChange={(e) => setFormData({ ...formData, totalCoins: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Daily Attempts Streak"
                type="number"
                value={formData.dailyAttemptsStreak}
                onChange={(e) => setFormData({ ...formData, dailyAttemptsStreak: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Attempt Date"
                type="date"
                value={formData.lastAttemptDate}
                onChange={(e) => setFormData({ ...formData, lastAttemptDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unique Correct Questions (comma separated IDs)"
                value={formData.uniqueCorrectQuestions.join(',')}
                onChange={(e) => setFormData({ ...formData, uniqueCorrectQuestions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unique Topics (comma separated IDs)"
                value={formData.uniqueTopics.join(',')}
                onChange={(e) => setFormData({ ...formData, uniqueTopics: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProfile ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ==================== USER CHAPTER UNITS TAB ====================
function UserChapterUnitsTab() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  const { data: unitsData, isLoading } = useGetUserChapterUnitsQuery();
  const { data: chaptersData } = useGetChaptersQuery();
  const { data: allUnitsData } = useGetAllUnitsQuery();
  const { data: userProfilesData } = useGetUserProfilesQuery();
  const [createUnit] = useCreateUserChapterUnitMutation();
  const [updateUnit] = useUpdateUserChapterUnitMutation();
  const [deleteUnit] = useDeleteUserChapterUnitMutation();

  const [formData, setFormData] = useState({
    userId: '',
    selectedUser: '',
    chapterId: '',
    unitId: '',
    status: 'not_started',
  });

  const handleOpenDialog = (unit = null) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({
        userId: unit.userId || '',
        selectedUser: unit.userId || '',
        chapterId: unit.chapterId?._id || unit.chapterId || '',
        unitId: unit.unitId?._id || unit.unitId || '',
        status: unit.status || 'not_started',
      });
    } else {
      setEditingUnit(null);
      setFormData({
        userId: '',
        selectedUser: '',
        chapterId: '',
        unitId: '',
        status: 'not_started',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUnit(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        userId: formData.selectedUser || formData.userId
      };
      delete submitData.selectedUser;

      if (editingUnit) {
        await updateUnit({ id: editingUnit._id, ...submitData }).unwrap();
      } else {
        await createUnit(submitData).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving user chapter unit:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user chapter unit?')) {
      try {
        await deleteUnit(id).unwrap();
      } catch (error) {
        console.error('Error deleting user chapter unit:', error);
      }
    }
  };

  const columns = [
    {
      field: 'userProfile',
      headerName: 'User',
      width: 250,
      renderCell: (params) => {
        if (params.value) {
          return `${params.value.username} (${params.value.email})`;
        }
        return params.row.userId || 'N/A';
      },
    },
    {
      field: 'chapterId',
      headerName: 'Chapter',
      width: 150,
      renderCell: (params) => params.value?.name || params.value || 'N/A',
    },
    {
      field: 'unitId',
      headerName: 'Unit',
      width: 150,
      renderCell: (params) => params.value?.name || params.value || 'N/A',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'completed' ? 'success' : 
            params.value === 'in_progress' ? 'warning' : 'default'
          }
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleOpenDialog(params.row)} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(params.row._id)} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">User Chapter Units</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User Chapter Unit
        </Button>
      </Box>

      <DataGrid
        rows={unitsData?.data || []}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row._id}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        getRowHeight={() => 'auto'}
        sx={{ height: 500 }}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUnit ? 'Edit User Chapter Unit' : 'Add New User Chapter Unit'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>User</InputLabel>
                <Select
                  value={formData.selectedUser}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    selectedUser: e.target.value,
                    userId: e.target.value 
                  })}
                  label="User"
                >
                  {userProfilesData?.data?.map((user) => (
                    <MenuItem key={user._id} value={user.userId}>
                      {user.username} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Chapter</InputLabel>
                <Select
                  value={formData.chapterId}
                  onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                  label="Chapter"
                >
                  {chaptersData?.data?.map((chapter) => (
                    <MenuItem key={chapter._id} value={chapter._id}>
                      {chapter.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={formData.unitId}
                  onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                  label="Unit"
                >
                  {allUnitsData?.data?.map((unit) => (
                    <MenuItem key={unit._id} value={unit._id}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="not_started">Not Started</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUnit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ==================== USER CHAPTER LEVELS TAB ====================
function UserChapterLevelsTab() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);

  const { data: levelsData, isLoading } = useGetUserChapterLevelsQuery();
  const { data: chaptersData } = useGetChaptersQuery();
  const { data: allLevelsData } = useGetLevelsQuery();
  const { data: userProfilesData } = useGetUserProfilesQuery();
  const [createLevel] = useCreateUserChapterLevelMutation();
  const [updateLevel] = useUpdateUserChapterLevelMutation();
  const [deleteLevel] = useDeleteUserChapterLevelMutation();

  const [formData, setFormData] = useState({
    userId: '',
    selectedUser: '',
    chapterId: '',
    levelId: '',
    levelNumber: '',
    status: 'not_started',
  });

  // Get chapter-specific levels data
  const { data: chapterLevelsData } = useGetLevelsByChapterQuery(formData.chapterId, {
    skip: !formData.chapterId
  });

  // Use chapter-specific levels data if available, otherwise filter from all levels
  const filteredLevels = chapterLevelsData?.data || allLevelsData?.data?.filter(level => 
    level.chapterId === formData.chapterId
  ) || [];

  const handleOpenDialog = (level = null) => {
    if (level) {
      setEditingLevel(level);
      setFormData({
        userId: level.userId || '',
        selectedUser: level.userId || '',
        chapterId: level.chapterId?._id || level.chapterId || '',
        levelId: level.levelId?._id || level.levelId || '',
        levelNumber: level.levelNumber || '',
        status: level.status || 'not_started',
      });
    } else {
      setEditingLevel(null);
      setFormData({
        userId: '',
        selectedUser: '',
        chapterId: '',
        levelId: '',
        levelNumber: '',
        status: 'not_started',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLevel(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        userId: formData.selectedUser || formData.userId,
        levelNumber: parseInt(formData.levelNumber),
      };
      delete submitData.selectedUser;

      if (editingLevel) {
        await updateLevel({ id: editingLevel._id, ...submitData }).unwrap();
      } else {
        await createLevel(submitData).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving user chapter level:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user chapter level?')) {
      try {
        await deleteLevel(id).unwrap();
      } catch (error) {
        console.error('Error deleting user chapter level:', error);
      }
    }
  };

  const columns = [
    {
      field: 'userProfile',
      headerName: 'User',
      width: 250,
      renderCell: (params) => {
        if (params.value) {
          return `${params.value.username} (${params.value.email})`;
        }
        return params.row.userId || 'N/A';
      },
    },
    {
      field: 'chapterId',
      headerName: 'Chapter',
      width: 150,
      renderCell: (params) => params.value?.name || params.value || 'N/A',
    },
    {
      field: 'levelId',
      headerName: 'Level',
      width: 150,
      renderCell: (params) => `${params.value?.name || 'N/A'} (${params.value?.levelNumber || 'N/A'})`,
    },
    {
      field: 'attemptType',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 'time_rush' ? 'Time Rush' : 'Precision Path'}
          color={params.value === 'time_rush' ? 'primary' : 'secondary'}
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'completed' ? 'success' : 
            params.value === 'in_progress' ? 'warning' : 'default'
          }
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleOpenDialog(params.row)} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(params.row._id)} size="small" color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">User Chapter Levels</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User Chapter Level
        </Button>
      </Box>

      <DataGrid
        rows={levelsData?.data || []}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row._id}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        getRowHeight={() => 'auto'}
        sx={{ height: 500 }}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLevel ? 'Edit User Chapter Level' : 'Add New User Chapter Level'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>User</InputLabel>
                <Select
                  value={formData.selectedUser}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    selectedUser: e.target.value,
                    userId: e.target.value 
                  })}
                  label="User"
                >
                  {userProfilesData?.data?.map((user) => (
                    <MenuItem key={user._id} value={user.userId}>
                      {user.username} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Chapter</InputLabel>
                <Select
                  value={formData.chapterId}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      chapterId: e.target.value,
                      levelId: '', // Reset level when chapter changes
                      levelNumber: '' // Reset level number when chapter changes
                    });
                  }}
                  label="Chapter"
                >
                  {chaptersData?.data?.map((chapter) => (
                    <MenuItem key={chapter._id} value={chapter._id}>
                      {chapter.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={formData.levelId}
                  onChange={(e) => {
                    const selectedLevel = filteredLevels.find(level => level._id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      levelId: e.target.value,
                      levelNumber: selectedLevel ? selectedLevel.levelNumber.toString() : ''
                    });
                  }}
                  label="Level"
                  disabled={!formData.chapterId}
                >
                  {filteredLevels.length === 0 && formData.chapterId ? (
                    <MenuItem disabled>No levels available for this chapter</MenuItem>
                  ) : (
                    filteredLevels.map((level) => (
                      <MenuItem key={level._id} value={level._id}>
                        {level.name} (Level {level.levelNumber})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Level Number"
                type="number"
                value={formData.levelNumber}
                onChange={(e) => setFormData({ ...formData, levelNumber: e.target.value })}
                disabled={!formData.levelId}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Attempt Type"
                value={formData.levelId ? (filteredLevels.find(level => level._id === formData.levelId)?.type === 'time_rush' ? 'Time Rush' : 'Precision Path') : ''}
                disabled
                helperText="Automatically set from selected level"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="not_started">Not Started</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.levelId && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Level Settings:</strong> The MaxXP, MinTime, RequiredXP, and other settings will be automatically inherited from the selected level.
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingLevel ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ==================== USER LEVEL SESSIONS TAB (READ ONLY) ====================
function UserLevelSessionsTab() {
  const { data: sessionsData, isLoading } = useGetUserLevelSessionsQuery();
  const [selectedSession, setSelectedSession] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const handleRowClick = (params) => {
    setSelectedSession(params.row);
    setOpenDetailsDialog(true);
  };

  const columns = [
    {
      field: 'userProfile',
      headerName: 'User',
      width: 250,
      renderCell: (params) => {
        if (params.value) {
          return `${params.value.username} (${params.value.email})`;
        }
        return params.row.userId || 'N/A';
      },
    },
    {
      field: 'chapterId',
      headerName: 'Chapter',
      width: 150,
      renderCell: (params) => params.value?.name || params.value || 'N/A',
    },
    {
      field: 'levelId',
      headerName: 'Level',
      width: 150,
      renderCell: (params) => `${params.value?.name || 'N/A'} (${params.value?.levelNumber || 'N/A'})`,
    },
    {
      field: 'attemptType',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 'time_rush' ? 'Time Rush' : 'Precision Path'}
          color={params.value === 'time_rush' ? 'primary' : 'secondary'}
          size="small"
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value === 1 ? 'Active' : 'Inactive'}
          color={params.value === 1 ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'currentQuestionIndex',
      headerName: 'Question #',
      width: 100,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton onClick={() => handleRowClick(params)} size="small">
              <ViewIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">User Level Sessions (Read Only)</Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          This tab shows active user level sessions. Sessions are read-only and managed by the game system.
        </Alert>
      </Box>

      <DataGrid
        rows={sessionsData?.data || []}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => row._id}
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        getRowHeight={() => 'auto'}
        sx={{ height: 500 }}
      />

      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Session Details</DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">Session Information</Typography>
                <Typography>User: {selectedSession.userProfile ? `${selectedSession.userProfile.username} (${selectedSession.userProfile.email})` : selectedSession.userId}</Typography>
                <Typography>Chapter: {selectedSession.chapterId?.name || selectedSession.chapterId}</Typography>
                <Typography>Level: {selectedSession.levelId?.name || selectedSession.levelId}</Typography>
                <Typography>Type: {selectedSession.attemptType}</Typography>
                <Typography>Status: {selectedSession.status === 1 ? 'Active' : 'Inactive'}</Typography>
                <Typography>Current Question Index: {selectedSession.currentQuestionIndex}</Typography>
              </Grid>

              {selectedSession.attemptType === 'time_rush' && selectedSession.timeRush && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">Time Rush Progress</Typography>
                      <Typography>Required XP: {selectedSession.timeRush.requiredXp}</Typography>
                      <Typography>Current XP: {selectedSession.timeRush.currentXp}</Typography>
                      <Typography>Max XP: {selectedSession.timeRush.maxXp}</Typography>
                      <Typography>Time Limit: {selectedSession.timeRush.timeLimit}s</Typography>
                      <Typography>Current Time: {selectedSession.timeRush.currentTime}s</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {selectedSession.attemptType === 'precision_path' && selectedSession.precisionPath && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">Precision Path Progress</Typography>
                      <Typography>Required XP: {selectedSession.precisionPath.requiredXp}</Typography>
                      <Typography>Current XP: {selectedSession.precisionPath.currentXp}</Typography>
                      <Typography>Current Time: {selectedSession.precisionPath.currentTime}s</Typography>
                      <Typography>Min Time: {selectedSession.precisionPath.minTime || 'Not set'}s</Typography>
                      <Typography>Total Questions: {selectedSession.precisionPath.totalQuestions}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="h6">Questions Answered</Typography>
                <Typography>Correct: {selectedSession.questionsAnswered?.correct?.length || 0}</Typography>
                <Typography>Incorrect: {selectedSession.questionsAnswered?.incorrect?.length || 0}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
