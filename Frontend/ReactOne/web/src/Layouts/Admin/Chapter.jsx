import React, { useState } from 'react';
import {
  useGetChaptersQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useGetChapterByIdQuery,
  useGetSubjectsQuery,
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
  IconButton,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';

const emptyForm = { name: '', description: '', gameName: '', status: true, subjectId: '', thumbnailUrl: '' };

export default function ChapterAdmin() {
  const { data, isLoading, isError } = useGetChaptersQuery();
  const { data: subjectsData } = useGetSubjectsQuery();
  const [createChapter] = useCreateChapterMutation();
  const [updateChapter] = useUpdateChapterMutation();

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [detailsId, setDetailsId] = useState(null);

  const handleOpen = () => {
    setForm(emptyForm);
    setEditMode(false);
    setOpen(true);
  };
  const handleEdit = (row) => {
    setForm({
      ...row,
      subjectId: row.subject?._id || row.subjectId || '',
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editMode) {
      await updateChapter({ id: editId, ...form });
    } else {
      await createChapter(form);
    }
    handleClose();
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    { field: 'gameName', headerName: 'Game Name', flex: 1 },
    {
      field: 'subject',
      headerName: 'Subject',
      flex: 1,
      renderCell: (params) => (params.row && params.row.subject && params.row.subject.name) ? params.row.subject.name : '',
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.5,
      renderCell: (params) => params.value ? 'Active' : 'Inactive',
    },
    {
      field: 'actions',
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => handleEdit(params.row)} />,
      ],
    },
  ];

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Chapters</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Add Chapter
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
          onRowClick={(params) => setDetailsId(params.row._id)}
        />
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? 'Edit Chapter' : 'Add Chapter'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 350 }}>
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
            <TextField
              label="Game Name"
              name="gameName"
              value={form.gameName}
              onChange={handleChange}
              required
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel id="subject-select-label">Subject</InputLabel>
              <Select
                labelId="subject-select-label"
                label="Subject"
                name="subjectId"
                value={form.subjectId}
                onChange={handleChange}
              >
                {subjectsData?.data?.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>{subject.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {form.thumbnailUrl && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <img
                  src={form.thumbnailUrl}
                  alt="Thumbnail"
                  style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '1px solid #eee' }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </Box>
            )}
            <TextField
              label="Thumbnail URL"
              name="thumbnailUrl"
              value={form.thumbnailUrl}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">{editMode ? 'Update' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <ChapterDetailsDialog open={!!detailsId} chapterId={detailsId} onClose={() => setDetailsId(null)} />
    </Box>
  );
}

function ChapterDetailsDialog({ open, chapterId, onClose }) {
  const { data, isLoading } = useGetChapterByIdQuery(chapterId, { skip: !chapterId });
  if (!open) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chapter Details</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Typography>Loading...</Typography>
        ) : data ? (
          <Box>
            <Typography variant="h6">{data.data.name}</Typography>
            <Typography>Description: {data.data.description}</Typography>
            <Typography>Game Name: {data.data.gameName}</Typography>
            <Typography>Status: {data.data.status ? 'Active' : 'Inactive'}</Typography>
            <Typography>Subject ID: {data.data.subjectId}</Typography>
            <Typography>Thumbnail URL: {data.data.thumbnailUrl}</Typography>
            <Typography sx={{ mt: 2, fontWeight: 600 }}>Topics:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {data.data.topics && data.data.topics.length > 0 ? (
                data.data.topics.map((topic, idx) => (
                  <Box key={idx} sx={{ px: 1, py: 0.25, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 0.75, fontSize: '0.75rem', fontWeight: 500 }}>{topic}</Box>
                ))
              ) : (
                <Typography>No topics</Typography>
              )}
            </Box>
            <Typography sx={{ mt: 2, fontWeight: 600 }}>Units:</Typography>
            <Box>
              {data.data.units && data.data.units.length > 0 ? (
                data.data.units.map((unit, idx) => (
                  <Box key={idx} sx={{ mb: 1, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                    <Typography variant="subtitle1">{unit.name}</Typography>
                    <Typography>Description: {unit.description}</Typography>
                    <Typography>Status: {unit.status ? 'Active' : 'Inactive'}</Typography>
                    <Typography sx={{ fontWeight: 500, mt: 1 }}>Topics:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {unit.topics && unit.topics.length > 0 ? (
                        unit.topics.map((topic, tIdx) => (
                          <Box key={tIdx} sx={{ px: 1, py: 0.25, bgcolor: 'secondary.main', color: 'secondary.contrastText', borderRadius: 0.75, fontSize: '0.75rem', fontWeight: 500 }}>{topic}</Box>
                        ))
                      ) : (
                        <Typography>No topics</Typography>
                      )}
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography>No units</Typography>
              )}
            </Box>
          </Box>
        ) : (
          <Typography>No data found.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
