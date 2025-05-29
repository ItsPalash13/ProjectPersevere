import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  ThemeProvider,
  createTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { ProgressBar } from "react-progressbar-fancy";

const quizTheme = createTheme({
  palette: {
    primary: {
      main: '#424242',
      light: '#616161',
      dark: '#212121',
    },
    secondary: {
      main: '#757575',
      light: '#9e9e9e',
      dark: '#616161',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    error: {
      main: '#c62828',
      light: '#ef5350',
      dark: '#b71c1c',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    h5: {
      fontWeight: 600,
      color: '#212121',
    },
    body1: {
      fontSize: '1.1rem',
      fontWeight: 500,
      color: '#424242',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.1)',
    '0px 4px 8px rgba(0,0,0,0.1)',
    '0px 8px 16px rgba(0,0,0,0.1)',
    '0px 16px 24px rgba(0,0,0,0.1)',
    '0px 24px 32px rgba(0,0,0,0.1)',
    '0px 32px 40px rgba(0,0,0,0.1)',
    '0px 40px 48px rgba(0,0,0,0.1)',
    '0px 48px 56px rgba(0,0,0,0.1)',
    '0px 56px 64px rgba(0,0,0,0.1)',
    '0px 64px 72px rgba(0,0,0,0.1)',
    '0px 72px 80px rgba(0,0,0,0.1)',
    '0px 80px 88px rgba(0,0,0,0.1)',
    '0px 88px 96px rgba(0,0,0,0.1)',
    '0px 96px 104px rgba(0,0,0,0.1)',
    '0px 104px 112px rgba(0,0,0,0.1)',
    '0px 112px 120px rgba(0,0,0,0.1)',
    '0px 120px 128px rgba(0,0,0,0.1)',
    '0px 128px 136px rgba(0,0,0,0.1)',
    '0px 136px 144px rgba(0,0,0,0.1)',
    '0px 144px 152px rgba(0,0,0,0.1)',
    '0px 152px 160px rgba(0,0,0,0.1)',
    '0px 160px 168px rgba(0,0,0,0.1)',
    '0px 168px 176px rgba(0,0,0,0.1)',
    '0px 176px 184px rgba(0,0,0,0.1)',
  ],
});

const QuizContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  backgroundImage: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
}));

const TopicChip = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.common.white,
  padding: theme.spacing(0.5, 2),
  borderRadius: theme.shape.borderRadius * 2,
  fontSize: '0.9rem',
  fontWeight: 600,
  textTransform: 'capitalize',
  display: 'inline-block',
  marginBottom: theme.spacing(2),
}));

const QuestionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  backgroundColor: theme.palette.background.paper,
  border: '1px solid rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[3],
  },
}));

const OptionCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.background.paper,
  height: '250px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  '&.selected': {
    border: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '& .MuiTypography-root': {
      color: 'white',
    }
  },
  '&.correct': {
    border: `2px solid ${theme.palette.success.main}`,
    backgroundColor: theme.palette.success.main,
    color: 'white',
    transform: 'scale(1.02)',
    '& .MuiTypography-root': {
      color: 'white',
    }
  },
  '&.wrong': {
    border: `2px solid ${theme.palette.error.main}`,
    backgroundColor: theme.palette.error.main,
    color: 'white',
    transform: 'scale(1.02)',
    '& .MuiTypography-root': {
      color: 'white',
    }
  },
  '&.correct-answer': {
    border: `2px solid ${theme.palette.success.main}`,
    backgroundColor: theme.palette.success.main,
    color: 'white',
    animation: 'pulse 1s infinite',
    '& .MuiTypography-root': {
      color: 'white',
    }
  }
}));

const QuizHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1.5, 4),
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const SecretDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 240,
    backgroundColor: theme.palette.background.paper,
    borderLeft: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[4],
  },
}));

const SecretButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  right: 16,
  top: '10%',
  transform: 'translateY(-50%)',
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
}));

