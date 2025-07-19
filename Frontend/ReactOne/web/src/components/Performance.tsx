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
import { useGetChapterTopicsPerformanceQuery, useGetTopicSetDailyAccuracyQuery, useGetTopicSetSessionAccuracyQuery, useGetUnitTopicsPerformanceQuery } from '../features/api/performanceAPI';
import { skipToken } from '@reduxjs/toolkit/query';
// @ts-ignore
import { colors, themeColors } from '../theme/colors';

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

interface TopicSetBucket {
  topicNames: string[];
  accuracy: number;
}

interface PerformanceProps {
  chapterId?: string;
  unitId?: string;
  mode?: 'chapter' | 'unit';
  onClose?: () => void;
}

const Performance: React.FC<PerformanceProps> = ({ chapterId, unitId, mode = 'chapter', onClose }) => {
  const [selectedTopicSet, setSelectedTopicSet] = useState<string[] | null>(null);
  const [selectedTopicSetNames, setSelectedTopicSetNames] = useState<string[] | null>(null);
  const [isSessionView, setIsSessionView] = useState(false);

  // Choose the correct query based on mode
  const {
    data: performanceResponse,
    isLoading,
    error,
    refetch
  } = mode === 'unit'
    ? useGetUnitTopicsPerformanceQuery(unitId, { skip: !unitId })
    : useGetChapterTopicsPerformanceQuery(chapterId, { skip: !chapterId });

  const performanceData = performanceResponse?.data || [];
  // meta is only used for display, not destructured if not needed
  // For unit mode, get chapterId from meta
  const effectiveChapterId = mode === 'unit'
    ? performanceResponse?.meta?.chapterId
    : chapterId;

  // Fetch day-wise accuracy for selected topic set
  const {
    data: topicSetDailyAccuracyData,
    isLoading: isTopicSetDailyAccuracyLoading,
    error: topicSetDailyAccuracyError
  } = useGetTopicSetDailyAccuracyQuery(
    selectedTopicSet && effectiveChapterId && !isSessionView ? { chapterId: effectiveChapterId, topicIds: selectedTopicSet } : skipToken,
    { skip: !selectedTopicSet || !effectiveChapterId || isSessionView }
  );

  // Fetch session-wise accuracy for selected topic set
  const {
    data: topicSetSessionAccuracyData,
    isLoading: isTopicSetSessionAccuracyLoading,
    error: topicSetSessionAccuracyError
  } = useGetTopicSetSessionAccuracyQuery(
    selectedTopicSet && effectiveChapterId && isSessionView ? { chapterId: effectiveChapterId, topicIds: selectedTopicSet } : skipToken,
    { skip: !selectedTopicSet || !effectiveChapterId || !isSessionView }
  );

  // Refetch data when component mounts
  useEffect(() => {
    if ((mode === 'unit' && unitId) || (mode === 'chapter' && chapterId)) {
      refetch();
    }
  }, [chapterId, unitId, mode, refetch]);

  const handleRowClick = (topics: Array<{ topicId: string; topicName: string }>) => {
    const topicIds = topics.map(t => t.topicId);
    const topicNames = topics.map(t => t.topicName);
    setSelectedTopicSet(topicIds);
    setSelectedTopicSetNames(topicNames);
  };

  const formatTime = (timeString: string) => {
    const timeInMs = parseInt(timeString);
    const seconds = Math.floor(timeInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Group performance data into buckets
  const strongSets: TopicSetBucket[] = [];
  const improvingSets: TopicSetBucket[] = [];
  const weakSets: TopicSetBucket[] = [];

  performanceData.forEach((row: PerformanceData) => {
    const accuracy = parseFloat(row.accuracy);
    const topicNames = row.topics.map(t => t.topicName);
    if (accuracy >= 80) {
      strongSets.push({ topicNames, accuracy });
    } else if (accuracy >= 60) {
      improvingSets.push({ topicNames, accuracy });
    } else {
      weakSets.push({ topicNames, accuracy });
    }
  });

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
    <Card sx={{ 
      backgroundColor: themeColors.card.background,
      color: themeColors.text.primary,
      border: themeColors.card.border,
      boxShadow: themeColors.card.shadow,
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="h2" sx={{ color: themeColors.text.primary }}>
            {mode === 'unit' ? 'Unit Analytics' : 'Performance Analytics'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onClose && (
              <IconButton onClick={onClose} sx={{ color: themeColors.text.secondary }}>
                <ArrowBackIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Topic Set Buckets */}
        <Box sx={{ display: 'flex', gap: 4, mb: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: colors.success.main }}>Strong Sets (≥ 80%)</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {strongSets.length > 0 ? strongSets.map((set, idx) => (
                <Chip
                  key={idx}
                  label={`${set.topicNames.join(', ')} (${set.accuracy}%)`}
                  color="success"
                  size="small"
                  sx={{ mb: 0.5 }}
                />
              )) : <Typography variant="body2" color="text.secondary">None</Typography>}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: colors.warning.main }}>Improving Sets (60–79%)</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {improvingSets.length > 0 ? improvingSets.map((set, idx) => (
                <Chip
                  key={idx}
                  label={`${set.topicNames.join(', ')} (${set.accuracy}%)`}
                  color="warning"
                  size="small"
                  sx={{ mb: 0.5 }}
                />
              )) : <Typography variant="body2" color="text.secondary">None</Typography>}
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: colors.error.main }}>Weak Sets (&lt; 60%)</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {weakSets.length > 0 ? weakSets.map((set, idx) => (
                <Chip
                  key={idx}
                  label={`${set.topicNames.join(', ')} (${set.accuracy}%)`}
                  color="error"
                  size="small"
                  sx={{ mb: 0.5 }}
                />
              )) : <Typography variant="body2" color="text.secondary">None</Typography>}
            </Box>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ 
          backgroundColor: themeColors.card.background,
          border: themeColors.card.border,
        }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: themeColors.ui.hover }}>
                <TableCell sx={{ color: themeColors.text.primary, fontWeight: 600 }}>Topics</TableCell>
                <TableCell align="center" sx={{ color: themeColors.text.primary, fontWeight: 600 }}>Sessions</TableCell>
                <TableCell align="center" sx={{ color: themeColors.text.primary, fontWeight: 600 }}>Days Practiced</TableCell>
                <TableCell align="center" sx={{ color: themeColors.text.primary, fontWeight: 600 }}>Questions</TableCell>
                <TableCell align="center" sx={{ color: themeColors.text.primary, fontWeight: 600 }}>Correct</TableCell>
                <TableCell align="center" sx={{ color: themeColors.text.primary, fontWeight: 600 }}>Accuracy</TableCell>
                <TableCell align="center" sx={{ color: themeColors.text.primary, fontWeight: 600 }}>Avg Time/Question (s)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performanceData.map((row: PerformanceData, index: number) => (
                <TableRow
                  key={index}
                  hover
                  sx={{
                    backgroundColor: index % 2 === 0 ? themeColors.overlay.low : 'transparent',
                    color: themeColors.text.primary,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: themeColors.ui.hover,
                    }
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
                            backgroundColor: themeColors.ui.topicPrimary,
                            color: 'white',
                            fontWeight: 500,
                            cursor: 'pointer',
                            '&:hover': { 
                              backgroundColor: themeColors.ui.topicSecondary,
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ color: themeColors.text.primary }}>{row.totalSessions}</TableCell>
                  <TableCell align="center" sx={{ color: themeColors.text.primary }}>{row.totalDatesPracticed}</TableCell>
                  <TableCell align="center" sx={{ color: themeColors.text.primary }}>{row.totalQuestionsAnswered}</TableCell>
                  <TableCell align="center" sx={{ color: themeColors.text.primary }}>{row.correctAnswers}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${row.accuracy}%`}
                      size="small"
                      color={parseFloat(row.accuracy) >= 80 ? 'success' : parseFloat(row.accuracy) >= 60 ? 'warning' : 'error'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ color: themeColors.text.primary }}>{formatTime(row.averageTimePerQuestion)}</TableCell>
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
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          backgroundColor: themeColors.overlay.low, 
          borderRadius: 2,
          border: themeColors.card.border,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: themeColors.text.primary }}>
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
              sx={{ color: themeColors.text.primary }}
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
            
            if (!currentData || !currentData.data || currentData.data.length === 0) {
              return (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No accuracy data available for the selected topic set.
                  </Typography>
                </Box>
              );
            }

            return (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentData.data}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke={themeColors.text.disabled}
                  />
                  <XAxis 
                    dataKey={isSessionView ? "sessionNumber" : "date"} 
                    stroke={themeColors.text.secondary}
                    tick={{ fill: themeColors.text.secondary }}
                  />
                  <YAxis 
                    stroke={themeColors.text.secondary}
                    tick={{ fill: themeColors.text.secondary }}
                  />
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
                      backgroundColor: themeColors.card.background,
                      border: themeColors.card.border,
                      borderRadius: '8px',
                      color: themeColors.text.primary,
                      fontSize: '12px',
                      padding: '8px 12px',
                      maxWidth: '250px',
                      wordWrap: 'break-word',
                      whiteSpace: 'normal',
                      boxShadow: themeColors.card.shadow,
                    }}
                    labelStyle={{
                      color: themeColors.text.primary,
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginBottom: '4px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke={themeColors.ui.topicPrimary} 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: themeColors.ui.topicPrimary }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            );
          })()}
        </Box>
      )}
    </Card>
  );
};

export default Performance;