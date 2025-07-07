import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
// @ts-ignore
import { useGetChapterTopicsPerformanceQuery } from '../features/api/performanceAPI';

interface PerformanceData {
  topicSetId: string;
  totalSessions: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  accuracy: string;
  averageTimePerQuestion: string;
  topics: Array<{
    topicId: string;
    topicName: string;
  }>;
}

interface PerformanceMeta {
  startDate: string | null;
  endDate: string | null;
  totalRecords: number;
  chapterId: string;
  chapterName: string;
  totalDays: number;
  totalSessions: number;
  totalQuestions: number;
}

interface PerformanceResponse {
  data: PerformanceData[];
  meta: PerformanceMeta;
}

interface PerformanceProps {
  chapterId: string;
  onClose?: () => void;
}

const Performance: React.FC<PerformanceProps> = ({ chapterId, onClose }) => {
  const [showGraph, setShowGraph] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'accuracy' | 'questions' | 'time'>('accuracy');

  const { data: performanceResponse, isLoading, error, refetch } = useGetChapterTopicsPerformanceQuery(chapterId, {
    skip: !chapterId,
    refetchOnMountOrArgChange: true
  });

  const performanceData = performanceResponse?.data || [];
  const meta = performanceResponse?.meta || null;

  // Refetch data when component mounts
  useEffect(() => {
    if (chapterId) {
      refetch();
    }
  }, [chapterId, refetch]);

  const handleShowGraph = (metric: 'accuracy' | 'questions' | 'time') => {
    setSelectedMetric(metric);
    setShowGraph(true);
  };

  const handleBackToTable = () => {
    setShowGraph(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getGraphData = () => {
    return performanceData.map((item: PerformanceData, index: number) => ({
      topicSet: `Topic Set ${index + 1}`,
      accuracy: parseFloat(item.accuracy),
      questions: item.totalQuestionsAnswered,
      time: parseFloat(item.averageTimePerQuestion),
      sessions: item.totalSessions,
      correct: item.correctAnswers
    }));
  };

  const getGraphTitle = () => {
    switch (selectedMetric) {
      case 'accuracy':
        return 'Accuracy Over Time';
      case 'questions':
        return 'Questions Answered Over Time';
      case 'time':
        return 'Average Time Spent Over Time';
      default:
        return 'Performance Metrics';
    }
  };

  const getGraphColor = () => {
    switch (selectedMetric) {
      case 'accuracy':
        return '#2196f3';
      case 'questions':
        return '#4caf50';
      case 'time':
        return '#ff9800';
      default:
        return '#2196f3';
    }
  };

  const getYAxisLabel = () => {
    switch (selectedMetric) {
      case 'accuracy':
        return 'Accuracy (%)';
      case 'questions':
        return 'Questions';
      case 'time':
        return 'Time (seconds)';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error instanceof Error ? error.message : 'An error occurred while fetching performance data'}
      </Alert>
    );
  }

  if (showGraph) {
    return (
      <Card sx={{ height: '600px', position: 'relative' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <IconButton onClick={handleBackToTable} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">{getGraphTitle()}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant={selectedMetric === 'accuracy' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setSelectedMetric('accuracy')}
            >
              Accuracy
            </Button>
            <Button
              variant={selectedMetric === 'questions' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setSelectedMetric('questions')}
            >
              Questions
            </Button>
            <Button
              variant={selectedMetric === 'time' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setSelectedMetric('time')}
            >
              Time
            </Button>
          </Box>

          <ResponsiveContainer width="100%" height="500px">
            <BarChart data={getGraphData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topicSet" />
              <YAxis label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar
                dataKey={selectedMetric}
                fill={getGraphColor()}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Performance Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<BarChartIcon />}
              onClick={() => handleShowGraph('accuracy')}
            >
              View Graphs
            </Button>
            {onClose && (
              <IconButton onClick={onClose}>
                <ArrowBackIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {meta && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {meta.chapterName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label={`${meta.totalDays} days`} size="small" />
              <Chip label={`${meta.totalSessions} sessions`} size="small" />
              <Chip label={`${meta.totalQuestions} questions`} size="small" />
              {meta.startDate && meta.endDate && (
                <Chip label={`${formatDate(meta.startDate)} - ${formatDate(meta.endDate)}`} size="small" />
              )}
            </Box>
          </Box>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Topic Set</TableCell>
                <TableCell align="center">Sessions</TableCell>
                <TableCell align="center">Questions</TableCell>
                <TableCell align="center">Correct</TableCell>
                <TableCell align="center">Accuracy</TableCell>
                <TableCell align="center">Avg Time/Question (s)</TableCell>
                <TableCell>Topics</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performanceData.map((row: PerformanceData, index: number) => (
                <TableRow key={index} hover>
                  <TableCell>Topic Set {index + 1}</TableCell>
                  <TableCell align="center">{row.totalSessions}</TableCell>
                  <TableCell align="center">{row.totalQuestionsAnswered}</TableCell>
                  <TableCell align="center">{row.correctAnswers}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${row.accuracy}%`}
                      size="small"
                      color={parseFloat(row.accuracy) >= 80 ? 'success' : parseFloat(row.accuracy) >= 60 ? 'warning' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="center">{row.averageTimePerQuestion}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {row.topics.map((topic: { topicId: string; topicName: string }, topicIndex: number) => (
                        <Chip
                          key={topicIndex}
                          label={topic.topicName}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {performanceData.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No performance data available for this chapter.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default Performance; 