const SkillProgressBar = styled(Box)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const ProgressLabel = styled(Typography)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const escapeForLaTeX = (text) => {
  const escapeMap = {
    '\\': '\\textbackslash{}',
    '{': '\\{',
    '}': '\\}',
    '#': '\\#',
    '$': '\\$',
    '%': '\\%',
    '&': '\\&',
    '_': '\\_',
    '^': '\\textasciicircum{}',
    '~': '\\textasciitilde{}'
  };

  const escapeText = str =>
    str.replace(/([\\{}#$%&_^\~])/g, match => escapeMap[match] || match);

  const parts = [];
  let regex = /(\$\$.*?\$\$|\$.*?\$)/gs;
  let lastIndex = 0;

  for (const match of text.matchAll(regex)) {
    const [full] = match;
    const index = match.index;

    if (index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, index) });
    }
    parts.push({
      type: full.startsWith('$$') ? 'block-math' : 'inline-math',
      value: full
    });

    lastIndex = index + full.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts
    .map(part => {
      if (part.type === 'text') {
        return `\\text{${escapeText(part.value)}}`;
      } else {
        return part.value;
      }
    })
    .join(' ');
};

const renderLatexText = (text) => {
  const latex = escapeForLaTeX(text);
  const encoded = encodeURIComponent(latex);
  return `https://latex.codecogs.com/gif.image?${encoded}`;
};

const Quiz = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const isFirstRender = useRef(true);
  const [showSecret, setShowSecret] = useState(false);
  const [userRating, setUserRating] = useState({ mu: 500, sigma: 0 });
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchQuestion();
    }
  }, []);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/quiz/question', {
        withCredentials: true
      });
      setQuestion(response.data.question);
      setUserRating(response.data.studentSkill);
      setError(null);
      setAnswered(false);
      setIsCorrect(null);
      setSelectedOption(null);
      setShowProgress(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch question');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionIndex) => {
    if (answered) return;
    setSelectedOption(optionIndex);
  };

  const calculateProgress = (mu) => {
    const { lowerBound, upperBound } = getProgressRange(mu);
    
    // Calculate progress percentage (0-100) within the current range
    if (mu < lowerBound) return 0;
    if (mu > upperBound) return 100;
    
    // Calculate progress within the current 500-point range
    return ((mu - lowerBound) / 500) * 100;
  };

  const getProgressColor = (mu) => {
    if (mu < 1000) return 'red'; 
    if (mu <= 1500) return 'purple'; 
    if (mu < 2000) return 'blue';
    if (mu < 2500) return 'green';
    return 'gold'; 
  };

  const getProgressRange = (mu) => {
    // Find the range that contains the current rating
    const lowerBound = Math.floor(mu / 500) * 500;
    const upperBound = lowerBound + 500;
    return { lowerBound, upperBound };
  };

  const handleSubmit = async () => {
    if (selectedOption === null || answered) return;

    try {
      setSubmitting(true);
      const response = await axios.post('http://localhost:3000/api/quiz/answer', {
        questionId: question.id,
        userAnswer: selectedOption
      }, {
        withCredentials: true
      });

      setAnswered(true);
      setIsCorrect(response.data.isCorrect);
      setUserRating(response.data.userNewRating);
      setTimeout(() => {
        setShowProgress(true);
      }, 500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    navigate('/dashboard');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const getOptionClass = (index) => {
    if (!answered) return selectedOption === index ? 'selected' : '';
    
    if (index === question.correct) {
      return 'correct-answer';
    }
    
    if (index === selectedOption) {
      return isCorrect ? 'correct' : 'wrong';
    }
    
    return '';
  };

  const formatTopic = (topic) => {
    return topic.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <ThemeProvider theme={quizTheme}>
        <QuizContainer>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress />
          </Box>
        </QuizContainer>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={quizTheme}>
        <QuizContainer>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Typography color="error">{error}</Typography>
            <Button variant="contained" onClick={handleBack}>Go Back</Button>
          </Box>
        </QuizContainer>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={quizTheme}>
      <QuizContainer>
        <QuizHeader>
          <IconButton 
            onClick={handleBack} 
            size="large"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,1)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </QuizHeader>

        {showProgress && (
          <SkillProgressBar>
            <Box sx={{ mb: 2 }}>
              <ProgressBar
                className="space"
                label={`Skill Progress (${Math.round(calculateProgress(userRating.mu))}%)`}
                progressColor={getProgressColor(userRating.mu)}
                darkTheme
                score={calculateProgress(userRating.mu)}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                {getProgressRange(userRating.mu).lowerBound}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getProgressRange(userRating.mu).upperBound}
              </Typography>
            </Box>
          </SkillProgressBar>
        )}

        {question && (
          <>
            <QuestionCard>
              <CardContent>
                <TopicChip>
                  {formatTopic(question.topic)}
                </TopicChip>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {question.text}
                  </Typography>
                </Box>
              </CardContent>
            </QuestionCard>

            <Grid container spacing={2}>
              {question.options.map((option, index) => (
                <Grid size={{md: 3, xs: 12}} key={index}>
                  <OptionCard
                    className={getOptionClass(index)}
                    onClick={() => handleOptionSelect(index)}>
                    <CardContent>
                      <Typography variant="body1" sx={{marginRight: '8px'}}>
                        {option}
                      </Typography>
                    </CardContent>
                  </OptionCard>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              {!answered ? (
                <StyledButton
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={selectedOption === null || submitting}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {submitting ? 'Submitting...' : 'Submit Answer'}
                </StyledButton>
              ) : (
                <StyledButton
                  variant="contained"
                  size="large"
                  onClick={fetchQuestion}
                >
                  Next Question
                </StyledButton>
              )}
            </Box>
          </>
        )}

        <SecretButton
          onClick={() => setShowSecret(!showSecret)}
          size="large"
        >
          {showSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </SecretButton>

        <SecretDrawer
          anchor="right"
          open={showSecret}
          onClose={() => setShowSecret(false)}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Answer Key
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemText
                  primary="Correct Answer"
                  secondary={question?.options[question?.correct]}
                  primaryTypographyProps={{
                    color: 'primary',
                    fontWeight: 'bold'
                  }}
                  secondaryTypographyProps={{
                    color: 'success.main'
                  }}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Question Difficulty"
                  secondary={`μ: ${question?.difficulty?.mu.toFixed(2)}, σ: ${question?.difficulty?.sigma.toFixed(2)}`}
                />
              </ListItem>
            </List>
          </Box>
        </SecretDrawer>
      </QuizContainer>
    </ThemeProvider>
  );
};

export default Quiz;
