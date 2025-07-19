import React, { useState, useMemo } from 'react';
import {
  Box,
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
  Switch,
  FormControlLabel,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  useGetLevelsQuery,
  useCreateLevelMutation,
  useUpdateLevelMutation,
  useDeleteLevelMutation,
  useGetChaptersQuery,
  useGetAllUnitsQuery,
  useGetTopicsQuery,
} from '../../features/api/adminAPI';

export default function LevelsAdmin() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedChapterFilter, setSelectedChapterFilter] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('');

  // API hooks
  const { data: levelsData, isLoading: levelsLoading } = useGetLevelsQuery();
  const { data: chaptersData } = useGetChaptersQuery();
  const { data: unitsData } = useGetAllUnitsQuery(); // Get all units
  const { data: topicsData } = useGetTopicsQuery();
  const [createLevel] = useCreateLevelMutation();
  const [updateLevel] = useUpdateLevelMutation();
  const [deleteLevel] = useDeleteLevelMutation();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    levelNumber: '',
    description: '',
    topics: [],
    status: false,
    chapterId: '',
    unitId: '',
    type: 'time_rush',
    timeRush: {
      requiredXp: '',
      totalTime: '',
    },
    precisionPath: {
      requiredXp: '',
      totalQuestions: '',
    },
    difficultyParams: {
      mean: 750,
      sd: 150,
      alpha: 5,
    },
  });

  const handleOpenDialog = (level = null) => {
    if (level) {
      setEditingLevel(level);
      setFormData({
        name: level.name || '',
        levelNumber: level.levelNumber || '',
        description: level.description || '',
        topics: level.topics || [], // Topics are stored as strings in the level
        status: level.status || false,
        chapterId: level.chapterId?._id || level.chapterId || '',
        unitId: level.unitId?._id || level.unitId || '',
        type: level.type || 'time_rush',
        timeRush: level.timeRush || { requiredXp: '', totalTime: '' },
        precisionPath: level.precisionPath || { requiredXp: '', totalQuestions: '' },
        difficultyParams: level.difficultyParams || { mean: 750, sd: 150, alpha: 5 },
      });
    } else {
      setEditingLevel(null);
      setFormData({
        name: '',
        levelNumber: '',
        description: '',
        topics: [],
        status: false,
        chapterId: '',
        unitId: '',
        type: 'time_rush',
        timeRush: { requiredXp: '', totalTime: '' },
        precisionPath: { requiredXp: '', totalQuestions: '' },
        difficultyParams: { mean: 750, sd: 150, alpha: 5 },
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
        levelNumber: parseInt(formData.levelNumber),
        topics: formData.topics,
        timeRush: formData.type === 'time_rush' ? {
          requiredXp: parseInt(formData.timeRush.requiredXp),
          totalTime: parseInt(formData.timeRush.totalTime),
        } : undefined,
        precisionPath: formData.type === 'precision_path' ? {
          requiredXp: parseInt(formData.precisionPath.requiredXp),
          totalQuestions: parseInt(formData.precisionPath.totalQuestions),
        } : undefined,
      };

      if (editingLevel) {
        await updateLevel({ id: editingLevel._id, ...submitData }).unwrap();
      } else {
        await createLevel(submitData).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving level:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this level?')) {
      try {
        await deleteLevel(id).unwrap();
      } catch (error) {
        console.error('Error deleting level:', error);
      }
    }
  };

  const handleRowClick = (params) => {
    setSelectedLevel(params.row);
    setOpenDetailsDialog(true);
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(params)}>
          {params.value}
        </Box>
      ),
    },
    {
      field: 'levelNumber',
      headerName: 'Level #',
      width: 100,
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value === 'time_rush' ? 'Time Rush' : 'Precision Path'}
          color={params.value === 'time_rush' ? 'primary' : 'secondary'}
          size="small"
        />
      ),
    },
    {
      field: 'chapterId',
      headerName: 'Chapter',
      width: 150,
      renderCell: (params) => params.value?.name || 'N/A',
    },
    {
      field: 'unitId',
      headerName: 'Unit',
      width: 150,
      renderCell: (params) => params.value?.name || 'N/A',
    },
    {
      field: 'topics',
      headerName: 'Topics',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.value?.map((topic, index) => (
            <Chip key={index} label={topic} size="small" variant="outlined" />
          ))}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
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

  const filteredUnits = useMemo(() => {
    if (!formData.chapterId || !unitsData?.data) return [];
    return unitsData.data.filter(unit => unit.chapterId === formData.chapterId);
  }, [formData.chapterId, unitsData]);

  const filteredUnitsForFilter = useMemo(() => {
    if (!selectedChapterFilter || !unitsData?.data) return [];
    return unitsData.data.filter(unit => unit.chapterId === selectedChapterFilter);
  }, [selectedChapterFilter, unitsData]);

  // Get topics for the selected unit
  const filteredTopics = useMemo(() => {
    if (!formData.unitId || !topicsData?.data) return [];
    // Find the selected unit to get its topics
    const selectedUnit = unitsData?.data?.find(unit => unit._id === formData.unitId);
    if (!selectedUnit || !selectedUnit.topics) return [];
    
    // Filter topics that belong to the selected unit
    return topicsData.data.filter(topic => 
      selectedUnit.topics.includes(topic._id)
    );
  }, [formData.unitId, topicsData?.data, unitsData?.data]);

  const filteredLevels = useMemo(() => {
    let filtered = levelsData?.data || [];
    
    if (selectedChapterFilter) {
      filtered = filtered.filter(level => 
        level.chapterId?._id === selectedChapterFilter || level.chapterId === selectedChapterFilter
      );
    }
    
    if (selectedUnitFilter) {
      filtered = filtered.filter(level => 
        level.unitId?._id === selectedUnitFilter || level.unitId === selectedUnitFilter
      );
    }
    
    return filtered;
  }, [levelsData?.data, selectedChapterFilter, selectedUnitFilter]);

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Levels Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Level
        </Button>
      </Box>

      {/* Filter Dropdowns */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="chapter-filter-label">Filter by Chapter</InputLabel>
          <Select
            labelId="chapter-filter-label"
            label="Filter by Chapter"
            value={selectedChapterFilter}
            onChange={(e) => {
              setSelectedChapterFilter(e.target.value);
              setSelectedUnitFilter(''); // Reset unit filter when chapter changes
            }}
          >
            <MenuItem value="">All Chapters</MenuItem>
            {chaptersData?.data?.map((chapter) => (
              <MenuItem key={chapter._id} value={chapter._id}>
                {chapter.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="unit-filter-label">Filter by Unit</InputLabel>
          <Select
            labelId="unit-filter-label"
            label="Filter by Unit"
            value={selectedUnitFilter}
            onChange={(e) => setSelectedUnitFilter(e.target.value)}
            disabled={!selectedChapterFilter}
          >
            <MenuItem value="">All Units</MenuItem>
            {filteredUnitsForFilter.map((unit) => (
              <MenuItem key={unit._id} value={unit._id}>
                {unit.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <DataGrid
        rows={filteredLevels}
        columns={columns}
        loading={levelsLoading}
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLevel ? 'Edit Level' : 'Add New Level'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Level Number"
                type="number"
                value={formData.levelNumber}
                onChange={(e) => setFormData({ ...formData, levelNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Chapter</InputLabel>
                <Select
                  value={formData.chapterId}
                  onChange={(e) => setFormData({ ...formData, chapterId: e.target.value, unitId: '' })}
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
                  disabled={!formData.chapterId}
                >
                  {filteredUnits.map((unit) => (
                    <MenuItem key={unit._id} value={unit._id}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Type"
                >
                  <MenuItem value="time_rush">Time Rush</MenuItem>
                  <MenuItem value="precision_path">Precision Path</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Topics</InputLabel>
                <Select
                  multiple
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                  label="Topics"
                  disabled={!formData.unitId}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {filteredTopics.map((topic) => (
                    <MenuItem key={topic._id} value={topic.topic}>
                      {topic.topic}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  />
                }
                label="Active Status"
              />
            </Grid>

            {/* Type-specific fields */}
            {formData.type === 'time_rush' && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Time Rush Settings</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Required XP"
                          type="number"
                          value={formData.timeRush.requiredXp}
                          onChange={(e) => setFormData({
                            ...formData,
                            timeRush: { ...formData.timeRush, requiredXp: e.target.value }
                          })}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Total Time (seconds)"
                          type="number"
                          value={formData.timeRush.totalTime}
                          onChange={(e) => setFormData({
                            ...formData,
                            timeRush: { ...formData.timeRush, totalTime: e.target.value }
                          })}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {formData.type === 'precision_path' && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Precision Path Settings</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Required XP"
                          type="number"
                          value={formData.precisionPath.requiredXp}
                          onChange={(e) => setFormData({
                            ...formData,
                            precisionPath: { ...formData.precisionPath, requiredXp: e.target.value }
                          })}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Total Questions"
                          type="number"
                          value={formData.precisionPath.totalQuestions}
                          onChange={(e) => setFormData({
                            ...formData,
                            precisionPath: { ...formData.precisionPath, totalQuestions: e.target.value }
                          })}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Difficulty Parameters */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Difficulty Parameters</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Mean"
                        type="number"
                        value={formData.difficultyParams.mean}
                        onChange={(e) => setFormData({
                          ...formData,
                          difficultyParams: { ...formData.difficultyParams, mean: parseInt(e.target.value) }
                        })}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Standard Deviation"
                        type="number"
                        value={formData.difficultyParams.sd}
                        onChange={(e) => setFormData({
                          ...formData,
                          difficultyParams: { ...formData.difficultyParams, sd: parseInt(e.target.value) }
                        })}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Alpha"
                        type="number"
                        value={formData.difficultyParams.alpha}
                        onChange={(e) => setFormData({
                          ...formData,
                          difficultyParams: { ...formData.difficultyParams, alpha: parseInt(e.target.value) }
                        })}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingLevel ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Level Details</DialogTitle>
        <DialogContent>
          {selectedLevel && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">{selectedLevel.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Level {selectedLevel.levelNumber} - {selectedLevel.description}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">Chapter</Typography>
                <Typography>{selectedLevel.chapterId?.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">Unit</Typography>
                <Typography>{selectedLevel.unitId?.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">Type</Typography>
                <Chip
                  label={selectedLevel.type === 'time_rush' ? 'Time Rush' : 'Precision Path'}
                  color={selectedLevel.type === 'time_rush' ? 'primary' : 'secondary'}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">Status</Typography>
                <Chip
                  label={selectedLevel.status ? 'Active' : 'Inactive'}
                  color={selectedLevel.status ? 'success' : 'default'}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Topics</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {selectedLevel.topics?.map((topic, index) => (
                    <Chip key={index} label={topic} variant="outlined" />
                  ))}
                </Box>
              </Grid>
              {selectedLevel.type === 'time_rush' && selectedLevel.timeRush && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">Time Rush Settings</Typography>
                      <Typography>Required XP: {selectedLevel.timeRush.requiredXp}</Typography>
                      <Typography>Total Time: {selectedLevel.timeRush.totalTime} seconds</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {selectedLevel.type === 'precision_path' && selectedLevel.precisionPath && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">Precision Path Settings</Typography>
                      <Typography>Required XP: {selectedLevel.precisionPath.requiredXp}</Typography>
                      <Typography>Total Questions: {selectedLevel.precisionPath.totalQuestions}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              {selectedLevel.difficultyParams && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6">Difficulty Parameters</Typography>
                      <Typography>Mean: {selectedLevel.difficultyParams.mean}</Typography>
                      <Typography>Standard Deviation: {selectedLevel.difficultyParams.sd}</Typography>
                      <Typography>Alpha: {selectedLevel.difficultyParams.alpha}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
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
