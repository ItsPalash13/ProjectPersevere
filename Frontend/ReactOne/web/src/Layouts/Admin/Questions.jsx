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
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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
  const [selectedRows, setSelectedRows] = useState([]);
  const [multiAddData, setMultiAddData] = useState({
    questions: '',
    chapterId: '',
    topicIds: [],
    xpCorrect: 2,
    xpIncorrect: 0
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

  const handleMultiDelete = async () => {
    if (selectedRows.length === 0) {
      alert('Please select questions to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} selected questions?`)) {
      try {
        // Delete questions one by one
        const deletePromises = selectedRows.map(id => deleteQuestion(id).unwrap());
        await Promise.all(deletePromises);
        setSelectedRows([]); // Clear selection after deletion
      } catch (error) {
        console.error('Error deleting questions:', error);
      }
    }
  };

  // Helper function to parse CSV line
  const parseCSVLine = (line) => {
    const parts = [];
    let current = '';
    let inQuotes = false;
    let inQuestion = false;
    let question = '';
    let options = [];
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '/' && !inQuotes && !inQuestion) {
        // Start of question
        inQuestion = true;
        current = '';
      } else if (char === '/' && !inQuotes && inQuestion) {
        // End of question
        question = current.trim();
        inQuestion = false;
        current = '';
      } else if (char === '"' && !inQuestion) {
        // Handle quotes for options
        inQuotes = !inQuotes;
        if (!inQuotes) {
          // End of quoted option - keep the quotes
          options.push(`"${current.trim()}"`);
          current = '';
        }
      } else if (char === ',' && !inQuotes && !inQuestion) {
        // Comma separator for non-quoted values (like numbers)
        if (current.trim()) {
          parts.push(current.trim());
        }
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last part (usually the last number)
    if (current.trim()) {
      parts.push(current.trim());
    }
    
    // Combine question and options
    const result = [question, ...options, ...parts];
    return result;
  };

  // Parse CSV data for preview
  const parseCSVPreview = (csvText) => {
    if (!csvText.trim()) return [];
    
    const lines = csvText.split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const parts = parseCSVLine(line);
      
      return {
        id: index,
        question: parts[0] || '',
        option1: parts[1] || '',
        option2: parts[2] || '',
        option3: parts[3] || '',
        option4: parts[4] || '',
        correctIndex: parts[5] || '',
        mu: parts[6] || '',
        sigma: parts[7] || '',
        isValid: parts.length >= 8
      };
    });
  };

  const csvPreviewData = parseCSVPreview(multiAddData.questions);

  const handleMultiAdd = async () => {
    try {
      // Parse the questions text into the required format
      const questionsText = multiAddData.questions.trim();
      const lines = questionsText.split('\n').filter(line => line.trim());
      
      const parsedQuestions = lines.map(line => {
        const parts = parseCSVLine(line);
        if (parts.length < 8) {
          throw new Error(`Invalid format. Each line should have: /question/,option1,option2,option3,option4,correctIndex,mu,sigma`);
        }
        
        const [question, option1, option2, option3, option4, correctIndex, mu, sigma] = parts;
        
        // Remove quotes from options before sending to backend
        const cleanOption1 = option1.replace(/^"|"$/g, '');
        const cleanOption2 = option2.replace(/^"|"$/g, '');
        const cleanOption3 = option3.replace(/^"|"$/g, '');
        const cleanOption4 = option4.replace(/^"|"$/g, '');
        
        return [question, cleanOption1, cleanOption2, cleanOption3, cleanOption4, parseInt(correctIndex), parseFloat(mu), parseFloat(sigma)];
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
        xpCorrect: 2,
        xpIncorrect: 0
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
        {selectedRows.length > 0 && (
          <Button
            variant="contained"
            color="error"
            onClick={handleMultiDelete}
            disabled={selectedRows.length === 0}
          >
            Delete Selected ({selectedRows.length})
          </Button>
        )}
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
          checkboxSelection
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
          onRowSelectionModelChange={(newSelectionModel) => {
            console.log('Selected rows changed:', newSelectionModel.ids);
            setSelectedRows([...newSelectionModel.ids]);
          }}
          selectionModel={selectedRows}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
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
            Format: /question/,option1,option2,option3,option4,correctIndex,mu,sigma (one per line)
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
                placeholder="Format: /question/,option1,option2,option3,option4,correctIndex,mu,sigma"
              />
            </Grid>

            {/* CSV Preview Table */}
            {csvPreviewData.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Preview ({csvPreviewData.length} questions)
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Question</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Option 1</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Option 2</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Option 3</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Option 4</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Correct</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Mu</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Sigma</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {csvPreviewData.map((row) => (
                        <TableRow 
                          key={row.id}
                          sx={{ 
                            backgroundColor: row.isValid ? 'inherit' : '#ffebee',
                            '&:hover': { backgroundColor: row.isValid ? '#f5f5f5' : '#ffcdd2' }
                          }}
                        >
                          <TableCell>{row.id + 1}</TableCell>
                          <TableCell sx={{ maxWidth: 200, wordBreak: 'break-word' }}>
                            {row.question}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 100, wordBreak: 'break-word' }}>
                            {row.option1}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 100, wordBreak: 'break-word' }}>
                            {row.option2}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 100, wordBreak: 'break-word' }}>
                            {row.option3}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 100, wordBreak: 'break-word' }}>
                            {row.option4}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={row.correctIndex} 
                              size="small" 
                              color={row.correctIndex >= 0 && row.correctIndex <= 3 ? "success" : "error"}
                            />
                          </TableCell>
                          <TableCell>{row.mu}</TableCell>
                          <TableCell>{row.sigma}</TableCell>
                          <TableCell>
                            <Chip 
                              label={row.isValid ? "Valid" : "Invalid"} 
                              size="small" 
                              color={row.isValid ? "success" : "error"}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {csvPreviewData.some(row => !row.isValid) && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Some rows have invalid format. Each row should have: /question/,option1,option2,option3,option4,correctIndex,mu,sigma
                  </Alert>
                )}
              </Grid>
            )}

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
