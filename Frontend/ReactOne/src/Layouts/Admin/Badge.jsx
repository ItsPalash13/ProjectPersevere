import React, { useState } from 'react';
import {
  useGetBadgesQuery,
  useCreateBadgeMutation,
  useUpdateBadgeMutation,
  useDeleteBadgeMutation,
} from '../../features/api/adminAPI';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const initialForm = {
  badgeName: '',
  badgeType: 'daily',
  badgeslug: '',
  badgeDescription: '',
  badgelevel: [],
};

const emptyLevel = { milestone: '', badgeImage: '' };

const BadgeAdmin = () => {
  const { data: badges, refetch } = useGetBadgesQuery();
  const [createBadge] = useCreateBadgeMutation();
  const [updateBadge] = useUpdateBadgeMutation();
  const [deleteBadge] = useDeleteBadgeMutation();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLevelChange = (idx, field, value) => {
    const updated = form.badgelevel.map((lvl, i) => i === idx ? { ...lvl, [field]: value } : lvl);
    setForm({ ...form, badgelevel: updated });
  };

  const handleAddLevel = () => {
    setForm({ ...form, badgelevel: [...form.badgelevel, { ...emptyLevel }] });
  };

  const handleRemoveLevel = (idx) => {
    setForm({ ...form, badgelevel: form.badgelevel.filter((_, i) => i !== idx) });
  };

  const handleOpenDialog = (badge = null) => {
    if (badge) {
      setForm({
        badgeName: badge.badgeName,
        badgeType: badge.badgeType,
        badgeslug: badge.badgeslug,
        badgeDescription: badge.badgeDescription,
        badgelevel: badge.badgelevel ? badge.badgelevel.map(lvl => ({
          milestone: lvl.milestone,
          badgeImage: lvl.badgeImage,
        })) : [],
      });
      setEditingId(badge._id);
    } else {
      setForm(initialForm);
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updateBadge({ id: editingId, ...form });
    } else {
      await createBadge(form);
    }
    handleCloseDialog();
    refetch();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this badge?')) {
      await deleteBadge(id);
      refetch();
    }
  };

  const columns = [
    { field: 'badgeName', headerName: 'Name', width: 180 },
    { field: 'badgeType', headerName: 'Type', width: 120 },
    { field: 'badgeslug', headerName: 'Slug', width: 150 },
    { field: 'badgeDescription', headerName: 'Description', width: 250 },
    {
      field: 'badgelevel',
      headerName: 'Milestones',
      width: 180,
      renderCell: (params) => (
        <Box>
          {params.value && params.value.length > 0 ? params.value.map((lvl, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2">{lvl.milestone}</Typography>
              <img src={lvl.badgeImage} alt="milestone" style={{ width: 24, height: 24, marginLeft: 4, objectFit: 'contain', borderRadius: 4 }} />
            </Box>
          )) : <Typography variant="body2" color="text.secondary">-</Typography>}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
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
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Badge Management</Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ mb: 2 }}
        onClick={() => handleOpenDialog()}
      >
        Add Badge
      </Button>
      <DataGrid
        rows={badges || []}
        columns={columns}
        getRowId={(row) => row._id}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        sx={{ mb: 3 }}
        getRowHeight={() => 'auto'}
      />
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Badge' : 'Add New Badge'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Badge Name"
              name="badgeName"
              value={form.badgeName}
              onChange={handleChange}
              sx={{ mb: 2 }}
              required
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                name="badgeType"
                value={form.badgeType}
                onChange={handleChange}
                label="Type"
                required
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="global">Global</MenuItem>
                <MenuItem value="end">End</MenuItem>
                <MenuItem value="social">Social</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Badge Slug"
              name="badgeslug"
              value={form.badgeslug}
              onChange={handleChange}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="badgeDescription"
              value={form.badgeDescription}
              onChange={handleChange}
              sx={{ mb: 2 }}
              required
            />
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Milestone Levels</Typography>
            {form.badgelevel.map((lvl, idx) => (
              <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                <TextField
                  label="Milestone"
                  type="number"
                  value={lvl.milestone}
                  onChange={e => handleLevelChange(idx, 'milestone', e.target.value)}
                  sx={{ width: 100 }}
                  required
                />
                <TextField
                  label="Badge Image URL"
                  value={lvl.badgeImage}
                  onChange={e => handleLevelChange(idx, 'badgeImage', e.target.value)}
                  sx={{ width: 220 }}
                  required
                />
                <IconButton onClick={() => handleRemoveLevel(idx)} color="error" size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button onClick={handleAddLevel} variant="outlined" size="small" sx={{ mb: 2 }}>
              Add Milestone
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BadgeAdmin;
