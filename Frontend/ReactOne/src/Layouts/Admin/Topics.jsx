import React, { useState } from 'react';
import {
  useGetTopicsQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
  useGetChaptersQuery,
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
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const emptyForm = { chapterId: '', name: '' };

export default function TopicsAdmin() {
  const { data: chaptersData } = useGetChaptersQuery();
  const [selectedChapter, setSelectedChapter] = useState('');
  const { data, isLoading, isError } = useGetTopicsQuery(selectedChapter, { skip: !selectedChapter });
  const [createTopic] = useCreateTopicMutation();
  const [updateTopic] = useUpdateTopicMutation();
  const [deleteTopic] = useDeleteTopicMutation();

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [duplicates, setDuplicates] = useState([]);

  const handleOpen = () => {
    setForm({ chapterId: selectedChapter, names: '' });
    setEditMode(false);
    setOpen(true);
    setDuplicates([]);
  };
  const handleEdit = (row) => {
    setForm({ chapterId: row.chapterId, name: row.topic });
    setEditId(row._id);
    setEditMode(true);
    setOpen(true);
    setDuplicates([]);
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editMode) {
      await updateTopic({ id: editId, name: form.name });
    } else {
      // Split names by comma or newline, trim, and filter out empty
      const namesArr = form.names
        .split(/,|\n/)
        .map(s => s.trim())
        .filter(Boolean);
      const res = await createTopic({ chapterId: form.chapterId, names: namesArr });
      if (res.data && res.data.duplicates && res.data.duplicates.length > 0) {
        setDuplicates(res.data.duplicates);
        return;
      }
    }
    handleClose();
  };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this topic?')) {
      await deleteTopic(id);
    }
  };

  const columns = [
    { field: 'topic', headerName: 'Topic Name', flex: 2 },
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
          Add Topics
        </Button>
      </Box>
      <Box height={500}>
        <DataGrid
          rows={data?.data || []}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          error={isError}
          disableRowSelectionOnClick
        />
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? 'Edit Topic' : 'Add Topic'}</DialogTitle>
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
            {editMode ? (
              <TextField
                label="Topic Name"
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                required
                fullWidth
              />
            ) : (
              <TextField
                label="Topic Names (comma or newline separated)"
                name="names"
                value={form.names}
                onChange={handleChange}
                required
                fullWidth
                multiline
                minRows={3}
              />
            )}
            {duplicates.length > 0 && (
              <Typography color="error" sx={{ mt: 1 }}>
                Duplicate topics not added: {duplicates.join(', ')}
              </Typography>
            )}
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
