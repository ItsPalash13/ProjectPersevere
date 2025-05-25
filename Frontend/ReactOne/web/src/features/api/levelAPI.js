import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const levelApi = createApi({
  reducerPath: 'levelApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_BACKEND_URL,
    credentials: 'include'
  }),
  endpoints: (builder) => ({
    getLevels: builder.query({
      query: (chapterId) => `/api/levels/${chapterId}`,
    }),
    startLevel: builder.mutation({
      query: (levelId) => ({
        url: '/api/levels/start',
        method: 'POST',
        body: { levelId },
      }),
    }),
  }),
});

export const { 
  useGetLevelsQuery,
  useStartLevelMutation
} = levelApi; 