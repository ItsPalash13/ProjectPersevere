import React, { useState } from 'react';
import {
  useGetChaptersQuery,
  useGetTopicsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
  useGetUnitsQuery,
} from '../../features/api/adminAPI';
import {
  DataGrid,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Autocomplete,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const emptyForm = { chapterId: '', name: '', description: '', topics: [] };

export default function UnitsAdmin() {
  const { data: chaptersData } = useGetChaptersQuery();
  const [selectedChapter, setSelectedChapter] = useState('');
  const { data: topicsData } = useGetTopicsQuery(selectedChapter, { skip: !selectedChapter });
  const { data: unitsData } = useGetUnitsQuery(selectedChapter, { skip: !selectedChapter });
  // You may want to fetch units for the selected chapter if you have a list endpoint
  const [createUnit] = useCreateUnitMutation();
  const [updateUnit] = useUpdateUnitMutation();
  const [deleteUnit] = useDeleteUnitMutation();

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const handleOpen = () => {
    setForm({ chapterId: selectedChapter, name: '', description: '', topics: [] });
    setEditMode(false);
    setOpen(true);
  };
  const handleEdit = (row) => {
    setForm({
      chapterId: row.chapterId,
      name: row.name,
      description: row.description,
      topics: row.topics || [],
    });
    setEditId(row._id);
    setEditMode(true);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setForm(emptyForm);
    setEditId(null);
    setEditMode(false);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleTopicsChange = (event, value) => {
    setForm((prev) => ({ ...prev, topics: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editMode) {
      await updateUnit({ id: editId, ...form });
    } else {
      await createUnit(form);
    }
    handleClose();
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this unit?')) {
      await deleteUnit(id);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    {
      field: 'topics',
      headerName: 'Topics',
      flex: 2,
      renderCell: (params) => {
        const topicIdToName = (topicsData?.data || []).reduce((acc, t) => {
          acc[t._id] = t.topic;
          return acc;
        }, {});
        const topicNames = Array.isArray(params.row.topics)
          ? params.row.topics.map(id => topicIdToName[id] || id)
          : [];
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {topicNames.map((name, idx) => (
              <Chip key={idx} label={name} size="small" sx={{ mb: 0.5 }} />
            ))}
          </Box>
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => handleEdit(params.row)} />,
        <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => handleDelete(params.row._id)} />,
      ],
    },
  ];

  return (
    <Box p={2}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="chapter-select-label">Chapter</InputLabel>
          <Select
            labelId="chapter-select-label"
            label="Chapter"
            value={selectedChapter}
            onChange={e => setSelectedChapter(e.target.value)}
          >
            {chaptersData?.data?.map((chapter) => (
              <MenuItem key={chapter._id} value={chapter._id}>{chapter.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen} disabled={!selectedChapter}>
          Add Unit
        </Button>
      </Box>
      <Box height={500}>
        <DataGrid
          rows={unitsData?.data || []}
          columns={columns}
          getRowId={(row) => row._id}
          disableRowSelectionOnClick
          getRowHeight={() => 'auto'
          }
        />
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
            <FormControl fullWidth required>
              <InputLabel id="chapter-select-label-dialog">Chapter</InputLabel>
              <Select
                labelId="chapter-select-label-dialog"
                label="Chapter"
                name="chapterId"
                value={form.chapterId}
                onChange={handleChange}
              >
                {chaptersData?.data?.map((chapter) => (
                  <MenuItem key={chapter._id} value={chapter._id}>{chapter.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              fullWidth
            />
            <Autocomplete
              multiple
              options={topicsData?.data?.map(t => ({ label: t.topic, value: t._id })) || []}
              getOptionLabel={option => option.label}
              value={topicsData?.data?.filter(t => form.topics.includes(t._id)).map(t => ({ label: t.topic, value: t._id })) || []}
              onChange={(event, value) => handleTopicsChange(event, value.map(v => v.value))}
              renderInput={(params) => (
                <TextField {...params} label="Topics" placeholder="Select topics" />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">{editMode ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
