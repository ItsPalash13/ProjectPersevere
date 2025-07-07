import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const performanceApi = createApi({
  reducerPath: 'performanceApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_BACKEND_URL,
    credentials: 'include'
  }),  
  tagTypes: ['Performance'],
  endpoints: (builder) => ({
    getChapterTopicsPerformance: builder.query({
      query: (chapterId) => ({
        url: `/api/performance/chapter-topics/${chapterId}`,
        method: 'GET',
      }),
      providesTags: ['Performance'],
    }),
  }),
});

export const {
  useGetChapterTopicsPerformanceQuery,
} = performanceApi; 