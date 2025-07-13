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
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { Switch, FormControlLabel } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
// @ts-ignore
import { useGetChapterTopicsPerformanceQuery, useGetTopicSetDailyAccuracyQuery, useGetTopicSetSessionAccuracyQuery } from '../features/api/performanceAPI';
import { skipToken } from '@reduxjs/toolkit/query';

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
  totalDatesPracticed?: number;
}



interface PerformanceProps {
  chapterId: string;
  onClose?: () => void;
}

const Performance: React.FC<PerformanceProps> = ({ chapterId, onClose }) => {
  const [selectedTopicSet, setSelectedTopicSet] = useState<string[] | null>(null);
  const [selectedTopicSetNames, setSelectedTopicSetNames] = useState<string[] | null>(null);
  const [isSessionView, setIsSessionView] = useState(false);

  const { data: performanceResponse, isLoading, error, refetch } = useGetChapterTopicsPerformanceQuery(chapterId, {
    skip: !chapterId,
    refetchOnMountOrArgChange: true
  });

  const performanceData = performanceResponse?.data || [];
  // meta is only used for display, not destructured if not needed

  // Fetch day-wise accuracy for selected topic set
  const {
    data: topicSetDailyAccuracyData,
    isLoading: isTopicSetDailyAccuracyLoading,
    error: topicSetDailyAccuracyError
  } = useGetTopicSetDailyAccuracyQuery(
    selectedTopicSet && chapterId && !isSessionView ? { chapterId, topicIds: selectedTopicSet } : skipToken,
    { skip: !selectedTopicSet || !chapterId || isSessionView }
  );

  // Fetch session-wise accuracy for selected topic set
  const {
    data: topicSetSessionAccuracyData,
    isLoading: isTopicSetSessionAccuracyLoading,
    error: topicSetSessionAccuracyError
  } = useGetTopicSetSessionAccuracyQuery(
    selectedTopicSet && chapterId && isSessionView ? { chapterId, topicIds: selectedTopicSet } : skipToken,
    { skip: !selectedTopicSet || !chapterId || !isSessionView }
  );

  // Refetch data when component mounts
  useEffect(() => {
    if (chapterId) {
      refetch();
    }
  }, [chapterId, refetch]);

  // Handler for row click
  const handleRowClick = (topicSet: { topicId: string; topicName: string }[]) => {
    setSelectedTopicSet(topicSet.map(t => t.topicId));
    setSelectedTopicSetNames(topicSet.map(t => t.topicName));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (milliseconds: string | number) => {
    const totalMs = parseFloat(milliseconds.toString());
    if (isNaN(totalMs) || totalMs === 0) return '0ms';
    
    const totalSeconds = totalMs / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    const wholeSeconds = Math.floor(remainingSeconds);
    const remainingMs = Math.round((remainingSeconds - wholeSeconds) * 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${wholeSeconds}.${remainingMs.toString().padStart(3, '0')}s`;
    } else if (wholeSeconds > 0) {
      return `${wholeSeconds}.${remainingMs.toString().padStart(3, '0')}s`;
    } else {
      return `${totalMs.toFixed(0)}ms`;
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


  return (
    <Card sx={{ backgroundColor: '#23272b', color: 'white' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Performance Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onClose && (
              <IconButton onClick={onClose}>
                <ArrowBackIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {performanceResponse?.meta && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {performanceResponse.meta.chapterName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label={`${performanceResponse.meta.totalDays} days`} size="small" />
              <Chip label={`${performanceResponse.meta.totalSessions} sessions`} size="small" />
              <Chip label={`${performanceResponse.meta.totalQuestions} questions`} size="small" />
              {performanceResponse.meta.startDate && performanceResponse.meta.endDate && (
                <Chip label={`${formatDate(performanceResponse.meta.startDate)} - ${formatDate(performanceResponse.meta.endDate)}`} size="small" />
              )}
            </Box>
          </Box>
        )}

        <TableContainer component={Paper} sx={{ backgroundColor: '#23272b' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Topics</TableCell>
                <TableCell align="center">Sessions</TableCell>
                <TableCell align="center">Days Practiced</TableCell>
                <TableCell align="center">Questions</TableCell>
                <TableCell align="center">Correct</TableCell>
                <TableCell align="center">Accuracy</TableCell>
                <TableCell align="center">Avg Time/Question (s)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performanceData.map((row: PerformanceData, index: number) => (
                <TableRow
                  key={index}
                  hover
                  sx={{
                    backgroundColor: index % 2 === 0 ? 'grey.900' : 'grey.800',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleRowClick(row.topics)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {row.topics.map((topic: { topicId: string; topicName: string }, topicIndex: number) => (
                        <Chip
                          key={topicIndex}
                          label={topic.topicName}
                          size="small"
                          variant="filled"
                          sx={{
                            backgroundColor: '#1976d2',
                            color: 'white',
                            fontWeight: 500,
                            cursor: 'pointer',
                            ':hover': { backgroundColor: '#1565c0' }
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="center">{row.totalSessions}</TableCell>
                  <TableCell align="center">{row.totalDatesPracticed}</TableCell>
                  <TableCell align="center">{row.totalQuestionsAnswered}</TableCell>
                  <TableCell align="center">{row.correctAnswers}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${row.accuracy}%`}
                      size="small"
                      color={parseFloat(row.accuracy) >= 80 ? 'success' : parseFloat(row.accuracy) >= 60 ? 'warning' : 'error'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">{formatTime(row.averageTimePerQuestion)}</TableCell>
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
      {selectedTopicSet && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#1a1d20', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              {isSessionView ? 'Session-wise' : 'Day-wise'} Accuracy Trend for <b>{selectedTopicSetNames?.join(', ')}</b>
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={isSessionView}
                  onChange={(e) => setIsSessionView(e.target.checked)}
                  color="primary"
                />
              }
              label="Session View"
              sx={{ color: 'white' }}
            />
          </Box>
          
          {(isTopicSetDailyAccuracyLoading || isTopicSetSessionAccuracyLoading) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress />
            </Box>
          )}
          
          {(topicSetDailyAccuracyError || topicSetSessionAccuracyError) && (
            <Alert severity="error">Error loading accuracy data.</Alert>
          )}
          
          {(() => {
            const currentData = isSessionView ? topicSetSessionAccuracyData : topicSetDailyAccuracyData;
            const isLoading = isSessionView ? isTopicSetSessionAccuracyLoading : isTopicSetDailyAccuracyLoading;
            
            if (currentData && currentData.data && currentData.data.length > 0) {
              return (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={currentData.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={isSessionView ? "sessionNumber" : "date"} 
                      tick={{ fill: '#fff' }}
                      label={{ value: isSessionView ? 'Session #' : 'Date', position: 'insideBottom', offset: -5, fill: '#fff' }}
                    />
                    <YAxis domain={[0, 100]} tick={{ fill: '#fff' }} label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: '#fff' }} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Accuracy']}
                      labelFormatter={(label) => {
                        if (isSessionView) {
                          // For session view, show session number and timestamp if available
                          const dataPoint = currentData.data.find((d: any) => d.sessionNumber === label);
                          if (dataPoint && dataPoint.timestamp) {
                            const date = new Date(dataPoint.timestamp).toLocaleDateString();
                            const time = new Date(dataPoint.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            });
                            return `Session ${label} - ${date} ${time}`;
                          }
                          return `Session ${label}`;
                        }
                        return `Date: ${label}`;
                      }}
                      contentStyle={{
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #555',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '12px',
                        padding: '8px 12px',
                        maxWidth: '250px',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal'
                      }}
                      labelStyle={{
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: '4px'
                      }}
                    />
                    <Line type="monotone" dataKey="accuracy" stroke="#1976d2" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              );
            }
            
            if (currentData && currentData.data && currentData.data.length === 0 && !isLoading) {
              return (
                <Typography color="text.secondary">
                  No {isSessionView ? 'session' : 'daily'} accuracy data available for this topic set.
                </Typography>
              );
            }
            
            return null;
          })()}
        </Box>
      )}
    </Card>
  );
};

export default Performance;