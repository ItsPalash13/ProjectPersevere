import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const performanceApi = createApi({
  reducerPath: 'performanceApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_BACKEND_URL,
    credentials: 'include'
  }),  
  tagTypes: ['Performance'],
  endpoints: (builder) => ({
    getTopicsAccuracyLatest: builder.query({
      query: ({ topicIds, chapterId }) => ({
        url: topicIds && topicIds.length
          ? `/api/performance/topics-accuracy-latest?topicIds=${topicIds.join(',')}`
          : `/api/performance/topics-accuracy-latest?chapterId=${chapterId}`,
        method: 'GET',
      }),
      providesTags: ['Performance'],
    }),
    getTopicsAccuracyHistory: builder.query({
      query: ({ topicIds, chapterId, startDate, endDate }) => ({
        url: topicIds && topicIds.length
          ? `/api/performance/topics-accuracy-history?topicIds=${topicIds.join(',')}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`
          : `/api/performance/topics-accuracy-history?chapterId=${chapterId}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`,
        method: 'GET',
      }),
      providesTags: ['Performance'],
    }),
  }),
});

export const {
  useGetTopicsAccuracyLatestQuery,
  useGetTopicsAccuracyHistoryQuery,
} = performanceApi; 