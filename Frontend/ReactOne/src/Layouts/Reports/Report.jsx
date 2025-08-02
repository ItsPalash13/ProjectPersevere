import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import { Box, Paper, Typography } from '@mui/material';

const Report = () => {
    const [userHistory, setUserHistory] = useState([]);
    const [questionHistory, setQuestionHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/report/history', { withCredentials: true });
                setUserHistory(response.data.userHistory);
                setQuestionHistory(response.data.questionHistory);
            } catch (error) {
                console.error('Error fetching history:', error);
            }
        };

        fetchHistory();
    }, []);

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString();
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    User Skill Rating History
                </Typography>
                <Box sx={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <LineChart
                            data={userHistory}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="timestamp" 
                                tickFormatter={formatDate}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis />
                            <Tooltip 
                                labelFormatter={formatDate}
                                formatter={(value, name) => [value.toFixed(2), name]}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="mu"
                                name="Skill Rating (μ)"
                                stroke="#2196f3"
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="sigma"
                                name="Uncertainty (σ)"
                                stroke="#f50057"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Question Difficulty History
                </Typography>
                <Box sx={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <LineChart
                            data={questionHistory}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="timestamp" 
                                tickFormatter={formatDate}
                                tick={{ fontSize: 12 }}
                            />
                            <YAxis />
                            <Tooltip 
                                labelFormatter={formatDate}
                                formatter={(value, name) => [value.toFixed(2), name]}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="mu"
                                name="Difficulty (μ)"
                                stroke="#4caf50"
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="sigma"
                                name="Uncertainty (σ)"
                                stroke="#ff9800"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>
        </Box>
    );
};

export default Report;
