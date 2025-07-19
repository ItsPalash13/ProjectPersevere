import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Chip,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Grid,
  Paper,
  Divider,
  InputAdornment
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Upload as UploadIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useMultiAddQuestionsMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useGetChaptersQuery,
  useGetTopicsQuery
} from '../../features/api/adminAPI';

const Questions = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openMultiAddDialog, setOpenMultiAddDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicFilters, setSelectedTopicFilters] = useState([]);
  const [multiAddData, setMultiAddData] = useState({
    questions: '',
    chapterId: '',
    topicIds: [],
    xpCorrect: 10,
    xpIncorrect: 5
  });

  const { data: chaptersData } = useGetChaptersQuery();
  const { data: questionsData, isLoading } = useGetQuestionsQuery(selectedChapter, { skip: !selectedChapter });
  const { data: topicsData } = useGetTopicsQuery(selectedChapter, { skip: !selectedChapter });

  // Filter questions based on search query and topic filter
  const filteredQuestions = React.useMemo(() => {
    if (!questionsData?.data) {
      return [];
    }
    
    let filtered = questionsData.data;
    
    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(question => {
        const questionMatch = question.ques.toLowerCase().includes(query);
        const optionsMatch = question.options.some(option => option.toLowerCase().includes(query));
        const topicsMatch = question.topics?.some(topic => {
          const topicName = topic.name || topic.topic || '';
          return topicName.toLowerCase().includes(query);
        });
        return questionMatch || optionsMatch || topicsMatch;
      });
    }
    
    // Apply topic filter
    if (selectedTopicFilters.length > 0) {
      filtered = filtered.filter(question => {
        const questionTopics = question.topics?.map(topic => topic.name || topic.topic || '') || [];
        return selectedTopicFilters.every(selectedTopic => 
          questionTopics.includes(selectedTopic)
        );
      });
    }
    
    return filtered;
  }, [questionsData?.data, searchQuery, selectedTopicFilters]);
  
  const [createQuestion] = useCreateQuestionMutation();
  const [multiAddQuestions] = useMultiAddQuestionsMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();

  const [formData, setFormData] = useState({
    ques: '',
    options: ['', '', '', ''],
    correct: 0,
    chapterId: '',
    topics: []
  });

  const handleOpenDialog = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        ques: question.ques,
        options: question.options,
        correct: question.correct,
        chapterId: question.chapterId?._id || question.chapterId,
        topics: question.topics || []
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        ques: '',
        options: ['', '', '', ''],
        correct: 0,
        chapterId: selectedChapter,
        topics: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuestion(null);
    setFormData({
      ques: '',
      options: ['', '', '', ''],
      correct: 0,
      chapterId: '',
      topics: []
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingQuestion) {
        await updateQuestion({ id: editingQuestion._id, ...formData }).unwrap();
      } else {
        await createQuestion(formData).unwrap();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(id).unwrap();
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const handleMultiAdd = async () => {
    try {
      // Parse the questions text into the required format
      const questionsText = multiAddData.questions.trim();
      const lines = questionsText.split('\n').filter(line => line.trim());
      
      const parsedQuestions = lines.map(line => {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length < 8) {
          throw new Error(`Invalid format. Each line should have: question,option1,option2,option3,option4,correctIndex,mu,sigma`);
        }
        
        const [question, option1, option2, option3, option4, correctIndex, mu, sigma] = parts;
        return [question, option1, option2, option3, option4, parseInt(correctIndex), parseFloat(mu), parseFloat(sigma)];
      });

      await multiAddQuestions({
        questions: parsedQuestions,
        chapterId: selectedChapter,
        topicIds: multiAddData.topicIds,
        xpCorrect: multiAddData.xpCorrect,
        xpIncorrect: multiAddData.xpIncorrect
      }).unwrap();

      setOpenMultiAddDialog(false);
      setMultiAddData({
        questions: '',
        chapterId: '',
        topicIds: [],
        xpCorrect: 10,
        xpIncorrect: 5
      });
    } catch (error) {
      console.error('Error multi-adding questions:', error);
    }
  };

  const columns = [
    { field: 'ques', headerName: 'Question', flex: 1, minWidth: 200 },
    { 
      field: 'options', 
      headerName: 'Options', 
      flex: 1, 
      minWidth: 300,
      renderCell: (params) => (
        <Box>
          {params.value?.map((option, index) => (
            <Chip 
              key={index} 
              label={`${index + 1}. ${option}`} 
              size="small" 
              variant={params.row.correct === index ? "filled" : "outlined"}
              color={params.row.correct === index ? "success" : "default"}
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>
      )
    },
    { 
      field: 'chapterId', 
      headerName: 'Chapter', 
      width: 150,
      renderCell: (params) => (
        <Typography>
          {params.value?.name || 'N/A'}
        </Typography>
      )
    },
    { 
      field: 'topics', 
      headerName: 'Topics', 
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          {params.value?.map((topic, index) => (
            <Chip 
              key={index} 
              label={topic.name || topic.topic} 
              size="small" 
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>
      ),
      filterable: true,
      getApplyQuickFilterFn: (value) => {
        if (!value || value.length === 0) {
          return null;
        }
        return ({ field, id, value: cellValue }) => {
          if (field !== 'topics') {
            return false;
          }
          const searchValue = value.toLowerCase();
          
          const result = cellValue?.some(topic => {
            const topicName = topic.name || topic.topic || '';
            const match = topicName.toLowerCase().includes(searchValue);
            return match;
          }) || false;
          
          return result;
        };
      }
    },
    { 
      field: 'mu', 
      headerName: 'Mu', 
      width: 80,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.questionTs?.difficulty?.mu || 'N/A'}
        </Typography>
      )
    },
    { 
      field: 'sigma', 
      headerName: 'Sigma', 
      width: 80,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.questionTs?.difficulty?.sigma || 'N/A'}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleOpenDialog(params.row)} size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row._id)} size="small" color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="chapter-select-label">Chapter</InputLabel>
          <Select
            labelId="chapter-select-label"
            label="Chapter"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
          >
            {chaptersData?.data?.map((chapter) => (
              <MenuItem key={chapter._id} value={chapter._id}>
                {chapter.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel id="topic-filter-label">Filter by Topics</InputLabel>
          <Select
            labelId="topic-filter-label"
            label="Filter by Topics"
            multiple
            value={selectedTopicFilters}
            onChange={(e) => setSelectedTopicFilters(e.target.value)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {topicsData?.data?.map((topic) => (
              <MenuItem key={topic._id} value={topic.topic}>
                {topic.topic}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          placeholder="Search questions, options, or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          onClick={() => setOpenMultiAddDialog(true)}
          disabled={!selectedChapter}
        >
          Multi Add
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={!selectedChapter}
        >
          Add Question
        </Button>
      </Box>

      <Box height={600}>
        <DataGrid
          rows={filteredQuestions}
          columns={columns}
          getRowId={(row) => row._id}
          loading={isLoading}
          disableRowSelectionOnClick
          getRowHeight={() => 'auto'}
          filterMode="client"
          quickFilterOperator="or"
          slots={{
            toolbar: 'GridToolbar',
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
        />
      </Box>

      {/* Single Question Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingQuestion ? 'Edit Question' : 'Add New Question'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Question"
                multiline
                rows={3}
                value={formData.ques}
                onChange={(e) => setFormData({ ...formData, ques: e.target.value })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Chapter: {chaptersData?.data?.find(c => c._id === selectedChapter)?.name}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={topicsData?.data || []}
                getOptionLabel={(option) => option.topic}
                value={formData.topics}
                onChange={(e, newValue) => setFormData({ ...formData, topics: newValue })}
                renderInput={(params) => (
                  <TextField {...params} label="Topics" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.topic}
                      {...getTagProps({ index })}
                      key={option._id}
                    />
                  ))
                }
              />
            </Grid>

            {formData.options.map((option, index) => (
              <Grid item xs={12} key={index}>
                <TextField
                  fullWidth
                  label={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...formData.options];
                    newOptions[index] = e.target.value;
                    setFormData({ ...formData, options: newOptions });
                  }}
                />
              </Grid>
            ))}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Correct Answer</InputLabel>
                <Select
                  value={formData.correct}
                  onChange={(e) => setFormData({ ...formData, correct: e.target.value })}
                >
                  {formData.options.map((option, index) => (
                    <MenuItem key={index} value={index}>
                      Option {index + 1}: {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingQuestion ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Multi Add Dialog */}
      <Dialog open={openMultiAddDialog} onClose={() => setOpenMultiAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Multi Add Questions</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Format: question,option1,option2,option3,option4,correctIndex,mu,sigma (one per line)
          </Alert>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Questions (CSV format)"
                multiline
                rows={10}
                value={multiAddData.questions}
                onChange={(e) => setMultiAddData({ ...multiAddData, questions: e.target.value })}
                placeholder="What is 2+2?,4,3,5,6,0,936,200&#10;What is 3*3?,9,6,12,15,0,936,200"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Chapter: {chaptersData?.data?.find(c => c._id === selectedChapter)?.name}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={topicsData?.data || []}
                getOptionLabel={(option) => option.topic}
                value={multiAddData.topicIds.map(id => topicsData?.data?.find(t => t._id === id)).filter(Boolean)}
                onChange={(e, newValue) => setMultiAddData({ 
                  ...multiAddData, 
                  topicIds: newValue.map(v => v._id) 
                })}
                renderInput={(params) => (
                  <TextField {...params} label="Topics" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.topic}
                      {...getTagProps({ index })}
                      key={option._id}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="XP for Correct Answer"
                type="number"
                value={multiAddData.xpCorrect}
                onChange={(e) => setMultiAddData({ ...multiAddData, xpCorrect: parseInt(e.target.value) })}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="XP for Incorrect Answer"
                type="number"
                value={multiAddData.xpIncorrect}
                onChange={(e) => setMultiAddData({ ...multiAddData, xpIncorrect: parseInt(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMultiAddDialog(false)}>Cancel</Button>
          <Button onClick={handleMultiAdd} variant="contained">
            Add Questions
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Questions;
